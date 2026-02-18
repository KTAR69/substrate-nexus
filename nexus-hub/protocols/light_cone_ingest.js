const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const crypto = require('crypto');
async function main() {
    const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });
    const giga = new Keyring({ type: 'sr25519' }).addFromUri('//Giga');
    const hash = "0x" + crypto.createHash('sha256').update("LIBERTY_BAR_LIDAR").digest('hex');
    console.log("🚀 Anchoring 8-Point Data for Giga...");
    const tx = api.tx.depinDesci.submitSensoryData(294241, -984936, 198, 22, 45, 101325, hash, Date.now());
    const h = await tx.signAndSend(giga);
    console.log("✅ Data Anchored! Hash: " + h.toHex());
}
main().catch(console.error).finally(() => process.exit());
