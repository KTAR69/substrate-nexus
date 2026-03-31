# Backend Environment Configuration

## Overview

The backend server has been successfully configured to load environment variables from the root `.env` file. This document describes the configuration and required environment variables.

## Configuration Changes

### 1. Environment File Location
- **File**: `.env` (root directory)
- **Path**: `c:/Users/owlta/.gemini/antigravity/playground/velvet-cosmic/.env`
- **Status**: ✅ Created and configured

### 2. Backend dotenv Configuration
- **File**: `backend/index.js`
- **Change**: Updated dotenv path from `../env` to use `path.join(__dirname, '..', '.env')`
- **Reason**: Ensures consistent path resolution across different operating systems

## Required Environment Variables

The backend requires the following environment variables:

### Core Configuration
```bash
# Substrate Blockchain Connection
SUBSTRATE_RPC_URL=ws://127.0.0.1:9944

# Google Generative AI
GOOGLE_GENAI_API_KEY=your-google-genai-api-key-here

# Google Cloud KMS (Key Management Service)
KMS_KEY_NAME=projects/your-project/locations/global/keyRings/your-ring/cryptoKeys/your-key/cryptoKeyVersions/1
KMS_STUB_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

### Development Simulation Flags
For local development without external services:
```bash
SIMULATE_KMS=true          # Use mock KMS client instead of Google Cloud KMS
SIMULATE_AI=true           # Bypass AI generation, return mock responses
SIMULATE_SUBSTRATE=true    # Use mock Substrate node instead of real connection
```

### Optional Configuration
```bash
# Firebase (if needed)
FIREBASE_PROJECT_ID=your-project-id

# Google Stitch (if needed)
STITCH_API_KEY=your-stitch-api-key-here
STITCH_PROJECT_ID=your-stitch-project-id
```

## Environment Variables Usage in Backend

### 1. Google Generative AI (`GOOGLE_GENAI_API_KEY`)
- **Used in**: `backend/index.js` line 12
- **Purpose**: Initialize Genkit AI with Google AI plugin
- **Required**: Yes (unless `SIMULATE_AI=true`)

### 2. KMS Configuration (`KMS_KEY_NAME`, `SIMULATE_KMS`)
- **Used in**: `backend/index.js` lines 19-30
- **Purpose**: Hardware-secured transaction signing via Google Cloud KMS
- **Required**: Yes for production, optional for development with simulation

### 3. Substrate RPC (`SUBSTRATE_RPC_URL`, `SIMULATE_SUBSTRATE`)
- **Used in**: `backend/index.js` line 159
- **Purpose**: Connect to Substrate blockchain node
- **Default**: `ws://127.0.0.1:9944`
- **Required**: Yes for production, optional for development with simulation

### 4. KMS Stub Address (`KMS_STUB_ADDRESS`)
- **Used in**: `backend/index.js` line 169
- **Purpose**: Fallback address for local simulation
- **Default**: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (Alice's address)

## Security Considerations

### ✅ Security Measures in Place
1. **`.env` file is gitignored** - Protected by:
   - Root `.gitignore`
   - Backend `.gitignore`
   - Pre-commit hooks
   
2. **Simulation mode for development** - Allows local testing without real API keys

3. **Environment variable validation** - Backend checks for required variables at startup

### ⚠️ Important Security Notes

1. **NEVER commit `.env` files to git**
2. **Rotate API keys immediately if exposed**
3. **Use Google Secret Manager for production**
4. **Keep simulation flags disabled in production**

## Testing the Configuration

### Verify Environment Variables are Loaded
```powershell
cd backend
node index.js
```

**Expected Output:**
```
[dotenv@17.2.4] injecting env (10) from ..\.env
[Simulation] Using Mock KMS Client.
```

### Check Specific Variables
```powershell
# Windows PowerShell
$env:GOOGLE_GENAI_API_KEY
$env:SIMULATE_KMS

# Linux/macOS
echo $GOOGLE_GENAI_API_KEY
echo $SIMULATE_KMS
```

## Troubleshooting

### Issue: "Cannot find module 'dotenv'"
**Solution**: Install dependencies
```bash
cd backend
npm install
```

### Issue: Environment variables not loading
**Solution**: Verify `.env` file exists in root directory
```bash
# Check if file exists
Test-Path .env

# View file location
Get-Item .env
```

### Issue: "API key not found" errors
**Solution**: 
1. Check `.env` file has correct variable names
2. Verify no extra spaces around `=` signs
3. Ensure file is saved with UTF-8 encoding

## Production Deployment

For production environments:

1. **Disable simulation flags**:
   ```bash
   # Remove or comment out these lines in .env
   # SIMULATE_KMS=true
   # SIMULATE_AI=true
   # SIMULATE_SUBSTRATE=true
   ```

2. **Use Google Secret Manager**:
   - Store sensitive keys in Secret Manager
   - Configure service account access
   - Update backend to fetch from Secret Manager

3. **Set real API keys**:
   - Obtain production API keys from Google Cloud Console
   - Configure KMS with real key names
   - Set up production Substrate RPC endpoint

## Related Documentation

- `ENVIRONMENT_SETUP.md` - Detailed setup instructions
- `SECURITY_SETUP.md` - Security best practices
- `SECURITY_REMEDIATION_GUIDE.md` - Security remediation steps
- `.env.example` - Template for environment variables

---

**Last Updated**: 2026-03-30  
**Status**: ✅ Backend environment configured and tested  
**Version**: 1.0.0