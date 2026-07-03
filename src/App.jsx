import { useState, useRef, useEffect } from "react";

// ── PREMIUM PALETTE & DESIGN SYSTEM ─────────────────────────────────────────
const C = {
  bg: "#06090E",        // Deep luxury midnight
  surface: "#0B111A",   // Elevated container surfaces
  card: "#111823",      // High-contrast content cards
  border: "#1C2838",    // Subtle structural borders
  accent: "#B5FF4D",    // High-visibility focus/chartreuse
  red: "#FF5353",       // Risk / Liability
  yellow: "#FFC745",    // Warnings / Target status
  blue: "#4EA1FF",      // Growth / Assets
  purple: "#9E7BFF",    // Special Automations / Equities
  text: "#F0F4F8",      // Crisp readable primary typography
  muted: "#62778F",     // Secondary supportive labels
  success: "#34D399",   // Confirmed actions / Positive metrics
};

const fmt = n => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtD = n => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toDate = m => {
  if (!m || !isFinite(m) || m <= 0 || m > 600) return "Financial Freedom";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(Math.min(m, 600)));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// ── HUMAN-CENTRIC FINANCIAL GLOSSARY ─────────────────────────────────────────
const TERMS = {
  apr: { word: "APR", plain: "Annual borrowing cost", explain: "The annualized percentage cost of your debt. A 20% APR on a $1,000 balance adds roughly $200 in interest over a year if left unpaid." },
  minimum: { word: "Minimum Payment", plain: "Baseline survival payment", explain: "The absolute lowest amount acceptable to protect your credit score. Paying only this amount traps you in an extended interest loop." },
  balance: { word: "Current Balance", plain: "Total outstanding obligation", explain: "The precise net sum required to clear the account completely right now." },
  utilization: { word: "Credit Utilization", plain: "Credit limit usage ratio", explain: "The proportion of your total revolving credit lines currently in use. Keeping this value under 10% signals excellent risk management to lenders." },
  creditScore: { word: "Credit Score", plain: "Financial trust index", explain: "A statistical metric (300–850) that gauges your repayment reliability. High scores secure rock-bottom interest rates on major assets." },
  netWorth: { word: "Net Worth", plain: "Your absolute financial baseline", explain: "Total value of all assets (cash, property, investments) minus all current liabilities. This is your true north metric." },
  avalanche: { word: "Debt Avalanche", plain: "Mathematically optimized payoff", explain: "Directs all excess capital toward the highest-interest liability first. Minimizes lifetime interest expenses down to the dollar." },
  snowball: { word: "Debt Snowball", plain: "Behaviorally optimized payoff", explain: "Eliminates the smallest balance first to build immediate psychology wins. Highly effective for behavioral reinforcement." },
  programmaticEquity: { word: "Smart Equity Routing", plain: "Automated wealth compounding", explain: "Automatically captures vesting equity events (like RSUs or ESPPs) and immediately liquidates or reallocates them into long-term target indexes or core holdings without manual execution delays." }
};

