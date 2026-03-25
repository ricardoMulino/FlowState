import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    LayoutDashboard,
    Calendar,
    Tag,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Telescope
} from 'lucide-react';
import { signOutUser } from '../../auth';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    const mainNavItems = [
        { icon: Home, label: 'Dashboard', path: '/dash' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: Telescope, label: 'Vantage', path: '/vantage' },
        { icon: Tag, label: 'Tags', path: '/tags' },
        { icon: Sparkles, label: 'Flow', path: '/flow' },
    ];

    const bottomNavItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.aside
            animate={{ width: isCollapsed ? 70 : 256 }}
            className="relative h-full shrink-0 transition-all duration-300 z-50"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-6 -right-3 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-[60] cursor-pointer shadow-md"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className={cn(
                "flex flex-col h-full gap-6 bg-card border-r border-border transition-all duration-300 overflow-hidden",
                isCollapsed ? "items-center px-2" : "px-4"
            )}>
                {/* Logo Area */}
                <div className={cn("h-20 flex items-center gap-3 shrink-0", isCollapsed && "justify-center")}>
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-900/20 shrink-0">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap"
                        >
                            FlowState
                        </motion.h1>
                    )}
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-2 w-full">
                    {mainNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-600/10 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/5",
                                    isCollapsed && "justify-center px-2"
                                )
                            }
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={cn(
                                "w-6 h-6 shrink-0 transition-transform duration-200",
                                !isCollapsed && "group-hover:scale-110"
                            )} />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap">{item.label}</span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section (Settings + Logout) */}
                <div className="mt-auto pb-4 space-y-2 w-full border-t border-border pt-4">
                    {bottomNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-600/10 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/5",
                                    isCollapsed && "justify-center px-2"
                                )
                            }
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className="w-6 h-6 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap">{item.label}</span>
                            )}
                        </NavLink>
                    ))}

                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-red-400 hover:text-red-300 hover:bg-red-900/10",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <LogOut className="w-6 h-6 shrink-0" />
                        {!isCollapsed && (
                            <span className="font-medium whitespace-nowrap">Sign Out</span>
                        )}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};
