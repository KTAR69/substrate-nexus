# Substrate Consulting Nexus (ParaID 5126)

## ⬡ Industrial Web3 Registry

The **Substrate Consulting Nexus** is an AI-Governed, Hardware-Secured decentralized registry for verifying Substrate expertise. It runs as a Parachain on the **Paseo Testnet** (ParaID 5126).

### 📱 Dashboard Showcase

![Mobile Dashboard Interface](docs/assets/mobile_showcase.image.png)

## 🚀 Key Features

### 🛡️ Security & XCM (CX-2026-001)

- **Bounded Storage**: Eliminated State Bloat risks via `BoundedVec`.
- **Economic Barrier**: Implemented `RegistrationDeposit` (10 UNIT) to deter spam.
- **XCM Guard**: Configured `RegistrationOrigin` with a custom barrier to block unauthorized cross-chain registrations.

### 🤖 AI Gatekeeper (Genkit + KMS)

- **Automated Verification**: Scans GitHub activity for Substrate contributions.
- **Hardware-Secured Signing**: Uses **Google Cloud KMS** to sign on-chain `verify_consultant` transactions, ensuring private keys never leave the HSM.

### 📊 Performance & Network

- **Benchmarked**: Validated extrinsic weights via `frame-benchmarking`.
- **On-Demand Coretime**: Active assignment on Paseo Relay Chain.

## 🛠️ Usage

1. **Frontend**: `https://substrate-nexus-9182.web.app`
2. **Node**: `./target/release/solochain-template-node`

## 📜 License

Unlicense
