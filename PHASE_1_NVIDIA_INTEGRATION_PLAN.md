# Phase 1: NVIDIA NIM Integration Plan

**Date**: 2026-03-31  
**Status**: Ready to Begin  
**Duration**: 2-3 weeks  
**Prerequisites**: ✅ Phase 0 Complete

---

## Executive Summary

Based on your infrastructure analysis, you have:
- ✅ **Firebase**: Project `substrate-nexus-9182` with Firestore collections
- ✅ **MongoDB Atlas**: `TexasRoot_Siphon` project with `substrate_network` database
- ✅ **Cloud Functions**: 4 functions deployed (vconIngest, nimRouter, getLatestCommand, observatoryFeed)
- ✅ **6G Developer Program**: Access confirmed
- ✅ **Agent DIDs**: 4 agents registered and operational

**Missing**: NVIDIA NIM API key needs to be added to environment

---

## Current Infrastructure Status

### Firebase Collections (Confirmed Active)
From your screenshot, I can see:
- ✅ `command_queue` - Active with commands
- ✅ `event_stream` - Receiving vCon documents
- ✅ `metabolic_state` - Agent health tracking
- ✅ `nim_log` - Ready for NVIDIA logs
- ✅ `observatory_feed` - Telemetry feed active

### MongoDB Atlas (Confirmed Active)
From your screenshot:
- ✅ Cluster: `Texas-Root-Alpha`
- ✅ Database: `substrate_network`
- ✅ Collections: `metabolic_snapshots`, `vcons`
- ✅ Connection: Active

### Cloud Functions (Deployed)
According to roadmap:
- ✅ `vconIngest`: https://vconingest-24qs4mpmsq-uc.a.run.app
- ✅ `nimRouter`: https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter
- ✅ `getLatestCommand`: https://getlatestcommand-24qs4mpmsq-uc.a.run.app
- ✅ `observatoryFeed`: https://observatoryfeed-24qs4mpmsq-uc.a.run.app

---

## Phase 1 Tasks Breakdown

### Task 1: Add NVIDIA NIM API Key ⏳ **NEXT**

**Priority**: CRITICAL  
**Duration**: 30 minutes  
**Owner**: You (manual step)

**Steps**:
1. Get your NVIDIA NIM API key from 6G Developer Program
2. Add to `.env` file:
   ```env
   # NVIDIA NIM Configuration
   NVIDIA_NIM_API_KEY=your-nvidia-nim-api-key-here
   NVIDIA_NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
   NVIDIA_NIM_MODEL=meta/llama-3.1-70b-instruct
   ```
3. Update `.env.example` with placeholders
4. Test API key with simple curl:
   ```bash
   curl -X POST https://integrate.api.nvidia.com/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"meta/llama-3.1-70b-instruct","messages":[{"role":"user","content":"Hello"}]}'
   ```

### Task 2: Update nimRouter Cloud Function ⏳

**Priority**: HIGH  
**Duration**: 2-3 hours  
**Owner**: Jules (Tier 3C) or You

**Current State**: Function exists but may need NVIDIA integration

**Required Changes**:
```javascript
// backend/functions/nimRouter.js (or similar)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

exports.nimRouter = functions.firestore
  .document('event_stream/{eventId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const agentDid = data.agent_did;
    
    // Exclude Giga from NIM routing
    const GIGA_DID = 'did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX';
    if (agentDid === GIGA_DID) {
      console.log('Skipping NIM routing for Giga (manual control only)');
      return null;
    }
    
    // Extract telemetry from vCon
    const vcon = data.vcon;
    const telemetry = vcon.dialog[0]?.body || 'No telemetry data';
    
    // Call NVIDIA NIM API
    try {
      const response = await axios.post(
        process.env.NVIDIA_NIM_ENDPOINT + '/chat/completions',
        {
          model: process.env.NVIDIA_NIM_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an AI agent coordinator. Analyze telemetry and generate commands: MOVE_TO, SCAN, IDLE, or ALERT.'
            },
            {
              role: 'user',
              content: `Agent ${agentDid} telemetry: ${telemetry}`
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const aiResponse = response.data.choices[0].message.content;
      
      // Parse command from AI response
      const command = parseCommand(aiResponse);
      
      // Write to command_queue
      await admin.firestore().collection('command_queue').add({
        command_id: admin.firestore().FieldValue.serverTimestamp(),
        agent_did: agentDid,
        action: command.action,
        agent_msg: command.message,
        priority: 0, // NIM-generated
        timestamp: admin.firestore().FieldValue.serverTimestamp(),
        ttl: admin.firestore().Timestamp.fromMillis(Date.now() + 30000),
        status: 'pending',
        source: 'nim'
      });
      
      // Log to nim_log
      await admin.firestore().collection('nim_log').add({
        log_id: context.eventId,
        timestamp: admin.firestore().FieldValue.serverTimestamp(),
        event_id: context.params.eventId,
        agent_did: agentDid,
        request: {
          model: process.env.NVIDIA_NIM_MODEL,
          prompt: telemetry
        },
        response: {
          text: aiResponse,
          tokens_used: response.data.usage.total_tokens,
          latency_ms: response.data.usage.completion_time
        },
        command_generated: command.action
      });
      
      console.log(`NIM command generated for ${agentDid}: ${command.action}`);
      
    } catch (error) {
      console.error('NVIDIA NIM API error:', error);
      throw error;
    }
  });

function parseCommand(aiResponse) {
  // Simple command parser - can be enhanced
  const text = aiResponse.toLowerCase();
  
  if (text.includes('move') || text.includes('navigate')) {
    return { action: 'MOVE_TO', message: aiResponse };
  } else if (text.includes('scan') || text.includes('analyze')) {
    return { action: 'SCAN', message: aiResponse };
  } else if (text.includes('alert') || text.includes('warning')) {
    return { action: 'ALERT', message: aiResponse };
  } else {
    return { action: 'IDLE', message: aiResponse };
  }
}
```

