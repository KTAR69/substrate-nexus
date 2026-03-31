# UE5 Blueprint Quick Reference Card
## NexusHub_TexasRoot - Immediate Actions

---

## 🚀 Task 1: BP_Byte Telemetry (10 minutes)

**Open**: BP_Byte Blueprint → Event Graph

**Add Timer**:
```
BeginPlay → Set Timer by Event
  Event: EmitTelemetry
  Time: 10.0
  Looping: TRUE
```

**Wire Telemetry**:
```
EmitTelemetry → Get Character Movement → Get Velocity → Vector Length
  ↓
HTTP POST to: https://vconingest-24qs4mpmsq-uc.a.run.app
  Body: {
    "did": "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ",
    "name": "Byte",
    "event_type": "heartbeat",
    "timestamp": [UTC now],
    "data": { "speed": [velocity], "location": [xyz], "rotation": [pyr] }
  }
```

**Test**: Console should show "HTTP 200" every 10 seconds

---

## 🎯 Task 2: PollCommandQueue Component (30 minutes)

**Create**: New Actor Component → `AC_CommandQueuePoller`

**Variables**:
- `agent_did` (String)
- `polling_interval` (Float) = 3.0
- `endpoint_url` (String) = "https://getlatestcommand-24qs4mpmsq-uc.a.run.app"

**Logic**:
```
BeginPlay → Set Timer (3s loop) → PollCommandQueue
  ↓
HTTP GET: {endpoint_url}?did={agent_did}
  ↓
Parse JSON → Switch on "action" field
  - "move_to_waypoint" → MoveToLocation
  - "patrol_area" → StartPatrol
  - "return_to_base" → ReturnToBase
  - "idle" → StopMovement
```

**Add to Agents**:
1. BP_Byte → Add Component → Set DID: `did:key:z6Mkhkbc...sLQEeZ`
2. BP_Giga → Add Component → Set DID: `did:key:z6MkpJDd...cSTuX`
3. BP_OffRoadSDV → Add Component → Set DID: `did:key:z6Mkm3MX...gigy`

---

## 🔧 Task 3: Observatory URL Fix (2 minutes)

**Open**: BP_ObservatoryBrain_C → Event Graph

**Find**: HTTP Request node with URL `localhost:5000/observatory_feed`

**Change to**: `https://observatoryfeed-24qs4mpmsq-uc.a.run.app`

**Test**: Console should show "HTTP 200" (no localhost errors)

---

## 📋 Agent DIDs (Copy-Paste Ready)

```
Byte:       did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ
Giga:       did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX
OffRoadSDV: did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy
```

## 🌐 Endpoints (Copy-Paste Ready)

```
vconIngest:       https://vconingest-24qs4mpmsq-uc.a.run.app
getLatestCommand: https://getlatestcommand-24qs4mpmsq-uc.a.run.app
observatoryFeed:  https://observatoryfeed-24qs4mpmsq-uc.a.run.app
nimRouter:        https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter
```

---

## ✅ Success Criteria

- [ ] BP_Byte: Console shows "HTTP 200" every 10s
- [ ] All agents: Console shows command polls every 3s
- [ ] Observatory: Console shows "HTTP 200" (no localhost errors)
- [ ] Firestore: `event_stream` has new Byte documents
- [ ] Firestore: `command_queue` commands are being retrieved

---

**Full Guide**: See `UE5_BLUEPRINT_IMPLEMENTATION_GUIDE.md` for detailed instructions