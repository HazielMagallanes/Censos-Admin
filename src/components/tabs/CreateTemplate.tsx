import React, { useState } from "react";
import { Trash2, ChevronUp, ChevronDown, CheckSquare, Square, X } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

// --- INTERFACES ---
interface Atributo {
    id_atributo: number;
    nombre: string;
    id_tipo: number;
    duplicable: boolean;
    plantilla: boolean;
    created_at: string;
    updated_at: string;
}

// Form state interfaces
interface CategoriaForm {
    id: string; // Unique ID for React rendering
    nombre: string;
    atributos: Atributo[];
}

interface CreateTemplateProps {
    onBack: () => void;
}

// Mock data for the selection list
const MOCK_AVAILABLE_ATTRIBUTES: Atributo[] = [
    { id_atributo: 1, nombre: "Nombre del encuestado", id_tipo: 1, duplicable: false, plantilla: false, created_at: "2024-01-01", updated_at: "2024-01-01" },
    { id_atributo: 2, nombre: "DNI", id_tipo: 2, duplicable: false, plantilla: false, created_at: "2024-01-01", updated_at: "2024-01-01" },
    { id_atributo: 3, nombre: "Fecha de nacimiento", id_tipo: 3, duplicable: false, plantilla: false, created_at: "2024-01-01", updated_at: "2024-01-01" },
    { id_atributo: 4, nombre: "Observaciones", id_tipo: 1, duplicable: true, plantilla: false, created_at: "2024-01-01", updated_at: "2024-01-01" },
];

