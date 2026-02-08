<<<<<<< HEAD
import React from 'react';

=======
import { useState } from 'react';
import { Calendar as CalendarIcon, Filter, LogOut } from 'lucide-react';
import { signOutUser } from '../../auth.ts';
import { useNavigate } from 'react-router-dom';
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    return (
<<<<<<< HEAD
        <header className="flex items-center justify-between px-8 py-5 mb-8">
=======
        <header className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl relative z-30">
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
            <div className="flex items-center gap-3">
                {/* Logo moved to Sidebar, keeping this empty or for breadcrumbs later */}
                <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white shadow-sm border border-white/5 transition-all">
                        Current Week
                    </button>
<<<<<<< HEAD
                </div>

                <div className="pl-4 border-l border-white/10">
                    <button className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-900 shadow-lg group-hover:shadow-blue-500/20 transition-all" />
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Ricardo</p>
                            <p className="text-xs text-slate-400">Pro Plan</p>
                        </div>
                    </button>
                </div>
=======

                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                        <Filter className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-900 shadow-lg hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                        title="Open Menu"
                    />

                    {isMenuOpen && (
                        <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
            </div>
        </header>
    );
};

export default Header;
