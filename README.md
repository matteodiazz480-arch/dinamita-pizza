# NEXO CREATIVE — Agencia de Marketing & Comunicación Digital

Sitio web corporativo e interactivo de **NEXO CREATIVE**, diseñado con estética editorial dark-luxury, animaciones fluidas y arquitectura separada en **Frontend** y **Backend**.

---

## Estructura del Proyecto

```text
proyecto/
├── frontend/
│   ├── index.html                  # Documento principal HTML5 y metadatos SEO
│   ├── public/
│   │   └── _headers                # Cabeceras HTTP de seguridad (CSP, HSTS, XFO)
│   └── src/
│       ├── assets/                 # Imágenes editoriales optimizadas
│       ├── components/             # Secciones y componentes UI interactivos
│       ├── data/                   # Datos estructurados (servicios, planes, proceso, legales)
│       ├── utils/                  # Clientes de seguridad CSRF, consentimiento y audio
│       ├── App.jsx                 # Orquestador principal de la aplicación
│       ├── index.css               # Sistema de diseño y utilidades Tailwind CSS v4
│       └── main.jsx                # Punto de entrada React 19
├── backend/
│   ├── securityApi.js              # Middleware API (CSRF HMAC, Rate Limiting, Sanitización, ARCO)
│   └── server.js                   # Servidor HTTP autónomo para los endpoints /api/*
├── package.json                    # Scripts y dependencias del proyecto
├── vite.config.js                  # Configuración de compilación y servidor Vite
├── vercel.json                     # Reglas de cabeceras de seguridad para despliegue
├── netlify.toml                    # Configuración de publicación estática y redirecciones
└── README.md                       # Documentación general del proyecto
```

---

## Características Principales

- **Diseño Mobile-First & Responsive**: Navegación con indicador animado (`GooeyNav`) en escritorio y barra inferior adaptada a dispositivos móviles, selector interactivo de planes en pantallas pequeñas y composiciones visuales sin bordes con esquinas redondeadas.
- **Animaciones de Aparición**: Transiciones sutiles y progresivas con `framer-motion` que respetan la preferencia `prefers-reduced-motion` del sistema operativo.
- **Seguridad y Privacidad (Ley 25.326)**:
  - Tokens CSRF firmados con `HMAC-SHA256` mediante cookies `HttpOnly` + `SameSite=Strict`.
  - Limitación de tasa (*Sliding-Window Rate Limiting*) por hash de IP anonimizado.
  - Sanitización estricta de entradas, filtro anti-bots (*honeypot* + validación de tiempo humano) y cabeceras `Content-Security-Policy`.
  - Gestión granular de cookies y ejercicio de derechos ARCO.

---

## Requisitos e Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar el entorno de desarrollo (Frontend + Backend API integrados):

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

4. Ejecutar verificación de código (linter):

```bash
npm run lint
```
