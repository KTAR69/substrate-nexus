# Security Remediation Guide

**URGENT:** This guide provides step-by-step instructions to remediate the critical security issues found in the security audit.

---

## 🔴 CRITICAL: Exposed API Keys (IMMEDIATE ACTION REQUIRED)

### Step 1: Revoke Exposed API Keys

#### Google Stitch API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project: `substrate-nexus-9182`
3. Go to **APIs & Services** → **Credentials**
4. Find the exposed API key (format: `AQ.Ab8RN6K2...`) [ALREADY REVOKED]
5. Click **Delete** or **Restrict** to revoke access
6. Generate a new API key with proper restrictions

#### Google Genai API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Find the exposed API key (format: `AIzaSy...`) [ALREADY REVOKED]
3. Click **Delete** to revoke the key
4. Generate a new API key

**NOTE:** The original exposed keys have been revoked and are not shown here for security reasons.

### Step 2: Remove .env from Git History

**WARNING:** This will rewrite git history. Coordinate with your team before proceeding.

```bash
# Backup your repository first
git clone --mirror <your-repo-url> backup-repo

# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags

# Clean up local repository
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Alternative (Recommended):** Use BFG Repo-Cleaner for safer history rewriting:
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror <your-repo-url>

# Remove .env file
java -jar bfg.jar --delete-files .env <your-repo>.git

# Clean up and push
cd <your-repo>.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push
```

### Step 3: Update Local Environment

```bash
# Delete the exposed .env file
rm .env

# Copy the template
cp .env.example .env

# Edit .env with your NEW API keys
# Use a text editor to add the new keys
```

### Step 4: Implement Secret Management

#### Option A: Use Environment Variables (Development)
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GOOGLE_GENAI_API_KEY="REPLACE_WITH_YOUR_ACTUAL_KEY"
export STITCH_API_KEY="REPLACE_WITH_YOUR_ACTUAL_KEY"
```

#### Option B: Use Google Secret Manager (Production - Recommended)
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Create secrets
gcloud secrets create google-genai-api-key --data-file=- <<< "your-new-key"
gcloud secrets create stitch-api-key --data-file=- <<< "your-new-key"

# Grant access to your service account
gcloud secrets add-iam-policy-binding google-genai-api-key \
  --member="serviceAccount:your-service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Update your backend code to use Secret Manager:
```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });
  return version.payload.data.toString();
}

// Usage
const apiKey = await getSecret('google-genai-api-key');
```

### Step 5: Verify .gitignore

Confirm `.env` is in `.gitignore`:
```bash
grep "^\.env$" .gitignore
```

If not present, add it:
```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

---

## ⚠️ HIGH PRIORITY: Fix npm Vulnerabilities

### Frontend Vulnerabilities

```bash
cd frontend

# Review what will be updated
npm audit

# Option 1: Safe updates (may not fix all issues)
npm audit fix

# Option 2: Force updates (may introduce breaking changes)
# IMPORTANT: Test thoroughly after this command
npm audit fix --force

# Verify the application still works
npm run dev
# Test all functionality

# If issues occur, restore from backup:
git checkout package.json package-lock.json
npm install
```

**Expected Changes:**
- vite: upgrade to 8.0.3 (breaking change)
- undici: upgrade to latest secure version
- Firebase packages: upgrade to compatible versions

**Testing Checklist:**
- [ ] Application builds successfully
- [ ] Development server starts
- [ ] All pages load correctly
- [ ] Firebase integration works
- [ ] No console errors

### Backend Vulnerabilities

```bash
cd backend

# Review what will be updated
npm audit

# Option 1: Safe updates
npm audit fix

# Option 2: Force updates (may introduce breaking changes)
# IMPORTANT: Test thoroughly after this command
npm audit fix --force

# Verify the application still works
npm test
# Test all API endpoints

# If issues occur, restore from backup:
git checkout package.json package-lock.json
npm install
```

**Expected Changes:**
- firebase-admin: upgrade to 10.3.0 (breaking change)
- @tootallnate/once: upgrade to 3.0.1+
- Google Cloud packages: upgrade to latest

**Testing Checklist:**
- [ ] Backend starts successfully
- [ ] Firebase Admin SDK works
- [ ] Google Cloud KMS integration works
- [ ] Genkit AI flows work
- [ ] Substrate connection works

---

## 📋 Verification Checklist

After completing all remediation steps:

### Critical Issues
- [ ] Old API keys have been revoked
- [ ] New API keys have been generated
- [ ] .env file has been removed from git history
- [ ] New .env file created with new keys (not committed)
- [ ] Secret management system implemented

### High Priority Issues
- [ ] Frontend npm vulnerabilities fixed
- [ ] Backend npm vulnerabilities fixed
- [ ] All tests pass
- [ ] Application functionality verified

### Documentation
- [ ] Team notified of API key rotation
- [ ] Secret management process documented
- [ ] Incident logged for future reference

### Prevention
- [ ] .env.example created and committed
- [ ] .gitignore verified
- [ ] Pre-commit hooks active (Husky)
- [ ] Team trained on secret management

---

## 🔒 Secret Management Best Practices

### DO:
✅ Use environment variables for secrets  
✅ Use secret management systems (Google Secret Manager, AWS Secrets Manager)  
✅ Rotate secrets regularly (every 90 days)  
✅ Use different secrets for dev/staging/production  
✅ Restrict API key permissions to minimum required  
✅ Monitor API key usage for anomalies  
✅ Use .env.example as a template  
✅ Add .env to .gitignore  

### DON'T:
❌ Commit secrets to version control  
❌ Share secrets via email or chat  
❌ Use the same secrets across environments  
❌ Give API keys more permissions than needed  
❌ Store secrets in code comments  
❌ Log secrets in application logs  
❌ Share .env files directly  

---

## 🆘 Emergency Contacts

If you suspect a security breach:

1. **Immediately revoke all API keys**
2. **Notify your security team**
3. **Check access logs for unauthorized usage**
4. **Rotate all credentials**
5. **Document the incident**

### Google Cloud Security
- [Google Cloud Security Command Center](https://console.cloud.google.com/security)
- [Google Cloud Support](https://cloud.google.com/support)

### GitHub Security
- [GitHub Security Advisories](https://github.com/advisories)
- [GitHub Support](https://support.github.com/)

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Substrate Security Best Practices](https://docs.substrate.io/build/troubleshoot-your-code/)

---

**Last Updated:** 2026-03-30  
**Next Review:** After critical issues are resolved