# NexusHub Phase 1 Deployment - Step-by-Step Guide

## Agent Context
- **Giga & Byte**: Web3 Podcast Journalists/Network Field Agents (manual control)
- **Jules**: AI Assistant for the network (AI-assisted)
- **OffRoadSDV**: AI-Software Defined Vehicle for DePIN node monitoring (AI-assisted)

## Pre-Deployment Checklist

✅ NVIDIA NIM API key verified working  
✅ Firebase project: substrate-nexus-9182  
✅ 4 agents registered on-chain with DIDs  
✅ Cloud Functions code complete  
✅ All changes committed to GitHub  

---

## STEP 1: Login to Firebase

```bash
firebase login
```

**Expected Output**: Browser opens, login with your Google account

**Verify**:
```bash
firebase projects:list
```

Should show `substrate-nexus-9182` in the list.

---

## STEP 2: Set Firebase Environment Variables

Configure NVIDIA NIM credentials:

```bash
firebase functions:config:set \
  nvidia.api_key="YOUR_NVIDIA_API_KEY_HERE" \
  nvidia.endpoint="https://integrate.api.nvidia.com/v1" \
  nvidia.model="meta/llama-3.1-70b-instruct"
```

**Expected Output**: 
```
✔  Functions config updated.
```

**Verify Configuration**:
```bash
firebase functions:config:get
```

**Expected Output**:
```json
{
  "nvidia": {
    "api_key": "YOUR_NVIDIA_API_KEY_HERE",
    "endpoint": "https://integrate.api.nvidia.com/v1",
    "model": "meta/llama-3.1-70b-instruct"
  }
}
```

---

## STEP 3: Deploy Cloud Functions

```bash
cd functions
npm run deploy
```

**Expected Output** (takes 2-5 minutes):
```
✔  functions[us-central1-vconIngest]: Successful create operation.
✔  functions[us-central1-nimRouter]: Successful create operation.
✔  functions[us-central1-getLatestCommand]: Successful create operation.
✔  functions[us-central1-observatoryFeed]: Successful create operation.

✔  Deploy complete!
```

