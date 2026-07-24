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
    const client = supabase
    if (!client) {
      set({ isLoading: false })
      return
    }

    try {
      const { data, error } = await client.auth.getUser()

      if (error || !data.user) {
        await client.auth.signOut()
        set({ user: null, session: null, isLoading: false })
        return
      }

      const { data: sessionData } = await client.auth.getSession()
      set({
        session: sessionData.session,
        user: data.user,
        isLoading: false,
      })

      client.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          set({ session: null, user: null, isLoading: false })
        } else {
          const { data: userData, error: userError } =
            await client.auth.getUser()
          if (userError || !userData.user) {
            await client.auth.signOut()
            set({ session: null, user: null, isLoading: false })
          } else {
            set({ session, user: userData.user, isLoading: false })
          }
        }
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
    if (error) {
      set({ isLoading: false })
      return { error: new Error(error.message) }
    }
    set({ isLoading: false, session: data.session, user: data.user })
    get().setAuthModalOpen(false)
    return { error: null }
  },

  signUpWithEmail: async (email, password) => {
    if (!supabase) return { error: new Error("Supabase is not configured") }
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ isLoading: false })
      return { error: new Error(error.message) }
    }
    if (data.session) {
      set({ isLoading: false, session: data.session, user: data.user })
      get().setAuthModalOpen(false)
    } else {
      set({ isLoading: false })
    }
    return { error: null }
  },

  signOut: async () => {
    if (!supabase) return
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, session: null, isLoading: false })
  },
}))
