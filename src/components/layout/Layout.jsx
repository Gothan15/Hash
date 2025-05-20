import { Outlet, useLocation, Link } from "react-router-dom";
import { Suspense } from "react";
import {
  Loader2,
  Menu,
  FileText,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Layout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}

function LayoutContent() {
  const { open, openMobile, setOpen, setOpenMobile, isMobile } = useSidebar();

  // Determinar si se debe mostrar el overlay basado en el estado del sidebar
  const showOverlay = isMobile ? openMobile : open;

  // Función para cerrar el sidebar cuando se hace clic en el overlay
  const handleOverlayClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  // Accesos rápidos para el header
  const shortcuts = [
    {
      title: "Analizador",
      icon: <BarChart3 className="h-4 w-4" />,
      path: "/",
    },
    {
      title: "Resultados",
      icon: <FileText className="h-4 w-4" />,
      path: "/results",
    },
    {
      title: "Historial",
      icon: <FileText className="h-4 w-4" />,
      path: "/history",
    },

    {
      title: "Configuración",
      icon: <Settings className="h-4 w-4" />,
      path: "/settings",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      {/* Overlay que se muestra cuando el sidebar está abierto */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Botón flotante para controlar el sidebar - visible solo cuando está cerrado */}
      <div
        className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
          showOverlay
            ? "opacity-0 -translate-x-10 pointer-events-none"
            : "opacity-100 translate-x-0"
        }`}
      >
        <SidebarTrigger className="size-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:shadow-xl hover:scale-105 transition-all duration-300">
          <Menu className="size-6" />
        </SidebarTrigger>
      </div>

      {/* Sidebar con posición z-index superior al overlay */}
      <div className="z-40 relative">
        <Sidebar />
      </div>

      {/* Contenido principal que ocupa toda la pantalla */}
      <div className="min-w-screen w-full flex flex-col">
        <header
          className={`h-14 flex items-center px-4 lg:px-6 bg-background relative ${
            showOverlay ? "border-transparent shadow-sm" : "border-b"
          }`}
        >
          <Shield className="h-6 w-6 mx-2 text-primary" />
          <h1 className="text-lg font-semibold ml-2 mr-4">
            Panel de Análisis de Archivos de Seguridad
          </h1>

          {/* Accesos Rápidos en el Header */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <TooltipProvider>
              {shortcuts.map((shortcut, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link to={shortcut.path}>
                        {shortcut.icon}
                        <span className="hidden lg:inline-block">
                          {shortcut.title}
                        </span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{shortcut.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
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
  );
}
