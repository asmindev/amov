import { useEffect } from "react"
import { Outlet, useLocation } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Footer } from "@/components/layout/footer"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuthStore } from "@/stores/auth-store"
import { useAnalyticsTracker } from "@/hooks/use-analytics-tracker"

export default function AppLayout() {
  const location = useLocation()
  const initAuth = useAuthStore((state) => state.initAuth)
  const isPlayerRoute = location.pathname.includes("/netflix")

  useAnalyticsTracker()

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
      <BottomNav />
      <AuthModal />
    </div>
  )
}
