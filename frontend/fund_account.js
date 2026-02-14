const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main () {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider });
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  // We are using the default Alice address as the recipient for now
  const RECIPIENT = '5GrwvaEFW6thm1CcNpSycA7qW9mSNo1qK9dSLP28u2mU2E'; 
  const AMOUNT = '100000000000000'; // 100 UNIT

  console.log(`🚀 Funding ${RECIPIENT} from Alice (Sudo)...`);

  await api.tx.sudo.sudo(
    api.tx.balances.forceSetBalance(RECIPIENT, AMOUNT)
  ).signAndSend(alice, ({ status }) => {
    if (status.isInBlock) {
      console.log("✅ SUCCESS! Your account has been funded.");
      process.exit(0);
    }
  });
}
main().catch(console.error);
