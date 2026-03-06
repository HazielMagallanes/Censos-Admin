import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, SquarePlus, File } from "lucide-react";
import { Dialog } from "../ui/own/Dialog";
import { EditModal } from "../ui/own/EditModal";
import DataTable, { type  ColumnDef } from "../ui/own/DataTable";

// --- INTERFACES ---
interface Municipio {
    id_provincia: number;
    nombre: string;
    descripcion: string;
    modifiedBy: number;
    createdAt: Date;
    updatedAt: Date;
    region: string;
    id_municipio: number;
}

const MuniManagement: React.FC = () => {
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal state
    const [adderModal, setAdderModal] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [selected, setSelected] = useState<Municipio | undefined>();

    // Fetch
    useEffect(() => {
        const fetchMunicipios = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/municipalities`); 
                if (response.data) {
                    // Passed all data directly to DataTable so it handles filtering
                    setMunicipios(response.data.municipalities);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar los municipios.");
            } finally {
                setLoading(false);
            }
        }
        fetchMunicipios();
    }, []);

    const handleMuniChange = async (municipioData: Municipio) => {
        try{
            const response = await axios.put(`/municipalities/${municipioData.id_municipio}`, {
                id_provincia: municipioData.id_provincia,
                nombre: municipioData.nombre,
                region: municipioData.region,
                descripcion: municipioData.descripcion,
            });
            if (response.data) {
                console.log("Municipio actualizado:", response.data);
                // Update local list
                setMunicipios(prev => prev.map(m => m.id_municipio === municipioData.id_municipio ? { ...m, ...municipioData } : m));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMuniAdd = async (nombre: string, region: string) => {
        try{
            const response = await axios.post(`/municipalities`, {
                nombre: nombre, 
                region: region
            });
            if (response.data) {
                console.log("Municipio agregado:", response.data);
                setMunicipios(prev => [...prev, response.data.municipio]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const columns: ColumnDef<Municipio>[] = [
        {
            key: 'nombre',
            label: 'Municipio',
            type: 'string',
            filterable: true,
            filterPlaceholder: 'Municipio',
        },
        {
            key: 'region',
            label: 'Jurisdicción',
            type: 'string',
            filterable: true,
            filterPlaceholder: 'Jurisdicción',
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col w-full h-full bg-slate-50">
                <main className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
                        <Loader2 className="animate-spin" /> Cargando datos...
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full h-full bg-slate-50">
                <main className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-center items-center h-64 text-red-500">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-slate-50">
            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-6 overflow-auto">
                {/* Breadcrumbs */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-sky-600">Territorio</span>
                    <span>&gt;</span>
                    <span className="font-medium underline">Listado de municipios</span>
                </div>

                {/* Table Structure via DataTable */}
                <div className="bg-white rounded-md shadow-sm">
                    <DataTable
                        columns={columns}
                        data={municipios}
                        rowKey="id_municipio"
                        buttons={[
                            {
                                id: 'registrar',
                                label: 'Registrar',
                                icon: <SquarePlus className="h-4 w-4" />,
                                onClick: () => setAdderModal(true),
                                className: 'bg-sky-700 text-white hover:bg-sky-800',
                                leftListOptions: false
                            },
                            {
                                id: 'importar',
                                label: 'Importar desde un archivo',
                                icon: <File className="h-4 w-4" />,
                                onClick: () => {},
                                className: 'bg-sky-700 text-white hover:bg-sky-800',
                                leftListOptions: false
                            }
                        ]}
                        emptyMessage="No hay municipios disponibles."
                        onRowClick={(row) => {
                            setSelected(row);
                            setEditModal(true);
                        }}
                    />
                </div>

                <Dialog
                    isOpen={adderModal}
                    onClose={() => setAdderModal(false)}
                    title="Datos del Municipio"
                    footer={
                        <>
                            <button
                                onClick={() => setAdderModal(false)}
                                className="rounded-md bg-[#b90000] px-5 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    console.log("Guardando...");
                                    const nameInput = document.getElementById('new-muni-name') as HTMLInputElement;
                                    const jurisInput = document.getElementById('new-muni-jurisdiction') as HTMLInputElement;
                                    if (nameInput && jurisInput) {
                                        handleMuniAdd(nameInput.value, jurisInput.value);
                                    }
                                    setAdderModal(false);
                                }}
                                className="rounded-md bg-[#0066b2] px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Guardar
                            </button>
                        </>
                    }
                >
                    <form className="space-y-4 flex flex-col mt-2">
                        {/* Campo Nombre Municipio */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700">
                                Nombre Municipio
                            </label>
                            <input
                                id="new-muni-name"
                                type="text"
                                placeholder="Ingrese su texto aquí"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Campo Jurisdicción */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700">
                                Jurisdicción
                            </label>
                            <input
                                id="new-muni-jurisdiction"
                                type="text"
                                placeholder="Ingrese su texto aquí"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </form>
                </Dialog>

                {selected && (
                    <EditModal 
                        id={selected.id_municipio}
                        municipioData={selected}
                        onSubmit={handleMuniChange}
                        isOpen={editModal} 
                        onClose={() => {
                            setEditModal(false);
                            setSelected(undefined);
                        }} 
                        municipality={selected.nombre} 
                        jurisdiction={selected.region}
                    />
                )}
            </main>
        </div>
    )
}

export default MuniManagement;