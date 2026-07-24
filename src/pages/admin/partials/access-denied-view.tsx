import { Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AccessDeniedView() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-6 pt-24 text-center">
      <Card className="items-center border-red-500/20 bg-red-500/5">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
            <span className="material-symbols-outlined text-[32px]">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Access Restricted
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            You do not have administrative privileges to view the Analytics
            Dashboard. Only users with the{" "}
            <span className="font-semibold text-red-400">Admin</span> role can
            access this page.
          </p>
          <Button
            variant="destructive"
            size="lg"
            className="mt-2"
            render={<Link to="/" />}
          >
            Return to Home Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
