import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';

// Interfaces definitions
export interface censusRecord {
  id_registro: number;
  fecha: Date | string;
  ubicacion: string;
  confirmado: boolean;
  id_censo: number;
  censo: {
    nombre: string;
    municipio: {
      nombre: string;
    };
  };
  creator: {
    nombre: string;
    apellido: string;
    correo_electronico: string;
  };
}

export interface recordDetails extends censusRecord {
  categorias: {
    nombre: string;
    atributos: {
      nombre: string;
      valor: string;
    }[];
  }[];
}

export const RecordDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Strictly typed state
  const [details, setDetails] = useState<recordDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/census/records/${id}`);
        setDetails(response.data.record as recordDetails);
      } catch (error) {
        console.error(error);
        setError('Error al cargar los detalles del registro.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center p-6 bg-white">
        <p className="text-slate-500">Cargando registro...</p>
      </div>
    );
  }

  if (error || !details || !details.censo) {
    return (
      <div className="flex w-full h-full items-center justify-center p-6 bg-white">
        <p className="text-[#b20000]">{error || 'No se encontró el registro.'}</p>
      </div>
    );
  }

  // Format the date for the UI
  const formattedDate = new Date(details.fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col w-full h-full bg-white p-6 overflow-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-sm text-sky-500">
        <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Mi cuenta</span>
        <span className="text-slate-400">&gt;</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate('/records')}>Listado de registros</span>
        <span className="text-slate-400">&gt;</span>
        <span className="cursor-pointer hover:underline underline">Visualización del registro</span>
      </div>

      {/* Main Container Layout */}
      <div className="flex flex-col md:flex-row border border-slate-200 rounded-sm min-h-[700px]">
        {/* --- LEFT COLUMN: Form Data --- */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-200 text-lg md:text-xl text-slate-800 font-medium">
            Visualización del registro censal
          </div>

          <div className="p-4 border-b border-slate-200 text-slate-700">
            {details.censo.nombre} - {details.censo.municipio.nombre}
          </div>

          <div className="p-4 border-b border-slate-200 text-slate-700">
            ID: {details.id_registro}
          </div>

          <div className="p-4 text-slate-700">Datos del formulario:</div>

          {/* Dynamic List of Categories & Attributes */}
          <div className="px-4 pb-4 flex flex-col gap-3">
            {details.categorias.map((categoria, sectionIdx) => (
              <div key={sectionIdx} className="flex flex-col gap-2">
                {/* Category Box */}
                <div className="border border-slate-200 rounded-md p-2.5 text-sky-600/80 bg-white w-full text-sm font-medium">
                  {categoria.nombre}
                </div>

                {/* Indented Attributes Box */}
                {categoria.atributos.length > 0 && (
                  <div className="flex flex-col gap-2 pl-2">
                    {categoria.atributos.map((attr, attrIdx) => (
                      <div key={attrIdx} className="flex items-center gap-3">
                        {/* Little Gray Rectangle Indicator */}
                        <div className="w-3.5 h-6 bg-slate-200 rounded-[3px]"></div>
                        {/* Attribute Content Box */}
                        <div className="border border-slate-200 rounded-md p-2.5 text-sky-600/80 flex-1 bg-white text-sm">
                          <span className="font-semibold">{attr.nombre}:</span> {attr.valor}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN: Sidebar Metadata --- */}
        <div className="w-full md:w-[350px] border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 text-lg text-slate-800 font-medium">
            Detalle del formulario
          </div>

          <div className="p-4 border-b border-slate-200 text-sm text-slate-700">
            Creada el: {formattedDate}
          </div>

          <div className="p-4 border-b border-slate-200 text-sm text-slate-700 flex flex-col gap-4">
            <p>Creada por el usuario:</p>
            <div className="flex flex-col gap-1">
              <p className="text-slate-700">{details.creator.nombre} {details.creator.apellido}</p>
              <p className="text-sky-700 font-medium">{details.creator.correo_electronico}</p>
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 text-sm text-slate-700 flex flex-col gap-4">
            <p>Censo adaptado utilizado:</p>
            <div className="flex gap-2 items-center">
              <span className="text-slate-700">ID: {details.id_censo}</span>
              <span className="text-sky-800 font-medium cursor-pointer hover:underline">
                Visualizar formulario utilizado
              </span>
            </div>
          </div>

          {/* Warning Message Zone */}
          <div className="p-4 text-sm text-[#b20000] flex-1">
            {!details.confirmado && (
              <p>⚠️ Este registro aún no ha sido confirmado.</p>
            )}
            <p className="mt-2 text-slate-600">Ubicación: {details.ubicacion}</p>
          </div>

          {/* Bottom Action Area */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <Button 
              onClick={() => navigate(-1)} 
              className="w-full bg-[#b20000] hover:bg-[#8f0000] text-white rounded-md h-12 text-base font-normal shadow-none"
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};