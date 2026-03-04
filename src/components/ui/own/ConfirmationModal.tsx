import type { ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode; // ReactNode permite pasar JSX (como <span> o <strong>)
  cancelText?: string;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = 'Cancelar',
  confirmText = 'Continuar',
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop (Fondo oscuro)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded shadow-lg w-full max-w-md">
        
        {/* Header: Título */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-[#0B2C52] text-xl font-medium">
            {title}
          </h2>
        </div>

        {/* Body: Descripción */}
        <div className="px-6 py-5">
          <div className="text-[#1C3B5E] text-base leading-relaxed">
            {description}
          </div>
        </div>

        {/* Footer: Botones */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#B70000] text-white font-medium rounded hover:bg-red-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#0060A9] text-white font-medium rounded hover:bg-blue-800 transition-colors"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;