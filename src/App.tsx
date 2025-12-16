import { SidebarInset, SidebarProvider } from './components/ui/shadcn/sidebar';
import axios from 'axios';
import AuthProvider from './components/providers/AuthProvider';
import Routes from './components/routing/Routes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppSidebar } from './components/ui/own/AppSidebar';

const App: React.FC = () => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
  return (
    <>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID}>
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Routes />
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </GoogleOAuthProvider>

    </>
  )
}

export default App
