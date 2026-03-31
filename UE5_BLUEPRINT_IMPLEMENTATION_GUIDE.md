# UE5 Blueprint Implementation Guide
## NexusHub_TexasRoot - HIGH Priority Tasks

**Version**: 1.0.0  
**Date**: 2026-03-31  
**Author**: Gemini Tactical (Lead Agent)

---

## Table of Contents

1. [Task 1: Complete BP_Byte Telemetry Wiring](#task-1-complete-bp_byte-telemetry-wiring)
2. [Task 2: Build PollCommandQueue Blueprint](#task-2-build-pollcommandqueue-blueprint)
3. [Task 3: Fix BP_ObservatoryBrain_C URL](#task-3-fix-bp_observatorybrain_c-url)
4. [Testing & Verification](#testing--verification)

---

## Task 1: Complete BP_Byte Telemetry Wiring

### Overview
Wire the `EmitPhysicalAcknowledgmentVCon` node in BP_Byte to send telemetry heartbeats to the Firebase vconIngest endpoint, following the same pattern as BP_Giga.

### Agent Information
- **Agent Name**: Byte
- **DID**: `did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ`
- **Component Type**: CharacterMovement (same as BP_Giga)

### Prerequisites
- BP_Giga telemetry is already working (reference implementation)
- vconIngest endpoint: `https://vconingest-24qs4mpmsq-uc.a.run.app`

### Step-by-Step Implementation

#### Step 1: Open BP_Byte Blueprint
1. In Unreal Engine, navigate to Content Browser
2. Find and open `BP_Byte` Blueprint
3. Switch to Event Graph

#### Step 2: Locate or Create Telemetry Event
1. Look for existing telemetry setup (may be partially implemented)
2. If not present, create a new Custom Event called `EmitTelemetry`

#### Step 3: Add Timer for Periodic Heartbeats
```
Event BeginPlay
  ↓
Set Timer by Event
  - Event: EmitTelemetry
  - Time: 10.0 (seconds)
  - Looping: TRUE
```

#### Step 4: Wire EmitPhysicalAcknowledgmentVCon Node

**Node Configuration**:
```
EmitTelemetry (Custom Event)
  ↓
Get Character Movement Component
  ↓
Get Velocity
  ↓
Vector Length (to get speed)
  ↓
EmitPhysicalAcknowledgmentVCon
  - agent_did: "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ"
  - agent_name: "Byte"
  - event_type: "heartbeat"
  - speed: [velocity magnitude]
  - location: [actor location]
  - rotation: [actor rotation]
  - endpoint: "https://vconingest-24qs4mpmsq-uc.a.run.app"
```

#### Step 5: Add HTTP Request Node

**HTTP POST Configuration**:
```
EmitPhysicalAcknowledgmentVCon
  ↓
Make JSON Object
  - did: agent_did
  - name: agent_name
  - event_type: event_type
  - timestamp: [current UTC timestamp]
  - data:
    - speed: speed
    - location: {x, y, z}
    - rotation: {pitch, yaw, roll}
  ↓
HTTP Request (POST)
  - URL: endpoint
  - Verb: POST
  - Content-Type: application/json
  - Body: [JSON string]
  ↓
On Response Received
  - Print String: "Byte telemetry sent: HTTP {response_code}"
```

#### Step 6: Error Handling
```
On Response Received
  ↓
Branch (response_code == 200)
  - True: Print "✓ Byte heartbeat successful"
  - False: Print "✗ Byte heartbeat failed: {response_code}"
```

### Reference: BP_Giga Implementation
Use BP_Giga as a reference - it has the same CharacterMovement component pattern and is already working with HTTP 200 responses.

### Expected Output
- Console log every 10 seconds: "Byte telemetry sent: HTTP 200"
- Firestore `event_stream` collection receives vCon documents with Byte's DID

---

## Task 2: Build PollCommandQueue Blueprint

### Overview
Create a new Blueprint component that polls the `getLatestCommand` Firebase endpoint every 3 seconds to retrieve AI-generated commands for each agent.

### Endpoint Information
- **URL**: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app`
- **Method**: GET
- **Query Parameter**: `did={agent_did}`
- **Response Format**: JSON
  ```json
  {
    "action": "move_to_waypoint",
    "agent_msg": "Proceed to coordinates X:100, Y:200",
    "priority": 0,
    "timestamp": "2026-03-31T02:00:00Z"
  }
  ```

### Step-by-Step Implementation

#### Step 1: Create Actor Component
1. Content Browser → Right-click → Blueprint Class
2. Select "Actor Component"
3. Name: `AC_CommandQueuePoller`
4. Open the Blueprint

#### Step 2: Add Component Variables

**Variables to Create**:
```
- agent_did (String): The DID of the agent using this component
- polling_interval (Float): 3.0 (seconds)
- endpoint_url (String): "https://getlatestcommand-24qs4mpmsq-uc.a.run.app"
- last_command_timestamp (String): "" (to avoid processing duplicates)
```

#### Step 3: Setup Polling Timer

**Event Graph**:
```
Event BeginPlay
  ↓
Validate agent_did is not empty
  ↓
Set Timer by Function Name
  - Function Name: PollCommandQueue
  - Time: polling_interval
  - Looping: TRUE
```

#### Step 4: Implement PollCommandQueue Function

**Function: PollCommandQueue**
```
PollCommandQueue (Custom Function)
  ↓
Format String: "{endpoint_url}?did={agent_did}"
  ↓
HTTP Request (GET)
  - URL: [formatted URL]
  - Verb: GET
  - Content-Type: application/json
  ↓
On Response Received
  ↓
Branch (response_code == 200)
  - True: Parse JSON Response
  - False: Print "Command poll failed: {response_code}"
```

#### Step 5: Parse JSON Response

**JSON Parsing**:
```
Parse JSON Response
  ↓
Get JSON Field: "action"
Get JSON Field: "agent_msg"
Get JSON Field: "priority"
Get JSON Field: "timestamp"
  ↓
Branch (timestamp != last_command_timestamp)
  - True: Process New Command
  - False: Ignore (already processed)
```

#### Step 6: Command Routing with Switch

**Switch on Action String**:
```
Process New Command
  ↓
Switch on String (action)
  ↓
Case "move_to_waypoint":
  - Parse coordinates from agent_msg
  - Call MoveToLocation function
  ↓
Case "patrol_area":
  - Parse area bounds from agent_msg
  - Call StartPatrol function
  ↓
Case "return_to_base":
  - Call ReturnToBase function
  ↓
Case "idle":
  - Call StopMovement function
  ↓
Default:
  - Print "Unknown action: {action}"
```

#### Step 7: Update Last Command Timestamp
```
After Processing Command
  ↓
Set last_command_timestamp = timestamp
  ↓
Print String: "✓ Command executed: {action} (priority: {priority})"
```

### Integration with Agents

**Add to BP_Byte**:
1. Open BP_Byte Blueprint
2. Components panel → Add Component → AC_CommandQueuePoller
3. Details panel → Set agent_did: `did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ`

**Add to BP_Giga**:
1. Open BP_Giga Blueprint
2. Components panel → Add Component → AC_CommandQueuePoller
3. Details panel → Set agent_did: `did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX`

**Add to BP_OffRoadSDV**:
1. Open BP_OffRoadSDV Blueprint
2. Components panel → Add Component → AC_CommandQueuePoller
3. Details panel → Set agent_did: `did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy`

### Command Implementation Functions

**Create these functions in each agent Blueprint**:

**MoveToLocation(Vector TargetLocation)**:
```
MoveToLocation
  ↓
AI Move To (or Simple Move To Location)
  - Target Location: TargetLocation
  - Acceptance Radius: 100.0
```

**StartPatrol(Array<Vector> PatrolPoints)**:
```
StartPatrol
  ↓
Set patrol_points array
  ↓
Set current_patrol_index = 0
  ↓
Call MoveToLocation(patrol_points[0])
  ↓
On Move Completed:
  - Increment current_patrol_index
  - Loop back to start if at end
```

**ReturnToBase()**:
```
ReturnToBase
  ↓
Get base_location (predefined spawn point)
  ↓
Call MoveToLocation(base_location)
```

**StopMovement()**:
```
StopMovement
  ↓
Stop Movement Immediately
  ↓
Set velocity to zero
```

---

## Task 3: Fix BP_ObservatoryBrain_C URL

### Overview
Update the HTTP POST URL in BP_ObservatoryBrain_C from localhost to the deployed Cloud Run endpoint.

### Current Issue
- **Current URL**: `localhost:5000/observatory_feed`
- **Correct URL**: `https://observatoryfeed-24qs4mpmsq-uc.a.run.app`

### Step-by-Step Implementation

#### Step 1: Locate BP_ObservatoryBrain_C
1. Content Browser → Search for "ObservatoryBrain"
2. Open `BP_ObservatoryBrain_C` Blueprint
3. Switch to Event Graph

#### Step 2: Find HTTP Request Node
1. Look for HTTP Request node (likely in a telemetry or data upload function)
2. The node should currently have URL set to `localhost:5000/observatory_feed`

#### Step 3: Update URL
1. Select the HTTP Request node
2. In Details panel, find "URL" property
3. Change from: `localhost:5000/observatory_feed`
4. Change to: `https://observatoryfeed-24qs4mpmsq-uc.a.run.app`

#### Step 4: Verify HTTP Method
Ensure the HTTP Request is configured as:
- **Verb**: POST
- **Content-Type**: application/json
- **Body**: [JSON payload with observatory data]

#### Step 5: Add Response Logging
```
HTTP Request (POST)
  ↓
On Response Received
  ↓
Print String: "Observatory feed sent: HTTP {response_code}"
  ↓
Branch (response_code == 200)
  - True: Print "✓ Observatory data uploaded"
  - False: Print "✗ Observatory upload failed: {response_code}"
```

### Expected Payload Format
```json
{
  "timestamp": "2026-03-31T02:00:00Z",
  "observatory_id": "nexushub_observatory_01",
  "data": {
    "agent_count": 3,
    "active_commands": 5,
    "system_health": "operational",
    "metrics": {
      "cpu_usage": 45.2,
      "memory_usage": 62.8,
      "network_latency": 23
    }
  }
}
```

---

## Testing & Verification

### Test 1: BP_Byte Telemetry
**Expected Behavior**:
1. Start Play in Editor (PIE)
2. Console shows: "Byte telemetry sent: HTTP 200" every 10 seconds
3. Check Firestore `event_stream` collection for Byte's DID documents

**Verification**:
```
Firestore Query:
  Collection: event_stream
  Where: did == "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ"
  Order by: timestamp DESC
  Limit: 1
```

### Test 2: PollCommandQueue
**Expected Behavior**:
1. Start PIE with all agents
2. Console shows: "Command poll" messages every 3 seconds
3. When NIM generates a command, agent executes it
4. Console shows: "✓ Command executed: {action}"

**Manual Test**:
1. Manually add a command to Firestore `command_queue`:
   ```json
   {
     "did": "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ",
     "action": "move_to_waypoint",
     "agent_msg": "Move to X:1000, Y:2000, Z:100",
     "priority": 1,
     "timestamp": "2026-03-31T02:30:00Z"
   }
   ```
2. Within 3 seconds, Byte should start moving to the waypoint

### Test 3: Observatory URL Fix
**Expected Behavior**:
1. Start PIE
2. Observatory sends data periodically
3. Console shows: "Observatory feed sent: HTTP 200"
4. No more localhost connection errors

**Verification**:
```
Firestore Query:
  Collection: observatory_feed
  Order by: timestamp DESC
  Limit: 1
```

### Integration Test: End-to-End AI-RAN Pipeline
**Full Pipeline Test**:
1. Start PIE with all agents
2. Agents emit telemetry → vconIngest → Firestore `event_stream`
3. Firestore trigger → nimRouter → NVIDIA NIM (Llama 3.1 70B)
4. NIM generates command → Firestore `command_queue`
5. Agent polls → getLatestCommand → receives command
6. Agent executes command → emits acknowledgment telemetry
7. Cycle repeats

**Success Criteria**:
- ✅ All agents sending telemetry (HTTP 200)
- ✅ All agents polling commands (HTTP 200)
- ✅ Commands appear in Firestore within 30 seconds of telemetry
- ✅ Agents execute commands correctly
- ✅ Observatory data uploading (HTTP 200)

---

## Troubleshooting

### Issue: HTTP 404 on Command Poll
**Cause**: Incorrect endpoint URL or missing DID parameter  
**Solution**: Verify URL format: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app?did={agent_did}`

### Issue: Commands Not Executing
**Cause**: Timestamp comparison preventing execution  
**Solution**: Clear `last_command_timestamp` variable or check timestamp format

### Issue: Telemetry Not Reaching Firestore
**Cause**: JSON formatting error or incorrect DID format  
**Solution**: Verify DID includes full `did:key:` prefix and colons are preserved

### Issue: Observatory Still Using Localhost
**Cause**: Multiple HTTP Request nodes, wrong one updated  
**Solution**: Search for all HTTP Request nodes in BP_ObservatoryBrain_C, update all instances

---

## Next Steps After Completion

1. **Verify All Tests Pass** - Run integration test suite
2. **Update Documentation** - Mark tasks as complete in roadmap
3. **Queue Medium Priority Tasks**:
   - Wire BP_OffRoadSDV telemetry (Chaos Vehicle pattern)
   - Implement priority field in command queue (Jules task)
   - Add passenger DID routing for SDV (Jules + Claude coordination)
4. **Begin Mobile App Development** - Route to Chirp agent

---

## Reference Information

### Agent DIDs
- **Byte**: `did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ`
- **Giga**: `did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX`
- **OffRoadSDV**: `did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy`

### Firebase Endpoints
- **vconIngest**: `https://vconingest-24qs4mpmsq-uc.a.run.app`
- **nimRouter**: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter`
- **getLatestCommand**: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app`
- **observatoryFeed**: `https://observatoryfeed-24qs4mpmsq-uc.a.run.app`

### Firestore Collections
- `event_stream`: vCon telemetry documents
- `command_queue`: AI-generated commands
- `nim_log`: NVIDIA NIM inference logs
- `metabolic_state`: Agent health snapshots
- `observatory_feed`: System metrics

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-03-31T02:15:00Z  
**Maintained By**: Gemini Tactical (Lead Agent)