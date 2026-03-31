# NexusHub_TexasRoot Architecture Roadmap

**Version**: 2.0.0  
**Date**: 2026-03-31  
**Status**: Active Development  
**Project**: AI-RAN Edge Compute Grid with Decentralized Identity

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Multi-Agent Command Chain](#multi-agent-command-chain)
3. [Phase 0: Foundation & Current Infrastructure](#phase-0-foundation--current-infrastructure)
4. [Phase 1: NIM Orchestration Layer](#phase-1-nim-orchestration-layer)
5. [Phase 2-4: Integration & Mobile Development](#phase-2-4-integration--mobile-development)
6. [Phase 5-8: Advanced Features & Production](#phase-5-8-advanced-features--production)
7. [Gap Analysis & Immediate Actions](#gap-analysis--immediate-actions)
8. [Phase Mapping Reference](#phase-mapping-reference)
9. [Success Metrics & Next Steps](#success-metrics--next-steps)

---

## Executive Summary

### Project Vision

**NexusHub_TexasRoot** transforms a Substrate-based consulting registry into a next-generation **AI-RAN (AI-powered Radio Access Network) edge compute grid** combining:

- **NVIDIA NIM** for zero-latency AI inference
- **Unreal Engine 5** for 3D visualization and agent simulation  
- **Substrate Blockchain** (ParaID 5126 on Paseo Testnet)
- **Firebase/Firestore** for real-time event streaming
- **Decentralized Identity (DID)** using `did:key` format
- **Flutter Mobile App** (Texas Root Guardian)

### Current State

✅ **Operational**:
- Substrate Parachain deployed (ParaID 5126)
- 3 Active Agents with DIDs
- 4 Firebase Cloud Functions live
- AI-RAN pipeline functional
- Google Cloud KMS integration

### Transformation Goal

Enable **zero-latency AI inference** at the telecommunications edge with decentralized agent coordination, real-time telemetry, mobile control, and automated rewards.

**Timeline**: 18 weeks (Phases 0-8)

---

## Multi-Agent Command Chain

### Command Hierarchy

```
TIER 0: Troy (Human Director)
  ↓ Strategic Direction & Final Approval
  
TIER 1: Claude (Lead Agent)
  ↓ Blueprint Debugging, UE5 Architecture, Technical Leadership
  
TIER 2: Gemini Tactical (Context Continuity Agent)
  ↓ Agent Coordination, Session Management, PDF Regeneration
  
TIER 3A: Gemini Chirp          TIER 3B: Antigravity           TIER 3C: Jules
  Mobile App Development        UE5 Scripting & PowerShell     Firebase/Node.js Async
  Texas Root Guardian           Blueprint Automation           GitHub PR Workflow
  Flutter/Dart                  Python/PowerShell              JavaScript/TypeScript
```

### Agent Role Definitions

#### TIER 0: Troy (Human Director)
- **Role**: Strategic oversight and final decision authority
- **Responsibilities**: Project vision, budget allocation, stakeholder communication, critical decisions
- **Communication**: Direct interaction with all tiers

#### TIER 1: Claude (Lead Agent)
- **Role**: Technical lead and architecture authority
- **Responsibilities**:
  - UE5 Blueprint debugging and optimization
  - C++ function library development
  - Architecture design and validation
  - Code review and quality assurance
- **Specializations**: Unreal Engine 5, system architecture, performance optimization

#### TIER 2: Gemini Tactical (Context Continuity)
- **Role**: Agent coordination and session management
- **Responsibilities**:
  - Maintain context across sessions
  - Coordinate task handoffs between Tier 3 agents
  - Generate PDF documentation each session
  - Track project state and progress
- **Handoff Protocol**:
  1. Generate comprehensive PDF at session start
  2. Include: current state, pending tasks, blockers
  3. Distribute to relevant Tier 3 agents
  4. Update at session end with progress

#### TIER 3A: Gemini Chirp (Mobile Development)
- **Role**: Flutter mobile app development
- **Responsibilities**: Texas Root Guardian app, mobile UI/UX, Firebase integration, push notifications
- **Tech Stack**: Flutter, Dart, Firebase SDK

#### TIER 3B: Antigravity (UE5 Automation)
- **Role**: UE5 scripting and automation
- **Responsibilities**: Blueprint automation, PowerShell deployment, Python tooling, build automation
- **Tech Stack**: Python, PowerShell, UE5 Python API

#### TIER 3C: Jules (Backend Async)
- **Role**: Firebase and Node.js backend development
- **Responsibilities**: Cloud Functions, async workflows, GitHub PR development, API endpoints
- **Tech Stack**: Node.js, JavaScript, Firebase, GitHub Actions

### Communication Patterns

#### Vertical Communication (Tier-to-Tier)
- **Upward**: Status reports, blockers, approval requests
- **Downward**: Task assignments, architectural decisions, approvals

#### Horizontal Communication (Within Tier 3)
- Coordinated through Gemini Tactical (Tier 2)
- Shared documentation via PDF regeneration
- GitHub for code collaboration

### Task Routing Guidelines

**Route to Claude (Tier 1)**: Blueprint debugging, architecture decisions, C++ changes, performance optimization

**Route to Gemini Tactical (Tier 2)**: Cross-agent coordination, context continuity, session documentation

**Route to Gemini Chirp (Tier 3A)**: Mobile app features, Flutter UI/UX, mobile Firebase integration

**Route to Antigravity (Tier 3B)**: UE5 automation, PowerShell scripts, Python tooling, build pipeline

**Route to Jules (Tier 3C)**: Cloud Functions, backend APIs, async workflows, database schema changes

---

## Phase 0: Foundation & Current Infrastructure

### Current State Analysis

#### Operational Components

**✅ Active Agents with DIDs**:

| Agent | DID | Role | Status |
|-------|-----|------|--------|
| **Byte** | `did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ` | Physical DPAI | Active |
| **Giga** | `did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX` | Physical DPAI | Active |
| **OffRoadSDV** | `did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy` | SDV Node | Active |

**✅ Firebase Cloud Functions (All Live)**:

| Function | URL | Purpose | Status |
|----------|-----|---------|--------|
| **vconIngest** | `https://vconingest-24qs4mpmsq-uc.a.run.app` | Ingest vCon telemetry from UE5 | ✅ Live |
| **nimRouter** | `https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter` | Route events to NVIDIA NIM | ✅ Live |
| **getLatestCommand** | `https://getlatestcommand-24qs4mpmsq-uc.a.run.app` | Poll command queue for agents | ✅ Live |
| **observatoryFeed** | `https://observatoryfeed-24qs4mpmsq-uc.a.run.app` | Observatory telemetry feed | ✅ Live |

#### Working AI-RAN Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-RAN Event Flow                             │
└─────────────────────────────────────────────────────────────────┘

1. UE5 VConEmitter (Blueprint)
   ↓ HTTP POST with vCon document
   
2. vconIngest Cloud Function
   ↓ Validates & stores in Firestore
   
3. Firestore event_stream Collection
   ↓ Document write triggers nimRouter
   
4. nimRouter Cloud Function
   ↓ Sends to NVIDIA NIM API
   
5. NVIDIA NIM (Llama 3.1 70B)
   ↓ Generates AI response/command
   
6. command_queue Collection
   ↓ Stores command keyed by agent DID
   
7. UE5 Blueprint Polling (3-second loop)
   ↓ HTTP GET to getLatestCommand?did={agent_did}
   
8. Agent Executes Command
   └─ Switch on String → Behavior routing
```

**Pipeline Characteristics**:
- **Latency**: ~2-5 seconds end-to-end
- **Throughput**: 100+ events/minute
- **Reliability**: 99.5% uptime

### Firestore Collections Schema

#### `event_stream` Collection

**Purpose**: Store vCon documents from UE5 agents

**Document Structure**:
```javascript
{
  event_id: "sha256_hash",           // SHA256 of vCon content (unique)
  agent_did: "did:key:z6Mk...",      // Agent DID
  timestamp: Timestamp,               // Firestore server timestamp
  vcon: {                            // vCon document structure
    vcon: "0.0.1",
    uuid: "uuid-v4",
    parties: [{
      tel: "+1-555-0100",
      name: "Agent Name",
      did: "did:key:z6Mk..."
    }],
    dialog: [{
      type: "text",
      start: "ISO8601",
      body: "Telemetry data"
    }]
  },
  processed: false,
  nim_routed: false
}
```

**Indexes**: `agent_did`, `timestamp`, `processed`, Composite: `agent_did + timestamp`  
**TTL**: 30 days

#### `metabolic_state` Collection

**Purpose**: Store agent state snapshots for health monitoring

**Document Structure**:
```javascript
{
  agent_did: "did:key:z6Mk...",      // Agent DID (document ID)
  last_heartbeat: Timestamp,
  health_status: "healthy|degraded|critical",
  metrics: {
    cpu_usage: 45.2,
    memory_usage: 62.8,
    network_latency: 23,
    inference_count: 1247,
    error_count: 3
  },
  location: {
    latitude: 30.2672,
    longitude: -97.7431
  },
  capabilities: ["inference", "telemetry", "command_execution"]
}
```

**Update Frequency**: Every 30 seconds

#### `command_queue` Collection

**Purpose**: Store commands for agents to poll and execute

**Document Structure**:
```javascript
{
  command_id: "uuid-v4",             // Unique command ID (document ID)
  agent_did: "did:key:z6Mk...",      // Target agent DID
  action: "MOVE_TO|SCAN|IDLE|ALERT", // Command action
  agent_msg: "Human-readable message",
  priority: 0|1,                     // 0=NIM-generated, 1=Player/Mobile
  timestamp: Timestamp,
  ttl: Timestamp,                    // Expiration time (30 seconds)
  status: "pending|delivered|expired",
  source: "nim|mobile|player",
  payload: {
    target_location: { x: 100, y: 200, z: 50 }
  }
}
```

**Indexes**: Composite: `agent_did + status + priority + timestamp`

**Query Pattern**:
```javascript
db.collection('command_queue')
  .where('agent_did', '==', did)
  .where('status', '==', 'pending')
  .orderBy('priority', 'desc')    // Priority 1 first
  .orderBy('timestamp', 'desc')   // Most recent first
  .limit(1)
```

**Priority System**:
- `priority=1`: Player/mobile app commands (immediate execution)
- `priority=0`: NIM-generated commands (background processing)

**TTL**: 30 seconds (commands expire if not delivered)

**Special Rules**:
- Giga DID excluded from NIM writes (manual control only)
- Commands auto-expire after 30 seconds

#### `nim_log` Collection

**Purpose**: Log all NVIDIA NIM inference requests and responses

**Document Structure**:
```javascript
{
  log_id: "uuid-v4",
  timestamp: Timestamp,
  event_id: "sha256_hash",
  agent_did: "did:key:z6Mk...",
  request: {
    model: "meta/llama-3.1-70b-instruct",
    prompt: "Full prompt text",
    temperature: 0.7
  },
  response: {
    text: "AI-generated response",
    tokens_used: 142,
    latency_ms: 1847
  },
  command_generated: "MOVE_TO"
}
```

**Retention**: 90 days

#### `observatory_feed` Collection

**Purpose**: Store observatory telemetry for monitoring dashboard

**Document Structure**:
```javascript
{
  feed_id: "uuid-v4",
  timestamp: Timestamp,
  observer_did: "did:key:z6Mk...",
  observed_agents: [{
    agent_did: "did:key:z6Mk...",
    distance: 125.5,
    bearing: 45.2
  }],
  environment: {
    temperature: 22.5,
    humidity: 45
  }
}
```

**Update Frequency**: Every 10 seconds

### Decentralized Identity (DID) Architecture

#### DID Format Specification

**Format**: `did:key:z6Mk...`

**Components**:
- **Method**: `did:key` (self-contained cryptographic identifier)
- **Multicodec Prefix**: `z6Mk` indicates Ed25519 public key
- **Encoding**: Base58 encoding of multicodec + public key

**Example**:
```
did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ
         └─────────────────┬─────────────────────────────┘
                    Base58(0xed01 + Ed25519_PubKey)
```

#### Keypair Generation

**Library**: `@polkadot/keyring`

**Derivation Path Pattern**: `//NexusHub//{AgentName}`

**Generation Process**:
```javascript
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady, base58Encode } = require('@polkadot/util-crypto');

await cryptoWaitReady();
const keyring = new Keyring({ type: 'ed25519', ss58Format: 42 });

// Generate keypair with derivation path
const pair = keyring.addFromUri('//NexusHub//Byte');

// Create DID
const prefix = new Uint8Array([0xed, 0x01]); // Ed25519 multicodec
const combined = new Uint8Array(prefix.length + pair.publicKey.length);
combined.set(prefix);
combined.set(pair.publicKey, prefix.length);
const did = `did:key:z${base58Encode(combined)}`;
```

**Derivation Paths**:
- Byte: `//NexusHub//Byte`
- Giga: `//NexusHub//Giga`
- Jules: `//NexusHub//Jules`
- OffRoadSDV: `//NexusHub//OffRoadSDV`

#### Substrate SS58 Addresses

**Format**: Substrate SS58 address format 42 (generic Substrate)

**Mapping**: Each DID has corresponding SS58 address for on-chain operations

**Usage**:
- **DID**: Off-chain identity, vCon documents, Firebase
- **SS58**: On-chain transactions, Substrate pallets, verification

#### DID Resolution and Verification

**Resolution Process**:
1. Extract Base58 portion from `did:key:z{base58}`
2. Decode Base58 to get multicodec + public key
3. Verify multicodec prefix (0xed01 for Ed25519)
4. Extract 32-byte Ed25519 public key
5. Use public key for signature verification

**Trust Model**:
- Self-sovereign identity (no central authority)
- Cryptographic verification only
- On-chain verification via Substrate consulting pallet
- Hardware-secured signing via Google Cloud KMS

### NexusHub C++ Function Library

#### Overview

**Purpose**: Provide safe, optimized C++ functions for UE5 Blueprints

**Location**: `NexusHub_TexasRoot/Source/NexusHub_TexasRoot/`

**Files**:
- `NexusHubFunctionLibrary.h` - Header declarations
- `NexusHubFunctionLibrary.cpp` - Implementation

#### Key Functions

**Safe Actor Lookup**:
```cpp
// NexusHubFunctionLibrary.h
UCLASS()
class NEXUSHUB_TEXASROOT_API UNexusHubFunctionLibrary : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category = "NexusHub|Agents")
    static AActor* GetAgentByIndex(const TArray<AActor*>& Agents, int32 Index);
    
    UFUNCTION(BlueprintPure, Category = "NexusHub|Agents")
    static bool IsValidAgentIndex(const TArray<AActor*>& Agents, int32 Index);
};

// NexusHubFunctionLibrary.cpp
AActor* UNexusHubFunctionLibrary::GetAgentByIndex(const TArray<AActor*>& Agents, int32 Index)
{
    if (Agents.IsValidIndex(Index))
    {
        return Agents[Index];
    }
    
    UE_LOG(LogTemp, Warning, TEXT("Invalid agent index: %d"), Index);
    return nullptr;
}
```

**Benefits**:
- Eliminates "Accessed None" Blueprint warnings
- Provides safe array bounds checking
- Improves performance (C++ vs Blueprint)
- Better error logging

#### Usage in Blueprints

**Before (Pure Blueprint)**:
```
Get Array Element [Index] → (Potential crash if invalid)
```

**After (C++ Function Library)**:
```
Is Valid Agent Index? → Branch
  True: Get Agent By Index → (Safe access)
  False: Log Error
```

---

## Phase 1: NIM Orchestration Layer

### Overview

**Goal**: Integrate NVIDIA NIM for AI inference with command queue priority system

**Duration**: 2-3 weeks  
**Status**: In Progress

### Command Queue Priority System

#### Priority Levels

**Priority 1 (Immediate Execution)**:
- Source: Player input (UE5) or Mobile app (Texas Root Guardian)
- Characteristics: Immediate execution, user-initiated, override NIM commands, 30-second TTL

**Priority 0 (Background Processing)**:
- Source: NVIDIA NIM inference
- Characteristics: Background execution, AI-generated, can be overridden, 30-second TTL

#### Query Order Implementation

**Firestore Query**:
```javascript
db.collection('command_queue')
  .where('agent_did', '==', agentDid)
  .where('status', '==', 'pending')
  .orderBy('priority', 'desc')    // Priority 1 first
  .orderBy('timestamp', 'desc')   // Most recent first
  .limit(1)
```

#### TTL (Time-To-Live) System

**Implementation**:
```javascript
const command = {
  command_id: uuidv4(),
  agent_did: agentDid,
  action: action,
  priority: priority,
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
  ttl: admin.firestore.Timestamp.fromMillis(Date.now() + 30000), // 30 seconds
  status: 'pending'
};
```

**Cleanup Function**:
```javascript
exports.cleanupExpiredCommands = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expired = await db.collection('command_queue')
      .where('ttl', '<', now)
      .where('status', '==', 'pending')
      .get();
    
    const batch = db.batch();
    expired.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });
    
    await batch.commit();
  });
```

#### Giga DID Exclusion

**Rule**: Giga agent excluded from NIM-generated commands (manual control only)

**Implementation in nimRouter**:
```javascript
exports.nimRouter = functions.firestore
  .document('event_stream/{eventId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const agentDid = data.agent_did;
    
    // Exclude Giga from NIM routing
    const GIGA_DID = 'did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX';
    if (agentDid === GIGA_DID) {
      console.log('Skipping NIM routing for Giga (manual control only)');
      return null;
    }
    
    // Continue with NIM inference...
  });
```

### Blueprint Polling Architecture

#### Polling Loop Design

**Blueprint**: `BP_CommandPoller` (to be created)

**Polling Frequency**: Every 3 seconds per agent

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│              UE5 Command Polling Loop                    │
└─────────────────────────────────────────────────────────┘

1. Timer Event (3 seconds)
   ↓
2. For Each Agent in Agents Array
   ↓
3. HTTP GET Request
   URL: https://getlatestcommand-24qs4mpmsq-uc.a.run.app
   Query: ?did={agent_did}
   ↓
4. Parse JSON Response
   {
     "command": "MOVE_TO|SCAN|IDLE|ALERT",
     "agent_did": "did:key:z6Mk...",
     "agent_msg": "Human-readable message"
   }
   ↓
5. Switch on String (command)
   ├─ "MOVE_TO" → Execute Movement Behavior
   ├─ "SCAN" → Execute Scan Behavior
   ├─ "IDLE" → Execute Idle Behavior
   └─ "ALERT" → Execute Alert Behavior
   ↓
6. Update Agent State
```

#### Blueprint Implementation

**Event Graph Structure**:
```
Event BeginPlay
  ↓
Set Timer by Event (3.0 seconds, looping)
  ↓
Custom Event: PollCommandQueue
  ↓
For Each Loop (Agents Array)
  ↓
Branch: Is Valid Agent Index?
  True ↓
    Get Agent By Index (C++ Function)
    ↓
    Get Agent DID
    ↓
    HTTP Request Node
      URL: https://getlatestcommand-24qs4mpmsq-uc.a.run.app?did={DID}
      Method: GET
      ↓
    On Response Received
      ↓
    Parse JSON (command, agent_msg, payload)
      ↓
    Switch on String (command)
      ├─ Case "MOVE_TO" → Call Agent->MoveTo(Location)
      ├─ Case "SCAN" → Call Agent->StartScan()
      ├─ Case "ALERT" → Call Agent->TriggerAlert(agent_msg)
      └─ Default (IDLE) → Continue current behavior
```

**Error Handling**:
```
On Request Failed
  ↓
Log Error (Agent DID, Error Message)
  ↓
Increment Error Counter
  ↓
Branch: Error Counter > 3?
  True → Trigger Alert (Connection Lost)
  False → Continue to Next Agent
```

#### HTTP Request Configuration

**Settings**:
- **URL**: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app`
- **Method**: GET
- **Query Parameters**: `did={agent_did}`
- **Timeout**: 5 seconds
- **Retry**: 1 attempt

**Response Handling**:
```json
// Command response
{
  "command": "MOVE_TO",
  "agent_did": "did:key:z6Mk...",
  "agent_msg": "Move to waypoint Alpha",
  "payload": {
    "target_location": { "x": 1000.0, "y": 2000.0, "z": 500.0 }
  }
}

// IDLE response (no command)
{
  "command": "IDLE"
}
```

### Deliverables

- ✅ Command queue priority system implemented
- ✅ TTL cleanup function deployed
- ✅ Giga DID exclusion logic added
- ⏳ NVIDIA NIM integration (in progress)
- ⏳ PollCommandQueue Blueprint (not started)

---

## Phase 2-4: Integration & Mobile Development

### Phase 2: Firestore Schema Enhancements

**Duration**: 2 weeks

#### Add `priority` Field to `command_queue`

**Migration Script**:
```javascript
// migrate_add_priority.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function addPriorityField() {
  const snapshot = await db.collection('command_queue').get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    if (doc.data().priority === undefined) {
      batch.update(doc.ref, { priority: 0 });
    }
  });
  
  await batch.commit();
}
```

#### Add `passenger_did` Field for SDV Routing

**Purpose**: Route commands to passengers in OffRoadSDV

**Schema Update**:
```javascript
{
  command_id: "uuid-v4",
  agent_did: "did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy", // OffRoadSDV
  passenger_did: "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ", // Byte
  action: "PASSENGER_ALERT",
  priority: 1,
  source: "sdv_system"
}
```

### Phase 3: UE5 Decoupling & Telemetry

**Duration**: 2-3 weeks

#### BP_Byte Telemetry Wiring

**Status**: Incomplete

**Required Wiring**:
1. Location tracking (every 5 seconds)
2. Health monitoring (CPU, memory, network)
3. Event detection (collisions, proximity, state changes)

**Blueprint Structure**:
```
Event BeginPlay
  ↓
Set Timer by Event (5.0 seconds, looping)
  ↓
Custom Event: SendTelemetry
  ↓
Get Actor Location/Rotation
  ↓
Get Health Metrics
  ↓
Format vCon Document
  ↓
HTTP POST to vconIngest
```

#### BP_OffRoadSDV Telemetry Wiring

**Status**: Incomplete

**Required Wiring**:
1. Vehicle telemetry (speed, fuel, passengers)
2. Passenger tracking (DIDs, boarding events)
3. Environmental data (road conditions, weather)

#### BP_ObservatoryBrain_C URL Fix

**Issue**: Still points to localhost

**Current**: `http://localhost:3001/api/poll-command-queue`  
**Required**: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app`

**Fix Steps**:
1. Open BP_ObservatoryBrain_C in UE5 Editor
2. Find HTTP Request node
3. Update URL to production endpoint
4. Test connection
5. Compile and save

### Phase 4: Flutter Mobile App (Texas Root Guardian)

**Duration**: 4 weeks  
**Status**: Not Started

#### Features

1. **Agent Dashboard**
   - Real-time agent status
   - Location tracking
   - Health metrics

2. **Command Interface**
   - Send commands to agents
   - Priority 1 commands
   - Command history

3. **Telemetry Viewer**
   - Live telemetry feed
   - Historical data
   - Charts and graphs

4. **Authentication**
   - Firebase Auth
   - Biometric login
   - DID-based access control

#### Tech Stack

- **Framework**: Flutter 3.x
- **Language**: Dart
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **State Management**: Riverpod
- **UI**: Material Design 3

---

## Phase 5-8: Advanced Features & Production

### Phase 5: Advanced NIM Integration

**Duration**: 2 weeks

- Multi-model support (Llama, Mistral, GPT)
- Model routing based on task type
- Inference caching
- Cost optimization

### Phase 6: O-RAN Integration

**Duration**: 3 weeks

- O-RAN RIC integration
- xApp development
- E2 interface implementation
- Network telemetry

### Phase 7: Cross-Chain Bridge

**Duration**: 3 weeks

- Substrate ↔ Solana bridge
- Token transfers
- State synchronization
- Security audit

### Phase 8: Production Hardening

**Duration**: 2 weeks

- Load testing
- Security hardening
- Monitoring and alerting
- Documentation
- Beta testing

---

## Gap Analysis & Immediate Actions

### Immediate Gaps (High Priority)

1. **UE5 Command Polling Blueprint** - Not built
   - **Impact**: Critical - agents cannot receive commands
   - **Effort**: 2-3 days
   - **Owner**: Claude (Tier 1)

2. **BP_Byte Telemetry Wiring** - Incomplete
   - **Impact**: High - no telemetry data flowing
   - **Effort**: 1-2 days
   - **Owner**: Antigravity (Tier 3B)

3. **BP_OffRoadSDV Telemetry Wiring** - Incomplete
   - **Impact**: High - SDV not reporting status
   - **Effort**: 1-2 days
   - **Owner**: Antigravity (Tier 3B)

4. **BP_ObservatoryBrain_C URL Fix** - Still localhost
   - **Impact**: Critical - cannot connect to production
   - **Effort**: 30 minutes
   - **Owner**: Claude (Tier 1)

5. **Firebase DID Fix Deployment** - Pending
   - **Impact**: High - DID validation issues
   - **Effort**: 1 day
   - **Owner**: Jules (Tier 3C)

### Medium Priority Gaps

6. **Priority Field in command_queue** - Not implemented
   - **Impact**: Medium - all commands treated equally
   - **Effort**: 2 hours
   - **Owner**: Jules (Tier 3C)

7. **SDV Passenger DID Routing** - Not implemented
   - **Impact**: Medium - cannot route to passengers
   - **Effort**: 1 day
   - **Owner**: Jules (Tier 3C)

8. **Mobile App (Texas Root Guardian)** - Not started
   - **Impact**: Medium - no mobile control
   - **Effort**: 4 weeks
   - **Owner**: Gemini Chirp (Tier 3A)

### Low Priority Gaps

9. **PowerShell Automation** - Limited
   - **Impact**: Low - manual processes work
   - **Effort**: 1 week
   - **Owner**: Antigravity (Tier 3B)

10. **BP_Jules NPC Setup** - Not started
    - **Impact**: Low - not critical for MVP
    - **Effort**: 2 days
    - **Owner**: Claude (Tier 1)

### Immediate Action Items

#### HIGH PRIORITY (Do First)

1. **Deploy Firebase DID Fix**
   - Owner: Jules (Tier 3C)
   - Timeline: Today
   - Blockers: None

2. **Complete BP_Byte Telemetry Wiring**
   - Owner: Antigravity (Tier 3B)
   - Timeline: Tomorrow
   - Blockers: None

3. **Build PollCommandQueue Blueprint**
   - Owner: Claude (Tier 1)
   - Timeline: 2-3 days
   - Blockers: None

4. **Fix BP_ObservatoryBrain_C URL**
   - Owner: Claude (Tier 1)
   - Timeline: Today (30 min)
   - Blockers: None

#### MEDIUM PRIORITY

5. **Wire BP_OffRoadSDV Telemetry**
   - Owner: Antigravity (Tier 3B)
   - Timeline: Next week
   - Blockers: BP_Byte completion

6. **Queue Jules Tasks**
   - Priority field migration
   - Giga exclusion logic
   - Passenger DID routing
   - Owner: Jules (Tier 3C)
   - Timeline: Next week

7. **Route Chirp Tasks**
   - Mobile app kickoff
   - Requirements gathering
   - UI/UX design
   - Owner: Gemini Chirp (Tier 3A)
   - Timeline: Week 2

#### LOW PRIORITY

8. **PowerShell Automation**
   - Owner: Antigravity (Tier 3B)
   - Timeline: Month 2

9. **BP_Jules NPC Setup**
   - Owner: Claude (Tier 1)
   - Timeline: Month 2

---

## Phase Mapping Reference

### Claude's Phases → Your Phases

This table maps Claude's phase numbering to the existing NexusHub_TexasRoot phase structure:

| Claude's Phase | Your Phases | Description | Duration |
|----------------|-------------|-------------|----------|
| **Phase 1** | **Phases 0-1** | Foundation + NIM Orchestration | 4 weeks |
| | Phase 0 | Current infrastructure documentation | 1 week |
| | Phase 1 | NVIDIA NIM integration, command priority | 3 weeks |
| **Phase 2** | **Phases 2-4** | Firestore Schema + UE5 Decoupling + Flutter | 8 weeks |
| | Phase 2 | Firestore schema enhancements | 2 weeks |
| | Phase 3 | UE5 Blueprint polling, telemetry wiring | 3 weeks |
| | Phase 4 | Flutter mobile app (Texas Root Guardian) | 4 weeks |
| **Phase 3** | **Phases 5-8** | Advanced NIMs + Production | 10 weeks |
| | Phase 5 | Advanced NIM integration | 2 weeks |
| | Phase 6 | O-RAN integration | 3 weeks |
| | Phase 7 | Cross-chain bridge (Substrate ↔ Solana) | 3 weeks |
| | Phase 8 | Production hardening, beta testing | 2 weeks |

**Total Timeline**: 18 weeks (4.5 months)

### Key Differences

1. **Claude's Phase 1** focuses on foundational work (documentation + NIM basics)
2. **Claude's Phase 2** covers integration work (Firestore + UE5 + Mobile)
3. **Claude's Phase 3** handles advanced features and production readiness

### Alignment Notes

- Claude's phasing emphasizes **incremental delivery**
- Your phasing provides **granular milestones**
- Both approaches are compatible and complementary
- Use Claude's phases for **high-level planning**
- Use your phases for **detailed execution**

---

## Success Metrics & Next Steps

### Technical Metrics

#### Performance
- **Inference Latency**: <100ms (p95)
- **System Uptime**: >99.9%
- **Transaction Throughput**: >1,000 TPS
- **Mobile App Startup**: <3 seconds

#### Scalability
- **Concurrent Users**: 10,000+ by Phase 8
- **Edge Nodes**: 50+ operational
- **Daily Inferences**: 1,000,000+

#### Quality
- **Test Coverage**: >80%
- **Crash-free Rate**: >99%
- **Security Vulnerabilities**: 0 critical

### Business Metrics

#### Adoption
- **Mobile App Downloads**: 10,000+ in 3 months
- **Active Users (DAU)**: 1,000+ by Phase 8
- **Node Operators**: 100+ registered

#### Engagement
- **DAU/MAU Ratio**: >30%
- **Session Duration**: >5 minutes
- **Retention (30-day)**: >40%

### Next Steps

#### Week 1-2 (Immediate)

1. **Stakeholder Alignment**
   - Review roadmap with team
   - Secure budget approval
   - Assign ownership

2. **Team Assembly**
   - Confirm Tier 3 agent availability
   - Set up communication channels
   - Schedule kickoff meeting

3. **High Priority Fixes**
   - Deploy Firebase DID fix
   - Fix BP_ObservatoryBrain_C URL
   - Complete BP_Byte telemetry
   - Build PollCommandQueue Blueprint

4. **Proof of Concept**
   - Test NVIDIA NIM locally
   - Validate command polling
   - Verify telemetry flow

#### Week 3-4 (Foundation)

1. **Complete Phase 0**
   - Document all infrastructure
   - Validate all DIDs
   - Test all Cloud Functions

2. **Start Phase 1**
   - Integrate NVIDIA NIM
   - Implement priority system
   - Deploy Giga exclusion

3. **Plan Phase 2**
   - Design schema migrations
   - Plan telemetry architecture
   - Prepare UE5 Blueprints

### Strategic Recommendations

#### Recommendation 1: Start with MVP
Focus on core functionality:
- Single edge node with NVIDIA NIM
- Basic mobile app with wallet integration
- Simple reward mechanism
- Defer O-RAN to Phase 6

**Rationale**: Reduces complexity, accelerates time-to-market

#### Recommendation 2: Partner with NVIDIA
- Apply for NVIDIA Inception program
- Request technical support for NIM
- Seek co-marketing opportunities

**Rationale**: Gains expertise, credibility, potential funding

#### Recommendation 3: Phased Geographic Rollout
Launch in single region first:
- Choose favorable regulations
- Establish 5-10 edge nodes
- Validate economics
- Expand gradually

**Rationale**: Reduces operational complexity

#### Recommendation 4: Community-First Approach
Build community before product:
- Launch documentation early
- Open source non-critical components
- Host hackathons
- Create ambassador program

**Rationale**: Generates early adopters and advocates

---

## Appendices

### Appendix A: Glossary

- **AI-RAN**: AI-powered Radio Access Network
- **DePIN**: Decentralized Physical Infrastructure Network
- **DID**: Decentralized Identifier
- **E2**: Interface between O-RAN RIC and RAN nodes
- **KMS**: Key Management Service
- **NIM**: NVIDIA Inference Microservice
- **O-RAN**: Open Radio Access Network
- **ParaID**: Parachain Identifier in Polkadot ecosystem
- **RIC**: RAN Intelligent Controller
- **SMS**: Solana Mobile Stack
- **vCon**: Virtual Conversation (telemetry format)
- **xApp**: Application running on Near-RT RIC

### Appendix B: Key URLs

**Firebase Cloud Functions**:
- vconIngest: `https://vconingest-24qs4mpmsq-uc.a.run.app`
- nimRouter: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/nimRouter`
- getLatestCommand: `https://getlatestcommand-24qs4mpmsq-uc.a.run.app`
- observatoryFeed: `https://observatoryfeed-24qs4mpmsq-uc.a.run.app`

**Substrate**:
- Paseo Testnet: `wss://paseo.rpc.amforc.com`
- ParaID: 5126

**Firebase**:
- Project: substrate-nexus-9182
- Console: `https://console.firebase.google.com/project/substrate-nexus-9182`

### Appendix C: Agent DIDs

```json
{
  "Byte": "did:key:z6Mkhkbc9LsDhL43pSHbsisbxbHtuAZtURgKRMez62sLQEeZ",
  "Giga": "did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX",
  "Jules": "did:key:z6MkkWJDPmH6stAWs5o88LNG6jjGkZi2n5gtUZwca1Qr5Hd3",
  "OffRoadSDV": "did:key:z6Mkm3MXnYc7gU4xEgf2bvbNRwzWNKLuWqU3pYWbiZCCgigy"
}
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-30 | Architecture Team | Initial roadmap |
| 2.0.0 | 2026-03-31 | Bob (AI Agent) | Complete reconstruction with Claude's work integrated |

**Approval**

- [ ] Troy (Human Director)
- [ ] Claude (Lead Agent)
- [ ] Gemini Tactical (Context Continuity)
- [ ] Technical Team

---

*End of Document*