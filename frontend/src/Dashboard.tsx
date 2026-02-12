import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { DASHBOARD_CONTENT } from './data/mockData';
import { BlockMonitor } from './components/stitch/BlockMonitor';

const firebaseConfig = {
    // ... config (placeholders as per previous iterations)
    apiKey: "AIzaSy...YourKey",
    authDomain: "substrate-nexus-9182.firebaseapp.com",
    projectId: "substrate-nexus-9182",
    storageBucket: "substrate-nexus-9182.appspot.com",
    messagingSenderId: "982569499047",
    appId: "1:982569499047:web:..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const Dashboard: React.FC = () => {
    // Keeping consultants state for potential Firestore integration in the Gatekeeper card
    const [consultants, setConsultants] = useState<any[]>([]);

    return (
        <div className="min-h-screen bg-background text-white p-6 font-sans flex flex-col gap-6">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-surface border border-mint-500/30 rounded-xl backdrop-blur-md shadow-neon">
                <div className="flex items-center gap-2 text-mint-400 font-mono font-bold tracking-widest">
                    <span>{DASHBOARD_CONTENT.header.logo}</span>
                    <span>{DASHBOARD_CONTENT.header.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse shadow-[0_0_10px_#00ff9d]"></span>
                    <span>{DASHBOARD_CONTENT.header.status}</span>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {/* 1. Modular Block Monitor Component */}
                <BlockMonitor />

                {/* 2. Coretime Status Card */}
                <section className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:border-mint-400 transition-colors duration-300 group hover:shadow-neon">
                    <div>
                        <h3 className="font-mono text-xs text-gray-500 mb-2 group-hover:text-mint-400 transition-colors">
                            {DASHBOARD_CONTENT.metrics.coretime.label}
                        </h3>
                        <span className="text-3xl font-bold font-mono tracking-tighter">
                            {DASHBOARD_CONTENT.metrics.coretime.value}
                        </span>
                    </div>
                    <div>
                        <div className="inline-block px-3 py-1 bg-mint-400/10 text-mint-400 rounded text-xs font-mono mb-4 border border-mint-400/20">
                            {DASHBOARD_CONTENT.metrics.coretime.status}
                        </div>
                        <div className="flex justify-between text-xs font-mono mt-2 border-t border-white/5 pt-2">
                            <span className="text-gray-500">{DASHBOARD_CONTENT.metrics.coretime.regionLabel}</span>
                            <span className="text-white">{DASHBOARD_CONTENT.metrics.coretime.regionValue}</span>
                        </div>
                    </div>
                </section>

                {/* 3. AI Gatekeeper Card */}
                <section className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:border-mint-400 transition-colors duration-300 group hover:shadow-neon md:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-mono text-xs text-gray-500 group-hover:text-mint-400 transition-colors">
                            {DASHBOARD_CONTENT.metrics.gatekeeper.label}
                        </h3>
                        <span className="text-xs font-mono text-mint-400 bg-mint-400/10 px-2 py-0.5 rounded border border-mint-400/20">
                            {DASHBOARD_CONTENT.metrics.gatekeeper.status}
                        </span>
                    </div>
                    <div className="flex-grow flex flex-col justify-end">
                        <div className="font-mono text-xs space-y-2 max-h-[150px] overflow-hidden" id="audit-log">
                            {/* Placeholder for log stream */}
                            <div className="flex gap-2 text-gray-500">
                                <span>[14:30:22]</span>
                                <span className="text-white">System Initialized.</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
