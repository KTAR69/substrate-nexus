import React from 'react';
import { DASHBOARD_CONTENT } from './data/mockData';
import { BlockMonitor } from './components/stitch/BlockMonitor';
import { DashboardHeader } from './components/stitch/DashboardHeader';
import { RegistrationForm } from './components/stitch/RegistrationForm';

export const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-white p-6 font-sans flex flex-col gap-6">
            {/* Header with Live Status */}
            <DashboardHeader />

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {/* 1. Live Block Monitor Component */}
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

                {/* 4. Verified Consultant Registration Form (Full Width) */}
                <RegistrationForm />
            </main>
        </div>
    );
};
