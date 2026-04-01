# IETF vCon Format - Quick Reference

## Overview
UVConEmitter sends telemetry in **IETF vCon (Virtual Conversation)** format, which is a standardized format for conversation/interaction data.

---

## Actual Payload Structure

### What UVConEmitter Sends:
```json
{
  "document": {
    "vcon": "0.0.1",
    "created_at": "2026-04-01T01:26:56.980Z",
    "parties": [
      {
        "name": "Byte",
        "did": "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ"
      }
    ]
  }
}
```

### Key Fields:
- **`vcon`**: Version of the vCon specification (e.g., "0.0.1")
- **`created_at`**: ISO 8601 timestamp of when the vCon was created
- **`parties`**: Array of participants in the conversation/interaction
  - **`parties[0].name`**: Agent name (e.g., "Byte", "Giga")
  - **`parties[0].did`**: Decentralized Identifier (DID) of the agent

---

## Extraction Logic

### Updated `vconIngest` Mapping:
```javascript
const normalizedData = {
    // Extract from IETF vCon nested structure
    agent_did: vconData.parties?.[0]?.did  // Primary: IETF vCon format
        || vconData.agent_did              // Fallback: flat format
        || vconData.agentDid
        || vconData.AgentDID
        || vconData['Source DID']
        || vconData.sourceDid
        || vconData.source_did
        || vconData.did
        || vconData.DID,
    
    // Extract from IETF vCon created_at field
    timestamp: vconData.created_at         // Primary: IETF vCon format
        || vconData.timestamp              // Fallback: flat format
        || vconData.Timestamp
        || vconData.time
        || vconData.Time
        || vconData.createdAt
        || new Date().toISOString(),
    
    // Preserve all other fields
    ...vconData
};
```

### Safe Navigation:
- Uses optional chaining (`?.`) to safely access nested properties
- `parties?.[0]?.did` won't throw error if `parties` is undefined or empty
- Falls back to legacy field names if vCon structure not present

---

## IETF vCon Specification

### Standard Fields:
- **`vcon`** (string): Version identifier
- **`uuid`** (string, optional): Unique identifier for this vCon
- **`created_at`** (string): ISO 8601 timestamp
- **`updated_at`** (string, optional): Last update timestamp
- **`subject`** (string, optional): Subject/topic of the conversation
- **`parties`** (array): Participants in the conversation
- **`dialog`** (array, optional): Conversation turns/messages
- **`analysis`** (array, optional): Analysis results
- **`attachments`** (array, optional): Related files/media

### Parties Array Structure:
```json
{
  "parties": [
    {
      "tel": "+1-555-1234",           // Phone number (optional)
      "mailto": "user@example.com",   // Email (optional)
      "name": "Agent Name",           // Display name (optional)
      "did": "did:key:z6Mk...",       // Decentralized ID (optional)
      "validation": "...",            // Validation info (optional)
      "gmlpos": "...",                // Geographic position (optional)
      "civicaddress": "...",          // Civic address (optional)
      "timezone": "America/Chicago",  // Timezone (optional)
      "role": "agent"                 // Role in conversation (optional)
    }
  ]
}
```

---

## Why This Format?

### Benefits of IETF vCon:
1. **Standardized**: Industry-standard format for conversation data
2. **Extensible**: Can add custom fields while maintaining compatibility
3. **Interoperable**: Works across different systems and platforms
4. **Decentralized**: Supports DIDs for identity management
5. **Timestamped**: Built-in temporal tracking with `created_at`

### Use Cases:
- Call/conversation recording and analysis
- Multi-party interaction tracking
- Compliance and audit trails
- AI training data collection
- Decentralized identity verification

---

## Firebase Storage

### What Gets Stored in Firestore:
```javascript
{
  agent_did: "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ",
  timestamp: "2026-04-01T01:26:56.980Z",
  vcon: "0.0.1",
  parties: [
    {
      name: "Byte",
      did: "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ"
    }
  ],
  ingested_at: Timestamp,  // Firebase server timestamp
  raw_payload: { ... }     // Original MongoDB Atlas wrapped payload
}
```

### Normalized Fields:
- **`agent_did`**: Extracted from `parties[0].did`
- **`timestamp`**: Extracted from `created_at`
- **`vcon`**: Preserved from original
- **`parties`**: Preserved from original
- **`ingested_at`**: Added by Firebase
- **`raw_payload`**: Original request body for debugging

---

## Testing

### Test Payload (MongoDB Atlas Wrapped):
```json
{
  "document": {
    "vcon": "0.0.1",
    "created_at": "2026-04-01T02:00:00Z",
    "parties": [
      {
        "name": "Byte",
        "did": "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ"
      }
    ]
  }
}
```

### Expected Normalization:
```javascript
{
  agent_did: "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ",
  timestamp: "2026-04-01T02:00:00Z",
  vcon: "0.0.1",
  parties: [...]
}
```

### Firebase Logs:
```
[vconIngest] Raw payload: { "document": { "vcon": "0.0.1", ... } }
[vconIngest] Detected MongoDB Atlas format, unwrapping document field
[vconIngest] Normalized data: {
  agent_did: "did:key:z6Mk...",
  timestamp: "2026-04-01T02:00:00Z",
  vcon_version: "0.0.1",
  party_name: "Byte"
}
[vconIngest] ✅ Stored event: abc123 for agent: did:key:z6Mk...
```

---

## Troubleshooting

### Issue: HTTP 400 - Missing agent_did

**Possible Causes:**
1. `parties` array is empty
2. `parties[0]` doesn't have `did` field
3. Payload structure is different than expected

**Solution:**
Check Firebase logs for:
```
[vconIngest] Parties array: [...]
```

If structure is different, add new extraction path to mapping.

### Issue: Wrong agent extracted

**Cause:** Multiple parties in array, wrong index used.

**Solution:**
Update extraction logic to find correct party:
```javascript
agent_did: vconData.parties?.find(p => p.role === 'agent')?.did
    || vconData.parties?.[0]?.did
    || ...
```

---

## References

- **IETF vCon Specification**: [RFC Draft](https://datatracker.ietf.org/doc/draft-ietf-vcon/)
- **Decentralized Identifiers (DIDs)**: [W3C Spec](https://www.w3.org/TR/did-core/)
- **ISO 8601 Timestamps**: [Wikipedia](https://en.wikipedia.org/wiki/ISO_8601)

---

## Summary

✅ **IETF vCon format detected** - UVConEmitter sends standardized conversation data  
✅ **Nested extraction** - `parties[0].did` and `created_at` correctly mapped  
✅ **Backward compatible** - Falls back to legacy field names if needed  
✅ **Safe navigation** - Optional chaining prevents errors on missing fields  
✅ **Full preservation** - All vCon fields stored in Firestore  

**The backend now correctly handles IETF vCon format!** 🎉