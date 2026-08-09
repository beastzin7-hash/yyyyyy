import { useState } from "react";
import { PACKAGES, RobuxPackage } from "../App";
import RobuxIcon from "../components/RobuxIcon";
import { Currency, formatCurrency, hasExactStorePrice } from "../lib/currency";
import { LANGUAGES, Language, numberLocale, t } from "../lib/i18n";

interface Props {
  onSelect: (pkg: RobuxPackage) => void;
  robuxBalance: number;
  onSend: () => void;
  currency: Currency;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const FAQ_ITEMS = [
  { q: "¿Qué son los Robux?", a: "Los Robux son la moneda virtual de Roblox. Puedes utilizarlos para comprar mejoras para tu avatar u objetos especiales para los juegos." },
  { q: "¿Dónde están mis Robux?", a: "Tus Robux aparecen en la parte superior de la aplicación Roblox. Para verlos en un navegador, inicia sesión en www.roblox.com." },
  { q: "¿Los Robux caducan?", a: "No, los Robux no caducan mientras tu cuenta esté activa." },
];

export default function BuyPage({ onSelect, robuxBalance, onSend, currency, language, onLanguageChange }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plusCard, setPlusCard] = useState(0);
  const visiblePackages = PACKAGES.filter(pkg =>
    currency !== "USD" && currency !== "EUR" || hasExactStorePrice(currency, pkg.amount)
  );

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, display: "flex", alignItems: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RobuxIcon size={22} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>{robuxBalance.toLocaleString(numberLocale(language))}</span>
          </div>
        </div>
        <button onClick={onSend} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#f0f0f0", border: "none", borderRadius: 10,
          padding: "8px 14px", cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{t(language, "send")}</span>
        </button>
        <select
          value={language}
          onChange={event => onLanguageChange(event.target.value as Language)}
          aria-label={t(language, "chooseLanguage")}
          style={{
            border: "1px solid #e2e2e2",
            borderRadius: 9,
            background: "#fff",
            padding: "7px 8px",
            color: "#333",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {LANGUAGES.map(option => (
            <option key={option.code} value={option.code}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div style={{ padding: "24px 16px 8px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", letterSpacing: -0.5 }}>
          {t(language, "buyRobux")}
        </h1>
      </div>

      {/* Packages section */}
      <div style={{ padding: "20px 16px 8px" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 6 }}>
          {t(language, "robuxPackages")}
        </h2>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, marginBottom: 16 }}>
          {t(language, "purchaseTerms")}{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>{t(language, "terms")}</span>
          {t(language, "revocation")}
        </p>

        {/* Package list */}
        <div style={{
          border: "1px solid #e8e8e8",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {visiblePackages.map((pkg, i) => (
            <div key={pkg.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
               borderBottom: i < visiblePackages.length - 1 ? "1px solid #f0f0f0" : "none",
              background: "#fff",
            }}>
              {/* Left: icon + amount */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RobuxIcon size={24} />
                <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>
                   {pkg.amount.toLocaleString(numberLocale(language))}
                </span>
                {pkg.recommended && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#f0f0f0", borderRadius: 20,
                    padding: "2px 10px", marginLeft: 4,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 8 12 12 14 14"/>
                    </svg>
                     <span style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>{t(language, "forYou")}</span>
                  </div>
                )}
              </div>

              {/* Right: price button */}
              <button
                onClick={() => onSelect(pkg)}
                style={{
                  background: pkg.recommended ? "#0066ff" : "#ebebeb",
                  color: pkg.recommended ? "#fff" : "#222",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minWidth: 100,
                  textAlign: "center",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                 {formatCurrency(pkg.price, currency, language, pkg.amount)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Roblox Plus section */}
      <div style={{ padding: "28px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
             <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>{t(language, "newInRoblox")}</span>
          </div>
           <span style={{ fontSize: 14, color: "#0066ff", fontWeight: 600, cursor: "pointer" }}>{t(language, "learnMore")}</span>
        </div>

        {/* Cards carousel */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {[
            {
              title: "Roblox Plus",
              price: 129,
              features: [
                 t(language, "plusDiscount"),
                 t(language, "privateServers"),
                 t(language, "freeSend"),
              ],
                 cta: t(language, "freeTrial"),
            },
            {
              title: "Plus 500",
              price: 199,
              features: [
                 t(language, "allPlus"),
                 t(language, "monthlyRobux"),
                 t(language, "premiumValue"),
              ],
                 cta: t(language, "subscribe"),
            },
          ].map((card, i) => (
            <div key={i} style={{
              minWidth: 240,
              border: "1px solid #e8e8e8",
              borderRadius: 14,
              padding: "16px",
              background: "#fff",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{card.title}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>
                   {formatCurrency(card.price, currency, language)}
                </span>
              </div>
              {card.features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {fi === 0 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
                    {fi === 1 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
                    {fi === 2 && <RobuxIcon size={16} />}
                  </div>
                  <span style={{ fontSize: 13, color: "#444", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
              <button style={{
                width: "100%",
                marginTop: 10,
                background: "#ebebeb",
                border: "none",
                borderRadius: 10,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                color: "#222",
                cursor: "pointer",
                fontFamily: "inherit",
              }}>
                {card.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Dot indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: i === plusCard ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === plusCard ? "#333" : "#ccc",
              transition: "all 0.2s",
              cursor: "pointer",
            }} onClick={() => setPlusCard(i)} />
          ))}
        </div>
      </div>

      {/* FAQ section */}
      <div style={{ padding: "28px 16px 40px" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 14 }}>
          {t(language, "faq")}
        </h2>
        <div style={{ border: "1px solid #e8e8e8", borderRadius: 14, overflow: "hidden" }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                 <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{[
                   t(language, "faqRobuxQ"),
                   t(language, "faqWhereQ"),
                   t(language, "faqExpireQ"),
                 ][i]}</span>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#555" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 16px 16px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                   {[
                     t(language, "faqRobuxA"),
                     t(language, "faqWhereA"),
                     t(language, "faqExpireA"),
                   ][i]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
