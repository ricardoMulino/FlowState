import { Moon, Sun, User, Shield, Paintbrush } from 'lucide-react';
import { useState } from 'react';

function Appearance({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) {
    return (
        <div className="col-span-12 lg:col-span-9 glass-panel rounded-3xl p-8 overflow-y-auto overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />

            <div className="z-10 w-full max-w-2xl text-slate-200">
                <h2 className="text-2xl font-bold mb-6">Appearance</h2>

                {/* Theme Toggle Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-300">Theme Preferences</h3>
                    <div className="bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div>
                            <p className="font-medium text-slate-200">Light / Dark Mode</p>
                        </div>

                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`relative flex items-center w-14 h-8 rounded-full border p-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-slate-300 border-slate-400 hover:border-slate-500'
                                }`}
                        >
                            <div
                                className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out z-10 ${isDarkMode ? 'translate-x-6 bg-slate-900 border border-slate-700' : 'translate-x-0 bg-white border border-slate-200'
                                    }`}
                            >
                                {isDarkMode ? (
                                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Account() {
    return (
        <div className="col-span-12 lg:col-span-9 glass-panel rounded-3xl p-8 overflow-y-auto overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
            <div className="z-10 w-full max-w-2xl text-slate-200">
                <h2 className="text-2xl font-bold mb-6">Account</h2>
                <div className="bg-white/5 rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                    <p className="text-slate-400 text-sm">Account settings functionality coming soon.</p>
                </div>
            </div>
        </div>
    );
}

function Privacy() {
    return (
        <div className="col-span-12 lg:col-span-9 glass-panel rounded-3xl p-8 overflow-y-auto overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
            <div className="z-10 w-full max-w-2xl text-slate-200">
                <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>
                <div className="bg-white/5 rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                    <p className="text-slate-400 text-sm">Privacy and security settings functionality coming soon.</p>
                </div>
            </div>
        </div>
    );
}

import { useSettingsContext } from './contexts/SettingsContext';

export default function Settings() {
    const { isDarkMode, updateSettings } = useSettingsContext();
    const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'privacy'>('appearance');

    const setIsDarkMode = (val: boolean) => {
        updateSettings({ light_mode: !val });
    };

    return (
        <div className="h-full p-6 overflow-hidden flex flex-col gap-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent shrink-0">
                Settings
            </h1>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left Sidebar for Settings Navigation */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'appearance'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`}>
                        <Paintbrush className="w-5 h-5" />
                        Appearance
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'account'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`}>
                        <User className="w-5 h-5" />
                        Account
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'privacy'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`}>
                        <Shield className="w-5 h-5" />
                        Privacy & Security
                    </button>
                </div>

                {/* Right Content Area */}
                {activeTab === 'appearance' && <Appearance isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
                {activeTab === 'account' && <Account />}
                {activeTab === 'privacy' && <Privacy />}
            </div>
        </div>
    );
}