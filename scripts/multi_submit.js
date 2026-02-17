const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
async function main() {
  const api = await ApiPromise.create({ provider: new WsProvider('ws://127.0.0.1:9944') });
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');
  const bob = keyring.addFromUri('//Bob');
  const sig = '0x' + '0'.repeat(128);
  const now = Math.floor(Date.now() / 1000);
  const submit = async (acc, lat, lon, alt, tmp, hum, pre) => {
    console.log('📡 Dispatching packet for ' + acc.address.slice(0,5) + '...');
    return api.tx.depinDesci.submitSensoryData(lat, lon, alt, tmp, hum, pre, sig, now).signAndSend(acc);
  };
  await submit(alice, 2942, -9849, 198, 72, 45, 1013);
  await submit(bob, 3277, -9679, 131, 84, 40, 1011);
  console.log('🚀 Texas Root & Dallas Branch Online.');
} main().catch(console.error).finally(() => process.exit());
