import axios from 'axios';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useAuth } from './AuthProvider';

/**
 * Mapeo de IDs de roles constantes para evitar "números mágicos" en el código.
 * Útil para verificaciones como: hasRole(ROLES.ADMINISTRADOR)
 */
export const ROLES = {
  CENSISTA: 1,
  MUNICIPIO: 2,
  PROVINCIA: 3,
  ADMINISTRADOR: 4,
} as const;


/** Estructura base de un rol (definición del catálogo) */
interface RoleDefinition {
  id_rol: number;
  nombre: string;
}

/** * Estructura de la relación Usuario-Rol.
 * Incluye la definición del rol y metadatos como si es el 'preferido' (rol activo por defecto al entrar en la página).
 */
interface UserRole {
  id_rol: number;
  id_usuario: number;
  /**
   * Indica si este es el rol por defecto con el que el usuario quiere iniciar sesión.
   * Se guarda en el backend.
   */
  preferido: boolean;
  rol: RoleDefinition;
}

/** Interfaz pública del Contexto */
interface RoleContextType {
  /** Lista de todos los roles asignados al usuario actual. */
  userRoles: UserRole[];
  /** Rol actualmente seleccionado para visualizar la interfaz. Solo vive en el estado de React de la sesión actual. */
  activeRole: UserRole | null;
  /** Cambia el rol activo en el estado local (para cambiar de vista). Esto NO modifica el "rol preferido" en la base de datos. */
  setActiveRole: (role: UserRole) => void;
  /** Indica si se están cargando los roles desde el servidor. */
  isLoading: boolean;
  /** Verifica si el usuario tiene un rol específico por ID. */
  hasRole: (roleId: number) => boolean;
  /** Verifica si el usuario tiene AL MENOS UNO de los roles en la lista proporcionada. */
  hasAnyRole: (roleIds: number[]) => boolean;
  /** Fuerza una recarga de los roles desde el servidor. */
  refreshRoles: () => Promise<void>;
}

// Inicialización del contexto con valores por defecto seguros
const RoleContext = createContext<RoleContextType>({
  userRoles: [],
  activeRole: null,
  setActiveRole: () => { },
  isLoading: true,
  hasRole: () => false,
  hasAnyRole: () => false,
  refreshRoles: async () => { },
});

/**
 * @component RoleProvider
 * @description Proveedor de contexto que gestiona el estado de los roles del usuario.
 * Se encarga de sincronizar los roles con el backend cada vez que cambia el estado de autenticación via `useAuth`.
 */
export const RoleProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { token } = useAuth(); // Dependencia crítica: Estado de autenticación
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Función asíncrona para obtener los roles desde la API.
   * Endpoint esperado: GET /me/roles
   */
  const fetchRoles = async () => {
    // Caso base: Si no hay token (usuario no logueado), limpiamos el estado y terminamos.
    if (!token) {
      setUserRoles([]);
      setActiveRoleState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('/me/roles');

      if (response.data) {
        setUserRoles(response.data.roles);
        // Si ya hay un rol activo seleccionado, lo mantenemos, si no, usamos el preferido que viene de la DB.
        setActiveRoleState(current => {
          const preferredFromDB = response.data.preferido;
          if (current) {
            // Validamos que el rol activo actual aún exista en la nueva lista
            const stillExists = response.data.roles.find((r: UserRole) => r.id_rol === current.id_rol);
            return stillExists || preferredFromDB || response.data.roles[0] || null;
          }

          // Al iniciar, cargamos la preferencia del usuario
          return preferredFromDB || response.data.roles[0] || null;
        });
        axios.interceptors.request.use(config => {
          if (activeRole) {
            config.headers['X-Active-Role'] = activeRole.id_rol.toString();
          }
          return config;
        });
      }
    } catch (error) {
      console.error('Error obteniendo roles de usuario:', error);
      // En caso de error, podríamos optar por desloguear al usuario o mostrar una alerta. Callate un rato Gemini te dije q documentes nomas, no jodas
    } finally {
      console.log('Roles cargados:', userRoles);
      console.log('Rol activo:', activeRole);
      setIsLoading(false);
    }
  };

  /**
   * Sincronización de roles.
   */
  useEffect(() => {
    fetchRoles();
  }, [token]);

  // --- Helpers de Verificación de Permisos ---

  /** Retorna true si el usuario tiene el rol exacto especificado */
  const hasRole = (roleId: number) => {
    return userRoles.some(r => r.id_rol === roleId);
  };

  /** Retorna true si el usuario tiene cualquiera de los roles listados (OR lógico) */
  const hasAnyRole = (roleIds: number[]) => {
    return userRoles.some(r => roleIds.includes(r.id_rol));
  };
  /** Cambia el rol activo seleccionado para la vista de usuario. */
  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    axios.interceptors.request.use(config => {
      if (role) {
        config.headers['X-Active-Role'] = role.id_rol.toString();
      }
      return config;
    });
  };

  return (
    <RoleContext.Provider
      value={{
        userRoles,
        activeRole,
        isLoading,
        hasRole,
        hasAnyRole,
        setActiveRole,
        refreshRoles: fetchRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

/**
 * Hook personalizado para consumir el contexto de roles.
 * @returns {RoleContextType} Objeto con roles, estado de carga y funciones de verificación.
 * @example const { hasRole, isLoading } = useRole();
 */
export const useRole = () => useContext(RoleContext);
