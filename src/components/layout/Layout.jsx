import { Outlet, useLocation } from "react-router-dom"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { SidebarTrigger } from "../ui/sidebar"

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b h-14 flex items-center px-4 lg:px-6">
          <SidebarTrigger className="mr-2" />
          <h1 className="text-lg font-semibold">Panel de Análisis de Archivos de Seguridad</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
