import React, { useEffect, useState } from "react";
import axios from "axios";
import { Map, FileDown, ChevronDown, Loader2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { DashboardHeader } from "../ui/own/DashboardHeader";

// Definimos la estructura de datos basada en lo que devuelve tu census.service.ts
interface Creator {
    nombre: string;
    apellido: string;
    correo_electronico: string;
}

interface CensoData {
    nombre: string;
    anio: number;
}

interface AtributoRespuesta {
    atributo: {
        nombre: string;
        tipo: string; // Esto viene de tu relación con 'Tipo'
    };
    valor: string;
}

interface RegistroCensal {
    id_registro: number;
    fecha: string;
    ubicacion: string | null; 
    confirmado: boolean;
    id_censo: number;
    censo: CensoData;
    creator: Creator;
    atributos: AtributoRespuesta[]; 
}

const MainPanel: React.FC = () => {
    const [registros, setRegistros] = useState<RegistroCensal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filtering
    const [dateOrder, setDateOrder] = useState<'desc' | 'asc'>('desc');

    // Fetch
    useEffect(() => {
        const fetchRegistros = async () => {
            try {
                const response = await axios.get('/census/uploads'); 
                if (response.data) setRegistros(response.data.uploads);
            } catch (err) {
                console.error(err);
                setError("Error al cargar los registros censales.");
            } finally {
                setLoading(false);
            }
        }
        fetchRegistros();
    }, []);

    // Formateador de fecha: dd / mm / aaaa
    const formatDate = (isoString: string) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-50">
            
            {/* Header reutilizable */}
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
                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
                            <Loader2 className="animate-spin" /> Cargando datos...
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600">
                                    <tr>
                                        <th className="p-3 font-medium text-center">#</th>
                                        <th className="p-3 font-medium">
                                            <div className="bg-slate-200 p-1 rounded text-center text-slate-500">
                                                Nro Registro
                                            </div>
                                        </th>
                                        <th className="p-3 font-medium">
                                            <div className="bg-slate-200 p-1 rounded text-center text-slate-500 flex justify-between px-2 items-center" 
                                            onClick={() => setDateOrder(dateOrder === 'desc' ? 'asc' : 'desc')}>
                                                Fecha {dateOrder === 'desc' ? <ChevronDown className="h-3 w-3"/> : <ChevronUp className="h-3 w-3"/>}
                                            </div>
                                        </th>
                                        <th className="p-3 font-medium">
                                            <div className="bg-slate-200 p-1 rounded text-center text-slate-500">
                                                Municipio / Ubicación
                                            </div>
                                        </th>
                                        <th className="p-3 font-medium">
                                            <input className="bg-slate-200 p-1 rounded text-left text-slate-500 flex justify-between px-2 items-center w-full" placeholder="Usuario (Email)" />
                                        </th>
                                        <th className="p-3 font-medium">
                                            <input className="bg-slate-200 p-1 rounded text-left text-slate-500 flex justify-between px-2 items-center w-full" placeholder="Censo" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {registros.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                No hay registros censales disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        registros.map((row, index) => (
                                            <tr key={row.id_registro} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 text-center text-slate-500 font-mono">
                                                    {index + 1}
                                                </td>
                                                <td className="p-4 font-medium text-slate-700">
                                                    {row.id_registro}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {formatDate(row.fecha)}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {row.ubicacion || "Sin ubicación especificada"}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {row.creator.nombre} {row.creator.apellido}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {row.creator.correo_electronico}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                        #{row.id_censo} - {row.censo.nombre}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* Pagination Footer (Estático por ahora, funcionalidad requiere backend pagination) */}
                    <div className="flex items-center justify-center gap-2 border-t p-4">
                        <Button variant="ghost" size="sm" disabled>&lt;</Button>
                        <Button variant="outline" size="sm" className="bg-slate-100">1</Button>
                        <span className="text-slate-400 text-xs">Mostrando {registros.length} resultados</span>
                        <Button variant="ghost" size="sm" disabled>&gt;</Button>
                    </div>
                </div>

            </main>
        </div>
    )
}
export default MainPanel;