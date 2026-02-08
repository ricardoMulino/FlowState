import { useNavigate } from "react-router-dom";

export function Landing() {
    const navigate = useNavigate();

    const LogSign = () => {
        navigate('/login');
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

            <div className="glass-panel p-12 rounded-3xl max-w-lg w-full text-center relative z-10 mx-4 shadow-2xl border border-white/10">
                <h1 className="text-6xl font-black mb-4 tracking-tight">
                    <span className="text-gradient">FlowState</span>
                </h1>
                <p className="text-slate-400 mb-8 text-lg font-light leading-relaxed">
                    Capture your thoughts with clarity. <br />
                    Secure, simple, and beautiful.
                </p>

                <button
                    onClick={LogSign}
                    className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </span>
                </button>

                <div className="mt-8 flex justify-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Secure
                    </span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                        Private
                    </span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m16 10-4 4-6-6" /></svg>
                        Fast
                    </span>
                </div>
            </div>

            <footer className="absolute bottom-6 text-slate-600 text-xs text-center w-full">
                © {new Date().getFullYear()} FlowState. All rights reserved.
            </footer>
        </div>
    );
}

export default Landing;