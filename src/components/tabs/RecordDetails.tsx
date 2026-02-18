import React from 'react';
import { Button } from "@/components/ui/shadcn/button";

export const RecordDetails: React.FC = () => {
  // Mock data to iterate over the categories and attributes easily
  const formSections = [
    {
      categoryName: "Categoría",
      attributes: ["Atributo", "Atributo", "Atributo"]
    },
    {
      categoryName: "Categoría",
      attributes: ["Atributo", "Atributo"]
    },
    {
      categoryName: "Atributo", // Single un-nested attribute as seen at the bottom
      attributes: []
    }
  ];

  return (
    <div className="flex flex-col w-full h-full bg-white p-6 overflow-auto">
      
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-sm text-sky-500">
        <span className="cursor-pointer hover:underline">Mi cuenta</span>
        <span className="text-slate-400">&gt;</span>
        <span className="cursor-pointer hover:underline">Listado de registros</span>
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
            Nombre del formulario
          </div>
          
          <div className="p-4 border-b border-slate-200 text-slate-700">
            ID: RC25
          </div>
          
          <div className="p-4 text-slate-700">
            Datos del formulario:
          </div>
          
          {/* Dynamic List of Categories & Attributes */}
          <div className="px-4 pb-4 flex flex-col gap-3">
            {formSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="flex flex-col gap-2">
                {/* Category Box */}
                <div className="border border-slate-200 rounded-md p-2.5 text-sky-600/80 bg-white w-full text-sm">
                  {section.categoryName}
                </div>
                
                {/* Indented Attributes Box */}
                {section.attributes.length > 0 && (
                  <div className="flex flex-col gap-2 pl-2">
                    {section.attributes.map((attr, attrIdx) => (
                      <div key={attrIdx} className="flex items-center gap-3">
                        {/* Little Gray Rectangle Indicator */}
                        <div className="w-3.5 h-6 bg-slate-200 rounded-[3px]"></div>
                        {/* Attribute Content Box */}
                        <div className="border border-slate-200 rounded-md p-2.5 text-sky-600/80 flex-1 bg-white text-sm">
                          {attr}
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
            Creada el: dd / mm / aaaa
          </div>
          
          <div className="p-4 border-b border-slate-200 text-sm text-slate-700 flex flex-col gap-4">
            <p>Creada por el usuario:</p>
            <div className="flex flex-col gap-1">
              <p className="text-slate-700">Nombre y apellidos del usuario</p>
              <p className="text-sky-700 font-medium">usuario.estandar@censista.com</p>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-200 text-sm text-slate-700 flex flex-col gap-4">
            <p>Censo adaptado utilizado:</p>
            <div className="flex gap-2 items-center">
              <span className="text-slate-700">ID: C12</span>
              <span className="text-sky-800 font-medium cursor-pointer hover:underline">
                Visualizar formulario utilizado
              </span>
            </div>
          </div>
          
          {/* Warning Message Zone */}
          <div className="p-4 text-sm text-[#b20000] flex-1">
            Zona de alertas e información circunstancial.
          </div>
          
          {/* Bottom Action Area */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <Button 
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