
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}) => {

  if (!isOpen) return null;

  return (
    // Backdrop oscuro
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity"
      onClick={onClose} // Cierra al hacer clic afuera
    >
    
      <div 
        className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
      >
        {/* Header */}
        {title && (
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-slate-800">
              {title}
            </h3>
          </div>
        )}

        {/* Contenido (Cuerpo) */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer (Botones) */}
        {footer && (
          <div className="px-6 pb-6 pt-2 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};