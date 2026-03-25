import React, { useState, useEffect } from 'react';
import { usePaseoSync } from '../../hooks/usePaseoSync';
import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export const RegistrationForm: React.FC = () => {
    const { api, networkStatus } = usePaseoSync();

    // Form State
    const [name, setName] = useState('');
    const [github, setGithub] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [rate, setRate] = useState('');
    const [status, setStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wallet State
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [keyring, setKeyring] = useState<Keyring | null>(null);

    const setupDevAccounts = async () => {
        try {
            await cryptoWaitReady();
            const k = new Keyring({ type: 'sr25519' });
            const alice = k.addFromUri('//Alice', { name: 'Alice (Dev)' });
            const bob = k.addFromUri('//Bob', { name: 'Bob (Dev)' });

            setKeyring(k);
            const devAccounts = [
                { address: alice.address, meta: { name: 'Alice (Dev)', source: 'development' } },
                { address: bob.address, meta: { name: 'Bob (Dev)', source: 'development' } }
            ];
            setAccounts(devAccounts);
            if (devAccounts.length > 0) {
                setSelectedAccount(devAccounts[0].address);
            }
            setStatus('Dev Mode Activated: Alice & Bob loaded.');
        } catch (err) {
            console.error('Failed to load dev accounts:', err);
            setStatus(`Dev Mode Error: ${err}`);
        }
    };

    useEffect(() => {
        const initWallets = async () => {
            // Ensure WASM crypto is ready for Keyring
            await cryptoWaitReady();

            const extensions = await web3Enable('Substrate Nexus');

            if (extensions.length === 0) {
                // Try automatic fallback, but also allow manual override
                setStatus('No extension found. Attempting to load Dev Accounts...');
                await setupDevAccounts();
                return;
            }

            const allAccounts = await web3Accounts();
            setAccounts(allAccounts);
            if (allAccounts.length > 0) {
                setSelectedAccount(allAccounts[0].address);
            } else {
                setStatus('Extension connected but no accounts found.');
            }
        };
        initWallets();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!api || !selectedAccount) return;

        // Constraint Checks
        if (name.length > 64) {
            setStatus('Error: Name exceeds 64 characters (Runtime Limit).');
            return;
        }

        try {
            setIsSubmitting(true);
            setStatus('Discovering Consulting Pallet...');

            // 1. Auto-discover the pallet name
            const palletName = Object.keys(api.tx).find(
                (key) => key.toLowerCase().includes('consulting')
            );

            if (!palletName || !api.tx[palletName].registerConsultant) {
                setStatus(`Error: Pallet '${palletName}' or extrinsic not found. Available: ${Object.keys(api.tx).join(', ')}`);
                setIsSubmitting(false);
                return;
            }

            setStatus(`Found pallet: ${palletName}. Signing...`);

            let signer;
            let addressOrPair: any = selectedAccount;

            // Check if using Dev Keyring or Extension
            if (keyring && keyring.getPair(selectedAccount)) {
                addressOrPair = keyring.getPair(selectedAccount);
            } else {
                const injector = await web3FromAddress(selectedAccount);
                signer = injector.signer;
            }

            // 2. Execute with the discovered name
            // Note: Validated runtime only accepts 'name' currently. 
            await api.tx[palletName]
                .registerConsultant(name)
                .signAndSend(addressOrPair, { signer }, ({ status, dispatchError }) => {
                    if (status.isInBlock) {
                        setStatus(`Success! In block: ${status.asInBlock}`);
                    } else if (status.isFinalized) {
                        setStatus('Registration Finalized! Welcome to the Nexus.');
                        setIsSubmitting(false);
                        setName('');
                        setGithub('');
                    } else {
                        setStatus(`Status: ${status.type}`);
                    }

                    if (dispatchError) {
                        if (dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(dispatchError.asModule);
                            const { docs, name, section } = decoded;
                            setStatus(`Error: ${section}.${name}: ${docs.join(' ')}`);
                        } else {
                            setStatus(`Error: ${dispatchError.toString()}`);
                        }
                        setIsSubmitting(false);
                    }
                });
        } catch (e: any) {
            console.error(e);
            setStatus(`Transaction Failed: ${e.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-surface border border-white/10 rounded-xl p-6 hover:border-mint-400 transition-colors duration-300 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h2 className="text-xl font-mono font-bold text-mint-400 tracking-widest">
                    {">"} VERIFIED_REGISTRATION
                </h2>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-xs font-mono text-gray-500">
                        DEPOSIT_REQUIRED: <span className="text-white">10 UNIT</span>
                    </div>
                    {(accounts.length === 0) && (
                        <button
                            onClick={setupDevAccounts}
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-mint-400 border border-mint-400/30 uppercase tracking-wider transition-colors"
                        >
                            Force Dev Mode
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Account Selection */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-gray-400 mb-2">SIGNING_ACCOUNT</label>
                    <select
                        title="Select Signing Account"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-sm font-mono focus:border-mint-400 focus:outline-none text-white"
                        disabled={isSubmitting}
                    >
                        {accounts.map(acc => (
                            <option key={acc.address} value={acc.address}>
                                {acc.meta.name || 'Unknown'} ({acc.address.slice(0, 10)}...)
                            </option>
                        ))}
                        {accounts.length === 0 && <option>No accounts found</option>}
                    </select>
                </div>

                {/* Name Field */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">DISPLAY_NAME (Max 64)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={64}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-sm font-mono focus:border-mint-400 focus:outline-none text-white placeholder-gray-700"
                        placeholder="e.g. Satoshi Nakamoto"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* GitHub Handle */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">GITHUB_HANDLE (For AI Verification)</label>
                    <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-sm font-mono focus:border-mint-400 focus:outline-none text-white placeholder-gray-700"
                        placeholder="@username"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Specialization */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">SPECIALIZATION</label>
                    <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-sm font-mono focus:border-mint-400 focus:outline-none text-white placeholder-gray-700"
                        placeholder="e.g. Rust, Substrate, ZK-Rollups"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Hourly Rate */}
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2">HOURLY_RATE (USDT)</label>
                    <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded p-3 text-sm font-mono focus:border-mint-400 focus:outline-none text-white placeholder-gray-700"
                        placeholder="150"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Submit Logic */}
                <div className="md:col-span-2 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs font-mono text-mint-400 animate-pulse">
                        {status}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !api || !selectedAccount || networkStatus !== 'Connected'}
                        className={`px-6 py-2 rounded bg-mint-400 text-black font-bold font-mono tracking-wider hover:bg-mint-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? 'TRANSMITTING...' : 'REGISTER_IDENTITY'}
                    </button>
                </div>
            </form>
        </section>
    );
};
