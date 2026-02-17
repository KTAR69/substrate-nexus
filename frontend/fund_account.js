const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main () {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider });
  const keyring = new Keyring({ type: 'sr25519' });

  const sudoKey = process.env.SUDO_KEY;
  if (!sudoKey) {
    console.error("❌ ERROR: SUDO_KEY environment variable is not set.");
    console.error("   Please run with: SUDO_KEY='suri or hex' node fund_account.js");
    process.exit(1);
  }

  const sudoAccount = keyring.addFromUri(sudoKey);

  // We are using the default Alice address as the recipient for now
  const RECIPIENT = '5GrwvaEFW6thm1CcNpSycA7qW9mSNo1qK9dSLP28u2mU2E'; 
  const AMOUNT = '100000000000000'; // 100 UNIT

  console.log(`🚀 Funding ${RECIPIENT} from Sudo Account...`);

  try {
    const unsub = await api.tx.sudo.sudo(
        api.tx.balances.forceSetBalance(RECIPIENT, AMOUNT)
    ).signAndSend(sudoAccount, ({ status, events }) => {
        if (status.isInBlock) {
            console.log(`✅ Transaction included at blockHash ${status.asInBlock}`);
            unsub();
            process.exit(0);
        }
    });
  } catch (error) {
    console.error("❌ Transaction failed:", error);
    process.exit(1);
  }
}
main().catch(console.error);
