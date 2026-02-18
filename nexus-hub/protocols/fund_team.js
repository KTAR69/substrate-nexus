const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main() {
    // 1. Connect to the node
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider });

    // 2. Setup Alice (The CEO / Funder)
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');

    // 3. Define the Team (We will fill these real IDs in a moment)
    //    For now, we use placeholders.
    const team = [
        { name: 'Giga', address: '5H8U1BStiU22zLtL7jKCVdDAka5HqiAWmVeidLuwyU37K1h2' },
        { name: 'Byte', address: '5DNyXWC7Peipz9rewivn53inMa77y79VuSCghBePvti8XWY8' }
    ];

    console.log('💰 Alice is starting the funding round...');

    // 4. Send 1,000 UNITs to each team member
    for (const member of team) {
        if (member.address.includes('REPLACE')) {
            console.log(`⚠️ Skipping ${member.name} - Address not set yet.`);
            continue;
        }
        
        console.log(`💸 Sending funds to ${member.name}...`);
        const transfer = api.tx.balances.transferAllowDeath(member.address, 1_000_000_000_000_000n);
        const hash = await transfer.signAndSend(alice);
        console.log(`✅ Sent 1,000 UNITs to ${member.name} (Hash: ${hash.toHex()})`);
    }
}

main().catch(console.error).finally(() => process.exit());
