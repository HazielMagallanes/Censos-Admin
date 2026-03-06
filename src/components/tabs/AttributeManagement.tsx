import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, SquarePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import CreateAttribute from './CreateAttribute';
import { AttributeType } from '@/types/tipos';
import ConfirmationModal from '../ui/own/ConfirmationModal';
import EditAttributeDialog from '../ui/own/EditAttributeDialog';

// --- INTERFACES ---

interface Atributo {
  id_atributo: number;
  nombre: string;
  id_tipo: number;
  id_categoria: number;
  duplicable: boolean;
  obligatorio: boolean;
  descripcion: string;
  recomendaciones: string;
  created_at: string;
  updated_at: string;
  bloqueado?: boolean;
}

interface MetaData {
  total: number;
  page: number;
  last_page: number;
}

interface AttributeManagementProps {
  onToggleScene?: (value: boolean) => void;
  isActive?: boolean;
}

const AttributeManagement: React.FC<AttributeManagementProps> = ({ onToggleScene = () => {}, isActive = false }) => {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [attributeToEdit, setAttributeToEdit] = useState<Atributo | null>(null);
  // Paginación
  const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, last_page: 1 });
  const [page, setPage] = useState<number>(1);
  const LIMIT = 10;

  // Filtering States
  const [nameFilter, setNameFilter] = useState<string>('');
  const [isEliminating, setIsEliminating] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<AttributeType>();
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
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
        if (typeFilter) {
          // Convert type name to corresponding numeric ID
          const typeId = Object.entries(AttributeType).find(([, value]) => value === typeFilter)?.[0];
          if (typeId) params.append('id_tipo', typeId);
        }
        if (statusFilter !== null) params.append('duplicable', statusFilter.toString());
        
        const response = await axios.get(`/attributes?${params.toString()}`);
        if (response.data) {
          console.log('Fetched attributes:', response.data);
          setAtributos(response.data.attributes);
          if (!response.data.meta) {
            setMeta({ total: response.data.attributes.length, page: 1, last_page: 1 });
            return;
          }
          setMeta(response.data.meta);
          console.log(meta)
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los atributos.');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchAtributos();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, nameFilter, typeFilter, statusFilter, isCreating]);

  useEffect(() => {
    setPage(1);
  }, [nameFilter, typeFilter, statusFilter]);
  
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

  const handleDelete = async () => {
    try {
      // Filter out blocked attributes from deletion
      const selectableAtributos = Array.from(selectedAtributos).filter(id => {
        const atributo = atributos.find(a => a.id_atributo === id);
        return !atributo?.bloqueado;
      });

      if (selectableAtributos.length === 0) {
        setError('No se pueden eliminar atributos bloqueados.');
        setIsModalOpen(false);
        return;
      }

      console.log('Attempting to delete attributes with IDs:', selectableAtributos);
      const response = await axios.delete('/attributes', { data: { id_atributos: selectableAtributos } });
      if (response.status === 200) {
        setIsModalOpen(false);
        setIsEliminating(false);
        setSelectedAtributos(new Set());
        setPage(1);
      }
      if (response.status === 403) {
        setError('Uno o mas de los atributos seleccionados están asociados a plantillas, por lo que no pueden ser eliminados.');
      }
    } catch (error) {
      setIsModalOpen(false);
      setError('Error al eliminar los atributos. Por favor, inténtalo de nuevo.');
      console.error(error);
    }
  };
  const handleEditAttribute = async (atributo: Atributo) => {
    try {
      // Check if any data has actually changed
      const hasChanges =
        atributo.nombre !== attributeToEdit?.nombre ||
        atributo.descripcion !== attributeToEdit?.descripcion ||
        atributo.recomendaciones !== (attributeToEdit?.recomendaciones || '') ||
        atributo.obligatorio !== attributeToEdit?.obligatorio ||
        atributo.id_categoria !== attributeToEdit?.id_categoria ||
        atributo.id_tipo !== attributeToEdit?.id_tipo ||
        atributo.duplicable !== attributeToEdit?.duplicable;

      if (!hasChanges) {
        setIsEditDialogOpen(false);
        return;
      }

      const response = await axios.put(`/attributes/${atributo.id_atributo}`, {
        nombre: atributo.nombre,
        descripcion: atributo.descripcion,
        recomendaciones: atributo.recomendaciones || '',
        obligatorio: atributo.obligatorio,
        id_categoria: atributo.id_categoria,
        id_tipo: atributo.id_tipo,
        duplicable: atributo.duplicable,
      });
      if (response.status === 200) {
        // Update local state with the edited attribute
        setAtributos(prev =>
          prev.map(a => (a.id_atributo === atributo.id_atributo ? { ...a, ...atributo } : a)),
        );
      }
    } catch (error) {
      console.error('Error al editar el atributo:', error);
    }
    setAttributeToEdit(atributo);
    setIsEditDialogOpen(false);
  };

  if (isCreating) {
    return <CreateAttribute onBack={() => setIsCreating(false)} />;
  }
  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <span className="text-sky-600">Atributos y Plantillas</span>
          <span>&gt;</span>
          <span className="font-medium underline">Listado de atributos</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-md bg-white p-2 shadow-sm border">
          <div className="flex items-center">
            <select
              className="bg-slate-200 p-1 rounded w-full text-sm"
              value={isActive ? 'true' : 'false'}
              onChange={e => onToggleScene(e.target.value === 'true')}
            >
              <option value="true">Atributo</option>
              <option value="false">Plantilla</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setIsCreating(true)} className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
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
              <Button onClick={() => setIsEliminating(true)} className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            )}
          </div>
        </div>

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
                            setSelectedAtributos(new Set(atributos.filter(a => !a.bloqueado).map(a => a.id_atributo)));
                          } else {
                            setSelectedAtributos(new Set());
                          }
                        }}
                        checked={
                          selectedAtributos.size === atributos.filter(a => !a.bloqueado).length && atributos.filter(a => !a.bloqueado).length > 0
                        }
                        className="cursor-pointer"
                      />
                    )}
                  </th>
                  <th className="p-3 text-center">#</th>
                  <th className="p-3">
                    <input
                      type="text"
                      placeholder="Filtrar por Atributo"
                      className="bg-slate-200 p-1 rounded w-full text-sm"
                      value={nameFilter}
                      onChange={e => setNameFilter(e.target.value)}
                    />
                  </th>
                  <th className="p-3">
                    <select
                      className="bg-slate-200 p-1 rounded w-full text-sm"
                      value={typeFilter || ''}
                      onChange={e => setTypeFilter(e.target.value ? (e.target.value as AttributeType) : undefined)}
                    >
                      <option value="">Filtrar por tipo</option>
                      {Object.values(AttributeType).map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="p-3">
                    <select
                      className="bg-slate-200 p-1 rounded w-full text-sm"
                      value={statusFilter === null ? '' : statusFilter.toString()}
                      onChange={e => setStatusFilter(e.target.value === '' ? null : e.target.value === 'true')}
                    >
                      <option value="">Filtrar por propiedad</option>
                      <option value="true">Duplicable</option>
                      <option value="false">No duplicable</option>
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
                  atributos.map((atributo, index) => (
                    <tr
                      key={atributo.id_atributo}
                      className={`transition-colors ${!isEliminating && !atributo.bloqueado ? 'hover:bg-slate-50 cursor-pointer' : ''} ${atributo.bloqueado ? 'bg-slate-100 opacity-60' : ''}`}
                      onClick={() => {
                        if (!isEliminating && !atributo.bloqueado) {
                          setAttributeToEdit(atributo);
                          setIsEditDialogOpen(true);
                        }
                      }}
                    >
                      <td className="p-3 text-center w-12">
                        {isEliminating && (
                          <input
                            type="checkbox"
                            checked={selectedAtributos.has(atributo.id_atributo)}
                            onChange={e => {
                              const newSelected = new Set(selectedAtributos);
                              if (e.target.checked) {
                                newSelected.add(atributo.id_atributo);
                              } else {
                                newSelected.delete(atributo.id_atributo);
                              }
                              setSelectedAtributos(newSelected);
                            }}
                            onClick={e => e.stopPropagation()}
                            disabled={atributo.bloqueado}
                            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        )}
                      </td>
                      <td className="p-4 text-center text-slate-500 font-mono">{(page - 1) * LIMIT + index + 1}</td>
                      <td className="p-4 font-medium text-slate-700">{atributo.nombre}</td>
                      <td className="p-4 text-slate-600">{AttributeType[atributo.id_tipo as keyof typeof AttributeType]}</td>
                      <td className="p-4 text-slate-600">
                        {atributo.duplicable ? 'Duplicable' : 'No duplicable'}
                        {atributo.bloqueado && (
                          <span className="ml-2 inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Bloqueado</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {selectedAtributos.size === 0 && isModalOpen ? (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-4">
              <span className="text-white text-lg bg-red-600 px-4 py-2 rounded">
                No selecciono ningun atributo para eliminar, por favor seleccione al menos un atributo para proceder con la eliminación.
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
                  ¿Estás seguro de que deseas eliminar los <strong>{selectedAtributos.size}</strong> atributos seleccionados? Esta acción no se puede
                  deshacer.
                </span>
              }
              cancelText="Cancelar"
              confirmText="Eliminar"
            />
          )}
          <EditAttributeDialog
            initialData={attributeToEdit}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleEditAttribute}
          />

          {!error && atributos.length > 0 && (
            <div className="flex items-center justify-between border-t p-4 bg-slate-50">
              <div className="text-xs text-slate-500">
                Mostrando página {meta.page} de {meta.last_page} (Total: {meta.total} atributos)
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${p}`}
                      variant={p === page ? 'secondary' : 'ghost'}
                      size="sm"
                      className={p === page ? 'bg-slate-200 font-bold' : ''}
                      onClick={() => handlePageChange(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}

                <Button variant="ghost" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page === meta.last_page}>
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

export default AttributeManagement;
