import { useEffect } from "react"
import { Outlet, useLocation } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuthStore } from "@/stores/auth-store"

export default function AppLayout() {
  const location = useLocation()
  const initAuth = useAuthStore((state) => state.initAuth)
  const isPlayerRoute = location.pathname.includes("/netflix")

  useEffect(() => {
    void initAuth()
  }, [initAuth])

  if (isPlayerRoute) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-black">
        <Outlet />
        <AuthModal />
      </main>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
    </div>
  )
}
