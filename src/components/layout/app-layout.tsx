import { Outlet } from "@tanstack/react-router"
import { Navbar } from "@/components/layout/navbar"

export default function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground overflow-hidden">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
