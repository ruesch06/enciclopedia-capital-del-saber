import { Link } from 'react-router-dom'
import { BookOpen, Award, Users, Search, ChevronRight, Bookmark } from 'lucide-react'

export default function Home() {
  const stats = [
    { label: 'Tomos Educativos', count: '5', color: 'text-amber-400' },
    { label: 'Misiones y Trivias', count: '44', color: 'text-orange-400' },
    { label: 'Personajes Históricos', count: '57', color: 'text-emerald-400' },
    { label: 'Términos de Glosario', count: '241', color: 'text-blue-400' },
  ]

  const tomos = [
    {
      num: 1,
      title: 'Historia de Córdoba',
      desc: 'El tiempo profundo, los pueblos originarios (Hênîa y Kâmîare), la fundación colonial, y la Córdoba moderna del siglo XXI.',
      color: 'from-amber-600 to-amber-700',
      badge: 'Tomo I',
    },
    {
      num: 2,
      title: 'Arquitectura, Urbanismo y Símbolos',
      desc: 'El trazado de damero, la Manzana Jesuítica, iglesias históricas, monumentos y la evolución urbana de la docta.',
      color: 'from-blue-600 to-blue-700',
      badge: 'Tomo II',
    },
    {
      num: 3,
      title: 'Identidad y Cultura Cordobesa',
      desc: 'El dialecto cordobés, la música del cuarteto, la gastronomía clásica, mitos urbanos, el folclore y nuestras reservas naturales.',
      color: 'from-emerald-600 to-emerald-700',
      badge: 'Tomo III',
    },
    {
      num: 4,
      title: 'Ciencia, Tecnología y Futuro',
      desc: 'El polo científico-tecnológico, el Observatorio Astronómico, la industria aeroespacial y automotriz, y los desafíos ambientales.',
      color: 'from-indigo-600 to-indigo-700',
      badge: 'Tomo IV',
    },
    {
      num: 5,
      title: 'Entrenador Práctico y Banco de Preguntas',
      desc: 'Preguntas comentadas, simulacros del examen oficial y cartografía muda para entrenar tu conocimiento de Córdoba.',
      color: 'from-purple-600 to-purple-700',
      badge: 'Tomo V',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in-up bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
          Plataforma Educativa Oficial
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-tight text-white m-0">
          Córdoba Capital <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            del Saber
          </span>
        </h1>
        <p className="text-gray-300 text-lg sm:text-xl font-normal leading-relaxed drop-shadow">
          Explora los tomos interactivos, supera las 44 misiones con desafíos lúdicos y prepárate para el gran certamen provincial de escuelas secundarias y primarias.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/misiones"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            <Award className="h-5 w-5" />
            <span>Comenzar Misiones</span>
          </Link>
          <Link
            to="/tomos"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
          >
            <BookOpen className="h-5 w-5" />
            <span>Leer Enciclopedia</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 backdrop-blur-md bg-black/40 border border-white/10 p-8 rounded-2xl shadow-2xl">
        {stats.map((stat, i) => (
          <div key={i} className="text-center space-y-1">
            <div className={`text-3xl sm:text-4xl font-extrabold font-display ${stat.color}`}>
              {stat.count}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Grid of Modules */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-display text-white m-0">
            Los 5 Tomos Temáticos
          </h2>
          <Link
            to="/tomos"
            className="text-amber-500 hover:text-amber-400 text-sm font-semibold flex items-center gap-1 group"
          >
            Ver todos <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tomos.map((tomo) => (
            <Link
              key={tomo.num}
              to={`/tomos/${tomo.num}`}
              className="group flex flex-col justify-between backdrop-blur-sm bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 hover:bg-black/50 transition-all hover:-translate-y-1 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${tomo.color}`}>
                    {tomo.badge}
                  </span>
                  <Bookmark className="h-4 w-4 text-gray-600 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold font-display text-white leading-snug group-hover:text-amber-400 transition-colors">
                  {tomo.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                  {tomo.desc}
                </p>
              </div>
              <div className="pt-6 flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:text-amber-400">
                <span>Comenzar lectura</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Interactive Tools Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <Link
          to="/misiones"
          className="group flex items-start gap-4 p-6 bg-gradient-to-br from-orange-950/20 to-amber-950/10 border border-orange-900/20 hover:border-orange-500/30 rounded-2xl transition-all"
        >
          <div className="bg-orange-500/10 p-3 rounded-xl text-orange-400 group-hover:scale-105 transition-transform">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1 group-hover:text-orange-400">
              Desafío de Misiones
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Resuelve las 44 misiones con preguntas gamificadas diseñadas por el Ministerio de Educación.
            </p>
          </div>
        </Link>

        <Link
          to="/personajes"
          className="group flex items-start gap-4 p-6 bg-gradient-to-br from-emerald-950/20 to-teal-950/10 border border-emerald-900/20 hover:border-emerald-500/30 rounded-2xl transition-all"
        >
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400">
              Personajes Ilustres
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Conoce las fichas de los personajes históricos más importantes que forjaron la identidad cordobesa.
            </p>
          </div>
        </Link>

        <Link
          to="/glosario"
          className="group flex items-start gap-4 p-6 bg-gradient-to-br from-blue-950/20 to-indigo-950/10 border border-blue-900/20 hover:border-blue-500/30 rounded-2xl transition-all"
        >
          <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 group-hover:scale-105 transition-transform">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1 group-hover:text-blue-400">
              Buscador del Glosario
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Encuentra al instante el significado de palabras locales, técnicas e indígenas del concurso.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
