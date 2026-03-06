import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
const CensoCreateFromPlantilla: React.FC = () => {
  const { idPlantilla } = useParams<{ idPlantilla: string }>();
  const navigate = useNavigate();
  const [plantilla, setPlantilla] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [selectedMuniId, setSelectedMuniId] = useState<number | string>('');

  useEffect(() => {
    const fetchPlantilla = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/templates/${idPlantilla}`);
        const templateData = res.data.template || res.data;
        if (templateData) {
          setPlantilla(templateData);
        } else {
          // fallback demo
          setPlantilla({ id_plantilla: idPlantilla, nombre: `Plantilla R#${idPlantilla}`, descripcion: 'Descripción de la plantilla' });
        }
      } catch (err) {
        setPlantilla({ id_plantilla: idPlantilla, nombre: `Plantilla R#${idPlantilla}`, descripcion: 'Descripción de la plantilla' });
      } finally {
        setLoading(false);
      }
    };

    fetchPlantilla();

    const fetchMunicipios = async () => {
      try {
        const res = await axios.get('/me/municipios');
        setMunicipios(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedMuniId(res.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching municipios', err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error(`[fetchMunicipios] Error ${err.response.status}:`, err.response.data);
          } else if (err.request) {
            console.error('[fetchMunicipios] No response received:', err.request);
          } else {
            console.error('[fetchMunicipios] Error setting up request:', err.message);
          }
        }
      }
    };
    fetchMunicipios();
  }, [idPlantilla]);

  const handleCreate = async () => {
    if (!plantilla) return;
    setCreating(true);
    try {
      const payload = {
        nombre: `Censo adaptado - ${plantilla.nombre || plantilla.id_plantilla}`,
        descripcion: plantilla.descripcion || `Creado desde la plantilla ${plantilla.nombre || plantilla.id_plantilla}`,
        anio: new Date().getFullYear(),
        id_plantilla: Number(plantilla.id_plantilla),
        id_municipio: Number(selectedMuniId) || Number(plantilla.id_municipio) || 1,
        id_tipo_censo: 1, // Default to 1 (Ordinario)
      };
      console.log('[CensoCreateFromPlantilla] handleCreate payload:', payload);

      const res = await axios.post('/census', payload);
      const created = res.data;
      const newId = created?.id_censo || created?.id || 0;
      navigate(`/censo/${newId}`);
    } catch (err) {
      console.error('Error creating censo from plantilla', err);
      alert('Error al crear censo');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
    </div>
  );
  if (!plantilla) return <div className="p-6 text-red-500">No se pudo cargar la información de la plantilla.</div>;

  const categoriesMap: Record<string, any[]> = {};
  if (plantilla?.atributos) {
    plantilla.atributos.forEach((item: any) => {
      const catName = item.categoria?.nombre || 'General';
      if (!categoriesMap[catName]) categoriesMap[catName] = [];
      categoriesMap[catName].push(item);
    });
  } else if (plantilla.categories) {
    // case for app format if that comes
    plantilla.categories.forEach((cat: any) => {
      categoriesMap[cat.name] = cat.attributes.map((a: any) => ({
        atributo: { nombre: a.name, tipo: { nombre: a.type } },
        opcional: !a.required
      }));
    });
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center justify-start gap-2 text-sm text-[#608CB5]">
          <span className="cursor-pointer hover:underline">Formularios y Censos</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(-2)}>Listado de censos adaptados</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(-1)}>Crear nuevo</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(-1)}>Listado de Plantillas</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:underline underline-offset-4 decoration-[#608CB5]">Visualizar plantilla</span>
        </div>

        <div className="flex gap-4">
          {/* Left: plantilla preview / campos */}
          <div className="flex-1 bg-white rounded border border-[#D0DBE5] p-5 shadow-sm">
            <div className="text-[#238DCA] text-sm font-medium mb-2">Nombre de la plantilla</div>
            <div className="text-slate-800 font-semibold text-xl mb-3">{plantilla.nombre}</div>

            <div className="text-[#238DCA] text-sm font-medium mb-1">ID de la plantilla</div>
            <div className="flex items-center gap-2 mb-6 text-slate-700 text-lg">
              R#{plantilla.id}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#608CB5] cursor-pointer"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>

            <div className="border-t border-[#D0DBE5] pt-4">
              <div className="text-[#238DCA] text-sm font-medium mb-4">Campos del formulario</div>

              {/* Example grouping and attributes - placeholders to be replaced by real plantilla content */}
              {/* Grouping and attributes */}
              <div className="space-y-6">
                {Object.keys(categoriesMap).length > 0 ? (
                  Object.entries(categoriesMap).map(([catName, items], idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="border border-[#D0DBE5] rounded p-3 text-[#608CB5] bg-white font-medium text-sm">
                        {catName}
                      </div>
                      <div className="space-y-3">
                        {items.map((item: any, attrIdx: number) => (
                          <div key={attrIdx} className="flex items-center gap-3 border border-[#D0DBE5] p-4 rounded bg-white relative hover:bg-slate-50 transition-colors shadow-sm ml-4">
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-slate-300 rounded-r"></div>
                            <div className="flex-1">
                              <div className="text-slate-700 font-medium">{item.atributo?.nombre}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 border border-[#D0DBE5] rounded bg-white text-[#238DCA]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-8 bg-slate-50 rounded border border-dashed border-slate-300">
                    Esta plantilla no tiene atributos configurados.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: datos de la plantilla + acciones */}
          <div className="w-[320px] bg-white rounded border border-[#D0DBE5] p-5 flex flex-col gap-4 shadow-sm">
            <div className="text-slate-800 font-medium text-lg">Datos de la plantilla</div>
            <div className="bg-[#238DCA] text-white px-4 py-3 rounded-md flex justify-between items-center text-sm font-medium">
              Disponible
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div className="text-[#238DCA] text-sm mt-3 font-medium">Creada el: dd / mm / aaaa</div>

            <div className="text-[#238DCA] text-sm font-medium mt-2">Territorio del censo:</div>
            <select
              className="w-full border border-[#D0DBE5] rounded-md p-3 text-slate-800 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={selectedMuniId}
              onChange={(e) => setSelectedMuniId(e.target.value)}
            >
              <option value="" disabled>Seleccione un territorio</option>
              {municipios.length > 0 ? (
                municipios.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))
              ) : (
                <option value="1">Cebada (Default)</option>
              )}
            </select>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <button
                className="bg-[#0067B1] hover:bg-sky-800 text-white font-medium py-3 rounded-md transition-colors flex justify-center w-full"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? 'Creando...' : 'Crear censo'}
              </button>
              <button
                className="bg-[#B30000] hover:bg-red-800 text-white font-medium py-3 rounded-md transition-colors flex justify-center w-full"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CensoCreateFromPlantilla;
