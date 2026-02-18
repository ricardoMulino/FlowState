import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInUser, signUpUser } from './auth.ts'

export default function AuthPage() {
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
        <div>
            <div></div>
            <div></div>

            <div>
                <div>
                    <h2>
                        {isLoginView ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p>
                        {isLoginView ? 'Enter your credentials to access your account' : 'Sign up to start your journey with FlowState'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                    >
                        {isLoginView ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {message && (
                    <div>
                        {message}
                    </div>
                )}

                <div>
                    <p>
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => { setIsLoginView(!isLoginView); setMessage('') }}
                        >
                            {isLoginView ? "Sign Up" : "Log In"}
                        </button>
                    </p>

                    <button
                        onClick={cancelLogin}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Back to Landing
                    </button>
                </div>
            </div>

            <footer>
                © {new Date().getFullYear()} FlowState. Secure Authentication
            </footer>
        </div>
    )
}