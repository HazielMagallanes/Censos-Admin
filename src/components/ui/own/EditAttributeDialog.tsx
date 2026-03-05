import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog } from "./Dialog";
import { AttributeType } from "@/types/tipos";
import { Trash2, GripVertical, Circle } from "lucide-react";

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
}

interface ListItem {
  id: string;
  name: string;
}

interface DraggedItem {
  index: number;
}

interface EditAttributeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAttribute: Atributo) => void;
  initialData: Atributo | null;
}

const EditAttributeDialog: React.FC<EditAttributeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // --- STATES ---
  const [formData, setFormData] = useState<Atributo>({
    id_atributo: 0,
    nombre: "",
    descripcion: "",
    recomendaciones: "",
    duplicable: false,
    obligatorio: false,
    id_categoria: 0,
    id_tipo: 0,
    created_at: "",
    updated_at: "",
  });

  const [error, setError] = useState<string | null>(null);

  // States para la lista (cuando id_tipo === 4)
  const [optionsList, setOptionsList] = useState<ListItem[]>([]);
  const [newOptionName, setNewOptionName] = useState("");
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  // --- EFECTO DE INICIALIZACIÓN ---
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      
      // Si es tipo 4 (Select/Lista), parseamos el string "[A,B,C]" al array
      if (initialData.id_tipo === 4) {
        const rawString = initialData.recomendaciones || "";
        // Quitamos los corchetes del inicio y fin
        const cleanString = rawString.replace(/^\[|\]$/g, '').trim();
        
        if (cleanString) {
          const parsedOptions = cleanString.split(',').map(item => ({
            id: Math.random().toString(36).substring(2, 9),
            name: item.trim()
          }));
          setOptionsList(parsedOptions);
        } else {
          setOptionsList([]);
        }
      }
      setError(null);
    }
  }, [initialData, isOpen]);

  // --- HANDLERS DEL FORMULARIO ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id_categoria" || name === "id_tipo" ? Number(value) : value,
    }));
  };

  const handleBooleanChange = (name: keyof Atributo, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS DE LA LISTA ---
  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const newItem: ListItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: newOptionName.trim(),
    };
    setOptionsList([...optionsList, newItem]);
    setNewOptionName("");
  };

  const handleDeleteOption = (id: string) => {
    setOptionsList(optionsList.filter((item) => item.id !== id));
  };

  const handleDragStart = (index: number) => setDraggedItem({ index });
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (targetIndex: number) => {
    if (draggedItem === null || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }
    const newList = [...optionsList];
    const draggedItemContent = newList[draggedItem.index];
    newList.splice(draggedItem.index, 1);
    newList.splice(targetIndex, 0, draggedItemContent);
    setOptionsList(newList);
    setDraggedItem(null);
  };
  const handleDragEnd = () => setDraggedItem(null);

  // --- SUBMIT ---
  const handleSubmit = () => {
    if (!formData.nombre.trim() || !formData.id_tipo || !formData.descripcion.trim()) {
      setError("Por favor, complete los campos obligatorios (*).");
      return;
    }

    const finalData = { ...formData };

    // Si es tipo 4, reconstruimos el string "[Opción1,Opción2]"
    if (formData.id_tipo === 4) {
      if (optionsList.length === 0) {
        setError("Debe agregar al menos una opción a la lista.");
        return;
      }
      const optionsString = `[${optionsList.map(opt => opt.name).join(',')}]`;
      finalData.recomendaciones = optionsString;
    }

    setError(null);
    onSave(finalData);
  };

  const footerButtons = (
    <>
      <Button variant="destructive" className="bg-[#b91c1c] hover:bg-red-800 text-white px-6" onClick={onClose}>
        Cancelar
      </Button>
      <Button className="bg-[#2a86c4] hover:bg-[#20699c] text-white px-6" onClick={handleSubmit}>
        Guardar Cambios
      </Button>
    </>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Editar Atributo" footer={footerButtons}>
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-sky-800 mb-1">Nombre del atributo *</label>
          <input
            type="text"
            name="nombre"
            className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-sky-800 mb-1">Tipo *</label>
            <select
              name="id_tipo"
              className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
              value={formData.id_tipo || ""}
              onChange={handleChange}
            >
              <option value="" disabled>Seleccione...</option>
              {Object.entries(AttributeType).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-sky-800 mb-1">ID Categoría *</label>
            <input
              type="number"
              name="id_categoria"
              className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
              value={formData.id_categoria || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Obligatorio */}
          <div>
            <label className="block text-sm font-medium text-sky-800 mb-2">¿Es obligatorio?</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  checked={formData.obligatorio === true}
                  onChange={() => handleBooleanChange("obligatorio", true)}
                /> Sí
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  checked={formData.obligatorio === false}
                  onChange={() => handleBooleanChange("obligatorio", false)}
                /> No
              </label>
            </div>
          </div>

          {/* Duplicable */}
          <div>
            <label className="block text-sm font-medium text-sky-800 mb-2">¿Es duplicable?</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  checked={formData.duplicable === true}
                  onChange={() => handleBooleanChange("duplicable", true)}
                /> Sí
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  checked={formData.duplicable === false}
                  onChange={() => handleBooleanChange("duplicable", false)}
                /> No
              </label>
            </div>
          </div>
        </div>

        {/* --- RENDERIZADO CONDICIONAL DE RECOMENDACIONES --- */}
        {formData.id_tipo === 4 ? (
          <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
            <label className="block text-sm font-medium text-sky-800 mb-2">Opciones de la lista *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Nueva opción..."
                className="flex-1 border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <Button onClick={handleAddOption} type="button" className="bg-[#2a86c4] hover:bg-[#20699c] text-white">
                Añadir
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
              {optionsList.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No hay opciones añadidas.</p>
              ) : (
                optionsList.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between border border-slate-200 rounded-md p-2 bg-white transition-all ${
                      draggedItem?.index === index ? 'opacity-50 bg-slate-100' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDeleteOption(item.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-sky-800 mb-1">Recomendaciones</label>
            <textarea
              name="recomendaciones"
              placeholder="Recomendaciones para el llenado..."
              className="w-full min-h-[80px] border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600 resize-none"
              value={formData.recomendaciones}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-sky-800 mb-1">Descripción *</label>
          <textarea
            name="descripcion"
            className="w-full min-h-[80px] border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600 resize-none"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Mensaje de Error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </Dialog>
  );
};

export default EditAttributeDialog;