import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Settings,
    LogOut
} from 'lucide-react';
import { signOutUser } from '../../pages/auth';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dash' },
        { icon: Calendar, label: 'Tags', path: '/tags' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-20 lg:w-64 flex flex-col h-full gap-6 shrink-0 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center gap-3 px-4 lg:px-6">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-900/20">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <h1 className="hidden lg:block text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    FlowState
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link group ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        <span className="hidden lg:block font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-900/10 hover:border-red-900/20"
                >
                    <LogOut className="w-6 h-6 shrink-0" />
                    <span className="hidden lg:block font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
