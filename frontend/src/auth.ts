import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Safe initialization
const isValidUrl = (url: string) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
            signOut: async () => ({ error: null }),
            getUser: async () => ({ data: { user: null } }),
        }
    } as any;

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
