import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

/**
 * Tipo de dato para columnas
 */
export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'custom' | 'select';

/**
 * Definición de una columna
 */
export interface ColumnDef<T = any> {
    key: string;
    label: string;
    type?: ColumnType;
    filterable?: boolean;
    filterPlaceholder?: string;
    render?: (value: any, row: T) => React.ReactNode;
    options?: { value: any; label: string }[]; // Para tipo 'select'
    filterFn?: (row: T, filterValue: string) => boolean;
}

/**
 * Definición de un botón
 */
export interface ButtonDef {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedIds?: any[]) => void;
    className?: string;
    requiresSelection?: boolean;
    leftListOptions?: boolean;
}
export interface DataTableProps<T = any> {
    columns: ColumnDef<T>[];
    data: T[];
    rowKey: string | ((row: T) => any);
    buttons?: ButtonDef[];
    headerText?: React.ReactNode;
    rightContent?: React.ReactNode;
    rightSelectionText?: React.ReactNode;
    selectionMode?: 'single' | 'multiple';
    onRowClick?: (row: T) => void;
    onSelectionChange?: (selectedIds: any[]) => void;
    onFiltersChange?: (filters: Record<string, string>) => void;
    emptyMessage?: string;
    selectionCountMessage?: (count: number) => string;
    tableClassName?: string;
    error?: string | null;
    loading?: boolean;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    confirmButtonLabel?: string;
    confirmButtonClassName?: string;
    cancelButtonLabel?: string;
    breadcrumbs?: { label: string; href?: string }[];
    onSelectionEnd?: () => void;
    onConfirm?: (selectedIds: any[]) => void;
}

