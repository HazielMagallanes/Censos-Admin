import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useLayoutEffect,
  type PropsWithChildren,
} from "react";

const AuthContext = createContext<AuthContextProvider>({
  token: null,
  setToken: () => null,
});

interface AuthContextProvider {
  token: string | null;
  setToken: (newToken: string | null) => void;
}

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Inicializamos leyendo de sessionStorage para evitar flash de "no logueado"
  const [token, setToken_] = useState<string | null>(() => sessionStorage.getItem("token"));

  const setToken = (newToken: string | null) => {
    setToken_(newToken);
  };
  
  useLayoutEffect(() => {
    // Configuramos el interceptor UNA sola vez o cuando cambie el token
    const authInterceptor = axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return () => {
      // Limpiamos el interceptor si el componente se desmonta para no acumularlos
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  // Sincronización con SessionStorage
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  }, [token]);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;