### Task 3: Test NVIDIA NIM Integration ⏳

**Priority**: HIGH  
**Duration**: 1-2 hours

**Test Steps**:
1. Deploy updated nimRouter function
2. Trigger vCon event from UE5 or manually
3. Monitor Firestore `nim_log` collection
4. Verify command appears in `command_queue`
5. Check agent receives command via getLatestCommand

**Test Command** (manual trigger):
```javascript
// test_nim_integration.js
const admin = require('firebase-admin');
admin.initializeApp();

async function testNIM() {
  const db = admin.firestore();
  
  // Create test vCon event
  await db.collection('event_stream').add({
    event_id: 'test-' + Date.now(),
    agent_did: 'did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ', // Byte
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    vcon: {
      vcon: '0.0.1',
      uuid: 'test-uuid',
      parties: [{
        tel: '+1-555-0100',
        name: 'Byte',
        did: 'did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ'
      }],
      dialog: [{
        type: 'text',
        start: new Date().toISOString(),
        body: 'Agent location: (100, 200, 50). Battery: 85%. Status: Operational.'
      }]
    },
    processed: false,
    nim_routed: false
  });
  
  console.log('Test vCon event created. Check Firestore for NIM response.');
}

testNIM();
```

### Task 4: MongoDB Integration (Optional) ⏳

**Priority**: MEDIUM  
**Duration**: 2-3 hours

**Purpose**: Sync data between Firebase and MongoDB Atlas

**Implementation**:
```javascript
// backend/functions/syncToMongo.js
const functions = require('firebase-functions');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_ATLAS_URI;

exports.syncVConToMongo = functions.firestore
  .document('event_stream/{eventId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    const client = new MongoClient(MONGO_URI);
    
    try {
      await client.connect();
      const db = client.db('substrate_network');
      const collection = db.collection('vcons');
      
      await collection.insertOne({
        _id: context.params.eventId,
        ...data,
        synced_at: new Date()
      });
      
      console.log(`vCon synced to MongoDB: ${context.params.eventId}`);
    } finally {
      await client.close();
    }
  });
```

---

## Environment Variables Checklist

Update your `.env` file with these additions:

```env
# Existing (confirmed working)
SUBSTRATE_RPC_URL=ws://127.0.0.1:9944
FIREBASE_PROJECT_ID=substrate-nexus-9182
STITCH_API_KEY=your-stitch-api-key-here
STITCH_PROJECT_ID=Substrate_Consulting_Nexus
GOOGLE_GENAI_API_KEY=your-google-genai-api-key-here

# NEW - Add these for NVIDIA NIM
NVIDIA_NIM_API_KEY=your-nvidia-api-key-from-6g-program
NVIDIA_NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.1-70b-instruct

# NEW - Add MongoDB Atlas connection (optional)
MONGODB_ATLAS_URI=mongodb+srv://username:password@texas-root-alpha.mongodb.net/substrate_network?retryWrites=true&w=majority
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] NVIDIA NIM API key added and tested
- [ ] nimRouter function updated with NVIDIA integration
- [ ] Test vCon event triggers NIM inference
- [ ] Command appears in command_queue with priority=0
- [ ] nim_log collection records inference
- [ ] Agent successfully polls and receives NIM command
- [ ] End-to-end latency < 5 seconds

---

## Next Steps After Phase 1

Once Phase 1 is complete, you'll be ready for:

### Phase 2: Firestore Schema Enhancements
- Add `priority` field migration
- Add `passenger_did` for SDV routing
- Implement TTL cleanup function

### Phase 3: UE5 Blueprint Integration
- Build PollCommandQueue Blueprint
- Wire BP_Byte telemetry
- Wire BP_OffRoadSDV telemetry
- Fix BP_ObservatoryBrain_C URL

### Phase 4: Flutter Mobile App
- Texas Root Guardian app development
- Mobile command interface
- Real-time agent monitoring

---

## Resources & Links

**NVIDIA NIM**:
- API Documentation: https://docs.nvidia.com/nim/
- 6G Developer Program: https://developer.nvidia.com/6g

**Firebase**:
- Console: https://console.firebase.google.com/project/substrate-nexus-9182
- Firestore: https://console.firebase.google.com/project/substrate-nexus-9182/firestore

**MongoDB Atlas**:
- Cluster: Texas-Root-Alpha
- Project: TexasRoot_Siphon

**Cloud Functions**:
- vconIngest: https://vconingest-24qs4mpmsq-uc.a.run.app
- nimRouter: https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter
- getLatestCommand: https://getlatestcommand-24qs4mpmsq-uc.a.run.app

---

## Questions to Answer

1. **Where is your NVIDIA NIM API key?**
   - Check 6G Developer Program dashboard
   - Or NVIDIA NGC (NVIDIA GPU Cloud) account

2. **Where are your Cloud Functions source code?**
   - Likely in a separate `functions/` directory
   - Or deployed directly via Firebase CLI

3. **Do you want MongoDB sync?**
   - Optional for Phase 1
   - Can add later if needed

---

**Status**: Ready to begin! Get your NVIDIA API key and let's integrate! 🚀