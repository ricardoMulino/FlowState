import { useState, useRef, useEffect } from 'react';
import { LogOut, Sparkles, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFlowBot } from '../../hooks/useFlowBot';
import { cn } from '../../lib/utils';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<'flobot' | 'profile' | false>(false);
    const { email, signOut } = useAuth();
    const { messages, sendMessage, isTyping, clearHistory } = useFlowBot();
    const [inputValue, setInputValue] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await signOut();
    };

    const switchAccount = async () => {
        await signOut();
    }

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <header className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl relative z-30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FlowState</h2>
                    <p className="text-xs text-muted-foreground">{email || 'Loading...'}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(isMenuOpen === 'flobot' ? false : 'flobot')}
                        className={cn(
                            "group flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border transition-all duration-300",
                            isMenuOpen === 'flobot'
                                ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10"
                        )}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className={cn(
                            "text-sm font-medium transition-colors",
                            isMenuOpen === 'flobot' ? "text-blue-300" : "text-slate-300 group-hover:text-white"
                        )}>
                            What's the Flow?
                        </span>
                    </button>

                    {isMenuOpen === 'flobot' && (
                        <div className="absolute top-14 right-0 w-80 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[500px]">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">FloBot AI</h3>
                                        <p className="text-[10px] text-muted-foreground">Your flow companion</p>
                                    </div>
                                </div>
                                <button
                                    onClick={clearHistory}
                                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                    title="Clear Chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div
                                ref={chatContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-[200px]"
                            >
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn(
                                        "max-w-[85%] rounded-2xl p-3 text-sm animate-in fade-in slide-in-from-bottom-1 duration-300",
                                        msg.role === 'user'
                                            ? "ml-auto bg-primary/20 text-foreground border border-primary/20 rounded-tr-none"
                                            : "mr-auto bg-muted text-muted-foreground border border-border rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="mr-auto bg-muted text-muted-foreground border border-border rounded-2xl rounded-tl-none p-3 flex items-center gap-2 text-xs italic">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Thinking...
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-border flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask FloBot..."
                                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(isMenuOpen === 'profile' ? false : 'profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-background shadow-lg hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                        title="Open Menu"
                    />

                    {isMenuOpen === 'profile' && (
                        <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={switchAccount}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Switch Account
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
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
