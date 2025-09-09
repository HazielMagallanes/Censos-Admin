import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPanel from './components/tabs/MainPanel';
import { Login } from './components/tabs/Login';
const App: React.FC = () => {

  return (
    <>
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='/' element={<MainPanel/>}/>
          <Route path='/login' element={<Login />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
