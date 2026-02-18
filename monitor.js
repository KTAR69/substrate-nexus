const { ApiPromise, WsProvider } = require('@polkadot/api');
async function main() {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider });
  console.log('📡 Monitor Active: Watching Texas Root...');
  api.query.system.events((events) => {
    events.forEach(({ event }) => {
      if (event.section === 'depinDesci') {
        console.log('✨ NEW EVENT:', event.method, JSON.stringify(event.data.toHuman()));
      }
    });
  });
}
main().catch(() => {});
