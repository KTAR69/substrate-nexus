import { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

interface NetworkState {
    api: ApiPromise | null;
    blockNumber: number;
    finalizedBlock: number;
    networkStatus: 'Connected' | 'Disconnected' | 'Connecting';
    error?: string;
}

export const usePaseoSync = () => {
    const [state, setState] = useState<NetworkState>({
        api: null,
        blockNumber: 0,
        finalizedBlock: 0,
        networkStatus: 'Disconnected',
    });

    useEffect(() => {
        let api: ApiPromise | null = null;
        // Connect to Local Node for Development (where the Pallet exists)
        const wsUrl = 'ws://127.0.0.1:9944';
        const provider = new WsProvider(wsUrl);

        const connect = async () => {
            setState(prev => ({ ...prev, networkStatus: 'Connecting' }));

            try {
                api = await ApiPromise.create({ provider });
                await api.isReady; // Wait for full initialization

                setState(prev => ({ ...prev, api, networkStatus: 'Connected', error: undefined }));
                console.log('[Paseo] API Ready');

                // Event listeners for connection status
                provider.on('connected', () => {
                    console.log('[Paseo] WebSocket Connected');
                });

                provider.on('disconnected', () => {
                    setState(prev => ({ ...prev, networkStatus: 'Disconnected' }));
                    console.log('[Paseo] WebSocket Disconnected. Auto-reconnecting...');
                });

                provider.on('error', (err) => {
                    setState(prev => ({ ...prev, error: String(err) }));
                    console.error('[Paseo] WebSocket Error:', err);
                });

                // Subscribe to new blocks
                await api.rpc.chain.subscribeNewHeads((header) => {
                    setState(prev => ({
                        ...prev,
                        blockNumber: header.number.toNumber(),
                        networkStatus: 'Connected' // Force connected state on active data
                    }));
                });

                // Subscribe to finalized blocks
                await api.rpc.chain.subscribeFinalizedHeads((header) => {
                    setState(prev => ({
                        ...prev,
                        finalizedBlock: header.number.toNumber(),
                    }));
                });

            } catch (err) {
                console.error("Failed to initialize Polkadot API:", err);
                setState(prev => ({ ...prev, error: String(err), networkStatus: 'Disconnected' }));
            }
        };

        connect();

        // Cleanup function
        return () => {
            if (api) {
                api.disconnect();
            }
        };
    }, []); // Run once on mount

    return state;
};
