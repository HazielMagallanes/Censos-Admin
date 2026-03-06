# DataTable Component - Guía de Uso

## Descripción General
DataTable es un componente reutilizable para mostrar datos en formato tabular con funcionalidades completas: filtros, paginación, selección de filas y más.

## Props Principales

### Requeridos
- **columns**: Array de `ColumnDef<T>` - Define las columnas de la tabla
- **data**: Array de datos a mostrar
- **rowKey**: Clave única por fila (string o función)

### Opcionales
- **buttons**: Array de `ButtonDef` - Botones personalizados en la parte superior
- **showSelectColumn**: boolean - Mostrar columna de selección (default: false)
- **onSelectionChange**: callback cuando se seleccionan filas
- **onFiltersChange**: callback cuando los filtros cambian (debounced 500ms)
- **onPageChange**: callback cuando cambia la página
- **currentPage**: número de página actual (default: 1)
- **totalPages**: número total de páginas (default: 1)
- **breadcrumbs**: Array de breadcrumbs `{ label: string, href?: string }`
- **title**: Título de la tabla
- **emptyMessage**: Mensaje cuando no hay datos
- **error**: Mensaje de error a mostrar
- **selectionCountMessage**: Función personalizada para el mensaje de selección
- **confirmButtonLabel**: texto para el botón de confirmar en la barra de acciones (por defecto "Confirmar")
- **cancelButtonLabel**: texto para el botón de cancelar en la barra de acciones (por defecto "Cancelar")

> **Nota de layout:** el componente agrupa botones superiores, tabla y paginación dentro de un único contenedor con borde recto y ancho uniforme. Los controles de acción se organizan en tres columnas (`select`, botón central y confirm/cancel), manteniéndose centrados aunque falten elementos en la izquierda o derecha.

## Tipos de Columnas

### String
```tsx
{
  key: 'nombre',
  label: 'Nombre',
  type: 'string',
  filterable: true,
  filterPlaceholder: 'Buscar por nombre...'
}
```

### Date (con calendario)
```tsx
{
  key: 'fechaCreacion',
  label: 'Fecha',
  type: 'date',
  filterable: true
}
```

### Select (dropdown)
```tsx
{
  key: 'estado',
  label: 'Estado',
  type: 'select',
  filterable: true,
  options: [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ]
}
```

### Boolean
```tsx
{
  key: 'activo',
  label: 'Activo',
  type: 'boolean'
}
```

### Custom (render personalizado)
```tsx
{
  key: 'acciones',
  label: 'Acciones',
  type: 'custom',
  render: (value, row) => (
    <button onClick={() => handleEdit(row)}>Editar</button>
  )
}
```

## Botones Personalizados

```tsx
const buttons: ButtonDef[] = [
  {
    id: 'crear',
    label: 'Crear Nuevo',
    icon: <Plus size={16} />,
    onClick: () => console.log('Crear'),
    requiresSelection: false
  },
  {
    id: 'eliminar',
    label: 'Eliminar',
    icon: <Trash2 size={16} />,
    onClick: (selectedIds) => console.log('Eliminar:', selectedIds),
    requiresSelection: true // Solo se habilita cuando hay selección
  }
];
```

## Ejemplo Completo

```tsx
import DataTable from '@/components/ui/own/DataTable';
import type { ColumnDef, ButtonDef } from '@/components/ui/own/DataTable';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  estado: string;
  fechaCreacion: string;
}

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Columnas
  const columns: ColumnDef<Usuario>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'string',
      filterable: true,
      filterPlaceholder: 'Buscar por nombre...'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      filterable: true
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      filterable: true,
      options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' }
      ]
    },
    {
      key: 'fechaCreacion',
      label: 'Creado',
      type: 'date',
      filterable: true
    }
  ];

  // Botones
  const buttons: ButtonDef[] = [
    {
      id: 'crear',
      label: 'Crear Usuario',
      onClick: () => navigate('/usuarios/crear'),
      requiresSelection: false
    },
    {
      id: 'eliminar',
      label: 'Eliminar',
      onClick: (ids) => handleDelete(ids),
      requiresSelection: true
    }
  ];

  // Manejar cambio de filtros
  const handleFiltersChange = (filters: Record<string, string>) => {
    // Llamar a la API con los filtros
    fetchUsuarios({ ...filters, page: 1 });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsuarios({ page: newPage });
  };

  return (
    <DataTable
      columns={columns}
      data={usuarios}
      rowKey="id"
      buttons={buttons}
      showSelectColumn={true}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      onFiltersChange={handleFiltersChange}
      onRowClick={(row) => navigate(`/usuarios/${row.id}`)}
      breadcrumbs={[
        { label: 'Administración', href: '/admin' },
        { label: 'Usuarios' }
      ]}
      title="Gestión de Usuarios"
      emptyMessage="No se encontraron usuarios"
      error={error}
    />
  );
}
```

## Características Clave

- ✅ Filtros debounced (500ms)
- ✅ Paginación completa con navegación
- ✅ Selección múltiple opcional
- ✅ Columnas personalizables (texto, fecha, select, boolean, custom)
- ✅ Botones dinámicos con control de estado
- ✅ Mensajes de error y selección
- ✅ Breadcrumbs y título opcionales
- ✅ Soporte para tipos de datos diferentes
- ✅ Responsive y styled con Tailwind

## Filtrado Automático

Los filtros se actualizan automáticamente con debounce de 500ms:
- **String**: Búsqueda por inclusión (case-insensitive)
- **Date**: Búsqueda exacta por fecha
- **Select**: Búsqueda exacta por valor

## Selección Persistente

Las filas seleccionadas se mantienen al cambiar de página.
