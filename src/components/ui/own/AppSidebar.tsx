import * as React from "react"
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

// Menu items based on your screenshot
const items = [
  {
    title: "Inicio",
    url: "#",
    icon: Home,
  },
  {
    title: "Territorio",
    url: "#",
    icon: Building2,
  },
  {
    title: "Atributos y Plantillas",
    url: "#",
    icon: FileText,
  },
  {
    title: "Formularios y Censos",
    url: "#",
    icon: ClipboardList,
  },
  {
    title: "Usuarios y Permisos",
    url: "#",
    icon: Users,
  },
  {
    title: "Datos y Reportes",
    url: "#",
    icon: BarChart3,
    isActive: true, // Set active to match screenshot
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="mb-2">
              <SidebarMenuButton 
                asChild 
                isActive={item.isActive}
                // Custom styling to mimic the blue buttons in the screenshot
                className={`h-12 justify-start rounded-md px-4 text-base font-medium transition-colors ${
                  item.isActive 
                    ? "bg-sky-700 text-white hover:bg-sky-800 hover:text-white" 
                    : "bg-sky-500 text-white hover:bg-sky-600 hover:text-white"
                }`}
              >
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="h-12 justify-start rounded-md bg-sky-500 px-4 text-base font-medium text-white hover:bg-sky-600 hover:text-white"
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