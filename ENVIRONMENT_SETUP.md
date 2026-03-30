# Environment Setup Guide

This guide provides step-by-step instructions for setting up environment variables securely for the Velvet Cosmic project.

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit `.env` files to git!** All `.env` files are now blocked by:
- Root `.gitignore`
- Frontend `.gitignore`
- Backend `.gitignore`
- Pre-commit hooks

## Prerequisites

- Node.js 18+ installed
- Access to Google Cloud Console (for API keys)
- Git configured

## Step 1: Obtain API Keys

### Google Generative AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza...`)
5. **IMPORTANT**: Store this key securely - you won't be able to see it again

### Stitch API Key (if applicable)

1. Contact your Stitch administrator for an API key
2. Store the key securely

## Step 2: Set Up Environment Variables

### Option A: Local Development (Environment Variables)

#### For Windows (PowerShell)

Add to your PowerShell profile (`$PROFILE`):

```powershell
$env:GOOGLE_GENAI_API_KEY = "REPLACE_WITH_YOUR_ACTUAL_KEY"
$env:STITCH_API_KEY = "REPLACE_WITH_YOUR_ACTUAL_KEY"
```

To edit your profile:
```powershell
notepad $PROFILE
```

Reload your profile:
```powershell
. $PROFILE
```

#### For macOS/Linux (Bash/Zsh)

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

```bash
export GOOGLE_GENAI_API_KEY="REPLACE_WITH_YOUR_ACTUAL_KEY"
export STITCH_API_KEY="REPLACE_WITH_YOUR_ACTUAL_KEY"
```

Reload your profile:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Option B: Local .env Files (Development Only)

**⚠️ WARNING**: This method is less secure and should only be used for local development.

1. Copy the example file:
   ```bash
   cp .env.example frontend/.env
   ```

2. Edit `frontend/.env` and add your actual keys:
   ```
   VITE_GOOGLE_GENAI_API_KEY=your_actual_key_here
   VITE_STITCH_API_KEY=your_actual_key_here
   ```

3. **VERIFY** the file is ignored:
   ```bash
   git status
   ```
   You should NOT see `frontend/.env` in the list of changes.

### Option C: Google Secret Manager (Production - Recommended)

For production deployments, use Google Secret Manager:

1. Install Google Cloud SDK:
   ```bash
   # Follow instructions at https://cloud.google.com/sdk/docs/install
   ```

2. Create secrets:
   ```bash
   # Create secret for Google Generative AI API Key
   echo -n "your_actual_key" | gcloud secrets create google-genai-api-key \
     --data-file=- \
     --replication-policy="automatic"

   # Create secret for Stitch API Key
   echo -n "your_actual_key" | gcloud secrets create stitch-api-key \
     --data-file=- \
     --replication-policy="automatic"
   ```

3. Grant access to your service account:
   ```bash
   gcloud secrets add-iam-policy-binding google-genai-api-key \
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

4. Access secrets in your application:
   ```javascript
   const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
   const client = new SecretManagerServiceClient();

   async function getSecret(secretName) {
     const [version] = await client.accessSecretVersion({
       name: `projects/PROJECT_ID/secrets/${secretName}/versions/latest`,
     });
     return version.payload.data.toString();
   }
   ```

## Step 3: Verify Setup

### Test Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Check the console for any API key errors

### Test Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Run a test script:
   ```bash
   node test_models.js
   ```

3. Verify API calls are successful

## Step 4: Security Checklist

- [ ] API keys are stored securely (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] Pre-commit hooks are installed (`npm run prepare`)
- [ ] Environment variables are set in your shell profile OR Secret Manager
- [ ] Test that `git status` does NOT show `.env` files
- [ ] Old exposed keys have been revoked in Google Cloud Console

## Troubleshooting

### "API key not found" error

**Solution**: Verify environment variables are set:
```bash
# Windows PowerShell
echo $env:GOOGLE_GENAI_API_KEY

# macOS/Linux
echo $GOOGLE_GENAI_API_KEY
```

### ".env file is being tracked by git"

**Solution**: Remove from git cache:
```bash
git rm --cached frontend/.env
git commit -m "Remove .env from tracking"
```

### "Pre-commit hook blocking commit"

**Solution**: This is working as intended! The hook is preventing you from committing sensitive files. Remove the sensitive content before committing.

## Key Rotation

If your API keys are compromised:

1. **Immediately revoke** the old keys in Google Cloud Console
2. Generate new keys
3. Update environment variables or Secret Manager
4. Restart all services
5. Verify new keys are working

## Additional Resources

- [Google Cloud Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Environment Variables Best Practices](https://12factor.net/config)

## Support

For issues or questions:
- Check `SECURITY_REMEDIATION_GUIDE.md`
- Review `SECURITY_SETUP.md`
- Contact the security team

---

**Last Updated**: 2026-03-30
**Version**: 1.0.0