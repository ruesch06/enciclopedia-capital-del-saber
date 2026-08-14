import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ChevronLeft, List, ChevronRight, Bookmark } from 'lucide-react'

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

interface ImageData {
  url: string
  caption: string
}

// Mapeo dinámico de imágenes sugeridas para el Tomo 1
const TOMO_IMAGES_MAP: Record<string, ImageData[]> = {
  "1-1": [
    { url: "/tomo1_pinturas_rupestres.jpg", caption: "Pinturas rupestres del Cerro Colorado: Detalle de aleros con figuras de guerreros, llamas y caballeros españoles." },
    { url: "/tomo1_morteros_piedra.jpg", caption: "Morteros de roca granítica a la orilla del Río Suquía o en el Parque Sarmiento." },
    { url: "/tomo1_poblado_henia_camiare.jpg", caption: "Ilustración: Reconstrucción de un poblado Hênîa-Câmîare en un valle serrano con familias." }
  ],
  "1-2": [
    { url: "/tomo1_fundacion_cabrera.jpg", caption: "Fundación de Córdoba (6 de julio de 1573): Jerónimo Luis de Cabrera clavando la Picota en la orilla del río." }
  ],
  "1-3": [
    { url: "/tomo1_recova_colonial.jpg", caption: "Ilustración: Escena en la Recova Colonial con pregoneros vendiendo agua y empanadas en la Plaza Mayor." },
    { url: "/tomo1_catedral_fachada.jpg", caption: "Catedral de Córdoba: Vista de la fachada barroca y las torres campanario." },
    { url: "/tomo1_cabildo_historico.jpg", caption: "Cabildo Histórico: Arcos de ladrillo sobre la Plaza San Martín." },
    { url: "/tomo1_casona_sobremonte.jpg", caption: "Casona Patricia Colonial: Patio interno con aljibe (Museo Marqués de Sobremonte)." }
  ],
  "1-4": [
    { url: "/tomo1_compania_jesus_boveda.jpg", caption: "Iglesia de la Compañía de Jesús: Techo de la nave con bóveda de madera en forma de casco de barco invertido." },
    { url: "/tomo1_estancia_alta_gracia.jpg", caption: "Estancia Jesuítica de Alta Gracia: Vista de la residencia y el dique Tajamar." },
    { url: "/tomo1_estancia_jesus_maria.jpg", caption: "Estancia de Jesús María: Bodega y molino colonial." }
  ],
  "1-5": [
    { url: "/tomo1_patio_unc.jpg", caption: "Patio Rectoral de la UNC: Galería de arcos con la estatua de Fray Fernando de Trejo." },
    { url: "/tomo1_imprenta_jesuitica.jpg", caption: "Imprenta Jesuítica de tipos móviles conservada en el Colegio de Monserrat." }
  ],
  "1-6": [
    { url: "/tomo1_chasqui_1810.jpg", caption: "Ilustración: Llegada del Chasqui entregando las noticias de la Revolución de Mayo frente al Cabildo." },
    { url: "/tomo1_tejedoras_1816.jpg", caption: "Ilustración: Mujeres tejiendo ponchos de lana para el Ejército de los Andes de San Martín." }
  ],
  "1-7": [
    { url: "/tomo1_estacion_trenes_1880.jpg", caption: "Estación de Trenes (1880): Llegada del Ferrocarril Central Argentino a Córdoba." },
    { url: "/tomo1_observatorio_1871.jpg", caption: "Observatorio Astronómico (1871): Torres y telescopios históricos en Barrio Observatorio." },
    { url: "/tomo1_tranvia_sangre.jpg", caption: "Tranvía a sangre (1880): Vagones tirados por mulas en el microcentro." }
  ],
  "1-8": [
    { url: "/tomo1_reforma_universitaria_1918.jpg", caption: "Reforma Universitaria (15 de junio de 1918): Estudiantes en los balcones y techos de la UNC." }
  ],
  "1-9": [
    { url: "/tomo1_ika_cadena_montaje.jpg", caption: "Planta Santa Isabel (1960): Cadena de montaje de IKA ensamblando automóviles Torino." },
    { url: "/tomo1_canalizacion_canada.jpg", caption: "La Cañada (1944-1948): Construcción del canal de hormigón y tipas." },
    { url: "/tomo1_cordobazo_1969.jpg", caption: "El Cordobazo (29 de mayo de 1969): Marcha obrero-estudiantil en el centro." },
    { url: "/tomo1_casa_giratoria.jpg", caption: "La Casa Giratoria de Abdón Sahade en su traslado histórico." }
  ],
  "1-10": [
    { url: "/tomo1_faro_bicentenario.jpg", caption: "Panorámica desde el Faro del Bicentenario sobre Nueva Córdoba." },
    { url: "/tomo1_trolebuses.jpg", caption: "Trolebuses de Córdoba: Vehículos eléctricos conducidos por mujeres." },
    { url: "/tomo1_satelite_saocom.jpg", caption: "Satélite SAOCOM: Satélite científico de observación terrestre desarrollado por la CONAE." }
  ]
}

