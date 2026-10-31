export const NEXO_CONFIG = {
  brandName: "NEXO",
  brandSubtitle: "CREATIVE",
  editionYear: "2026",
  domain: "nexocreative.com",
  whatsappNumber: "+5491123456789",
  whatsappDefaultMessage:
    "Hola NEXO Creative, quiero consultar por asesoramiento para mi negocio.",

  socialLinks: {
    instagram:
      "https://www.instagram.com/nexocreative.agency?vrfl=OHhwbjF3cHBmbWxs&utm_source=qr",
    facebook: "https://www.facebook.com/share/1FtgTqarS2/?mibextid=wwXIfr",
  },

  navLinks: [
    { label: "Inicio", href: "#inicio" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Soluciones", href: "#servicios" },
    { label: "Planes", href: "#planes" },
    { label: "Proceso", href: "#proceso" },
    { label: "Proyectos", href: "#resultados" },
    { label: "Contacto", href: "#contacto" },
  ],

  hero: {
    fixedHeadline: "Hacemos crecer tu marca con",
    rotatingWords: [
      "Estrategia.",
      "Creatividad.",
      "Marketing.",
      "Identidad.",
      "Resultados.",
    ],
    description:
      "Estrategias digitales, creatividad y resultados reales para potenciar tu marca.",
    ctaText: "SOLICITAR ASESORAMIENTO",
    pills: [
      { icon: "Zap", text: "Más visibilidad" },
      { icon: "Users", text: "Más clientes" },
      { icon: "BarChart3", text: "Más ventas" },
      { icon: "Star", text: "Marca más fuerte" },
    ],
  },

  about: {
    title: "Conectamos ideas. Impulsamos negocios.",
    description:
      "En NEXO Creative ayudamos a negocios, marcas y emprendedores a fortalecer su presencia digital mediante publicidad efectiva, diseño y gestión de redes sociales.",
    highlightCard: {
      tag: "Tu negocio tiene potencial.",
      sub: "Nosotros lo hacemos destacar.",
    },
    cards: [
      {
        icon: "Shield",
        title: "Estrategias seguras",
        desc: "Gestión clara y transparente.",
        color: "purple",
      },
      {
        icon: "Handshake",
        title: "Trato cercano",
        desc: "Acompañamiento personalizado.",
        color: "neutral",
      },
      {
        icon: "Clock",
        title: "Respuesta rápida",
        desc: "Ejecución ágil en cada etapa.",
        color: "neutral",
      },
      {
        icon: "TrendingUp",
        title: "Crecimiento real",
        desc: "Foco en resultados medibles.",
        color: "purple",
      },
    ],
  },

  services: {
    title: "Soluciones para tu negocio",
    subtitle:
      "Resolvemos los principales obstáculos de comunicación y ventas de tu marca con acciones concretas.",
    items: [
      {
        id: "ads",
        number: "01",
        title: "Publicidad Digital (Meta Ads)",
        problemSolved: "¿Necesitás generar más consultas y ventas de forma constante?",
        description:
          "Campañas en Facebook e Instagram diseñadas para atraer clientes potenciales e impulsar tus ventas.",
        icon: "Megaphone",
        theme: "dark",
        badgeTheme: "lime",
      },
      {
        id: "social",
        number: "02",
        title: "Gestión de Redes Sociales",
        problemSolved: "¿Tus redes no tienen constancia ni una planificación clara?",
        description:
          "Planificación estratégica, publicación de contenido y gestión activa para el crecimiento de tu comunidad.",
        icon: "Instagram",
        theme: "light",
        badgeTheme: "purple",
      },
      {
        id: "design",
        number: "03",
        title: "Diseño de Contenido",
        problemSolved: "¿Tu imagen visual no refleja la calidad real de tu negocio?",
        description:
          "Contenido visual que refuerza la identidad de tu marca y conecta con tu público.",
        icon: "Palette",
        theme: "dark",
        badgeTheme: "lime",
      },
      {
        id: "strategy",
        number: "04",
        title: "Estrategia Digital",
        problemSolved: "¿Hacés acciones sueltas sin medir qué funciona realmente?",
        description:
          "Análisis, planificación y acciones enfocadas en resultados reales y medibles.",
        icon: "BarChart3",
        theme: "light",
        badgeTheme: "purple",
      },
    ],
  },

  plans: {
    title: "Nuestros planes",
    subtitle:
      "Propuestas estructuradas según la etapa y los objetivos comerciales de cada negocio.",
    items: [
      {
        id: "plan-presencia",
        code: "01",
        name: "Plan Presencia & Contenido",
        tagline: "Identidad visual y constancia en redes",
        description:
          "Pensado para marcas y negocios que buscan ordenar su comunicación visual y mantener presencia activa ante su comunidad.",
        priceInfo: "Cotización a medida",
        priceDetail: "Según volumen de publicaciones y canales activos",
        featured: false,
        includedServices: [
          "Gestión de Redes Sociales (planificación y calendario)",
          "Diseño de Contenido visual adaptado a tu marca",
          "Optimización visual de perfiles en Instagram y Facebook",
          "Acompañamiento personalizado y revisión mensual",
        ],
      },
      {
        id: "plan-captacion",
        code: "02",
        name: "Plan Captación Meta Ads",
        tagline: "Foco directo en consultas y nuevos clientes",
        description:
          "Orientado a comercios, profesionales y empresas que necesitan atraer consultas comerciales todos los días mediante publicidad digital.",
        priceInfo: "Cotización a medida",
        priceDetail: "Según objetivos de captación y alcance de campañas",
        featured: true,
        includedServices: [
          "Publicidad Digital en Meta Ads (Facebook e Instagram)",
          "Diseño de Contenido para piezas publicitarias",
          "Estrategia Digital de segmentación de público",
          "Optimización continua de campañas y métricas",
        ],
      },
      {
        id: "plan-integral",
        code: "03",
        name: "Plan Crecimiento Integral",
        tagline: "Gestión completa de marketing y publicidad",
        description:
          "La combinación completa de todos nuestros servicios para marcas que buscan delegar tanto sus redes como sus campañas de ventas.",
        priceInfo: "Cotización a medida",
        priceDetail: "Propuesta integral adaptada a la estructura del negocio",
        featured: false,
        includedServices: [
          "Estrategia Digital integral y planificación comercial",
          "Publicidad Digital (Meta Ads) para generación de ventas",
          "Gestión de Redes Sociales y crecimiento de comunidad",
          "Diseño de Contenido completo (orgánico y publicitario)",
        ],
      },
    ],
  },

  planFinder: {
    buttonLabel: "Encontrá tu plan ideal",
    buttonSub: "Respondé 3 preguntas breves para identificar qué propuesta se adapta mejor a tu negocio.",
    questions: [
      {
        id: "goal",
        title: "1. ¿Cuál es la prioridad principal de tu negocio hoy?",
        options: [
          {
            label: "Mejorar la imagen de mis redes y publicar con constancia",
            targetPlan: "plan-presencia",
          },
          {
            label: "Recibir más consultas directas y ventas con publicidad en Meta Ads",
            targetPlan: "plan-captacion",
          },
          {
            label: "Delegar tanto la gestión de redes como las campañas publicitarias",
            targetPlan: "plan-integral",
          },
        ],
      },
      {
        id: "stage",
        title: "2. ¿Cuál es tu situación actual en canales digitales?",
        options: [
          {
            label: "Publicamos de forma irregular y necesitamos diseño profesional",
            targetPlan: "plan-presencia",
          },
          {
            label: "Ya tenemos presencia base, pero necesitamos atraer clientes nuevos",
            targetPlan: "plan-captacion",
          },
          {
            label: "Queremos una estrategia completa que unifique contenido y anuncios",
            targetPlan: "plan-integral",
          },
        ],
      },
      {
        id: "focus",
        title: "3. ¿Qué servicio te interesa priorizar al comenzar?",
        options: [
          {
            label: "Gestión de Redes Sociales + Diseño de Contenido",
            targetPlan: "plan-presencia",
          },
          {
            label: "Publicidad Digital (Meta Ads) + Piezas para anuncios",
            targetPlan: "plan-captacion",
          },
          {
            label: "Los 4 servicios integrados (Estrategia, Meta Ads, Redes y Diseño)",
            targetPlan: "plan-integral",
          },
        ],
      },
    ],
  },

  freeConsultation: {
    title: "Asesoramiento gratuito para tu negocio",
    description:
      "Evaluamos tus canales actuales y conversamos sobre tus objetivos sin costo, para recomendarte qué acciones te conviene implementar según tu rubro.",
    points: [
      "Diagnóstico de tu presencia digital actual",
      "Propuesta de acción adaptada a tu negocio",
      "Presupuesto claro y sin compromiso",
    ],
    ctaText: "Solicitar asesoramiento gratuito",
  },

  process: {
    title: "Cómo trabajamos tu crecimiento",
    subtitle: "Metodología estructurada en cuatro pasos claros",
    steps: [
      {
        step: 1,
        number: "01",
        title: "Análisis",
        desc: "Conocemos tu negocio, tu público y tus objetivos comerciales.",
        accent: "lime",
      },
      {
        step: 2,
        number: "02",
        title: "Estrategia",
        desc: "Diseñamos un plan de acción a medida para tu marca.",
        accent: "lime",
      },
      {
        step: 3,
        number: "03",
        title: "Implementación",
        desc: "Creamos las piezas visuales y activamos las campañas.",
        accent: "lime",
      },
      {
        step: 4,
        number: "04",
        title: "Optimización",
        desc: "Analizamos métricas y ajustamos para mejorar los resultados.",
        accent: "purple",
      },
    ],
  },

  results: {
    title: "Resultados e impacto real",
    subtitle:
      "Métricas concretas obtenidas mediante campañas en Meta Ads, contenido estratégico y optimización continua.",
    stats: [
      {
        tag: "CAMPAÑAS",
        tagType: "purple",
        title: "MÁS CLIENTES PARA TU NEGOCIO",
        metric: "+320%",
        footer: "en consultas",
      },
      {
        tag: "ALCANCE",
        tagType: "lime",
        title: "TU MARCA EN TODAS PARTES",
        metric: "+280%",
        footer: "en ventas",
      },
    ],
  },

  faq: {
    title: "Resolvemos tus dudas antes de empezar",
    items: [
      {
        id: 1,
        question: "¿Cuánto tiempo tardan en verse resultados?",
        answer:
          "Las campañas publicitarias generan consultas e impacto medible desde las primeras semanas activas.",
      },
      {
        id: 2,
        question: "¿Qué información necesitan para empezar?",
        answer:
          "Conocer tus objetivos comerciales, a qué público apuntás y el material visual base de tu marca.",
      },
      {
        id: 3,
        question: "¿Trabajan con negocios de cualquier rubro?",
        answer:
          "Sí, adaptamos la estrategia a comercios, empresas de servicios, marcas y emprendimientos.",
      },
      {
        id: 4,
        question: "¿Incluye el diseño de las publicaciones?",
        answer:
          "Sí, diseñamos todas las piezas gráficas y creativos necesarios para tus anuncios y redes.",
      },
    ],
  },

  cta: {
    title: "¿Listo para potenciar tu negocio?",
    description:
      "Tu próximo cliente puede estar buscando lo que ofrecés. Hablemos de tu proyecto y descubramos cómo impulsar tu presencia digital.",
    buttonText: "SOLICITAR ASESORAMIENTO",
  },

  footer: {
    servicesList: "Publicidad Digital · Redes Sociales · Diseño · Estrategia",
    copyright: "© 2026 NEXO Creative. Todos los derechos reservados.",
  },
};

export const getWhatsAppUrl = (
  message = NEXO_CONFIG.whatsappDefaultMessage
) => {
  const cleanPhone = NEXO_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
