import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import TomosList from './pages/TomosList'
import TomoView from './pages/TomoView'
import MisionesList from './pages/MisionesList'
import MisionPlay from './pages/MisionPlay'
import PersonajesList from './pages/PersonajesList'
import GlosarioView from './pages/GlosarioView'
import Cronologia from './pages/Cronologia'
import InvestigacionesList from './pages/InvestigacionesList'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-transparent flex flex-col text-gray-100 selection:bg-amber-500/30 selection:text-amber-300">
        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tomos" element={<TomosList />} />
            <Route path="/tomos/:id" element={<TomoView />} />
            <Route path="/cronologia" element={<Cronologia />} />
            <Route path="/misiones" element={<MisionesList />} />
            <Route path="/misiones/:id" element={<MisionPlay />} />
            <Route path="/personajes" element={<PersonajesList />} />
            <Route path="/glosario" element={<GlosarioView />} />
            <Route path="/investigaciones" element={<InvestigacionesList />} />
            <Route path="*" element={
              <div className="max-w-md mx-auto text-center py-16 space-y-4">
                <h2 className="text-2xl font-bold text-white">Página no encontrada</h2>
                <Link to="/" className="inline-block bg-amber-500 text-white font-semibold px-6 py-2 rounded-full">
                  Volver al Inicio
                </Link>
              </div>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-900 bg-gray-950/40 py-8 text-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Córdoba Capital del Saber. Todos los derechos reservados.</p>
          <p className="mt-1">Desarrollado para el certamen educativo provincial de Córdoba.</p>
        </footer>
      </div>
    </Router>
  )
}

// Pequeño helper para el enrutamiento 404
import { Link } from 'react-router-dom'
