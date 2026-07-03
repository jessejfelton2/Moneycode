import { useState } from "react";

// ── COLOR SYSTEM & THEME ───────────────────────────────────────────────────
const C = {
  bg: "#06090E",        
  surface: "#0B111A",   
  card: "#111823",      
  border: "#1C2838",    
  accent: "#B5FF4D",    
  red: "#FF5353",       
  yellow: "#FFC745",    
  blue: "#4EA1FF",      
  purple: "#9E7BFF",    
  text: "#F0F4F8",      
  muted: "#62778F",     
  success: "#34D399",   
};

const fmt = n => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

const toDate = m => {
  if (!m || !isFinite(m) || m <= 0 || m > 360) return "Debt Free!";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(Math.min(m, 360)));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// ── DATA ARRAYS (PRE-POPULATED FOR PREMIUM EXPERIENCE) ──────────────────────
const INITIAL_DEBTS = [
  { id: 1, name: "Premium Credit Card", balance: 2400, original: 4500, rate: 22.8, min: 65, type: "credit" },
  { id: 2, name: "Store Finance Card", balance: 850, original: 1500, rate: 28.4, min: 35, type: "credit" },
];

const INITIAL_ASSETS = [
  { id: 11, name: "High-Yield Savings", value: 1200, type: "cash" },
  { id: 12, name: "Investment Portfolio", value: 650, type: "investment" }
];

const INITIAL_QUEUE = [
  { id: 101, title: "Venmo Cash Gift", source: "Pending Verification", amount: 150, badge: "Extra Cash" },
  { id: 102, title: "Weekly Spare Change Round-Ups", source: "Bank Sync automated log", amount: 34, badge: "Micro Saving" },
  { id: 103, title: "Leftover Checking Buffer", source: "Smart Sweep Rule", amount: 85, badge: "Auto Shield" }
];

const LESSONS = [
  { 
    id: "cc", 
    title: "The Compound Interest Trap", 
    subtitle: "How credit cards multiply your balances daily.",
    duration: "3 min read",
    heading: "Credit Card Math Decoded", 
    body: "Every time you carry a balance month-to-month, your APR is divided by 365 and applied to your average daily balance. This means you are paying interest on top of yesterday's interest. Paying even $20 over the minimum completely alters the lifetime cost of your card." 
  },
  { 
    id: "ap", 
    title: "Bypassing Spending Friction", 
    subtitle: "The psychology behind Auto-Pilot rules.",
    duration: "2 min read",
    heading: "Out of Sight, Into Wealth", 
    body: "The hardest part of wealth building is active choice. Every time you have to decide to save, you experience choice fatigue. Auto-Pilot removes the daily decision loop entirely by intercepting fluid capital before it hits your primary spending environment." 
  }
];

// ── CORE VISUAL METRICS ──────────────────────────────────────────────────────
function RadialProgress({ pct, size = 130, strokeWidth = 8, primaryColor, label, val }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.min(1, pct || 0));
  const dashOffset = circ - (safePct * circ);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={strokeWidth} />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth={strokeWidth} 
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: primaryColor, lineHeight: 1 }}>{val}</span>
        <span style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginTop: 4 }}>{label}</span>
      </div>
    </div>
  );
}

