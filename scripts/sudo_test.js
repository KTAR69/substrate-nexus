const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
async function main() {
  const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });
  const alice = new Keyring({ type: 'sr25519' }).addFromUri('//Alice');
  const sig = '0x' + '01'.repeat(64);
  const now = Math.floor(Date.now() / 1000);
  console.log('⚖️ Sending Sudo Override...');
  const call = api.tx.depinDesci.submitSensoryData(29, -98, 198, 72, 45, 1013, sig, now);
  await api.tx.sudo.sudo(call).signAndSend(alice);
  console.log('🚀 Sudo Packets Away.');
} main().catch(console.error).finally(() => process.exit());
