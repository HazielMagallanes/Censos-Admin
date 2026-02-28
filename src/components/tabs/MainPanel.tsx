import React, { useEffect, useState } from "react";
import axios from "axios";
import { Map, FileDown, ChevronDown, Loader2, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

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

const TempJSONView: React.FC<{ data: RegistroCensal | undefined }> = ({ data }) => {
    if (!data) return null;
    return (
        <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}

const MainPanel: React.FC = () => {
    const [registros, setRegistros] = useState<RegistroCensal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);
    const LIMIT = 10;
    
    // Filtering States
    const [idFilter, setIdFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [mailFilter, setMailFilter] = useState<string>('');
    const [municipalityIdFilter, setMunicipalityIdFilter] = useState<string>('');
    const [censusIdFilter, setCensusIdFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Modal state
    const [open, setOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<number | undefined>();

    // Fetch con Debounce
    useEffect(() => {
        const fetchRegistros = async () => {
            setLoading(true);
            try {
                // Construir query params dinámicamente
                const params = new URLSearchParams({ 
                    page: page.toString(), 
                    limit: LIMIT.toString() 
                });

                if (idFilter) params.append('id', idFilter);
                if (dateFilter) params.append('date', dateFilter);
                if (mailFilter) params.append('mail', mailFilter);
                if (municipalityIdFilter) params.append('municipalityId', municipalityIdFilter);
                if (censusIdFilter) params.append('censusId', censusIdFilter);
                if (statusFilter) params.append('status', statusFilter);

                const response = await axios.get(`/census/uploads?${params.toString()}`); 
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
        };

        // Debounce de 500ms para evitar spam a la API al escribir
        const timeoutId = setTimeout(() => {
            fetchRegistros();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, idFilter, dateFilter, mailFilter, municipalityIdFilter, censusIdFilter, statusFilter]);

    // Resetea a la página 1 cada vez que un filtro cambia
    useEffect(() => {
        setPage(1);
    }, [idFilter, dateFilter, mailFilter, municipalityIdFilter, censusIdFilter, statusFilter]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.last_page) setPage(newPage);
    };

    // Generador de números de página 
    const getPageNumbers = () => {
        const pages = [];
        const { last_page, page } = meta;
        
        pages.push(1);
        if (page > 3) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) pages.push(i);
        if (page < last_page - 2) pages.push('...');
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
            {open && registros.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
                            <h2 className="text-lg font-semibold">Data Preview</h2>
                            <button className="text-slate-500 hover:text-slate-700 font-bold" onClick={() => setOpen(false)}>✕</button>
                        </div>
                        <div className="p-4 overflow-auto">
                            <TempJSONView data={registros[selected ?? 0]} />
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="flex gap-2 items-center">
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
                                    <th className="p-3 text-center">#</th>

                                    <th className="p-3">
                                    <input
                                        type="number"
                                        placeholder="Filtrar por ID"
                                        className="bg-slate-200 p-1 rounded w-full text-sm"
                                        value={idFilter}
                                        onChange={(e) => setIdFilter(e.target.value)}
                                    />
                                    </th>

                                    <th className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Filtrar por censista (mail)"
                                        className="bg-slate-200 p-1 rounded w-full text-sm"
                                        value={mailFilter}
                                        onChange={(e) => setMailFilter(e.target.value)}
                                    />
                                    </th>

                                    <th className="p-3">
                                    <input
                                        type="number"
                                        placeholder="Filtrar por municipio"
                                        className="bg-slate-200 p-1 rounded w-full text-sm"
                                        value={municipalityIdFilter}
                                        onChange={(e) => setMunicipalityIdFilter(e.target.value)}
                                    />
                                    </th>

                                    <th className="p-3">
                                    <input
                                        type="date"
                                        className="bg-slate-200 p-1 rounded w-full text-sm"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    />
                                    </th>

                                    <th className="p-3">
                                    <select
                                        className="bg-slate-200 p-1 rounded w-full text-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">Filtrar por estado</option>
                                        <option value="true">Confirmado</option>
                                        <option value="false">Pendiente</option>
                                    </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y relative">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="h-64">
                                            <div className="absolute inset-0 flex justify-center items-center text-slate-500 gap-2 bg-white/50 backdrop-blur-sm z-10">
                                                <Loader2 className="animate-spin" /> Cargando datos...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-red-500 h-64">
                                            {error}
                                        </td>
                                    </tr>
                                ) : registros.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 h-64">
                                            No se encontraron registros para estos filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    registros.map((row, index) => (
                                        <tr
                                        key={row.id_registro}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelected(index);
                                            setOpen(true);
                                        }}
                                        >
                                            <td className="p-4 text-center text-slate-500 font-mono">
                                                {((page - 1) * LIMIT) + index + 1}
                                            </td>

                                            <td className="p-4 font-medium text-slate-700">
                                                {row.id_registro}
                                            </td>

                                            <td className="p-4 text-slate-600">
                                                {row.creator.correo_electronico}
                                            </td>

                                            <td className="p-4 text-slate-600">
                                                {row.censo.municipio?.nombre || "-"}
                                            </td>

                                            <td className="p-4 text-slate-600">
                                                {formatDate(row.fecha)}
                                            </td>

                                            <td className="p-4">
                                                <span
                                                className={`px-2 py-1 rounded text-xs font-medium border
                                                    ${row.confirmado
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    }`}
                                                >
                                                {row.confirmado ? "Confirmado" : "Pendiente"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- PAGINATION FOOTER --- */}
                    {!error && registros.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando página {meta.page} de {meta.last_page} (Total: {meta.total} registros)
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