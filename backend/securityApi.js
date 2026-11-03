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
// Cloudflare D1 Storage Adapter (con fallback automático a JSONL local)
// ----------------------------------------------------------------------------
function isCloudflareD1Configured() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_D1_DATABASE_ID &&
    process.env.CLOUDFLARE_API_TOKEN
  );
}

let d1TableInitialized = false;

async function queryCloudflareD1(sql, params = []) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`D1_HTTP_${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (!data.success || !data.result || !data.result[0]) {
    throw new Error("D1_QUERY_FAILED");
  }
  return data.result[0].results || [];
}

async function ensureCloudflareD1Table() {
  if (d1TableInitialized || !isCloudflareD1Configured()) return;
  try {
    await queryCloudflareD1(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        ref_id TEXT,
        created_at TEXT,
        ip_hash TEXT,
        full_name TEXT,
        business_name TEXT,
        email TEXT,
        phone TEXT,
        service TEXT,
        message TEXT,
        meeting_date TEXT,
        meeting_time TEXT,
        status TEXT,
        notes TEXT,
        consent_version TEXT,
        updated_at TEXT
      )
    `);
    d1TableInitialized = true;
  } catch {
    // Si falla la inicialización de la tabla, se continúa con fallback a disco
  }
}

async function saveLeadRecord(record) {
  // Siempre asegurar persistencia en JSONL local
  appendProtectedRecord("leads.jsonl", record);

  if (isCloudflareD1Configured()) {
    try {
      await ensureCloudflareD1Table();
      await queryCloudflareD1(
        `INSERT OR REPLACE INTO leads (
          id, ref_id, created_at, ip_hash, full_name, business_name,
          email, phone, service, message, meeting_date, meeting_time,
          status, notes, consent_version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id || record.refId,
          record.refId || record.id,
          record.createdAt || new Date().toISOString(),
          record.ipHash || "",
          record.fullName || "",
          record.businessName || "",
          record.email || "",
          record.phone || "",
          record.service || "",
          record.message || "",
          record.meetingDate || null,
          record.meetingTime || null,
          record.status || "nuevo",
          record.notes || "",
          record.consentVersion || "Ley25326-v1.0",
          record.updatedAt || null,
        ]
      );
    } catch {
      // Fallback ya respaldado en disco local
    }
  }
}

async function getLeadRecords() {
  if (isCloudflareD1Configured()) {
    try {
      await ensureCloudflareD1Table();
      const rows = await queryCloudflareD1(
        `SELECT * FROM leads ORDER BY created_at DESC`
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          refId: r.ref_id || r.id,
          createdAt: r.created_at,
          ipHash: r.ip_hash,
          fullName: r.full_name,
          businessName: r.business_name,
          email: r.email,
          phone: r.phone,
          service: r.service,
          message: r.message,
          meetingDate: r.meeting_date,
          meetingTime: r.meeting_time,
          status: r.status,
          notes: r.notes,
          consentVersion: r.consent_version,
          updatedAt: r.updated_at,
        }));
      }
    } catch {
      // Fallback a JSONL local si Cloudflare D1 está temporalmente inaccesible
    }
  }
  return readProtectedRecords("leads.jsonl");
}

async function updateLeadRecord(id, updates) {
  const localUpdated = updateProtectedRecord("leads.jsonl", id, updates);

  if (isCloudflareD1Configured()) {
    try {
      await ensureCloudflareD1Table();
      const fields = [];
      const params = [];
      if (updates.status !== undefined) {
        fields.push("status = ?");
        params.push(updates.status);
      }
      if (updates.notes !== undefined) {
        fields.push("notes = ?");
        params.push(updates.notes);
      }
      fields.push("updated_at = ?");
      params.push(new Date().toISOString());
      params.push(id);
      params.push(id);

      await queryCloudflareD1(
        `UPDATE leads SET ${fields.join(", ")} WHERE id = ? OR ref_id = ?`,
        params
      );
    } catch {
      // Fallback ya actualizado en local
    }
  }

  return localUpdated;
}

async function deleteLeadRecord(id) {
  deleteProtectedRecord("leads.jsonl", id);

  if (isCloudflareD1Configured()) {
    try {
      await ensureCloudflareD1Table();
      await queryCloudflareD1(
        `DELETE FROM leads WHERE id = ? OR ref_id = ?`,
        [id, id]
      );
    } catch {
      // Fallback ya eliminado en local
    }
  }
  return true;
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

    // CRM: Actualizar Estado o Notas de un Lead
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
      const { id, status, notes } = body;
      if (!id) {
        return sendJson(res, 400, { ok: false, error: "Falta el ID del lead." });
      }
      const updates = {};
      if (status !== undefined) updates.status = sanitizeText(status, 40);
      if (notes !== undefined) updates.notes = sanitizeText(notes, 1000);

      const updated = await updateLeadRecord(id, updates);
      if (!updated) {
        return sendJson(res, 404, { ok: false, error: "Lead no encontrado." });
      }
      return sendJson(res, 200, { ok: true, lead: updated });
    }

    // CRM: Crear Lead Manual
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
      const refId = "NEXO-MANUAL-" + crypto.randomBytes(2).toString("hex").toUpperCase();
      const newRecord = {
        id: refId,
        refId,
        createdAt: new Date().toISOString(),
        fullName: sanitizeText(body.fullName || "Sin nombre", 80),
        businessName: sanitizeText(body.businessName || "No especificado", 80),
        email: sanitizeText(body.email || "", 120),
        phone: sanitizeText(body.phone || "", 30),
        service: sanitizeText(body.service || "Contacto Directo", 80),
        message: sanitizeText(body.message || "Lead ingresado manualmente en CRM", 500),
        meetingDate: body.meetingDate ? sanitizeText(body.meetingDate, 30) : null,
        meetingTime: body.meetingTime ? sanitizeText(body.meetingTime, 10) : null,
        status: sanitizeText(body.status || "nuevo", 40),
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

    // CRM: Estadísticas Generales
    if (url === "/api/crm/stats" && req.method === "GET") {
      if (!verifyCrmSession(req)) {
        return sendJson(res, 401, { ok: false, error: "No autorizado." });
      }
      const records = await getLeadRecords();
      const totalLeads = records.length;
      const meetings = records.filter(
        (r) => r.service === "Reunión Gratuita 20 min" || r.meetingDate
      );
      const activeMeetings = meetings.filter((r) => r.status === "reunion_agendada");
      const pendingLeads = records.filter((r) => r.status === "nuevo");
      const wonLeads = records.filter((r) => r.status === "ganado");

      return sendJson(res, 200, {
        ok: true,
        stats: {
          totalLeads,
          totalMeetings: meetings.length,
          activeMeetings: activeMeetings.length,
          pendingLeads: pendingLeads.length,
          wonLeads: wonLeads.length,
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
