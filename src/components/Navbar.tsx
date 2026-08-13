import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Award, Search, Users, Home, GraduationCap, Trophy, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [score, setScore] = useState(0)

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

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/tomos', label: 'Los Tomos', icon: BookOpen },
    { path: '/cronologia', label: 'Cronología', icon: Calendar },
    { path: '/misiones', label: 'Misiones', icon: Award },
    { path: '/personajes', label: 'Personajes', icon: Users },
    { path: '/glosario', label: 'Glosario', icon: Search },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/85 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
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

        {/* Navigation & Score */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="flex flex-wrap justify-center items-center gap-2">
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

          {/* Puntaje del Estudiante */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-amber-400 font-extrabold text-sm shadow-md animate-pulse">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>{score} PTS</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
