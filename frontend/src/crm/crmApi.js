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

export async function crmLogin(password) {
  if (password && password.trim() === CRM_PASS) {
    sessionStorage.setItem("nexo_crm_auth", "true");
    return { ok: true, user: { role: "admin", name: "Administrador" } };
  }
  return { ok: false, error: "Contraseña incorrecta de acceso al CRM." };
}

export async function crmLogout() {
  sessionStorage.removeItem("nexo_crm_auth");
  return { ok: true };
}

export async function crmCheckAuth() {
  const isAuth = sessionStorage.getItem("nexo_crm_auth") === "true";
  return { ok: true, authenticated: isAuth };
}

function parseLeadDoc(d) {
  const data = d.data();
  let createdStr = new Date().toISOString();
  if (data.createdAt?.toDate) {
    createdStr = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === "string") {
    createdStr = data.createdAt;
  } else if (data.createdAtIso) {
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
export async function crmGetLeads() {
  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const leads = snap.docs.map(parseLeadDoc);
    return { ok: true, leads };
  } catch {
    try {
      const snap = await getDocs(collection(db, "leads"));
      const leads = snap.docs.map(parseLeadDoc);
      return { ok: true, leads };
    } catch {
      return { ok: false, leads: [] };
    }
  }
}

/**
 * Escucha en tiempo real la colección de leads para que cualquier formulario
 * completado en la landing aparezca automáticamente en el CRM sin recargar la página.
 */
export function crmSubscribeLeads(callback, onError) {
  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const leads = snap.docs.map(parseLeadDoc);
        callback(leads);
      },
      (err) => {
        console.warn("Snapshot con orderBy falló, probando sin orden:", err);
        return onSnapshot(
          collection(db, "leads"),
          (snap) => {
            const leads = snap.docs.map(parseLeadDoc);
            // Orden manual por fecha descendente
            leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            callback(leads);
          },
          onError
        );
      }
    );
  } catch (err) {
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
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const clients = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return { ok: true, clients };
  } catch {
    try {
      const snap = await getDocs(collection(db, "clients"));
      const clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { ok: true, clients };
    } catch {
      return { ok: false, clients: [] };
    }
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
