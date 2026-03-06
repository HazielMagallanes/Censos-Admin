import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DataTable, { type ColumnDef } from '@/components/ui/own/DataTable';

const PlantillasList: React.FC = () => {
  const [plantillas, setPlantillas] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Mocks for missing data fields
  const getMockedData = (data: any[]) => {
    return data.map(p => ({
      ...p,
      tipo: p.tipo || 'Tipo',
      disponibilidad: p.disponibilidad || 'Disponible',
      exclusividad: p.exclusividad || 'Exclusividad',
      createdAt: p.createdAt || new Date().toISOString()
    }));
  };

  useEffect(() => {
    const fetchPlantillas = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/templates');
        const templatesData = res.data.templates || res.data; // Handle both structures
        if (Array.isArray(templatesData) && templatesData.length > 0) {
          setPlantillas(getMockedData(templatesData));
        } else {
          // fallback if API is empty for UI testing
          setPlantillas(getMockedData([
            { id: 1, nombre: 'Plantilla Básica', descripcion: 'Plantilla con campos básicos' },
            { id: 2, nombre: 'Plantilla Avanzada', descripcion: 'Incluye agrupamientos y reglas' },
            { id: 3, nombre: 'Plantilla Demo', descripcion: 'Ejemplo para pruebas' },
          ]));
        }
      } catch (err) {
        // fallback demo
        setPlantillas(getMockedData([
          { id: 1, nombre: 'Plantilla Básica', descripcion: 'Plantilla con campos básicos' },
          { id: 2, nombre: 'Plantilla Avanzada', descripcion: 'Incluye agrupamientos y reglas' },
          { id: 3, nombre: 'Plantilla Demo', descripcion: 'Ejemplo para pruebas' },
        ]));
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, []);


  if (loading) return <div className="p-6 text-slate-500">Cargando plantillas...</div>;

  const columns: ColumnDef<any>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'string',
      filterable: true,
      filterPlaceholder: 'Filtrar por nombre',
      render: (value) => (
        <div className="cursor-pointer text-slate-700 font-medium">
          {value}
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por tipo',
      options: [
        { value: 'tipo1', label: 'Tipo 1' }
      ],
      render: (value) => <span className="text-slate-700">{value}</span>,
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
      key: 'disponibilidad',
      label: 'Disponibilidad',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por disponibilidad',
      options: [
        { value: 'disponible', label: 'Disponible' }
      ],
      render: (value) => (
        <div className="flex justify-center">
          <span className="bg-[#238DCA] text-white px-3 py-1 rounded-md text-xs font-medium">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'exclusividad',
      label: 'Exclusividad',
      type: 'select',
      filterable: true,
      filterPlaceholder: 'Filtrar por exclusividad',
      options: [
        { value: 'alta', label: 'Alta' }
      ],
      render: (value) => (
        <div className="flex justify-center">
          <span className="bg-[#238DCA] text-white px-3 py-1 rounded-md text-xs font-medium">
            {value}
          </span>
        </div>
      ),
    },

  ];



  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-4 flex items-center justify-start gap-2 text-sm text-[#608CB5]">
          <span className="cursor-pointer hover:underline">Formularios y Censos</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(-1)}>Listado de censos adaptados</span>
          <span>&gt;</span>
          <span>Crear nuevo</span>
          <span>&gt;</span>
          <span className="underline decoration-[#608CB5] underline-offset-4">Listado de Plantillas</span>
        </div>

        <div className="bg-white">
          <DataTable
            columns={columns}
            data={plantillas}
            rowKey={(row) => row.id_plantilla || row.id}
            headerText={
              <span className="text-red-600 font-medium">
                Seleccione una plantilla para generar el censo adaptado*
              </span>
            }
            rightContent={
              <button
                className="bg-[#B30000] hover:bg-red-800 text-white px-5 py-1.5 rounded-md font-medium text-sm transition-colors"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>
            }
            onRowClick={(row) => navigate(`/censo-crear/${row.id_plantilla}`)}
            emptyMessage="No se encontraron plantillas."
          />
        </div>
      </main>
    </div>
  );
};

export default PlantillasList;
