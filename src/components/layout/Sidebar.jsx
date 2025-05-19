import { FileText, Home, Settings, Shield, Database, BarChart3, AlertTriangle } from "lucide-react"
import { useLocation, Link } from "react-router-dom"

import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar"
import { Button } from "../ui/button"
import { ModeToggle } from "../theme/mode-toggle"

export function Sidebar() {
  const location = useLocation()

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold">SecureScan</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")}>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/results")}>
                  <Link to="/results">
                    <FileText className="h-4 w-4" />
                    <span>Resultados de Análisis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarGroupLabel>Analítica</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/history")}> 
                  <Link to="/history">
                    <FileText className="h-4 w-4" />
                    <span>Historial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Analítica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/statistics")}>
                  <Link to="/statistics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Estadísticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/threats")}>
                  <Link to="/threats">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Reportes de Amenazas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/database")}>
                  <Link to="/database">
                    <Database className="h-4 w-4" />
                    <span>Base de Datos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configuración</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </SidebarComponent>
  )
}
