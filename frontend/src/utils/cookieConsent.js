const CONSENT_COOKIE_NAME = "nexo_cookie_consent";
const CONSENT_STORAGE_KEY = "nexo_cookie_consent_v1";
const CONSENT_VERSION = "1.0";

const OPTIONAL_ANALYTICS_COOKIES = [
  "_ga",
  "_gid",
  "_gat",
  "nexo_analytics_session",
];

const OPTIONAL_MARKETING_COOKIES = [
  "_fbp",
  "_fbc",
  "nexo_marketing_attr",
];

const DEFAULT_PREFERENCES = {
  decided: false,
  necessary: true,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  updatedAt: null,
};

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split("=").slice(1).join("="));
  } catch {
    return null;
  }
}

function writeCookie(name, value, maxAgeSeconds = 15552000) {
  if (typeof document === "undefined") return;
  const isHttps =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function enforceCookiePolicy(prefs) {
  if (typeof window === "undefined") return;

  const safePrefs = {
    necessary: true,
    analytics: Boolean(prefs?.decided && prefs?.analytics),
    marketing: Boolean(prefs?.decided && prefs?.marketing),
  };

  if (!safePrefs.analytics) {
    OPTIONAL_ANALYTICS_COOKIES.forEach(deleteCookie);
    try {
      sessionStorage.removeItem("nexo_analytics_active");
    } catch {}
  } else {
    try {
      sessionStorage.setItem("nexo_analytics_active", "1");
    } catch {}
  }

  if (!safePrefs.marketing) {
    OPTIONAL_MARKETING_COOKIES.forEach(deleteCookie);
    try {
      sessionStorage.removeItem("nexo_marketing_active");
    } catch {}
  } else {
    try {
      sessionStorage.setItem("nexo_marketing_active", "1");
    } catch {}
  }

  window.__NEXO_CONSENT__ = Object.freeze({
    decided: Boolean(prefs?.decided),
    necessary: true,
    analytics: safePrefs.analytics,
    marketing: safePrefs.marketing,
    updatedAt: prefs?.updatedAt || null,
    version: CONSENT_VERSION,
  });
}

export function getConsentPreferences() {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };

  try {
    localStorage.removeItem("nexo_leads");
  } catch {}

  let parsed = null;
  const cookieRaw = readCookie(CONSENT_COOKIE_NAME);
  if (cookieRaw) {
    try {
      parsed = JSON.parse(cookieRaw);
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    try {
      const storageRaw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (storageRaw) {
        parsed = JSON.parse(storageRaw);
      }
    } catch {
      parsed = null;
    }
  }

  if (!parsed || parsed.version !== CONSENT_VERSION) {
    const initial = { ...DEFAULT_PREFERENCES };
    enforceCookiePolicy(initial);
    return initial;
  }

  const normalized = {
    decided: Boolean(parsed.decided),
    necessary: true,
    analytics: Boolean(parsed.decided && parsed.analytics),
    marketing: Boolean(parsed.decided && parsed.marketing),
    version: CONSENT_VERSION,
    updatedAt: parsed.updatedAt || null,
  };

  enforceCookiePolicy(normalized);
  return normalized;
}

export function saveConsentPreferences({ analytics = false, marketing = false }) {
  const updated = {
    decided: true,
    necessary: true,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(updated);
  writeCookie(CONSENT_COOKIE_NAME, serialized, 15552000);

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {}

  enforceCookiePolicy(updated);
  return updated;
}
