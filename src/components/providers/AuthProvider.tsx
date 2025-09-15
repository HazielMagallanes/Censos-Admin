import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

const AuthContext = createContext<AuthContextProvider>({token: null, setToken: () => null});

interface AuthContextProvider {
    token: string | null;
    setToken: (newToken: string) => void; 
}

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(sessionStorage.getItem("token"));

  // Function to set the authentication token
  const setToken = (newToken: string) => {
    setToken_(newToken);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      sessionStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      sessionStorage.removeItem('token')
    }
  }, [token]);

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
