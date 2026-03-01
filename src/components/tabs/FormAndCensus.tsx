import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ChevronLeft, ChevronRight, SquarePlus, File, Search, X } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog } from "../ui/own/Dialog";

// --- INTERFACES ---
interface Censo {
  id_censo: number;
  nombre: string;
  descripcion: string;
  anio: number;
  abierto: boolean;
  id_plantilla: number;
  id_municipio: number;
  id_tipo_censo: number;
  createdAt: Date;
  updatedAt: Date;
  municipio?: {
    nombre: string;
  };
}

interface MetaData {
  total: number;
  page: number;
  last_page: number;
}

const FormAndCensus: React.FC = () => {
  const [censos, setCensos] = useState<Censo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
  const [page, setPage] = useState<number>(1);
  const LIMIT = 8;
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCensos, setFilteredCensos] = useState<Censo[]>([]);
  
  // Modal state
  const [adderModal, setAdderModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    anio: new Date().getFullYear(),
    id_plantilla: 1,
    id_municipio: 1,
    id_tipo_censo: 1,
  });

  // Fetch censos
  useEffect(() => {
    const fetchCensos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/census`);
        if (response.data && response.data.censuses) {
          console.log("Censos API Response:", response.data);
          const censosList = Array.isArray(response.data.censuses) ? response.data.censuses : [];
          setCensos(censosList);
          setFilteredCensos(censosList);
          setMeta({
            total: censosList.length,
            page: 1,
            last_page: Math.ceil(censosList.length / LIMIT),
          });
        }
      } catch (err) {
        console.error("Error fetching censos:", err);
        // No lanzar error, solo mostrar tabla vacía
        setCensos([]);
        setFilteredCensos([]);
        setMeta({
          total: 0,
          page: 1,
          last_page: 1,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCensos();
  }, []);

  // Búsqueda y filtrado en tiempo real
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCensos(censos);
    } else {
      const filtered = censos.filter((censo) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          censo.nombre.toLowerCase().includes(searchLower) ||
          (censo.municipio?.nombre.toLowerCase().includes(searchLower) ?? false) ||
          censo.id_censo.toString().includes(searchLower) ||
          censo.anio.toString().includes(searchLower)
        );
      });
      setFilteredCensos(filtered);
    }
    setPage(1); // Reset a página 1 al buscar
  }, [searchTerm, censos]);

  const handleCensusAdd = async (nombre: string, descripcion: string) => {
    if (!nombre.trim()) {
      alert("El nombre del censo es requerido");
      return;
    }

    try {
      const payload = {
        nombre: nombre,
        descripcion: descripcion || "",
        anio: new Date().getFullYear(),
        id_plantilla: 1,
        id_municipio: 1,
        id_tipo_censo: 1,
      };

      console.log("Enviando payload:", payload);
      const response = await axios.post(`/census`, payload);
      
      if (response.data) {
        console.log("Censo agregado:", response.data);
        alert("Censo creado exitosamente");
        
        // Recargar censos
        try {
          const refreshResponse = await axios.get(`/census`);
          if (refreshResponse.data && refreshResponse.data.censuses) {
            const censosList = Array.isArray(refreshResponse.data.censuses) ? refreshResponse.data.censuses : [];
            setCensos(censosList);
            setFilteredCensos(censosList);
            setMeta({
              total: censosList.length,
              page: 1,
              last_page: Math.ceil(censosList.length / LIMIT),
            });
          }
        } catch (refreshErr) {
          console.error("Error refreshing censos:", refreshErr);
        }
      }
    } catch (err) {
      console.error("Error adding censo:", err);
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.message || err.message;
        alert(`Error al crear el censo: ${errorMsg}`);
      } else {
        alert("Error al crear el censo");
      }
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Verificar que sea un archivo válido
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        alert("Por favor, selecciona un archivo CSV o JSON");
        return;
      }

      alert("Funcionalidad de importación en desarrollo");
      // TODO: Implementar lógica de importación
      console.log("File selected:", file);
    } catch (err) {
      console.error("Error importing file:", err);
      alert("Error al importar el archivo");
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
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) pages.push(i);
    if (page < last_page - 2) pages.push("...");
    if (last_page > 1) pages.push(last_page);

    return pages;
  };

  // Calcular datos paginados
  const startIndex = (page - 1) * LIMIT;
  const endIndex = startIndex + LIMIT;
  const paginatedCensos = filteredCensos.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <span className="text-sky-600">Formularios y Censos</span>
          <span>&gt;</span>
          <span className="font-medium underline">Listado de censos</span>
        </div>

        {/* Toolbar / Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md bg-white p-4 shadow-sm border">
          <div className="flex gap-2">
            <Button
              onClick={() => setAdderModal(true)}
              className="bg-sky-700 text-white hover:bg-sky-800 gap-2"
            >
              <SquarePlus className="h-4 w-4" /> Crear nuevo
            </Button>
            <label>
              <Button asChild className="bg-sky-700 text-white hover:bg-sky-800 gap-2 cursor-pointer">
                <span>
                  <File className="h-4 w-4" /> Importar desde un archivo
                </span>
              </Button>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Searchbar */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre, municipio o año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 py-2 rounded border border-slate-300 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Structure */}
        <div className="rounded-md border bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
              <Loader2 className="animate-spin" /> Cargando datos...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3 font-medium text-center">#</th>
                    <th className="p-3 font-medium">Nombre</th>
                    <th className="p-3 font-medium">Municipio</th>
                    <th className="p-3 font-medium">Año</th>
                    <th className="p-3 font-medium">Descripción</th>
                    <th className="p-3 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCensos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {searchTerm
                          ? "No hay censos que coincidan con tu búsqueda."
                          : "No hay censos disponibles."}
                      </td>
                    </tr>
                  ) : (
                    paginatedCensos.map((censo, index) => (
                      <tr
                        key={censo.id_censo}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-center text-slate-500 font-mono">
                          {startIndex + index + 1}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {censo.nombre}
                        </td>
                        <td className="p-4 text-slate-600">
                          {censo.municipio?.nombre || "N/A"}
                        </td>
                        <td className="p-4 text-slate-600">
                          {censo.anio}
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {censo.descripcion || "-"}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              censo.abierto
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {censo.abierto ? "Abierto" : "Cerrado"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Dialog
            isOpen={adderModal}
            onClose={() => {
              setAdderModal(false);
              setFormData({
                nombre: '',
                descripcion: '',
                anio: new Date().getFullYear(),
                id_plantilla: 1,
                id_municipio: 1,
                id_tipo_censo: 1,
              });
            }}
            title="Crear Nuevo Censo"
            footer={
              <>
                <button
                  onClick={() => {
                    setAdderModal(false);
                    setFormData({
                      nombre: '',
                      descripcion: '',
                      anio: new Date().getFullYear(),
                      id_plantilla: 1,
                      id_municipio: 1,
                      id_tipo_censo: 1,
                    });
                  }}
                  className="rounded-md bg-[#b90000] px-5 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleCensusAdd(formData.nombre, formData.descripcion);
                    setAdderModal(false);
                    setFormData({
                      nombre: '',
                      descripcion: '',
                      anio: new Date().getFullYear(),
                      id_plantilla: 1,
                      id_municipio: 1,
                      id_tipo_censo: 1,
                    });
                  }}
                  className="rounded-md bg-[#0066b2] px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Guardar
                </button>
              </>
            }
          >
            <form className="space-y-4 flex flex-col mt-2" onSubmit={(e) => e.preventDefault()}>
              {/* Campo Nombre Censo */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Nombre del Censo *
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el nombre del censo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Campo Descripción */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea
                  placeholder="Ingrese una descripción (opcional)"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </form>
          </Dialog>

          {/* --- PAGINATION FOOTER --- */}
          {!loading && filteredCensos.length > 0 && (
            <div className="flex items-center justify-between border-t p-4 bg-slate-50">
              <div className="text-xs text-slate-500">
                Mostrando página {page} de {meta.last_page} (Total: {filteredCensos.length} censos)
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

                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-slate-400"
                    >
                      ...
                    </span>
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
                )}

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
  );
};

export default FormAndCensus;
