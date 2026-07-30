import { create } from "zustand"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  role: "user" | "admin" | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authMode: "signin" | "signup"

  syncEnabled: boolean

  setAuthModalOpen: (open: boolean, mode?: "signin" | "signup") => void
  setAuthMode: (mode: "signin" | "signup") => void
  setSyncEnabled: (enabled: boolean) => void
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

async function fetchUserRole(userId: string): Promise<"user" | "admin"> {
  const client = supabase
  if (!client) return "user"
  try {
    const { data, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()
    if (error || !data) return "user"
    return (data.role as "user" | "admin") || "user"
  } catch {
    return "user"
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  isAuthModalOpen: false,
  authMode: "signin",
  syncEnabled: false,

  setAuthModalOpen: (open, mode) =>
    set((state) => ({
      isAuthModalOpen: open,
      authMode: mode ?? state.authMode,
    })),

  setAuthMode: (mode) => set({ authMode: mode }),

  setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),

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
        set({ user: null, session: null, role: null, isLoading: false, syncEnabled: false })
        return
      }

      const role = await fetchUserRole(data.user.id)
      const { data: sessionData } = await client.auth.getSession()
      set({
        session: sessionData.session,
        user: data.user,
        role,
        isLoading: false,
      })

      client.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          set({ session: null, user: null, role: null, isLoading: false, syncEnabled: false })
        } else {
          const { data: userData, error: userError } =
            await client.auth.getUser()
          if (userError || !userData.user) {
            await client.auth.signOut()
            set({ session: null, user: null, role: null, isLoading: false, syncEnabled: false })
          } else {
            const userRole = await fetchUserRole(userData.user.id)
            set({
              session,
              user: userData.user,
              role: userRole,
              isLoading: false,
            })
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
    const role = data.user ? await fetchUserRole(data.user.id) : "user"
    set({ isLoading: false, session: data.session, user: data.user, role })
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
      set({
        isLoading: false,
        session: data.session,
        user: data.user,
        role: "user",
      })
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
    set({ user: null, session: null, role: null, isLoading: false, syncEnabled: false })
  },
}))
