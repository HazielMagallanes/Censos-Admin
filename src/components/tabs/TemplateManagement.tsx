import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ChevronLeft, ChevronRight, SquarePlus, Trash2} from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { useNavigate } from "react-router";
import CreateTemplate from "./CreateTemplate";
import ComboBox from "../ui/own/ComboBox";
import ConfirmationModal from "../ui/own/ConfirmationModal";

// --- INTERFACES ---


interface Plantilla {
  id_plantilla: number;
  id_municipio: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  es_copia_de: number | null;
  modifiedBy: string | null;
  descripcion: string | null;
  bloqueado?: boolean;
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

    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [municipalidades, setMunicipalidades] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);
    const LIMIT = 10;
    
    // Filtering States
    const [nameFilter, setNameFilter] = useState<string>('');
    const [isEliminating, setIsEliminating] = useState<boolean>(false);
    const [dateFilter, setDateFilter] = useState<string>('');
    const [municipalityFilter, setMunicipalityFilter] = useState<{ id_municipio: number; } | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedAtributos, setSelectedAtributos] = useState<Set<number>>(new Set());

    // Fetch con Debounce
    useEffect(() => {
        const fetchAtributos = async () => {
            setLoading(true);
            try {
                // Construir query params dinámicamente
                const params = new URLSearchParams({
                  page: page.toString(),
                  limit: LIMIT.toString(),
                });

                if (nameFilter) params.append('nombre', nameFilter);
                if (dateFilter) params.append('fecha', dateFilter);
                if (municipalityFilter) params.append('id_municipio', municipalityFilter.id_municipio.toString());
                if (statusFilter) params.append('es_copia_de', statusFilter);
                const response = await axios.get(`/templates?${params.toString()}`); 

                console.log("Respuesta de la API:", response);
                if (response.data) {
                    console.log("Datos recibidos:", response.data);
                    setPlantillas(response.data.templates);
                    // setMeta(response.data.meta);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar las plantillas.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce de 500ms para evitar spam a la API al escribir
        const timeoutId = setTimeout(() => {
            fetchAtributos();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, nameFilter, dateFilter,  municipalityFilter,  statusFilter]);

    useEffect(() => {
      const fetchMunicipalities = async () => {
          try {
              const munResponse = await axios.get('/municipalities');
              const munMap: Record<number, string> = {};
              munResponse.data.municipalities.forEach((mun: any) => {
                  munMap[mun.id_municipio] = mun.nombre;
              });
              setMunicipalidades(munMap);
          } catch (error) {
              console.error("Error fetching municipalities:", error);
          }
      };
      
      fetchMunicipalities();
    }, []);

    // Resetea a la página 1 cada vez que un filtro cambia
    useEffect(() => {
        setPage(1);
    }, [nameFilter, dateFilter, municipalityFilter, statusFilter]);

    const handleDelete = async () => {
        try {
            // Filter out blocked templates from deletion
            const selectableTemplate = Array.from(selectedAtributos).filter(id => {
                const plantilla = plantillas.find(p => p.id_plantilla === id);
                return !plantilla?.bloqueado;
            });

            if (selectableTemplate.length === 0) {
                setError('No se pueden eliminar plantillas bloqueadas.');
                setIsModalOpen(false);
                return;
            }

            console.log('Attempting to delete templates with IDs:', selectableTemplate);
            const response = await axios.delete('/templates', { data: { ids: selectableTemplate } });
            if (response.status === 200) {
                setIsModalOpen(false);
                setIsEliminating(false);
                setSelectedAtributos(new Set());
                setPage(1);
            }
            if (response.status === 403) {
                setError('Uno o mas de los plantillas seleccionadas están en uso, por lo que no pueden ser eliminadas.');
            }
        } catch (error) {
            setIsModalOpen(false);
            setError('Error al eliminar los plantillas. Por favor, inténtalo de nuevo.');
            console.error(error);
        }
    };

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
                        onClick={() => navigate('/plantillas/crear')}
                        className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <SquarePlus className="h-4 w-4" /> Agregar nuevo
                        </Button>
                        {isEliminating ? (
                            <>
                                <Button
                                    onClick={() => {
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-red-600 text-white hover:bg-red-700 gap-2"
                                >
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
                                  <th className="p-3 text-center w-12">
                                    {isEliminating && (
                                      <input
                                        type="checkbox"
                                        onChange={e => {
                                          if (e.target.checked) {
                                            setSelectedAtributos(new Set(plantillas.filter(p => !p.bloqueado).map(p => p.id_plantilla)));
                                          } else {
                                            setSelectedAtributos(new Set());
                                          }
                                        }}
                                        checked={selectedAtributos.size === plantillas.filter(p => !p.bloqueado).length && plantillas.filter(p => !p.bloqueado).length > 0}
                                        className="cursor-pointer"
                                      />
                                    )}
                                  </th>
                                  <th className="p-3 text-center">#</th>
                
                                  <th className="p-3">
                                    <input
                                      type="text"
                                      placeholder="Filtrar por Nombre"
                                      className="bg-slate-200 p-1 rounded w-full text-sm"
                                      value={nameFilter}
                                      onChange={e => setNameFilter(e.target.value)}
                                    />
                                  </th>

                                  <th className="p-3">
                                    <ComboBox
                                      options={Object.entries(municipalidades).map(([id, nombre]) => ({ id_municipio: parseInt(id), nombre }))}
                                      value={municipalityFilter ? municipalityFilter.id_municipio : 0}
                                      onChange={(value) => setMunicipalityFilter(value ? { id_municipio: value } : null)}
                                      placeholder="Municipio"
                                      searchPlaceholder="Buscar municipio..."
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
                                    <select className="bg-slate-200 p-1 rounded w-full text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                      <option value="">Todas</option>
                                      <option value="false">Originales</option>
                                      <option value="true">Copia</option>
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
                                ) : plantillas.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 h-64">
                                      No se encontraron plantillas para estos filtros.
                                    </td>
                                  </tr>
                                ) : (
                                  plantillas.map((row, index) => (
                                    <tr
                                      key={row.id_plantilla}
                                      className={`transition-colors ${!isEliminating && !row.bloqueado ? 'hover:bg-slate-50 cursor-pointer' : ''} ${row.bloqueado ? 'bg-slate-100 opacity-60' : ''}`}
                                      onClick={() => {
                                        if (!isEliminating && !row.bloqueado) {
                                          navigate(`/plantilla/${row.id_plantilla}`);
                                        }
                                      }}
                                    >
                                      <td className="p-3 text-center w-12">
                                        {isEliminating && (
                                          <input
                                            type="checkbox"
                                            checked={selectedAtributos.has(row.id_plantilla)}
                                            onChange={e => {
                                              const newSelected = new Set(selectedAtributos);
                                              if (e.target.checked) {
                                                newSelected.add(row.id_plantilla);
                                              } else {
                                                newSelected.delete(row.id_plantilla);
                                              }
                                              setSelectedAtributos(newSelected);
                                            }}
                                            onClick={e => e.stopPropagation()}
                                            disabled={row.bloqueado}
                                            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                          />
                                        )}
                                      </td>
                                      <td className="p-4 text-center text-slate-500 font-mono">{(page - 1) * LIMIT + index + 1}</td>
                
                                      <td className="p-4 font-medium text-slate-700">{row.nombre}</td>
                
                                      <td className="p-4 text-slate-600">{municipalidades[row.id_municipio] || "Especial" }</td>
                
                                      <td className="p-4 text-slate-600">{formatDate(row.created_at)}</td>

                                      <td className="p-4 text-slate-600">
                                        {row.es_copia_de ? "Copia" : "Original"}
                                        {row.bloqueado && (
                                          <span className="ml-2 inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Bloqueado</span>
                                        )}
                                      </td>

                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                    
                    {/* --- PAGINATION FOOTER --- */}
                    {!error && plantillas.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando página {meta.page} de {meta.last_page} (Total: {meta.total} plantillas)
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
                {selectedAtributos.size === 0 && isModalOpen ? (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-4">
                        <span className="text-white text-lg bg-red-600 px-4 py-2 rounded">
                            No selecciono ningun plantilla para eliminar, por favor seleccione al menos un plantilla para proceder con la eliminación.
                        </span>
                        <button onClick={() => setIsModalOpen(false)} className="ml-4 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <ConfirmationModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConfirm={handleDelete}
                        title="Confirmar eliminación"
                        description={
                            <span>
                                ¿Estás seguro de que deseas eliminar los <strong>{selectedAtributos.size}</strong> plantillas seleccionadas? Esta acción no se puede
                                deshacer.
                            </span>
                        }
                        cancelText="Cancelar"
                        confirmText="Eliminar"
                    />
                )}
            </main>
        </div>
    )
}
export default TemplateManagement;