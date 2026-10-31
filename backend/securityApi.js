import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const SERVER_SECRET =
  process.env.CSRF_SECRET || crypto.randomBytes(32).toString("hex");

const rateLimitStore = {
  contact: new Map(),
  assistant: new Map(),
  privacy: new Map(),
};

const ALLOWED_SERVICES = new Set([
  "Publicidad Digital (Meta Ads)",
  "Gestión de Redes Sociales",
  "Diseño de Contenido",
  "Estrategia Digital",
  "Plan Presencia & Contenido",
  "Plan Captación Meta Ads",
  "Plan Crecimiento Integral",
  "Asesoramiento Gratuito General",
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

function appendProtectedRecord(filename, record) {
  try {
    const storageDir = path.resolve(process.cwd(), "backend", "storage");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    const filePath = path.join(storageDir, filename);
    fs.appendFileSync(filePath, JSON.stringify(record) + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch {
    return;
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

    const url = (req.url || "").split("?")[0];

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
          "Set-Cookie": `nexo_csrf_secret=${secret}; HttpOnly; Path=/; SameSite=Strict`,
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
      if (!loadedAt || elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) {
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

      appendProtectedRecord("leads.jsonl", {
        refId,
        createdAt: new Date().toISOString(),
        ipHash,
        fullName,
        businessName: businessName || null,
        email,
        phone,
        service,
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

    if (url.startsWith("/api/")) {
      return sendJson(res, 404, {
        ok: false,
        error: "Recurso no encontrado.",
      });
    }

    next();
  };
}
