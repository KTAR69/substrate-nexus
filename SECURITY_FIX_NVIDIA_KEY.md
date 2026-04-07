# CRITICAL: NVIDIA API Key Exposed in Git History

## ⚠️ IMMEDIATE ACTION REQUIRED

Your NVIDIA API key `nvapi-nYl79s1r-[REDACTED]` was committed to the public GitHub repository in these files:

- DEPLOYMENT_STEPS.md
- FIREBASE_FUNCTIONS_DEPLOYMENT.md
- GEMINI_QUICK_START.md
- HANDOFF_TO_CLAUDE_GEMINI.md

## Step 1: Revoke Current NVIDIA API Key (DO THIS NOW)

1. Go to NVIDIA NIM Dashboard: https://build.nvidia.com/
2. Navigate to API Keys section
3. Find key starting with `nvapi-nYl79s1r...` (check your git history for full key)
4. Click "Revoke" or "Delete"
5. Confirm revocation

## Step 2: Generate New NVIDIA API Key

1. In NVIDIA NIM Dashboard, click "Create New API Key"
2. Name it: "NexusHub-Production-2026"
3. Copy the new key (starts with `nvapi-...`)
4. Save it securely in your password manager

## Step 3: Update Local Environment

```bash
# Update .env file (NOT committed to git)
# Replace with your NEW key
NVIDIA_NIM_API_KEY=your-new-key-here
NVIDIA_NIM_ENDPOINT=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.1-70b-instruct
```

## Step 4: Update Firebase Environment

```bash
firebase functions:config:set nvidia.api_key="YOUR_NEW_NVIDIA_KEY"
```

## Step 5: Redact Keys from Documentation

I will create sanitized versions of all documentation files with placeholder text instead of actual keys.

## Step 6: Clean Git History

After redacting, we'll need to:
1. Commit the sanitized files
2. Force push to overwrite history
3. Verify key is removed from GitHub

## Why This Happened

During documentation creation, I included the actual API key in example commands to make it easier for you to copy/paste. This was a mistake - we should have used placeholders like `YOUR_NVIDIA_API_KEY_HERE`.

## Prevention for Future

- Never commit actual API keys to git
- Always use placeholders in documentation
- Keep actual keys only in `.env` (which is in `.gitignore`)
- Use environment variables for all secrets

## Status

- [ ] NVIDIA API key revoked
- [ ] New API key generated
- [ ] Local .env updated
- [ ] Firebase config updated
- [ ] Documentation sanitized
- [ ] Git history cleaned
- [ ] Verified on GitHub

## Next Steps

1. **YOU**: Revoke the old key immediately
2. **YOU**: Generate new key
3. **BOB**: Sanitize all documentation files
4. **BOB**: Commit and force push
5. **YOU**: Update Firebase with new key
6. **YOU**: Test deployment still works