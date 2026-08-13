import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ChevronLeft, BookOpen, List, ChevronRight, Bookmark } from 'lucide-react'

interface Tomo {
  id: string
  numero: number
  titulo: string
  descripcion: string
  color_theme: string
}

interface ChapterBlock {
  type: string
  text?: string
  level?: number
  title?: string
}

interface Chapter {
  id: string
  tomo_id: string
  orden: number
  titulo: string
  subtitulo: string
  bloques: ChapterBlock[]
}

export default function TomoView() {
  const { id } = useParams<{ id: string }>()
  const tomoNumber = parseInt(id || '1')
  const [searchParams, setSearchParams] = useSearchParams()
  const buscar = searchParams.get('buscar')

  const [tomo, setTomo] = useState<Tomo | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  // Por defecto, -1 para mostrar el Índice General del Tomo primero
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
  const [loading, setLoading] = useState(true)
  
  // Guardar la sección a la que queremos hacer scroll suave
  const [scrollToSectionText, setScrollToSectionText] = useState<string | null>(null)

  // 1. Efecto para saltar al capítulo que contiene el término de búsqueda de la cronología
  useEffect(() => {
    if (chapters.length > 0 && buscar) {
      const cleanSearch = decodeURIComponent(buscar).toLowerCase()
      const index = chapters.findIndex(cap => {
        const inTitle = cap.titulo.toLowerCase().includes(cleanSearch) || 
                        cap.subtitulo.toLowerCase().includes(cleanSearch)
        if (inTitle) return true
        
        const inBlocks = cap.bloques?.some(b => 
          b.text?.toLowerCase().includes(cleanSearch) || 
          b.title?.toLowerCase().includes(cleanSearch)
        )
        return inBlocks
      })
      
      if (index !== -1) {
        setActiveChapterIndex(index)
        setScrollToSectionText(cleanSearch)
      }
    }
  }, [chapters, buscar])

  // 2. Efecto para hacer scroll suave a la sección seleccionada y animarla con un pulso
  useEffect(() => {
    if (activeChapterIndex >= 0 && scrollToSectionText) {
      const timer = setTimeout(() => {
        const headers = document.querySelectorAll('h3, h4, h5, h2')
        for (const h of headers) {
          if (h.textContent?.toLowerCase().includes(scrollToSectionText.toLowerCase())) {
            h.scrollIntoView({ behavior: 'smooth', block: 'center' })
            
            // Efecto visual de pulso para resaltar
            h.classList.add('bg-amber-500/30', 'animate-pulse', 'rounded', 'px-2')
            setTimeout(() => {
              h.classList.remove('bg-amber-500/30', 'animate-pulse')
            }, 3000)
            break
          }
        }
        setScrollToSectionText(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [activeChapterIndex, scrollToSectionText])

  // 3. Obtener datos del Tomo y sus Capítulos
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Obtener datos del Tomo
        const { data: tomoData, error: tomoError } = await supabase
          .from('tomos')
          .select('*')
          .eq('numero', tomoNumber)
          .single()

        if (tomoError) throw tomoError
        setTomo(tomoData)

        if (tomoData) {
          // Obtener capítulos asociados
          const { data: capData, error: capError } = await supabase
            .from('capitulos')
            .select('*')
            .eq('tomo_id', tomoData.id)
            .order('orden', { ascending: true })

          if (capError) throw capError
          setChapters(capData || [])
          
          // Si no hay búsqueda, mostramos el índice general
          if (!buscar) {
            setActiveChapterIndex(-1)
          }
        }
      } catch (err) {
        console.error('Error cargando el tomo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tomoNumber, buscar])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-gray-400 font-medium">Cargando contenido del tomo...</p>
      </div>
    )
  }

  if (!tomo) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-white">Tomo no encontrado</h2>
        <p className="text-gray-400">No pudimos encontrar el volumen solicitado de la enciclopedia.</p>
        <Link to="/" className="inline-block bg-amber-500 text-white font-semibold px-6 py-2 rounded-full">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // Helper para renderizar negritas, cursivas y resaltados de búsqueda
  const renderFormattedText = (
    text: string | undefined,
    search: string | null
  ): React.ReactNode => {
    if (!text) return null

    const applyHighlight = (raw: string): React.ReactNode[] => {
      if (!search) return [raw]
      const clean = decodeURIComponent(search).trim()
      if (!clean) return [raw]
      const re = new RegExp(`(${clean})`, 'gi')
      return raw.split(re).map((part, i) =>
        re.test(part)
          ? <mark key={i} className="bg-amber-400/35 text-white px-1 py-0.5 rounded font-semibold">{part}</mark>
          : part
      )
    }

    const applyItalic = (raw: string): React.ReactNode[] => {
      const re = /(\*[^*]+\*)/g
      return raw.split(re).flatMap((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-gray-200">{applyHighlight(part.slice(1, -1))}</em>
        }
        return applyHighlight(part)
      })
    }

    const applyBold = (raw: string): React.ReactNode[] => {
      const re = /(\*\*[^*]+\*\*)/g
      return raw.split(re).flatMap((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{applyItalic(part.slice(2, -2))}</strong>
        }
        return applyItalic(part)
      })
    }

    return applyBold(text)
  }

  const activeChapter = activeChapterIndex >= 0 ? chapters[activeChapterIndex] : null

  // Configuración de colores del tomo
  const themeColors: Record<string, string> = {
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 focus:border-amber-500',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 focus:border-blue-500',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 focus:border-emerald-500',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 focus:border-indigo-500',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 focus:border-purple-500',
  }

  const activeThemeClass = themeColors[tomo.color_theme] || themeColors.amber

  // Extraer todos los sub-títulos de un capítulo para navegación rápida
  const getChapterSections = (cap: Chapter) => {
    return cap.bloques
      ? cap.bloques.filter(b => b.type === 'titulo' && b.text).map(b => b.text as string)
      : []
  }

  const handleSelectSection = (chapterIdx: number, sectionText: string) => {
    // Si ya estamos en el capítulo, hacemos scroll directo
    if (activeChapterIndex === chapterIdx) {
      setScrollToSectionText(sectionText)
    } else {
      // Si no, cambiamos primero de capítulo y luego hacemos scroll
      setActiveChapterIndex(chapterIdx)
      setScrollToSectionText(sectionText)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
      {/* Header del Tomo */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-6 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-2">
          <Link to="/tomos" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" /> Volver a los Tomos
          </Link>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${activeThemeClass}`}>
              Tomo {tomo.numero}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white m-0">
              {tomo.titulo.replace(/Tomo\s+[I|V|X]+:\s*/i, '')}
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">{tomo.descripcion}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Barra lateral de navegación */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-3">
            <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase px-2">
              Navegación
            </h2>
            
            {/* Botón de Índice General */}
            <button
              onClick={() => {
                setActiveChapterIndex(-1)
                setSearchParams({}) // Limpiar parámetros de búsqueda al ir al índice
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all border text-sm ${
                activeChapterIndex === -1
                  ? 'bg-gray-800/80 text-white border-gray-700 font-semibold shadow-inner'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-900/40'
              }`}
            >
              <List className="h-4 w-4 text-amber-500" />
              <span>Índice General</span>
            </button>
            
            <div className="h-[1px] bg-gray-800/40 my-2" />
            
            <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase px-2">
              Capítulos
            </h2>
            
            {/* Listado de Capítulos */}
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
              {chapters.map((cap, index) => {
                const isSelected = activeChapterIndex === index
                const sections = getChapterSections(cap)
                
                return (
                  <div key={cap.id} className="flex-shrink-0 w-auto lg:w-full space-y-1">
                    <button
                      onClick={() => {
                        setActiveChapterIndex(index)
                        setSearchParams({}) // Limpiar parámetros
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                        isSelected
                          ? 'bg-gray-800/80 text-white border-gray-700 font-semibold'
                          : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-gray-900/40'
                      }`}
                    >
                      <div className="text-[10px] text-amber-500 font-bold mb-0.5 uppercase tracking-wider">
                        Capítulo {cap.orden}
                      </div>
                      <div className="text-sm truncate max-w-[180px] lg:max-w-none">
                        {cap.subtitulo || cap.titulo}
                      </div>
                    </button>
                    
                    {/* Sub-secciones expandidas (Árbol de navegación) */}
                    {isSelected && sections.length > 0 && (
                      <div className="hidden lg:block pl-4 pr-2 py-1 space-y-1 border-l border-gray-800 ml-4 animate-fadeIn">
                        {sections.map((sec, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSelectSection(index, sec)}
                            className="w-full text-left py-1 text-xs text-gray-500 hover:text-amber-400 transition-colors truncate block"
                            title={sec}
                          >
                            • {sec}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 📋 VISTA A: Índice General del Tomo */}
        {activeChapterIndex === -1 ? (
          <div className="lg:col-span-3 bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8 shadow-2xl min-h-[500px]">
            <div className="space-y-2 border-b border-white/5 pb-6">
              <span className="text-xs font-bold text-amber-500 tracking-wide uppercase">
                Guía de Contenidos
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white m-0">
                Índice del Tomo {tomo.numero}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chapters.map((cap, capIdx) => {
                const sections = getChapterSections(cap)
                return (
                  <div 
                    key={cap.id} 
                    className="bg-gray-950/40 border border-white/5 rounded-2xl p-5 hover:border-amber-500/25 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase block mb-1">
                          Capítulo {cap.orden}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {cap.subtitulo || cap.titulo}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveChapterIndex(capIdx)}
                        className="bg-gray-900 border border-gray-800 p-1.5 rounded-lg group-hover:bg-amber-500 group-hover:text-black transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Lista de secciones en el índice */}
                    {sections.length > 0 && (
                      <ul className="mt-4 pt-4 border-t border-gray-900 space-y-2 text-xs text-gray-400">
                        {sections.map((sec, sIdx) => (
                          <li key={sIdx} className="hover:text-amber-300 transition-colors flex items-start gap-1">
                            <span className="text-amber-500 select-none">•</span>
                            <button
                              onClick={() => handleSelectSection(capIdx, sec)}
                              className="text-left hover:underline text-gray-400 hover:text-white"
                            >
                              {sec}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* 📖 VISTA B: Lectura de Capítulo */
          <div className="lg:col-span-3 bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8 min-h-[500px] shadow-2xl">
            {activeChapter ? (
              <article className="space-y-6">
                {/* Encabezado del Capítulo */}
                <div className="space-y-2 border-b border-white/5 pb-6">
                  <span className="text-xs font-bold text-amber-500 tracking-wide uppercase">
                    Lectura del Capítulo {activeChapter.orden}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white m-0">
                    {renderFormattedText(activeChapter.subtitulo || activeChapter.titulo, buscar)}
                  </h2>
                </div>

                {/* Mini Tabla de Contenidos rápida en la parte superior */}
                {getChapterSections(activeChapter).length > 0 && (
                  <div className="bg-gray-950/30 border border-white/5 rounded-xl p-4 mb-6">
                    <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase block mb-2">
                      En este capítulo:
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                      {getChapterSections(activeChapter).map((sec, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSelectSection(activeChapterIndex, sec)}
                          className="hover:text-amber-400 transition-colors text-left"
                        >
                          # {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bloques de contenido */}
                <div className="space-y-6 text-gray-300 leading-relaxed font-sans text-base">
                  {activeChapter.bloques && activeChapter.bloques.length > 0 ? (
                    activeChapter.bloques.map((bloque, index) => {
                      if (bloque.type === 'titulo') {
                        return (
                          <h3 
                            key={index} 
                            className="text-xl font-bold font-display text-white pt-4 m-0 scroll-mt-24 transition-colors duration-500"
                          >
                            {renderFormattedText(bloque.text, buscar)}
                          </h3>
                        )
                      } else if (bloque.type === 'curiosidad') {
                        return (
                          <div key={index} className="bg-amber-500/5 border-l-4 border-amber-500 p-5 rounded-r-xl my-6 space-y-1 shadow-sm">
                            <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                              <Bookmark className="h-3.5 w-3.5" />
                              <span>{renderFormattedText(bloque.title || 'Sabías que...', buscar)}</span>
                            </h4>
                            <p className="text-sm text-gray-300 m-0 leading-relaxed">
                              {renderFormattedText(bloque.text, buscar)}
                            </p>
                          </div>
                        )
                      } else {
                        return (
                          <p key={index} className="m-0 text-justify">
                            {renderFormattedText(bloque.text, buscar)}
                          </p>
                        )
                      }
                    })
                  ) : (
                    <p className="text-gray-500 italic">No hay bloques de texto disponibles en este capítulo.</p>
                  )}
                </div>
              </article>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
