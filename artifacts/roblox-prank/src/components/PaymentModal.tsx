import { useEffect, useState } from "react";
import { ModalState, RobuxPackage } from "../App";
import { Currency, formatCurrency } from "../lib/currency";
import { Language, numberLocale, t } from "../lib/i18n";

interface Props {
  pkg: RobuxPackage;
  state: ModalState;
  onConfirm: () => void;
  onClose: () => void;
  currency: Currency;
  language: Language;
}

function playApplePaySound() {
  try {
    new Audio("/purchase.mp3").play().catch(() => {});
  } catch (_) {}
}

function IOSSpinner() {
  const lines = Array.from({ length: 8 }, (_, i) => (
    <line key={i} x1="50" y1="20" x2="50" y2="35"
      stroke="white" strokeWidth="9" strokeLinecap="round"
      opacity={0.15 + (i / 8) * 0.85}
      transform={`rotate(${(i / 8) * 360} 50 50)`} />
  ));
  return (
    <svg width="36" height="36" viewBox="0 0 100 100"
      style={{ animation: "spin 0.8s steps(8, end) infinite" }}>
      {lines}
    </svg>
  );
}

function SuccessView({ onClose, language }: { onClose: () => void; language: Language }) {
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowPopup(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Spinner phase — same overlay + box as initial loading */}
      {!showPopup && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.50)", zIndex: 19 }} />
          <div style={{
            position: "fixed", top: "38%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 20,
          }}>
            <div style={{
              width: 78, height: 78,
              background: "rgba(28,28,30,0.94)", borderRadius: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IOSSpinner />
            </div>
          </div>
        </>
      )}

      {/* Popup phase — no dark overlay, page fully visible behind */}
      {showPopup && (
        <div className="fade-in" style={{
          position: "fixed", top: "50%", left: 0, right: 0,
          transform: "translateY(-50%)",
          width: "80%", maxWidth: 300, margin: "0 auto",
          background: "rgba(30,30,32,0.97)", borderRadius: 18,
          padding: "24px 20px 20px", zIndex: 20, textAlign: "center",
        }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
            {t(language, "completed")}
          </p>
          <p style={{ fontSize: 14, color: "#aaa", margin: "0 0 20px", lineHeight: 1.5 }}>
            {t(language, "purchaseSuccess")}
          </p>
          <button onClick={onClose} style={{
            width: "100%", padding: "13px 0",
            background: "#3a9eff", border: "none", borderRadius: 50,
            color: "white", fontSize: 16, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {t(language, "ok")}
          </button>
        </div>
      )}
    </>
  );
}

export default function PaymentModal({ pkg, state, onConfirm, onClose, currency, language }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Reset confirmed when sheet re-opens
  useEffect(() => {
    if (state !== "appstore") setConfirmed(false);
  }, [state]);

  const handleSideButton = () => {
    if (confirmed) return;
    playApplePaySound();
    setConfirmed(true);
    // After showing the checkmark briefly, move to success state (spinner → popup)
    setTimeout(() => onConfirm(), 1600);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-end",
    }}>
      {/* Dim overlay */}
      {(state === "loading" || state === "appstore") && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      )}

      {/* Loading spinner */}
      {state === "loading" && (
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 10,
        }}>
          <div style={{
            width: 78, height: 78,
            background: "rgba(28,28,30,0.94)", borderRadius: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IOSSpinner />
          </div>
        </div>
      )}

      {/* SUCCESS — spinner then popup */}
       {state === "success" && <SuccessView onClose={onClose} language={language} />}

      {/* APP STORE SHEET */}
      {state === "appstore" && (
        <div
          className="slide-up"
          style={{
            position: "relative", width: "100%", maxWidth: 480,
            background: "#f2f2f7", borderRadius: "16px 16px 0 0",
            zIndex: 9, paddingBottom: 20,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px 8px",
          }}>
             <span style={{ fontSize: 22, fontWeight: 700, color: "#000" }}>{t(language, "appStore")}</span>
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#d1d1d6", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="#555" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* White card */}
          <div style={{ margin: "0 12px", background: "#fff", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
              <img src="/roblox-app-icon.jpeg" alt="Roblox" width={52} height={52}
                style={{ borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#000", marginBottom: 2 }}>
                   {pkg.amount.toLocaleString(numberLocale(language))} Robux
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, color: "#555" }}>Roblox</span>
                  <div style={{ border: "1px solid #aaa", borderRadius: 4, padding: "0 4px", fontSize: 10, color: "#555" }}>13+</div>
                </div>
                 <span style={{ fontSize: 12, color: "#555" }}>{t(language, "inAppPurchase")}</span>
              </div>
            </div>

            <div style={{ height: 1, background: "#e5e5ea", margin: "0 14px" }} />

            <div style={{ padding: "10px 14px 8px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#000", marginBottom: 2 }}>
                 {formatCurrency(pkg.price, currency, language, pkg.amount)}
              </div>
               <div style={{ fontSize: 13, color: "#888" }}>{t(language, "oneTime")}</div>
            </div>

            <div style={{ height: 1, background: "#e5e5ea", margin: "0 14px" }} />

            <div style={{ padding: "10px 14px 12px" }}>
               <span style={{ fontSize: 13, color: "#555" }}>{t(language, "account")}: alexssandrez781@icloud.com</span>
            </div>
          </div>

          {/* Confirm area — switches between phone icon and checkmark */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: 14, gap: 8,
          }}>
            {!confirmed ? (
              <>
                <button
                  onClick={handleSideButton}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                  onMouseDown={e => (e.currentTarget.style.opacity = "0.6")}
                  onMouseUp={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    border: "2.5px solid #0a84ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
                      <rect x="22" y="12" width="36" height="62" rx="8" stroke="#0a84ff" strokeWidth="6" fill="none"/>
                      <rect x="32" y="15" width="16" height="4" rx="2" fill="#0a84ff"/>
                      <rect x="31" y="67" width="18" height="4" rx="2" fill="#0a84ff"/>
                      <line x1="78" y1="44" x2="60" y2="44" stroke="#0a84ff" strokeWidth="6" strokeLinecap="round"/>
                      <polyline points="70,32 58,44 70,56" stroke="#0a84ff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                <span style={{ fontSize: 16, color: "#000", fontWeight: 600 }}>
                   {t(language, "confirmSide")}
                </span>
              </>
            ) : (
              <>
                {/* Same circle, same size — only icon swaps */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  border: "2.5px solid #0a84ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                    stroke="#0a84ff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline className="check-draw" points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                 <span style={{ fontSize: 16, color: "#000", fontWeight: 600 }}>{t(language, "ready")}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