/**
 * Componente DataTable mejorado
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
    (
        {
            columns,
            data,
            rowKey,
            buttons = [],
            headerText,
            rightContent,
            rightSelectionText,
            selectionMode = 'multiple',
            onRowClick,
            onSelectionChange,
            onFiltersChange,
            emptyMessage = 'No hay datos disponibles.',
            tableClassName = '',
            error = null,
            loading = false,
            currentPage = 1,
            totalPages = 1,
            onPageChange,
            confirmButtonLabel = 'Confirmar',
            confirmButtonClassName = 'bg-[#cc0000] hover:bg-red-800 text-white',
            cancelButtonLabel = 'Cancelar',
            breadcrumbs = [],
            onSelectionEnd,
            onConfirm,
        },
        ref
    ) => {
        const [selected, setSelected] = useState<any[]>([]);
        const [filters, setFilters] = useState<Record<string, string>>({});
        const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
        const [showConfirmModal, setShowConfirmModal] = useState(false);
        const [pendingIds, setPendingIds] = useState<any[]>([]);
        const [isSelectionMode, setIsSelectionMode] = useState(false);

        // Obtener ID de fila
        const getRowId = (row: any) => {
            return typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
        };

        // Filtrar datos (ahora optimizado con useMemo)
        const filteredData = React.useMemo(() => {
            return data.filter(row => {
                return columns.every(col => {
                    if (!col.filterable || !filters[col.key]) return true;

                    if (col.filterFn) {
                        return col.filterFn(row, filters[col.key]);
                    }

                    const rowValue = col.key.includes('.')
                        ? col.key.split('.').reduce((acc, part) => acc && acc[part], row)
                        : row[col.key];

                    if (col.type === 'select') {
                        return String(rowValue).toLowerCase() === String(filters[col.key]).toLowerCase();
                    }
                    const value = String(rowValue ?? '').toLowerCase();
                    return value.includes(filters[col.key].toLowerCase());
                });
            });
        }, [data, columns, filters]);

        // Manejar cambio de filtro con debounce de 500ms
        const handleFilterChange = useCallback((key: string, value: string) => {
            const newFilters = { ...filters, [key]: value };
            setFilters(newFilters);

            if (debounceTimer) clearTimeout(debounceTimer);

            const timer = setTimeout(() => {
                onFiltersChange?.(newFilters);
            }, 500);

            setDebounceTimer(timer);
        }, [filters, debounceTimer, onFiltersChange]);

        // Limpiar timer al desmontar
        useEffect(() => {
            return () => {
                if (debounceTimer) clearTimeout(debounceTimer);
            };
        }, [debounceTimer]);

        // Manejar selección de fila (sin limpiar al cambiar página)
        const toggleSelect = (id: any) => {
            const newSelected = selected.includes(id)
                ? selected.filter(s => s !== id)
                : selectionMode === 'single' ? [id] : [...selected, id];

            setSelected(newSelected);
            onSelectionChange?.(newSelected);

            // Si deseleccionamos todo y estábamos en modo selección, tal vez queramos salir?
            // El usuario dice que "cuando tocas eliminar se activa", así que esperaremos al botón cancelar para salir.
        };

        // Manejar clic de botón
        const handleButtonClick = (button: ButtonDef) => {
            if (button.requiresSelection) {
                if (selected.length > 0) {
                    setPendingIds(selected);
                    setShowConfirmModal(true);
                } else {
                    // Si no hay nada seleccionado, activamos el modo selección
                    setIsSelectionMode(true);
                }
            } else {
                button.onClick(selected.length > 0 ? selected : undefined);
            }
        };

        const handleCancelSelection = () => {
            setSelected([]);
            setPendingIds([]);
            setShowConfirmModal(false);
            setIsSelectionMode(false);
            onSelectionEnd?.();
        };

        const handleConfirm = () => {
            if (onConfirm) {
                onConfirm(pendingIds);
            } else {
                const button = buttons.find(btn => btn.requiresSelection);
                if (button) button.onClick(pendingIds);
            }
            setShowConfirmModal(false);
            setPendingIds([]);
        };

        // Manejar cambio de página
        const handlePageChange = (newPage: number) => {
            if (newPage >= 1 && newPage <= totalPages) {
                onPageChange?.(newPage);
            }
        };

        // Generador de números de página
        const getPageNumbers = () => {
            const pages = [];
            const { totalPages: last_page, currentPage: page } = { totalPages, currentPage };

            pages.push(1);
            if (page > 3) pages.push('...');
            for (let i = Math.max(2, page - 1); i <= Math.min(last_page - 1, page + 1); i++) pages.push(i);
            if (page < last_page - 2) pages.push('...');
            if (last_page > 1) pages.push(last_page);

            return pages;
        };

        return (
            <div ref={ref} className="w-full">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                        {breadcrumbs.map((crumb: { label: string; href?: string }, idx: number) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <span>&gt;</span>}
                                {crumb.href ? (
                                    <a href={crumb.href} className="text-sky-600 hover:underline cursor-pointer">
                                        {crumb.label}
                                    </a>
                                ) : (
                                    <span className="font-medium text-slate-700">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
                {/* Barra de acciones (select, toggle y botones de confirmación) */}


                {/* Contenedor unificado para botones, tabla y paginación */}
                <div className=" mt-4 border border-[#D0DBE5]">
                    {(Boolean(headerText) || buttons.length > 0 || Boolean(rightContent) || selected.length > 0) && (
                        <div className="w-full border-b border-[#D0DBE5]">
                            <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-between p-2 min-h-[56px] gap-2">
                                {/* Izquierda */}
                                <div className="flex items-center justify-start gap-3 w-full">
                                    {headerText && (
                                        <span className="text-sm font-medium text-slate-700">{headerText}</span>
                                    )}
                                    {buttons.filter(b => b.leftListOptions).length > 0 && (
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const button = buttons.find(b => b.id === e.target.value);
                                                    if (button) handleButtonClick(button);
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-md text-sm font-normal text-slate-700 cursor-pointer border border-slate-300 bg-white min-w-[120px]"
                                        >
                                            <option value="">Atributos</option>
                                            {buttons.filter(b => b.leftListOptions).map(btn => (
                                                <option key={btn.id} value={btn.id}>
                                                    {btn.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Medio */}
                                <div className="flex items-center justify-center gap-2 w-full">
                                    {!isSelectionMode && buttons.filter(b => !b.leftListOptions).map(btn => {
                                        const isDisabled = (data.length === 0 && btn.requiresSelection);
                                        return (
                                            <button
                                                key={btn.id}
                                                disabled={isDisabled}
                                                onClick={() => handleButtonClick(btn)}
                                                className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isDisabled
                                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                                                    : (btn.className ? btn.className : 'bg-[#0067B1] hover:bg-sky-900 text-white')
                                                    }`}
                                            >
                                                {btn.icon && <span className="w-4 h-4 flex items-center">{btn.icon}</span>}
                                                {btn.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Derecha */}
                                <div className="flex justify-end items-center gap-3 w-full">
                                    {isSelectionMode ? (
                                        <>
                                            {selected.length > 0 && rightSelectionText && (
                                                <span className="text-sm border border-slate-300 px-3 py-1.5 rounded-md font-medium text-slate-600 hidden sm:block">
                                                    {rightSelectionText}
                                                </span>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={selected.length === 0}
                                                    onClick={() => {
                                                        setPendingIds(selected);
                                                        setShowConfirmModal(true);
                                                    }}
                                                    className={`flex items-center justify-center gap-1 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selected.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : confirmButtonClassName}`}
                                                >
                                                    {confirmButtonLabel ? confirmButtonLabel : 'Eliminar'}
                                                </button>
                                                <button
                                                    onClick={handleCancelSelection}
                                                    className="flex items-center justify-center gap-1 px-4 py-1.5 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
                                                >
                                                    {cancelButtonLabel ? cancelButtonLabel : 'Cancelar'}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        rightContent && rightContent
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* tabla */}
                    <div className="overflow-x-auto relative">
                        <table className={`w-full table-auto border-collapse ${tableClassName}`}>
                            <thead className="bg-[#f8fafc] text-[#608CB5]">
                                <tr>
                                    {/* Column for # or Selection Circle */}
                                    <th className="p-3 text-center w-12 border-b border-[#D0DBE5]">#</th>

                                    {columns.map(col => (
                                        <th key={`header-${col.key}`} className="px-4 py-2 border-l border-b border-[#D0DBE5]">
                                            {col.filterable ? (
                                                col.type === 'select' ? (
                                                    <select
                                                        value={filters[col.key] || ''}
                                                        onChange={e => handleFilterChange(col.key, e.target.value)}
                                                        className="w-full px-2 py-1 text-sm rounded font-normal bg-slate-200 border-none focus:ring-1 focus:ring-sky-500"
                                                    >
                                                        <option value="">{col.filterPlaceholder || col.label}</option>
                                                        {col.options?.map(option => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : col.type === 'date' ? (
                                                    <input
                                                        type="date"
                                                        value={filters[col.key] || ''}
                                                        onChange={e => handleFilterChange(col.key, e.target.value)}
                                                        className="w-full px-2 py-1 text-sm rounded font-normal bg-slate-200 border-none focus:ring-1 focus:ring-sky-500"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder={col.filterPlaceholder || col.label}
                                                        value={filters[col.key] || ''}
                                                        onChange={e => handleFilterChange(col.key, e.target.value)}
                                                        className="w-full px-2 py-1 text-sm rounded font-normal bg-slate-200 placeholder:text-slate-500 border-none focus:ring-1 focus:ring-sky-500"
                                                    />
                                                )
                                            ) : (
                                                <span className="text-sm font-medium">{col.label}</span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Cuerpo de la tabla */}
                            <tbody className="divide-y relative bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="h-64">
                                            <div className="absolute inset-0 flex justify-center items-center text-slate-500 gap-2 bg-white/50 backdrop-blur-sm z-10">
                                                <Loader2 className="animate-spin" /> Cargando datos...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="p-8 text-center text-red-500 h-64">
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="px-4 py-4 text-center text-sm text-slate-400 h-64"
                                        >
                                            {emptyMessage}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, rowIndex) => {
                                        const rowId = getRowId(row);
                                        const isSelected = selected.includes(rowId);
                                        const isBlocked = (row as any).bloqueado === true;

                                        return (
                                            <tr
                                                key={rowId}
                                                onClick={() => {
                                                    if (isSelectionMode) {
                                                        if (!isBlocked) toggleSelect(rowId);
                                                    } else {
                                                        onRowClick?.(row);
                                                    }
                                                }}
                                                className={`border-b text-sm transition-colors ${isBlocked ? 'bg-slate-50 opacity-60' :
                                                    !isSelectionMode ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
                                                    } ${isSelected ? 'bg-[#D0DBE5] border-[#608CB5] border-b-2 border-t-2' : 'border-[#D0DBE5]'
                                                    }`}
                                            >
                                                {/* Index or Selection Circle Cell */}
                                                <td className={`w-12 p-3 text-center ${isSelected ? 'border-r border-[#608CB5]' : 'text-slate-500 font-mono py-4'}`}>
                                                    {isSelectionMode ? (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isBlocked) toggleSelect(rowId);
                                                            }}
                                                            className={`w-6 h-6 rounded-full mx-auto cursor-pointer flex items-center justify-center border-[#00284B] border-2 ${isSelected ? 'bg-[#00284B]' : ''
                                                                } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            {isSelected && (
                                                                <span className="text-white text-lg">×</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        (currentPage - 1) * 10 + rowIndex + 1
                                                    )}
                                                </td>
                                                {/* Data Columns */}
                                                {columns.map(col => (
                                                    <td key={`${rowId}-${col.key}`} className={`px-5 py-4 text-slate-700 ${isSelected ? 'border-r border-[#608CB5]' : 'border-l border-[#D0DBE5]'}`}>
                                                        {col.render
                                                            ? col.render(row[col.key], row)
                                                            : renderCellValue(row[col.key], col.type, col)}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination footer inside same container */}
                    {!error && (
                        <div className="flex items-center justify-between border-t p-4 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                Mostrando página {currentPage} de {totalPages}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {getPageNumbers().map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={`page-${p}`}
                                            className={`px-3 py-1 rounded text-sm ${p === currentPage ? 'bg-slate-200 font-bold' : 'hover:bg-slate-200'}`}
                                            onClick={() => handlePageChange(p as number)}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}

                                <button
                                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    {/* cerrar el contenedor principal */}
                </div>

                {/* Modal de Confirmación Estilo MainPanel */}
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleConfirm}
                    title="Confirmar eliminación"
                    description={
                        <span>
                            ¿Estás seguro de que deseas eliminar los <strong>{pendingIds.length}</strong> elementos seleccionados? Esta acción no se puede deshacer.
                        </span>
                    }
                    cancelText="Cancelar"
                    confirmText="Eliminar"
                />
            </div>
        );
    }
);

DataTable.displayName = 'DataTable';

/**
 * Renderizador por defecto para valores de celda según el tipo
 */
function renderCellValue(value: any, type?: ColumnType, col?: ColumnDef): React.ReactNode {
    if (value === null || value === undefined) return '—';

    switch (type) {
        case 'boolean':
            return value ? '✓' : '✗';
        case 'date':
            return new Date(value).toLocaleDateString();
        case 'number':
            return Number(value).toLocaleString();
        case 'select':
            const selectedOption = col?.options?.find(opt => opt.value === value);
            return selectedOption ? (
                <span className="inline-block px-2 py-1 bg-[#238DCA] text-white rounded-md text-xs font-medium">
                    {selectedOption.label}
                </span>
            ) : '—';
        default:
            return String(value);
    }
}

export default DataTable;
