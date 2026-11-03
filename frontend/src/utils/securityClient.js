import { db } from "./firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

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
      headers: {
        Accept: "application/json",
      },
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

export async function securePost(endpoint, payload) {
  // Manejo de guardado directo a Firestore para formularios de contacto y agenda
  if (endpoint === "/api/contact") {
    try {
      const cleanName = sanitizeClientText(payload.fullName || "", 80);
      const cleanPhone = sanitizeClientText(payload.phone || "", 30);
      const cleanEmail = sanitizeClientText(payload.email || "", 120);
      const cleanBusiness = sanitizeClientText(payload.businessName || "", 80);
      const cleanMsg = sanitizeClientText(payload.message || "", 800);
      const isBooking = Boolean(payload.meetingDate);

      const refId = (isBooking ? "NEXO-CAL-" : "NEXO-OK-") + Date.now().toString(36).toUpperCase().slice(-5);
      const id = "lead_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);

      const record = {
        id,
        refId,
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        businessName: cleanBusiness || "No especificado",
        service: payload.service || "Asesoramiento Gratuito",
        origin: isBooking ? "Reunión 20 min Web" : "Formulario Web",
        status: isBooking ? "reunion_agendada" : "nuevo",
        priority: isBooking ? "alta" : "media",
        responsible: "Mateo Díaz",
        meetingDate: payload.meetingDate || "",
        meetingTime: payload.meetingTime || "",
        message: cleanMsg,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "leads", id), record);

      return {
        status: 200,
        ok: true,
        refId,
        data: {
          ok: true,
          refId,
          sanitizedData: record,
        },
      };
    } catch (err) {
      console.warn("Error guardando en Firestore, intentando endpoint local:", err);
    }
  }

  // Fallback estándar a API backend
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
    if (token) {
      result = await doRequest(token);
    }
  }

  return result;
}
