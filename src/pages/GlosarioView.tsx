import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search, HelpCircle } from 'lucide-react'

interface Termino {
  id: string
  termino: string
  definicion: string
  tomo_asociado_id: string
}

export default function GlosarioView() {
  const [terminos, setTerminos] = useState<Termino[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGlosario() {
      try {
        const { data, error } = await supabase
          .from('glosario')
          .select('*')
          .order('termino', { ascending: true })

        if (error) throw error
        setTerminos(data || [])
      } catch (err) {
        console.error('Error cargando el glosario:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGlosario()
  }, [])

  // Filtrado de términos
  const filteredTerminos = terminos.filter((t) => {
    const matchesSearch = t.termino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.definicion.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Normalizar iniciales (ej. Á -> A)
    const initial = t.termino.charAt(0).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    const matchesLetter = selectedLetter ? initial === selectedLetter : true

    return matchesSearch && matchesLetter
  })

  // Generar abecedario disponible
  const alphabet = Array.from(
    new Set(
      terminos.map((t) =>
        t.termino.charAt(0).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
      )
    )
  ).sort()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium">Ordenando términos alfabéticamente...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
            Enciclopedia de Palabras
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white m-0">
            Glosario de Córdoba
          </h1>
          <p className="text-gray-400 text-sm">
            Encuentra definiciones rápidas de términos complejos, palabras técnicas y modismos locales.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar término o definición..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setSelectedLetter(null) // resetear letra
            }}
            className="w-full bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Abecedario */}
      <div className="flex flex-wrap gap-1.5 pb-4 border-b border-gray-800/40">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedLetter === null
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          TODAS
        </button>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
              selectedLetter === letter
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Listado de Términos */}
      {filteredTerminos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerminos.map((t) => (
            <div
              key={t.id}
              className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-6 space-y-3 hover:border-blue-500/20 hover:bg-gray-900/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 className="text-lg font-bold font-display text-white m-0">
                  {t.termino}
                </h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t.definicion}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <HelpCircle className="h-10 w-10 text-gray-600 mx-auto" />
          <p>No se encontraron términos para esta búsqueda.</p>
        </div>
      )}
    </div>
  )
}
