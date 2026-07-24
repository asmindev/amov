import { create } from "zustand"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authMode: "signin" | "signup"

  setAuthModalOpen: (open: boolean, mode?: "signin" | "signup") => void
  setAuthMode: (mode: "signin" | "signup") => void
  initAuth: () => Promise<void>
  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ error: Error | null }>
  signUpWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: "signin",

  setAuthModalOpen: (open, mode) =>
    set((state) => ({
      isAuthModalOpen: open,
      authMode: mode ?? state.authMode,
    })),

  setAuthMode: (mode) => set({ authMode: mode }),

  initAuth: async () => {
    if (!supabase) {
      set({ isLoading: false })
      return
    }

    try {
      const { data } = await supabase.auth.getSession()
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isLoading: false,
      })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, isLoading: false })
      })
    } catch {
      set({ isLoading: false })
    }
  },

  signInWithEmail: async (email, password) => {
    if (!supabase) return { error: new Error("Supabase is not configured") }
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    set({ isLoading: false, session: data.session, user: data.user })
    if (!error) get().setAuthModalOpen(false)
    return { error: error ? new Error(error.message) : null }
  },

  signUpWithEmail: async (email, password) => {
    if (!supabase) return { error: new Error("Supabase is not configured") }
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signUp({ email, password })
    set({ isLoading: false, session: data.session, user: data.user })
    if (!error && data.session) get().setAuthModalOpen(false)
    return { error: error ? new Error(error.message) : null }
  },

  signOut: async () => {
    if (!supabase) return
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, session: null, isLoading: false })
  },
}))