const CSS = `
input, select, textarea { font-size: 16px !important; }
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #06090E; color: #F0F4F8; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
.app { max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #06090E; border-left: 1px solid #1C2838; border-right: 1px solid #1C2838; position: relative; }
.scroll { flex: 1; overflow-y: auto; padding: 16px 16px 100px; }
.scroll::-webkit-scrollbar { display: none; }
.mono { font-family: 'DM Mono', monospace; }
.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: #0B111A; border-top: 1px solid #1C2838; display: flex; z-index: 100; padding-bottom: calc(env(safe-area-inset-bottom) / 2); }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px 0 10px; gap: 4px; cursor: pointer; border: none; background: none; color: #62778F; font-size: 9px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; transition: all .15s ease; }
.tab.on { color: #B5FF4D; }
.tab svg { width: 20px; height: 20px; transition: transform 0.2s; }
.tab.on svg { transform: translateY(-1px); }
.hdr { display: flex; justify-content: space-between; align-items: center; padding: 16px 16px 8px; }
.logo { font-weight: 800; font-size: 20px; letter-spacing: -.03em; }
.card { background: #111823; border: 1px solid #1C2838; border-radius: 14px; padding: 16px; margin-bottom: 12px; position: relative; overflow: hidden; }
.lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #62778F; margin-bottom: 8px; }
.chips { display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; }
.chips::-webkit-scrollbar { display: none; }
.chip { background: #111823; border: 1px solid #1C2838; border-radius: 12px; padding: 12px; min-width: 105px; flex: 1; position: relative; }
.cv { font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 500; line-height: 1.1; color: #F0F4F8; }
.cl { font-size: 10px; color: #62778F; margin-top: 4px; font-weight: 500; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: none; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .15s ease; white-space: nowrap; touch-action: manipulation; }
.bp { background: #B5FF4D; color: #06090E; }
.bp:hover { filter: brightness(1.05); }
.bp:disabled { opacity: .35; cursor: not-allowed; }
.bplus { background: linear-gradient(135deg, #FFC745, #E5A31F); color: #06090E; }
.bg { background: transparent; color: #F0F4F8; border: 1px solid #1C2838; }
.bg:hover { border-color: rgba(181, 255, 77, 0.3); background: rgba(28, 40, 56, 0.2); }
.bsm { padding: 6px 12px; font-size: 11px; border-radius: 8px; }
.bfull { width: 100%; }
.tag { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.tr { background: rgba(255, 83, 83, 0.12); color: #FF5353; border: 1px solid rgba(255, 83, 83, 0.15); }
.tg { background: rgba(52, 211, 153, 0.12); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.15); }
.tb { background: rgba(82, 161, 255, 0.12); color: #4EA1FF; border: 1px solid rgba(82, 161, 255, 0.15); }
.ty { background: rgba(255, 199, 69, 0.12); color: #FFC745; border: 1px solid rgba(255, 199, 69, 0.15); }
.tp { background: rgba(158, 123, 255, 0.12); color: #9E7BFF; border: 1px solid rgba(158, 123, 255, 0.15); }
.inp { background: #0B111A; border: 1px solid #1C2838; border-radius: 10px; padding: 11px 14px; color: #F0F4F8; font-family: 'Inter', sans-serif; font-size: 14px; width: 100%; outline: none; transition: all .15s ease; }
.inp:focus { border-color: rgba(181, 255, 77, 0.6); box-shadow: 0 0 0 2px rgba(181, 255, 77, 0.05); }
.fld { margin-bottom: 12px; }
.flb { font-size: 10px; color: #62778F; margin-bottom: 5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.mover { position: fixed; inset: 0; background: rgba(4, 6, 9, 0.85); z-index: 200; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
.mo { background: #0B111A; border: 1px solid #1C2838; border-radius: 24px 24px 0 0; width: 100%; max-width: 430px; padding: 20px 20px 48px; max-height: 85vh; overflow-y: auto; animation: slideup 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.mo::-webkit-scrollbar { display: none; }
.hdl { width: 36px; height: 4px; background: #1C2838; border-radius: 2px; margin: 0 auto 18px; }
.toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #111823; border: 1px solid #1C2838; border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 600; z-index: 999; display: flex; align-items: center; gap: 10px; box-shadow: 0 12px 32px rgba(0,0,0,0.5); animation: tin 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.pbar { height: 5px; background: #1C2838; border-radius: 3px; overflow: hidden; margin: 4px 0; }
.pfill { height: 100%; border-radius: 3px; transition: width .6s cubic-bezier(0.16, 1, 0.3, 1); }
.irow { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1C2838; }
.irow:last-child { border-bottom: none; }
.fhero { background: linear-gradient(135deg, rgba(181,255,77,0.08), transparent); border: 1px solid rgba(181,255,77,0.2); border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 14px; }
.fdate { font-family: 'DM Mono', monospace; font-size: 24px; font-weight: 500; color: #B5FF4D; margin: 6px 0 4px; }
.sli { -webkit-appearance: none; width: 100%; height: 5px; border-radius: 3px; background: #1C2838; outline: none; margin: 10px 0; }
.sli::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #B5FF4D; cursor: pointer; transition: transform 0.1s; }
.sli::-webkit-slider-thumb:active { transform: scale(1.15); }
.stog { display: flex; background: #111823; border: 1px solid #1C2838; border-radius: 10px; padding: 3px; margin-bottom: 14px; }
.sbtn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; background: transparent; color: #62778F; transition: all .15s ease; }
.sbtn.on { background: #B5FF4D; color: #06090E; }
.ttrk { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; transition: background .2s; position: relative; flex-shrink: 0; }
.ttmb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF; transition: left .2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.subnav { display: flex; gap: 6px; padding: 12px 16px 4px; border-bottom: 1px solid #1C2838; background: #0B111A; flex-shrink: 0; overflow-x: auto; }
.subnav::-webkit-scrollbar { display: none; }
.snbtn { padding: 6px 12px; border-radius: 8px; border: none; background: transparent; color: #62778F; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; cursor: pointer; transition: all .15s ease; white-space: nowrap; }
.snbtn.on { background: rgba(181, 255, 77, 0.12); color: #B5FF4D; border: 1px solid rgba(181, 255, 77, 0.15); }
.tip { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
.tip-icon { width: 14px; height: 14px; border-radius: 50%; background: #1C2838; color: #62778F; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-popup { background: #0B111A; border: 1px solid rgba(181, 255, 77, 0.25); border-radius: 12px; padding: 14px; margin-top: 8px; font-size: 12.5px; color: #A4B3C6; line-height: 1.6; animation: slideup .2s ease; }
.learn-card { background: #111823; border: 1px solid #1C2838; border-radius: 14px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all .2s; }
.learn-card:hover { border-color: rgba(181, 255, 77, 0.25); }
.learn-card.done { border-color: rgba(52, 211, 153, 0.25); background: rgba(11, 26, 18, 0.4); }
.lesson-screen { position: fixed; inset: 0; background: #06090E; z-index: 300; display: flex; flex-direction: column; max-width: 430px; margin: 0 auto; overflow: hidden; }
.lesson-content { flex: 1; overflow-y: auto; padding: 24px 20px 40px; }
.lesson-content::-webkit-scrollbar { display: none; }
.quiz-opt { padding: 14px; border: 1px solid #1C2838; border-radius: 12px; margin-bottom: 10px; cursor: pointer; font-size: 13.5px; color: #F0F4F8; background: #111823; transition: all .15s ease; }
.quiz-opt:hover { border-color: rgba(181, 255, 77, 0.2); }
.quiz-opt.correct { background: rgba(52, 211, 153, 0.12); border-color: #34D399; color: #34D399; }
.quiz-opt.wrong { background: rgba(255, 83, 83, 0.12); border-color: #FF5353; color: #FF5353; }
.real-life { background: linear-gradient(135deg, #111823, #1A150A); border: 1px solid rgba(255, 199, 69, 0.2); border-radius: 12px; padding: 12px 14px; margin-top: 10px; font-size: 12.5px; color: #FFC745; line-height: 1.55; }
.ring { position: relative; width: 140px; height: 140px; margin: 0 auto 14px; }
@keyframes slideup { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tin { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes fall { from { transform: translateY(-24px) rotate(0deg); opacity: 1; } to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
`;

