import React, { type PropsWithChildren, type ReactNode } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SidebarProvider } from '@/components/ui/shadcn/sidebar';
import AuthProvider from './AuthProvider';
import { RoleProvider } from './RoleProvider';

// --- CONFIGURACIÓN GLOBAL ---
// Configurar Axios aquí asegura que se ejecute antes de que se monte cualquier componente.
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// --- UTILITY: Compose Function ---
// Toma una lista de componentes y los anida uno dentro del otro.
// El orden es: El primero de la lista será el "Padre Supremo" (el más externo).
const composeProviders = (...providers: React.ComponentType<PropsWithChildren<unknown>>[]) => {
  return ({ children }: PropsWithChildren) => {
    return providers.reduceRight(
      (acc: ReactNode, Provider) => <Provider>{acc}</Provider>,
      children
    );
  };
};

// --- WRAPPERS ---
// Creamos wrappers simples para proveedores que requieren props obligatorias (como clientId).
// Esto mantiene la lista de composición limpia.

const GoogleAuthProviderWrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID}>
        {children}
    </GoogleOAuthProvider>
);

// --- MAIN EXPORT ---
// 1. Google (Externo)
// 2. Auth (Depende de Google y maneja el token)
// 3. Role (Depende de Auth para saber quién es el usuario)
// 4. Sidebar
export const AppProviders = composeProviders(
  GoogleAuthProviderWrapper,
  AuthProvider,
  RoleProvider,
  SidebarProvider
  // Futuro ej: QueryClientProvider, ThemeProvider, ToastProvider...
);