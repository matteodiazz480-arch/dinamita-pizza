export async function crmLogin(password) {
  try {
    const res = await fetch("/api/crm/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok && data.token) {
      sessionStorage.setItem("nexo_crm_token", data.token);
      return data;
    }
    return {
      ok: false,
      error:
        data.error ||
        (res.status === 404
          ? "Ruta de API no encontrada (404). Verificá el despliegue."
          : res.status === 401
          ? "Contraseña incorrecta de acceso al CRM."
          : `Error en la autenticación (${res.status}).`),
    };
  } catch {
    return { ok: false, error: "Error de conexión con el servidor." };
  }
}

export async function crmLogout() {
  sessionStorage.removeItem("nexo_crm_token");
  const res = await fetch("/api/crm/auth/logout", {
    method: "POST",
  });
  return res.json().catch(() => ({ ok: true }));
}

function getAuthHeaders() {
  const token = sessionStorage.getItem("nexo_crm_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function crmCheckAuth() {
  try {
    const res = await fetch("/api/crm/auth/me", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { ok: false, authenticated: false };
    return res.json().catch(() => ({ ok: false, authenticated: false }));
  } catch {
    return { ok: false, authenticated: false };
  }
}

export async function crmGetLeads() {
  try {
    const res = await fetch("/api/crm/leads", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { ok: false, leads: [] };
    return res.json().catch(() => ({ ok: false, leads: [] }));
  } catch {
    return { ok: false, leads: [] };
  }
}

export async function crmUpdateLead(id, status, notes) {
  try {
    const res = await fetch("/api/crm/leads", {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status, notes }),
    });
    return res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

export async function crmCreateLead(leadData) {
  try {
    const res = await fetch("/api/crm/leads", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData),
    });
    return res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

export async function crmDeleteLead(id) {
  try {
    const res = await fetch("/api/crm/leads", {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id }),
    });
    return res.json().catch(() => ({ ok: false }));
  } catch {
    return { ok: false };
  }
}

export async function crmGetStats() {
  try {
    const res = await fetch("/api/crm/stats", {
      headers: getAuthHeaders(),
    });
    return res.json().catch(() => ({ ok: false, stats: {} }));
  } catch {
    return { ok: false, stats: {} };
  }
}
