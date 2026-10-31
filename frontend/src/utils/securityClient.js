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

    return { status: res.status, ok: res.ok && data.ok !== false, data };
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
