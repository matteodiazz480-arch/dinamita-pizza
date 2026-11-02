export async function crmLogin(password) {
  const res = await fetch("/api/crm/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.ok && data.token) {
    sessionStorage.setItem("nexo_crm_token", data.token);
  }
  return data;
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
  const res = await fetch("/api/crm/auth/me", {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { ok: false, authenticated: false };
  return res.json().catch(() => ({ ok: false, authenticated: false }));
}

export async function crmGetLeads() {
  const res = await fetch("/api/crm/leads", {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return { ok: false, leads: [] };
  return res.json().catch(() => ({ ok: false, leads: [] }));
}

export async function crmUpdateLead(id, status, notes) {
  const res = await fetch("/api/crm/leads", {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, status, notes }),
  });
  return res.json().catch(() => ({ ok: false }));
}

export async function crmCreateLead(leadData) {
  const res = await fetch("/api/crm/leads", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  return res.json().catch(() => ({ ok: false }));
}

export async function crmDeleteLead(id) {
  const res = await fetch("/api/crm/leads", {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id }),
  });
  return res.json().catch(() => ({ ok: false }));
}

export async function crmGetStats() {
  const res = await fetch("/api/crm/stats", {
    headers: getAuthHeaders(),
  });
  return res.json().catch(() => ({ ok: false, stats: {} }));
}
