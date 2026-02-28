import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2,ChevronLeft, ChevronRight, SquarePlus, File } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Dialog } from "../ui/own/Dialog";
import { EditModal } from "../ui/own/EditModal";

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


interface MetaData {
    total: number;
    page: number;
    last_page: number;
}

const MuniManagement: React.FC = () => {
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Paginación
    const [meta, setMeta] = useState<MetaData>({ total: 1, page: 1, last_page: 1 });
    const [page, setPage] = useState<number>(1);
    const LIMIT = 10;
    // Filtering
    const [municipalityFilter, setMunicipalityFilter] = useState<string>('');
    const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('');
    // Modal state
    const [adderModal, setAdderModal] = useState<boolean>(false);
    const [editModal, setEditModal] = useState<boolean>(false);
    const [selected, setSelected] = useState<number | undefined>();
    // Fetch
    useEffect(() => {
        const fetchMunicipios = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/municipalities`); 
                if (response.data) {
                    console.log("Municipios API Response:", response.data);
                    const filteredMunicipios = response.data.municipalities.slice(0, LIMIT);
                    setMunicipios(filteredMunicipios);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar los municipios.");
            } finally {
                setLoading(false);
            }
        }
        fetchMunicipios();
    }, [page, municipalityFilter, jurisdictionFilter]);

    const handleMuniChange = async (municipioData: Municipio) => {
        try{
            const response = await axios.put(`/municipalities/${municipioData.id_municipio}`, {
                id_provincia: municipioData.id_provincia,
                nombre: municipioData.nombre,
                region: municipioData.region,
                descripcion: municipioData.descripcion,
            }
            );
            if (response.data) {
                console.log("Municipio actualizado:", response.data);
            }

        }catch (err) {
            console.error(err);
        }
    };

    const handleMuniAdd = async (nombre: string, region: string) => {
        try{
            const response = await axios.post(`/municipalities`, 
                {
                    nombre: nombre, 
                    region: region

                });
            if (response.data) {
                console.log("Municipio agregado:", response.data);
            }

        }catch (err) {
            console.error(err);
        }
    };
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.last_page) setPage(newPage);
    };

    // Generador de números de página 
    const getPageNumbers = () => {
        const pages = [];
        const { last_page, page } = meta;
        
        // Siempre mostrar la primera página
        pages.push(1);
        if (page > 3) pages.push('...');
        // Rango alrededor de la página actual
        for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) pages.push(i);
        if (page < last_page - 2) pages.push('...');
        // Siempre mostrar la ultima
        if (last_page > 1) pages.push(last_page);

        return pages;
    };


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

                {/* Toolbar / Actions */}
                <div className="mb-4 flex flex-wrap items-center justify-center gap-4 rounded-md bg-white p-2 shadow-sm border">

                    <div className="flex gap-2">
                        <Button onClick={()=> setAdderModal(true)} className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <SquarePlus className="h-4 w-4" /> Registrar
                        </Button>
                        <Button className="bg-sky-700 text-white hover:bg-sky-800 gap-2">
                            <File className="h-4 w-4" /> Importar desde un archivo
                        </Button>
                    </div>
                </div>

                {/* Table Structure */}
                <div className="rounded-md border bg-white shadow-sm">
                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-slate-500 gap-2">
                            <Loader2 className="animate-spin" /> Cargando datos...
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-64 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600">
                                    <tr>
                                        <th className="p-3 font-medium text-center">#</th>

                                        <th className="p-3 font-medium">
                                            <input className="bg-slate-200 p-1 rounded text-left text-slate-500 flex justify-between px-2 items-center w-full" placeholder="Municipio" onChange={(e) => setMunicipalityFilter(e.target.value)}/>
                                        </th>
                                        <th className="p-3 font-medium">
                                            <input className="bg-slate-200 p-1 rounded text-left text-slate-500 flex justify-between px-2 items-center w-full" placeholder="Jurisdicción" onChange={(e) => setJurisdictionFilter(e.target.value)} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {municipios.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                No hay municipios disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        municipios.map((row, index) => (
                                            <tr key={row.id_municipio} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                                                setSelected(index);
                                                setEditModal(true);
                                            }}>
                                                <td className="p-4 text-center text-slate-500 font-mono">
                                                    {index + 1}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {row.nombre}
                                                </td>
                                                <td className="p-4">
                                                    {row.region}   
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
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
                            type="text"
                            placeholder="Ingrese su texto aquí"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        </form>
                    </Dialog>
                    
                    {/* --- PAGINATION FOOTER --- */}
                    {!loading && municipios.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando pagina {meta.page} de {meta.last_page} (Total: {meta.total} municipios)
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {getPageNumbers().map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                                    ) : (
                                        <Button
                                            key={`page-${p}`}
                                            variant={p === page ? "secondary" : "ghost"}
                                            size="sm"
                                            className={p === page ? "bg-slate-200 font-bold" : ""}
                                            onClick={() => handlePageChange(p as number)}
                                        >
                                            {p}
                                        </Button>
                                    )
                                ))}

                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === meta.last_page}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {selected !== undefined && (
                    <EditModal 
                        id={municipios[selected].id_municipio}
                        municipioData={municipios[selected]}
                        onSubmit={handleMuniChange}
                        isOpen={editModal} 
                        onClose={() => {
                            setEditModal(false);
                            setSelected(undefined);
                        }} 
                        municipality={municipios[selected].nombre} 
                        jurisdiction={municipios[selected].region}
                    />
                )}
            </main>
        </div>
    )
}
export default MuniManagement;