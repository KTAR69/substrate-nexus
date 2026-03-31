# Deployment Fix - Delete Old Functions and Redeploy

## Issue
The deployment failed because old Cloud Functions gen 1 exist and conflict with new gen 2 functions.

## Solution: Delete Old Functions via Firebase Console

### Step 1: Go to Firebase Console
https://console.firebase.google.com/project/substrate-nexus-9182/functions

### Step 2: Delete Each Function
1. Click on `vconIngest` → Click "Delete" button → Confirm
2. Click on `nimRouter` → Click "Delete" button → Confirm  
3. Click on `getLatestCommand` → Click "Delete" button → Confirm
4. Click on `observatoryFeed` → Click "Delete" button → Confirm

Wait for all deletions to complete (1-2 minutes).

### Step 3: Redeploy with New Code
```bash
cd functions
npm run deploy
```

This will deploy the new Cloud Functions gen 2 with Node.js 20.

---

## Alternative: Use Firebase CLI (if above doesn't work)

### Option A: Delete via CLI
```bash
firebase functions:delete vconIngest --force
firebase functions:delete nimRouter --force
firebase functions:delete getLatestCommand --force
firebase functions:delete observatoryFeed --force
```

### Option B: Delete All at Once
```bash
firebase functions:delete vconIngest nimRouter getLatestCommand observatoryFeed --force
```

Then redeploy:
```bash
cd functions
npm run deploy
```

---

## What Changed

### Before (Gen 1 - Deprecated):
- Node.js 18 (decommissioned)
- `firebase-functions` v4.5.0
- Old API: `functions.https.onRequest()`
- Old API: `functions.firestore.document().onCreate()`

### After (Gen 2 - Current):
- Node.js 20 (supported until 2026-10-30)
- `firebase-functions` v5.1.1
- New API: `onRequest()` from `firebase-functions/v2/https`
- New API: `onDocumentCreated()` from `firebase-functions/v2/firestore`
- Better performance and scaling

---

## Expected Deployment Output

```
✔  functions: Finished running predeploy script.
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
i  functions: Loading and analyzing source code for codebase default
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (72.96 KB) for uploading
i  functions: creating Node.js 20 (2nd Gen) function vconIngest(us-central1)...
i  functions: creating Node.js 20 (2nd Gen) function nimRouter(us-central1)...
i  functions: creating Node.js 20 (2nd Gen) function getLatestCommand(us-central1)...
i  functions: creating Node.js 20 (2nd Gen) function observatoryFeed(us-central1)...
✔  functions[vconIngest(us-central1)] Successful create operation.
✔  functions[nimRouter(us-central1)] Successful create operation.
✔  functions[getLatestCommand(us-central1)] Successful create operation.
✔  functions[observatoryFeed(us-central1)] Successful create operation.

✔  Deploy complete!
```

---

## After Successful Deployment

### Get Function URLs
The URLs will be displayed in the output. They should look like:
```
vconIngest: https://vconingest-<hash>-uc.a.run.app
nimRouter: (Firestore trigger, no URL)
getLatestCommand: https://getlatestcommand-<hash>-uc.a.run.app
observatoryFeed: https://observatoryfeed-<hash>-uc.a.run.app
```

### Update UE5 Blueprints
Use the new URLs in your UE5 Blueprints (they will be different from gen 1 URLs).

---

## Troubleshooting

### If deletion fails:
- Wait 5 minutes and try again
- Check Firebase Console for any ongoing operations
- Ensure you're logged in: `firebase login`

### If deployment still fails:
- Check Firebase quota limits
- Verify billing is enabled
- Check Cloud Functions API is enabled

---

## Next Steps After Deployment

1. ✅ Functions deployed successfully
2. ⏭️ Set environment variables (NVIDIA API key)
3. ⏭️ Initialize control modes
4. ⏭️ Test deployment
5. ⏭️ Update UE5 Blueprint URLs

See `GEMINI_QUICK_START.md` for complete testing guide.