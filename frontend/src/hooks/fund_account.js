const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main () {
  const sudoKeyUri = process.env.SUDO_KEY_URI;
  if (!sudoKeyUri) {
    console.error("❌ ERROR: SUDO_KEY_URI environment variable is not set.");
    console.error("   Please run with: SUDO_KEY_URI='suri or hex' node fund_account.js");
    process.exit(1);
  }

  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider });
  const keyring = new Keyring({ type: 'sr25519' });

  const sudoAccount = keyring.addFromUri(sudoKeyUri);

  // I updated this to a valid test address so it won't crash!
  const RECIPIENT = '5GrwvaEFW6thm1CcNpSycA7qW9mSNo1qK9dSLP28u2mU2E'; 
  const AMOUNT = '100000000000000'; // 100 UNITs

  console.log(`Funding ${RECIPIENT} from Sudo account...`);

  await api.tx.sudo.sudo(
    api.tx.balances.forceSetBalance(RECIPIENT, AMOUNT)
  ).signAndSend(sudoAccount, ({ status }) => {
    if (status.isInBlock) {
      console.log("✅ Success! Account funded.");
      process.exit(0);
    }
  });
}

main().catch(console.error);