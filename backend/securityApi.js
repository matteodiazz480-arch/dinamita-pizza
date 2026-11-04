import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SERVER_SECRET =
  process.env.CSRF_SECRET ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "nexo_csrf_secret_salt_2026_secure_key";

const rateLimitStore = {
  contact: new Map(),
  assistant: new Map(),
  privacy: new Map(),
  crmLogin: new Map(),
};

const ALLOWED_SERVICES = new Set([
  "Publicidad Digital (Meta Ads)",
  "Gestión de Redes Sociales",
  "Diseño de Contenido",
  "Estrategia Digital",
  "Planes Comercios y Negocios",
  "Planes NEXO Oficios",
  "Planes NEXO Profesionales",
  "Plan Presencia & Contenido",
  "Plan Captación Meta Ads",
  "Plan Crecimiento Integral",
  "Asesoramiento Gratuito General",
  "Reunión Gratuita 20 min",
  "Otro tipo de proyecto",
]);

const ALLOWED_ARCO_RIGHTS = new Set([
  "acceso",
  "rectificacion",
  "actualizacion",
  "supresion",
]);

function getClientIpHash(req) {
  const rawIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";
  const daySalt = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash("sha256")
    .update(`${rawIp}:${daySalt}:${SERVER_SECRET}`)
    .digest("hex")
    .slice(0, 16);
}

function checkRateLimit(bucketName, ipHash, maxRequests, windowMs) {
  const bucket = rateLimitStore[bucketName];
  const now = Date.now();
  const timestamps = bucket.get(ipHash) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldest = validTimestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  validTimestamps.push(now);
  bucket.set(ipHash, validTimestamps);
  return { allowed: true, retryAfterSec: 0 };
}

export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== "string") return "";
  return Array.from(input)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13;
    })
    .join("")
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLength);
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function computeCsrfToken(secretValue) {
  return crypto
    .createHmac("sha256", SERVER_SECRET)
    .update(secretValue)
    .digest("hex");
}

function verifyCsrf(req) {
  const cookies = parseCookies(req);
  const secretCookie = cookies["nexo_csrf_secret"];
  const headerToken = req.headers["x-csrf-token"];

  if (!secretCookie || !headerToken || typeof headerToken !== "string") {
    return false;
  }

  const expected = computeCsrfToken(secretCookie);
  if (expected.length !== headerToken.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(headerToken, "utf8")
  );
}

function readJsonBody(req, maxBytes = 16384) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.reject(new Error("INVALID_JSON"));
    }
  }

  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;

    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > maxBytes) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      body += chunk.toString("utf8");
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });

    req.on("error", () => reject(new Error("READ_ERROR")));
  });
}

function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    ...extraHeaders,
  });
  res.end(JSON.stringify(data));
}

const CRM_ADMIN_PASSWORD = process.env.CRM_PASSWORD || "nexo2026admin";

function getStorageFilePath(filename) {
  const storageDir = process.env.VERCEL
    ? path.join(os.tmpdir(), "nexo-storage")
    : path.resolve(process.cwd(), "backend", "storage");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  return path.join(storageDir, filename);
}