// ── CUSTOM VISUALIZATIONS ───────────────────────────────────────────────────
function Gauge({ pct: p }) {
  const r = 66, cx = 82, cy = 74, toR = d => d * Math.PI / 180, a = Math.min(p || 0, 1) * 180;
  const ax = cx + r * Math.cos(toR(180 - a)), ay = cy - r * Math.sin(toR(180 - a));
  const color = (p || 0) > .7 ? C.red : (p || 0) > .4 ? C.yellow : C.success;
  const arc = (f, t, c) => {
    const x1 = cx + r * Math.cos(toR(180 - f)), y1 = cy - r * Math.sin(toR(180 - f)), x2 = cx + r * Math.cos(toR(180 - t)), y2 = cy - r * Math.sin(toR(180 - t));
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="9" strokeLinecap="butt" />;
  };
  return (
    <div style={{ position: "relative", width: 164, height: 86, margin: "0 auto 4px" }}>
      <svg width="164" height="86" viewBox="0 0 164 86">
        {arc(0, 60, C.success + "25")}{arc(60, 120, C.yellow + "25")}{arc(120, 180, C.red + "25")}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ax} ${ay}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" style={{ transition: "all 0.5s ease" }} />
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
        <circle cx={cx} cy={cy} r="4.5" fill={C.text} />
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
        <div className="mono" style={{ fontSize: 20, fontWeight: 600, color }}>{Math.round((1 - (p || 0)) * 100)}%</div>
        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Paid Off</div>
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 56, cx = 70, cy = 70, circ = 2 * Math.PI * r, p = (score - 300) / 550, dash = circ * p;
  const color = score >= 740 ? C.success : score >= 670 ? C.accent : score >= 580 ? C.yellow : C.red;
  const band = score >= 740 ? "Excellent" : score >= 670 ? "Good" : score >= 580 ? "Fair" : "Poor";
  return (
    <div className="ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 4 }}>{band}</div>
      </div>
    </div>
  );
}

function Toggle({ on, set }) {
  return <button className="ttrk" style={{ background: on ? C.accent : C.border }} onClick={() => set(!on)}><div className="ttmb" style={{ left: on ? 23 : 3 }} /></button>;
}

function Confetti() {
  const dots = Array.from({ length: 35 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 1.0, dur: 1.2 + Math.random() * 0.8, color: [C.accent, C.yellow, C.blue, C.purple, C.success][i % 5], size: 4 + Math.random() * 6 }));
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 499 }}>{dots.map(d => <div key={d.id} style={{ position: "absolute", left: `${d.x}%`, top: 0, width: d.size, height: d.size, borderRadius: 2, background: d.color, animation: `fall ${d.dur}s ${d.delay}s linear forwards` }} />)}</div>;
}

function Tip({ termKey, children }) {
  const [open, setOpen] = useState(false);
  const term = TERMS[termKey];
  if (!term) return <span>{children}</span>;
  return (
    <span>
      <span className="tip" onClick={() => setOpen(v => !v)}>
        <span style={{ borderBottom: `1px dashed ${C.muted}` }}>{children || term.plain}</span>
        <span className="tip-icon">?</span>
      </span>
      {open && (
        <div className="tip-popup">
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 4 }}>{term.word}</div>
          {term.explain}
        </div>
      )}
    </span>
  );
}

// ── CORE FINANCIAL ENGINE ───────────────────────────────────────────────────
function calcHealth({ debts, assets, income, efund, score }) {
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0) + efund;
  const mins = debts.reduce((s, d) => s + d.min, 0);
  const dti = income > 0 ? mins / income : 0;
  const highRate = debts.length > 0 ? Math.max(...debts.map(d => d.rate)) : 0;
  const efGoal = income * 3;
  const efPct = efGoal > 0 ? Math.min(efund / efGoal, 1) : 0;
  const netWorth = totalAssets - totalDebt;
  const safeScore = isFinite(score) && score >= 300 && score <= 850 ? score : 720;

  const factors = [
    { l: "Credit Stability", w: 25, v: safeScore >= 740 ? 100 : safeScore >= 670 ? 75 : safeScore >= 580 ? 50 : 25, c: safeScore >= 740 ? C.success : safeScore >= 670 ? C.accent : safeScore >= 580 ? C.yellow : C.red },
    { l: "Debt-to-Income", w: 25, v: dti < .15 ? 100 : dti < .30 ? 75 : dti < .45 ? 45 : 15, c: dti < .15 ? C.success : dti < .30 ? C.accent : dti < .45 ? C.yellow : C.red },
    { l: "Liquidity Buffer", w: 20, v: Math.round(efPct * 100), c: efPct >= 1 ? C.success : efPct >= 0.5 ? C.yellow : C.red },
    { l: "Rate Optimization", w: 15, v: highRate === 0 ? 100 : highRate < 6 ? 85 : highRate < 15 ? 55 : 20, c: highRate < 6 ? C.success : highRate < 15 ? C.yellow : C.red },
    { l: "Capital Net Growth", w: 15, v: netWorth > 100000 ? 100 : netWorth >= 0 ? Math.min(100, 40 + netWorth / 1500) : 10, c: netWorth >= 0 ? C.success : C.red },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + (f.v * f.w / 100), 0));
  return {
    overall,
    label: overall >= 85 ? "Optimal" : overall >= 70 ? "Healthy" : overall >= 50 ? "Stable" : "Critical Focus",
    color: overall >= 85 ? C.success : overall >= 70 ? C.accent : overall >= 50 ? "Stable" : C.red,
    factors,
    netWorth,
    totalAssets,
    totalDebt
  };
}

// ── APP CONTAINER ───────────────────────────────────────────────────────────
export default function App() {
  // Application Framework States
  const [showOb, setShowOb] = useState(true);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  // Financial Ledger Profile States
  const [profile, setProfile] = useState({ name: "User", hasDebts: false, hasJob: "yes" });
  const [income, setIncome] = useState(8500); 
  const [creditScore, setCreditScore] = useState(740);
  const [efund, setEfund] = useState(25000);
  const [extraPay, setExtraPay] = useState(1500);
  const [strategy, setStrategy] = useState("avalanche");

  // Multi-Asset & Automation Ledger States
  const [assets, setAssets] = useState([
    { id: 1, name: "Core Index Funds (S&P 500)", value: 45000, type: "brokerage" },
    { id: 2, name: "Berkshire Hathaway (BRK.B)", value: 18500, type: "brokerage" }
  ]);
  const [debts, setDebts] = useState([
    { id: 1, name: "Premium Rewards Card", balance: 4200, original: 8500, rate: 22.4, min: 130, type: "credit", color: C.red },
    { id: 2, name: "Auto Loan Line", balance: 14500, original: 22000, rate: 4.8, min: 410, type: "auto", color: C.yellow }
  ]);

  // Premium Human-Centric Automation Flow States
  const [autoRouteEquity, setAutoRouteEquity] = useState(true);
  const [pendingQueue, setPendingQueue] = useState([
    { id: 101, title: "RSU Vest Event (120 Shares)", source: "Corporate Equity Pool", amount: 14500, status: "pending_route", badge: "Equity Vest", type: "rsu" },
    { id: 102, title: "ESPP Cycle Purchase Discount", source: "Employee Stock Plan", amount: 3200, status: "pending_route", badge: "ESPP Flip", type: "espp" },
    { id: 103, title: "External Account Link Verification", source: "Traditional Checking Connection", amount: 0, status: "pending_review", badge: "Security", type: "system" }
  ]);
  const [processedLog, setProcessedLog] = useState([
    { id: 201, text: "✓ Programmatic RSU liquidation executed cleanly ($14,500 redirected to long-term index holdings)" },
    { id: 202, text: "✓ Recurring automated safety margin balance ($500) routed safely to High-Yield Savings Buffer" }
  ]);

  // Modal Interactive States
  const [moOpen, setMoOpen] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: "", balance: "", rate: "", min: "", type: "credit" });
  const [newAsset, setNewAsset] = useState({ name: "", value: "", type: "brokerage" });
  const [learnedLessons, setLearnedLessons] = useState([]);

  const triggerToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (autoRouteEquity) {
      const equityItems = pendingQueue.filter(item => item.type === "rsu" || item.type === "espp");
      if (equityItems.length > 0) {
        const timer = setTimeout(() => {
          equityItems.forEach(item => {
            setProcessedLog(prev => [`✓ Automated Rule Applied: ${item.title} ($${item.amount.toLocaleString()}) liquidated and deployed immediately into BRK.B & core targets.`, ...prev]);
            if (item.amount > 0) {
              setAssets(prev => prev.map(asset => asset.id === 2 ? { ...asset, value: asset.value + item.amount / 2 } : asset.id === 1 ? { ...asset, value: asset.value + item.amount / 2 } : asset));
            }
          });
          setPendingQueue(prev => prev.filter(item => item.type !== "rsu" && item.type !== "espp"));
          triggerToast("Smart Equity Engine auto-routed pipeline items instantly");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [autoRouteEquity, pendingQueue]);

  const h = calcHealth({ debts, assets, income, efund, score: creditScore });

  // ── RENDER SUBCOMPONENTS ──────────────────────────────────────────────────
  return (
    <div className="app">
      <style>{CSS}</style>
      {toast && <div className="toast">✨ <span>{toast}</span></div>}
      {celebrate && <Confetti />}

      {showOb ? (
        <Onboarding onDone={(data) => {
          setProfile(data);
          setIncome(data.income || 8500);
          if (data.firstDebt && data.firstDebt.length > 0) setDebts(data.firstDebt);
          setShowOb(false);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2500);
        }} />
      ) : (
        <>
          {/* HEADER BRANDING */}
          <div className="hdr">
            <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
            <div className="tag tg" style={{ fontWeight: 600 }}>{h.label} ({h.overall}%)</div>
          </div>

          {/* SYSTEM TABS ENGINE */}
          <div className="scroll">
            {tab === "home" && (
              <div>
                <div className="card" style={{ padding: "20px 16px", textAlign: "center", background: `linear-gradient(180deg, ${C.surface} 0%, ${C.card} 100%)` }}>
                  <div className="lbl">True Balance Metric</div>
                  <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: h.netWorth >= 0 ? C.accent : C.red, letterSpacing: "-0.03em" }}>{fmt(h.netWorth)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    Your absolute capital position across <Tip termKey="netWorth">all properties and accounts</Tip>.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>Tracked Assets</div>
                      <div className="mono" style={{ color: C.blue, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalAssets)}</div>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>Outstanding Debt</div>
                      <div className="mono" style={{ color: C.red, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalDebt)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="lbl">Repayment Track</div>
                    <Gauge pct={h.totalDebt === 0 ? 0 : h.totalDebt / (debts.reduce((s, d) => s + d.original, 0) || 1)} />
                  </div>
                  <div className="card" style={{ margin: 0, textAlign: "center" }}>
                    <div className="lbl">Credit Matrix</div>
                    <ScoreRing score={creditScore} />
                  </div>
                </div>

                {/* ASSET ALLOCATION LEDGER */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="lbl" style={{ margin: 0 }}>Capital Allocation & Reserves</div>
                    <button className="btn bg bsm" onClick={() => setMoOpen("asset")}>+ Add Asset</button>
                  </div>
                  <div className="irow">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Liquid Safety Reserve</div>
                      <div style={{ fontSize: 11, color: C.muted }}>High-Yield Cash Vault</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ color: C.success, fontSize: 14, fontWeight: 500 }}>{fmt(efund)}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>3+ Months Safe Cushion</div>
                    </div>
                  </div>
                  {assets.map(a => (
                    <div className="irow" key={a.id}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", fontSize: 9, letterSpacing: ".02em" }}>{a.type} Position</div>
                      </div>
                      <div className="mono" style={{ color: C.blue, fontSize: 14, fontWeight: 500 }}>{fmt(a.value)}</div>
                    </div>
                  ))}
                </div>

                {/* QUICK METRIC CONTROLS */}
                <div className="card">
                  <div className="lbl">Live Financial Adjustments</div>
                  <div className="fld" style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.muted }}>Monthly Capital Overflow Plan:</span>
                      <span className="mono" style={{ color: C.accent, fontWeight: 600 }}>{fmt(extraPay)}/mo</span>
                    </div>
                    <input type="range" className="sli" min="100" max="5000" step="50" value={extraPay} onChange={e => setExtraPay(parseFloat(e.target.value))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                    <div>
                      <div className="flb">Credit Profile Adjustment</div>
                      <input type="number" className="inp mono" value={creditScore} onChange={e => setCreditScore(parseInt(e.target.value) || 300)} />
                    </div>
                    <div>
                      <div className="flb">Base Monthly Net Earnings</div>
                      <input type="number" className="inp mono" value={income} onChange={e => setIncome(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STRATEGY & DEBT OPTIMIZATION VIEW */}
            {tab === "plan" && (
              <div>
                <div className="stog">
                  <button className={`sbtn${strategy === "avalanche" ? " on" : ""}`} onClick={() => setStrategy("avalanche")}>Mathematical Avalanche</button>
                  <button className={`sbtn${strategy === "snowball" ? " on" : ""}`} onClick={() => setStrategy("snowball")}>Psychological Snowball</button>
                </div>

                {(() => {
                  const sorted = [...debts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);
                  let currentPool = extraPay;
                  let totalMonths = 0;
                  let simulationDebts = debts.map(d => ({ ...d }));
                  let lifetimeInterest = 0;

                  while (simulationDebts.some(d => d.balance > 0) && totalMonths < 360) {
                    totalMonths++;
                    let availableExtra = extraPay;
                    
                    simulationDebts.forEach(d => {
                      if (d.balance > 0) {
                        const monthlyInterest = (d.balance * (d.rate / 100)) / 12;
                        lifetimeInterest += monthlyInterest;
                        d.balance += monthlyInterest;
                      }
                    });

                    let activeSort = [...simulationDebts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);
                    
                    for (let target of activeSort) {
                      let originalItem = simulationDebts.find(d => d.id === target.id);
                      if (originalItem && originalItem.balance > 0) {
                        const payment = originalItem.min + availableExtra;
                        if (originalItem.balance <= payment) {
                          availableExtra = payment - originalItem.balance;
                          originalItem.balance = 0;
                        } else {
                          originalItem.balance -= payment;
                          availableExtra = 0;
                          break;
                        }
                      }
                    }
                  }

                  return (
                    <>
                      <div className="fhero">
                        <div className="lbl">Projected Horizon Clear Date</div>
                        <div className="fdate">{toDate(totalMonths)}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                          Paying via the <span style={{ color: C.text, fontWeight: 600 }}>{strategy === "avalanche" ? "Interest Avalanche Plan" : "Balance Snowball Process"}</span> saves thousands in useless compounding fees.
                        </div>
                      </div>

                      <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <div className="lbl" style={{ margin: 0 }}>Liabilities Target Stack</div>
                          <button className="btn bg bsm" onClick={() => setMoOpen("debt")}>+ Add Balance</button>
                        </div>
                        {sorted.map((d, index) => (
                          <div className="irow" key={d.id} style={{ opacity: d.balance === 0 ? 0.4 : 1 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: index === 0 ? C.accent : C.border }} />
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                              </div>
                              <div style={{ fontSize: 11, color: C.muted, marginLeft: 14 }}>
                                {d.rate}% Rate Tier • {fmt(d.min)} Required Min
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{fmt(d.balance)}</div>
                              {index === 0 && d.balance > 0 && <span className="tag tg bsm" style={{ fontSize: 8, padding: "1px 4px", marginTop: 2 }}>Accelerating</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* INTEGRATED MODERN ROUTING & PIPELINE TAB */}
            {tab === "queue" && (
              <div>
                <div className="card" style={{ borderLeft: `4px solid ${C.purple}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div className="lbl" style={{ color: C.purple, margin: 0 }}>Automated Equity Liquidation & Flipping Engine</div>
                    <Toggle on={autoRouteEquity} set={setAutoRouteEquity} />
                  </div>
                  <p style={{ fontSize: 12.5, color: C.muted, linearity: 1.4, marginTop: 6 }}>
                    When enabled, corporate vesting events, RSU occurrences, and ESPP payouts bypass long human delays and route directly into target long-term positions like Berkshire Hathaway or S&P 500 indexes to prevent lifestyle drift.
                  </p>
                </div>

                <div className="lbl" style={{ paddingLeft: 4 }}>Action Items Requiring Approval</div>
                {pendingQueue.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 13 }}>
                    🎉 Inbound pipeline clear. Every system rule is executed cleanly.
                  </div>
                ) : (
                  pendingQueue.map(item => (
                    <div className="card" key={item.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span className={`tag ${item.type === "rsu" || item.type === "espp" ? "tp" : "tb"}`} style={{ fontSize: 9 }}>{item.badge}</span>
                          <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{item.title}</h4>
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Origin: {item.source}</p>
                        </div>
                        {item.amount > 0 && <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: C.accent }}>{fmt(item.amount)}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <button className="btn bp bsm" style={{ flex: 1 }} onClick={() => {
                          if (item.amount > 0) {
                            setAssets(prev => prev.map(a => a.id === 1 ? { ...a, value: a.value + item.amount } : a));
                          }
                          setProcessedLog(prev => [`✓ Approved Manually: ${item.title} safely cleared to Core Accounts`, ...prev]);
                          setPendingQueue(prev => prev.filter(p => p.id !== item.id));
                          triggerToast("Transaction applied to portfolio");
                        }}>Approve Action</button>
                        <button className="btn bg bsm" onClick={() => {
                          setPendingQueue(prev => prev.filter(p => p.id !== item.id));
                          triggerToast("Pipeline alert bypassed");
                        }}>Ignore</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="lbl" style={{ paddingLeft: 4, marginTop: 16 }}>Smart Automation Activity History</div>
                <div className="card" style={{ padding: "12px 16px" }}>
                  {processedLog.map((log, index) => (
                    <div key={index} style={{ fontSize: 12, padding: "10px 0", borderBottom: index === processedLog.length - 1 ? "none" : `1px solid ${C.border}`, color: C.muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: C.success }}>✓</span>
                      <div style={{ lineHeight: 1.4 }}>{log}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONSUMER LESSON ARCHITECTURE */}
            {tab === "learn" && (
              <div>
                <div className="lbl" style={{ paddingLeft: 4 }}>Wealth Concepts Mastery</div>
                {LESSONS.map(l => {
                  const isDone = learnedLessons.includes(l.id);
                  return (
                    <div className={`learn-card${isDone ? " done" : ""}`} key={l.id} onClick={() => setMoOpen({ type: "lesson", data: l })}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <span style={{ fontSize: 24 }}>{l.emoji}</span>
                        <span className="tag bg bsm" style={{ borderColor: l.color, color: l.color }}>{l.duration}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{l.title}</h3>
                      <p style={{ fontSize: 12, color: C.muted }}>{l.subtitle}</p>
                      {isDone && <div style={{ fontSize: 11, color: C.success, fontWeight: 600, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>✓ Strategy Mastered</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TAB ARCHITECTURE BAR */}
          <div className="tabbar">
            <button className={`tab${tab === "home" ? " on" : ""}`} onClick={() => setTab("home")}><I.Home />Home</button>
            <button className={`tab${tab === "plan" ? " on" : ""}`} onClick={() => setTab("plan")}><I.Debt />Payoff</button>
            <button className={`tab${tab === "queue" ? " on" : ""}`} onClick={() => setTab("queue")}><I.Sync />Pipeline</button>
            <button className={`tab${tab === "learn" ? " on" : ""}`} onClick={() => setTab("learn")}><I.Learn />Learn</button>
          </div>
        </>
      )}

      {/* POPUP SYSTEM INTERFACES */}
      {moOpen === "debt" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Log Outstanding Liability</h3>
            <div className="fld"><div className="flb">Account Name</div><input className="inp" placeholder="e.g. Chase Slate Prime" value={newDebt.name} onChange={e => setNewDebt(v => ({ ...v, name: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Liability Type</div>
              <select className="inp" value={newDebt.type} onChange={e => setNewDebt(v => ({ ...v, type: e.target.value }))}>
                <option value="credit">Revolving Credit Line</option>
                <option value="auto">Vehicle Amortization</option>
                <option value="student">Educational Loan Pool</option>
                <option value="personal">Personal Line Variant</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="fld"><div className="flb">Current Balance ($)</div><input className="inp mono" type="number" placeholder="0" value={newDebt.balance} onChange={e => setNewDebt(v => ({ ...v, balance: e.target.value }))} /></div>
              <div className="fld"><div className="flb">Interest Rate Tier (%)</div><input className="inp mono" type="number" placeholder="18.5" value={newDebt.rate} onChange={e => setNewDebt(v => ({ ...v, rate: e.target.value }))} /></div>
            </div>
            <div className="fld"><div className="flb">Mandatory Minimum Monthly Due ($)</div><input className="inp mono" type="number" placeholder="35" value={newDebt.min} onChange={e => setNewDebt(v => ({ ...v, min: e.target.value }))} /></div>
            <button className="btn bp bfull" style={{ marginTop: 10 }} disabled={!newDebt.name || !newDebt.balance} onClick={() => {
              const b = parseFloat(newDebt.balance) || 0;
              setDebts(prev => [...prev, { id: Date.now(), name: newDebt.name, balance: b, original: b * 1.5, rate: parseFloat(newDebt.rate) || 0, min: parseFloat(newDebt.min) || 0, type: newDebt.type, color: C.accent }]);
              setMoOpen(null);
              setNewDebt({ name: "", balance: "", rate: "", min: "", type: "credit" });
              triggerToast("Liability structural layer added successfully");
            }}>Inject Balance Into Track</button>
          </div>
        </div>
      )}

      {moOpen === "asset" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Track Additional Asset Pillar</h3>
            <div className="fld"><div className="flb">Asset Asset Description</div><input className="inp" placeholder="e.g. High Yield Index Vault" value={newAsset.name} onChange={e => setNewAsset(v => ({ ...v, name: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Asset Classification</div>
              <select className="inp" value={newAsset.type} onChange={e => setNewAsset(v => ({ ...v, type: e.target.value }))}>
                <option value="brokerage">Liquid Brokerage Position</option>
                <option value="realestate">Real Property / Land Equity</option>
                <option value="cash">High-Yield Alternative Cash</option>
              </select>
            </div>
            <div className="fld"><div className="flb">Total Present Value Base ($)</div><input className="inp mono" type="number" placeholder="5000" value={newAsset.value} onChange={e => setNewAsset(v => ({ ...v, value: e.target.value }))} /></div>
            <button className="btn bp bfull" style={{ marginTop: 10 }} disabled={!newAsset.name || !newAsset.value} onClick={() => {
              setAssets(prev => [...prev, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value) || 0, type: newAsset.type }]);
              setMoOpen(null);
              setNewAsset({ name: "", value: "", type: "brokerage" });
              triggerToast("Asset profile mapped successfully");
            }}>Inject Asset Capital</button>
          </div>
        </div>
      )}

      {/* DYNAMIC INTEGRATED LESSON OVERLAY VIEW */}
      {moOpen?.type === "lesson" && (
        <LessonOverlay lesson={moOpen.data} onClose={() => setMoOpen(null)} onComplete={(id) => {
          if (!learnedLessons.includes(id)) setLearnedLessons(v => [...v, id]);
          setMoOpen(null);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
          triggerToast("Strategy Added to Framework Profile");
        }} />
      )}
    </div>
  );
}

// ── EXTENSIVE INTERACTIVE QUIZ & DIALOG COMPONENT ─────────────────────────────
function LessonOverlay({ lesson, onClose, onComplete }) {
  const [currStep, setCurrStep] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const isQuiz = lesson.steps[currStep].type === "quiz";

  const handleNext = () => {
    setSelectedOpt(null);
    if (currStep < lesson.steps.length - 1) {
      setCurrStep(v => v + 1);
    } else {
      onComplete(lesson.id);
    }
  };

  return (
    <div className="lesson-screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{lesson.emoji}</span>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{lesson.title}</div>
        </div>
        <button className="btn bg bsm" onClick={onClose}>Exit Module</button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "10px 20px 0" }}>
        {lesson.steps.map((_, idx) => <div key={idx} className={`ps${idx <= currStep ? " on" : ""}`} />)}
      </div>

      <div className="lesson-content">
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, lineHeight: 1.25 }}>{lesson.steps[currStep].heading}</h2>
        <p style={{ fontSize: 14, color: "#D2DEEB", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: 16 }}>{lesson.steps[currStep].body}</p>

        {lesson.steps[currStep].realLife && (
          <div className="real-life">
            <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 9, letterSpacing: ".06em", marginBottom: 4 }}>Production Example Matrix</div>
            {lesson.steps[currStep].realLife}
          </div>
        )}

        {isQuiz && (
          <div style={{ marginTop: 20 }}>
            {lesson.steps[currStep].options.map((opt, oIdx) => {
              let isCorrect = oIdx === lesson.steps[currStep].correct;
              let cls = "quiz-opt";
              if (selectedOpt !== null) {
                if (isCorrect) cls += " correct";
                else if (selectedOpt === oIdx) cls += " wrong";
              }
              return (
                <div key={oIdx} className={cls} onClick={() => selectedOpt === null && setSelectedOpt(oIdx)}>
                  {opt}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: 20, background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <button className="btn bp bfull" style={{ padding: 14 }} disabled={isQuiz && selectedOpt === null} onClick={handleNext}>
          {currStep === lesson.steps.length - 1 ? "Incorporate Into My Strategy Plan" : "Proceed Concept →"}
        </button>
      </div>
    </div>
  );
}

// ── COMPLETE CURATED LESSON CONTENT ──────────────────────────────────────────
const LESSONS = [
  {
    id: "credit-cards",
    emoji: "💳",
    title: "Credit Card Dynamics",
    subtitle: "Reconciling high-rate interest vs capital accumulation tools",
    duration: "2 min",
    color: C.red,
    steps: [
      {
        type: "explain",
        heading: "A revolving line is short-term leverage",
        body: "Swiping a credit card does not engage your liquid assets. You are utilizing short-term institutional bank floats.\n\nFailure to reconcile the absolute net balance statement balance before the 30-day grace period collapses the float and activates aggressive compound interest.",
        realLife: "🛒 Buy $100 of household components. Pay it off within the monthly billing envelope: cost remains exactly $100. Let it drift at 24% APR: cost runs to $124 annually.",
      },
      {
        type: "explain",
        heading: "The minimum due metric is a mathematical filter",
        body: "Institutions calculate the lowest permissible payment explicitly to extend the lifespan of your liability. It optimizes their profit vector.\n\nMaintaining a static balance while paying minimal allowances drags recovery out across decades.",
        realLife: "⚠️ Servicing a $1,000 retail line balance entirely via basic $25/mo standard minimum requests forces a 5-year payback cycle, matching the principal amount with excess interest.",
      },
      {
        type: "quiz",
        heading: "What happens mathematically if you settle the statement net value in full before the closing cycle date?",
        body: "Test your system comprehension below:",
        options: [
          "The account triggers standard APR calculation mechanics on outstanding metrics.",
          "You entirely bypass interest obligations, extracting free card points and credit line scoring gains.",
          "The transaction line triggers credit utilization alert penalties instantly."
        ],
        correct: 1
      }
    ]
  },
  {
    id: "equity-flipping",
    emoji: "📈",
    title: "Programmatic Equity Routing",
    subtitle: "Maximizing single-stock diversification vectors automatically",
    duration: "3 min",
    color: C.purple,
    steps: [
      {
        type: "explain",
        heading: "Preventing individual concentration traps",
        body: "Holding heavy positions in company equity (RSUs or ESPP shares) binds your current household income and asset ecosystem to one single corporate entity.\n\nLiquidating shares instantly upon vest structures an automated programmatic loop to redirect volatile compensation directly into broader equity metrics.",
        realLife: "⚡ Allowing $20,000 in company shares to clear and immediately transferring funds into baseline S&P 500 options or asset vehicles completely mitigates corporate-specific shocks.",
      },
      {
        type: "quiz",
        heading: "Why does automated equity flipping outpace manual transaction decisions over a standard multi-year window?",
        body: "Select the optimal asset perspective:",
        options: [
          "It completely avoids standard single-stock income tax structures entirely.",
          "It eliminates emotional friction, market-timing delays, and execution drift, compounding capital safely.",
          "It keeps the capital stuck indefinitely in low-yield cash accounts."
        ],
        correct: 1
      }
    ]
  }
];

// ── CRADLE ONBOARDING SUB-FLOW COMPONENT ──────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [hasDebts, setHasDebts] = useState(null);
  const [hasJob, setHasJob] = useState(null);
  const [income, setIncome] = useState("");
  const [firstDebt, setFirstDebt] = useState({ name: "", balance: "", rate: "", min: "", type: "credit" });

  const next = () => {
    if (step === 0 && !name.trim()) return;
    if (step < 3) { setStep(s => s + 1); return; }
    if (step === 3) {
      if (hasDebts === true) { setStep(4); return; }
      finish(); return;
    }
    finish();
  };

  const finish = (overrideDebt) => {
    const src = overrideDebt || firstDebt;
    const debt = src.name && src.balance ? [{ id: Date.now(), name: src.name, balance: parseFloat(src.balance) || 0, original: (parseFloat(src.balance) || 0) * 1.6, rate: parseFloat(src.rate) || 0, min: parseFloat(src.min) || 0, type: src.type, color: C.red }] : [];
    onDone({ name, hasDebts, hasJob, income: parseFloat(income) || 0, firstDebt: debt });
  };

  return (
    <div className="ob">
      <div style={{ display: "flex", justify: "space-between", align"items": "center", marginBottom: 24 }}>
        <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
        {step > 0 && <button className="btn bg bsm" onClick={() => setStep(s => s - 1)}>← Previous Step</button>}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {[0, 1, 2, 3, 4].map(i => <div key={i} className={`opip${i <= step ? " on" : ""}`} />)}
      </div>

      {step === 0 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Establish Profile Identity</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.55 }}>Welcome to moneycode. We structure modern personal balance sheets and maximize algorithmic wealth paths without manual data friction.</p>
        <div className="fld"><input className="inp" placeholder="Legal First Name" value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 16, padding: "14px" }} /></div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 8 }} disabled={!name.trim()} onClick={next}>Initialize System Layout →</button>
      </>}

      {step === 1 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Are there active liabilities to calculate?</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Credit reward lines, structural vehicular loans, or asset leverage pools all count.</p>
        {[
          { id: true, e: "⚡", l: "Yes — Outlining Active Debts", s: "Car lines, revolving balances, legacy accounts." },
          { id: false, e: "💎", l: "No — Debt Free Starting Position", s: "Zero active systemic consumer liabilities to clear." }
        ].map(o => (
          <div key={String(o.id)} className={`oopt${hasDebts === o.id ? " on" : ""}`} onClick={() => setHasDebts(o.id)}>
            <span style={{ fontSize: 20, width: 32 }}>{o.e}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.l}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.s}</div></div>
          </div>
        ))}
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} disabled={hasDebts === null} onClick={next}>Map Parameters →</button>
      </>}

      {step === 2 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Income Infrastructure Pattern</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>We map consistent inbound flows to allocate systematic safety margins.</p>
        {[
          { id: "yes", e: "💰", l: "Predictable Capital Inflow", s: "Salaried positions, corporate dividends, steady draws." },
          { id: "sometimes", e: "📊", l: "Variable Cyclical Inbound", s: "Performance-incentive tiers, project structures, variable commissions." },
          { id: "no", e: "☕", l: "No Inbound Revenue Architecture", s: "Repositioning capital or strictly focused on allocations right now." }
        ].map(o => (
          <div key={o.id} className={`oopt${hasJob === o.id ? " on" : ""}`} onClick={() => setHasJob(o.id)}>
            <span style={{ fontSize: 20, width: 32 }}>{o.e}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.l}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.s}</div></div>
          </div>
        ))}
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} disabled={!hasJob} onClick={next}>Map Parameters →</button>
      </>}

      {step === 3 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💵</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Net Regular Take-Home Cash Flow</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Your baseline monthly disposable liquid position after structural adjustments and tax filters.</p>
        <div className="fld" style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 16 }}>$</span>
          <input className="inp mono" type="number" placeholder="5500" value={income} onChange={e => setIncome(e.target.value)} style={{ paddingLeft: 28, fontSize: 18, padding: "14px" }} />
        </div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} onClick={next}>{income ? "Generate Strategy Engine →" : "Bypass For Calibration"}</button>
      </>}

      {step === 4 && hasDebts === true && <>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Initialize Primary Liability Entry</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Inject a primary line to evaluate payoff optimization trajectories.</p>
        <div className="fld"><div className="flb">Descriptor</div><input className="inp" placeholder="e.g. Card Account Alpha" value={firstDebt.name} onChange={e => setFirstDebt(v => ({ ...v, name: e.target.value }))} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="fld"><div className="flb">Balance ($)</div><input className="inp mono" type="number" placeholder="4500" value={firstDebt.balance} onChange={e => setFirstDebt(v => ({ ...v, balance: e.target.value }))} /></div>
          <div className="fld"><div className="flb">APR Tier (%)</div><input className="inp mono" type="number" placeholder="21.9" value={firstDebt.rate} onChange={e => setFirstDebt(v => ({ ...v, rate: e.target.value }))} /></div>
        </div>
        <div className="fld"><div className="flb">Min Due Payment ($)</div><input className="inp mono" type="number" placeholder="120" value={firstDebt.min} onChange={e => setFirstDebt(v => ({ ...v, min: e.target.value }))} /></div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 8 }} disabled={!firstDebt.name || !firstDebt.balance} onClick={() => finish()}>Synthesize Portfolio Tracker →</button>
      </>}
    </div>
  );
}

// ── TRADITIONAL UTILITY SVG CONSTANTS ────────────────────────────────────────
const I = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Debt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Sync: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Learn: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
};
