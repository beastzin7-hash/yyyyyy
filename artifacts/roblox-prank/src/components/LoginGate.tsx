import { FormEvent, useEffect, useState } from "react";
import { CURRENCIES, Currency } from "../lib/currency";
import { LANGUAGES, Language, t } from "../lib/i18n";

interface Props {
  onEnter: (currency: Currency, language: Language, initialRobux: number) => void;
  onLanguageChange: (language: Language) => void;
  onRbxOpen: () => void;
}

export default function LoginGate({ onEnter, onLanguageChange, onRbxOpen }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [language, setLanguage] = useState<Language>("es");
  const [initialRobux, setInitialRobux] = useState("");
  const [error, setError] = useState("");
  const [accessUsername, setAccessUsername] = useState("beastrobux");
  const [accessLoading, setAccessLoading] = useState(true);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setCurrency(nextLanguage === "en" ? "USD" : "MXN");
    onLanguageChange(nextLanguage);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/access/config")
      .then(async response => {
        if (!response.ok) throw new Error("config");
        return response.json() as Promise<{ username?: string }>;
      })
      .then(data => {
        if (!active) return;
        const configuredUsername = data.username?.trim();
        if (configuredUsername) {
          setAccessUsername(configuredUsername);
          setUsername(current => current || configuredUsername);
        }
      })
      .catch(() => {
        if (active) setError(t(language, "accessUnavailable"));
      })
      .finally(() => {
        if (active) setAccessLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (accessLoading) return;
    try {
      const response = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        setError(response.status === 503 ? t(language, "accessUnavailable") : t(language, "invalidLogin"));
        return;
      }
    } catch {
      setError(t(language, "accessUnavailable"));
      return;
    }

    const parsedRobux = Number(initialRobux);
    if (!Number.isFinite(parsedRobux) || parsedRobux < 0 || !Number.isInteger(parsedRobux)) {
      setError(t(language, "invalidInitialRobux"));
      return;
    }
    onEnter(currency, language, parsedRobux);
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      background: "#f5f5f5",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            color: "#555",
            fontSize: 13,
            fontWeight: 700,
          }}>
            <span>{t(language, "chooseLanguage")}</span>
            <select
              value={language}
              onChange={event => changeLanguage(event.target.value as Language)}
              aria-label={t(language, "chooseLanguage")}
              style={{
                border: "1px solid #d9d9df",
                borderRadius: 9,
                background: "#fff",
                padding: "7px 9px",
                color: "#222",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              {LANGUAGES.map(option => (
                <option key={option.code} value={option.code}>{option.label}</option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSubmit} style={{
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "30px 24px 26px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              src="/access-logo.jpeg"
              alt="Logo"
              width={76}
              height={76}
              style={{
                display: "block",
                objectFit: "cover",
                borderRadius: 18,
                margin: "0 auto 14px",
              }}
            />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", marginBottom: 6 }}>
              {t(language, "enter")}
            </h1>
          </div>

          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#222", marginBottom: 7 }}>
            {t(language, "username")}
          </label>
          <input
            value={username}
            onChange={event => setUsername(event.target.value)}
            autoComplete="username"
            placeholder={t(language, "usernamePlaceholder")}
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #d9d9df",
              borderRadius: 11,
              fontSize: 16,
              outline: "none",
              marginBottom: 15,
              fontFamily: "inherit",
            }}
          />

          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#222", marginBottom: 7 }}>
            {t(language, "password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder={t(language, "passwordPlaceholder")}
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #d9d9df",
              borderRadius: 11,
              fontSize: 16,
              outline: "none",
              marginBottom: 15,
              fontFamily: "inherit",
            }}
          />

          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#222", marginBottom: 7 }}>
            {t(language, "currency")}
          </label>
          <select
            value={currency}
            onChange={event => setCurrency(event.target.value as Currency)}
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #d9d9df",
              borderRadius: 11,
              background: "#fff",
              color: "#222",
              fontSize: 15,
              outline: "none",
              marginBottom: 18,
              fontFamily: "inherit",
            }}
          >
            {CURRENCIES.map(option => (
              <option key={option.code} value={option.code}>{option.label}</option>
            ))}
          </select>

          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#222", marginBottom: 7 }}>
            {t(language, "initialRobux")}
          </label>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={initialRobux}
            onChange={event => setInitialRobux(event.target.value)}
            placeholder={t(language, "initialRobuxPlaceholder")}
            style={{
              width: "100%",
              padding: "13px 14px",
              border: "1px solid #d9d9df",
              borderRadius: 11,
              fontSize: 16,
              outline: "none",
              marginBottom: 15,
              fontFamily: "inherit",
            }}
          />

          {error && (
            <p role="alert" style={{ color: "#d93025", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button type="submit" style={{
            width: "100%",
            padding: "14px 0",
            border: "none",
            borderRadius: 11,
            background: "#0066ff",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}>
            {accessLoading ? t(language, "accessLoading") : t(language, "enter")}
          </button>
        </form>

        <a
          href="https://discord.gg/gHmN6N2ejH"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 16,
            padding: "13px 16px",
            borderRadius: 14,
            color: "#5865f2",
            background: "#fff",
            boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
            textDecoration: "none",
            fontSize: 13,
            lineHeight: 1.35,
            fontWeight: 650,
          }}
        >
          <span style={{ textAlign: "right" }}>
            {t(language, "discordEs")}
            <br />
            {t(language, "discordEn")}
          </span>
          <span style={{ fontSize: 21, color: "#777" }}>→</span>
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-label="Discord">
            <path
              fill="#5865f2"
              d="M19.54 5.06A16.3 16.3 0 0 0 15.5 3.8l-.5 1.02a14.5 14.5 0 0 0-6 0L8.5 3.8a16.4 16.4 0 0 0-4.04 1.26C1.9 8.93 1.2 12.7 1.55 16.42a16.4 16.4 0 0 0 4.97 2.51l1.2-1.63c-.66-.24-1.28-.53-1.86-.88l.46-.35c3.58 1.66 7.46 1.66 11 0l.47.35c-.59.35-1.2.65-1.87.88l1.2 1.63a16.3 16.3 0 0 0 4.97-2.51c.41-4.33-.7-8.06-2.55-11.36ZM8.73 14.2c-1.06 0-1.93-.98-1.93-2.18s.85-2.18 1.93-2.18 1.95.98 1.93 2.18c0 1.2-.85 2.18-1.93 2.18Zm6.54 0c-1.06 0-1.93-.98-1.93-2.18s.85-2.18 1.93-2.18 1.95.98 1.93 2.18c0 1.2-.85 2.18-1.93 2.18Z"
            />
          </svg>
        </a>

          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 12 }}>
            <a
              href="/admin"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 14px",
                border: "none",
                borderRadius: 12,
                background: "transparent",
                color: "#777",
                fontSize: 13,
                fontWeight: 650,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
              }}
            >
              {t(language, "adminLink")}
            </a>
            <button
              type="button"
              onClick={onRbxOpen}
              aria-label="Abrir RBX"
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 10px",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.3,
                cursor: "pointer",
              }}
            >
              RBX
            </button>
          </div>
      </div>
    </main>
  );
}