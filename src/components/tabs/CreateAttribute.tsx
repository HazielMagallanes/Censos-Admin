import React, { useState } from "react";
import { Trash2, GripVertical, Circle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import axios from "axios";
import { AttributeType } from "@/types/tipos";

// --- INTERFACES ---
interface ListItem {
  id: string;
  name: string;
}

interface DraggedItem {
  index: number;
}

interface CreateAttributeProps {
  onBack: () => void; // Function to go back to the list view
}

const CreateAttribute: React.FC<CreateAttributeProps> = ({ onBack }) => {
  // Form States
  const [attributeName, setAttributeName] = useState("");
  const [attributeType, setAttributeType] = useState<number | null>(null);
  const [isDuplicable, setIsDuplicable] = useState<boolean | null>(null);
  const [isMandatory, setIsMandatory] = useState<boolean | null>(null);
  const [description, setDescription] = useState("");

  // List Configuration States
  const [newOptionName, setNewOptionName] = useState("");
  const [dataList, setDataList] = useState<ListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  // Handlers
  const handleAddOption = () => {
    if (!newOptionName.trim()) {
      setError("Por favor, ingrese un nombre para la opción.");
      return;
    }
    const newItem: ListItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: newOptionName,
    };
    setDataList([...dataList, newItem]);
    setNewOptionName("");
    setError(null);
  };

  const handleDeleteOption = (id: string) => {
    setDataList(dataList.filter((item) => item.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedItem({ index });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItem === null || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }

    const newList = [...dataList];
    const draggedItemContent = newList[draggedItem.index];
    
    // Remove from old position
    newList.splice(draggedItem.index, 1);
    // Insert at new position
    newList.splice(targetIndex, 0, draggedItemContent);
    
    setDataList(newList);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = async () => {
    if(!attributeName.trim() || !attributeType || isDuplicable === null || !description.trim()) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }
    try {
      const  response = await axios.post("/attributes", {
        nombre: attributeName,
        descripcion: description,
        duplicable: isDuplicable,
        obligatorio: isMandatory,                                                                                                                                  
        id_tipo: attributeType, 
        recomendaciones: dataList.length > 0 ? `[${dataList.map(item => item.name).join(",")}]` : "",
      });
      if (response.status === 200) {
        onBack(); // Go back to the list view after successful save
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al guardar el atributo.");
      console.error("Error saving attribute:", error);
    }
    // Add your save logic here, then return to list:
     onBack(); 
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <main className="flex-1 p-6 overflow-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <span className="text-sky-600 cursor-pointer hover:underline" onClick={onBack}>
            Atributos y Plantillas
          </span>
          <span>&gt;</span>
          <span className="text-sky-600 cursor-pointer hover:underline" onClick={onBack}>
            Listado de atributos
          </span>
          <span>&gt;</span>
          <span className="font-medium underline">Agregar nuevo</span>
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 gap-6 ${attributeType === 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          {/* Column 1: General Info */}
          <div className="bg-white rounded-md border shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-slate-700 mb-2 border-b pb-2">Creador nuevo atributo</h2>
            
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">Nombre del atributo *</label>
              <input
                type="text"
                placeholder="Entrada de texto"
                className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-800 mb-1">Tipo del atributo *</label>
              <select
                className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                value={attributeType ?? ""}
                onChange={(e) => setAttributeType(Number(e.target.value))}
              >
                <option value="" disabled>Seleccione un tipo</option>
                {Object.entries(AttributeType).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}

              </select>
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            {/* Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-12">
              <Button 
                variant="destructive" 
                className="bg-[#b91c1c] hover:bg-red-800 text-white px-6"
                onClick={onBack}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#2a86c4] hover:bg-[#20699c] text-white px-6"
                onClick={handleSave}
              >
                Guardar atributo
              </Button>
            </div>


          </div>

          {/* Column 2: Characteristics */}
          <div className="bg-white rounded-md border shadow-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-slate-700 mb-2 border-b pb-2">Características</h2>
              <div>
              <label className="block text-sm font-medium text-sky-800 mb-2">¿Es el atributo obligatorio? *</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="mandatory"
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                    checked={isMandatory=== true}
                    onChange={() => setIsMandatory(true)}
                  />
                  Sí
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="mandatory"
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                    checked={isMandatory === false}
                    onChange={() => setIsMandatory(false)}
                  />
                  No
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sky-800 mb-2">¿Es el atributo duplicable? *</label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicable"
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                    checked={isDuplicable === true}
                    onChange={() => setIsDuplicable(true)}
                  />
                  Sí
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicable"
                    className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                    checked={isDuplicable === false}
                    onChange={() => setIsDuplicable(false)}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-sky-800 mb-1">Descripción del atributo *</label>
              <textarea
                placeholder="Inserte su texto aquí"
                className="w-full flex-1 min-h-[250px] border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Column 3: List Configuration */}
          {attributeType === 4 && (
          <div className="bg-white rounded-md border shadow-sm p-6 flex flex-col justify-between h-full relative">
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-semibold text-slate-700 mb-2 border-b pb-2">Configuración de lista</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ingrese un nombre para la opción a añadir*</label>
                <input
                  type="text"
                  placeholder="Nombre de la opción"
                  className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAddOption}
                className="w-full bg-[#2a86c4] hover:bg-[#20699c] text-white py-2"
              >
                Añadir a la lista
              </Button>
              <div className="mt-2">
              <label className="block text-sm font-medium text-sky-800 mb-3">Lista de datos del atributo</label>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[210px]">
                {dataList.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay opciones añadidas aún.</p>
                ) : (
                  dataList.map((item, index) => (
                    <div 
                      key={item.id} 
                    className={`flex items-center justify-between border border-slate-200 rounded-md p-3 bg-white transition-all ${
                      draggedItem?.index === index ? 'opacity-50 bg-slate-100' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-3">
                      <Circle className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-500">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDeleteOption(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing" />
                    </div>
                  </div>
                )))}
              </div>
            </div>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateAttribute;