import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tickets from './pages/Tickets'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import { Toaster } from 'sonner'

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  )
}
