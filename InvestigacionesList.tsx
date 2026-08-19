import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { MapPin, CheckCircle2, ChevronRight, BookOpen, Trophy } from 'lucide-react'

interface Actividad {
  id: string
  tomo_id: string
  titulo: string
  situacion_problematica: string
  tipo_actividad: string
  dificultad: string
}

interface Tomo {
  id: string
  numero: number
  titulo: string
}

export default function InvestigacionesList() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [tomos, setTomos] = useState<Tomo[]>([])
  const [activeTomoNum, setActiveTomoNum] = useState<number>(1)
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar tomos
        const { data: tData, error: tError } = await supabase
          .from('tomos')
          .select('id, numero, titulo')
          .order('numero', { ascending: true })

        if (tError) throw tError
        setTomos(tData || [])

        // Cargar actividades que empiezan con "Tomo" (que son las investigaciones de campo)
        const { data: aData, error: aError } = await supabase
          .from('actividades')
          .select('*')
          .eq('tipo_actividad', 'quiz')
          .eq('dificultad', 'medio')
          .not('tomo_id', 'is', null)

        if (aError) throw aError
        
        // Filtrar del lado del cliente las que son de campo (tienen formato Tomo X · Cap)
        const campoActs = (aData || []).filter(act => 
          act.titulo.startsWith('Tomo') && act.titulo.includes('Cap.')
        )

        // Ordenar por capítulo
        campoActs.sort((a, b) => {
          const aMatch = a.titulo.match(/Cap\.\s*(\d+)/i)
          const bMatch = b.titulo.match(/Cap\.\s*(\d+)/i)
          const aCap = aMatch ? parseInt(aMatch[1]) : 0
          const bCap = bMatch ? parseInt(bMatch[1]) : 0
          return aCap - bCap
        })

        setActividades(campoActs)

        // Cargar desafíos completados de localStorage
        const saved = localStorage.getItem('completed_field_challenges')
        if (saved) {
          setCompletedChallenges(JSON.parse(saved))
        }
      } catch (err) {
        console.error('Error cargando investigaciones de campo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleComplete = (id: string) => {
    const isNowCompleted = !completedChallenges[id]
    const updated = { ...completedChallenges, [id]: isNowCompleted }
    setCompletedChallenges(updated)
    localStorage.setItem('completed_field_challenges', JSON.stringify(updated))

    // Actualizar puntaje del estudiante (+50 PTS por investigación de campo)
    const savedScore = localStorage.getItem('user_score')
    const currentScore = savedScore ? parseInt(savedScore) : 0
    const newScore = isNowCompleted ? currentScore + 50 : Math.max(0, currentScore - 50)
    localStorage.setItem('user_score', String(newScore))
    
    // Disparar evento para actualizar navbar
    window.dispatchEvent(new Event('score-updated'))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 font-medium">Cargando misiones de campo...</p>
      </div>
    )
  }

  // Obtener ID del tomo seleccionado
  const selectedTomo = tomos.find(t => t.numero === activeTomoNum)
  
  // Filtrar actividades por el tomo seleccionado
  const filteredActividades = selectedTomo
    ? actividades.filter(a => a.tomo_id === selectedTomo.id)
    : []

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 relative z-10">
      
      {/* Encabezado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-bold font-display uppercase tracking-widest">
          <MapPin className="h-4 w-4" /> Aprendizaje Basado en Territorio
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Investigaciones de Campo
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          ¡Convertite en un verdadero explorador! Salí de la pantalla con tu familia o compañeros, visitá los lugares históricos y naturales de Córdoba, y completá los desafíos para ganar <span className="text-amber-400 font-bold">+50 PTS</span>.
        </p>
      </div>

      {/* Tabs por Tomo */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-gray-900 pb-4">
        {tomos.filter(t => t.numero <= 4).map(tomo => (
          <button
            key={tomo.id}
            onClick={() => setActiveTomoNum(tomo.numero)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
              activeTomoNum === tomo.numero
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold scale-102'
                : 'bg-gray-950/40 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tomo {tomo.numero}</span>
          </button>
        ))}
      </div>

      {/* Título de Tomo Seleccionado */}
      {selectedTomo && (
        <div className="text-center sm:text-left border-b border-white/5 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            {selectedTomo.titulo}
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            Desafíos interactivos de exploración
          </p>
        </div>
      )}

      {/* Grid de Desafíos */}
      {filteredActividades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredActividades.map((act) => {
            const isCompleted = completedChallenges[act.id]
            const cleanTitle = act.titulo.replace(/Tomo\s+\d+\s+·\s+Cap\.\s+\d+:\s*/i, '')
            const capMatch = act.titulo.match(/Cap\.\s*(\d+)/i)
            const capNumber = capMatch ? capMatch[1] : '?'

            return (
              <div
                key={act.id}
                className={`flex flex-col justify-between border rounded-3xl p-6 transition-all duration-300 bg-black/35 backdrop-blur-md relative overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-950/10'
                    : 'border-white/10 hover:border-white/15'
                }`}
              >
                {/* Decoración de fondo completado */}
                {isCompleted && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Fila superior */}
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-850 text-gray-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Capítulo {capNumber}
                    </span>
                    
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                      <Trophy className="h-3 w-3" />
                      <span>50 PTS</span>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-bold font-display text-white leading-snug">
                    {cleanTitle}
                  </h3>

                  {/* Instrucciones de campo */}
                  <div className="text-gray-300 text-sm leading-relaxed space-y-2 bg-gray-900/20 border border-white/5 p-4 rounded-2xl">
                    {act.situacion_problematica.split(/(?=\d+\.\s)/).map((p, idx) => (
                      <p key={idx} className="m-0 py-0.5">
                        {p.trim()}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="pt-6 border-t border-white/5 mt-6 flex justify-end">
                  <button
                    onClick={() => handleToggleComplete(act.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10 hover:bg-emerald-600'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Desafío Realizado
                      </>
                    ) : (
                      <>
                        <span>Marcar como Completado</span>
                        <ChevronRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-black/20 border border-white/5 rounded-3xl space-y-4">
          <MapPin className="h-12 w-12 text-gray-600 mx-auto" />
          <p className="text-gray-400 font-semibold">No se encontraron desafíos de campo para este tomo.</p>
        </div>
      )}
    </div>
  )
}
