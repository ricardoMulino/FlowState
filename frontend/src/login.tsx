import { useState, type FormEvent } from 'react'
import { signInUser, signUpUser } from './auth.ts' // Import from your helper file

export default function AuthPage() {
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
            setMessage(`Error: ${result.error.message}`)
        } else {
            // Success handling
            if (!isLoginView && !result.data.session) {
                // If signing up and "Confirm Email" is ON, session will be null
                setMessage('Registration successful! Please check your email to confirm.')
            } else {
                setMessage('Success! You are logged in.')
                // Redirect logic goes here (e.g., router.push('/dashboard'))
            }
        }
    }

    return (
        <div className="auth-container">
            <h2>{isLoginView ? 'Login' : 'Sign Up'}</h2>

            <form onSubmit={handleAuth}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">
                    {isLoginView ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            {message && <p className="message">{message}</p>}

            <p onClick={() => setIsLoginView(!isLoginView)} style={{ cursor: 'pointer', color: 'blue' }}>
                {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
        </div>
    )
}