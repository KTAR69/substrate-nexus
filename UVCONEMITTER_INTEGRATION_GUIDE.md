# UVConEmitter Integration Guide

## Overview
This guide explains how the updated `vconIngest` Firebase function handles UVConEmitter's MongoDB Atlas format with flexible key mapping.

---

## What Changed

### ✅ Path Routing
The function now accepts both paths:
- `/vconIngest` (standard)
- `/vconIngest/action/insertOne` (UVConEmitter appends this)

Firebase Cloud Functions automatically handle path suffixes, so no additional routing needed.

### ✅ Raw Payload Logging
Every request logs the complete raw payload for debugging:
```javascript
console.log('[vconIngest] Raw request path:', req.path);
console.log('[vconIngest] Raw payload:', JSON.stringify(req.body, null, 2));
```

**Check Firebase logs to see exactly what UVConEmitter is sending!**

### ✅ Flexible Key Mapping
The function checks for multiple possible field name variations:

#### Agent DID Field (checks in order):
1. `agent_did` (standard)
2. `agentDid` (camelCase)
3. `AgentDID` (PascalCase)
4. `Source DID` (space-separated)
5. `sourceDid` (camelCase)
6. `source_did` (snake_case)
7. `did` (short form)
8. `DID` (uppercase)

#### Timestamp Field (checks in order):
1. `timestamp` (standard)
2. `Timestamp` (capitalized)
3. `time` (short form)
4. `Time` (capitalized)
5. `created_at` (snake_case)
6. `createdAt` (camelCase)
7. **Fallback:** Current server time if missing

### ✅ MongoDB Atlas Unwrapping
Automatically detects and unwraps Atlas format:
```json
{
  "dataSource": "...",
  "database": "...",
  "collection": "...",
  "document": {
    "agent_did": "...",
    "timestamp": "..."
  }
}
```
Extracts the `document` object and processes it.

### ✅ Enhanced Error Messages
If `agent_did` is missing, the error response includes:
- List of received keys
- Hint about expected field names
- Helps identify what UVConEmitter is actually sending

Example error:
```json
{
  "error": "Missing required field: agent_did (or equivalent)",
  "receivedKeys": ["Source DID", "Timestamp", "Location"],
  "hint": "Expected one of: agent_did, agentDid, AgentDID, Source DID, sourceDid, source_did, did, DID"
}
```

### ✅ Raw Payload Storage
The original payload is stored in Firestore for debugging:
```javascript
{
  ...normalizedData,
  ingested_at: Timestamp,
  raw_payload: req.body  // Original UVConEmitter payload
}
```

---

## Testing Strategy

### Step 1: Check Firebase Logs
After UVConEmitter sends a request, check Firebase Console logs:

```bash
firebase functions:log --only vconIngest
```

Look for:
```
[vconIngest] Raw request path: /vconIngest/action/insertOne
[vconIngest] Raw payload: { ... }
[vconIngest] Normalized data: { agent_did: "...", timestamp: "..." }
[vconIngest] ✅ Stored event: abc123 for agent: did:key:...
```

### Step 2: Identify Key Names
From the raw payload log, identify what keys UVConEmitter is using:
- Is it `Source DID` or `agent_did`?
- Is it `Timestamp` or `timestamp`?
- Are there other custom fields?

### Step 3: Verify Firestore Storage
Check Firestore Console → `event_stream` collection:
- Verify documents are being created
- Check `raw_payload` field to see original data
- Verify `agent_did` and `timestamp` are correctly mapped

### Step 4: Test Error Handling
If you get HTTP 400, the error response will tell you:
- What keys were received
- What keys are expected
- Add missing key variations to the mapping if needed

---

## UVConEmitter Configuration

### URL Configuration
Set the UVConEmitter URL to:
```
https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest
```

**Note:** UVConEmitter will automatically append `/action/insertOne`, resulting in:
```
https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest/action/insertOne
```

This is expected and handled by the function.

