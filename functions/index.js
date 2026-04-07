const {onRequest} = require('firebase-functions/v2/https');
const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Set global options for all functions
setGlobalOptions({
    region: 'us-central1',
    maxInstances: 10
});

// NVIDIA NIM Configuration
const NVIDIA_CONFIG = {
    apiKey: process.env.NVIDIA_NIM_API_KEY,
    endpoint: process.env.NVIDIA_NIM_ENDPOINT || 'https://integrate.api.nvidia.com/v1',
    model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct'
};

/**
 * vconIngest - Ingests vCon telemetry from UE5 agents via UVConEmitter
 * Triggered by HTTP POST from UE5 Blueprints
 * Handles MongoDB Atlas format with flexible key mapping
 * Accepts paths: /vconIngest or /vconIngest/action/insertOne
 */
exports.vconIngest = onRequest(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Log raw payload for debugging UVConEmitter format
        console.log('[vconIngest] Raw request path:', req.path);
        console.log('[vconIngest] Raw payload:', JSON.stringify(req.body, null, 2));

        let vconData = req.body;
        
        // Handle MongoDB Atlas payload format (wrapped in "document" field)
        // UVConEmitter sends: { "dataSource": "...", "database": "...", "collection": "...", "document": {...actual data...} }
        if (vconData.document && typeof vconData.document === 'object') {
            console.log('[vconIngest] Detected MongoDB Atlas format, unwrapping document field');
            vconData = vconData.document;
        }
        
        // Flexible key mapping for IETF vCon format and legacy field names
        // IETF vCon structure: { "vcon": "0.0.1", "created_at": "...", "parties": [{ "name": "...", "did": "..." }] }
        const normalizedData = {
            // Extract agent_did from nested parties array (IETF vCon format) or legacy fields
            agent_did: vconData.parties?.[0]?.did  // IETF vCon: parties[0].did
                || vconData.agent_did
                || vconData.agentDid
                || vconData.AgentDID
                || vconData['Source DID']
                || vconData.sourceDid
                || vconData.source_did
                || vconData.did
                || vconData.DID,
            
            // Extract timestamp from created_at (IETF vCon format) or legacy fields
            timestamp: vconData.created_at  // IETF vCon: created_at
                || vconData.timestamp
                || vconData.Timestamp
                || vconData.time
                || vconData.Time
                || vconData.createdAt
                || new Date().toISOString(), // Fallback to current time
            
            // Mock telemetry for Android UI (Phase 1 demo)
            battery: vconData.battery !== undefined ? vconData.battery : 100,  // Default 100%
            status: vconData.status || 'ACTIVE',  // Default ACTIVE
            
            // Preserve all other fields including vcon version, parties array, etc.
            ...vconData
        };

        // Override with normalized values
        normalizedData.agent_did = normalizedData.agent_did;
        normalizedData.timestamp = normalizedData.timestamp;

        console.log('[vconIngest] Normalized data:', {
            agent_did: normalizedData.agent_did,
            timestamp: normalizedData.timestamp,
            vcon_version: vconData.vcon,
            party_name: vconData.parties?.[0]?.name,
            otherFields: Object.keys(normalizedData).filter(k => k !== 'agent_did' && k !== 'timestamp')
        });
        
        // Validate required fields after normalization
        if (!normalizedData.agent_did) {
            console.error('[vconIngest] Missing agent_did after normalization');
            console.error('[vconIngest] Available keys:', Object.keys(vconData));
            console.error('[vconIngest] Parties array:', vconData.parties);
            return res.status(400).json({
                error: 'Missing required field: agent_did (or equivalent)',
                receivedKeys: Object.keys(vconData),
                partiesArray: vconData.parties,
                hint: 'Expected parties[0].did (IETF vCon) or one of: agent_did, agentDid, AgentDID, Source DID, sourceDid, source_did, did, DID'
            });
        }

        if (!normalizedData.timestamp) {
            console.warn('[vconIngest] Missing timestamp, using current time');
        }

        // Write to event_stream collection
        const docRef = await db.collection('event_stream').add({
            ...normalizedData,
            ingested_at: admin.firestore.FieldValue.serverTimestamp(),
            raw_payload: req.body // Store original for debugging
        });

        console.log('[vconIngest] ✅ Stored event:', docRef.id, 'for agent:', normalizedData.agent_did);

        // Return MongoDB Atlas compatible response format
        res.status(200).json({
            success: true,
            event_id: docRef.id,
            insertedId: docRef.id, // MongoDB Atlas compatibility
            message: 'vCon telemetry ingested successfully'
        });

    } catch (error) {
        console.error('[vconIngest] ❌ Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * nimRouter - Routes events to NVIDIA NIM for AI inference
 * Triggered by new documents in event_stream collection
 * Generates commands and writes to command_queue
 */
exports.nimRouter = onDocumentCreated('event_stream/{eventId}', async (event) => {
        try {
            const snap = event.data;
            if (!snap) {
                console.log('[nimRouter] No data in event');
                return null;
            }
            
            const eventData = snap.data();
            const agentDid = eventData.agent_did;
            const eventId = event.params.eventId;

            console.log('[nimRouter] Processing event:', eventId, 'for agent:', agentDid);

            // Check agent's control mode from metabolic_state collection
            const agentStateDoc = await db.collection('metabolic_state').doc(agentDid).get();
            const agentState = agentStateDoc.exists ? agentStateDoc.data() : {};
            const controlMode = agentState.control_mode || 'ai'; // Default to AI mode

            // Skip if agent is in player mode
            if (controlMode === 'player') {
                console.log('[nimRouter] Skipping NIM routing - agent in PLAYER mode:', agentDid);
                return null;
            }

            console.log('[nimRouter] Agent in AI mode, proceeding with NIM inference');

            // Validate NVIDIA API configuration
            if (!NVIDIA_CONFIG.apiKey) {
                console.error('[nimRouter] NVIDIA_NIM_API_KEY not configured');
                return null;
            }

            // Build context from event data
            const agentContext = buildAgentContext(eventData);

            // Call NVIDIA NIM API
            console.log('[nimRouter] Calling NVIDIA NIM API...');
            const response = await axios.post(
                `${NVIDIA_CONFIG.endpoint}/chat/completions`,
                {
                    model: NVIDIA_CONFIG.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI coordinator for a decentralized edge compute network. Generate concise, actionable commands for autonomous agents based on their telemetry. Commands should be in format: ACTION:PARAMETERS (e.g., "MOVE:100,200,50" or "SCAN:360" or "IDLE"). Keep responses under 50 words.'
                        },
                        {
                            role: 'user',
                            content: agentContext
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 100,
                    top_p: 0.9
                },
                {
                    headers: {
                        'Authorization': `Bearer ${NVIDIA_CONFIG.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const aiResponse = response.data.choices[0]?.message?.content || 'IDLE';
            const tokensUsed = response.data.usage?.total_tokens || 0;

            console.log('[nimRouter] NIM response:', aiResponse, '(tokens:', tokensUsed, ')');

            // Write command to command_queue
            const commandRef = await db.collection('command_queue').add({
                agent_did: agentDid,
                command: aiResponse,
                priority: 0, // NIM-generated commands have priority 0
                source: 'nim',
                event_id: eventId,
                tokens_used: tokensUsed,
                model: NVIDIA_CONFIG.model,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                expires_at: admin.firestore.Timestamp.fromMillis(Date.now() + 30000) // 30 second TTL
            });

            // Log to nim_log collection
            await db.collection('nim_log').add({
                event_id: eventId,
                agent_did: agentDid,
                command_id: commandRef.id,
                prompt: agentContext,
                response: aiResponse,
                tokens_used: tokensUsed,
                model: NVIDIA_CONFIG.model,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log('[nimRouter] Command queued:', commandRef.id);

            return { success: true, command_id: commandRef.id };

        } catch (error) {
            console.error('[nimRouter] Error:', error.message);
            
            // Log error to nim_log
            await db.collection('nim_log').add({
                event_id: event.params.eventId,
                agent_did: event.data?.data()?.agent_did,
                error: error.message,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            return null;
        }
});

/**
 * Helper function to build agent context from event data
 */
function buildAgentContext(eventData) {
    const parts = [];
    
    parts.push(`Agent: ${eventData.agent_did}`);
    
    if (eventData.location) {
        parts.push(`Location: (${eventData.location.x}, ${eventData.location.y}, ${eventData.location.z})`);
    }
    
    if (eventData.battery !== undefined) {
        parts.push(`Battery: ${eventData.battery}%`);
    }
    
    if (eventData.status) {
        parts.push(`Status: ${eventData.status}`);
    }
    
    if (eventData.velocity) {
        parts.push(`Velocity: ${eventData.velocity}`);
    }
    
    if (eventData.heading !== undefined) {
        parts.push(`Heading: ${eventData.heading}°`);
    }
    
    if (eventData.message) {
        parts.push(`Message: ${eventData.message}`);
    }
    
    return parts.join(', ') + '. What command should I give?';
}

/**
 * getLatestCommand - HTTP endpoint for agents to poll for commands
 * GET /getLatestCommand?agent_did=<did>
 * Returns HTTP 200 with empty command when queue is empty (prevents UE5 polling errors)
 */
exports.getLatestCommand = onRequest(async (req, res) => {
    try {
        const agentDid = req.query.agent_did;

        if (!agentDid) {
            return res.status(400).json({ error: 'Missing agent_did parameter' });
        }

        // Query command_queue for this agent
        // Simplified query - just filter by agent and expiration, then sort in memory
        const snapshot = await db.collection('command_queue')
            .where('agent_did', '==', agentDid)
            .where('expires_at', '>', admin.firestore.Timestamp.now())
            .get();

        if (snapshot.empty) {
            // Return HTTP 200 with "none" command to prevent UE5 polling errors
            return res.status(200).json({
                success: true,
                command: 'none',
                message: 'No pending commands'
            });
        }

        // Sort by priority (desc) then created_at (desc) in memory
        const commands = snapshot.docs
            .map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }))
            .sort((a, b) => {
                // Priority descending (higher priority first)
                if (b.priority !== a.priority) {
                    return b.priority - a.priority;
                }
                // Then by created_at descending (newer first)
                return b.created_at?.toMillis() - a.created_at?.toMillis();
            });

        const command = commands[0];

        // Delete the command after retrieving (one-time use)
        await command.ref.delete();

        console.log('[getLatestCommand] ✅ Retrieved command:', command.id, 'for agent:', agentDid);

        res.status(200).json({
            success: true,
            command: command.command,
            command_id: command.id,
            priority: command.priority,
            source: command.source,
            created_at: command.created_at
        });

    } catch (error) {
        console.error('[getLatestCommand] ❌ Error:', error);
        // Return HTTP 200 with error info to prevent UE5 polling spam
        res.status(200).json({
            success: false,
            command: 'none',
            error: error.message
        });
    }
});

/**
 * sendCommand - NIM-Ready Cloud Function for structured telco payload dispatch
 * POST /sendCommand
 * Body: { "agent_did": "...", "priority": 1, "source": "...", "payload": { "action_intent": "...", ... } }
 */
exports.sendCommand = onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }

    const { agent_did, priority, source, payload } = req.body;

    if (!agent_did || !payload || !payload.action_intent) {
        return res.status(400).json({ error: 'Missing agent_did or payload.action_intent' });
    }

    const normalizedCommand = {
        agent_did: agent_did,
        priority: priority || 1,
        source: source || 'android_guardian_app',
        status: 'pending',
        payload: {
            action_intent: payload.action_intent,
            spatial_directives: {
                waypoints: payload.spatial_directives?.waypoints || []
            },
            network_directives: {
                tx_gain: payload.network_directives?.tx_gain || 0.0,
                bandwidth_allocation: payload.network_directives?.bandwidth_allocation || 0.0,
                preferred_nodes: payload.network_directives?.preferred_nodes || []
            },
            dao_signal: payload.dao_signal || 'CONSENSUS_PENDING'
        },
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        expires_at: admin.firestore.Timestamp.fromMillis(Date.now() + 30000)
    };

    try {
        const commandRef = await db.collection('command_queue').add(normalizedCommand);

        await db.collection('event_stream').add({
            event_type: 'COMMAND_DISPATCHED',
            agent_did: agent_did,
            vcon: {
                vcon: "0.0.1",
                created_at: new Date().toISOString(),
                dialog: [{ type: "action", body: `Intent: ${payload.action_intent} | TxGain: ${normalizedCommand.payload.network_directives.tx_gain}` }]
            },
            nim_routed: false
        });

        return res.status(200).json({ success: true, command_id: commandRef.id });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * observatoryFeed - HTTP endpoint to get recent events for Observatory Brain
 * GET /observatoryFeed?limit=<number>
 */
exports.observatoryFeed = onRequest(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;

        if (limit > 100) {
            return res.status(400).json({ error: 'Limit cannot exceed 100' });
        }

        // Get recent events from event_stream
        const snapshot = await db.collection('event_stream')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('[observatoryFeed] Retrieved', events.length, 'events');

        res.status(200).json({
            success: true,
            count: events.length,
            events: events
        });

    } catch (error) {
        console.error('[observatoryFeed] Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Made with Bob
