import React, { useEffect, useState } from "react";
import axios from "axios";
import { SquarePlus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import CreateTemplate from "./CreateTemplate";
import DataTable, { type ColumnDef, type ButtonDef } from "../ui/own/DataTable";

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

const TemplateManagement: React.FC<TemplateManagementProps> = ({ onToggleScene = () => { }, isActive = false }) => {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [municipalidades, setMunicipalidades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Paginación y Filtros
  const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const LIMIT = 10;

  // Fetch con Debounce
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: LIMIT.toString(),
        });

        if (filters.nombre) params.append('nombre', filters.nombre);
        if (filters.fecha) params.append('fecha', filters.fecha);
        if (filters.id_municipio) params.append('id_municipio', filters.id_municipio);
        if (filters.es_copia_de) params.append('es_copia_de', filters.es_copia_de);

        const response = await axios.get(`/templates?${params.toString()}`);

        if (Object.keys(municipalidades).length === 0) {
          const munResponse = await axios.get('/municipalities');
          const munMap: Record<number, string> = {};
          munResponse.data.municipalities.forEach((mun: { id_municipio: number; nombre: string }) => {
            munMap[mun.id_municipio] = mun.nombre;
          });
          setMunicipalidades(munMap);
        }

        if (response.data) {
          setPlantillas(response.data.templates);
          if (response.data.meta) setMeta(response.data.meta);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar las plantillas.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [page, filters]);

  const handleDelete = async (selectedIds: number[]) => {
    try {
      const response = await axios.delete('/templates', { data: { ids: selectedIds } });
      if (response.status === 200) {
        setPage(1);
      }
    } catch (error) {
      setError('Error al eliminar las plantillas.');
      console.error(error);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const columns: ColumnDef<Plantilla>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      filterable: true,
      filterPlaceholder: 'Filtrar por Nombre'
    },
    {
      key: 'id_municipio',
      label: 'Municipio',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Municipio',
      options: Object.entries(municipalidades).map(([id, nombre]) => ({ value: id, label: nombre })),
      render: (val) => municipalidades[val as number] || "Especial"
    },
    {
      key: 'created_at',
      label: 'Fecha',
      type: 'date',
      filterable: true,
      render: (val) => formatDate(val)
    },
    {
      key: 'es_copia_de',
      label: 'Tipo',
      type: 'select',
      filterable: true,
      options: [
        { value: 'false', label: 'Originales' },
        { value: 'true', label: 'Copia' }
      ],
      render: (val) => (val ? "Copia" : "Original")
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
      onClick: () => { }
    }
  ];

  if (isCreating) {
    return <CreateTemplate onBack={() => setIsCreating(false)} />;
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 p-6 overflow-auto">
      <DataTable
        columns={columns}
        data={plantillas}
        rowKey="id_plantilla"
        buttons={buttons}
        headerText={
          <select
            className="bg-white border border-slate-300 p-1.5 rounded text-sm font-normal min-w-[120px]"
            value={isActive ? "true" : "false"}
            onChange={(e) => onToggleScene(e.target.value === 'true')}
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
        onRowClick={(row) => navigate(`/plantilla/${row.id_plantilla}`)}
        onConfirm={handleDelete}
        breadcrumbs={[
          { label: 'Atributos y Plantillas' },
          { label: 'Listado de atributos' }
        ]}
      />
    </div>
  );
};

export default TemplateManagement;
