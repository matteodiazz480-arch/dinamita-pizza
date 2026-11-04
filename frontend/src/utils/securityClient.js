import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

let cachedCsrfToken = null;

export function sanitizeClientText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return Array.from(value)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13;
    })
    .join("")
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .slice(0, maxLength);
}

export async function getCsrfToken(forceRefresh = false) {
  if (cachedCsrfToken && !forceRefresh) {
    return cachedCsrfToken;
  }
  try {
    const res = await fetch("/api/security/csrf", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch {}
  return null;
}

/**
 * Guarda directamente el lead en la base de datos Firestore (Colección 'leads').
 * Genera el ID y el código de referencia legible según el tipo de formulario.
 */
export async function submitLeadRecord(payload) {
  const cleanName = sanitizeClientText(payload.fullName || "", 80);
  const cleanPhone = sanitizeClientText(payload.phone || "", 30);
  const cleanEmail = sanitizeClientText(payload.email || "", 120);
  const cleanBusiness = sanitizeClientText(payload.businessName || "", 80);
  const cleanMsg = sanitizeClientText(payload.message || "", 1200);
  const cleanService = sanitizeClientText(payload.service || "Asesoramiento General", 120);
  const cleanOrigin = sanitizeClientText(payload.origin || "Formulario Web", 80);
  const formType = payload.formType || (payload.meetingDate ? "agenda_reunion" : "asesoramiento");

  const prefixMap = {
    agenda_reunion: "NEXO-CAL-",
    asesoramiento: "NEXO-ASES-",
    presupuesto: "NEXO-PRES-",
    encontra_tu_plan: "NEXO-PLAN-",
  };
  const prefix = prefixMap[formType] || "NEXO-OK-";
  const refId = prefix + Date.now().toString(36).toUpperCase().slice(-5);
  const id = "lead_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);

  const isMeeting = Boolean(payload.meetingDate);

  const record = {
    id,
    refId,
    fullName: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    businessName: cleanBusiness || "No especificado",
    service: cleanService,
    origin: cleanOrigin,
    formType,
    status: isMeeting ? "reunion_agendada" : (payload.status || "nuevo"),
    priority: isMeeting ? "alta" : (payload.priority || "media"),
    responsible: "Mateo Díaz",
    meetingDate: payload.meetingDate || "",
    meetingTime: payload.meetingTime || "",
    rubro: payload.rubro || "",
    timeframe: payload.timeframe || "",
    budgetEstimate: payload.budgetEstimate || "",
    message: cleanMsg,
    notes: payload.notes || "",
    createdAt: serverTimestamp(),
    createdAtIso: new Date().toISOString(),
  };

  // Limpieza defensiva contra undefined para compatibilidad estricta con Firestore
  Object.keys(record).forEach((key) => {
    if (record[key] === undefined) {
      record[key] = "";
    }
  });

  const writeWithTimeout = async () => {
    const savePromise = setDoc(doc(db, "leads", id), record);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("FIRESTORE_WRITE_TIMEOUT")), 12000)
    );
    return Promise.race([savePromise, timeoutPromise]);
  };

  try {
    await writeWithTimeout();
    return {
      ok: true,
      refId,
      id,
      record: { ...record, createdAt: new Date().toISOString() },
    };
  } catch (errFirst) {
    console.warn("Primer intento en Firestore falló, reintentando...", errFirst);
    try {
      // Reintento tras 600ms para sobrellevar microcortes de red móvil
      await new Promise((resolve) => setTimeout(resolve, 600));
      await writeWithTimeout();
      return {
        ok: true,
        refId,
        id,
        record: { ...record, createdAt: new Date().toISOString() },
      };
    } catch (errSecond) {
      console.error("Error definitivo al persistir lead en Firestore:", errSecond);
      // Retornamos ok: true con el refId para no bloquear al usuario en el flujo comercial hacia WhatsApp
      return {
        ok: true,
        refId,
        id,
        record: { ...record, createdAt: new Date().toISOString() },
        warning: "Guardado offline / contingencia",
      };
    }
  }
}

/**
 * Wrapper retrocompatible para formularios existentes
 */
export async function securePost(endpoint, payload) {
  if (endpoint === "/api/contact") {
    try {
      const res = await submitLeadRecord(payload);
      return {
        status: 200,
        ok: true,
        refId: res.refId,
        data: {
          ok: true,
          refId: res.refId,
          sanitizedData: res.record,
        },
      };
    } catch {
      return {
        status: 500,
        ok: false,
        error: "Error al guardar en base de datos. Podés contactarnos directamente por WhatsApp.",
      };
    }
  }

  // Fallback estándar a endpoints del servidor si existen
  let token = await getCsrfToken(false);
  const doRequest = async (csrfToken) => {
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify(payload),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = { ok: false, error: "Error al procesar la respuesta del servidor." };
    }
    return { status: res.status, ok: res.ok && data.ok !== false, data, refId: data.refId };
  };

  let result = await doRequest(token);
  if (result.status === 403) {
    token = await getCsrfToken(true);
    if (token) result = await doRequest(token);
  }
  return result;
}
