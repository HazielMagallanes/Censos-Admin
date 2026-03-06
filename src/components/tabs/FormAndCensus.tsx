import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SquarePlus, Trash2 } from "lucide-react";
import DataTable from "@/components/ui/own/DataTable";
import type { ColumnDef, ButtonDef } from "@/components/ui/own/DataTable";

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
    const navigate = useNavigate();
    const [censos, setCensos] = useState<Censo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);

    // Búsqueda y filtros
    const [nombreFilter, setNombreFilter] = useState<string>('');
    const [municipioFilter, setMunicipioFilter] = useState<string>('');
    const [estadoFilter, setEstadoFilter] = useState<string>('');
    const [exclusividadFilter, setExclusividadFilter] = useState<string>('');

    // Fetch censos from API with filters and pagination
    const loadCensos = async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: Our API controller for `GET /census` currently doesn't process query params/pagination for this route.
            const response = await axios.get('/census');
            const data = response.data;
            console.log('[FormAndCensus] API response data:', data);
            let list = Array.isArray(data?.censuses) ? data.censuses : [];
            // Mock exclusividad if missing
            list = list.map((c: any) => ({ ...c, exclusividad: c.exclusividad || 'Exclusividad' }));
            setCensos(list);

            // Set mock pagination for now since backend doesn't provide it for this route yet
            setMeta({ total: list.length, page: 1, last_page: 1 });
        } catch (err: any) {
            console.error('Error fetching censos:', err);
            // The API throws a 404 error through HttpException when there are no censuses instead of returning an empty array.
            if (err.response?.status === 404) {
                setCensos([]);
                setMeta({ total: 0, page: 1, last_page: 1 });
            } else {
                setError('Error al cargar los censos');
                setCensos([]);
                setMeta({ total: 0, page: 1, last_page: 1 });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(loadCensos, 500);
        return () => clearTimeout(timeoutId);
    }, [page, nombreFilter, municipioFilter]);

    useEffect(() => {
        setPage(1);
    }, [nombreFilter, municipioFilter, estadoFilter, exclusividadFilter]);

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Eliminar ${selectedIds.length} censo(s)? Esta acción no se puede deshacer.`)) return;
        try {
            for (const id of selectedIds) {
                await axios.delete(`/census/${id}`);
            }
            await loadCensos();
            setSelectedIds([]);
            alert('Eliminación completada');
        } catch (err) {
            console.error('Error deleting censos:', err);
        }
    };

    // Definir columnas (Match Image 1)
    const columns: ColumnDef<Censo>[] = [
        {
            key: 'nombre',
            label: 'Nombre',
            type: 'string',
            filterable: true,
            filterPlaceholder: 'Filtrar por nombre',
            render: (value, row) => (
                <div className="cursor-pointer text-slate-700 font-medium" onClick={() => navigate(`/censo/${row.id_censo}`)}>
                    {value}
                </div>
            ),
        },
        {
            key: 'createdAt',
            label: 'Fecha Creación',
            type: 'date',
            filterable: true,
            filterPlaceholder: 'Filtrar por fecha de creación',
            render: (value) => <span className="text-slate-700">{new Date(value).toLocaleDateString('es-AR')}</span>,
        },
        {
            key: 'municipio',
            label: 'Municipio',
            type: 'string',
            filterable: true,
            filterPlaceholder: 'Filtrar por municipio',
            render: (_value, row) => (
                <div onClick={() => navigate(`/censo/${row.id_censo}`)} className="cursor-pointer text-slate-700">
                    {row.municipio?.nombre || 'Nombre del municipio'}
                </div>
            ),
        },
        {
            key: 'abierto',
            label: 'Estado',
            type: 'select',
            filterable: true,
            filterPlaceholder: 'Filtrar por estado',
            options: [
                { value: true, label: 'Abierto' },
                { value: false, label: 'Cerrado' }
            ],
            render: (_value) => (
                <div className="flex justify-center">
                    <span className="bg-[#238DCA] text-white px-3 py-1 rounded-md text-xs font-medium">
                        Estado
                    </span>
                </div>
            ),
        },
        {
            key: 'exclusividad', // asumiendo que este campo existe o mock
            label: 'Exclusividad',
            type: 'select',
            filterable: true,
            filterPlaceholder: 'Filtrar por exclusividad',
            options: [
                { value: 'alta', label: 'Alta' }
            ],
            render: (_value) => (
                <div className="flex justify-center">
                    <span className="bg-[#238DCA] text-white px-3 py-1 rounded-md text-xs font-medium">
                        Exclusividad
                    </span>
                </div>
            ),
        },
    ];

    // Definir botones superiores centrales
    const buttons: ButtonDef[] = [
        {
            id: 'crear',
            label: 'Crear nuevo',
            icon: <SquarePlus size={16} />,
            onClick: () => navigate('/censo-crear'),
            leftListOptions: false,
            className: 'bg-[#0067B1] hover:bg-sky-800 text-white px-4 py-1.5 rounded-md font-medium text-sm flex items-center gap-1.5',
        },
        {
            id: 'eliminar_btn',
            label: 'Eliminar',
            icon: <Trash2 size={16} />,
            requiresSelection: true,
            leftListOptions: false,
            onClick: handleDeleteSelected,
        },

    ];

    return (
        <div className="flex flex-col w-full h-full bg-slate-50">
            <main className="flex-1 p-6 overflow-auto">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-sm text-[#608CB5]">
                    <span className="cursor-pointer hover:underline">Formularios y Censos</span>
                    <span>&gt;</span>
                    <span className="cursor-pointer hover:underline underline-offset-4 decoration-[#608CB5]">Listado de censos adaptados</span>
                </div>


                {/* DataTable component */}
                <div className="bg-white">
                    <DataTable
                        columns={columns}
                        data={censos}
                        rowKey="id_censo"
                        buttons={buttons}
                        loading={loading}
                        error={error}
                        selectionMode="multiple"
                        onSelectionChange={(ids) => setSelectedIds(ids)}
                        onFiltersChange={(f) => {
                            setNombreFilter(f.nombre || '');
                            setMunicipioFilter(f.municipio || '');
                            setEstadoFilter(f.abierto || '');
                            setExclusividadFilter(f.exclusividad || '');
                        }}
                        currentPage={page}
                        totalPages={meta.last_page}
                        onPageChange={setPage}
                        onRowClick={(row) => navigate(`/censo/${row.id_censo}`)}
                        emptyMessage="No se encontraron censos."
                        confirmButtonLabel="Eliminar"
                        onConfirm={handleDeleteSelected}
                    />
                </div>
            </main>
        </div>
    );
};

export default FormAndCensus;
