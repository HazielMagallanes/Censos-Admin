import { SidebarTrigger } from "@/components/ui/shadcn/sidebar"
import { Button } from "@/components/ui/shadcn/button"
import { HelpCircle, Bell, ChevronDown } from "lucide-react"

interface DashboardHeaderProps {
  userRole?: string;
  userName?: string;
}

export function DashboardHeader({ 
  userRole = "Rol de Usuario", 
  userName = "Nombre de Usuario" 
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold text-slate-800">S.C.F</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="bg-sky-600 text-white hover:bg-sky-700">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-sky-600 text-white hover:bg-sky-700">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 rounded-md border bg-white p-1 px-3">
          <span className="text-sm font-medium text-slate-500">{userRole}</span>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-white p-1 px-3">
          <span className="text-sm font-medium text-slate-700">{userName}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  )
}