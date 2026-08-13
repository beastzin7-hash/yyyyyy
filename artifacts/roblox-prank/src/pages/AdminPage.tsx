import { FormEvent, useEffect, useState } from "react";
import { LANGUAGES, Language, t } from "../lib/i18n";

export default function AdminPage() {
  const [language, setLanguage] = useState<Language>("es");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [daysRemaining, setDaysRemaining] = useState("19");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/access/config")
      .then(response => response.json() as Promise<{ username?: string; daysRemaining?: number }>)
      .then(data => {
        setLoginUsername(data.username ?? "");
        const configuredDays = data.daysRemaining;
        if (typeof configuredDays === "number" && Number.isInteger(configuredDays) && configuredDays >= 0 && configuredDays <= 365) {
          setDaysRemaining(String(configuredDays));
        }
      })
      .catch(() => setError(t(language, "accessUnavailable")));

    fetch("/api/access/admin/status", { credentials: "same-origin" })
      .then(response => response.json() as Promise<{ authenticated?: boolean }>)
      .then(data => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setError(t(language, "adminSessionError")))
      .finally(() => setLoading(false));
  }, [language]);

  const authenticate = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/access/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password: adminPassword }),
    });
    if (!response.ok) {
      setError(t(language, "adminSessionError"));
      return;
    }
    setAdminPassword("");
    setAuthenticated(true);
  };

  const saveCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const parsedDays = Number(daysRemaining);
    if (!Number.isInteger(parsedDays) || parsedDays < 0 || parsedDays > 365) {
      setError(t(language, "invalidDays"));
      return;
    }
    const response = await fetch("/api/access/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ loginUsername, loginPassword, daysRemaining: parsedDays }),
    });
    if (response.status === 403) {
      setAuthenticated(false);
      setError(t(language, "adminUnauthorized"));
      return;
    }
    if (!response.ok) {
      setError(t(language, "accessUnavailable"));
      return;
    }
    setLoginPassword("");
    setMessage(`${t(language, "credentialsSaved")} ${t(language, "daysSaved")}`);
  };

  const logout = async () => {
    await fetch("/api/access/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setAuthenticated(false);
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f6f8",
      padding: "22px 18px 48px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#15171a",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
        }}>
          <a href="/" style={{ color: "#0066ff", textDecoration: "none", fontWeight: 750 }}>
            ← {t(language, "backToStore")}
          </a>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
            {t(language, "chooseLanguage")}
            <select
              value={language}
              onChange={event => setLanguage(event.target.value as Language)}
              style={{
                border: "1px solid #d9dce2",
                borderRadius: 9,
                padding: "8px 10px",
                background: "#fff",
                fontFamily: "inherit",
              }}
            >
              {LANGUAGES.map(option => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </label>
        </header>

        <section style={{ marginBottom: 24 }}>
          <p style={{ color: "#0066ff", fontSize: 13, fontWeight: 800, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 8 }}>
            Roblox Prank
          </p>
          <h1 style={{ fontSize: "clamp(30px, 6vw, 48px)", lineHeight: 1.05, margin: 0, letterSpacing: -1.4 }}>
            {t(language, "adminTitle")}
          </h1>
          <p style={{ maxWidth: 560, color: "#626871", lineHeight: 1.6, marginTop: 12 }}>
            {t(language, "adminSubtitle")}
          </p>
        </section>

        {loading ? (
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, color: "#626871" }}>
            {t(language, "accessLoading")}
          </div>
        ) : !authenticated ? (
          <form onSubmit={authenticate} style={{
            maxWidth: 460,
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 12px 32px rgba(18, 23, 31, 0.08)",
          }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{t(language, "adminLoginTitle")}</h2>
            <p style={{ color: "#626871", lineHeight: 1.5, margin: "0 0 18px", fontSize: 14 }}>
              {t(language, "adminLoginHint")}
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={event => setAdminPassword(event.target.value)}
              placeholder={t(language, "adminPassword")}
              autoComplete="current-password"
              style={inputStyle}
            />
            <button type="submit" style={primaryButtonStyle}>
              {t(language, "adminLogin")}
            </button>
            {error && <p role="alert" style={errorStyle}>{error}</p>}
          </form>
        ) : (
          <form onSubmit={saveCredentials} style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 12px 32px rgba(18, 23, 31, 0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{t(language, "adminGlobalCredentials")}</h2>
                <p style={{ color: "#626871", lineHeight: 1.5, margin: "8px 0 0", fontSize: 14 }}>
                  {t(language, "adminGlobalHint")}
                </p>
              </div>
              <button type="button" onClick={logout} style={secondaryButtonStyle}>
                {t(language, "adminLogout")}
              </button>
            </div>
            <label style={labelStyle}>{t(language, "globalUsername")}</label>
            <input
              type="text"
              value={loginUsername}
              onChange={event => setLoginUsername(event.target.value)}
              autoComplete="off"
              style={inputStyle}
            />
            <label style={labelStyle}>{t(language, "globalPassword")}</label>
            <input
              type="password"
              value={loginPassword}
              onChange={event => setLoginPassword(event.target.value)}
              placeholder={t(language, "newPassword")}
              autoComplete="new-password"
              style={inputStyle}
            />
            <label style={labelStyle}>{t(language, "adminFeaturedDays")}</label>
            <p style={{ color: "#626871", lineHeight: 1.5, margin: "-2px 0 8px", fontSize: 13 }}>
              {t(language, "adminDaysHint")}
            </p>
            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={daysRemaining}
              onChange={event => setDaysRemaining(event.target.value)}
              inputMode="numeric"
              style={inputStyle}
            />
            <button type="submit" style={primaryButtonStyle}>
              {t(language, "saveGlobalCredentials")}
            </button>
            {message && <p role="status" style={successStyle}>{message}</p>}
            {error && <p role="alert" style={errorStyle}>{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  display: "block",
  boxSizing: "border-box" as const,
  width: "100%",
  padding: "13px 14px",
  border: "1px solid #d9dce2",
  borderRadius: 11,
  fontSize: 15,
  marginBottom: 16,
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 750,
  marginBottom: 7,
  color: "#343941",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "13px 16px",
  border: "none",
  borderRadius: 11,
  background: "#0066ff",
  color: "#fff",
  fontSize: 15,
  fontWeight: 750,
  cursor: "pointer",
  fontFamily: "inherit",
};

const secondaryButtonStyle = {
  flexShrink: 0,
  padding: "9px 12px",
  border: "1px solid #d9dce2",
  borderRadius: 9,
  background: "#fff",
  color: "#4c525b",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};

const errorStyle = { color: "#c53b35", fontSize: 13, margin: "12px 0 0" };
const successStyle = { color: "#197343", fontSize: 13, margin: "12px 0 0" };