import { db } from "../utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// Credenciales maestras por defecto para los tres roles iniciales
const DEFAULT_SYSTEM_ACCOUNTS = {
  admin: {
    username: "admin",
    name: "Administrador",
    role: "admin",
    password: "nexo2026admin",
  },
  atencion: {
    username: "atencion",
    name: "Atención al Cliente",
    role: "atencion",
    password: "atencion2026",
  },
  marketing: {
    username: "marketing",
    name: "Equipo de Marketing",
    role: "marketing",
    password: "marketing2026",
  },
};

export async function crmLogin(usernameOrPassword, maybePassword) {
  let user = "admin";
  let pass = "";

  if (maybePassword !== undefined) {
    user = (usernameOrPassword || "").trim().toLowerCase();
    pass = (maybePassword || "").trim();
  } else {
    pass = (usernameOrPassword || "").trim();
  }

  if (!pass) {
    return { ok: false, error: "Por favor ingresá tu contraseña de acceso." };
  }

  // 1. Verificación en base de datos Firestore (colección 'crm_users')
  try {
    const userDocRef = doc(db, "crm_users", user);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.status === "inactivo") {
        return { ok: false, error: "Esta cuenta de usuario se encuentra desactivada." };
      }
      if (data.password === pass) {
        const userObj = {
          username: user,
          name: data.name || user,
          role: data.role || "atencion",
        };
        sessionStorage.setItem("nexo_crm_auth", "true");
        sessionStorage.setItem("nexo_crm_user", userObj.name);
        sessionStorage.setItem("nexo_crm_username", userObj.username);
        sessionStorage.setItem("nexo_crm_role", userObj.role);
        return { ok: true, user: userObj };
      }
    }
  } catch (err) {
    console.warn("Aviso en consulta de crm_users en Firestore:", err);
  }

  // 2. Verificación de cuentas maestras del sistema
  const defaultAccount = DEFAULT_SYSTEM_ACCOUNTS[user];
  if (defaultAccount && defaultAccount.password === pass) {
    sessionStorage.setItem("nexo_crm_auth", "true");
    sessionStorage.setItem("nexo_crm_user", defaultAccount.name);
    sessionStorage.setItem("nexo_crm_username", defaultAccount.username);
    sessionStorage.setItem("nexo_crm_role", defaultAccount.role);
    return { ok: true, user: defaultAccount };
  }

  // 3. Compatibilidad con contraseña maestra general (admin)
  if (pass === "nexo2026admin") {
    const adminUser = {
      username: user || "admin",
      name: user ? user.charAt(0).toUpperCase() + user.slice(1) : "Administrador",
      role: "admin",
    };
    sessionStorage.setItem("nexo_crm_auth", "true");
    sessionStorage.setItem("nexo_crm_user", adminUser.name);
    sessionStorage.setItem("nexo_crm_username", adminUser.username);
    sessionStorage.setItem("nexo_crm_role", "admin");
    return { ok: true, user: adminUser };
  }

  return { ok: false, error: "Usuario o contraseña incorrectos. Verificá tus credenciales." };
}

export async function crmLogout() {
  sessionStorage.removeItem("nexo_crm_auth");
  sessionStorage.removeItem("nexo_crm_user");
  sessionStorage.removeItem("nexo_crm_username");
  sessionStorage.removeItem("nexo_crm_role");
  return { ok: true };
}

