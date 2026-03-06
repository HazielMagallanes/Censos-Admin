import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SquarePlus, Trash2 } from 'lucide-react';
import CreateAttribute from './CreateAttribute';
import { AttributeType } from '@/types/tipos';
import EditAttributeDialog from '../ui/own/EditAttributeDialog';
import DataTable, { type ColumnDef, type ButtonDef } from '../ui/own/DataTable';

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

const AttributeManagement: React.FC<AttributeManagementProps> = ({ onToggleScene = () => { }, isActive = false }) => {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [attributeToEdit, setAttributeToEdit] = useState<Atributo | null>(null);

  // Paginación y Filtros (Sincronizados con DataTable)
  const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, last_page: 1 });
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const LIMIT = 10;

  // Fetch con Debounce
  useEffect(() => {
    const fetchAtributos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: LIMIT.toString(),
        });

        if (filters.nombre) params.append('nombre', filters.nombre);
        if (filters.id_tipo) params.append('id_tipo', filters.id_tipo);
        if (filters.duplicable) params.append('duplicable', filters.duplicable);

        const response = await axios.get(`/attributes?${params.toString()}`);
        if (response.data) {
          setAtributos(response.data.attributes);
          setMeta(response.data.meta || { total: response.data.attributes.length, page: 1, last_page: 1 });
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los atributos.');
      } finally {
        setLoading(false);
      }
    };

    fetchAtributos();
  }, [page, filters]);

  const handleDelete = async (selectedIds: number[]) => {
    try {
      // Filter out blocked attributes from deletion just in case
      const selectableIds = selectedIds.filter(id => {
        const atributo = atributos.find(a => a.id_atributo === id);
        return !atributo?.bloqueado;
      });

      if (selectableIds.length === 0) return;

      const response = await axios.delete('/attributes', { data: { ids: selectableIds } });
      if (response.status === 200) {
        setPage(1);
      }
    } catch (error) {
      setError('Error al eliminar los atributos.');
      console.error(error);
    }
  };

  const handleEditAttribute = async (atributo: Atributo) => {
    try {
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
        setPage(1);
      }
    } catch (error) {
      console.error('Error al editar el atributo:', error);
    }
    setIsEditDialogOpen(false);
  };

  const columns: ColumnDef<Atributo>[] = [
    {
      key: 'nombre',
      label: 'Atributo',
      filterable: true,
      filterPlaceholder: 'Filtrar por Atributo'
    },
    {
      key: 'id_tipo',
      label: 'Tipo',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por tipo',
      options: Object.entries(AttributeType).map(([id, label]) => ({ value: id, label })),
      render: (val) => AttributeType[val as keyof typeof AttributeType]
    },
    {
      key: 'duplicable',
      label: 'Propiedad',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por propiedad',
      options: [
        { value: 'true', label: 'duplicable' },
        { value: 'false', label: 'no duplicable' }
      ],
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {val ? 'Duplicable' : 'No duplicable'}
          {row.bloqueado && (
            <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Bloqueado</span>
          )}
        </div>
      )
    }
  ];

  const buttons: ButtonDef[] = [
    {
      id: 'create',
      label: 'Agregar nuevo',
      icon: <SquarePlus className="h-4 w-4" />,
      onClick: () => setIsCreating(true)
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: <Trash2 className="h-4 w-4" />,
      requiresSelection: true,
      onClick: () => { } // Handled by onConfirm
    }
  ];

  if (isCreating) {
    return <CreateAttribute onBack={() => setIsCreating(false)} />;
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-6 overflow-auto">
      <DataTable
        columns={columns}
        data={atributos}
        rowKey="id_atributo"
        buttons={buttons}
        headerText={
          <select
            className="bg-white border border-slate-300 p-1.5 rounded text-sm font-normal min-w-[120px]"
            value={isActive ? 'true' : 'false'}
            onChange={e => onToggleScene(e.target.value === 'true')}
          >
            <option value="true">Atributo</option>
            <option value="false">Plantilla</option>
          </select>
        }
        loading={loading}
        error={error}
        currentPage={page}
        totalPages={meta.last_page}
        onPageChange={setPage}
        onFiltersChange={setFilters}
        onRowClick={(row) => {
          if (!row.bloqueado) {
            setAttributeToEdit(row);
            setIsEditDialogOpen(true);
          }
        }}
        onConfirm={handleDelete}
        breadcrumbs={[
          { label: 'Atributos y Plantillas' },
          { label: 'Listado de atributos' }
        ]}
        emptyMessage="No se encontraron atributos para estos filtros."
      />

      <EditAttributeDialog
        initialData={attributeToEdit}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditAttribute}
      />
    </div>
  );
};

export default AttributeManagement;
