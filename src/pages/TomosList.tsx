import { Link } from 'react-router-dom'
import { BookOpen, Bookmark, ChevronRight } from 'lucide-react'

export default function TomosList() {
  const tomos = [
    {
      num: 1,
      title: 'Tomo I: Historia de Córdoba',
      desc: 'Desde los orígenes y primeros pobladores (los Hênîa y Kâmîare) hasta el poblamiento hispánico, el cabildo colonial, las gestas patrias, y el desarrollo de Córdoba moderna en el siglo XXI.',
      color: 'from-amber-600 to-amber-700 border-amber-500/20 hover:border-amber-500/40',
      badge: 'Historia',
    },
    {
      num: 2,
      title: 'Tomo II: Arquitectura, Urbanismo y Símbolos',
      desc: 'El trazado urbano originario, la Manzana Jesuítica, iglesias icónicas, monumentos civiles y religiosos, y el valor del patrimonio arquitectónico de nuestra capital.',
      color: 'from-blue-600 to-blue-700 border-blue-500/20 hover:border-blue-500/40',
      badge: 'Arquitectura',
    },
    {
      num: 3,
      title: 'Tomo III: Identidad y Cultura Cordobesa',
      desc: 'Nuestras tradiciones, comidas tradicionales, el cuarteto y folclore, modismos y acentos singulares, mitos urbanos y la biodiversidad que albergan nuestras sierras.',
      color: 'from-emerald-600 to-emerald-700 border-emerald-500/20 hover:border-emerald-500/40',
      badge: 'Identidad y Cultura',
    },
    {
      num: 4,
      title: 'Tomo IV: Ciencia, Tecnología y Futuro',
      desc: 'El polo científico y tecnológico de vanguardia, el Observatorio Astronómico, la industria automotriz y aeroespacial, y soluciones ecológicas sustentables.',
      color: 'from-indigo-600 to-indigo-700 border-indigo-500/20 hover:border-indigo-500/40',
      badge: 'Ciencia y Futuro',
    },
    {
      num: 5,
      title: 'Tomo V: Entrenador Práctico y Banco de Preguntas',
      desc: 'El material final de entrenamiento práctico: un banco de preguntas y respuestas comentadas paso a paso, junto con cartografía interactiva para el certamen.',
      color: 'from-purple-600 to-purple-700 border-purple-500/20 hover:border-purple-500/40',
      badge: 'Entrenador Oficial',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Encabezado */}
      <div className="border-b border-gray-800 pb-6">
        <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
          Biblioteca Virtual
        </span>
        <h1 className="text-3xl font-extrabold font-display text-white m-0 mt-1">
          La Enciclopedia Completa
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mt-1">
          Explora cada tomo temático del concurso. Contiene la base teórica completa redactada y estructurada para estudiantes secundarios y primarios.
        </p>
      </div>

      {/* Listado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tomos.map((tomo) => (
          <Link
            key={tomo.num}
            to={`/tomos/${tomo.num}`}
            className="group bg-gray-900/30 border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:bg-gray-900/40 hover:-translate-y-0.5 transition-all shadow-md"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md text-white bg-gradient-to-r ${tomo.color}`}>
                  {tomo.badge}
                </span>
                <BookOpen className="h-5 w-5 text-gray-600 group-hover:text-amber-500 transition-colors" />
              </div>
              <h2 className="text-xl font-bold font-display text-white group-hover:text-amber-400 transition-colors">
                {tomo.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {tomo.desc}
              </p>
            </div>
            <div className="pt-6 flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:text-amber-400">
              <span>Ingresar a la lectura</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
