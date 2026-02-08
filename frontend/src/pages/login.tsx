import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInUser, signUpUser } from './auth.ts'

export function AuthPage() {
    const navigate = useNavigate()
    const [isLoginView, setIsLoginView] = useState(true) // Toggle between Login/Signup
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault()
        setMessage('')

        let result
        if (isLoginView) {
            result = await signInUser(email, password)
        } else {
            result = await signUpUser(email, password)
        }

        if (result.error) {
            console.error('Supabase Auth Error:', result.error);
            setMessage(`Error: ${result.error.message}`)
        } else {
            // Success handling
            console.log('Supabase Auth Success:', result.data);
            if (!isLoginView && !result.data.session) {
                // If signing up and "Confirm Email" is ON, session will be null
                setMessage('Registration successful! Please check your email to confirm.')
            } else {
                setMessage('Success! You are logged in.')
                navigate('/dash')
            }
        }
    }

    const cancelLogin = async () => {
        navigate('/');
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative z-10 mx-4 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        {isLoginView ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isLoginView ? 'Enter your credentials to access your account' : 'Sign up to start your journey with FlowState'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200 mt-6"
                    >
                        {isLoginView ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <p className="text-slate-400 text-sm mb-4">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => { setIsLoginView(!isLoginView); setMessage('') }}
                            className="ml-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            {isLoginView ? "Sign Up" : "Log In"}
                        </button>
                    </p>

                    <button
                        onClick={cancelLogin}
                        className="text-slate-500 hover:text-slate-300 text-xs transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Back to Landing
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-6 text-slate-600 text-xs text-center w-full">
                © {new Date().getFullYear()} FlowState. Secure Authentication
            </footer>
        </div>
    )
}