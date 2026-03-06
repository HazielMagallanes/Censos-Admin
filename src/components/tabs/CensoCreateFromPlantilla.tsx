import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Trash2, CheckSquare, Square, X, GripVertical, Info } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { AttributeType } from "@/types/tipos";

// --- INTERFACES ---
interface Atributo {
  id_atributo: number;
  nombre: string;
  id_tipo: number;
  duplicable: boolean;
  plantilla: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CategoriaForm {
  id: string; // Unique ID for React rendering
  id_categoria?: number;
  nombre: string;
  atributos: Atributo[];
}

const CensoCreateFromPlantilla: React.FC = () => {
  const { idPlantilla } = useParams<{ idPlantilla: string }>();
  const navigate = useNavigate();

  // --- TEMPLATE STATE ---
  const [plantilla, setPlantilla] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // --- EDIT MODE STATE ---
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categorias, setCategorias] = useState<CategoriaForm[]>([]);

  // --- GLOBAL DATA ---
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [selectedMuniId, setSelectedMuniId] = useState<number | string>('');
  const [attributes, setAttributes] = useState<Atributo[]>([]);

  // --- MODAL & DND STATE ---
  const [draggedItem, setDraggedItem] = useState<{ type: 'category' | 'attribute'; categoryId: string; attrId?: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set());
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPlantilla = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/templates/${idPlantilla}`);
        const templateData = res.data.template || res.data;
        if (templateData) {
          setPlantilla(templateData);
          setTemplateName(templateData.nombre || `Plantilla R#${idPlantilla}`);
          setDescripcion(templateData.descripcion || '');
          if (templateData.id_municipio) {
            setSelectedMuniId(templateData.id_municipio);
          }

          // Map pivot relations to Categories for Editing
          const catsMap = new Map<number, CategoriaForm>();
          if (templateData.atributos && Array.isArray(templateData.atributos)) {
            templateData.atributos.forEach((pivot: any) => {
              const catId = pivot.categoria?.id_categoria || 0;
              if (!catsMap.has(catId)) {
                catsMap.set(catId, {
                  id: String(catId),
                  id_categoria: catId !== 0 ? catId : undefined,
                  nombre: pivot.categoria?.nombre || 'Agrupamiento General',
                  atributos: []
                });
              }
              const attr = pivot.atributo;
              if (attr) {
                catsMap.get(catId)!.atributos.push({
                  id_atributo: attr.id_atributo,
                  nombre: attr.nombre,
                  id_tipo: attr.id_tipo || attr.tipo?.id_tipo || 1,
                  duplicable: attr.duplicable ?? true,
                  plantilla: attr.plantilla ?? false,
                  created_at: attr.created_at,
                  updated_at: attr.updated_at,
                });
              }
            });
          } else if (templateData.categories) { // Fallback if format is app specific
            templateData.categories.forEach((cat: any, idx: number) => {
              catsMap.set(idx, {
                id: String(idx),
                id_categoria: undefined,
                nombre: cat.name,
                atributos: cat.attributes.map((a: any) => ({
                  id_atributo: a.id,
                  nombre: a.name,
                  id_tipo: a.type_id || 1,
                  duplicable: a.duplicable ?? true,
                  plantilla: false
                }))
              });
            });
          }