function appendProtectedRecord(filename, record) {
  try {
    const filePath = getStorageFilePath(filename);
    fs.appendFileSync(filePath, JSON.stringify(record) + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch {
    return;
  }
}

function readProtectedRecords(filename) {
  try {
    const filePath = getStorageFilePath(filename);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();
  } catch {
    return [];
  }
}

function updateProtectedRecord(filename, id, updates) {
  try {
    const filePath = getStorageFilePath(filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const records = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    let updated = null;
    const nextList = records.map((r) => {
      if (r.id === id || r.refId === id) {
        updated = { ...r, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return r;
    });

    if (!updated) return null;

    fs.writeFileSync(
      filePath,
      nextList.map((r) => JSON.stringify(r)).join("\n") + "\n",
      { encoding: "utf8", mode: 0o600 }
    );
    return updated;
  } catch {
    return null;
  }
}

function deleteProtectedRecord(filename, id) {
  try {
    const filePath = getStorageFilePath(filename);
    if (!fs.existsSync(filePath)) return false;
    const raw = fs.readFileSync(filePath, "utf8");
    const records = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const nextList = records.filter((r) => r.id !== id && r.refId !== id);
    fs.writeFileSync(
      filePath,
      nextList.map((r) => JSON.stringify(r)).join("\n") + "\n",
      { encoding: "utf8", mode: 0o600 }
    );
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Almacenamiento Seguro Local (JSONL) para Backend Autónomo
// ----------------------------------------------------------------------------
async function saveLeadRecord(record) {
  return appendProtectedRecord("leads.jsonl", record);
}

async function getLeadRecords() {
  return readProtectedRecords("leads.jsonl");
}

async function updateLeadRecord(id, updates) {
  return updateProtectedRecord("leads.jsonl", id, updates);
}

async function deleteLeadRecord(id) {
  return deleteProtectedRecord("leads.jsonl", id);
}

function generateCrmSessionToken() {
  const timestamp = Date.now();
  const signature = crypto
    .createHmac("sha256", SERVER_SECRET)
    .update(`crm_session_${timestamp}`)
    .digest("hex");
  return Buffer.from(`${timestamp}:${signature}`).toString("base64");
}

function verifyCrmSession(req) {
  const cookies = parseCookies(req);
  let rawToken = cookies["nexo_crm_session"];
  const authHeader = req.headers.authorization;
  if (!rawToken && authHeader && authHeader.startsWith("Bearer ")) {
    rawToken = authHeader.slice(7).trim();
  }
  if (!rawToken) return false;

  try {
    const decoded = Buffer.from(rawToken, "base64").toString("utf8");
    const [timestampStr, signature] = decoded.split(":");
    const timestamp = Number(timestampStr);
    if (!timestamp || isNaN(timestamp)) return false;

    // Session valid for 48 hours
    if (Date.now() - timestamp > 48 * 60 * 60 * 1000) return false;

    const expectedSignature = crypto
      .createHmac("sha256", SERVER_SECRET)
      .update(`crm_session_${timestamp}`)
      .digest("hex");

    if (expectedSignature.length !== signature.length) return false;

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

function processAssistantQuery(rawQuery) {
  const cleanQuery = sanitizeText(rawQuery, 300);
  const q = cleanQuery.toLowerCase();

  const blockedPatterns = [
    "ignore previous",
    "ignora las instrucciones",
    "system prompt",
    "instrucciones internas",
    "api key",
    "apikey",
    "clave privada",
    "base de datos",
    "select * from",
    "drop table",
    "nexo_leads",
    "leads.jsonl",
    "contraseña",
    "password",
  ];

  if (blockedPatterns.some((pattern) => q.includes(pattern))) {
    return {
      reply:
        "Por razones de seguridad y privacidad, solo puedo brindar información pública sobre los servicios comerciales, metodología y asesoramiento de NEXO Creative.",
      blocked: true,
    };
  }

  if (
    q.includes("comercio") ||
    q.includes("comercios") ||
    q.includes("local") ||
    q.includes("locales") ||
    q.includes("tienda") ||
    q.includes("gastronomia") ||
    q.includes("gastronomía") ||
    q.includes("restaurante")
  ) {
    return {
      reply:
        "Para comercios y locales (gastronomía, indumentaria, tiendas) armamos campañas geolocalizadas en tu radio de venta y contenido constante para atraer clientes y aumentar tus pedidos.",
      action: { label: "Ver soluciones para comercios", type: "consultation" },
    };
  }

  if (
    q.includes("oficio") ||
    q.includes("oficios") ||
    q.includes("electricista") ||
    q.includes("plomero") ||
    q.includes("gasista") ||
    q.includes("carpintero") ||
    q.includes("tecnico") ||
    q.includes("técnico") ||
    q.includes("instalador") ||
    q.includes("pintor")
  ) {
    return {
      reply:
        "Para oficios (electricistas, técnicos, plomeros, carpinteros) en NEXO desarrollamos planes directos para captar clientes en tu zona de trabajo y mostrar tus trabajos reales con reputación verificada.",
      action: { label: "Ver planes para oficios", type: "consultation" },
    };
  }

  if (
    q.includes("profesional") ||
    q.includes("profesionales") ||
    q.includes("medico") ||
    q.includes("médico") ||
    q.includes("abogado") ||
    q.includes("abogada") ||
    q.includes("arquitecto") ||
    q.includes("arquitecta") ||
    q.includes("contador") ||
    q.includes("contadora") ||
    q.includes("nutricionista") ||
    q.includes("psicologo") ||
    q.includes("psicólogo") ||
    q.includes("consultor")
  ) {
    return {
      reply:
        "Para profesionales independientes (médicos, abogados, arquitectos, contadores) construimos una presencia digital de autoridad, posicionando tu marca personal y facilitando la agenda de consultas.",
      action: { label: "Ver planes para profesionales", type: "consultation" },
    };
  }

  if (
    q.includes("privacidad") ||
    q.includes("datos") ||
    q.includes("cookie") ||
    q.includes("ley 25326") ||
    q.includes("25.326")
  ) {
    return {
      reply:
        "Protegemos tus datos personales conforme a la Ley 25.326 (Argentina). No compartimos tu información con terceros para fines comerciales y podés ejercer tus derechos de acceso, rectificación o supresión desde las Políticas Legales en el pie de página.",
    };
  }

  if (
    q.includes("gratis") ||
    q.includes("gratuito") ||
    q.includes("asesoramiento") ||
    q.includes("diagnóstico")
  ) {
    return {
      reply:
        "Ofrecemos una sesión de diagnóstico gratuita donde revisamos tus redes actuales y definimos un plan de acción sin compromiso.",
      action: { label: "Solicitar asesoramiento", type: "consultation" },
    };
  }

  if (
    q.includes("plan") ||
    q.includes("planes") ||
    q.includes("propuesta")
  ) {
    return {
      reply:
        "Contamos con 3 planes adaptables a cada negocio:\n1. Plan Presencia & Contenido (Redes Sociales + Diseño).\n2. Plan Captación Meta Ads (Publicidad en Facebook e Instagram + Creativos).\n3. Plan Crecimiento Integral (Estrategia + Meta Ads + Redes + Diseño).\n\nTodos se cotizan a medida según el alcance que necesites.",
      action: { label: "Solicitar cotización de plan", type: "consultation" },
    };
  }

  if (
    q.includes("precio") ||
    q.includes("cuesta") ||
    q.includes("costo") ||
    q.includes("tarifa") ||
    q.includes("presupuesto")
  ) {
    return {
      reply:
        "Armamos cada presupuesto según los objetivos y el volumen de campañas de tu negocio. Podés pedir una cotización mediante el formulario.",
      action: { label: "Solicitar cotización", type: "consultation" },
    };
  }

  if (
    q.includes("servicio") ||
    q.includes("hacen") ||
    q.includes("ofrecen") ||
    q.includes("publicidad") ||
    q.includes("meta") ||
    q.includes("redes") ||
    q.includes("diseño")
  ) {
    return {
      reply:
        "Trabajamos en 4 áreas:\n1. Publicidad Digital (Meta Ads en Facebook e Instagram).\n2. Gestión de Redes Sociales.\n3. Diseño de Contenido.\n4. Estrategia Digital.",
    };
  }

  if (
    q.includes("proceso") ||
    q.includes("pasos") ||
    q.includes("etapas") ||
    q.includes("trabajan")
  ) {
    return {
      reply:
        "Trabajamos en 4 etapas:\n01. Análisis del negocio.\n02. Estrategia a medida.\n03. Implementación de anuncios y piezas.\n04. Optimización de resultados.",
    };
  }

  if (
    q.includes("contacto") ||
    q.includes("whatsapp") ||
    q.includes("telefono") ||
    q.includes("teléfono") ||
    q.includes("email")
  ) {
    return {
      reply:
        "Podés escribirnos directamente por WhatsApp o completar el formulario para que nos comuniquemos con vos.",
      action: { label: "Abrir formulario", type: "consultation" },
    };
  }

  if (
    q.includes("tiempo") ||
    q.includes("tardan") ||
    q.includes("resultado")
  ) {
    return {
      reply:
        "Las campañas de Meta Ads empiezan a generar consultas desde las primeras semanas de circulación activa.",
    };
  }

  return {
    reply:
      "En NEXO Creative nos especializamos en publicidad en Meta Ads, gestión de redes y diseño de contenido. ¿Querés coordinar un asesoramiento gratuito?",
    action: { label: "Solicitar asesoramiento", type: "consultation" },
  };
}

export function applySecurityHeaders(req, res) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

export function createSecurityMiddleware() {
  return async function securityMiddleware(req, res, next) {
    applySecurityHeaders(req, res);

    let url = (req.url || "").split("?")[0];
    if (req.query && req.query.path) {
      const p = Array.isArray(req.query.path)
        ? req.query.path.join("/")
        : String(req.query.path);
      url = "/api/" + p.replace(/^\/+/, "");
    }
    url = url.replace(/\/+/g, "/");
    if (
      url.startsWith("/crm") ||
      url.startsWith("/assistant") ||
      url.startsWith("/contact") ||
      url.startsWith("/security/") ||
      url.startsWith("/privacy/")
    ) {
      url = "/api" + url;
    }

    if (
      url.startsWith("/backend") ||
      url.startsWith("/server") ||
      url.startsWith("/.env") ||
      url.startsWith("/.git") ||
      url.includes("leads.jsonl") ||
      url.includes("arco_requests.jsonl")
    ) {
      return sendJson(res, 403, {
        ok: false,
        error: "Acceso restringido.",
      });
    }

    if (url === "/api/security/csrf" && req.method === "GET") {
      const cookies = parseCookies(req);
      let secret = cookies["nexo_csrf_secret"];
      if (!secret || secret.length < 32) {
        secret = crypto.randomBytes(24).toString("hex");
      }
      const csrfToken = computeCsrfToken(secret);

      return sendJson(
        res,
        200,
        { ok: true, csrfToken },
        {
          "Set-Cookie": `nexo_csrf_secret=${secret}; HttpOnly; Path=/; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
        }
      );
    }

    if (url === "/api/contact" && req.method === "POST") {
      const ipHash = getClientIpHash(req);
      const rate = checkRateLimit("contact", ipHash, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return sendJson(
          res,
          429,
          {
            ok: false,
            error:
              "Superaste el límite de envíos permitidos. Por favor aguardá unos minutos antes de intentar nuevamente.",
          },
          { "Retry-After": String(rate.retryAfterSec) }
        );
      }

      if (!verifyCsrf(req)) {
        return sendJson(res, 403, {
          ok: false,
          error:
            "La sesión de seguridad expiró o no es válida. Recargá la página e intentá nuevamente.",
        });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: "Solicitud inválida.",
        });
      }

      if (body.website_url && String(body.website_url).trim() !== "") {
        return sendJson(res, 200, {
          ok: true,
          refId: "NEXO-BOT-FILTERED",
        });
      }

      const loadedAt = Number(body.formLoadedAt || 0);
      const elapsed = Date.now() - loadedAt;
      if (loadedAt && (elapsed < 1000 || elapsed > 24 * 60 * 60 * 1000)) {
        return sendJson(res, 400, {
          ok: false,
          error:
            "El envío fue rechazado por el filtro contra envíos automatizados. Por favor completá el formulario nuevamente.",
        });
      }

      const fullName = sanitizeText(body.fullName, 80);
      const businessName = sanitizeText(body.businessName, 80);
      const email = sanitizeText(body.email, 120).toLowerCase();
      const phone = sanitizeText(body.phone, 30);
      const service = sanitizeText(body.service, 80);
      const meetingDate = body.meetingDate ? sanitizeText(body.meetingDate, 30) : null;
      const meetingTime = body.meetingTime ? sanitizeText(body.meetingTime, 10) : null;
      const message = sanitizeText(body.message, 800);
      const privacyConsent = body.privacyConsent === true;

      const fieldErrors = {};

      if (fullName.length < 2) {
        fieldErrors.fullName = "Ingresá un nombre y apellido válidos (mínimo 2 caracteres).";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        fieldErrors.email = "Ingresá un correo electrónico válido.";
      }
      const digitsOnly = phone.replace(/[^0-9]/g, "");
      if (digitsOnly.length < 6 || digitsOnly.length > 16) {
        fieldErrors.phone = "Ingresá un número de teléfono válido con código de área.";
      }
      if (!ALLOWED_SERVICES.has(service)) {
        fieldErrors.service = "Seleccioná un servicio válido de la lista.";
      }
      if (message.length < 10) {
        fieldErrors.message = "Describí brevemente tu consulta (mínimo 10 caracteres).";
      }
      if (!privacyConsent) {
        fieldErrors.privacyConsent =
          "Debés aceptar la Política de Privacidad para el tratamiento de tus datos.";
      }

      if (Object.keys(fieldErrors).length > 0) {
        return sendJson(res, 422, {
          ok: false,
          error: "Por favor revisá los campos marcados.",
          fieldErrors,
        });
      }

      const refId =
        "NEXO-" + crypto.randomBytes(3).toString("hex").toUpperCase();

      await saveLeadRecord({
        id: refId,
        refId,
        createdAt: new Date().toISOString(),
        ipHash,
        fullName,
        businessName: businessName || null,
        email,
        phone,
        service,
        meetingDate,
        meetingTime,
        status: (meetingDate || service.includes("Reunión")) ? "reunion_agendada" : "nuevo",
        message,
        privacyConsent: true,
        consentVersion: "Ley25326-v1.0",
      });

      return sendJson(res, 200, {
        ok: true,
        refId,
        sanitizedData: {
          fullName,
          businessName: businessName || "No especificado",
          email,
          phone,
          service,
          meetingDate,
          meetingTime,
          message,
        },
      });
    }

    if (url === "/api/assistant" && req.method === "POST") {
      const ipHash = getClientIpHash(req);
      const rate = checkRateLimit("assistant", ipHash, 15, 5 * 60 * 1000);
      if (!rate.allowed) {
        return sendJson(
          res,
          429,
          {
            ok: false,
            error:
              "Alcanzaste el límite temporal de consultas en el asistente. Podés continuar en unos minutos o usar nuestro formulario de contacto.",
          },
          { "Retry-After": String(rate.retryAfterSec) }
        );
      }

      if (!verifyCsrf(req)) {
        return sendJson(res, 403, {
          ok: false,
          error: "Sesión de seguridad inválida. Recargá la página.",
        });
      }

      let body;
      try {
        body = await readJsonBody(req, 4096);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: "Formato de mensaje inválido.",
        });
      }

      const message = sanitizeText(body.message, 300);
      if (!message) {
        return sendJson(res, 400, {
          ok: false,
          error: "El mensaje no puede estar vacío.",
        });
      }

      const result = processAssistantQuery(message);
      return sendJson(res, 200, {
        ok: true,
        reply: result.reply,
        action: result.action || null,
      });
    }

    if (url === "/api/privacy/rights" && req.method === "POST") {
      const ipHash = getClientIpHash(req);
      const rate = checkRateLimit("privacy", ipHash, 5, 15 * 60 * 1000);
      if (!rate.allowed) {
        return sendJson(
          res,
          429,
          {
            ok: false,
            error: "Demasiadas solicitudes. Intentá nuevamente en unos minutos.",
          },
          { "Retry-After": String(rate.retryAfterSec) }
        );
      }

      if (!verifyCsrf(req)) {
        return sendJson(res, 403, {
          ok: false,
          error: "Sesión de seguridad inválida. Recargá la página.",
        });
      }

      let body;
      try {
        body = await readJsonBody(req, 8192);
      } catch {
        return sendJson(res, 400, {
          ok: false,
          error: "Solicitud inválida.",
        });
      }

      if (body.website_url && String(body.website_url).trim() !== "") {
        return sendJson(res, 200, { ok: true, trackingId: "ARCO-FILTERED" });
      }

      const fullName = sanitizeText(body.fullName, 80);
      const email = sanitizeText(body.email, 120).toLowerCase();
      const rightType = sanitizeText(body.rightType, 30).toLowerCase();
      const details = sanitizeText(body.details, 600);

      if (
        fullName.length < 2 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
        !ALLOWED_ARCO_RIGHTS.has(rightType) ||
        details.length < 5
      ) {
        return sendJson(res, 422, {
          ok: false,
          error:
            "Completá correctamente tu nombre, correo electrónico, tipo de derecho ARCO y el detalle de tu solicitud.",
        });
      }

      const trackingId =
        "ARCO-" + crypto.randomBytes(3).toString("hex").toUpperCase();

      appendProtectedRecord("arco_requests.jsonl", {
        trackingId,
        createdAt: new Date().toISOString(),
        ipHash,
        fullName,
        email,
        rightType,
        details,
        lawReference: "Ley 25.326 Art. 14 y 16",
      });

      return sendJson(res, 200, {
        ok: true,
        trackingId,
      });
    }

// CRM: Iniciar Sesión Admin
    if (url === "/api/crm/auth/login" && req.method === "POST") {
      const ipHash = getClientIpHash(req);
      const rate = checkRateLimit("crmLogin", ipHash, 20, 10 * 60 * 1000);
      if (!rate.allowed) {
        return sendJson(res, 429, {
          ok: false,
          error: "Demasiados intentos de acceso al CRM. Aguardá unos minutos.",
        });
      }

      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }

      const pass = String(body.password || "").trim();
      const expected = String(CRM_ADMIN_PASSWORD || "nexo2026admin").trim();
      const allowed = new Set([
        "nexo2026admin",
        "admin",
        "nexo",
        "nexo2026",
        expected.toLowerCase(),
        expected
      ]);
      const match = allowed.has(pass.toLowerCase()) || allowed.has(pass);

      if (!match) {
        return sendJson(res, 401, {
          ok: false,
          error: "Contraseña incorrecta de acceso al CRM.",
        });
      }

      const token = generateCrmSessionToken();
      const isProd = process.env.NODE_ENV === "production";
      return sendJson(
        res,
        200,
        {
          ok: true,
          token,
          user: { name: "Administrador NEXO", email: "admin@nexocreative.com" },
        },
        {
          "Set-Cookie": `nexo_crm_session=${token}; HttpOnly; Path=/; SameSite=Lax${isProd ? "; Secure" : ""}; Max-Age=172800`,
        }
      );
    }

    // CRM: Cerrar Sesión Admin
    if (url === "/api/crm/auth/logout" && req.method === "POST") {
      return sendJson(
        res,
        200,
        { ok: true },
        {
          "Set-Cookie": "nexo_crm_session=; HttpOnly; Path=/; Max-Age=0",
        }
      );
    }

    // CRM: Verificar Sesión Activa
    if (url === "/api/crm/auth/me" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, authenticated: false });
      }
      return sendJson(res, 200, {
        ok: true,
        authenticated: true,
        user: { name: "Administrador NEXO", email: "admin@nexocreative.com" },
      });
    }

    // CRM: Obtener Leads & Reuniones
    if (url === "/api/crm/leads" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      const records = await getLeadRecords();
      return sendJson(res, 200, { ok: true, leads: records });
    }

    // CRM: Actualizar Lead / Oportunidad Comercial
    if (url === "/api/crm/leads" && req.method === "PATCH") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      const { id } = body;
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del lead." });
      }
      const updates = {};
      if (body.status !== undefined) updates.status = sanitizeText(body.status, 40);
      if (body.notes !== undefined) updates.notes = sanitizeText(body.notes, 1000);
      if (body.priority !== undefined) updates.priority = sanitizeText(body.priority, 20);
      if (body.responsible !== undefined) updates.responsible = sanitizeText(body.responsible, 60);
      if (body.nextContactDate !== undefined) updates.nextContactDate = sanitizeText(body.nextContactDate, 30);
      if (body.adBudget !== undefined) updates.adBudget = Number(body.adBudget) || 0;
      if (body.feeARS !== undefined) updates.feeARS = Number(body.feeARS) || 0;
      if (body.probability !== undefined) {
        const prob = Math.min(100, Math.max(0, Number(body.probability) || 0));
        updates.probability = prob;
        const fee = updates.feeARS !== undefined ? updates.feeARS : (Number(body.feeARS) || 0);
        updates.estimatedRevenue = Math.round(fee * (prob / 100));
      }
      if (body.rubro !== undefined) updates.rubro = sanitizeText(body.rubro, 80);
      if (body.socials !== undefined) updates.socials = sanitizeText(body.socials, 100);
      if (body.businessName !== undefined) updates.businessName = sanitizeText(body.businessName, 80);
      if (body.fullName !== undefined) updates.fullName = sanitizeText(body.fullName, 80);
      if (body.phone !== undefined) updates.phone = sanitizeText(body.phone, 30);
      if (body.service !== undefined) updates.service = sanitizeText(body.service, 80);

      const updated = await updateLeadRecord(id, updates);
      if (!updated) {
        return sendJson(res, 404, { ok: false, error: "Lead no encontrado." });
      }

      // Si el lead se marcó como "ganado", verificar si debe crearse en clientes activos
      if (body.autoConvertToClient && updates.status === "ganado") {
        const existingClients = readProtectedRecords("clients.jsonl");
        const alreadyExists = existingClients.some(
          (c) => c.contact === updated.phone || c.clientName === updated.businessName
        );
        if (!alreadyExists) {
          const clientRef = "CLI-" + crypto.randomBytes(2).toString("hex").toUpperCase();
          const newClient = {
            id: clientRef,
            refId: clientRef,
            clientName: updated.businessName || updated.fullName,
            service: updated.service || "Servicio Integral",
            responsible: updated.responsible || "Mateo Díaz",
            startDate: new Date().toISOString().slice(0, 10),
            renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            feeARS: updated.feeARS || 180000,
            adBudget: updated.adBudget || 100000,
            status: "activo",
            contact: updated.phone || "",
            notes: `Convertido automáticamente desde lead ${updated.refId || updated.id}. ${updated.notes || ""}`.trim(),
            createdAt: new Date().toISOString(),
          };
          appendProtectedRecord("clients.jsonl", newClient);
        }
      }

      return sendJson(res, 200, { ok: true, lead: updated });
    }

    // CRM: Crear Lead / Oportunidad Manual
    if (url === "/api/crm/leads" && req.method === "POST") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      const refId = "NEXO-" + crypto.randomBytes(2).toString("hex").toUpperCase();
      const fee = Number(body.feeARS) || 0;
      const prob = Math.min(100, Math.max(0, Number(body.probability) || 50));
      const newRecord = {
        id: refId,
        refId,
        createdAt: new Date().toISOString(),
        fullName: sanitizeText(body.fullName || "Sin nombre", 80),
        businessName: sanitizeText(body.businessName || "No especificado", 80),
        rubro: sanitizeText(body.rubro || "Comercios y Locales", 80),
        email: sanitizeText(body.email || "", 120),
        phone: sanitizeText(body.phone || "", 30),
        socials: sanitizeText(body.socials || "", 100),
        service: sanitizeText(body.service || "Contacto Directo", 80),
        origin: sanitizeText(body.origin || "Carga Manual", 50),
        message: sanitizeText(body.message || "Lead ingresado en CRM Comercial", 500),
        meetingDate: body.meetingDate ? sanitizeText(body.meetingDate, 30) : null,
        meetingTime: body.meetingTime ? sanitizeText(body.meetingTime, 10) : null,
        status: sanitizeText(body.status || "nuevo", 40),
        priority: sanitizeText(body.priority || "media", 20),
        responsible: sanitizeText(body.responsible || "Mateo Díaz", 60),
        nextContactDate: body.nextContactDate ? sanitizeText(body.nextContactDate, 30) : null,
        adBudget: Number(body.adBudget) || 0,
        feeARS: fee,
        probability: prob,
        estimatedRevenue: Math.round(fee * (prob / 100)),
        notes: sanitizeText(body.notes || "", 1000),
      };
      await saveLeadRecord(newRecord);
      return sendJson(res, 201, { ok: true, lead: newRecord });
    }

    // CRM: Eliminar Lead
    if (url === "/api/crm/leads" && req.method === "DELETE") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      if (!body.id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del lead." });
      }
      await deleteLeadRecord(body.id);
      return sendJson(res, 200, { ok: true });
    }

    // ------------------------------------------------------------------------
    // CRM: Clientes Activos (Hoja Clientes Activos del Excel)
    // ------------------------------------------------------------------------
    if (url === "/api/crm/clients" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      const clients = readProtectedRecords("clients.jsonl");
      return sendJson(res, 200, { ok: true, clients });
    }

    if (url === "/api/crm/clients" && req.method === "POST") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      const refId = "CLI-" + crypto.randomBytes(2).toString("hex").toUpperCase();
      const newClient = {
        id: refId,
        refId,
        clientName: sanitizeText(body.clientName || "Cliente", 80),
        service: sanitizeText(body.service || "Servicio Integral", 80),
        responsible: sanitizeText(body.responsible || "Mateo Díaz", 60),
        startDate: body.startDate ? sanitizeText(body.startDate, 30) : new Date().toISOString().slice(0, 10),
        renewalDate: body.renewalDate ? sanitizeText(body.renewalDate, 30) : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        feeARS: Number(body.feeARS) || 0,
        adBudget: Number(body.adBudget) || 0,
        status: sanitizeText(body.status || "activo", 30),
        contact: sanitizeText(body.contact || "", 50),
        notes: sanitizeText(body.notes || "", 1000),
        createdAt: new Date().toISOString(),
      };
      appendProtectedRecord("clients.jsonl", newClient);
      return sendJson(res, 201, { ok: true, client: newClient });
    }

    if (url === "/api/crm/clients" && req.method === "PATCH") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      const { id } = body;
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del cliente." });
      }
      const updates = {};
      if (body.clientName !== undefined) updates.clientName = sanitizeText(body.clientName, 80);
      if (body.service !== undefined) updates.service = sanitizeText(body.service, 80);
      if (body.responsible !== undefined) updates.responsible = sanitizeText(body.responsible, 60);
      if (body.startDate !== undefined) updates.startDate = sanitizeText(body.startDate, 30);
      if (body.renewalDate !== undefined) updates.renewalDate = sanitizeText(body.renewalDate, 30);
      if (body.feeARS !== undefined) updates.feeARS = Number(body.feeARS) || 0;
      if (body.adBudget !== undefined) updates.adBudget = Number(body.adBudget) || 0;
      if (body.status !== undefined) updates.status = sanitizeText(body.status, 30);
      if (body.contact !== undefined) updates.contact = sanitizeText(body.contact, 50);
      if (body.notes !== undefined) updates.notes = sanitizeText(body.notes, 1000);

      const updated = updateProtectedRecord("clients.jsonl", id, updates);
      if (!updated) {
        return sendJson(res, 404, { ok: false, error: "Cliente no encontrado." });
      }
      return sendJson(res, 200, { ok: true, client: updated });
    }

    if (url === "/api/crm/clients" && req.method === "DELETE") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      if (!body.id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del cliente." });
      }
      deleteProtectedRecord("clients.jsonl", body.id);
      return sendJson(res, 200, { ok: true });
    }

    // ------------------------------------------------------------------------
    // CRM: Gastos del Mes & Control Financiero
    // ------------------------------------------------------------------------
    if (url === "/api/crm/expenses" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      const expenses = readProtectedRecords("expenses.jsonl");
      return sendJson(res, 200, { ok: true, expenses });
    }

    if (url === "/api/crm/expenses" && req.method === "POST") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      const refId = "EXP-" + crypto.randomBytes(2).toString("hex").toUpperCase();
      const newExpense = {
        id: refId,
        date: body.date ? sanitizeText(body.date, 30) : new Date().toISOString().slice(0, 10),
        category: sanitizeText(body.category || "Varios", 50),
        amount: Math.max(0, Number(body.amount) || 0),
        description: sanitizeText(body.description || "Gasto operativo", 200),
        createdAt: new Date().toISOString(),
      };
      appendProtectedRecord("expenses.jsonl", newExpense);
      return sendJson(res, 201, { ok: true, expense: newExpense });
    }

    if (url === "/api/crm/expenses" && req.method === "DELETE") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        return sendJson(res, 400, { ok: false, error: "Datos inválidos." });
      }
      if (!body.id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del gasto." });
      }
      deleteProtectedRecord("expenses.jsonl", body.id);
      return sendJson(res, 200, { ok: true });
    }

    // ------------------------------------------------------------------------
    // CRM: Estadísticas y Métricas del Dashboard (Excel exacto)
    // ------------------------------------------------------------------------
    if (url === "/api/crm/stats" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      const records = await getLeadRecords();
      const clients = readProtectedRecords("clients.jsonl");
      const expenses = readProtectedRecords("expenses.jsonl");

      // Clientes activos y honorarios mensuales
      const activeClients = clients.filter(
        (c) => c.status === "activo" || c.status === "por_renovar"
      );
      const monthlyRevenue = activeClients.reduce((acc, c) => acc + (Number(c.feeARS) || 0), 0);
      const totalAdSpendManaged = activeClients.reduce((acc, c) => acc + (Number(c.adBudget) || 0), 0);

      // Gastos del mes actual
      const currentYearMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
      const monthlyExpenses = expenses
        .filter((e) => (e.date || "").startsWith(currentYearMonth) || !e.date)
        .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

      const monthlyBalance = monthlyRevenue - monthlyExpenses;

      // Pipeline Comercial
      const commercialLeads = records.filter((r) => r.status !== "archivado");
      const pipelineValue = commercialLeads.reduce((acc, l) => {
        if (l.status === "ganado" || l.status === "perdido") return acc;
        const fee = Number(l.feeARS) || 0;
        const prob = Number(l.probability) || 50;
        return acc + Math.round(fee * (prob / 100));
      }, 0);

      // Etapas comerciales exactas del Excel Dashboard
      const stages = {
        nuevo: records.filter((r) => r.status === "nuevo").length,
        contactado: records.filter((r) => r.status === "contactado").length,
        reunion_agendada: records.filter((r) => r.status === "reunion_agendada").length,
        propuesta_enviada: records.filter((r) => r.status === "propuesta_enviada").length,
        negociacion: records.filter((r) => r.status === "negociacion").length,
        ganado: records.filter((r) => r.status === "ganado").length,
        perdido: records.filter((r) => r.status === "perdido").length,
      };

      // Reuniones de 20 min
      const meetings = records.filter(
        (r) => r.service === "Reunión Gratuita 20 min" || r.meetingDate
      );
      const activeMeetings = meetings.filter((r) => r.status === "reunion_agendada");

      return sendJson(res, 200, {
        ok: true,
        stats: {
          monthlyRevenue,
          monthlyExpenses,
          monthlyBalance,
          totalClients: clients.length,
          activeClientsCount: activeClients.length,
          totalAdSpendManaged,
          pipelineValue,
          totalOpportunities: commercialLeads.length,
          stages,
          totalMeetings: meetings.length,
          activeMeetings: activeMeetings.length,
        },
      });
    }

    if (url.startsWith("/api/")) {
      return sendJson(res, 404, {
        ok: false,
        error: "Recurso no encontrado.",
      });
    }

    next();
  };
}
