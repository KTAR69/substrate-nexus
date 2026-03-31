# Firebase Functions Deployment Guide

## Overview

This guide covers deploying the NexusHub Cloud Functions with NVIDIA NIM integration to Firebase.

## Prerequisites

1. **Firebase CLI** installed:
```bash
npm install -g firebase-tools
```

2. **Firebase project** configured:
   - Project ID: `substrate-nexus-9182`
   - Already configured in `.firebaserc`

3. **NVIDIA NIM API Key** from 6G Program

## Step 1: Configure Environment Variables

Set the NVIDIA NIM configuration in Firebase:

```bash
firebase functions:config:set \
  nvidia.api_key="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" \
  nvidia.endpoint="https://integrate.api.nvidia.com/v1" \
  nvidia.model="meta/llama-3.1-70b-instruct"
```

**Note**: The API key shown above is your actual key. Keep it secure!

## Step 2: Update Functions Code

The functions are now using environment variables from Firebase config:

```javascript
const NVIDIA_CONFIG = {
    apiKey: process.env.NVIDIA_NIM_API_KEY,
    endpoint: process.env.NVIDIA_NIM_ENDPOINT || 'https://integrate.api.nvidia.com/v1',
    model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.1-70b-instruct'
};
```

## Step 3: Deploy Functions

Deploy all functions to Firebase:

```bash
cd functions
npm run deploy
```

Or deploy specific functions:

```bash
firebase deploy --only functions:nimRouter
firebase deploy --only functions:vconIngest
firebase deploy --only functions:getLatestCommand
firebase deploy --only functions:observatoryFeed
```

## Step 4: Verify Deployment

Check function logs:

```bash
firebase functions:log
```

Or view in Firebase Console:
https://console.firebase.google.com/project/substrate-nexus-9182/functions

## Step 5: Test NVIDIA NIM Integration

### Test 1: Create a test event

```bash
curl -X POST https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest \
  -H "Content-Type: application/json" \
  -d '{
    "agent_did": "did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey",
    "timestamp": "2026-03-31T12:00:00Z",
    "location": {"x": 100, "y": 200, "z": 50},
    "battery": 85,
    "status": "operational"
  }'
```

### Test 2: Check if command was generated

Query Firestore `command_queue` collection or use:

```bash
curl "https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey"
```

### Test 3: Check NIM logs

Query Firestore `nim_log` collection to see:
- Prompt sent to NVIDIA
- AI response
- Tokens used
- Model used

## Troubleshooting

### Issue: "NVIDIA_NIM_API_KEY not configured"

**Solution**: Ensure environment variables are set:
```bash
firebase functions:config:get
```

Should show:
```json
{
  "nvidia": {
    "api_key": "nvapi-...",
    "endpoint": "https://integrate.api.nvidia.com/v1",
    "model": "meta/llama-3.1-70b-instruct"
  }
}
```

### Issue: "NVIDIA API timeout"

**Solution**: Check NVIDIA API status and increase timeout in `functions/index.js`:
```javascript
timeout: 30000  // 30 seconds
```

### Issue: "Giga still getting NIM commands"

**Solution**: Verify Giga's DID matches exactly:
```javascript
const GIGA_DID = 'did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX';
```

## Function URLs

After deployment, your functions will be available at:

- **vconIngest**: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
- **nimRouter**: (Firestore trigger, no URL)
- **getLatestCommand**: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand`
- **observatoryFeed**: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/observatoryFeed`

## Update UE5 Blueprints

After deployment, update the URLs in your UE5 Blueprints:

1. **BP_Byte** → vconIngest URL
2. **BP_OffRoadSDV** → vconIngest URL
3. **BP_ObservatoryBrain_C** → observatoryFeed URL
4. All agents → getLatestCommand URL

## Monitoring

Monitor function performance:

```bash
# View logs
firebase functions:log --only nimRouter

# View metrics in console
https://console.firebase.google.com/project/substrate-nexus-9182/functions
```

## Cost Estimation

- **NVIDIA NIM**: ~$0.001 per 1K tokens
- **Firebase Functions**: Free tier includes 2M invocations/month
- **Firestore**: Free tier includes 50K reads, 20K writes per day

Expected monthly cost: < $10 for development/testing

## Next Steps

1. ✅ Deploy functions
2. ✅ Test NVIDIA NIM integration
3. ⏭️ Update UE5 Blueprint URLs
4. ⏭️ Test end-to-end: UE5 → vconIngest → nimRouter → NVIDIA → command_queue → Agent polling
5. ⏭️ Monitor logs and adjust prompts as needed

## Rollback

If issues occur, rollback to previous version:

```bash
firebase functions:log --only nimRouter
# Find previous deployment ID
firebase rollback functions:nimRouter <deployment-id>
```

## Support

- Firebase Console: https://console.firebase.google.com/project/substrate-nexus-9182
- NVIDIA NIM Docs: https://docs.nvidia.com/nim/
- Project Docs: See `PHASE_1_NVIDIA_INTEGRATION_PLAN.md`