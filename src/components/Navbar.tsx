import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Award, Search, Users, Home, GraduationCap, Trophy, Calendar, MapPin, RefreshCw, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [score, setScore] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const updateScore = () => {
      const savedScore = localStorage.getItem('user_score')
      if (savedScore) {
        setScore(parseInt(savedScore))
      }
    }

    updateScore()
    window.addEventListener('score-updated', updateScore)
    const interval = setInterval(updateScore, 1000)

    return () => {
      window.removeEventListener('score-updated', updateScore)
      clearInterval(interval)
    }
  }, [])

  const handleResetProgress = () => {
    if (window.confirm('¿Estás seguro de que querés reiniciar todo tu progreso (puntos, medallas y desafíos de campo) a cero?')) {
      localStorage.removeItem('user_score')
      localStorage.removeItem('completed_missions')
      localStorage.removeItem('completed_field_challenges')
      // Disparar evento
      window.dispatchEvent(new Event('score-updated'))
      // Recargar página
      window.location.reload()
    }
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/tomos', label: 'Los Tomos', icon: BookOpen },
    { path: '/cronologia', label: 'Cronología', icon: Calendar },
    { path: '/misiones', label: 'Misiones', icon: Award },
    { path: '/investigaciones', label: 'Desafíos de Campo', icon: MapPin },
    { path: '/personajes', label: 'Personajes', icon: Users },
    { path: '/glosario', label: 'Glosario', icon: Search },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/85 border-b border-gray-800 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        
        {/* Barra Principal (Logo + Controles Móviles) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-lg text-white shadow-lg group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-white tracking-wide m-0 leading-none">
                ENCICLOPEDIA
              </h1>
              <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
                Capital del Saber
              </span>
            </div>
          </Link>

          {/* Controles de la derecha en Celular */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Puntaje en celular */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 font-extrabold text-xs shadow-md">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{score} PTS</span>
            </div>
            
            {/* Botón menú hamburguesa */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
              aria-label="Alternar menú"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú de Navegación en Escritorio (oculto en celular) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Puntaje y Reset en Escritorio */}
          <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-amber-400 font-extrabold text-sm shadow-md animate-pulse">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>{score} PTS</span>
            </div>
            
            <button
              onClick={handleResetProgress}
              title="Reiniciar Progreso a 0"
              className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-full transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desplegable de menú en celular cuando isOpen es true */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-2 pt-2 pb-4 border-t border-gray-800/40">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Reset de puntaje en celular */}
            <div className="pt-3 mt-1 border-t border-gray-800/40 px-4 flex justify-between items-center text-xs text-gray-500">
              <span>Reiniciar mis puntos:</span>
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleResetProgress()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  )
}
