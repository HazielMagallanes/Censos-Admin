import React, { useEffect, useState } from "react";
import axios from "axios";
import {  ChevronDown, Loader2, ChevronLeft, ChevronRight, SquarePlus, Trash2} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { useNavigate } from "react-router";
import CreateTemplate from "./CreateTemplate";

// --- INTERFACES ---


interface Atributo {
    id_atributo: number;
    nombre: string;
    id_tipo: number;
    duplicable: boolean;
    plantilla: boolean;
    created_at: string;
    updated_at: string;
}

interface MetaData {
    total: number;
    page: number;
    last_page: number;
}

interface TemplateManagementProps {
    onToggleScene?: (value: boolean) => void;
    isActive?: boolean;
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ onToggleScene = () => {}, isActive = false }) => {

    const [atributos, setAtributos] = useState<Atributo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();
    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);
    const LIMIT = 10;
    
    // Filtering States
    const [idFilter, setIdFilter] = useState<string>('');
    const [isEliminating, setIsEliminating] = useState<boolean>(false);
    const [dateFilter, setDateFilter] = useState<string>('');
    const [mailFilter, setMailFilter] = useState<string>('');
    const [municipalityIdFilter, setMunicipalityIdFilter] = useState<string>('');
    const [censusIdFilter, setCensusIdFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedAtributos, setSelectedAtributos] = useState<Set<number>>(new Set());

    // Fetch con Debounce
    useEffect(() => {
        const fetchAtributos = async () => {
            setLoading(true);
            try {

                const response = await axios.get(`/attributes`); 
                if (response.data) {
                    console.log("Datos recibidos:", response.data);
                    const filteredAtributos = response.data.attributes.slice(0, LIMIT);
                    setAtributos(filteredAtributos);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar los atributos.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce de 500ms para evitar spam a la API al escribir
        const timeoutId = setTimeout(() => {
            fetchAtributos();
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

      if (isCreating) {
        return <CreateTemplate onBack={() => setIsCreating(false)} />;
    }
    return (
        <div className="flex flex-col w-full h-full bg-slate-50">
            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-6 overflow-auto">
                
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-sky-600">Atributos y Plantillas</span>
                    <span>&gt;</span>
                    <span className="font-medium underline">Listado de atributos</span>
                </div>

                {/* Toolbar / Actions */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md bg-white p-2 shadow-sm border">

                    <div className="flex items-center">
                        <select
                            className="bg-slate-200 p-1 rounded w-full text-sm"
                            value={isActive ? "true" : "false"}
                            onChange={(e) => onToggleScene(e.target.value === 'true')}
                        >
                            <option value="true">Atributo</option>
                            <option value="false">Plantilla</option>
                        </select>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button 
                        onClick={() => setIsCreating(true)}
                        className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <SquarePlus className="h-4 w-4" /> Agregar nuevo
                        </Button>
                        {isEliminating ? (
                            <>
                                <Button className="bg-red-600 text-white hover:bg-red-700 gap-2">
                                    Borrar
                                </Button>
                                <Button 
                                    onClick={() => {
                                        setIsEliminating(false);
                                        setSelectedAtributos(new Set());
                                    }}
                                    className="bg-slate-400 text-white hover:bg-slate-500 gap-2"
                                >
                                    Cancelar
                                </Button>
                            </>
                        ) : (
                            <Button 
                                onClick={() => setIsEliminating(true)}
                                className="bg-sky-700 text-white hover:bg-sky-800 gap-2"
                            >
                                <Trash2 className="h-4 w-4" /> Eliminar
                            </Button>
                        )}
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
                                      placeholder="Filtrar por Nombre"
                                      className="bg-slate-200 p-1 rounded w-full text-sm"
                                      value={idFilter}
                                      onChange={e => setIdFilter(e.target.value)}
                                    />
                                  </th>
                
                                  <th className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Filtrar por tipo"
                                      className="bg-slate-200 p-1 rounded w-full text-sm"
                                      value={mailFilter}
                                      onChange={e => setMailFilter(e.target.value)}
                                    />
                                  </th>

                                 <th className="p-3">
                                    <input
                                      type="date"
                                      className="bg-slate-200 p-1 rounded w-full text-sm"
                                      value={dateFilter}
                                      onChange={e => setDateFilter(e.target.value)}
                                    />
                                  </th>
                
                                  <th className="p-3">
                                    <input
                                      type="number"
                                      placeholder="Filtrar por disponibilidad"
                                      className="bg-slate-200 p-1 rounded w-full text-sm"
                                      value={municipalityIdFilter}
                                      onChange={e => setMunicipalityIdFilter(e.target.value)}
                                    />
                                  </th>
                

                
                                  <th className="p-3">
                                    <select className="bg-slate-200 p-1 rounded w-full text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                      <option value="">Filtrar por exclusividad</option>
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
                                ) : atributos.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 h-64">
                                      No se encontraron atributos para estos filtros.
                                    </td>
                                  </tr>
                                ) : (
                                  atributos.map((row, index) => (
                                    <tr
                                      key={row.id_atributo}
                                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                                      onClick={() => navigate(`/atributo/${row.id_atributo}`)}
                                    >
                                      <td className="p-4 text-center text-slate-500 font-mono">{(page - 1) * LIMIT + index + 1}</td>
                
                                      <td className="p-4 font-medium text-slate-700">{row.id_atributo}</td>
                
                                      <td className="p-4 text-slate-600">{row.nombre}</td>
                
                
                                      <td className="p-4 text-slate-600">{formatDate(row.created_at)}</td>
                
                                      <td className="p-4">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium border
                                                                    ${
                                                                      row.duplicable
                                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                    }`}
                                        >
                                          {row.duplicable ? 'Duplicable' : 'No duplicable'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                    
                    {/* --- PAGINATION FOOTER --- */}
                    {!error && atributos.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando página {meta.page} de {meta.last_page} (Total: {meta.total} atributos)
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
export default TemplateManagement;