import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { Header } from '@polkadot/types/interfaces';

export const usePaseoSync = () => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [blockNumber, setBlockNumber] = useState<string>('#---');
  const [networkStatus, setNetworkStatus] = useState<'OFFLINE' | 'LIVE'>('OFFLINE');

  useEffect(() => {
    // AUTOMATION: This detects your specific Codespace URL automatically
    const getRpcUrl = () => {
      const hostname = window.location.hostname;
      // If on Codespaces, map port 5173 (Vite) to port 9944 (Substrate RPC)
      if (hostname.includes('github.dev')) {
        return `wss://${hostname.replace('5173', '9944')}`;
      }
      return 'ws://127.0.0.1:9944'; // Standard local fallback
    };

    const setupApi = async () => {
      try {
        const provider = new WsProvider(getRpcUrl());
        const _api = await ApiPromise.create({ provider });
        
        _api.on('ready', () => {
          setNetworkStatus('LIVE');
          setApi(_api);
        });

        // Subscribing to block headers to drive the dashboard "heartbeat"
        await _api.rpc.chain.subscribeNewHeads((header: Header) => {
          setBlockNumber(header.number.toLocaleString());
        });
      } catch (e) { 
        console.error("Substrate connection failed:", e); 
      }
    };
    setupApi();
  }, []);

  return { api, blockNumber, networkStatus };
};