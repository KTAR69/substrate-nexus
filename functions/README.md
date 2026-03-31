# NexusHub Cloud Functions

Firebase Cloud Functions for the NexusHub AI-RAN Edge Compute Grid.

## Functions

### 1. vconIngest
**Type**: HTTP Trigger  
**Purpose**: Ingests vCon telemetry from UE5 agents  
**Endpoint**: `POST /vconIngest`

**Request Body**:
```json
{
  "agent_did": "did:key:z6Mk...",
  "timestamp": "2026-03-31T12:00:00Z",
  "location": { "x": 100, "y": 200, "z": 50 },
  "battery": 85,
  "status": "operational"
}
```

### 2. nimRouter
**Type**: Firestore Trigger  
**Purpose**: Routes events to NVIDIA NIM for AI inference  
**Trigger**: `event_stream/{eventId}` onCreate

- Excludes Giga (manual control only)
- Calls NVIDIA NIM API with agent context
- Generates commands and writes to `command_queue`
- Logs inference to `nim_log` collection

### 3. getLatestCommand
**Type**: HTTP Trigger  
**Purpose**: Agents poll for pending commands  
**Endpoint**: `GET /getLatestCommand?agent_did=<did>`

**Response**:
```json
{
  "success": true,
  "command": "MOVE:100,200,50",
  "command_id": "abc123",
  "priority": 0,
  "source": "nim"
}
```

### 4. observatoryFeed
**Type**: HTTP Trigger  
**Purpose**: Get recent events for Observatory Brain  
**Endpoint**: `GET /observatoryFeed?limit=50`

## Setup

1. Install dependencies:
```bash
cd functions
npm install
```

2. Configure environment variables:
```bash
firebase functions:config:set \
  nvidia.api_key="your-nvidia-api-key" \
  nvidia.endpoint="https://integrate.api.nvidia.com/v1" \
  nvidia.model="meta/llama-3.1-70b-instruct"
```

3. Deploy functions:
```bash
npm run deploy
```

## Local Development

Run functions locally with emulator:
```bash
npm run serve
```

## Environment Variables

- `NVIDIA_NIM_API_KEY`: NVIDIA NIM API key (required)
- `NVIDIA_NIM_ENDPOINT`: NVIDIA API endpoint (default: https://integrate.api.nvidia.com/v1)
- `NVIDIA_NIM_MODEL`: Model to use (default: meta/llama-3.1-70b-instruct)

## Firestore Collections

- `event_stream`: Incoming vCon telemetry
- `command_queue`: Pending commands for agents (30s TTL)
- `nim_log`: NVIDIA NIM inference logs
- `metabolic_state`: Agent state tracking
- `observatory_feed`: Observatory Brain data

## Command Priority System

- **Priority 1**: Player/mobile commands (highest)
- **Priority 0**: NIM-generated commands

Commands expire after 30 seconds (TTL).