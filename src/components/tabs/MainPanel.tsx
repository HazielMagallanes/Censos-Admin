import React, { useEffect, useState } from "react";
import axios from "axios";
import { Map, FileDown, ChevronDown, Loader2, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { DashboardHeader } from "../ui/own/DashboardHeader";

// --- INTERFACES ---
interface Creator {
    nombre: string;
    apellido: string;
    correo_electronico: string;
}

interface MunicipioData {
    nombre: string;
}

interface CensoData {
    nombre: string;
    anio: number;
    municipio: MunicipioData; 
}

interface TipoData {
    id_tipo: number;
    nombre: string;
}
interface AtributoDetalle {
    nombre: string;
    tipo: TipoData;
}
interface AtributoRespuesta {
    atributo: AtributoDetalle;
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

interface MetaData {
    total: number;
    page: number;
    last_page: number;
}

const MainPanel: React.FC = () => {
    const [registros, setRegistros] = useState<RegistroCensal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);
    const LIMIT = 10;
    // Filtering
    const [dateOrder, setDateOrder] = useState<'desc' | 'asc'>('desc');
    const [mailFilter, setMailFilter] = useState<string>('');
    const [municipalityFilter, setMunicipalityFilter] = useState<string>('');
    // Fetch
    useEffect(() => {
        const fetchRegistros = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/census/uploads?page=${page}&limit=${LIMIT}&date=${dateOrder}&email=${mailFilter}&municipality=${municipalityFilter}`); 
                if (response.data) {
                    setRegistros(response.data.uploads);
                    setMeta(response.data.meta);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar los registros censales.");
            } finally {
                setLoading(false);
            }
        }
        fetchRegistros();
    }, [page, dateOrder, mailFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.last_page) setPage(newPage);
    };

    // Generador de números de página 
    const getPageNumbers = () => {
        const pages = [];
        const { last_page, page } = meta;
        
        // Siempre mostrar la primera página
        pages.push(1);
        if (page > 3) pages.push('...');
        // Rango alrededor de la página actual
        for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) pages.push(i);
        if (page < last_page - 2) pages.push('...');
        // Siempre mostrar la ultima
        if (last_page > 1) pages.push(last_page);

        return pages;
    };

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
            <DashboardHeader />

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
                                            <div className="bg-slate-200 p-1 rounded text-center text-slate-500 flex justify-between px-2 items-center cursor-pointer" 
                                            onClick={() => setDateOrder(dateOrder === 'desc' ? 'asc' : 'desc')}>
                                                Fecha {dateOrder === 'desc' ? <ChevronDown className="h-3 w-3"/> : <ChevronUp className="h-3 w-3"/>}
                                            </div>
                                        </th>
                                        <th className="p-3 font-medium">
                                            <input className="bg-slate-200 p-1 rounded text-left text-slate-500 flex justify-between px-2 items-center w-full" placeholder="Municipio" />
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
                                                    {row.censo.municipio.nombre}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {row.creator.nombre}{row.creator.apellido ? ` ${row.creator.apellido}`: ''}
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
                    
                    {/* --- PAGINATION FOOTER --- */}
                    {!loading && registros.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando pagina {meta.page} de {meta.last_page} (Total: {meta.total} registros)
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {getPageNumbers().map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                                    ) : (
                                        <Button
                                            key={`page-${p}`}
                                            variant={p === page ? "secondary" : "ghost"}
                                            size="sm"
                                            className={p === page ? "bg-slate-200 font-bold" : ""}
                                            onClick={() => handlePageChange(p as number)}
                                        >
                                            {p}
                                        </Button>
                                    )
                                ))}

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === meta.last_page}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
export default MainPanel;