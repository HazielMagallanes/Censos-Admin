import { SidebarProvider } from './components/ui/sidebar';
import axios from 'axios';
import AuthProvider from './components/providers/AuthProvider';
import Routes from './components/routing/Routes';

const App: React.FC = () => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost/api';

  return (
    <>
    <AuthProvider>
      <SidebarProvider>
        <Routes />
      </SidebarProvider>
    </AuthProvider>
    </>
  )
}

export default App
