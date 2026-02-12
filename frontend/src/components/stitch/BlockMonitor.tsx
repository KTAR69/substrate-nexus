import React from 'react';
import { usePaseoSync } from '../../hooks/usePaseoSync';
import { DASHBOARD_CONTENT } from '../../data/mockData';

export const BlockMonitor: React.FC = () => {
    const { blockNumber, finalizedBlock, networkStatus } = usePaseoSync();

    const isConnected = networkStatus === 'Connected';
    // Use the specific Neon Mint #39FF14 when connected, otherwise gray/red
    const statusColor = isConnected ? '#39FF14' : (networkStatus === 'Connecting' ? '#fbbf24' : '#ef4444');
    const glowShadow = isConnected ? '0 0 8px #39FF14' : 'none';

    return (
        <section className="bg-surface border border-white/10 rounded-xl p-6 hover:border-mint-400 transition-colors duration-300 group hover:shadow-neon">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-mono text-sm text-gray-400 group-hover:text-mint-400 transition-colors">
                    {DASHBOARD_CONTENT.metrics.health.label}
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono tracking-tight" id="block-height">
                        #{blockNumber > 0 ? blockNumber.toLocaleString() : 'SYNCING...'}
                    </span>
                    <div
                        className="w-3 h-3 rounded-full transition-all duration-500"
                        style={{
                            backgroundColor: statusColor,
                            boxShadow: glowShadow
                        }}
                        title={`Status: ${networkStatus}`}
                    />
                </div>
            </div>

            <div className="h-10 w-full border-b border-white/10 relative overflow-hidden mb-4">
                {/* Sparkline Animation - Only animates when connected */}
                <svg viewBox="0 0 100 20" className={`w-full h-full stroke-mint-400 fill-none stroke-2 [stroke-dasharray:100] ${isConnected ? 'animate-[dash_2s_linear_infinite]' : ''}`}>
                    <polyline points="0,10 20,10 25,2 30,18 35,10 100,10" />
                </svg>
            </div>

            <div className="flex justify-between text-sm font-mono">
                <span className="text-gray-500">{DASHBOARD_CONTENT.metrics.health.finalizedLabel}</span>
                <span className="font-bold" style={{ color: isConnected ? '#39FF14' : '#9ca3af' }}>
                    #{finalizedBlock > 0 ? finalizedBlock.toLocaleString() : '---'}
                </span>
            </div>
        </section>
    );
};
