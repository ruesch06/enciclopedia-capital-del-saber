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
  // Pregunta interactiva (Tomo V)
  pregunta?: string
  opciones?: string[]
  respuesta_correcta?: string
  xp?: number
  explicacion?: string
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

// Mapeo dinámico de imágenes sugeridas para todos los Tomos
const TOMO_IMAGES_MAP: Record<string, ImageData[]> = {
  // TOMO I: Historia
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
  ],

  // TOMO II: Patrimonio y Arquitectura
  "2-1": [
    { url: "/tomo2_plaza_san_martin.jpg", caption: "Plaza San Martín: Vista del monumento ecuestre del Gral. San Martín y los plátanos centenarios." },
    { url: "/tomo2_cabildo_patio.jpg", caption: "Patio interno del Cabildo Histórico con sus arcadas y muros de piedra colonial." }
  ],
  "2-2": [
    { url: "/tomo2_catedral_interior.jpg", caption: "Interior de la Catedral de Córdoba: Detalle del altar mayor elaborado en plata maciza y la nave central." },
    { url: "/tomo2_compania_boveda.jpg", caption: "Bóveda de la Compañía de Jesús: Techo de madera de cedro paraguayo ensamblado con forma de casco de barco invertido." },
    { url: "/tomo2_colegio_monserrat.jpg", caption: "Colegio Nacional de Monserrat: Patio de claustros y la icónica Torre del Reloj." },
    { url: "/tomo2_cripta_jesuitica.jpg", caption: "Cripta Jesuítica: Antigua galería subterránea de ladrillo y arcos de piedra redescubierta bajo la calzada." }
  ],
  "2-3": [
    { url: "/tomo2_palacio_ferreyra.jpg", caption: "Palacio Ferreyra (Museo Evita): Imponente fachada neoclásica de estilo Belle Époque francés de principios de siglo XX." },
    { url: "/tomo2_museo_caraffa.jpg", caption: "Museo Provincial de Bellas Artes Emilio Caraffa: Fachada clásica original conectada con ampliaciones de vidrio y acero modernas." },
    { url: "/tomo2_buen_pastor_noche.jpg", caption: "Paseo del Buen Pastor: Espectáculo nocturno de aguas danzantes con la Capilla de fondo." }
  ],
  "2-4": [
    { url: "/tomo2_teatro_libertador.jpg", caption: "Teatro del Libertador General San Martín: Vista del escenario principal y los palcos con terciopelo rojo." },
    { url: "/tomo2_observatorio.jpg", caption: "Observatorio Astronómico de Córdoba: Edificio central con sus cúpulas metálicas y telescopios." }
  ],
  "2-5": [
    { url: "/tomo2_la_canada.jpg", caption: "Paseo de la Cañada: Balaustradas de piedra rústica y el túnel verde formado por las copas de las tipas." },
    { url: "/tomo2_puente_centenario.jpg", caption: "Puente Centenario: Estructura de hormigón que cruza el cauce del Río Suquía." }
  ],
  "2-6": [
    { url: "/tomo2_parque_sarmiento.jpg", caption: "Parque Sarmiento: Vista del lago artificial y el Faro del Bicentenario." },
    { url: "/tomo2_el_panal.jpg", caption: "Centro Cívico (El Panal): Edificio gubernamental vanguardista con su fachada de figuras geométricas romboidales." }
  ],
  "2-7": [
    { url: "/tomo2_mercado_norte.jpg", caption: "Mercado Norte: Nave central con puestos tradicionales de carnes, verduras y comidas típicas." },
    { url: "/tomo2_cementerio_san_jeronimo.jpg", caption: "Cementerio San Jerónimo: Portón de ingreso neoclásico y senderos de mausoleos históricos." },
    { url: "/tomo2_barrio_guemes.jpg", caption: "Paseo de las Artes: Feria de artesanos y locales gastronómicos en las calles empedradas de Barrio Güemes." },
    { url: "/tomo2_alta_cordoba.jpg", caption: "Barrio Alta Córdoba: Estación de trenes Belgrano y antiguas casonas de estilo inglés." },
    { url: "/tomo2_cpc_arguello.jpg", caption: "CPC de Argüello: Diseño arquitectónico moderno de Miguel Ángel Roca con conos y columnas de colores." },
    { url: "/tomo2_museo_ciencias_naturales.jpg", caption: "Museo de Ciencias Naturales: Rampa helicoidal de exposición donde se aprecian réplicas de megafauna local." }
  ],

  // TOMO III: Cultura, Naturaleza y Tradiciones
  "3-1": [
    { url: "/tomo3_cerro_champaqui.jpg", caption: "Cerro Champaquí: Vista panorámica desde la cumbre más alta de la provincia y la Pampa de Achala." },
    { url: "/tomo3_rios_cordobeses.jpg", caption: "Ríos de las sierras de Córdoba: Aguas claras y ollas de piedra en ríos serranos." }
  ],
  "3-2": [
    { url: "/tomo3_reserva_natural_urbana.jpg", caption: "Reserva Natural Urbana San Martín: Sendero interpretativo rodeado de bosque nativo de Espinal." },
    { url: "/tomo3_fauna_autoctona.jpg", caption: "Fauna e infografía autóctona: El zorro gris, el cóndor andino y plantas serranas de peperina." }
  ],
  "3-3": [
    { url: "/tomo3_revista_hortensia.jpg", caption: "Revista Hortensia: Edición histórica de la revista cordobesa que retrató el humor y la picardía local." }
  ],
  "3-4": [
    { url: "/tomo3_estatua_marzano.jpg", caption: "Leonor Marzano: Estatua de bronce en honor a la creadora del característico ritmo del cuarteto cordobés." },
    { url: "/tomo3_bailes_cuarteto.jpg", caption: "Baile popular de cuarteto: La Mona Jiménez cantando frente a miles de personas en un show en vivo." }
  ],
  "3-5": [
    { url: "/tomo3_platos_tipicos.jpg", caption: "Comidas tradicionales cordobesas: Locro criollo bien pulsudo, empanadas y el clásico lomito cordobés." },
    { url: "/tomo3_alfajor_cordobes.jpg", caption: "Alfajor cordobés: Masa suave glaseada y relleno tradicional de dulce de leche o dulce de frutas serranas." },
    { url: "/tomo3_chacineria_caroya.jpg", caption: "Sótano de maduración: Salames caseros de Colonia Caroya colgados bajo condiciones artesanales." }
  ],
  "3-6": [
    { url: "/tomo3_cura_brochero.jpg", caption: "San José Gabriel Brochero (el cura gaucho): Monumento en Traslasierra recordando su labor social a caballo." },
    { url: "/tomo3_cerro_uritorco.jpg", caption: "Cerro Uritorco: Vista nocturna del místico cerro en las afueras de Capilla del Monte." }
  ],
  "3-7": [
    { url: "/tomo3_estadio_kempes.jpg", caption: "Estadio Mario Alberto Kempes: Vista aérea del imponente coliseo deportivo cordobés colmado de público." },
    { url: "/tomo3_atenas_basquet.jpg", caption: "Asociación Deportiva Atenas: Festejos del histórico equipo con Marcelo Milanesio levantando la copa." }
  ],
  "3-8": [
    { url: "/tomo3_cine_club_hugo_del_carril.jpg", caption: "Cine Club Municipal Hugo del Carril: Fachada de la institución impulsora del cine alternativo en la ciudad." },
    { url: "/tomo3_cuadros_fader.jpg", caption: "Pintura de Fernando Fader: Los paisajes de Loza Corral plasmados en óleos del célebre artista impresionista." }
  ],
  "3-10": [
    { url: "/tomo3_carnavales_san_vicente.jpg", caption: "Carnavales de San Vicente: Desfile tradicional de comparsas, murgas y disfraces coloridos." },
    { url: "/tomo3_pena_folklorica.jpg", caption: "Peña folklórica: Bailarines danzando chacarera al compás de guitarras y el bombo legüero." }
  ],

  // TOMO IV: Ciencia, Industria y Futuro
  "4-1": [
    { url: "/tomo4_pabellon_argentina_unc.jpg", caption: "Pabellón Argentina (UNC): Fachada principal y escalinatas del edificio central de la Ciudad Universitaria." }
  ],
  "4-2": [
    { url: "/tomo4_academia_ciencias.jpg", caption: "Academia Nacional de Ciencias: Histórico Salón de Honor neoclásico inaugurado bajo la presidencia de Sarmiento." },
    { url: "/tomo4_laboratorios_conicet.jpg", caption: "Laboratorio científico de Córdoba: Investigadores trabajando con microscopios y cultivos moleculares en el CONICET." }
  ],
  "4-3": [
    { url: "/tomo4_bosque_alegre.jpg", caption: "Estación Astrofísica de Bosque Alegre: Gran cúpula del telescopio reflector enclavada en las Sierras Chicas." },
    { url: "/tomo4_avion_pampa_fadea.jpg", caption: "Avión IA-63 Pampa III: Aeronave militar de entrenamiento y ataque ligero de diseño nacional fabricada por FAdeA." },
    { url: "/tomo4_conae_antenas.jpg", caption: "Centro Espacial Teófilo Tabanera (CONAE): Antenas satelitales gigantes que procesan imágenes de la Tierra en Falda del Cañete." }
  ],
  "4-4": [
    { url: "/tomo4_renault_santa_isabel.jpg", caption: "Fábrica Renault de Santa Isabel: Línea moderna automatizada de ensamble con robots industriales para camionetas." },
    { url: "/tomo4_fiat_ferreyra.jpg", caption: "Fábrica FIAT Ferreyra: Producción en serie de carrocerías del modelo Fiat Cronos, el auto más vendido del país." },
    { url: "/tomo4_volkswagen_cordoba.jpg", caption: "Volkswagen Centro Industrial Córdoba: Ensamblaje robótico de transmisiones automáticas para exportación mundial." }
  ],
  "4-5": [
    { url: "/tomo4_oficinas_software.jpg", caption: "Polo Tecnológico de Córdoba: Jóvenes profesionales programando en oficinas modernas de desarrollo de software." }
  ],
  "4-6": [
    { url: "/tomo4_patio_olmos.jpg", caption: "Patio Olmos Shopping: Fachada de arquitectura monumental iluminada de noche en la intersección de Vélez Sarsfield y San Juan." }
  ],
  "4-7": [
    { url: "/tomo4_palacio_municipal.jpg", caption: "Palacio Municipal 6 de Julio: Ejemplar de arquitectura pública brutalista de hormigón a la vista frente al Paseo de la Plaza de la Intendencia." },
    { url: "/tomo4_nueva_legislatura.jpg", caption: "Nueva Legislatura Unicameral de Córdoba: Edificación moderna de cristal y vigas de acero en las inmediaciones del río." }
  ],
  "4-8": [
    { url: "/tomo4_trolebus_electrico.jpg", caption: "Trolebús de Córdoba: Unidad eléctrica moderna de color rojo y blanco conectada a la red aérea de cables." }
  ],
  "4-10": [
    { url: "/tomo4_bajo_grande.jpg", caption: "Planta de Tratamiento de Bajo Grande: Grandes tanques sedimentadores y piletones de tratamiento biológico de líquidos cloacales." },
    { url: "/tomo4_centros_verdes.jpg", caption: "Centro Verde del Municipio: Operarios de cooperativas ambientales clasificando plásticos, vidrios y metales para reciclaje de economía circular." }
  ],

  // TOMO V: Cartografía y Cierre
  "5-1": [
    { url: "/tomo5_mapa_mudo_provincia.jpg", caption: "Mapa mudo de la Provincia de Córdoba: Base geográfica para identificar límites, departamentos y relieve serrano." },
    { url: "/tomo5_mapa_mudo_centro.jpg", caption: "Mapa mudo del microcentro cordobés: Trazado en damero para localizar iglesias, museos y edificios históricos." },
    { url: "/tomo5_mapa_mudo_estancias.jpg", caption: "Mapa de las Estancias Jesuíticas: Ubicación geográfica de los cinco núcleos productivos coloniales y la Manzana Jesuítica." }
  ],
  "5-3": [
    { url: "/tomo5_comparativa_barroco.jpg", caption: "Estilo Barroco Colonial: Detalle ornamental y cúpula de la Catedral y la Compañía de Jesús." },
    { url: "/tomo5_comparativa_belle_epoque.jpg", caption: "Estilo Belle Époque: Fachada e interiores inspirados en los palacios franceses del Palacio Ferreyra." },
    { url: "/tomo5_comparativa_neogótico.jpg", caption: "Estilo Neogótico: Agujas y torres caladas inspiradas en las catedrales medievales de la Iglesia de los Capuchinos." },
    { url: "/tomo5_comparativa_brutalismo.jpg", caption: "Estilo Brutalismo: Formas geométricas masivas de hormigón del Palacio Municipal de Córdoba." }
  ],
  "5-4": [
    { url: "/tomo5_faro_bicentenario_simbolo.jpg", caption: "Faro del Bicentenario: Monumento urbano helicoidal erigido como ícono contemporáneo en el Parque Sarmiento." }
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

const Tomo5Scoreboard: React.FC<{
  xp: number
  currentRank: string
  rankCls: string
}> = ({ xp, currentRank, rankCls }) => {
  return (
    <div className="space-y-8">
      {/* Círculo de progreso grande */}
      <div className="bg-gray-950/40 border border-white/10 rounded-2xl p-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Tu Experiencia Acumulada</h3>
        <div className="inline-flex flex-col items-center justify-center p-6 bg-amber-500/10 border border-amber-500/30 rounded-full w-40 h-40 shadow-inner mx-auto">
          <span className="text-3xl font-extrabold text-amber-400">{xp}</span>
          <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Puntos XP</span>
        </div>
        <p className="text-sm text-gray-300">
          Tu rango actual es: <strong className={rankCls}>{currentRank}</strong>
        </p>
      </div>

      {/* Rango cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`p-4 rounded-xl border transition-all ${xp >= 3500 ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5' : 'border-white/5 bg-white/5 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-400">3.500 a 4.000 XP</span>
            {xp >= 3500 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black uppercase tracking-wider">Desbloqueado</span>}
          </div>
          <h4 className="text-sm font-bold text-white">Gran Máster y Guardián</h4>
          <p className="text-xs text-gray-400 mt-1">El rango máximo. Eres el protector oficial de la memoria de la ciudad.</p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${xp >= 2500 && xp < 3500 ? 'border-blue-500/50 bg-blue-500/10 shadow-lg' : xp >= 3500 ? 'border-green-500/20 bg-green-500/5 opacity-70' : 'border-white/5 bg-white/5 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-blue-400">2.500 a 3.400 XP</span>
            {xp >= 2500 && xp < 3500 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500 text-white uppercase tracking-wider">Desbloqueado</span>}
          </div>
          <h4 className="text-sm font-bold text-white">Especialista e Investigador</h4>
          <p className="text-xs text-gray-400 mt-1">Has demostrado una comprensión sobresaliente del patrimonio local.</p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${xp >= 1500 && xp < 2500 ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg' : xp >= 2500 ? 'border-green-500/20 bg-green-500/5 opacity-70' : 'border-white/5 bg-white/5 opacity-50'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-400">1.500 a 2.400 XP</span>
            {xp >= 1500 && xp < 2500 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-black uppercase tracking-wider">Desbloqueado</span>}
          </div>
          <h4 className="text-sm font-bold text-white">Explorador Urbanista</h4>
          <p className="text-xs text-gray-400 mt-1">Vas por muy buen camino. Sigue explorando para conocer más secretos.</p>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${xp < 1500 ? 'border-gray-500 bg-gray-500/10' : 'border-green-500/20 bg-green-500/5 opacity-60'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400">Menos de 1.500 XP</span>
            {xp < 1500 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-500 text-white uppercase tracking-wider">Activo</span>}
          </div>
          <h4 className="text-sm font-bold text-white">Aprendiz del Patrimonio</h4>
          <p className="text-xs text-gray-400 mt-1">Estás comenzando tu viaje. Revisa las pistas de las preguntas para subir tu puntaje.</p>
        </div>
      </div>
    </div>
  )
}

const Tomo5Certificate: React.FC<{
  xp: number
  currentRank: string
  studentName: string
  setStudentName: (name: string) => void
}> = ({ xp, currentRank, studentName, setStudentName }) => {

  const handlePrint = () => {
    const name = studentName.trim() || "[ TU NOMBRE AQUÍ ]"
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Diploma — ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #fff;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 30px;
    }
    .diploma {
      width: 700px;
      border: 8px double #92400e;
      padding: 60px 80px;
      text-align: center;
      position: relative;
      background: #fff;
    }
    .corner { position: absolute; width: 36px; height: 36px; }
    .tl { top: 12px; left: 12px; border-top: 3px solid #b45309; border-left: 3px solid #b45309; }
    .tr { top: 12px; right: 12px; border-top: 3px solid #b45309; border-right: 3px solid #b45309; }
    .bl { bottom: 12px; left: 12px; border-bottom: 3px solid #b45309; border-left: 3px solid #b45309; }
    .br { bottom: 12px; right: 12px; border-bottom: 3px solid #b45309; border-right: 3px solid #b45309; }
    .trophy { font-size: 52px; margin-bottom: 18px; }
    .badge { font-size: 11px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #92400e; margin-bottom: 6px; }
    .main-title { font-size: 26px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 24px; }
    .intro { font-size: 13px; color: #444; font-style: italic; margin-bottom: 24px; }
    .name-block { border-bottom: 2px dashed #92400e; padding-bottom: 20px; margin-bottom: 24px; }
    .name { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; color: #1a1a1a; letter-spacing: 0.02em; }
    .body-text { font-size: 13px; line-height: 1.8; color: #333; max-width: 460px; margin: 0 auto 28px; }
    .org { font-weight: 900; display: block; margin-top: 6px; color: #1a1a1a; }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #ccc; padding-top: 20px; margin-bottom: 32px; text-align: left; }
    .stat-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #92400e; display: block; margin-bottom: 3px; }
    .stat-value { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #1a1a1a; }
    .footer { font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: #666; }
    @media print {
      body { padding: 0; min-height: auto; }
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  </style>
</head>
<body>
  <div class="diploma">
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
    <div class="trophy">🏆</div>
    <div class="badge">Reconocimiento Oficial — La Gran Enciclopedia de Córdoba</div>
    <div class="main-title">Diploma del Guardián del Saber</div>
    <p class="intro">Se otorga el presente reconocimiento y título de honor a:</p>
    <div class="name-block">
      <div class="name">${name}</div>
    </div>
    <p class="body-text">
      Por haber completado exitosamente todas las Misiones de Sabiduría de la
      <span class="org">GRAN ENCICLOPEDIA DE CÓRDOBA</span>
      demostrando excelencia, curiosidad por el patrimonio y amor por nuestra ciudad.
    </p>
    <div class="stats">
      <div>
        <span class="stat-label">Rango Obtenido</span>
        <span class="stat-value">${currentRank}</span>
      </div>
      <div>
        <span class="stat-label">Experiencia Total</span>
        <span class="stat-value">${xp} Puntos XP</span>
      </div>
    </div>
    <div class="footer">Comité de Córdoba Capital del Saber</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`)
    win.document.close()
  }

  return (
    <div className="space-y-8">
      {/* Entrada del nombre */}
      <div className="bg-gray-950/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <label className="block text-xs font-bold text-amber-400 uppercase tracking-widest">
          Ingresá tu nombre y apellido para el Diploma Oficial:
        </label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full bg-gray-950 border border-amber-500/30 rounded-xl px-4 py-3 text-white text-center text-lg placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
          placeholder="Escribí tu nombre completo aquí..."
        />
      </div>

      {/* Vista previa del Diploma */}
      <div className="relative bg-gradient-to-br from-amber-950/30 to-gray-950 border-4 border-double border-amber-500/50 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-2xl mx-auto overflow-hidden">
        <div className="absolute top-3 left-3 w-9 h-9 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg"></div>
        <div className="absolute top-3 right-3 w-9 h-9 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg"></div>
        <div className="absolute bottom-3 left-3 w-9 h-9 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg"></div>
        <div className="absolute bottom-3 right-3 w-9 h-9 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg"></div>

        <div className="text-5xl">🏆</div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-amber-500 tracking-[0.25em] uppercase block">
            Reconocimiento Oficial
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white uppercase tracking-wider">
            Diploma del Guardián del Saber
          </h2>
        </div>

        <p className="text-xs text-gray-400 italic">Se otorga el presente reconocimiento y título de honor a:</p>

        <div className="py-4 border-b-2 border-dashed border-amber-500/30">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-wide">
            {studentName.trim() || "[ TU NOMBRE AQUÍ ]"}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Por haber completado exitosamente todas las misiones de sabiduría de la{' '}
          <strong className="text-white">GRAN ENCICLOPEDIA DE CÓRDOBA</strong>,{' '}
          demostrando excelencia, curiosidad por el patrimonio y amor por nuestra ciudad.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-5 text-left max-w-md mx-auto border-t border-white/10">
          <div>
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Rango Obtenido</span>
            <span className="text-xs font-bold text-white uppercase">{currentRank}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">Experiencia Total</span>
            <span className="text-xs font-bold text-white">{xp} Puntos XP</span>
          </div>
        </div>

        <div className="text-[10px] text-gray-600 uppercase tracking-widest pt-4">
          Comité de Córdoba Capital del Saber
        </div>
      </div>

      {/* Botón de impresión */}
      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          disabled={!studentName.trim()}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <span>🖨️</span>
          <span>Imprimir / Guardar como PDF</span>
        </button>
      </div>
      {!studentName.trim() && (
        <p className="text-center text-xs text-gray-500">Ingresá tu nombre para habilitar el diploma.</p>
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
  const [questionStates, setQuestionStates] = useState<Record<string, {selected: string | null, revealed: boolean}>>({})
  const [studentName, setStudentName] = useState("")

  const getQState = (key: string) => questionStates[key] || {selected: null, revealed: false}
  const selectOpt = (key: string, letter: string) =>
    setQuestionStates(prev => ({...prev, [key]: {...(prev[key] || {selected: null, revealed: false}), selected: letter}}))
  const revealAns = (key: string) =>
    setQuestionStates(prev => ({...prev, [key]: {...(prev[key] || {selected: null, revealed: false}), revealed: true}}))


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

  const calculateTotalXP = () => {
    let total = 0
    chapters.forEach((cap, capIdx) => {
      if (cap.bloques) {
        cap.bloques.forEach((b, bIdx) => {
          if (b.type === 'pregunta') {
            const key = `${capIdx}-${bIdx}`
            const state = questionStates[key]
            if (state && state.revealed && state.selected === b.respuesta_correcta) {
              total += b.xp || 100
            }
          }
        })
      }
    })
    return total
  }

  const totalXP = calculateTotalXP()
  let currentRank = "APRENDIZ DEL PATRIMONIO CORDOBÉS"
  let rankCls = "text-gray-400 font-semibold"
  if (totalXP >= 3500) {
    currentRank = "GRAN MÁSTER PATRIMONIAL Y GUARDIÁN DE CÓRDOBA"
    rankCls = "text-amber-400 font-extrabold shadow-amber-500/10"
  } else if (totalXP >= 2500) {
    currentRank = "ESPECIALISTA E INVESTIGADOR DE LA CIUDAD"
    rankCls = "text-blue-400 font-bold"
  } else if (totalXP >= 1500) {
    currentRank = "EXPLORADOR URBANISTA EN DESARROLLO"
    rankCls = "text-emerald-400 font-semibold"
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
                <div className="space-y-6 text-gray-300 leading-relaxed font-sans text-base print:p-0">
                  {tomo.numero === 5 && activeChapter.orden === 8 ? (
                    <Tomo5Scoreboard xp={totalXP} currentRank={currentRank} rankCls={rankCls} />
                  ) : tomo.numero === 5 && activeChapter.orden === 9 ? (
                    <Tomo5Certificate xp={totalXP} currentRank={currentRank} studentName={studentName} setStudentName={setStudentName} />
                  ) : activeChapter.bloques && activeChapter.bloques.length > 0 ? (
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
                      } else if (bloque.type === 'pregunta') {
                        const qKey = `${activeChapterIndex}-${index}`
                        const qState = getQState(qKey)
                        const opciones = bloque.opciones || []
                        const respuesta = (bloque.respuesta_correcta || 'A').toUpperCase()
                        const xp = bloque.xp || 100

                        return (
                          <div key={index} className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 my-6 space-y-4 shadow-lg">
                            {/* Encabezado del desafío */}
                            <div className="flex items-center gap-2">
                              <Bookmark className="h-4 w-4 text-amber-400 flex-shrink-0" />
                              <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                                {renderFormattedText(bloque.title || 'Desafío', buscar)}
                              </h4>
                            </div>

                            {/* Enunciado */}
                            <p className="text-sm text-gray-200 font-medium leading-relaxed">
                              {renderFormattedText(bloque.pregunta || '', buscar)}
                            </p>

                            {/* Opciones clickeables */}
                            <div className="space-y-2">
                              {opciones.map((opt, optIdx) => {
                                const letter = opt.charAt(0).toUpperCase()
                                const texto = opt.slice(2).trim()
                                const isSelected = qState.selected === letter
                                const isCorrect = letter === respuesta
                                const showResult = qState.revealed

                                let cls = "w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all "
                                if (!showResult) {
                                  cls += isSelected
                                    ? "border-amber-500/60 bg-amber-500/15 text-amber-200 font-medium"
                                    : "border-white/10 bg-white/5 text-gray-300 hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer"
                                } else {
                                  if (isCorrect) cls += "border-green-500/50 bg-green-500/10 text-green-300"
                                  else if (isSelected) cls += "border-red-500/40 bg-red-500/10 text-red-300"
                                  else cls += "border-white/5 bg-transparent text-gray-600 opacity-60"
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => !qState.revealed && selectOpt(qKey, letter)}
                                    disabled={qState.revealed}
                                    className={cls}
                                  >
                                    <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                                      showResult && isCorrect ? 'border-green-400 text-green-400 bg-green-500/10' :
                                      showResult && isSelected && !isCorrect ? 'border-red-400 text-red-400 bg-red-500/10' :
                                      isSelected ? 'border-amber-400 text-amber-400 bg-amber-500/10' :
                                      'border-gray-600 text-gray-500'
                                    }`}>
                                      {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : letter}
                                    </span>
                                    <span>{renderFormattedText(texto, buscar)}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {/* Botón revelar */}
                            {!qState.revealed && (
                              <button
                                onClick={() => revealAns(qKey)}
                                className="w-full py-2.5 px-4 rounded-xl bg-gray-950/60 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase hover:bg-amber-500/10 hover:border-amber-500/60 transition-all flex items-center justify-center gap-2"
                              >
                                🔓 Revelar Respuesta
                              </button>
                            )}

                            {/* Resultado revelado */}
                            {qState.revealed && (
                              <div className="bg-gray-950/60 border border-green-500/20 rounded-xl p-4 space-y-1.5">
                                <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                                  <span>✓</span>
                                  <span>Respuesta Correcta: {respuesta} · +{xp} XP</span>
                                </p>
                                {bloque.explicacion && (
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    <span className="font-bold text-amber-400">Explicación: </span>
                                    {renderFormattedText(bloque.explicacion, buscar)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      } else if (bloque.type === 'curiosidad') {
                        const blockText = bloque.text || ""
                        const hasDetails = blockText.includes('<details>')
                        if (hasDetails) {
                          const detailsRegex = /<details>([\s\S]*?)<\/details>/i
                          const summaryRegex = /<summary>([\s\S]*?)<\/summary>/i
                          
                          const detailsMatch = blockText.match(detailsRegex)
                          const rawDetails = detailsMatch ? detailsMatch[1] : ""
                          
                          const summaryMatch = rawDetails.match(summaryRegex)
                          const summaryText = summaryMatch ? summaryMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "🔒 REVELAR RESPUESTA Y PUNTOS XP"
                          
                          const detailsContent = rawDetails.replace(summaryRegex, "").trim()
                          const mainText = blockText.replace(detailsRegex, "").trim()
                          
                          const formatCheckboxes = (txt: string) => {
                            return txt.replace(/- \[\s*\]/g, '☐').replace(/- \[x\]/g, '☑')
                          }
                          
                          return (
                            <div key={index} className="bg-amber-500/5 border-l-4 border-amber-500 p-5 rounded-r-xl my-6 space-y-3 shadow-sm">
                              <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                                <Bookmark className="h-3.5 w-3.5" />
                                <span>{renderFormattedText(bloque.title || 'Desafío', buscar)}</span>
                              </h4>
                              <div className="text-sm text-gray-300 m-0 leading-relaxed whitespace-pre-line font-sans">
                                {renderFormattedText(formatCheckboxes(mainText), buscar)}
                              </div>
                              
                              <details className="mt-4 bg-gray-950/60 border border-white/5 rounded-xl overflow-hidden transition-all group">
                                <summary className="px-4 py-3 font-bold text-xs text-amber-400 hover:text-amber-300 cursor-pointer list-none flex items-center justify-between select-none">
                                  <span className="flex items-center gap-2">
                                    <span>{summaryText}</span>
                                  </span>
                                  <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="px-4 pb-4 pt-2 text-sm text-gray-300 border-t border-white/5 bg-black/20 whitespace-pre-line">
                                  {renderFormattedText(detailsContent, buscar)}
                                </div>
                              </details>
                            </div>
                          )
                        }
                        
                        return (
                          <div key={index} className="bg-amber-500/5 border-l-4 border-amber-500 p-5 rounded-r-xl my-6 space-y-1 shadow-sm">
                            <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                              <Bookmark className="h-3.5 w-3.5" />
                              <span>{renderFormattedText(bloque.title || 'Sabías que...', buscar)}</span>
                            </h4>
                            <p className="text-sm text-gray-300 m-0 leading-relaxed whitespace-pre-line font-sans">
                              {renderFormattedText(bloque.text || '', buscar)}
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
