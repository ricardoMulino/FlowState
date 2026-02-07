import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 1. Sign Up
export const signUpUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // data: { username: 'johndoe' } // Optional: Add extra metadata here
    })
    return { data, error }
}

// 2. Sign In
export const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

// 3. Sign Out
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

// 4. Get Current User (useful for checking state)
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
