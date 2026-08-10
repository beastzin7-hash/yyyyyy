import { useState } from "react";
import BuyPage from "./pages/BuyPage";
import PaymentModal from "./components/PaymentModal";
import SendRobuxSheet from "./components/SendRobuxSheet";
import LoginGate from "./components/LoginGate";
import AdminPage from "./pages/AdminPage";
import RbxPreviewModal from "./components/RbxPreviewModal";
import { Currency } from "./lib/currency";
import { Language } from "./lib/i18n";

export interface RobuxPackage {
  id: number;
  amount: number;
  price: number;
  recommended?: boolean;
}

export const PACKAGES: RobuxPackage[] = [
  { id: 1, amount: 22500, price: 4999.00 },
  { id: 2, amount: 10000, price: 2499.00 },
  { id: 3, amount: 4500, price: 1299.00 },
  { id: 4, amount: 3150, price: 799.00 },
  { id: 5, amount: 1700, price: 499.00 },
  { id: 6, amount: 1200, price: 299.00 },
  { id: 7, amount: 800, price: 249.00 },
  { id: 8, amount: 400, price: 129.00, recommended: true },
  { id: 9, amount: 80, price: 25.00 },
  { id: 10, amount: 40, price: 13.00 },
];

export type ModalState = "idle" | "loading" | "appstore" | "success";

export default function App() {
  const isAdminRoute = window.location.pathname === "/admin";
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [language, setLanguage] = useState<Language>("es");
  const [selected, setSelected] = useState<RobuxPackage | null>(null);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [robuxBalance, setRobuxBalance] = useState(0);
  const [sendOpen, setSendOpen] = useState(false);
  const [rbxPreviewOpen, setRbxPreviewOpen] = useState(false);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  const handleLoginLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  const handleSelect = (pkg: RobuxPackage) => {
    setSelected(pkg);
    setModalState("loading");
    setTimeout(() => setModalState("appstore"), 1200);
  };

  const handleConfirm = () => {
    setModalState("success");
    if (selected) setRobuxBalance(b => b + selected.amount);
  };

  const handleClose = () => {
    setModalState("idle");
    setSelected(null);
  };

  if (!currency) {
    return <LoginGate onEnter={(selectedCurrency, selectedLanguage, initialRobux) => {
      setCurrency(selectedCurrency);
      setLanguage(selectedLanguage);
      setRobuxBalance(initialRobux);
    }} onLanguageChange={handleLoginLanguageChange} onRbxOpen={() => setRbxPreviewOpen(true)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#ffffff", minHeight: "100vh", position: "relative" }}>
        <BuyPage
          onSelect={handleSelect}
          robuxBalance={robuxBalance}
          onSend={() => setSendOpen(true)}
          onRbxOpen={() => setRbxPreviewOpen(true)}
          currency={currency}
          language={language}
        />
      </div>

      {modalState !== "idle" && selected && (
        <PaymentModal
          pkg={selected}
          state={modalState}
          onConfirm={handleConfirm}
          onClose={handleClose}
          currency={currency}
          language={language}
        />
      )}

      {sendOpen && (
        <SendRobuxSheet
          robuxBalance={robuxBalance}
          onClose={() => setSendOpen(false)}
          onRbxOpen={() => setRbxPreviewOpen(true)}
          onSend={(amount) => {
            setRobuxBalance(b => Math.max(0, b - amount));
            setSendOpen(false);
          }}
          language={language}
        />
      )}

      {rbxPreviewOpen && <RbxPreviewModal onClose={() => setRbxPreviewOpen(false)} />}
    </div>
  );
}
