import { useState } from 'react';
import { Calendar as CalendarIcon, Filter, LogOut } from 'lucide-react';
import { signOutUser } from '../../auth.ts';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl relative z-30">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    FlowState
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    {/* Placeholder for future category toggles if needed, generic for now */}
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                        Current Week
                    </button>

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
            </div>
        </header>
    );
};

export default Header;
