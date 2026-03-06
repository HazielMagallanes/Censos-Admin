import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/shadcn/input";

interface ComboBoxOption {
  id_municipio: number;
  nombre: string;
}

interface ComboBoxProps<T extends ComboBoxOption = ComboBoxOption> {
  options: T[];
  value: number; // The id of the selected option
  onChange: (value: number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  getLabel?: (option: T) => string; // Optional custom label getter
  getIdKey?: keyof T; // Which field to use as id (default: id_municipio)
}

const ComboBox: React.FC<ComboBoxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  className = "",
  disabled = false,
  getLabel = (opt) => (opt as ComboBoxOption).nombre,
  getIdKey = "id_municipio",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (opt) => (opt as any)[getIdKey as string] === value
  );

  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: ComboBoxOption) => {
    onChange((option as any)[getIdKey as string]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0); // Changed from "" to 0 for type consistency
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setIsOpen(false);
      }}
    >
      {/* Main button/input */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 bg-slate-200 p-2 rounded text-sm border border-slate-300 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-left flex-1 text-slate-700">
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && value && (
            <X
              className="h-4 w-4 text-slate-500 hover:text-slate-700"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-lg z-50">
          {/* Search input */}
          <div className="p-2 border-b border-slate-200">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={(option as any)[getIdKey as string]}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 transition-colors ${
                    value === (option as any)[getIdKey as string] ? "bg-sky-100 text-sky-700 font-medium" : "text-slate-700"
                  }`}
                >
                  {getLabel(option)}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-slate-400 text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboBox;
