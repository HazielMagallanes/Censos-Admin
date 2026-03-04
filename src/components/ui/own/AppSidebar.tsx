import * as React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  Home,
  Building2,
  FileText,
  ClipboardList,
  Users,
  BarChart3,
  User
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/shadcn/sidebar"
import { useAuth } from "@/components/providers/AuthProvider"

// Menu items based on your screenshot
const items = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
    enabled: true,
  },
  {
    title: "Territorio",
    url: "/territorios",
    icon: Building2,
    enabled: true,
  },
  {
    title: "Atributos y Plantillas",
    url:"/plantillas",
    icon: FileText,
    enabled: true,
  },
  {
    title: "Formularios y Censos",
    url: "/formularios",
    icon: ClipboardList,
    enabled: true,
  },
  {
    title: "Usuarios y Permisos",
    url: null,
    icon: Users,
    enabled: false,
  },
  {
    title: "Datos y Reportes",
    url: null,
    icon: BarChart3,
    enabled: false,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { token } = useAuth()
  const location = useLocation()
  const navigator = useNavigate()
  
  if (!token) return;

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        {/* Logo Placeholder - Blue Box */}
        <div className="flex h-32 w-full flex-col items-center justify-center rounded-md bg-sky-600 text-white">
          <span className="text-lg font-bold">Logo</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url
            
            // Si el item no está habilitado, renderizarlo como deshabilitado
            if (!item.enabled) {
              return (
                <SidebarMenuItem key={item.title} className="mb-2">
                  <SidebarMenuButton 
                    disabled
                    className="h-12 justify-start rounded-md px-4 text-base font-medium transition-colors bg-slate-400 text-white cursor-not-allowed opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title} className="mb-2">
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={`h-12 justify-start rounded-md px-4 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-sky-700 text-white hover:bg-sky-800 hover:text-white" 
                      : "bg-sky-500 text-white hover:bg-sky-600 hover:text-white"
                  }`}
                >
                  <Link to={item.url || ""} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="h-12 justify-start rounded-md bg-sky-500 px-4 text-base font-medium text-white hover:bg-sky-600 hover:text-white"
              onClick={() => navigator("/cuenta")}
            >
              <User className="mr-2 h-5 w-5" />
              <span>Mi cuenta</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}