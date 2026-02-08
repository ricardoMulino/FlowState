import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOutUser } from '../../pages/auth.ts';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/');
    };

    const switchAccount = async () => {
        await signOutUser();
        navigate('/login');
    }

    return (
        <header className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl relative z-30">
            <div className="flex items-center gap-3">
                {/* Logo moved to Sidebar, keeping this empty or for breadcrumbs later */}
                <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white shadow-sm border border-white/5 transition-all">
                        Current Week
                    </button>
                    {/* Filter button was here in incoming, keeping it simple for now or adding back if needed */}
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
                                onClick={switchAccount}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Switch Account
                            </button>
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
