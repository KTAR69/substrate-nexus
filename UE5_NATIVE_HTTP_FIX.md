# UE5.7 Native HTTP Request Fix Guide

## Problem
The VaRest plugin is not supported in UE 5.7, causing malformed URLs in GET requests:
```
GET https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand agent_did=did:key:z6Mk...did:key:z6Mk...
```
Error: `libcurl error: 3 (URL using bad/illegal format or missing URL)`

## Root Cause
The Blueprint "Append" node is concatenating strings incorrectly, duplicating the DID and missing the `?` query parameter separator.

## Solution: Use Native UE5 HTTP Request

### Blueprint Implementation (Step-by-Step)

#### 1. Create HTTP Request Node
- Right-click in Blueprint → Search "Construct Http Request"
- This creates a proper HTTP request object

#### 2. Set Request URL (Properly Formatted)
Instead of using "Append" nodes, use **Format Text** node:

**Nodes to Add:**
1. **Format Text** node
2. Set Format to: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did={0}`
3. Connect your `Agent DID` variable to the `{0}` input

**Visual Flow:**
```
[Agent DID Variable] → [Format Text] → [Set URL] → [HTTP Request]
                         Format: "...?agent_did={0}"
```

#### 3. Configure HTTP Request
- **Method:** GET
- **URL:** Output from Format Text node
- **Headers:** (Optional) Add "Content-Type: application/json"

#### 4. Process Response Node
- Right-click → Search "Process Request"
- Connect to your HTTP Request object
- This fires the actual request

#### 5. Bind Response Events
The Process Request node has execution pins:
- **On Response Received:** Success path
- **On Request Complete:** Always fires (check status code)

### Complete Blueprint Example

```
Event Tick (with delay/timer)
    ↓
[Get Agent DID] → [Format Text] → [Construct Http Request]
                   "...?agent_did={0}"     ↓
                                    [Set URL]
                                           ↓
                                    [Set Verb] = "GET"
                                           ↓
                                    [Process Request]
                                           ↓
                        ┌──────────────────┴──────────────────┐
                        ↓                                      ↓
            [On Response Received]              [On Request Complete]
                        ↓                                      ↓
            [Get Response Code]                    [Branch: Success?]
                        ↓
            [Branch: == 200?]
                        ↓
            [Get Content As String]
                        ↓
            [Parse JSON] → [Extract "command" field]
                        ↓
            [Execute Command Logic]
```

### Key Nodes Reference

| Node Name | Purpose | Location |
|-----------|---------|----------|
| **Construct Http Request** | Creates HTTP request object | Search: "Construct Http" |
| **Format Text** | Safely formats URL with parameters | Search: "Format Text" |
| **Set URL** | Sets request URL | Right-click HTTP Request → Set URL |
| **Set Verb** | Sets HTTP method (GET/POST) | Right-click HTTP Request → Set Verb |
| **Process Request** | Fires the HTTP request | Right-click HTTP Request → Process |
| **Get Response Code** | Gets HTTP status (200, 400, etc.) | Right-click Response → Get Response Code |
| **Get Content As String** | Gets response body as string | Right-click Response → Get Content As String |

### Example Values

**Base URL:**
```
https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand
```

**Format Text Pattern:**
```
{BaseURL}?agent_did={0}
```

**Expected Final URL:**
```
https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkqW8pJHyNGy7VHjVGcJGGGvPEVy8Vz8pJHyNGy7VHjVGcJG
```

### Response Parsing

The Firebase function returns JSON:
```json
{
  "success": true,
  "command": "MOVE:100,200,50",
  "command_id": "abc123",
  "priority": 0,
  "source": "nim"
}
```

**Parse in Blueprint:**
1. Get Content As String
2. Use "Get Json Field" or "Parse JSON" node
3. Extract "command" field
4. Execute command logic

### Polling Best Practices

**Recommended Polling Interval:** 2-5 seconds

**Implementation:**
```
Event BeginPlay
    ↓
[Set Timer by Event] → [Poll Commands]
    Looping: True
    Time: 3.0 seconds
```

**Inside Poll Commands Function:**
- Check if agent is active
- Construct and fire HTTP GET request
- Parse response
- Execute command if present

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `libcurl error: 3` | Malformed URL | Use Format Text, not Append |
| `HTTP 400` | Missing/invalid agent_did | Check DID format (must start with "did:key:") |
| `HTTP 404` | Wrong URL | Verify Firebase function URL |
| No response | Network timeout | Check internet connection, increase timeout |
| Duplicate DID in URL | Append node concatenation | Replace with Format Text |

### Testing the Fix

1. **Print the URL** before sending:
   - Add "Print String" node after Format Text
   - Verify format: `...?agent_did=did:key:...`

2. **Check Response Code:**
   - Print response code (should be 200)
   - If 400: Check payload format
   - If 404: Check URL

3. **Log Response Body:**
   - Print "Get Content As String" output
   - Verify JSON structure

### Migration from VaRest

If you have existing VaRest nodes:

| VaRest Node | Native UE5 Equivalent |
|-------------|----------------------|
| Construct Json Request | Construct Http Request |
| Apply URL | Set URL |
| Set Verb | Set Verb |
| Process URL | Process Request |
| Get Response Code | Get Response Code |
| Get Response Content As String | Get Content As String |

### Performance Notes

- Native HTTP requests are **faster** than VaRest
- No plugin overhead
- Better memory management
- Supported in all UE5 versions

### Additional Resources

**UE5 Documentation:**
- HTTP Module: `Engine/Source/Runtime/Online/HTTP/Public/HttpModule.h`
- HTTP Request Interface: `IHttpRequest`

**Blueprint Categories:**
- Search: "Http" to find all HTTP nodes
- Search: "Format" for text formatting
- Search: "Json" for JSON parsing

---

## Summary

✅ **DO:**
- Use **Format Text** for URL construction
- Use **Construct Http Request** for native requests
- Check response codes before parsing
- Add error handling for network failures

❌ **DON'T:**
- Use "Append" for URLs with query parameters
- Assume requests always succeed
- Parse responses without checking status code
- Use VaRest in UE 5.7+

---

**Next Steps:**
1. Replace VaRest nodes with native HTTP nodes
2. Test URL formatting with Print String
3. Verify response parsing
4. Deploy and test end-to-end