**Save These URLs** (you'll need them for UE5):
- vconIngest: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
- getLatestCommand: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand`
- observatoryFeed: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/observatoryFeed`

---

## STEP 4: Test NVIDIA NIM Integration

### Test 4A: Send Test Telemetry (Jules)

```bash
curl -X POST https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest \
  -H "Content-Type: application/json" \
  -d '{
    "agent_did": "did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y",
    "timestamp": "2026-03-31T16:00:00Z",
    "location": {"x": 100, "y": 200, "z": 50},
    "battery": 85,
    "status": "operational",
    "message": "Monitoring network activity"
  }'
```

**Expected Output**:
```json
{
  "success": true,
  "event_id": "abc123xyz",
  "message": "vCon telemetry ingested successfully"
}
```

### Test 4B: Check NVIDIA Generated Command

Wait 2-3 seconds, then:

```bash
curl "https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y"
```

**Expected Output**:
```json
{
  "success": true,
  "command": "SCAN:360",
  "command_id": "def456",
  "priority": 0,
  "source": "nim"
}
```

### Test 4C: Verify in Firebase Console

1. Go to: https://console.firebase.google.com/project/substrate-nexus-9182/firestore
2. Check collections:
   - `event_stream` - Should have your test event
   - `command_queue` - Should have the generated command (or empty if already polled)
   - `nim_log` - Should show NVIDIA inference details

---

## STEP 5: Update UE5 Blueprint URLs

Open Unreal Engine 5 project: `NexusHub_TexasRoot`

### Update BP_Byte (Journalist Agent)

1. Open `Content/Blueprints/BP_Byte`
2. Find the **SendTelemetry** function
3. Update URL to: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
4. Find the **PollCommands** function
5. Update URL to: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey`

### Update BP_OffRoadSDV (DePIN Monitor Vehicle)

1. Open `Content/Blueprints/BP_OffRoadSDV`
2. Find the **SendTelemetry** function
3. Update URL to: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
4. Find the **PollCommands** function
5. Update URL to: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkoXVLSVYHN8YxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey`

### Update BP_ObservatoryBrain_C (Observatory Dashboard)

1. Open `Content/Blueprints/BP_ObservatoryBrain_C`
2. Find the **FetchEvents** function
3. Update URL from `http://localhost:3000/observatory-feed` to:
   `https://us-central1-substrate-nexus-9182.cloudfunctions.net/observatoryFeed?limit=50`

### Note: Giga Remains Manual Control

Giga's DID (`did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX`) is excluded from NVIDIA NIM routing in the `nimRouter` function. Giga will only receive manual commands from the mobile app or direct Firestore writes.

---

## STEP 6: Test End-to-End in UE5

### Test 6A: Jules AI Assistant

1. Launch UE5 project
2. Play in Editor
3. Spawn Jules agent
4. Watch console logs for:
   - ✅ Telemetry sent to vconIngest
   - ✅ Command received from NVIDIA NIM
   - ✅ Command executed by Jules

**Expected Behavior**: Jules should receive AI-generated commands like "SCAN:360", "MOVE:X,Y,Z", or "IDLE" based on telemetry.

### Test 6B: OffRoadSDV DePIN Monitor

1. Spawn OffRoadSDV vehicle
2. Drive to a DePIN node location
3. Watch for AI commands:
   - "SCAN:360" - Check node status
   - "MOVE:X,Y,Z" - Navigate to next node
   - "REPORT" - Send status update

### Test 6C: Giga Manual Control

1. Spawn Giga agent
2. Verify NO AI commands are received (excluded from NIM)
3. Send manual command via mobile app or Firestore
4. Verify Giga executes only manual commands

### Test 6D: Observatory Brain Dashboard

1. Open Observatory Brain widget
2. Verify real-time event feed displays
3. Check all agent locations and statuses
4. Verify data updates every 5 seconds

---

## STEP 7: Monitor and Verify

### Check Firebase Function Logs

```bash
firebase functions:log --only nimRouter
```

**Look for**:
- `[nimRouter] Processing event: <id> for agent: <did>`
- `[nimRouter] NIM response: <command> (tokens: <count>)`
- `[nimRouter] Command queued: <id>`

### Check NVIDIA Token Usage

```bash
firebase functions:log --only nimRouter | grep "tokens:"
```

**Expected**: ~50-150 tokens per inference

### Check Firestore Collections

1. **event_stream**: Should have telemetry from Jules and OffRoadSDV
2. **command_queue**: Should be mostly empty (commands consumed quickly)
3. **nim_log**: Should show all NVIDIA inferences with prompts and responses
4. **metabolic_state**: Should track agent battery, location, status

---

## STEP 8: Troubleshooting

### Issue: "NVIDIA_NIM_API_KEY not configured"

**Solution**:
```bash
firebase functions:config:get
```
If empty, repeat STEP 2.

### Issue: No commands generated

**Check**:
1. Is agent DID correct in telemetry?
2. Is agent Giga? (Giga is excluded)
3. Check `nim_log` for errors
4. Verify NVIDIA API key is valid

### Issue: Commands not received in UE5

**Check**:
1. Is polling URL correct?
2. Is agent_did parameter included?
3. Check UE5 console for HTTP errors
4. Verify command_queue has entries

### Issue: Observatory Brain not updating

**Check**:
1. Is observatoryFeed URL correct?
2. Check browser console for CORS errors
3. Verify event_stream has recent entries

---

## STEP 9: Production Readiness (Optional)

### Enable Firestore Security Rules

Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow Cloud Functions to write
    match /event_stream/{document=**} {
      allow read, write: if request.auth != null || request.resource.data.source == 'cloud_function';
    }
    
    // Command queue - agents can read their own
    match /command_queue/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.resource.data.source == 'cloud_function';
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Set Up Monitoring Alerts

1. Go to Firebase Console → Functions → Metrics
2. Set up alerts for:
   - Function errors > 5% error rate
   - Function execution time > 30 seconds
   - NVIDIA API failures

---

## Success Criteria ✅

- [ ] All 4 Cloud Functions deployed successfully
- [ ] NVIDIA NIM API responding with commands
- [ ] Jules receives AI-generated commands in UE5
- [ ] OffRoadSDV receives AI-generated commands in UE5
- [ ] Giga excluded from AI (manual control only)
- [ ] Observatory Brain displays real-time events
- [ ] nim_log collection shows inference history
- [ ] No errors in Firebase function logs

---

## Next Phase: Mobile App Integration

After Phase 1 is complete and tested:

1. Build Flutter mobile app for manual command injection
2. Add priority 1 commands from mobile (override AI)
3. Implement real-time agent tracking on mobile
4. Add voice commands for Giga and Byte

See `NEXUSHUB_ARCHITECTURE_ROADMAP.md` for Phase 2-8 details.

---

## Support Resources

- **Firebase Console**: https://console.firebase.google.com/project/substrate-nexus-9182
- **NVIDIA NIM Docs**: https://docs.nvidia.com/nim/
- **Function Logs**: `firebase functions:log`
- **Test NVIDIA API**: `cd backend && node test_nvidia_nim.js`
- **Project Docs**: `PHASE_1_NVIDIA_INTEGRATION_PLAN.md`

**Questions?** Check the troubleshooting section or review function logs.