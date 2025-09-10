import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPanel from './components/tabs/MainPanel';
import { Login } from './components/tabs/Login';
import { Register } from './components/tabs/Register';
import { SidebarProvider } from './components/ui/sidebar';
import axios from 'axios';
const App: React.FC = () => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://172.19.214.85:3000/auth';
  
  return (
    <>
    <SidebarProvider>
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='/' element={<MainPanel/>}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/sign-up' element={<Register />}/>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
    </>
  )
}

export default App
