import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Map, FileDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { useNavigate } from 'react-router';
import DataTable, { type ColumnDef } from '@/components/ui/own/DataTable';

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
  const navigate = useNavigate();
  // Paginación
  const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, last_page: 1 });
  const [page, setPage] = useState<number>(1);
  const LIMIT = 10;

  // Filtering States
  const [idFilter, setIdFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [mailFilter, setMailFilter] = useState<string>('');
  const [municipalityIdFilter, setMunicipalityIdFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch con Debounce
  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      try {
        // Construir query params dinámicamente
        const params = new URLSearchParams({
          page: page.toString(),
          limit: LIMIT.toString(),
        });

        if (idFilter) params.append('id', idFilter);
        if (dateFilter) params.append('date', dateFilter);
        if (mailFilter) params.append('mail', mailFilter);
        if (municipalityIdFilter) params.append('municipalityId', municipalityIdFilter);
        if (statusFilter) params.append('status', statusFilter);

        const response = await axios.get(`/census/uploads?${params.toString()}`);
        if (response.data) {
          setRegistros(response.data.uploads);
          setMeta(response.data.meta);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los registros censales.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce de 500ms para evitar spam a la API al escribir
    const timeoutId = setTimeout(() => {
      fetchRegistros();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, idFilter, dateFilter, mailFilter, municipalityIdFilter, statusFilter]);

  // Columnas para DataTable
  const columns: ColumnDef<RegistroCensal>[] = [
    {
      key: 'id_registro',
      label: 'ID',
      type: 'number',
      filterable: true,
      filterPlaceholder: 'Filtrar por ID'
    },
    {
      key: 'creator.correo_electronico',
      label: 'Censista',
      type: 'string',
      filterable: true,
      filterPlaceholder: 'Filtrar por censista (mail)',
      render: (_, row) => row.creator.correo_electronico,
    },
    {
      key: 'censo.municipio.nombre',
      label: 'Municipio',
      type: 'string',
      filterable: true,
      filterPlaceholder: 'Filtrar por municipio',
      render: (_, row) => row.censo.municipio?.nombre || '-'
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'date',
      filterable: true,
      render: (_, row) => formatDate(row.fecha)
    },
    {
      key: 'confirmado',
      label: 'Estado',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por estado',
      options: [
        { value: 'true', label: 'Confirmado' },
        { value: 'false', label: 'Pendiente' }
      ],
      render: (_, row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium border
          ${row.confirmado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
        >
          {row.confirmado ? 'Confirmado' : 'Pendiente'}
        </span>
      )
    }
  ];

  const handleFiltersChange = (newFilters: Record<string, string>) => {
    setIdFilter(newFilters['id_registro'] || '');
    setMailFilter(newFilters['creator.correo_electronico'] || '');
    setDateFilter(newFilters['fecha'] || '');
    setStatusFilter(newFilters['confirmado'] || '');
    setMunicipalityIdFilter(newFilters['censo.municipio.nombre'] || '');
  };

  // Formateador de fecha: dd / mm / aaaa
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
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

        {/* Table Structure via DataTable */}
        <div className="bg-white rounded-md shadow-sm">
          <DataTable
            columns={columns}
            data={registros}
            rowKey="id_registro"
            loading={loading}
            error={error}
            currentPage={page}
            totalPages={meta.last_page}
            onPageChange={(newPage) => {
              if (newPage >= 1 && newPage <= meta.last_page) setPage(newPage);
            }}
            onFiltersChange={handleFiltersChange}
            onRowClick={(row) => navigate(`/registro/${row.id_registro}`)}
            emptyMessage="No se encontraron registros."
          />
        </div>
      </main>
    </div>
  );
};
export default MainPanel;
