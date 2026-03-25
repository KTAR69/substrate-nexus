import React from 'react';
import { usePaseoSync } from '../../hooks/usePaseoSync';
import { DASHBOARD_CONTENT } from '../../data/mockData';

export const DashboardHeader: React.FC = () => {
    const { networkStatus } = usePaseoSync();

    const isConnected = networkStatus === 'Connected';
    const statusColor = isConnected ? 'text-mint-400' : 'text-gray-400';
    const indicatorColor = isConnected ? 'bg-mint-400 shadow-[0_0_10px_#00ff9d]' : 'bg-gray-500';

    return (
        <header className="flex justify-between items-center p-4 bg-surface border border-mint-500/30 rounded-xl backdrop-blur-md shadow-neon">
            <div className="flex items-center gap-2 text-mint-400 font-mono font-bold tracking-widest">
                <span>{DASHBOARD_CONTENT.header.logo}</span>
                <span>{DASHBOARD_CONTENT.header.title}</span>
            </div>
            <div className={`flex items-center gap-2 text-xs font-mono ${statusColor} transition-colors duration-500`}>
                <span className={`w-2 h-2 rounded-full ${indicatorColor} animate-pulse`}></span>
                <span>PASEO: {networkStatus.toUpperCase()}</span>
            </div>
        </header>
    );
};