export async function crmCheckAuth() {
  const isAuth = sessionStorage.getItem("nexo_crm_auth") === "true";
  const user = sessionStorage.getItem("nexo_crm_user") || "Administrador";
  const username = sessionStorage.getItem("nexo_crm_username") || "admin";
  const role = sessionStorage.getItem("nexo_crm_role") || "admin";
  return {
    ok: true,
    authenticated: isAuth,
    user: { role, name: user, username },
  };
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
// GASTOS DEL MES (Firestore) - Protegido: Exclusivo para Marketing / Finanzas
// ----------------------------------------------------------------------------
export async function crmGetExpenses() {
  const currentRole = sessionStorage.getItem("nexo_crm_role") || "";
  // Privacidad estricta: Únicamente el rol de marketing puede consultar los totales y registros financieros
  if (currentRole !== "marketing") {
    return { ok: false, expenses: [], error: "No autorizado para consultar registros financieros." };
  }

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
  const currentRole = sessionStorage.getItem("nexo_crm_role") || "";
  if (currentRole !== "marketing") {
    return { ok: false, error: "No autorizado para registrar gastos financieros." };
  }

  try {
    const id = expenseData.id || "exp_" + Date.now().toString(36);
    const payload = {
      ...expenseData,
      id,
      amount: Number(expenseData.amount) || 0,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    };
    await setDoc(doc(db, "expenses", id), payload);
    return { ok: true, expense: payload };
  } catch (err) {
    console.error("Error creating expense in Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmDeleteExpense(id) {
  const currentRole = sessionStorage.getItem("nexo_crm_role") || "";
  if (currentRole !== "marketing") {
    return { ok: false, error: "No autorizado para eliminar registros de gastos." };
  }

  try {
    await deleteDoc(doc(db, "expenses", id));
    return { ok: true };
  } catch (err) {
    console.error("Error deleting expense in Firestore:", err);
    return { ok: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// ATENCIÓN AL PÚBLICO: FICHAS COMPLETAS DE CLIENTES (Firestore)
// ----------------------------------------------------------------------------
function parseCustomerDoc(d) {
  const data = d.data() || {};
  let createdStr = new Date().toISOString();
  if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    try {
      createdStr = data.createdAt.toDate().toISOString();
    } catch {}
  } else if (typeof data.createdAt === "string" && data.createdAt) {
    createdStr = data.createdAt;
  }

  let updatedStr = createdStr;
  if (data.updatedAt?.toDate && typeof data.updatedAt.toDate === "function") {
    try {
      updatedStr = data.updatedAt.toDate().toISOString();
    } catch {}
  } else if (typeof data.updatedAt === "string" && data.updatedAt) {
    updatedStr = data.updatedAt;
  }

  return {
    id: d.id,
    ...data,
    createdAt: createdStr,
    updatedAt: updatedStr,
    historial: Array.isArray(data.historial) ? data.historial : [],
  };
}

export async function crmGetCustomerProfiles() {
  try {
    const snap = await getDocs(collection(db, "customer_profiles"));
    const profiles = snap.docs.map(parseCustomerDoc);
    profiles.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
    return { ok: true, profiles };
  } catch (err) {
    console.error("Error al obtener fichas de clientes desde Firestore:", err);
    return { ok: false, profiles: [], error: err.message };
  }
}

export function crmSubscribeCustomerProfiles(callback, onError) {
  try {
    return onSnapshot(
      collection(db, "customer_profiles"),
      (snap) => {
        const profiles = snap.docs.map(parseCustomerDoc);
        profiles.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
        callback(profiles);
      },
      (err) => {
        console.error("Error en listener de customer_profiles:", err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error("Fallo al inicializar listener customer_profiles:", err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function crmCreateCustomerProfile(profileData) {
  try {
    const id = profileData.id || "cust_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const refId = profileData.refId || "NEXO-FICHA-" + Date.now().toString(36).toUpperCase().slice(-5);
    const currentUser = sessionStorage.getItem("nexo_crm_user") || "Personal de Atención";

    const initialHistory = [
      {
        id: "evt_" + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        type: "creacion",
        author: currentUser,
        title: "Apertura de ficha de cliente",
        description: `Ficha registrada en el módulo de Atención al Público con estado inicial: ${profileData.status || "nuevo"}.`,
      },
    ];

    const payload = {
      ...profileData,
      id,
      refId,
      status: profileData.status || "nuevo",
      historial: profileData.historial?.length ? profileData.historial : initialHistory,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    };

    // Sanear campos undefined para Firestore
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await setDoc(doc(db, "customer_profiles", id), payload);
    return { ok: true, profile: { ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
  } catch (err) {
    console.error("Error al crear ficha de cliente en Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmUpdateCustomerProfile(id, updates, changeDescription = "") {
  try {
    const docRef = doc(db, "customer_profiles", id);
    const currentSnap = await getDoc(docRef);
    const currentData = currentSnap.exists() ? currentSnap.data() : {};
    const currentUser = sessionStorage.getItem("nexo_crm_user") || "Personal de Atención";

    const prevHistory = Array.isArray(currentData.historial) ? currentData.historial : [];
    const newHistory = [...prevHistory];

    if (changeDescription || updates.status !== currentData.status) {
      let desc = changeDescription;
      if (!desc && updates.status && updates.status !== currentData.status) {
        desc = `Estado modificado de "${currentData.status || "nuevo"}" a "${updates.status}".`;
      }
      newHistory.unshift({
        id: "evt_" + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        type: updates.status !== currentData.status ? "cambio_estado" : "modificacion",
        author: currentUser,
        title: updates.status !== currentData.status ? "Actualización de estado" : "Modificación de datos",
        description: desc || "Datos de la ficha actualizados.",
      });
    }

    const payload = {
      ...updates,
      historial: newHistory,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    };

    // Sanear campos undefined
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await updateDoc(docRef, payload);
    return { ok: true };
  } catch (err) {
    console.error("Error al actualizar ficha de cliente en Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmAddCustomerFollowup(id, { date, note, nextAction, nextDate }) {
  try {
    const docRef = doc(db, "customer_profiles", id);
    const currentSnap = await getDoc(docRef);
    const currentData = currentSnap.exists() ? currentSnap.data() : {};
    const currentUser = sessionStorage.getItem("nexo_crm_user") || "Personal de Atención";

    const prevHistory = Array.isArray(currentData.historial) ? currentData.historial : [];
    const newEntry = {
      id: "evt_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      type: "contacto",
      author: currentUser,
      title: "Contacto / Seguimiento realizado",
      description: note || "Seguimiento registrado por el personal de atención.",
      details: {
        contactDate: date || new Date().toISOString().slice(0, 10),
        nextAction: nextAction || "",
        nextDate: nextDate || "",
      },
    };

    const updates = {
      historial: [newEntry, ...prevHistory],
      lastContactDate: date || new Date().toISOString().slice(0, 10),
      nextActionDate: nextDate || currentData.nextActionDate || "",
      nextActionDescription: nextAction || currentData.nextActionDescription || "",
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    };

    await updateDoc(docRef, updates);
    return { ok: true };
  } catch (err) {
    console.error("Error al registrar seguimiento en Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmDeleteCustomerProfile(id) {
  try {
    await deleteDoc(doc(db, "customer_profiles", id));
    return { ok: true };
  } catch (err) {
    console.error("Error al eliminar ficha de cliente en Firestore:", err);
    return { ok: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// SISTEMA DE BACKUPS AUTOMÁTICOS & RECUPERACIÓN (Firestore)
// ----------------------------------------------------------------------------
async function calculateJsonChecksum(obj) {
  try {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return "CRC32-" + Math.abs(hash).toString(16).toUpperCase();
  } catch {
    return "CRC32-NOHASH";
  }
}

export async function crmCreateBackup(type = "manual", author = "Administrador") {
  try {
    const [leadsSnap, clientsSnap, customerSnap, expensesSnap, campaignsSnap, companyCampSnap] = await Promise.all([
      getDocs(collection(db, "leads")),
      getDocs(collection(db, "clients")),
      getDocs(collection(db, "customer_profiles")),
      getDocs(collection(db, "expenses")),
      getDocs(collection(db, "marketing_campaigns")),
      getDocs(collection(db, "company_campaigns")),
    ]);

    const leads = leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const clients = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const customer_profiles = customerSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const expenses = expensesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const marketing_campaigns = campaignsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const company_campaigns = companyCampSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const backupId = "bkp_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date().toISOString();

    const dataPayload = { leads, clients, customer_profiles, expenses, marketing_campaigns, company_campaigns };
    const checksum = await calculateJsonChecksum(dataPayload);
    const sizeBytes = new Blob([JSON.stringify(dataPayload)]).size;

    const manifest = {
      backupId,
      createdAt,
      type, // "automatic" | "manual"
      author,
      status: "success",
      checksum,
      sizeBytes,
      counts: {
        leads: leads.length,
        clients: clients.length,
        customer_profiles: customer_profiles.length,
        expenses: expenses.length,
        marketing_campaigns: marketing_campaigns.length,
        company_campaigns: company_campaigns.length,
        total: leads.length + clients.length + customer_profiles.length + expenses.length + marketing_campaigns.length + company_campaigns.length,
      },
      data: dataPayload,
    };

    // Guardar registro de auditoría en colección "backups"
    await setDoc(doc(db, "backups", backupId), {
      backupId,
      createdAt,
      type,
      author,
      status: "success",
      checksum,
      sizeBytes,
      counts: manifest.counts,
      createdAtServer: serverTimestamp(),
    });

    // Guardar última copia local de contingencia
    try {
      localStorage.setItem("nexo_last_backup_meta", JSON.stringify({
        backupId,
        createdAt,
        counts: manifest.counts,
        checksum,
      }));
    } catch {}

    return { ok: true, backup: manifest };
  } catch (err) {
    console.error("Error al generar backup de Firestore:", err);
    // Registrar fallo en Firestore
    try {
      const failId = "bkp_err_" + Date.now().toString(36);
      await setDoc(doc(db, "backups", failId), {
        backupId: failId,
        createdAt: new Date().toISOString(),
        type,
        author,
        status: "error",
        error: err.message || "Error desconocido",
        createdAtServer: serverTimestamp(),
      });
    } catch {}
    return { ok: false, error: err.message };
  }
}

export async function crmGetBackups() {
  try {
    const snap = await getDocs(collection(db, "backups"));
    const backups = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    backups.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { ok: true, backups };
  } catch (err) {
    console.error("Error al obtener historial de backups:", err);
    return { ok: false, backups: [] };
  }
}

/**
 * Prueba de restauración NO destructiva (Dry-Run Test).
 * Verifica esquema, estructura de colecciones, conteo de documentos y checksum
 * SIN tocar ni sobreescribir datos en producción.
 */
export async function crmRestoreBackupTest(backupJson) {
  try {
    let parsed = backupJson;
    if (typeof backupJson === "string") {
      parsed = JSON.parse(backupJson);
    }

    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "El archivo no contiene un JSON válido." };
    }

    const data = parsed.data || parsed;
    const requiredCollections = ["leads", "clients", "customer_profiles", "expenses"];
    const foundCollections = Object.keys(data).filter((k) => requiredCollections.includes(k));

    if (foundCollections.length === 0) {
      return {
        ok: false,
        error: "El archivo de backup no contiene ninguna colección reconocida de NEXO Creative (leads, clients, customer_profiles, expenses).",
      };
    }

    const counts = {};
    const validationErrors = [];
    let totalDocs = 0;

    foundCollections.forEach((col) => {
      const items = Array.isArray(data[col]) ? data[col] : [];
      counts[col] = items.length;
      totalDocs += items.length;

      // Validar integridad básica de documentos
      items.forEach((item, idx) => {
        if (!item.id && !item.refId) {
          validationErrors.push(`Colección ${col}: documento #${idx + 1} no posee identificador único.`);
        }
      });
    });

    const calculatedChecksum = await calculateJsonChecksum(data);
    const checksumMatches = !parsed.checksum || parsed.checksum === calculatedChecksum;

    return {
      ok: true,
      report: {
        isValid: true,
        backupId: parsed.backupId || "Desconocido",
        createdAt: parsed.createdAt || "No especificada",
        totalDocs,
        counts,
        foundCollections,
        checksum: calculatedChecksum,
        checksumMatches,
        validationErrors,
        isSafeToRestore: validationErrors.length === 0,
      },
    };
  } catch (err) {
    return { ok: false, error: "Error al analizar el archivo de copia: " + err.message };
  }
}

/**
 * Restauración real controlada hacia Firestore.
 * Permite restaurar colecciones individuales o completas.
 */
export async function crmRestoreBackup(backupJson, selectedCollections = null) {
  try {
    let parsed = backupJson;
    if (typeof backupJson === "string") {
      parsed = JSON.parse(backupJson);
    }
    const data = parsed.data || parsed;
    const collectionsToProcess = selectedCollections || ["leads", "clients", "customer_profiles", "expenses", "marketing_campaigns", "company_campaigns"];
    const results = { restored: 0, errors: [] };

    for (const col of collectionsToProcess) {
      const docsList = Array.isArray(data[col]) ? data[col] : [];
      for (const item of docsList) {
        try {
          const docId = item.id || "restored_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
          await setDoc(doc(db, col, docId), {
            ...item,
            restoredAt: serverTimestamp(),
            restoredAtIso: new Date().toISOString(),
          }, { merge: true });
          results.restored++;
        } catch (itemErr) {
          results.errors.push(`Error restaurando doc en ${col}: ${itemErr.message}`);
        }
      }
    }

    // Registrar en auditoría
    await setDoc(doc(db, "backups", "restored_" + Date.now().toString(36)), {
      type: "restore_operation",
      createdAt: new Date().toISOString(),
      author: sessionStorage.getItem("nexo_crm_user") || "Administrador",
      restoredDocsCount: results.restored,
      errorsCount: results.errors.length,
      collections: collectionsToProcess,
      createdAtServer: serverTimestamp(),
    });

    return { ok: true, results };
  } catch (err) {
    console.error("Error durante la restauración:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Verificador de backup automático periódico.
 * Si transcurrieron más de 24 horas desde la última copia exitosa,
 * dispara un backup automático en segundo plano sin interrumpir al usuario.
 */
export async function crmCheckAndTriggerAutoBackup() {
  try {
    const metaStr = localStorage.getItem("nexo_last_backup_meta");
    let needsBackup = true;
    if (metaStr) {
      try {
        const meta = JSON.parse(metaStr);
        const lastDate = new Date(meta.createdAt).getTime();
        const now = Date.now();
        // 24 horas = 86400000 ms
        if (now - lastDate < 86400000) {
          needsBackup = false;
        }
      } catch {}
    }

    if (needsBackup) {
      console.log("Iniciando copia de seguridad automática programada de NEXO CRM...");
      await crmCreateBackup("automatic", "Sistema Programado (Auto-24h)");
    }
  } catch (err) {
    console.warn("Aviso en verificación de auto-backup:", err);
  }
}

// ----------------------------------------------------------------------------
// GESTIÓN DE USUARIOS Y ROLES (Exclusivo Administrador)
// ----------------------------------------------------------------------------
export async function crmGetUsers() {
  try {
    const snap = await getDocs(collection(db, "crm_users"));
    let users = snap.docs.map((d) => ({
      username: d.id,
      ...d.data(),
    }));

    // Si la colección está vacía, inicializar con las cuentas de los tres roles
    if (users.length === 0) {
      const defaults = Object.values(DEFAULT_SYSTEM_ACCOUNTS);
      for (const acc of defaults) {
        await setDoc(doc(db, "crm_users", acc.username), {
          username: acc.username,
          name: acc.name,
          role: acc.role,
          password: acc.password,
          status: "activo",
          createdAt: serverTimestamp(),
          createdAtIso: new Date().toISOString(),
        });
      }
      users = defaults.map((d) => ({ ...d, status: "activo" }));
    }

    return { ok: true, users };
  } catch (err) {
    console.error("Error al obtener usuarios del CRM:", err);
    // Devolver cuentas iniciales como fallback
    return { ok: true, users: Object.values(DEFAULT_SYSTEM_ACCOUNTS).map((d) => ({ ...d, status: "activo" })) };
  }
}

export async function crmCreateUser(userData) {
  try {
    const username = (userData.username || "").trim().toLowerCase();
    if (!username) {
      return { ok: false, error: "El nombre de usuario es obligatorio." };
    }
    if (!userData.password || userData.password.length < 4) {
      return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
    }

    const docRef = doc(db, "crm_users", username);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return { ok: false, error: "Ya existe un usuario con ese nombre de usuario." };
    }

    const payload = {
      username,
      name: userData.name || username,
      role: userData.role || "atencion", // "admin" | "atencion" | "marketing"
      password: userData.password,
      status: userData.status || "activo",
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    };

    await setDoc(docRef, payload);
    return { ok: true, user: payload };
  } catch (err) {
    console.error("Error al crear usuario en Firestore:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmUpdateUser(username, updates) {
  try {
    const cleanUser = (username || "").trim().toLowerCase();
    const docRef = doc(db, "crm_users", cleanUser);
    const payload = { ...updates, updatedAt: serverTimestamp() };
    await updateDoc(docRef, payload);
    return { ok: true };
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmDeleteUser(username) {
  try {
    const cleanUser = (username || "").trim().toLowerCase();
    const currentSessionUser = (sessionStorage.getItem("nexo_crm_username") || "").toLowerCase();
    if (cleanUser === currentSessionUser) {
      return { ok: false, error: "No podés eliminar tu propio usuario de la sesión actual." };
    }
    await deleteDoc(doc(db, "crm_users", cleanUser));
    return { ok: true };
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    return { ok: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// MARKETING: PUBLICIDAD DE CLIENTES (Firestore: 'marketing_campaigns')
// ----------------------------------------------------------------------------
function parseCampaignDoc(d) {
  const data = d.data() || {};
  let createdStr = new Date().toISOString();
  if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    try {
      createdStr = data.createdAt.toDate().toISOString();
    } catch {}
  } else if (typeof data.createdAt === "string" && data.createdAt) {
    createdStr = data.createdAt;
  }

  // Cálculos financieros garantizados por registro
  const adSpend = Number(data.adSpend) || Number(data.budgetARS) || 0;
  const agencyFee = Number(data.agencyFee) || 0;
  const extraExpenses = Number(data.extraExpenses) || 0;
  const clientPaysAdDirect = data.clientPaysAdDirect !== false;
  const totalBilled = Number(data.totalBilled) || (agencyFee + (clientPaysAdDirect ? 0 : adSpend) + extraExpenses);
  const netProfit = Number(data.netProfit) || Math.max(0, agencyFee - extraExpenses);

  return {
    id: d.id,
    ...data,
    adSpend,
    agencyFee,
    extraExpenses,
    clientPaysAdDirect,
    totalBilled,
    netProfit,
    createdAt: createdStr,
    deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
  };
}

export async function crmGetCampaigns() {
  try {
    const snap = await getDocs(collection(db, "marketing_campaigns"));
    const campaigns = snap.docs.map(parseCampaignDoc);
    campaigns.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { ok: true, campaigns };
  } catch (err) {
    console.error("Error al obtener campañas de clientes:", err);
    return { ok: false, campaigns: [] };
  }
}

export function crmSubscribeCampaigns(callback, onError) {
  try {
    return onSnapshot(
      collection(db, "marketing_campaigns"),
      (snap) => {
        const campaigns = snap.docs.map(parseCampaignDoc);
        campaigns.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(campaigns);
      },
      (err) => {
        console.error("Error en listener de campañas de clientes:", err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error("Fallo al inicializar listener de campañas:", err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function crmCreateCampaign(campaignData) {
  try {
    const id = campaignData.id || "cmp_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const refId = campaignData.refId || "CMP-" + Date.now().toString(36).toUpperCase().slice(-5);
    const author = sessionStorage.getItem("nexo_crm_user") || "Equipo de Marketing";

    // Cálculo estricto de montos financieros
    const adSpend = Number(campaignData.adSpend) || Number(campaignData.budgetARS) || 0;
    const agencyFee = Number(campaignData.agencyFee) || 0;
    const extraExpenses = Number(campaignData.extraExpenses) || 0;
    const clientPaysAdDirect = campaignData.clientPaysAdDirect !== false;
    const totalBilled = Number(campaignData.totalBilled) || (agencyFee + (clientPaysAdDirect ? 0 : adSpend) + extraExpenses);
    const netProfit = Math.max(0, agencyFee - extraExpenses);

    const payload = {
      ...campaignData,
      id,
      refId,
      author,
      adSpend,
      agencyFee,
      extraExpenses,
      clientPaysAdDirect,
      totalBilled,
      netProfit,
      budgetARS: adSpend, // compatibilidad hacia atrás
      status: campaignData.status || "activa", // "activa" | "optimizacion" | "pausada" | "finalizada"
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await setDoc(doc(db, "marketing_campaigns", id), payload);
    return { ok: true, campaign: { ...payload, createdAt: new Date().toISOString() } };
  } catch (err) {
    console.error("Error al registrar campaña de cliente:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmUpdateCampaign(id, updates) {
  try {
    // Si se modifican honorarios o gastos extras, recalcular ganancia neta
    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    };

    if (updates.agencyFee !== undefined || updates.extraExpenses !== undefined) {
      const fee = Number(updates.agencyFee) || 0;
      const extra = Number(updates.extraExpenses) || 0;
      payload.netProfit = Math.max(0, fee - extra);
    }

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await updateDoc(doc(db, "marketing_campaigns", id), payload);
    return { ok: true };
  } catch (err) {
    console.error("Error al actualizar campaña:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmDeleteCampaign(id) {
  try {
    await deleteDoc(doc(db, "marketing_campaigns", id));
    return { ok: true };
  } catch (err) {
    console.error("Error al eliminar campaña:", err);
    return { ok: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// MARKETING: PUBLICIDAD PROPIA DE LA EMPRESA (Firestore: 'company_campaigns')
// ----------------------------------------------------------------------------
function parseCompanyCampaignDoc(d) {
  const data = d.data() || {};
  let createdStr = new Date().toISOString();
  if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    try {
      createdStr = data.createdAt.toDate().toISOString();
    } catch {}
  } else if (typeof data.createdAt === "string" && data.createdAt) {
    createdStr = data.createdAt;
  }

  const spentAmount = Number(data.spentAmount) || 0;
  const leadsAcquired = Number(data.leadsAcquired) || 0;
  const cpl = leadsAcquired > 0 ? Math.round(spentAmount / leadsAcquired) : 0;

  return {
    id: d.id,
    ...data,
    spentAmount,
    leadsAcquired,
    cpl,
    createdAt: createdStr,
  };
}

export async function crmGetCompanyCampaigns() {
  try {
    const snap = await getDocs(collection(db, "company_campaigns"));
    const campaigns = snap.docs.map(parseCompanyCampaignDoc);
    campaigns.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return { ok: true, campaigns };
  } catch (err) {
    console.error("Error al obtener campañas propias:", err);
    return { ok: false, campaigns: [] };
  }
}

export function crmSubscribeCompanyCampaigns(callback, onError) {
  try {
    return onSnapshot(
      collection(db, "company_campaigns"),
      (snap) => {
        const campaigns = snap.docs.map(parseCompanyCampaignDoc);
        campaigns.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(campaigns);
      },
      (err) => {
        console.error("Error en listener de campañas propias:", err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error("Fallo al inicializar listener de campañas propias:", err);
    if (onError) onError(err);
    return () => {};
  }
}

export async function crmCreateCompanyCampaign(campaignData) {
  try {
    const id = campaignData.id || "own_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const refId = campaignData.refId || "OWN-" + Date.now().toString(36).toUpperCase().slice(-5);
    const author = sessionStorage.getItem("nexo_crm_user") || "Equipo de Marketing";

    const spentAmount = Number(campaignData.spentAmount) || 0;
    const leadsAcquired = Number(campaignData.leadsAcquired) || 0;
    const cpl = leadsAcquired > 0 ? Math.round(spentAmount / leadsAcquired) : 0;

    const payload = {
      ...campaignData,
      id,
      refId,
      author,
      spentAmount,
      leadsAcquired,
      cpl,
      allocatedBudget: Number(campaignData.allocatedBudget) || 0,
      status: campaignData.status || "activa",
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await setDoc(doc(db, "company_campaigns", id), payload);
    return { ok: true, campaign: { ...payload, createdAt: new Date().toISOString() } };
  } catch (err) {
    console.error("Error al registrar campaña propia:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmUpdateCompanyCampaign(id, updates) {
  try {
    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString(),
    };

    if (updates.spentAmount !== undefined || updates.leadsAcquired !== undefined) {
      const spent = Number(updates.spentAmount) || 0;
      const leads = Number(updates.leadsAcquired) || 0;
      payload.cpl = leads > 0 ? Math.round(spent / leads) : 0;
    }

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) payload[k] = "";
    });

    await updateDoc(doc(db, "company_campaigns", id), payload);
    return { ok: true };
  } catch (err) {
    console.error("Error al actualizar campaña propia:", err);
    return { ok: false, error: err.message };
  }
}

export async function crmDeleteCompanyCampaign(id) {
  try {
    await deleteDoc(doc(db, "company_campaigns", id));
    return { ok: true };
  } catch (err) {
    console.error("Error al eliminar campaña propia:", err);
    return { ok: false, error: err.message };
  }
}

// ----------------------------------------------------------------------------
// CONTROL FINANCIERO Y BALANCES GLOBALES (Exclusivo Rol Marketing)
// ----------------------------------------------------------------------------
export async function crmGetMarketingFinancialSummary() {
  const currentRole = sessionStorage.getItem("nexo_crm_role") || "";
  // Privacidad estricta: Denegar acceso a Admin o Atención al Cliente
  if (currentRole !== "marketing") {
    return {
      ok: false,
      error: "Acceso no autorizado: Solo el rol de Marketing tiene permisos para consultar los totales financieros y reportes económicos del negocio.",
    };
  }

  try {
    const [clientCampRes, ownCampRes, expensesRes] = await Promise.all([
      crmGetCampaigns(),
      crmGetCompanyCampaigns(),
      crmGetExpenses(),
    ]);

    const clientCampaigns = clientCampRes.ok ? clientCampRes.campaigns : [];
    const ownCampaigns = ownCampRes.ok ? ownCampRes.campaigns : [];
    const expensesList = expensesRes.ok ? expensesRes.expenses : [];

    // 1. Total invertido en publicidad propia
    const totalOwnSpent = ownCampaigns.reduce((acc, c) => acc + (Number(c.spentAmount) || 0), 0);

    // 2. Total invertido en campañas de clientes (pauta que va a plataformas)
    const totalClientAdSpend = clientCampaigns.reduce((acc, c) => acc + (Number(c.adSpend) || 0), 0);

    // 3. Total cobrado por servicios de marketing (honorarios de la agencia)
    const totalAgencyFees = clientCampaigns.reduce((acc, c) => acc + (Number(c.agencyFee) || 0), 0);

    // 4. Gastos adicionales en campañas de clientes
    const totalClientExtraExpenses = clientCampaigns.reduce((acc, c) => acc + (Number(c.extraExpenses) || 0), 0);

    // 5. Total facturado cobrado al cliente
    const totalClientBilled = clientCampaigns.reduce((acc, c) => acc + (Number(c.totalBilled) || 0), 0);

    // 6. Gastos operativos generales
    const totalOperatingExpenses = expensesList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // 7. Ganancia neta real de la empresa = Honorarios cobrados - Gastos extras de campañas - Publicidad propia invertida
    const netMarketingProfit = totalAgencyFees - totalClientExtraExpenses - totalOwnSpent;

    // 8. Rentabilidad sobre inversión propia (ROI)
    const roi = totalOwnSpent > 0 ? Math.round((netMarketingProfit / totalOwnSpent) * 100) : 100;

    return {
      ok: true,
      summary: {
        totalOwnSpent,
        totalClientAdSpend,
        totalAgencyFees,
        totalClientExtraExpenses,
        totalClientBilled,
        totalOperatingExpenses,
        netMarketingProfit,
        roi,
        ownCampaignsCount: ownCampaigns.length,
        clientCampaignsCount: clientCampaigns.length,
      },
    };
  } catch (err) {
    console.error("Error al calcular resumen financiero de marketing:", err);
    return { ok: false, error: err.message };
  }
}
