import React from 'react';
import { usePaseoSync } from '../../hooks/usePaseoSync';

export const BlockMonitor: React.FC = () => {
    const { blockNumber, finalizedBlock, networkStatus } = usePaseoSync();

    // Consider online if status is 'Connected' OR if we are receiving blocks
    const isConnected = networkStatus === 'Connected' || blockNumber > 0;
    const pulseColor = isConnected ? 'bg-mint-400' : 'bg-red-500';
    const pulseShadow = isConnected ? 'shadow-[0_0_10px_#00ff9d]' : 'shadow-[0_0_10px_#ff0000]';

    return (
        <section className="bg-surface border border-white/10 rounded-xl p-6 hover:border-mint-400 transition-colors duration-300 group hover:shadow-neon">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-mono text-xs text-gray-500 group-hover:text-mint-400 transition-colors">
                    NETWORK_HEALTH
                </h3>
                <span className={`w-2 h-2 rounded-full ${pulseColor} animate-pulse ${pulseShadow}`}></span>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                {/* Visual Pulse / Block Animation */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className={`absolute w-full h-full rounded-full border-2 border-dashed ${isConnected ? 'border-mint-400/30' : 'border-red-500/30'} animate-[spin_10s_linear_infinite]`}></div>
                    <div className={`absolute w-16 h-16 rounded-full border border-mint-400/50 flex items-center justify-center bg-black/50 backdrop-blur-sm`}>
                        <span className="font-mono text-xs text-mint-400">
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mt-4 font-mono text-xs">
                <div>
                    <span className="text-gray-500 block">FINALIZED</span>
                    <span className="text-white">#{finalizedBlock > 0 ? finalizedBlock.toLocaleString() : '---'}</span>
                </div>
                <div className="text-right">
                    <span className="text-gray-500 block">BEST_BLOCK</span>
                    <span className="text-mint-400 text-lg font-bold">
                        {blockNumber > 0 ? `#${blockNumber.toLocaleString()}` : '#SYNCING...'}
                    </span>
                </div>
            </div>
        </section>
    );
};
