import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, Calendar, BookOpen, ChevronRight, ArrowUpDown } from 'lucide-react'

interface CronologiaHito {
  id: string
  anio: number
  titulo_hito: string
  descripcion: string
  tomo_asociado_id: string
  tomo?: {
    numero: number
    titulo: string
  }
}

export default function Cronologia() {
  const [hitos, setHitos] = useState<CronologiaHito[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTomo, setSelectedTomo] = useState<number | 'todos'>('todos')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCronologia() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('cronologia')
          .select('*, tomo:tomo_asociado_id(numero, titulo)')
          
        if (error) throw error
        setHitos(data || [])
      } catch (err) {
        console.error('Error cargando cronología:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCronologia()
  }, [])

  // Filtrar
  const filteredHitos = hitos
    .filter(h => {
      const matchSearch = 
        h.titulo_hito.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.anio.toString().includes(searchTerm)
        
      const matchTomo = selectedTomo === 'todos' || (h.tomo && h.tomo.numero === selectedTomo)
      
      return matchSearch && matchTomo
    })
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.anio - b.anio : b.anio - a.anio
    })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 font-medium">Armando línea de tiempo de Córdoba...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 relative z-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-6 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
            Recorrido Histórico
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white m-0">
            Cronología del Saber
          </h1>
          <p className="text-gray-400 text-sm">
            Navega por la historia de Córdoba desde sus orígenes. Haz clic en cualquier hito para leer su contexto en el tomo correspondiente.
          </p>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar fecha o suceso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedTomo}
            onChange={(e) => setSelectedTomo(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
            className="bg-gray-900/80 border border-gray-800 text-xs text-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Tomos</option>
            <option value="1">Tomo I (Historia)</option>
            <option value="2">Tomo II (Patrimonio)</option>
            <option value="3">Tomo III (Cultura)</option>
            <option value="4">Tomo IV (Ciencia/Futuro)</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 text-xs text-gray-300 rounded-full px-4 py-2 hover:bg-gray-800"
            title="Invertir orden cronológico"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOrder === 'asc' ? 'Antiguo Primero' : 'Reciente Primero'}</span>
          </button>
        </div>
      </div>

      {/* Contenedor de la línea de tiempo */}
      {filteredHitos.length > 0 ? (
        <div className="relative border-l-2 border-amber-500/20 ml-4 md:ml-32 space-y-12 py-4">
          {filteredHitos.map((h) => {
            const labelColor = 
              h.tomo?.numero === 1 ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
              h.tomo?.numero === 2 ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
              h.tomo?.numero === 3 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
              'border-purple-500/30 text-purple-400 bg-purple-500/5'

            return (
              <div key={h.id} className="relative group pl-8 md:pl-10">
                {/* Indicador de Fecha en el margen izquierdo (para PC) */}
                <div className="hidden md:block absolute -left-36 top-1.5 w-28 text-right font-display font-extrabold text-amber-500 text-base tracking-tight select-none">
                  {h.titulo_hito}
                </div>

                {/* Nodo de la línea de tiempo */}
                <div className="absolute -left-[9px] top-2.5 w-4 h-4 rounded-full bg-[#0b0f19] border-2 border-amber-500 group-hover:scale-125 group-hover:bg-amber-500 transition-all duration-300 shadow-[0_0_8px_rgba(245,175,25,0.4)]" />

                {/* Tarjeta de Evento */}
                <div className="backdrop-blur-sm bg-black/40 border border-white/10 rounded-2xl p-5 md:p-6 space-y-3 hover:border-amber-500/30 hover:bg-black/55 transition-all shadow-md max-w-4xl">
                  {/* Fila superior */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="block md:hidden font-display font-extrabold text-amber-500 text-sm">
                      {h.titulo_hito}
                    </span>
                    
                    {h.tomo && (
                      <span className={`text-[10px] font-bold font-display uppercase tracking-widest px-2.5 py-1 rounded-md border ${labelColor}`}>
                        Tomo {h.tomo.numero}: {h.tomo.titulo.split(':')[1]?.trim() || h.tomo.titulo}
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-300 text-sm leading-relaxed font-normal">
                    {h.descripcion}
                  </p>

                  {/* Botón de Enlace al Contexto */}
                  {h.tomo && (
                    <div className="pt-2">
                      <Link
                        to={`/tomos/${h.tomo.numero}?buscar=${encodeURIComponent(h.titulo_hito)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider group/link"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Ir al capítulo del tomo</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 space-y-2">
          <Calendar className="h-10 w-10 text-gray-600 mx-auto" />
          <p>No se encontraron hitos históricos con ese filtro.</p>
        </div>
      )}
    </div>
  )
}
