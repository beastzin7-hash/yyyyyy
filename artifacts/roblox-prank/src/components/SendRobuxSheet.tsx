import { useState, useRef, useEffect, memo } from "react";
import RobuxIcon from "./RobuxIcon";
import { Language, numberLocale, t } from "../lib/i18n";

interface Props {
  robuxBalance: number;
  onClose: () => void;
  onSend: (amount: number) => void;
  language: Language;
}

interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  avatarUrl: string | null;
  joinedYear: number | null;
}

const FAKE_FRIENDS: { username: string }[] = [
  { username: "smoukask" },
  { username: "Jonathan_Roblex" },
  { username: "zeshimu" },
  { username: "mrflimflam" },
  { username: "KreekCraft" },
  { username: "Pokediger1" },
  { username: "DenisDaily" },
  { username: "Sketch" },
  { username: "Leahashe" },
  { username: "Tofuu" },
  { username: "Jayingee" },
  { username: "Seniac" },
  { username: "GamingWithKev" },
  { username: "iBeMaine" },
  { username: "Linkmon99" },
  { username: "Dued1" },
  { username: "MiniToon" },
  { username: "Telanthric" },
  { username: "Stickmasterlake" },
  { username: "Builderman" },
  { username: "asimo3089" },
  { username: "badcc" },
  { username: "berezaa" },
  { username: "Defaultio" },
  { username: "Merely" },
  { username: "ObliviousHD" },
  { username: "SubZeroExtabyte" },
  { username: "Rukiryo" },
  { username: "InceptionTime" },
  { username: "TheDevKing" },
  { username: "AlvinBlox" },
  { username: "Loleris" },
  { username: "Erikcassel" },
  { username: "Quenty" },
  { username: "Seranok" },
  { username: "Shedletsky" },
  { username: "Cindering" },
  { username: "Panjno" },
  { username: "Rawblocky" },
  { username: "Osyris" },
  { username: "Corecii" },
  { username: "ScriptedMatt" },
  { username: "Explode1" },
  { username: "Brighteyes" },
  { username: "Polymorphic" },
  { username: "CloneTeam" },
  { username: "NexusTeam" },
  { username: "Nathorix" },
  { username: "LifeInATent" },
  { username: "SoftCookie" },
  { username: "Frosted_Mini" },
  { username: "Coeptus" },
  { username: "iDontHaveAUse" },
  { username: "Hyper" },
  { username: "Telamon" },
];

const QUICK_AMOUNTS = [25, 50, 100, 200];

