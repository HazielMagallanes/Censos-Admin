import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
interface MunicipioData{
    id_provincia: number;
    nombre: string;
    descripcion: string;
    modifiedBy: number;
    createdAt: Date;
    updatedAt: Date;
    region: string;
    id_municipio: number;
}
interface EditProps {
  id?: number;
  isOpen: boolean;
  onClose: () => void;
  municipality?: string;
  jurisdiction?: string;
  municipioData?: MunicipioData;
  onSubmit?: (municipioData: MunicipioData) => void;
  
}
export const EditModal: React.FC<EditProps> = ({
  isOpen,
  onClose,
  onSubmit,
  municipality= "Nombre del municipio",
  jurisdiction="Nombre de la jurisdicción",
  municipioData,
  
}) => {
  const [isEditModal, setIsEditModal] = useState<boolean>(false);
  const [nombre, setNombre] = useState(municipality);
  const [region, setRegion] = useState(jurisdiction);
  const [inputNombre, setInputNombre] = useState('');
  const [inputRegion, setInputRegion] = useState('');
  const [editedData, setEditedData] = useState<MunicipioData | undefined>(municipioData);
    
    useEffect(() => {
        setNombre(municipality);
        setRegion(jurisdiction);
        setEditedData(municipioData);
    }, [municipality, jurisdiction, municipioData]);
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={!isEditModal ? "Datos del Municipio" : "Editar datos del Municipio"}
      footer={
        <>
        {!isEditModal ? (
          <button
          onClick={() => setIsEditModal(true)}
          className="rounded-md bg-[#D75720] px-5 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
          Modificar
          </button>
        ) : ( 
          <>
            <button
            onClick={() => onClose()}
            className="rounded-md bg-[#b90000] px-5 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
            Cancelar
            </button>

            <button
            onClick={() => {
              if (!editedData) return;
              const updatedData: MunicipioData = {
                ...editedData,
                nombre: inputNombre || nombre,
                region: inputRegion || region,
              };
              if (onSubmit) onSubmit(updatedData);
              setNombre(inputNombre || nombre);
              setRegion(inputRegion || region);
              setInputNombre('');
              setInputRegion('');
              setEditedData(updatedData);
              setIsEditModal(false);
            }}
            className="rounded-md bg-[#0066b2] px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
            Guardar Cambios
            </button>
          </>
          )}
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
          value={inputNombre}
          onChange={(e) => setInputNombre(e.target.value)}
          placeholder={nombre}
          disabled={!isEditModal}
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
          value={inputRegion}
          onChange={(e) => setInputRegion(e.target.value)}
          placeholder={region}
          disabled={!isEditModal}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          
          />
      </div>
    </form>
    </Dialog>
  );
}