// ── MAIN APPLICATION ────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);

  // Core Financial Engine States
  const [income, setIncome] = useState(3400); 
  const [creditScore, setCreditScore] = useState(680);
  const [extraPay, setExtraPay] = useState(250);
  const [strategy, setStrategy] = useState("avalanche");

  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [debts, setDebts] = useState(INITIAL_DEBTS);
  const [pendingQueue, setPendingQueue] = useState(INITIAL_QUEUE);
  const [actionLogs, setActionLogs] = useState([
    "✓ Auto-Pilot successfully moved $45 to Emergency Fund last Tuesday.",
    "✓ Avoided $24 in estimated interest fees by accelerating Card A target."
  ]);

  // Modal and Interactive states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: "", balance: "", rate: "", min: "" });
  const [newAsset, setNewAsset] = useState({ name: "", value: "" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Financial Health Formula Math
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = totalAssets - totalDebt;
  const initialTotalDebt = debts.reduce((sum, d) => sum + (d.original || d.balance), 0);
  const paidOffPct = initialTotalDebt > 0 ? (initialTotalDebt - totalDebt) / initialTotalDebt : 0;

  // Stable Simulation Processor
  const computePayoffMonths = () => {
    if (debts.length === 0 || debts.reduce((s, d) => s + d.balance, 0) === 0) return 0;
    
    let months = 0;
    let simDebts = debts.map(d => ({ ...d }));
    const maxSafetyCap = 360;

    while (simDebts.some(d => d.balance > 0) && months < maxSafetyCap) {
      months++;
      
      // 1. Accrue Monthly Interest
      simDebts.forEach(d => {
        if (d.balance > 0) {
          d.balance += d.balance * ((d.rate / 100) / 12);
        }
      });

      // 2. Pay Minimums
      let basePool = extraPay;
      simDebts.forEach(d => {
        if (d.balance > 0) {
          const payment = Math.min(d.min, d.balance);
          d.balance -= payment;
        }
      });

      // 3. Apply Extra Strategic Capital (Snowball vs Avalanche sorting)
      let targetSorted = [...simDebts].sort((a, b) => {
        return strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance;
      });

      for (let target of targetSorted) {
        let actualDebt = simDebts.find(d => d.id === target.id);
        if (actualDebt && actualDebt.balance > 0) {
          if (actualDebt.balance <= basePool) {
            basePool -= actualDebt.balance;
            actualDebt.balance = 0;
          } else {
            actualDebt.balance -= basePool;
            basePool = 0;
            break;
          }
        }
      }
    }
    return months;
  };

  const simulatedMonths = computePayoffMonths();

  return (
    <div className="app-frame" style={{ background: C.bg, color: C.text, minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      
      {/* GLOBAL TOAST BANNER */}
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.surface, border: `1px solid ${C.border}`, padding: "12px 20px", borderRadius: 12, zIndex: 9999, fontSize: 13, boxShadow: "0 10px 25px rgba(0,0,0,0.5)", color: C.accent, fontWeight: 600 }}>
          ⚡ {toast}
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 12px" }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em" }}>money</span>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", color: C.accent }}>code</span>
        </div>
        <div style={{ background: "rgba(181,255,77,0.1)", border: `1px solid ${C.accent}30`, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: C.accent }}>
          PRO DASHBOARD
        </div>
      </div>

      {/* RENDER VIEWPORTS TAB-BY-TAB */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px" }}>
        
        {/* VIEW 1: ADVANCED NET DASHBOARD */}
        {tab === "home" && (
          <div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>Your Current Net Worth Baseline</span>
              <h1 className="mono" style={{ fontSize: 36, fontWeight: 800, margin: "6px 0", color: netWorth >= 0 ? C.accent : C.red }}>
                {fmt(netWorth)}
              </h1>
              <p style={{ fontSize: 12, color: C.muted }}>Assets minus outstanding debt ledger liabilities.</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Total Assets</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: C.blue, marginTop: 2 }}>{fmt(totalAssets)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase" }}>Total Debt</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: C.red, marginTop: 2 }}>{fmt(totalDebt)}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Debt Paid Ratio</span>
                <RadialProgress pct={paidOffPct} primaryColor={C.success} val={`${Math.round(paidOffPct * 100)}%`} label="Cleared" />
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Target Credit Matrix</span>
                <RadialProgress pct={(creditScore - 300) / 550} primaryColor={C.yellow} val={creditScore} label="Score Tracking" />
              </div>
            </div>

            {/* ASSETS AND CASH MATRIX */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted }}>Asset Classes</h4>
                <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }} onClick={() => setActiveModal("asset")}>+ Add Asset</button>
              </div>
              {assets.map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase" }}>{a.type} verified</div>
                  </div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>{fmt(a.value)}</div>
                </div>
              ))}
            </div>

            {/* METRIC MODIFIERS PANEL */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: 12 }}>Live Parameters Tuner</h4>
              
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: C.muted }}>Extra Monthly Payment Pool:</span>
                  <span className="mono" style={{ color: C.accent, fontWeight: 700 }}>{fmt(extraPay)}/mo</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1500" 
                  step="50" 
                  value={extraPay} 
                  onChange={e => setExtraPay(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", height: 6, background: C.border, borderRadius: 3, outline: "none", accentColor: C.accent, cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Credit Baseline</label>
                  <input type="number" className="mono" value={creditScore} onChange={e => setCreditScore(parseInt(e.target.value) || 300)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.text, width: "100%", outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Net Monthly Pay</label>
                  <input type="number" className="mono" value={income} onChange={e => setIncome(parseInt(e.target.value) || 0)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.text, width: "100%", outline: "none" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DEBT FREE CALENDAR SIMULATOR */}
        {tab === "plan" && (
          <div>
            <div style={{ display: "flex", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 16 }}>
              <button onClick={() => setStrategy("avalanche")} style={{ flex: 1, background: strategy === "avalanche" ? C.accent : "transparent", color: strategy === "avalanche" ? C.bg : C.muted, border: "none", padding: "10px 6px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Highest Interest (Avalanche)</button>
              <button onClick={() => setStrategy("snowball")} style={{ flex: 1, background: strategy === "snowball" ? C.accent : "transparent", color: strategy === "snowball" ? C.bg : C.muted, border: "none", padding: "10px 6px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Lowest Balance (Snowball)</button>
            </div>

            <div style={{ background: "rgba(181,255,77,0.03)", border: `1px solid ${C.accent}20`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Estimated Debt-Free Horizon</span>
              <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: C.accent, margin: "8px 0" }}>
                {debts.length === 0 ? "Zero Active Balances" : toDate(simulatedMonths)}
              </div>
              <p style={{ fontSize: 12, color: C.muted }}>Calculated sequence based on processing ${extraPay}/mo accelerated velocity.</p>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: C.muted }}>Active Liabilities Ledger</h4>
                <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }} onClick={() => setActiveModal("debt")}>+ Add Liability</button>
              </div>

              {debts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13 }}>🎉 Outstanding balances completely cleared.</div>
              ) : (
                debts.map((d, index) => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: index === debts.length - 1 ? "none" : `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{d.rate}% Rate • Min Payment: {fmt(d.min)}/mo</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{fmt(d.balance)}</div>
                      {index === 0 && <span style={{ background: "rgba(52,211,153,0.12)", color: C.success, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>Target Priority</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: FULL STABLE AUTO-PILOT SHIELD OVERVIEW */}
        {tab === "queue" && (
          <div>
            <div style={{ background: C.card, borderLeft: `4px solid ${C.purple}`, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.purple, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auto-Pilot Rule Configured</span>
                <span style={{ color: C.success, fontSize: 11, fontWeight: 700 }}>● Active Protection</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>
                This shield scans linked deposit paths for sudden liquidity milestones (like gifts or round-ups). It blocks spontaneous spending by staging cash in a vault area until you sweep it.
              </p>
            </div>

            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.muted, marginBottom: 10, letterSpacing: "0.05em" }}>Staged Pending Assets Buffer</h4>
            
            {pendingQueue.length === 0 ? (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>
                🎉 Staging vault cleared. All funds processed to target net worth targets.
              </div>
            ) : (
              pendingQueue.map((item) => (
                <div key={item.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span style={{ background: "rgba(158,123,255,0.12)", color: C.purple, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>{item.badge}</span>
                      <h5 style={{ fontSize: 14, fontWeight: 600, marginTop: 6, marginBottom: 2 }}>{item.title}</h5>
                      <span style={{ fontSize: 11, color: C.muted }}>Source: {item.source}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{fmt(item.amount)}</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                    <button 
                      style={{ flex: 1, background: C.accent, color: C.bg, border: "none", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      onClick={() => {
                        // Safe state update logic
                        const currentAmount = item.amount;
                        const currentTitle = item.title;
                        setAssets(prev => [...prev, { id: Date.now(), name: `Auto-Sweep (${currentTitle})`, value: currentAmount, type: "cash" }]);
                        setActionLogs(prev => [`✓ Routed ${fmt(currentAmount)} from "${currentTitle}" straight into your tracked Asset Matrix.`, ...prev]);
                        setPendingQueue(prev => prev.filter(x => x.id !== item.id));
                        showToast("Liquid fund swept cleanly into savings matrix!");
                      }}
                    >
                      Confirm Safe Sweep
                    </button>
                    <button 
                      style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      onClick={() => {
                        setPendingQueue(prev => prev.filter(x => x.id !== item.id));
                        showToast("Fund bypassed into generic checking account.");
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))
            )}

            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.muted, marginBottom: 10, marginTop: 16, letterSpacing: "0.05em" }}>Protection Infrastructure Log</h4>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12 }}>
              {actionLogs.map((log, index) => (
                <div key={index} style={{ fontSize: 12, color: C.muted, padding: "6px 0", borderBottom: index === actionLogs.length - 1 ? "none" : `1px solid ${C.border}40`, lineHeight: 1.4 }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: INTELLIGENT TRAINING LESSONS */}
        {tab === "learn" && (
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.muted, marginBottom: 12, letterSpacing: "0.05em" }}>Best-In-Class Strategic Knowledge</h4>
            {LESSONS.map(l => (
              <div 
                key={l.id} 
                onClick={() => setSelectedLesson(l)}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12, cursor: "pointer", transition: "transform 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ paddingRight: 12 }}>
                  <h5 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{l.title}</h5>
                  <p style={{ fontSize: 12, color: C.muted }}>{l.subtitle}</p>
                </div>
                <span style={{ color: C.accent, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{l.duration} →</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── INTERACTIVE OVERLAY MODALS (STABLE RENDERS) ──────────────────────── */}
      {activeModal === "asset" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(4,6,9,0.85)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, width: "100%", maxWidth: 430, borderRadius: "24px 24px 0 0", padding: "24px 20px 48px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Track New Capital Asset</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Asset Identifier</label>
              <input style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="e.g., Cash Vault, Crypto Wallet" value={newAsset.name} onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Valuation Amount ($)</label>
              <input type="number" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="500" value={newAsset.value} onChange={e => setNewAsset(p => ({ ...p, value: e.target.value }))} />
            </div>
            <button 
              style={{ width: "100%", background: C.accent, color: C.bg, border: "none", padding: 14, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
              disabled={!newAsset.name || !newAsset.value}
              onClick={() => {
                setAssets(prev => [...prev, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value) || 0, type: "verified" }]);
                setActiveModal(null);
                setNewAsset({ name: "", value: "" });
                showToast("New asset factored into structural net worth engine!");
              }}
            >
              Verify & Add Asset
            </button>
          </div>
        </div>
      )}

      {activeModal === "debt" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(4,6,9,0.85)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, width: "100%", maxWidth: 430, borderRadius: "24px 24px 0 0", padding: "24px 20px 48px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Track New Financial Liability</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Liability Account Name</label>
              <input style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="e.g. Card Account" value={newDebt.name} onChange={e => setNewDebt(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Balance Owed ($)</label>
                <input type="number" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="1500" value={newDebt.balance} onChange={e => setNewDebt(p => ({ ...p, balance: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>APR Rate %</label>
                <input type="number" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="24.5" value={newDebt.rate} onChange={e => setNewDebt(p => ({ ...p, rate: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Minimum Required Monthly Payment ($)</label>
              <input type="number" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, outline: "none" }} placeholder="35" value={newDebt.min} onChange={e => setNewDebt(p => ({ ...p, min: e.target.value }))} />
            </div>
            <button 
              style={{ width: "100%", background: C.accent, color: C.bg, border: "none", padding: 14, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
              disabled={!newDebt.name || !newDebt.balance}
              onClick={() => {
                setDebts(prev => [...prev, { id: Date.now(), name: newDebt.name, balance: parseFloat(newDebt.balance) || 0, original: parseFloat(newDebt.balance) * 1.3, rate: parseFloat(newDebt.rate) || 18, min: parseFloat(newDebt.min) || 25 }]);
                setActiveModal(null);
                setNewDebt({ name: "", balance: "", rate: "", min: "" });
                showToast("Liability registered cleanly into matrix algorithms.");
              }}
            >
              Inject Into Payoff Engine
            </button>
          </div>
        </div>
      )}

      {selectedLesson && (
        <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 99999, display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: C.surface, borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.accent, textTransform: "uppercase" }}>Money Education Unit</span>
            <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }} onClick={() => setSelectedLesson(null)}>Close</button>
          </div>
          <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{selectedLesson.heading}</h2>
            <p style={{ fontSize: 14, color: "#D2DEEB", lineHeight: 1.6 }}>{selectedLesson.body}</p>
          </div>
        </div>
      )}

      {/* FIXED BASE FOOTER NAVIGATION TABBAR */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 999 }}>
        <button onClick={() => setTab("home")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, cursor: "pointer", border: "none", background: "none", color: tab === "home" ? C.accent : C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
          Dashboard
        </button>
        <button onClick={() => setTab("plan")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, cursor: "pointer", border: "none", background: "none", color: tab === "plan" ? C.accent : C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
          Payoff Sim
        </button>
        <button onClick={() => setTab("queue")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, cursor: "pointer", border: "none", background: "none", color: tab === "queue" ? C.accent : C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
          Auto-Pilot
        </button>
        <button onClick={() => setTab("learn")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 4, cursor: "pointer", border: "none", background: "none", color: tab === "learn" ? C.accent : C.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
          Learn
        </button>
      </div>

    </div>
  );
}
