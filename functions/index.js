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
 * vconIngest - Ingests vCon telemetry from UE5 agents
 * Triggered by HTTP POST from UE5 Blueprints
 */
exports.vconIngest = onRequest(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const vconData = req.body;
        
        // Validate required fields
        if (!vconData.agent_did || !vconData.timestamp) {
            return res.status(400).json({ error: 'Missing required fields: agent_did, timestamp' });
        }

        // Write to event_stream collection
        const docRef = await db.collection('event_stream').add({
            ...vconData,
            ingested_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('[vconIngest] Stored event:', docRef.id, 'for agent:', vconData.agent_did);

        res.status(200).json({
            success: true,
            event_id: docRef.id,
            message: 'vCon telemetry ingested successfully'
        });

    } catch (error) {
        console.error('[vconIngest] Error:', error);
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
 */
exports.getLatestCommand = onRequest(async (req, res) => {
    try {
        const agentDid = req.query.agent_did;

        if (!agentDid) {
            return res.status(400).json({ error: 'Missing agent_did parameter' });
        }

        // Query command_queue for this agent, ordered by priority (desc) then created_at (desc)
        const snapshot = await db.collection('command_queue')
            .where('agent_did', '==', agentDid)
            .where('expires_at', '>', admin.firestore.Timestamp.now())
            .orderBy('expires_at', 'desc')
            .orderBy('priority', 'desc')
            .orderBy('created_at', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                command: null,
                message: 'No pending commands'
            });
        }

        const commandDoc = snapshot.docs[0];
        const commandData = commandDoc.data();

        // Delete the command after retrieving (one-time use)
        await commandDoc.ref.delete();

        console.log('[getLatestCommand] Retrieved command:', commandDoc.id, 'for agent:', agentDid);

        res.status(200).json({
            success: true,
            command: commandData.command,
            command_id: commandDoc.id,
            priority: commandData.priority,
            source: commandData.source,
            created_at: commandData.created_at
        });

    } catch (error) {
        console.error('[getLatestCommand] Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