const RobloxAvatar = memo(function RobloxAvatar({ url, size = 44 }: { url: string | null; size?: number }) {
  if (!url) {
    return (
      <div style={{
        width: size, height: size, borderRadius: size / 2,
        background: "#e0e0e0", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>
    );
  }
  return (
    <img src={url} alt="avatar" width={size} height={size}
      decoding="async"
      style={{ borderRadius: size / 2, objectFit: "cover", background: "#e0e0e0", flexShrink: 0 }} />
  );
});

type Step = "search" | "amount" | "confirm";

function PremiumIcon() {
  return (
    <img
      src="/premium-icon.webp"
      alt="Premium"
      width={24}
      height={24}
      decoding="async"
      style={{ objectFit: "contain" }}
    />
  );
}

function SendRobuxHeader({
  robuxBalance,
  language,
  onClose,
}: {
  robuxBalance: number;
  language: Language;
  onClose: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PremiumIcon />
        <span style={{ fontSize: 19, fontWeight: 700, color: "#111" }}>{t(language, "sendRobux")}</span>
      </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <RobuxIcon size={18} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
            {robuxBalance.toLocaleString(numberLocale(language))}
          </span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SendRobuxSheet({ robuxBalance, onClose, onSend, language }: Props) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestion, setSuggestion] = useState<RobloxUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<RobloxUser | null>(null);
  const [amount, setAmount] = useState(0);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [friendAvatars, setFriendAvatars] = useState<Record<string, string | null>>({});
  // Tracks how far to lift the sheet when keyboard appears
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Visual viewport: keep sheet above the keyboard
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Fetch real avatars for all friends on mount. Commit once so a response
  // arriving in the middle of a user action cannot repaint the whole list.
  useEffect(() => {
    let active = true;

    void Promise.all(
      FAKE_FRIENDS.map(async ({ username }) => {
        try {
          const res = await fetch(`/api/roblox/user?username=${encodeURIComponent(username)}`);
          if (!res.ok) return [username, null] as const;
          const data: RobloxUser = await res.json();
          return [username, data.avatarUrl] as const;
        } catch {
          return [username, null] as const;
        }
      }),
    ).then(entries => {
      if (active) setFriendAvatars(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Focus input when on search step
  useEffect(() => {
    if (step === "search") setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  const searchUser = (username: string) => {
    setSuggestion(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!username.trim()) { setSearching(false); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/roblox/user?username=${encodeURIComponent(username.trim())}`);
        if (res.ok) {
          const data: RobloxUser = await res.json();
          setSuggestion(data);
        } else {
          setSuggestion(null);
        }
      } catch {
        setSuggestion(null);
      } finally {
        setSearching(false);
      }
    }, 600);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedUser(null);
    searchUser(val);
  };

  const handleSelectSuggestion = () => {
    if (suggestion) {
      setSelectedUser(suggestion);
      setStep("amount");
    }
  };

  const handleSelectFriend = async (username: string) => {
    try {
      const res = await fetch(`/api/roblox/user?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data: RobloxUser = await res.json();
        setSelectedUser(data);
      } else {
        setSelectedUser({ id: 0, name: username, displayName: username, avatarUrl: friendAvatars[username] ?? null, joinedYear: null });
      }
    } catch {
      setSelectedUser({ id: 0, name: username, displayName: username, avatarUrl: friendAvatars[username] ?? null, joinedYear: null });
    }
    setStep("amount");
  };

  const filteredFriends = query.trim()
    ? FAKE_FRIENDS.filter(f => f.username.toLowerCase().includes(query.toLowerCase()))
    : FAKE_FRIENDS;

  return (
    /* Outer container: shrinks bottom by keyboard height so sheet rides up with keyboard */
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      bottom: keyboardOffset,
      zIndex: 2000,
      display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center",
      transition: "bottom 0.15s ease",
    }}>
      {/* Dim overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} onClick={onClose} />

      {/* Sheet */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "#fff", borderRadius: "20px 20px 0 0",
        zIndex: 1,
        /* Fills from sheet top to the container bottom (above keyboard) */
        display: "flex", flexDirection: "column",
        maxHeight: "92%",
        animation: "slideUp 0.32s cubic-bezier(0.34,1.06,0.64,1) forwards",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#d1d1d6" }} />
        </div>

        {/* ── STEP 1: SEARCH ── */}
        {step === "search" && (
          <>
            {/* Header — fixed, doesn't scroll */}
            <div style={{ flexShrink: 0 }}>
              <SendRobuxHeader robuxBalance={robuxBalance} language={language} onClose={onClose} />
              {/* Search input */}
              <div style={{ padding: "0 16px 12px" }}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  aria-label={t(language, "searchUsername")}
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  placeholder={t(language, "searchUsername")}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "2px solid #0066ff", borderRadius: 10,
                    padding: "12px 14px", fontSize: 16, fontFamily: "inherit",
                    outline: "none", color: "#111", background: "#fff",
                    resize: "none", overflow: "hidden", display: "block",
                    lineHeight: 1.25,
                  }}
                />
              </div>
            </div>

            {/* Scrollable list — suggestion lives at the top of this */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

              {/* Inline search suggestion */}
              {query.trim() && (searching || suggestion) && (
                <div style={{ margin: "0 16px 10px", borderRadius: 12, overflow: "hidden", border: "1px solid #e8e8e8" }}>
                  {searching ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 20, background: "#f0f0f0",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <div style={{ width: 18, height: 18, border: "2px solid #ccc", borderTopColor: "#0066ff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      </div>
                       <span style={{ fontSize: 14, color: "#999" }}>{t(language, "searching")}</span>
                    </div>
                  ) : suggestion ? (
                    <button onClick={handleSelectSuggestion} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", background: "#fff", border: "none",
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    }}>
                      <RobloxAvatar url={suggestion.avatarUrl} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{suggestion.displayName}</div>
                        <div style={{ fontSize: 13, color: "#888" }}>@{suggestion.name}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ) : null}
                </div>
              )}

              {/* Friends list */}
              {filteredFriends.length > 0 && (
                <>
                  <div style={{ padding: "0 18px 6px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                       {t(language, "myFriends")} ({FAKE_FRIENDS.length + 9})
                    </span>
                  </div>
                  {filteredFriends.map(f => (
                    <button key={f.username} onClick={() => handleSelectFriend(f.username)} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "10px 18px", background: "none", border: "none",
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    }}>
                      <RobloxAvatar url={friendAvatars[f.username] ?? null} size={44} />
                      <span style={{ fontSize: 16, fontWeight: 600, color: "#111", flex: 1 }}>{f.username}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </>
              )}

              {query.trim() && !searching && !suggestion && filteredFriends.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 24px", color: "#888", fontSize: 14 }}>
                   {t(language, "noUser")}
                </div>
              )}
            </div>

            {/* Bottom toolbar */}
            <div style={{
              flexShrink: 0,
              background: "#fff", borderTop: "1px solid #f0f0f0",
              padding: "12px 16px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 10 }}>
                {([<polyline key="u" points="18 15 12 9 6 15"/>, <polyline key="d" points="6 9 12 15 18 9"/>] as React.ReactNode[]).map((icon, i) => (
                  <button key={i} style={{
                    width: 40, height: 40, borderRadius: 10, background: "#f2f2f7",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">{icon}</svg>
                  </button>
                ))}
              </div>
              <button
                disabled={!suggestion}
                onClick={handleSelectSuggestion}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  background: suggestion ? "#0066ff" : "#d1d1d6",
                  border: "none", cursor: suggestion ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: AMOUNT ── */}
        {step === "amount" && (
          <>
            <div style={{ flexShrink: 0 }}>
              <SendRobuxHeader robuxBalance={robuxBalance} language={language} onClose={onClose} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 24px 16px", gap: 12 }}>
              <RobloxAvatar url={selectedUser?.avatarUrl ?? null} size={80} />
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>
                {selectedUser?.displayName ?? query}
              </span>

              <div
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "text" }}
                onClick={() => {
                  if (!editingAmount) {
                    setAmountInput(amount > 0 ? String(amount) : "");
                    setEditingAmount(true);
                  }
                }}
              >
                <RobuxIcon size={28} />
                {editingAmount ? (
                  <input
                    autoFocus
                    type="number"
                    inputMode="numeric"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    onBlur={() => {
                      const parsed = parseInt(amountInput.replace(/\D/g, ""), 10);
                      setAmount(isNaN(parsed) ? 0 : Math.max(0, parsed));
                      setEditingAmount(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    style={{
                      fontSize: 36, fontWeight: 800, color: "#111",
                      border: "none", borderBottom: "2px solid #0066ff",
                      outline: "none", background: "transparent",
                      width: 160, fontFamily: "inherit", textAlign: "center",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 36, fontWeight: 800, color: "#111" }}>
                     {amount.toLocaleString(numberLocale(language))}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {QUICK_AMOUNTS.map(n => (
                  <button key={n} onClick={() => setAmount(prev => prev + n)} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "#f2f2f7", border: "none", borderRadius: 20,
                    padding: "10px 18px", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 15, fontWeight: 600,
                  }}>
                    <RobuxIcon size={14} />
                    <span style={{ color: "#111" }}>{n}</span>
                  </button>
                ))}
              </div>

              {amount > 0 && (
                <button onClick={() => setAmount(0)} style={{
                  background: "none", border: "none", color: "#888", fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                   {t(language, "reset")}
                </button>
              )}
            </div>

            {/* Bottom — not absolute so it doesn't overlap content */}
            <div style={{
              flexShrink: 0,
              background: "#fff", borderTop: "1px solid #f0f0f0",
              padding: "12px 16px 28px",
            }}>
              <button
                disabled={amount <= 0}
                onClick={() => { if (amount > 0) setStep("confirm"); }}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 14,
                  background: amount > 0 ? "#6ca5f5" : "#c8dcfc",
                  border: "none", color: "white", fontSize: 17, fontWeight: 700,
                  cursor: amount > 0 ? "pointer" : "default", fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
              >
                 {t(language, "next")}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: CONFIRM ── */}
        {step === "confirm" && (
          <>
            <div style={{ flexShrink: 0 }}>
              <SendRobuxHeader robuxBalance={robuxBalance} language={language} onClose={onClose} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
              <div style={{ background: "#f2f2f7", borderRadius: 14, padding: "18px 16px 14px", marginBottom: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 14 }}>
                  <RobloxAvatar url={selectedUser?.avatarUrl ?? null} size={80} />
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>{selectedUser?.displayName ?? query}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>@{selectedUser?.name ?? query}</div>
                </div>
                <div style={{ height: 1, background: "#e0e0e0", marginBottom: 12 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: "column", textAlign: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                     <span style={{ fontSize: 12, color: "#555", lineHeight: 1.3 }}>{t(language, "connected")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: "column", textAlign: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                     <span style={{ fontSize: 12, color: "#555", lineHeight: 1.3 }}>{t(language, "mutualFriends")}</span>
                  </div>
                </div>
                {selectedUser?.joinedYear && (
                  <div style={{ textAlign: "center", marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                       <span style={{ fontSize: 12, color: "#888" }}>{t(language, "joined")} {selectedUser.joinedYear}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
                  <RobuxIcon size={32} />
                   <span style={{ fontSize: 44, fontWeight: 800, color: "#111" }}>{amount.toLocaleString(numberLocale(language))}</span>
                </div>
                 <span style={{ fontSize: 14, color: "#555" }}>{t(language, "recipientGets")} {amount.toLocaleString(numberLocale(language))} Robux.</span>
              </div>
            </div>

            <div style={{
              flexShrink: 0,
              background: "#fff", borderTop: "1px solid #f0f0f0",
              padding: "12px 16px 28px", display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => onSend(amount)}
                  style={{
                    flex: 1, padding: "15px 0", borderRadius: 14,
                    background: "#0066ff", border: "none", color: "white",
                    fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                   {t(language, "send")}
                </button>
                <button
                  onClick={() => setStep("amount")}
                  style={{
                    flex: 1, padding: "15px 0", borderRadius: 14,
                    background: "#e5e5ea", border: "none", color: "#111",
                    fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                   {t(language, "edit")}
                </button>
              </div>
              <p style={{ fontSize: 12, color: "#888", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                 {t(language, "ageNotice")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
