import { Outlet, useLocation } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function AppLayout() {
  const location = useLocation()
  const isPlayerRoute = location.pathname.includes("/netflix")

  if (isPlayerRoute) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-black">
        <Outlet />
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
    </div>
  )
}
