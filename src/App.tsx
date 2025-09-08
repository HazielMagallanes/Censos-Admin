import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/tabs/Login';
const App: React.FC = () => {

  return (
    <>
      <BrowserRouter basename='/'>
        <Routes>
          <Route path='/' element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
