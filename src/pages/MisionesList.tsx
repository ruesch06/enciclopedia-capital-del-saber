import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Award, Search, CheckCircle2, ChevronRight, BookOpen, Star } from 'lucide-react'

interface Actividad {
  id: string
  mision_numero: number | null
  tomo_id: string | null
  titulo: string
  situacion_problematica: string
  tipo_actividad: string
  dificultad: string
}

export default function MisionesList() {
  const [misiones, setMisiones] = useState<Actividad[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'concurso' | 'tomos'>('concurso')
  const [completedMissions, setCompletedMissions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('actividades')
          .select('*')
          .order('mision_numero', { ascending: true })

        if (error) throw error
        setMisiones(data || [])

        // Cargar medallas ganadas
        const saved = localStorage.getItem('completed_missions')
        if (saved) {
          setCompletedMissions(JSON.parse(saved))
        }
      } catch (err) {
        console.error('Error cargando misiones:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Separar en las dos categorías
  const misionesConcurso = misiones.filter(m => m.tomo_id === null)
  const misionesTomos = misiones.filter(m => m.tomo_id !== null)

  const activeList = activeTab === 'concurso' ? misionesConcurso : misionesTomos

  const filteredMisiones = activeList.filter(m =>
    m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.situacion_problematica.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMedalIcon = (medal: string) => {
    if (medal === 'oro') return <span title="Medalla de Oro" className="text-xl">🥇</span>
    if (medal === 'plata') return <span title="Medalla de Plata" className="text-xl">🥈</span>
    if (medal === 'bronce') return <span title="Medalla de Bronce" className="text-xl">🥉</span>
    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 font-medium">Cargando desafíos oficiales...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            Área de Desafíos
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white m-0">
            Misiones de Entrenamiento
          </h1>
          <p className="text-gray-400 text-sm">
            Supera las misiones oficiales del certamen y ponte a prueba con la autoevaluación de los tomos.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar misión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Selectores de Categorías / Pestañas */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setActiveTab('concurso')
            setSearchTerm('')
          }}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold font-display text-sm border transition-all ${
            activeTab === 'concurso'
              ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10 scale-105'
              : 'bg-black/40 text-gray-400 border-white/5 hover:text-white hover:bg-black/60'
          }`}
        >
          <Award className="h-5 w-5" />
          <span>Certamen Oficial (44 Misiones)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('tomos')
            setSearchTerm('')
          }}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold font-display text-sm border transition-all ${
            activeTab === 'tomos'
              ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10 scale-105'
              : 'bg-black/40 text-gray-400 border-white/5 hover:text-white hover:bg-black/60'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span>Autoevaluación de Tomos</span>
        </button>
      </div>

      {/* Grid de Tarjetas */}
      {filteredMisiones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMisiones.map((m) => {
            const medal = completedMissions[m.id]
            const isCompleted = !!medal

            return (
              <div
                key={m.id}
                className={`flex flex-col justify-between backdrop-blur-sm bg-black/40 border rounded-2xl p-6 transition-all shadow-md group ${
                  isCompleted ? 'border-emerald-500/30' : 'border-white/10 hover:border-amber-500/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-xs font-bold font-display">
                      {m.mision_numero ? `Misión ${m.mision_numero}` : 'Tomo General'}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="flex items-center gap-1">
                          {getMedalIcon(medal)}
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                      <span className="text-xs text-gray-500 font-semibold capitalize bg-gray-800/40 px-2 py-0.5 rounded">
                        {m.dificultad}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {m.titulo.replace(/Misión\s+\d+:\s*/i, '')}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {m.situacion_problematica}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    to={`/misiones/${m.id}`}
                    className={`flex items-center justify-center gap-2 w-full font-semibold py-2.5 rounded-xl transition-all hover:shadow-lg ${
                      isCompleted
                        ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-transparent'
                        : 'bg-gray-800 hover:bg-amber-500 hover:text-black text-white'
                    }`}
                  >
                    <span>{isCompleted ? 'Volver a Jugar' : 'Iniciar Desafío'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 space-y-2">
          <Award className="h-10 w-10 text-gray-600 mx-auto" />
          <p>No se encontraron misiones en esta pestaña.</p>
        </div>
      )}
    </div>
  )
}
