import { db } from "../utils/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Clave de acceso administrativa inmutable
const CRM_PASS = "nexo2026admin";

export async function crmLogin(usernameOrPassword, maybePassword) {
  let user = "admin";
  let pass = "";

  if (maybePassword !== undefined) {
    user = (usernameOrPassword || "").trim();
    pass = (maybePassword || "").trim();
  } else {
    pass = (usernameOrPassword || "").trim();
  }

  if (!pass) {
    return { ok: false, error: "Por favor ingresá tu contraseña de acceso." };
  }

  if (pass === CRM_PASS) {
    sessionStorage.setItem("nexo_crm_auth", "true");
    sessionStorage.setItem("nexo_crm_user", user || "admin");
    return {
      ok: true,
      user: {
        role: "admin",
        name: user ? user.charAt(0).toUpperCase() + user.slice(1) : "Administrador",
      },
    };
  }
  return { ok: false, error: "Contraseña incorrecta. Verificá las credenciales de acceso." };
}

export async function crmLogout() {
  sessionStorage.removeItem("nexo_crm_auth");
  sessionStorage.removeItem("nexo_crm_user");
  return { ok: true };
}

export async function crmCheckAuth() {
  const isAuth = sessionStorage.getItem("nexo_crm_auth") === "true";
  const user = sessionStorage.getItem("nexo_crm_user") || "Administrador";
  return { ok: true, authenticated: isAuth, user: { role: "admin", name: user } };
}

function parseLeadDoc(d) {
  const data = d.data() || {};
  let createdStr = new Date().toISOString();
  if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    try {
      createdStr = data.createdAt.toDate().toISOString();
    } catch {}
  } else if (typeof data.createdAt === "string" && data.createdAt) {
    createdStr = data.createdAt;
  } else if (typeof data.createdAt === "number") {
    try {
      createdStr = new Date(data.createdAt).toISOString();
    } catch {}
  } else if (typeof data.createdAtIso === "string" && data.createdAtIso) {
    createdStr = data.createdAtIso;
  }
  return {
    id: d.id,
    ...data,
    createdAt: createdStr,
  };
}

// ----------------------------------------------------------------------------
// LEADS & OPORTUNIDADES (Firestore)
// ----------------------------------------------------------------------------
/**
 * Recupera TODOS los leads de la colección Firestore sin filtros restrictivos
 * ni dependencia de índices compuestos del servidor, ordenándolos en memoria
 * de forma descendente por fecha para garantizar que ningún cliente quede excluido.
 */
export async function crmGetLeads() {
  try {
    const snap = await getDocs(collection(db, "leads"));
    const leads = snap.docs.map(parseLeadDoc);
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { ok: true, leads };
  } catch (err) {
    console.error("Error al obtener leads desde Firestore:", err);
    return { ok: false, leads: [], error: err.message };
  }
}

/**
 * Escucha en tiempo real la colección completa de leads para que cualquier
 * formulario enviado por un cliente aparezca inmediatamente en el CRM.
 */
export function crmSubscribeLeads(callback, onError) {
  try {
    return onSnapshot(
      collection(db, "leads"),
      (snap) => {
        const leads = snap.docs.map(parseLeadDoc);
        leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(leads);
      },
      (err) => {
        console.error("Error en listener en tiempo real de Firestore leads:", err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error("Fallo al inicializar suscripción Firestore:", err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function crmCreateLead(leadData) {
  try {
    const id = leadData.id || "lead_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const refId = leadData.refId || "NEXO-" + Date.now().toString(36).toUpperCase().slice(-5);
    const payload = {
      ...leadData,
      id,
      refId,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "leads", id), payload);
    return { ok: true, lead: { ...payload, createdAt: new Date().toISOString() } };
  } catch (err) {
    console.error("Error creating lead in Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmUpdateLead(id, statusOrUpdates, maybeNotes) {
  try {
    let payload = {};
    if (typeof statusOrUpdates === "object" && statusOrUpdates !== null) {
      payload = { ...statusOrUpdates };
    } else {
      if (statusOrUpdates !== undefined) payload.status = statusOrUpdates;
      if (maybeNotes !== undefined) payload.notes = maybeNotes;
    }
    payload.updatedAt = serverTimestamp();
    await updateDoc(doc(db, "leads", id), payload);
    return { ok: true };
  } catch (err) {
    console.error("Error updating lead in Firestore:", err);
    return { ok: false };
  }
}

export async function crmDeleteLead(id) {
  try {
    await deleteDoc(doc(db, "leads", id));
    return { ok: true };
  } catch (err) {
    console.error("Error deleting lead in Firestore:", err);
    return { ok: false };
  }
}

// ----------------------------------------------------------------------------
// CLIENTES ACTIVOS (Firestore)
// ----------------------------------------------------------------------------
export async function crmGetClients() {
  try {
    const snap = await getDocs(collection(db, "clients"));
    const clients = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    clients.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { ok: true, clients };
  } catch (err) {
    console.error("Error al obtener clientes desde Firestore:", err);
    return { ok: false, clients: [] };
  }
}

export async function crmCreateClient(clientData) {
  try {
    const id = clientData.id || "cli_" + Date.now().toString(36);
    const refId = clientData.refId || "CLI-" + Date.now().toString(36).toUpperCase().slice(-5);
    const payload = {
      ...clientData,
      id,
      refId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "clients", id), payload);
    return { ok: true, client: { ...payload, createdAt: new Date().toISOString() } };
  } catch (err) {
    console.error("Error creating client in Firestore:", err);
    return { ok: false };
  }
}

export async function crmUpdateClient(id, updates) {
  try {
    await updateDoc(doc(db, "clients", id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("Error updating client in Firestore:", err);
    return { ok: false };
  }
}

export async function crmDeleteClient(id) {
  try {
    await deleteDoc(doc(db, "clients", id));
    return { ok: true };
  } catch (err) {
    console.error("Error deleting client in Firestore:", err);
    return { ok: false };
  }
}

// ----------------------------------------------------------------------------
// GASTOS DEL MES (Firestore)
// ----------------------------------------------------------------------------
export async function crmGetExpenses() {
  try {
    const snap = await getDocs(collection(db, "expenses"));
    const expenses = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return { ok: true, expenses };
  } catch {
    return { ok: false, expenses: [] };
  }
}

export async function crmCreateExpense(expenseData) {
  try {
    const id = expenseData.id || "exp_" + Date.now().toString(36);
    const payload = {
      ...expenseData,
      id,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "expenses", id), payload);
    return { ok: true, expense: payload };
  } catch (err) {
    console.error("Error creating expense in Firestore:", err);
    return { ok: false };
  }
}

export async function crmDeleteExpense(id) {
  try {
    await deleteDoc(doc(db, "expenses", id));
    return { ok: true };
  } catch (err) {
    console.error("Error deleting expense in Firestore:", err);
    return { ok: false };
  }
}
