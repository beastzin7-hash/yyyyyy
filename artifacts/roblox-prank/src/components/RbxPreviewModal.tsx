interface Props {
  onClose: () => void;
}

export default function RbxPreviewModal({ onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista demo RBX"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 4000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "rgba(0, 0, 0, 0.62)",
      }}
    >
      <div
        onClick={event => event.stopPropagation()}
        style={{
          position: "relative", width: "min(100%, 480px)",
          maxHeight: "calc(100vh - 32px)", overflow: "auto",
          borderRadius: 18, background: "#fff",
          boxShadow: "0 20px 70px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar vista RBX"
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 1,
            width: 36, height: 36, borderRadius: 18,
            border: "none", background: "rgba(255,255,255,0.92)",
            color: "#111", fontSize: 25, lineHeight: 1, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.16)",
          }}
        >
          ×
        </button>
        <div style={{
          padding: "10px 16px 8px", fontSize: 12, fontWeight: 700,
          color: "#666", textAlign: "center", letterSpacing: 0.2,
        }}>
          Vista demo no oficial
        </div>
        <img
          src="/rbx-home-preview.png"
          alt="Vista demo RBX"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}