          const loadedCategories = Array.from(catsMap.values());
          setCategorias(loadedCategories.length > 0 ? loadedCategories : [
            { id: Math.random().toString(), nombre: "Nuevo agrupamiento", atributos: [] }
          ]);
        } else {
          setPlantilla({ id_plantilla: idPlantilla, nombre: `Plantilla R#${idPlantilla}`, descripcion: 'Descripción de la plantilla' });
        }
      } catch (err) {
        console.error("Error fetching template", err);
        setPlantilla({ id_plantilla: idPlantilla, nombre: `Plantilla R#${idPlantilla}`, descripcion: 'Descripción de la plantilla' });
      } finally {
        setLoading(false);
      }
    };

    const fetchAllDependencies = async () => {
      await fetchPlantilla();
      try {
        const [muniRes, attrRes] = await Promise.all([
          axios.get('/me/municipios'),
          axios.get('/attributes')
        ]);
        setMunicipios(muniRes.data || []);
        if (muniRes.data && muniRes.data.length > 0 && !selectedMuniId) {
          setSelectedMuniId(muniRes.data[0].id || muniRes.data[0].id_municipio);
        }
        setAttributes(attrRes.data.attributes || []);
      } catch (err) {
        console.error('Error fetching dependencies', err);
      }
    };

    fetchAllDependencies();
  }, [idPlantilla]);

  // --- ACTIONS ---
  const handleCreateCenso = async () => {
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

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert("El nombre de la plantilla es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: templateName,
        descripcion: descripcion,
        es_copia_de: null,
        id_municipio: selectedMuniId ? Number(selectedMuniId) : null,
        categorias: categorias.map(cat => ({
          id_categoria: cat.id_categoria, // passing existing cat id if it exists
          nombre: cat.nombre,
          descripcion: "",
          ids_atributos: cat.atributos.map(attr => attr.id_atributo)
        }))
      };

      await axios.put(`/templates/${idPlantilla}`, payload);

      // Reload silently to fetch fresh data
      const res = await axios.get(`/templates/${idPlantilla}`);
      const templateData = res.data.template || res.data;
      if (templateData) setPlantilla(templateData);

      setIsEditing(false); // Switch back to view mode
      alert("Plantilla actualizada con éxito.");
    } catch (error) {
      console.error("Error al actualizar la plantilla:", error);
      alert("Ocurrió un error al guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  };


  // --- DND HANDLERS ---
  const handleDragStart = (type: 'category' | 'attribute', categoryId: string, attrId?: number) => {
    if (!isEditing) return;
    setDraggedItem({ type, categoryId, attrId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditing) return;
    e.preventDefault();
  };

  const handleDropCategory = (targetCategoryId: string) => {
    if (!isEditing || !draggedItem || draggedItem.type !== 'category') return;
    if (draggedItem.categoryId === targetCategoryId) return;

    const draggedCategoryIndex = categorias.findIndex(c => c.id === draggedItem.categoryId);
    const targetCategoryIndex = categorias.findIndex(c => c.id === targetCategoryId);

    if (draggedCategoryIndex === -1 || targetCategoryIndex === -1) return;

    const newCategorias = [...categorias];
    const [draggedCategory] = newCategorias.splice(draggedCategoryIndex, 1);
    newCategorias.splice(targetCategoryIndex, 0, draggedCategory);

    setCategorias(newCategorias);
    setDraggedItem(null);
  };

  const handleDropAttribute = (targetCategoryId: string, targetAttrId: number) => {
    if (!isEditing || !draggedItem || draggedItem.type !== 'attribute') return;
    if (draggedItem.categoryId !== targetCategoryId) return;
    if (draggedItem.attrId === targetAttrId) return;

    const categoryIndex = categorias.findIndex(c => c.id === targetCategoryId);
    if (categoryIndex === -1) return;
    if (!draggedItem.attrId) return;

    const newCategorias = [...categorias];
    const draggedAttrIndex = newCategorias[categoryIndex].atributos.findIndex(a => a.id_atributo === draggedItem.attrId);
    if (draggedAttrIndex === -1) return;

    const [draggedAttr] = newCategorias[categoryIndex].atributos.splice(draggedAttrIndex, 1);
    const targetAttrIndex = newCategorias[categoryIndex].atributos.findIndex(a => a.id_atributo === targetAttrId);

    if (targetAttrIndex !== -1) {
      newCategorias[categoryIndex].atributos.splice(targetAttrIndex, 0, draggedAttr);
    } else {
      newCategorias[categoryIndex].atributos.push(draggedAttr);
    }

    setCategorias(newCategorias);
    setDraggedItem(null);
  };

  // --- FORM HANDLERS ---
  const handleAddAgrupamiento = () => {
    setCategorias([...categorias, { id: Math.random().toString(), nombre: "Nuevo agrupamiento", atributos: [] }]);
  };

  const handleRemoveAgrupamiento = (catId: string) => {
    setCategorias(categorias.filter(c => c.id !== catId));
  };

  const handleRemoveAtributo = (catId: string, attrId: number) => {
    setCategorias(categorias.map(cat => cat.id === catId ? { ...cat, atributos: cat.atributos.filter(a => a.id_atributo !== attrId) } : cat));
  };

  const updateCategoriaName = (id: string, newName: string) => {
    setCategorias(categorias.map(cat => cat.id === id ? { ...cat, nombre: newName } : cat));
  };

  // --- MODAL HANDLERS ---
  const openAttributeModal = () => {
    if (categorias.length === 0) {
      const newCatId = Math.random().toString();
      setCategorias([{ id: newCatId, nombre: "Agrupamiento general", atributos: [] }]);
      setTargetCategoryId(newCatId);
    }
    setSelectedAttributes(new Set());
    setIsModalOpen(true);
  };

  const toggleAttributeSelection = (id: number) => {
    const newSet = new Set(selectedAttributes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAttributes(newSet);
  };

  const confirmAttributeSelection = () => {
    if (!targetCategoryId) return;

    const attributesToAdd = attributes.filter(attr => selectedAttributes.has(attr.id_atributo));

    setCategorias(categorias.map(cat => {
      if (cat.id === targetCategoryId) {
        const existingIds = new Set(cat.atributos.map(a => a.id_atributo));
        const uniqueNewAttributes = attributesToAdd.filter(a => !existingIds.has(a.id_atributo));
        return { ...cat, atributos: [...cat.atributos, ...uniqueNewAttributes] };
      }
      return cat;
    }));

    setIsModalOpen(false);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "dd / mm / aaaa";
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoStr));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
    </div>
  );
  if (!plantilla) return <div className="p-6 text-red-500">No se pudo cargar la información de la plantilla.</div>;

  const creationDate = plantilla.created_at ? formatDate(plantilla.created_at) : 'dd / mm / aaaa';
  const createdBy = plantilla.createdBy?.nombre_y_apellidos || plantilla.createdBy?.nombre || 'Nombre y apellidos del usuario';
  const statusText = plantilla.bloqueado ? 'Cerrado' : 'Disponible';

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 relative">
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
          <span className="cursor-pointer hover:underline underline-offset-4 decoration-[#608CB5]">Visualizar plantilla de censo</span>
        </div>

        <div className="flex gap-4">
          {/* Left Panel */}
          <div className="flex-1 bg-white rounded border border-[#D0DBE5] p-5 shadow-sm">
            <div className="text-xl font-normal text-slate-800 mb-6 border-b pb-2">Visualización de la plantilla de censo</div>

            <label className="block text-sm font-medium text-slate-800 mb-1">Ingrese el nombre correspondiente:</label>
            <input
              type="text"
              placeholder="Nombre de la plantilla"
              className={`w-full border border-slate-200 rounded-md p-2 text-md text-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500 mb-4 ${!isEditing ? 'bg-slate-50' : ''}`}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={!isEditing}
            />

            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-800 mb-1">Descripción</label>
                <textarea
                  className="w-full border border-slate-200 rounded-md p-2 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-slate-700 text-sm font-medium">
              ID: <span className="font-semibold text-slate-800">R#{plantilla.id_plantilla}</span>
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm text-slate-800 font-medium">
              Estado:
              <span className="bg-[#2A86C4] text-white px-3 py-1 rounded text-xs font-semibold">{statusText}</span>
            </div>

            <div className="border-t border-[#D0DBE5] pt-4">
              <div className="text-slate-800 text-sm font-medium mb-4">Lista de atributos del censo</div>

              {/* DND Categorias & Atributos */}
              <div className="flex flex-col gap-4">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="flex flex-col gap-2">
                    <div
                      className={`flex items-center bg-white border rounded-md transition-all ${isEditing && draggedItem?.type === 'category' && draggedItem?.categoryId === categoria.id ? 'opacity-50 border-sky-400' : 'border-slate-200'} ${isEditing ? 'hover:border-sky-300' : ''}`}
                      draggable={isEditing}
                      onDragStart={() => handleDragStart('category', categoria.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => { e.stopPropagation(); handleDropCategory(categoria.id); }}
                    >
                      <div className={`p-3 ${isEditing ? 'text-slate-400 cursor-grab active:cursor-grabbing' : 'text-slate-200'}`}>
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        className={`flex-1 p-3 text-sm font-medium focus:outline-none bg-transparent ${isEditing ? 'text-sky-600' : 'text-sky-600 cursor-default'}`}
                        value={categoria.nombre}
                        onChange={(e) => updateCategoriaName(categoria.id, e.target.value)}
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <div className="flex items-center border-l border-slate-200">
                          <button onClick={() => handleRemoveAgrupamiento(categoria.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {categoria.atributos.map((atributo) => (
                      <div
                        key={`${categoria.id}-${atributo.id_atributo}`}
                        className={`flex items-center bg-white border rounded-md ml-4 transition-all ${isEditing && draggedItem?.type === 'attribute' && draggedItem?.categoryId === categoria.id && draggedItem?.attrId === atributo.id_atributo ? 'opacity-50 border-sky-400' : 'border-slate-200'} ${isEditing ? 'hover:border-sky-300' : ''}`}
                        draggable={isEditing}
                        onDragStart={() => handleDragStart('attribute', categoria.id, atributo.id_atributo)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => { e.stopPropagation(); handleDropAttribute(categoria.id, atributo.id_atributo); }}
                      >
                        <div className={`p-3 ${isEditing ? 'text-slate-400 cursor-grab active:cursor-grabbing' : 'text-slate-200'}`}>
                          <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1 p-3 text-sm text-sky-600/80 bg-transparent">
                          {atributo.nombre}
                        </div>

                        {isEditing && (
                          <div className="flex items-center border-l border-slate-200">
                            <button onClick={() => handleRemoveAtributo(categoria.id, atributo.id_atributo)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Actions for adding groups / attrs */}
                {isEditing && (
                  <div className="flex gap-4 mt-2">
                    <Button onClick={handleAddAgrupamiento} variant="outline" className="flex-1 text-sky-600 border-sky-200 hover:bg-sky-50">
                      Agregar agrupamiento
                    </Button>
                    <Button onClick={openAttributeModal} variant="outline" className="flex-1 text-sky-600 border-sky-200 hover:bg-sky-50">
                      Agregar atributos
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[320px] bg-white rounded border border-[#D0DBE5] p-5 flex flex-col gap-4 shadow-sm min-h-[400px]">
            <div className="text-xl font-normal text-slate-800 mb-2 border-b pb-2">Datos de la plantilla</div>

            <div className="text-slate-600 text-sm mt-2">
              Creada el: {creationDate}
            </div>

            <div className="text-slate-600 text-sm">
              <span className="block mb-1">Creada por el usuario:</span>
              <span className="font-medium text-slate-800">{createdBy}</span>
            </div>

            <div className="text-[#B30000] text-sm mt-4 font-medium">
              Zona de alertas e información circunstancial. {plantilla.bloqueado ? 'Plantilla bloqueada, en uso.' : ''}
            </div>

           
            <div className="mt-auto flex flex-col gap-3">
              {!isEditing ? (
                <button
                  className="bg-[#2A86C4] hover:bg-sky-700 text-white font-medium py-3 rounded-md transition-colors flex justify-between px-4 items-center w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Modificar configuración
                  <Info className="w-5 h-5 opacity-80" />
                </button>
              ) : (
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center w-full shadow-sm"
                  onClick={handleSaveTemplate}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar configuración'}
                </button>
              )}

              <div className="flex gap-3">
                <button
                  className="bg-[#B30000] hover:bg-red-800 text-white font-medium py-3 rounded-md transition-colors flex justify-center flex-1"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false); // cancel edit
                    } else {
                      navigate(-1);
                    }
                  }}
                >
                  {isEditing ? 'Cancelar' : 'Volver'}
                </button>

                <button
                  className="bg-[#2A86C4] hover:bg-sky-700 text-white font-medium py-3 rounded-md transition-colors flex justify-center flex-1"
                  onClick={handleCreateCenso}
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear censo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL FOR ATTRIBUTE SELECTION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-800">Seleccionar Atributos</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pt-4 border-b">
              <label className="block text-sm font-medium text-sky-700 mb-2">Seleccionar agrupamiento</label>
              <select
                value={targetCategoryId || ""}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600 mb-4"
              >
                <option value="">-- Selecciona un agrupamiento --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-2">
              {attributes.map(attr => (
                <div
                  key={attr.id_atributo}
                  onClick={() => toggleAttributeSelection(attr.id_atributo)}
                  className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {selectedAttributes.has(attr.id_atributo) ? (
                    <CheckSquare className="w-5 h-5 text-sky-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{attr.nombre}</p>
                    <p className="text-xs text-slate-400">Tipo: {AttributeType[attr.id_tipo as keyof typeof AttributeType]} {attr.duplicable ? "• Duplicable" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={confirmAttributeSelection}
                disabled={!targetCategoryId}
              >
                Añadir seleccionados
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CensoCreateFromPlantilla;
