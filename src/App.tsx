import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Tickets from './pages/Tickets'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