// Componente premium para renderizar imágenes de variados tamaños y orientaciones
function ImageFrame({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [hasError, setHasError] = useState(false)

  // Si no se encuentra la imagen en el directorio local, se oculta silenciosamente
  if (hasError) return null

  return (
    <div className="space-y-2.5 max-w-2xl mx-auto my-8 animate-fadeIn">
      {/* Contenedor con aspecto unificado y Blur-Mirror Frame */}
      <div className="relative overflow-hidden aspect-video rounded-2xl border border-white/10 bg-black/60 shadow-xl group">
        
        {/* Fondo borroso (para rellenar márgenes de fotos verticales o cuadradas) */}
        <img 
          src={src} 
          alt="" 
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-20 pointer-events-none"
        />
        
        {/* Imagen nítida centrada en proporción real */}
        <img 
          src={src} 
          alt={alt} 
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-contain p-3 z-10 transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      
      {caption && (
        <p className="text-xs text-gray-400 italic text-center px-6 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  )
}

export default function TomoView() {
  const { id } = useParams<{ id: string }>()
  const tomoNumber = parseInt(id || '1')
  const [searchParams, setSearchParams] = useSearchParams()
  const buscar = searchParams.get('buscar')

  const [tomo, setTomo] = useState<Tomo | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1)
  const [loading, setLoading] = useState(true)
  
  const [scrollToSectionText, setScrollToSectionText] = useState<string | null>(null)

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

  useEffect(() => {
    if (activeChapterIndex >= 0 && scrollToSectionText) {
      const timer = setTimeout(() => {
        const headers = document.querySelectorAll('h3, h4, h5, h2')
        for (const h of headers) {
          if (h.textContent?.toLowerCase().includes(scrollToSectionText.toLowerCase())) {
            h.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: tomoData, error: tomoError } = await supabase
          .from('tomos')
          .select('*')
          .eq('numero', tomoNumber)
          .single()

        if (tomoError) throw tomoError
        setTomo(tomoData)

        if (tomoData) {
          const { data: capData, error: capError } = await supabase
            .from('capitulos')
            .select('*')
            .eq('tomo_id', tomoData.id)
            .order('orden', { ascending: true })

          if (capError) throw capError
          setChapters(capData || [])
          
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

  const themeColors: Record<string, string> = {
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 focus:border-amber-500',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 focus:border-blue-500',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 focus:border-emerald-500',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 focus:border-indigo-500',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 focus:border-purple-500',
  }

  const activeThemeClass = themeColors[tomo.color_theme] || themeColors.amber

  const getChapterSections = (cap: Chapter) => {
    return cap.bloques
      ? cap.bloques.filter(b => b.type === 'titulo' && b.text).map(b => b.text as string)
      : []
  }

  const handleSelectSection = (chapterIdx: number, sectionText: string) => {
    if (activeChapterIndex === chapterIdx) {
      setScrollToSectionText(sectionText)
    } else {
      setActiveChapterIndex(chapterIdx)
      setScrollToSectionText(sectionText)
    }
  }

  // Obtener imágenes del capítulo activo
  const activeChapterImages = activeChapter
    ? TOMO_IMAGES_MAP[`${tomo.numero}-${activeChapter.orden}`] || []
    : []

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
            
            <button
              onClick={() => {
                setActiveChapterIndex(-1)
                setSearchParams({})
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
            
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-none">
              {chapters.map((cap, index) => {
                const isSelected = activeChapterIndex === index
                const sections = getChapterSections(cap)
                
                return (
                  <div key={cap.id} className="flex-shrink-0 w-auto lg:w-full space-y-1">
                    <button
                      onClick={() => {
                        setActiveChapterIndex(index)
                        setSearchParams({})
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

                {/* Mini Tabla de Contenidos rápida */}
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

                {/* 🖼️ Renderizar Galería Multimedia de forma premium al final del capítulo */}
                {activeChapterImages.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                    <h4 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">
                      Galería Multimedia Ilustrativa
                    </h4>
                    <div className="space-y-8">
                      {activeChapterImages.map((img, idx) => (
                        <ImageFrame 
                          key={idx}
                          src={img.url}
                          alt={img.caption}
                          caption={img.caption}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