### Payload Structure
UVConEmitter should send:
```json
{
  "document": {
    "agent_did": "did:key:z6Mk...",
    "timestamp": "2026-04-01T01:00:00Z",
    "location": { "x": 100, "y": 200, "z": 50 },
    "status": "active",
    ...other telemetry fields...
  }
}
```

Or if using legacy field names:
```json
{
  "document": {
    "Source DID": "did:key:z6Mk...",
    "Timestamp": "2026-04-01T01:00:00Z",
    ...
  }
}
```

Both formats will work!

---

## Troubleshooting

### Issue: HTTP 400 - Missing agent_did

**Cause:** UVConEmitter is using a field name not in the mapping list.

**Solution:**
1. Check Firebase logs for raw payload
2. Identify the actual field name used
3. Add it to the key mapping in `functions/index.js`:
   ```javascript
   agent_did: vconData.agent_did 
       || vconData.agentDid 
       || vconData['Your New Field Name']  // Add here
       || ...
   ```
4. Redeploy: `firebase deploy --only functions:vconIngest`

### Issue: HTTP 400 - Missing timestamp

**Cause:** Timestamp field not found (rare, as there's a fallback).

**Solution:**
1. Check Firebase logs for raw payload
2. Add the field name to timestamp mapping
3. Redeploy

### Issue: Data not appearing in Firestore

**Cause:** Function might be failing silently.

**Solution:**
1. Check Firebase logs for errors
2. Verify Firestore rules allow writes
3. Check `event_stream` collection exists

### Issue: Path /action/insertOne not working

**Cause:** Firebase routing issue (unlikely).

**Solution:**
1. Verify function is deployed: `firebase functions:list`
2. Check function URL in Firebase Console
3. Test with curl:
   ```bash
   curl -X POST https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest/action/insertOne \
     -H "Content-Type: application/json" \
     -d '{"document": {"agent_did": "did:key:test", "timestamp": "2026-04-01T01:00:00Z"}}'
   ```

---

## Expected Data Flow

```
UE5 (UVConEmitter)
    ↓ POST to /vconIngest
    ↓ (auto-appends /action/insertOne)
Firebase vconIngest
    ↓ Log raw payload
    ↓ Unwrap "document" field
    ↓ Map legacy keys → standard keys
    ↓ Validate agent_did exists
    ↓ Store in Firestore event_stream
    ↓ Return success response
Firestore event_stream
    ↓ Trigger nimRouter
    ↓ (continues to NVIDIA NIM...)
```

---

## Monitoring

### Firebase Console Logs
```bash
# Real-time logs
firebase functions:log --only vconIngest

# Filter for errors
firebase functions:log --only vconIngest | grep "❌"

# Filter for success
firebase functions:log --only vconIngest | grep "✅"
```

### Firestore Console
1. Open Firebase Console
2. Navigate to Firestore Database
3. Check `event_stream` collection
4. Look for recent documents
5. Inspect `raw_payload` field for debugging

### Success Indicators
- ✅ Log shows: `[vconIngest] ✅ Stored event: abc123`
- ✅ HTTP 200 response
- ✅ Document appears in `event_stream` collection
- ✅ `nimRouter` triggers (check logs)
- ✅ Command appears in `command_queue` collection

---

## Adding New Field Mappings

If UVConEmitter uses a field name not in the current mapping:

1. **Identify the field name** from Firebase logs
2. **Edit `functions/index.js`:**
   ```javascript
   const normalizedData = {
       agent_did: vconData.agent_did 
           || vconData.agentDid 
           || vconData['New Field Name']  // Add here
           || ...
   ```
3. **Deploy:**
   ```bash
   firebase deploy --only functions:vconIngest
   ```
4. **Test** with UVConEmitter
5. **Verify** in Firebase logs and Firestore

---

## Summary

✅ **No UE5 changes needed** - Backend handles everything  
✅ **Flexible key mapping** - Supports multiple field name variations  
✅ **Path routing** - Handles `/action/insertOne` automatically  
✅ **Raw payload logging** - See exactly what's being sent  
✅ **Enhanced errors** - Clear messages about missing fields  
✅ **Debugging support** - Raw payload stored in Firestore  

**The backend now does all the translation work!** 🎉