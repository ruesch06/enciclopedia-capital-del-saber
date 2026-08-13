import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Users, Search, User, Info, X } from 'lucide-react'

interface Personaje {
  id: string
  nombre: string
  rol_historico: string
  fecha_nacimiento: string
  biografia_corta: string
  biografia_completa: string
  imagen_url: string
}

export default function PersonajesList() {
  const [personajes, setPersonajes] = useState<Personaje[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activePersonaje, setActivePersonaje] = useState<Personaje | null>(null)

  useEffect(() => {
    async function fetchPersonajes() {
      try {
        const { data, error } = await supabase
          .from('personajes')
          .select('*')
          .order('nombre', { ascending: true })

        if (error) throw error
        setPersonajes(data || [])
      } catch (err) {
        console.error('Error cargando personajes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonajes()
  }, [])

  const filteredPersonajes = personajes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rol_historico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.biografia_corta.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-gray-400 font-medium">Buscando biografías...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
            Héroes y Creadores
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white m-0">
            Personajes de la Historia
          </h1>
          <p className="text-gray-400 text-sm">
            Explora las figuras clave que marcaron la historia, cultura, ciencia y sociedad de Córdoba.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar personaje o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid de Personajes */}
      {filteredPersonajes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonajes.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition-all shadow-md group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2.5 rounded-full text-emerald-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-white group-hover:text-emerald-400 transition-colors m-0 leading-tight">
                      {p.nombre}
                    </h3>
                    <span className="text-xs text-gray-500 font-semibold">
                      {p.fecha_nacimiento}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-500/80 uppercase tracking-wide">
                    {p.rol_historico}
                  </span>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {p.biografia_corta}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setActivePersonaje(p)}
                  className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all"
                >
                  <Info className="h-4 w-4" />
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <Users className="h-10 w-10 text-gray-600 mx-auto" />
          <p>No se encontraron personajes.</p>
        </div>
      )}

      {/* Modal de Biografía Completa */}
      {activePersonaje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            {/* Header del Modal */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Ficha Biográfica
                </span>
                <h2 className="text-2xl font-bold font-display text-white m-0">
                  {activePersonaje.nombre}
                </h2>
                <p className="text-sm text-emerald-500/80 font-medium m-0 mt-0.5">
                  {activePersonaje.rol_historico}
                </p>
              </div>
              <button
                onClick={() => setActivePersonaje(null)}
                className="bg-gray-850 hover:bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto space-y-4 text-gray-300 leading-relaxed text-sm font-sans">
              {activePersonaje.fecha_nacimiento && (
                <div>
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Época / Período</span>
                  <span className="text-white font-medium">{activePersonaje.fecha_nacimiento}</span>
                </div>
              )}

              <div className="border-t border-gray-800/60 pt-4">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Biografía Detallada</span>
                {activePersonaje.biografia_completa ? (
                  <div className="whitespace-pre-wrap space-y-4">
                    {activePersonaje.biografia_completa.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p>{activePersonaje.biografia_corta}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800/80 bg-gray-950 flex justify-end">
              <button
                onClick={() => setActivePersonaje(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
