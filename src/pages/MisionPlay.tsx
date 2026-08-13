import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Award, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, RefreshCw, Heart } from 'lucide-react'

interface Opcion {
  id: string
  pregunta_id: string
  texto: string
  es_correcta: boolean
}

interface Pregunta {
  id: string
  actividad_id: string
  enunciado: string
  feedback_explicacion: string
  puntos: number
  opciones: Opcion[]
}

interface Actividad {
  id: string
  mision_numero: number | null
  tomo_id: string | null
  titulo: string
  situacion_problematica: string
}

// ---- Confetti de Canvas Simple ----
class Particle {
  x: number; y: number; r: number; d: number;
  color: string; tilt: number; tiltAngleIncremental: number; tiltAngle: number;
  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * -20 - 20;
    this.r = Math.random() * 10 + 4;
    this.d = Math.random() * 20 + 10;
    const colors = ['#f5af19', '#e65c00', '#3b82f6', '#10b981', '#a855f7'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.tilt = Math.random() * 10 - 5;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.02;
    this.tiltAngle = 0;
  }
}

export default function MisionPlay() {
  const { id } = useParams<{ id: string }>()

  const [mision, setMision] = useState<Actividad | null>(null)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  
  // Gamification States
  const [lives, setLives] = useState(3)
  const [scoreEarned, setScoreEarned] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  
  const [selectedOpcionId, setSelectedOpcionId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [loading, setLoading] = useState(true)

  // Confetti Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particles = useRef<Particle[]>([])

  useEffect(() => {
    async function fetchMisionData() {
      if (!id) return
      setLoading(true)
      try {
        const { data: mData, error: mError } = await supabase
          .from('actividades')
          .select('*')
          .eq('id', id)
          .single()

        if (mError) throw mError
        setMision(mData)

        const { data: qData, error: qError } = await supabase
          .from('preguntas')
          .select('*, opciones(*)')
          .eq('actividad_id', id)

        if (qError) throw qError
        setPreguntas(qData || [])
      } catch (err) {
        console.error('Error cargando la partida:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMisionData()
  }, [id])

  // Canvas Confetti loop
  const triggerConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    particles.current = Array.from({ length: 100 }, () => new Particle(canvas.width))
    
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false
      
      particles.current.forEach((p) => {
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2
        p.x += Math.sin(p.tiltAngle)
        p.tiltAngle += p.tiltAngleIncremental
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5
        
        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2)
        ctx.stroke()
        
        if (p.y < canvas.height) {
          active = true
        }
      })
      
      if (active) {
        animationRef.current = requestAnimationFrame(update)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    update()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 font-medium">Preparando simulación interactiva...</p>
      </div>
    )
  }

  if (!mision || preguntas.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-white">Misión sin preguntas</h2>
        <p className="text-gray-400">Esta misión no cuenta con preguntas en la base de datos.</p>
        <Link to="/misiones" className="inline-block bg-amber-500 text-black font-semibold px-6 py-2 rounded-full">
          Volver
        </Link>
      </div>
    )
  }

  const currentQuestion = preguntas[currentIdx]

  const handleOptionClick = (opcionId: string, esCorrecta: boolean) => {
    if (isAnswered || gameOver) return
    setSelectedOpcionId(opcionId)
    setIsAnswered(true)

    if (esCorrecta) {
      setCorrectAnswersCount(prev => prev + 1)
      triggerConfetti()
    } else {
      // Perder vida
      const nextLives = lives - 1
      setLives(nextLives)
      if (nextLives <= 0) {
        setGameOver(true)
      }
    }
  }

  const handleNext = () => {
    setSelectedOpcionId(null)
    setIsAnswered(false)
    if (currentIdx + 1 < preguntas.length) {
      setCurrentIdx(currentIdx + 1)
    } else {
      // Fin del juego - Guardar resultados
      const medal = lives === 3 ? 'oro' : lives === 2 ? 'plata' : 'bronce'
      const pts = lives === 3 ? 30 : lives === 2 ? 20 : 10
      setScoreEarned(pts)

      // Guardar medalla en localStorage
      const savedMissions = localStorage.getItem('completed_missions')
      const completed = savedMissions ? JSON.parse(savedMissions) : {}
      
      // Solo sobreescribir si no se había ganado una mejor o igual
      const prevMedal = completed[mision.id]
      const shouldSave = !prevMedal || 
                         (prevMedal === 'bronce' && (medal === 'plata' || medal === 'oro')) ||
                         (prevMedal === 'plata' && medal === 'oro')

      if (shouldSave) {
        completed[mision.id] = medal
        localStorage.setItem('completed_missions', JSON.stringify(completed))

        // Sumar puntos
        const savedScore = localStorage.getItem('user_score')
        const currentScore = savedScore ? parseInt(savedScore) : 0
        localStorage.setItem('user_score', (currentScore + pts).toString())
        
        // Disparar evento para actualizar navbar
        window.dispatchEvent(new Event('score-updated'))
      }

      setShowSummary(true)
      triggerConfetti()
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOpcionId(null)
    setIsAnswered(false)
    setCorrectAnswersCount(0)
    setLives(3)
    setGameOver(false)
    setShowSummary(false)
  }

  // --- Pantalla de DERROTA (Sin vidas) ---
  if (gameOver) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center bg-black/40 backdrop-blur-md border border-red-500/20 rounded-3xl space-y-8 my-8 relative z-10">
        <div className="flex justify-center text-red-500">
          <XCircle className="h-20 w-20 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-display text-white">
            ¡Te quedaste sin vidas!
          </h2>
          <p className="text-gray-400 text-sm">
            No te preocupes. ¡El conocimiento requiere práctica! Relee el tomo correspondiente e intenta superar este desafío nuevamente.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3 rounded-full transition-all shadow-lg"
          >
            <RefreshCw className="h-4 w-4" /> Reintentar Desafío
          </button>
          <Link
            to="/misiones"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-full transition-all"
          >
            Ver Misiones
          </Link>
        </div>
      </div>
    )
  }

  // --- Pantalla de VICTORIA (Resumen) ---
  if (showSummary) {
    const medal = lives === 3 ? 'oro' : lives === 2 ? 'plata' : 'bronce'
    const medalEmoji = medal === 'oro' ? '🥇 ORO' : medal === 'plata' ? '🥈 PLATA' : '🥉 BRONCE'

    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl space-y-8 my-8 relative z-10">
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />
        <div className="flex justify-center">
          <div className="bg-amber-500/10 p-5 rounded-full border border-amber-500/20 text-amber-400">
            <Award className="h-16 w-16 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-display text-white">
            ¡Misión Superada!
          </h2>
          <p className="text-gray-400 text-sm">
            Demostraste tu sabiduría en: <br />
            <span className="text-white font-semibold">{mision.titulo}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <span className="block text-xs text-gray-500 font-semibold mb-1">Medalla Ganada</span>
            <span className="text-lg font-bold text-white tracking-wide">{medalEmoji}</span>
          </div>
          <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
            <span className="block text-xs text-gray-500 font-semibold mb-1">Puntos Obtenidos</span>
            <span className="text-xl font-extrabold text-amber-400">+{scoreEarned} PTS</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-emerald-400 font-semibold text-sm">
            {lives === 3 
              ? "¡Espectacular! Completaste la misión de manera perfecta sin perder vidas." 
              : "¡Excelente! Has superado el desafío de forma brillante."}
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-gray-850 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-full transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Jugar otra vez
            </button>
            <Link
              to="/misiones"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-6 py-3 rounded-full transition-all shadow-lg"
            >
              Ver Otras Misiones
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 relative z-10">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />
      
      {/* Barra superior de estado */}
      <div className="flex items-center justify-between">
        <Link to="/misiones" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Salir de la misión
        </Link>

        {/* Marcador de Vidas */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/5 px-4 py-2 rounded-full shadow-md">
          <span className="text-xs text-gray-400 font-bold mr-1">VIDAS:</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`h-5 w-5 transition-transform ${
                i < lives 
                  ? 'text-red-500 fill-red-500 scale-105' 
                  : 'text-gray-700 scale-90'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tarjeta de Planteo de la Misión */}
      <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-md text-xs font-bold font-display">
            {mision.mision_numero ? `Misión ${mision.mision_numero}` : 'Tomo General'}
          </span>
          <span className="text-xs text-gray-500 font-medium">Instrucción del Certamen</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white m-0">
          {mision.titulo.replace(/Misión\s+\d+:\s*/i, '')}
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-4">
          {mision.situacion_problematica}
        </p>
      </div>

      {/* Pregunta Activa */}
      <div className="backdrop-blur-sm bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Pregunta {currentIdx + 1} de {preguntas.length}
          </span>
          <span className="text-xs text-gray-500 font-semibold">Desafío de Autoevaluación</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {currentQuestion.enunciado}
        </h2>

        {/* Opciones de Respuesta */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.opciones.map((opc) => {
            const isSelected = selectedOpcionId === opc.id
            let buttonStyle = 'bg-black/30 hover:bg-black/50 border-white/5 text-gray-300'

            if (isAnswered) {
              if (opc.es_correcta) {
                buttonStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium'
              } else if (isSelected) {
                buttonStyle = 'bg-red-500/10 border-red-500/50 text-red-300 font-medium'
              } else {
                buttonStyle = 'bg-black/10 border-white/5 text-gray-600 opacity-40'
              }
            }

            return (
              <button
                key={opc.id}
                disabled={isAnswered || gameOver}
                onClick={() => handleOptionClick(opc.id, opc.es_correcta)}
                className={`flex items-center justify-between text-left p-4 rounded-xl border text-sm transition-all ${buttonStyle}`}
              >
                <span>{opc.texto}</span>
                {isAnswered && opc.es_correcta && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !opc.es_correcta && (
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Retroalimentación / Explicación Pedagógica */}
        {isAnswered && (
          <div className="bg-gray-800/10 border border-white/5 p-5 rounded-xl space-y-2 animate-fade-in-up">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Respuesta Esperada / Explicación</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {currentQuestion.feedback_explicacion || 'No hay explicación adicional para esta pregunta.'}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-5 py-2.5 rounded-lg text-sm shadow-md transition-all"
              >
                <span>{currentIdx + 1 === preguntas.length ? 'Finalizar Desafío' : 'Siguiente Pregunta'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