const CreateTemplate: React.FC<CreateTemplateProps> = ({ onBack }) => {
    // --- STATE ---
    const [templateName, setTemplateName] = useState("");
    const [exclusividad, setExclusividad] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>("Placeholder / Sitio para alerta");
    
    // Categorias/Agrupamientos State
    const [categorias, setCategorias] = useState<CategoriaForm[]>([
        { id: Math.random().toString(), nombre: "Nombre del agrupamiento", atributos: [] }
    ]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set());
    const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

    // --- HANDLERS: Form Structure ---
    const handleAddAgrupamiento = () => {
        setCategorias([
            ...categorias, 
            { id: Math.random().toString(), nombre: "Nuevo agrupamiento", atributos: [] }
        ]);
    };

    const handleRemoveAgrupamiento = (catId: string) => {
        setCategorias(categorias.filter(c => c.id !== catId));
    };

    const handleRemoveAtributo = (catId: string, attrId: number) => {
        setCategorias(categorias.map(cat => {
            if (cat.id === catId) {
                return { ...cat, atributos: cat.atributos.filter(a => a.id_atributo !== attrId) };
            }
            return cat;
        }));
    };

    const updateCategoriaName = (id: string, newName: string) => {
        setCategorias(categorias.map(cat => cat.id === id ? { ...cat, nombre: newName } : cat));
    };

    // --- HANDLERS: Modal & Attribute Selection ---
    const openAttributeModal = () => {
        // If there are no categories, create one automatically to hold the attributes
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

        const attributesToAdd = MOCK_AVAILABLE_ATTRIBUTES.filter(attr => selectedAttributes.has(attr.id_atributo));
        
        setCategorias(categorias.map(cat => {
            if (cat.id === targetCategoryId) {
                // Prevent duplicates in the same category
                const existingIds = new Set(cat.atributos.map(a => a.id_atributo));
                const uniqueNewAttributes = attributesToAdd.filter(a => !existingIds.has(a.id_atributo));
                
                return { ...cat, atributos: [...cat.atributos, ...uniqueNewAttributes] };
            }
            return cat;
        }));

        setIsModalOpen(false);
    };

    // --- HANDLERS: Save ---
    const handleSave = () => {
        // Here we format the state to match your Prisma backend structure
        const payload = {
            nombre: templateName,
            descripcion: "", // Add a description state if needed
            es_copia_de: null,
            id_municipio: null,
            categorias: categorias.map(cat => ({
                nombre: cat.nombre,
                descripcion: "", // Default or add field
                atributos: cat.atributos.map(attr => ({
                    nombre: attr.nombre,
                    descripcion: "",
                    recomendaciones: "",
                    obligatorio: false,
                    duplicable: attr.duplicable,
                    id_tipo: attr.id_tipo
                }))
            }))
        };

        console.log("Saving template payload:", payload);
        // axios.post('/plantillas', payload).then(...)
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 relative">
            <main className="flex-1 p-6 overflow-auto">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-sky-600 cursor-pointer hover:underline" onClick={onBack}>
                        Atributos y Plantillas
                    </span>
                    <span>&gt;</span>
                    <span className="text-sky-600 cursor-pointer hover:underline" onClick={onBack}>
                        Listado de plantillas
                    </span>
                    <span>&gt;</span>
                    <span className="font-medium underline">Agregar nueva</span>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left Panel: Form (Spans 3 columns) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* Title Section */}
                        <div>
                            <h2 className="text-xl font-normal text-slate-800 mb-4 border-b pb-2">Creador de plantillas de censo</h2>
                            
                            <label className="block text-sm font-medium text-sky-700 mb-1">Nombre de la plantilla</label>
                            <input
                                type="text"
                                placeholder="Entrada de texto"
                                className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                            />
                        </div>

                        {/* Fields Section */}
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-sky-700 mb-3 border-b pb-2">Campos del formulario</h3>
                            
                            <div className="flex flex-col gap-4">
                                {categorias.map((categoria) => (
                                    <div key={categoria.id} className="flex flex-col gap-2">
                                        
                                        {/* Agrupamiento Header */}
                                        <div className="flex items-center bg-white border border-slate-200 rounded-md">
                                            <input 
                                                type="text"
                                                className="flex-1 p-3 text-sm text-sky-600/80 font-medium focus:outline-none bg-transparent"
                                                value={categoria.nombre}
                                                onChange={(e) => updateCategoriaName(categoria.id, e.target.value)}
                                            />
                                            <div className="flex items-center border-l border-slate-200">
                                                <button onClick={() => handleRemoveAgrupamiento(categoria.id)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="flex flex-col bg-slate-50">
                                                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 border-b border-slate-200 transition-colors">
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nested Attributes */}
                                        {categoria.atributos.map((atributo) => (
                                            <div key={`${categoria.id}-${atributo.id_atributo}`} className="flex items-center bg-white border border-slate-200 rounded-md ml-4 relative">
                                                {/* Left structural border indicator */}
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-slate-300 rounded-r-md"></div>
                                                
                                                <div className="flex-1 p-3 pl-5 text-sm text-sky-600/80 bg-transparent">
                                                    {atributo.nombre}
                                                </div>
                                                
                                                <div className="flex items-center border-l border-slate-200">
                                                    <button onClick={() => handleRemoveAtributo(categoria.id, atributo.id_atributo)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <div className="flex flex-col bg-slate-50">
                                                        <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 border-b border-slate-200 transition-colors">
                                                            <ChevronUp className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Panel: Sidebar (Spans 1 column) */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        
                        {/* Herramientas */}
                        <div>
                            <h3 className="text-lg font-normal text-slate-800 mb-4 border-b pb-2">Herramientas</h3>
                            <div className="flex flex-col gap-3">
                                {/* NEW BUTTON ADDED HERE */}
                                <Button 
                                    onClick={handleAddAgrupamiento}
                                    className="w-full bg-[#2a86c4] hover:bg-[#20699c] text-white py-2 shadow-sm"
                                >
                                    Agregar agrupamiento
                                </Button>
                                <Button 
                                    onClick={openAttributeModal}
                                    className="w-full bg-[#2a86c4] hover:bg-[#20699c] text-white py-2 shadow-sm"
                                >
                                    Agregar atributos
                                </Button>
                            </div>
                        </div>

                        {/* Opciones y Alertas */}
                        <div>
                            <h3 className="text-lg font-normal text-slate-800 mb-4 border-b pb-2">Opciones y alertas</h3>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-sky-700 mb-3">Exclusividad para proyectos especiales</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                                        <input
                                            type="radio"
                                            name="exclusividad"
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                                            checked={exclusividad === true}
                                            onChange={() => setExclusividad(true)}
                                        />
                                        Sí
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                                        <input
                                            type="radio"
                                            name="exclusividad"
                                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                                            checked={exclusividad === false}
                                            onChange={() => setExclusividad(false)}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            <p className="text-[#b91c1c] text-sm mb-6 border-b border-slate-200 pb-4">
                                {error}
                            </p>

                            <div className="flex items-center justify-between gap-2">
                                <Button 
                                    variant="destructive" 
                                    className="bg-[#b91c1c] hover:bg-red-800 text-white flex-1"
                                    onClick={onBack}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    className="bg-[#2a86c4] hover:bg-[#20699c] text-white flex-1"
                                    onClick={handleSave}
                                >
                                    Guardar plantilla
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* --- MODAL FOR ATTRIBUTE SELECTION --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-slate-800">Seleccionar Atributos</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Agrupamiento Selection */}
                        <div className="px-4 pt-4 border-b">
                            <label className="block text-sm font-medium text-sky-700 mb-2">Seleccionar agrupamiento</label>
                            <select
                                value={targetCategoryId || ""}
                                onChange={(e) => setTargetCategoryId(e.target.value)}
                                className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-600"
                            >
                                <option value="">-- Selecciona un agrupamiento --</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-2">
                            {MOCK_AVAILABLE_ATTRIBUTES.map(attr => (
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
                                        <p className="text-xs text-slate-400">Tipo ID: {attr.id_tipo} {attr.duplicable ? "• Duplicable" : ""}</p>
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

export default CreateTemplate;