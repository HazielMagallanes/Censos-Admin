import { SidebarTrigger } from "@/components/ui/shadcn/sidebar";
import { Bell, HelpCircle, Map, FileDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { useEffect } from "react";
import axios from "axios";
import { DashboardHeader } from "../ui/own/DashboardHeader";

const MainPanel: React.FC = () => {
    // Placeholder data for the table
    const tableRows = Array(8).fill({
        id: "Número de registro",
        date: "dd / mm / aaaa",
        muni: "Municipio",
        email: "correo.electronico@gmail.com",
        censusId: "#342345"
    }); 
   useEffect(() => {
        const fetchRegistros = async () => {
            try {
                const response = await axios.get('/census/uploads')
                if (response) console.table(response.data)
            } catch (error) {
                console.error(error);
            }
        }
        fetchRegistros();
    }, [])
    return (
        <div className="flex flex-col w-full h-full bg-slate-50">
            
            {/* --- TOP HEADER --- */}
            <DashboardHeader userRole="Admin" userName="Haziel" />

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-6 overflow-auto">
                
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-sky-600">Datos y Reportes</span>
                    <span>&gt;</span>
                    <span className="font-medium underline">Listado de registros censales</span>
                </div>

                {/* Toolbar / Actions */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md bg-white p-2 shadow-sm border">
                    <div className="flex items-center">
                        <Button variant="outline" className="gap-2">
                            Registros <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <Map className="h-4 w-4" /> Mapa interactivo
                        </Button>
                        <Button className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <FileDown className="h-4 w-4" /> Generar reporte
                        </Button>
                    </div>
                </div>

                {/* Table Structure */}
                <div className="rounded-md border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600">
                                <tr>
                                    <th className="p-3 font-medium text-center">#</th>
                                    <th className="p-3 font-medium"><div className="bg-slate-200 p-1 rounded text-center text-slate-500">Filtrar por número...</div></th>
                                    <th className="p-3 font-medium"><div className="bg-slate-200 p-1 rounded text-center text-slate-500 flex justify-between px-2">Filtrar fecha <ChevronDown className="h-3 w-3"/></div></th>
                                    <th className="p-3 font-medium"><div className="bg-slate-200 p-1 rounded text-center text-slate-500">Filtrar por municipio</div></th>
                                    <th className="p-3 font-medium"><div className="bg-slate-200 p-1 rounded text-center text-slate-500">Filtrar por correo</div></th>
                                    <th className="p-3 font-medium"><div className="bg-slate-200 p-1 rounded text-center text-slate-500 flex justify-between px-2">Filtrar ID <ChevronDown className="h-3 w-3"/></div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tableRows.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="p-4 text-center text-slate-500">{index + 1}</td>
                                        <td className="p-4">{row.id}</td>
                                        <td className="p-4">{row.date}</td>
                                        <td className="p-4">{row.muni}</td>
                                        <td className="p-4">{row.email}</td>
                                        <td className="p-4">{row.censusId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="flex items-center justify-center gap-2 border-t p-4">
                        <Button variant="ghost" size="sm" disabled>&lt;</Button>
                        <Button variant="outline" size="sm" className="bg-slate-100">1</Button>
                        <span className="text-slate-400">...</span>
                        <Button variant="ghost" size="sm">7</Button>
                        <Button variant="ghost" size="sm">8</Button>
                        <Button variant="secondary" size="sm" className="bg-slate-300">9</Button>
                        <Button variant="ghost" size="sm">10</Button>
                        <Button variant="ghost" size="sm">11</Button>
                        <span className="text-slate-400">...</span>
                        <Button variant="ghost" size="sm">21</Button>
                        <Button variant="ghost" size="sm" className="text-sky-600">&gt;</Button>
                    </div>
                </div>

            </main>
        </div>
    )
}
export default MainPanel;
