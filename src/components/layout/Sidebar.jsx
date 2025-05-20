import {
  FileText,
  Home,
  Settings,
  Shield,
  Database,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

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
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme/mode-toggle";

export function Sidebar() {
  const location = useLocation();
  const { toggleSidebar, setOpen, setOpenMobile, isMobile } = useSidebar();

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Función para cerrar el sidebar al hacer clic en un enlace
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <SidebarComponent>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">SecureScan</span>
          </div>
          <SidebarTrigger className="md:flex size-8 rounded-md hover:bg-muted transition-colors" />
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sm font-medium">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/")}
                  tooltip="Panel"
                >
                  <Link to="/" onClick={handleLinkClick}>
                    <Home className="h-5 w-5" />
                    <span>Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/results")}
                  tooltip="Resultados"
                >
                  <Link to="/results" onClick={handleLinkClick}>
                    <FileText className="h-5 w-5" />
                    <span>Resultados de Análisis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-4 text-sm font-medium">
            Analítica
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/history")}
                  tooltip="Historial"
                >
                  <Link to="/history" onClick={handleLinkClick}>
                    <FileText className="h-5 w-5" />
                    <span>Historial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/statistics")}
                  tooltip="Estadísticas"
                >
                  <Link to="/statistics" onClick={handleLinkClick}>
                    <BarChart3 className="h-5 w-5" />
                    <span>Estadísticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings" onClick={handleLinkClick}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configuración</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
}
