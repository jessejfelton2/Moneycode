import { useState, useRef, useEffect } from "react";

// ── COLOR SYSTEM ────────────────────────────────────────────────────────────
const C = {
  bg: "#06090E",        // Dark mode background
  surface: "#0B111A",   // Card background
  card: "#111823",      // Secondary containers
  border: "#1C2838",    // Clean dividers
  accent: "#B5FF4D",    // Bright electric green for emphasis
  red: "#FF5353",       // Debts / Warnings
  yellow: "#FFC745",    // Medium priority / Alerts
  blue: "#4EA1FF",      // Assets / Growth
  purple: "#9E7BFF",    // Auto-invest features
  text: "#F0F4F8",      // Clear text
  muted: "#62778F",     // Secondary text
  success: "#34D399",   // Completed / Good status
};

const fmt = n => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtD = n => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toDate = m => {
  if (!m || !isFinite(m) || m <= 0 || m > 360) return "Debt Free!";
  const d = new Date();
  d.setMonth(d.getMonth() + Math.round(Math.min(m, 360)));
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

// ── MONEY TERMS EXPLAINED SIMPLY ─────────────────────────────────────────────
const TERMS = {
  apr: { word: "Interest Rate (APR)", plain: "The yearly cost of borrowing", explain: "The annual percentage cost of your debt. For example, a 20% APR on a $1,000 credit card balance adds about $200 in interest over a year if left unpaid." },
  minimum: { word: "Minimum Payment", plain: "The lowest amount you must pay", explain: "The absolute lowest amount the bank will accept to keep your credit score safe. Only paying this keeps you in debt for years." },
  balance: { word: "Current Balance", plain: "Total amount you owe", explain: "The exact amount you need to pay right now to completely clear this account." },
  utilization: { word: "Credit Usage", plain: "How much credit you're using", explain: "The percentage of your total credit card limits you are currently using. Keeping this under 30% helps boost your credit score." },
  creditScore: { word: "Credit Score", plain: "Your financial trust score", explain: "A number from 300 to 850 that shows banks how reliable you are. High scores let you borrow money at much cheaper rates." },
  netWorth: { word: "Net Worth", plain: "Your true financial balance", explain: "Everything you own (cash, savings, investments) minus everything you owe (credit cards, loans). This is your true financial starting line." },
  avalanche: { word: "Debt Avalanche", plain: "Highest interest rate first", explain: "Puts all extra cash toward the debt with the highest interest rate first. This is mathematically the fastest way to save money on interest fees." },
  snowball: { word: "Debt Snowball", plain: "Smallest balance first", explain: "Puts all extra cash toward the smallest debt balance first. This gives you quick mental wins to help you stay motivated." },
  programmaticEquity: { word: "Auto-Investing", plain: "Hands-free wealth building", explain: "Automatically moving extra cash, work bonuses, or company stock options into your long-term investments before you have a chance to spend it." }
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
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px 0 10px; gap: 4px; cursor: pointer; border: none; background: none; color: #62778F; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; transition: all .15s ease; }
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
.mo { background: #0B111A; border: 1px solid #1C2838; border-radius: 24px 24px 0 0; width: 100%; max-width: 430px; padding: 20px 20px 48px; max-height: 85vh; overflow-y: auto; }
.mo::-webkit-scrollbar { display: none; }
.hdl { width: 36px; height: 4px; background: #1C2838; border-radius: 2px; margin: 0 auto 18px; }
.toast { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); background: #111823; border: 1px solid #1C2838; border-radius: 10px; padding: 10px 16px; font-size: 12px; font-weight: 600; z-index: 999; display: flex; align-items: center; gap: 10px; box-shadow: 0 12px 32px rgba(0,0,0,0.5); }
.pbar { height: 5px; background: #1C2838; border-radius: 3px; overflow: hidden; margin: 4px 0; }
.pfill { height: 100%; border-radius: 3px; }
.irow { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1C2838; }
.irow:last-child { border-bottom: none; }
.fhero { background: linear-gradient(135deg, rgba(181,255,77,0.08), transparent); border: 1px solid rgba(181,255,77,0.2); border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 14px; }
.fdate { font-family: 'DM Mono', monospace; font-size: 24px; font-weight: 500; color: #B5FF4D; margin: 6px 0 4px; }
.sli { -webkit-appearance: none; width: 100%; height: 5px; border-radius: 3px; background: #1C2838; outline: none; margin: 10px 0; }
.sli::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #B5FF4D; cursor: pointer; transition: transform 0.1s; }
.stog { display: flex; background: #111823; border: 1px solid #1C2838; border-radius: 10px; padding: 3px; margin-bottom: 14px; }
.sbtn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; background: transparent; color: #62778F; transition: all .15s ease; }
.sbtn.on { background: #B5FF4D; color: #06090E; }
.ttrk { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; transition: background .2s; position: relative; flex-shrink: 0; }
.ttmb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF; transition: left .2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.tip { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
.tip-icon { width: 14px; height: 14px; border-radius: 50%; background: #1C2838; color: #62778F; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tip-popup { background: #0B111A; border: 1px solid rgba(181, 255, 77, 0.25); border-radius: 12px; padding: 14px; margin-top: 8px; font-size: 12.5px; color: #A4B3C6; line-height: 1.6; }
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
.ob { padding: 24px 16px; min-height: 100vh; display: flex; flex-direction: column; background: #06090E; }
.opip { flex: 1; height: 4px; background: #1C2838; border-radius: 2px; }
.opip.on { background: #B5FF4D; }
.oopt { background: #111823; border: 1px solid #1C2838; border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.oopt.on { border-color: #B5FF4D; background: rgba(181, 255, 77, 0.04); }
.ps { flex: 1; height: 4px; background: #1C2838; border-radius: 2px; }
.ps.on { background: #B5FF4D; }
@keyframes fall { from { transform: translateY(-24px) rotate(0deg); opacity: 1; } to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
`;

// ── VISUAL COMPONENTS ────────────────────────────────────────────────────────
function Gauge({ pct: p }) {
  const r = 66, cx = 82, cy = 74, toR = d => d * Math.PI / 180, a = Math.min(p || 0, 1) * 180;
  const ax = cx + r * Math.cos(toR(180 - a)), ay = cy - r * Math.sin(toR(180 - a));
  const color = (p || 0) > .7 ? C.red : (p || 0) > .4 ? C.yellow : C.success;
  const arc = (f, t, c) => {
    const x1 = cx + r * Math.cos(toR(180 - f)), y1 = cy - r * Math.sin(toR(180 - f)), x2 = cx + r * Math.cos(toR(180 - t)), y2 = cy - r * Math.sin(toR(180 - t));
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="9" />;;
  };
  return (
    <div style={{ position: "relative", width: 164, height: 86, margin: "0 auto 4px" }}>
      <svg width="164" height="86" viewBox="0 0 164 86">
        {arc(0, 60, C.success + "25")}{arc(60, 120, C.yellow + "25")}{arc(120, 180, C.red + "25")}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ax} ${ay}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
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

// ── CORE MATH ENGINE ─────────────────────────────────────────────────────────
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
    { l: "Credit Score Status", w: 25, v: safeScore >= 740 ? 100 : safeScore >= 670 ? 75 : safeScore >= 580 ? 50 : 25, c: safeScore >= 740 ? C.success : safeScore >= 670 ? C.accent : safeScore >= 580 ? C.yellow : C.red },
    { l: "Monthly Debt Load", w: 25, v: dti < .15 ? 100 : dti < .30 ? 75 : dti < .45 ? 45 : 15, c: dti < .15 ? C.success : dti < .30 ? C.accent : dti < .45 ? C.yellow : C.red },
    { l: "Emergency Fund Progress", w: 20, v: Math.round(efPct * 100), c: efPct >= 1 ? C.success : efPct >= 0.5 ? C.yellow : C.red },
    { l: "Interest Optimization", w: 15, v: highRate === 0 ? 100 : highRate < 6 ? 85 : highRate < 15 ? 55 : 20, c: highRate < 6 ? C.success : highRate < 15 ? C.yellow : C.red },
    { l: "Savings Growth Metric", w: 15, v: netWorth > 100000 ? 100 : netWorth >= 0 ? Math.min(100, 40 + netWorth / 1500) : 10, c: netWorth >= 0 ? C.success : C.red },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + (f.v * f.w / 100), 0));
  return {
    overall,
    label: overall >= 85 ? "Excellent" : overall >= 70 ? "Healthy" : overall >= 50 ? "Stable" : "Needs Focus",
    color: overall >= 85 ? C.success : overall >= 70 ? C.accent : overall >= 50 ? "Stable" : C.red,
    factors,
    netWorth,
    totalAssets,
    totalDebt
  };
}

// ── APP CONTAINER ───────────────────────────────────────────────────────────
export default function App() {
  const [showOb, setShowOb] = useState(true);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  // User Financial State
  const [profile, setProfile] = useState({ name: "User", hasDebts: false, hasJob: "yes" });
  const [income, setIncome] = useState(3500); 
  const [creditScore, setCreditScore] = useState(710);
  const [efund, setEfund] = useState(3000);
  const [extraPay, setExtraPay] = useState(300);
  const [strategy, setStrategy] = useState("avalanche");

  const [assets, setAssets] = useState([
    { id: 1, name: "Crypto & Stock Account", value: 1200, type: "brokerage" }
  ]);
  const [debts, setDebts] = useState([
    { id: 1, name: "Main Credit Card", balance: 2400, original: 4000, rate: 22.4, min: 75, type: "credit", color: C.red },
    { id: 2, name: "Car Loan Owed", balance: 9500, original: 15000, rate: 5.5, min: 280, type: "auto", color: C.yellow }
  ]);

  // Simplifed To-Do Action Items
  const [autoRouteEquity, setAutoRouteEquity] = useState(true);
  const [pendingQueue, setPendingQueue] = useState([
    { id: 101, title: "Work Bonus / Birthday Gift", source: "Pending Transfer", amount: 250, badge: "Extra Cash", type: "bonus" },
    { id: 102, title: "Spare Change Round-Ups", source: "Weekly Accumulation", amount: 35, badge: "Micro Saving", type: "roundup" }
  ]);
  const [processedLog, setProcessedLog] = useState([
    { id: 201, text: "✓ Sent $150 extra cash to pay down your Main Credit Card balance." },
    { id: 202, text: "✓ Moved $50 from checking straight to your Emergency Savings Fund." }
  ]);

  const [moOpen, setMoOpen] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: "", balance: "", rate: "", min: "", type: "credit" });
  const [newAsset, setNewAsset] = useState({ name: "", value: "", type: "brokerage" });
  const [learnedLessons, setLearnedLessons] = useState([]);

  const triggerToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const h = calcHealth({ debts, assets, income, efund, score: creditScore });

  return (
    <div className="app">
      <style>{CSS}</style>
      {toast && <div className="toast">✨ <span>{toast}</span></div>}
      {celebrate && <Confetti />}

      {showOb ? (
        <Onboarding onDone={(data) => {
          setProfile(data);
          setIncome(data.income || 3500);
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
            <div className="tag tg" style={{ fontWeight: 600 }}>Score: {h.overall}% ({h.label})</div>
          </div>

          <div className="scroll">
            {/* HOME DASHBOARD */}
            {tab === "home" && (
              <div>
                <div className="card" style={{ padding: "20px 16px", textAlign: "center", background: `linear-gradient(180deg, ${C.surface} 0%, ${C.card} 100%)` }}>
                  <div className="lbl">Net Worth (Your True Balance)</div>
                  <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: h.netWorth >= 0 ? C.accent : C.red, letterSpacing: "-0.03em" }}>{fmt(h.netWorth)}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    This is everything you own minus everything you owe.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>What You Own (Assets)</div>
                      <div className="mono" style={{ color: C.blue, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalAssets)}</div>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>What You Owe (Debts)</div>
                      <div className="mono" style={{ color: C.red, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalDebt)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="lbl">Payoff Progress</div>
                    <Gauge pct={h.totalDebt === 0 ? 0 : h.totalDebt / (debts.reduce((s, d) => s + d.original, 0) || 1)} />
                  </div>
                  <div className="card" style={{ margin: 0, textAlign: "center" }}>
                    <div className="lbl">Credit Score</div>
                    <ScoreRing score={creditScore} />
                  </div>
                </div>

                {/* SAVINGS & ASSETS */}
                <div className="card">
                  <div style={{ display: "flex", justifycontent: "space-between", alignitems: "center", marginBottom: 12, justifyContent: "space-between" }}>
                    <div className="lbl" style={{ margin: 0 }}>Your Savings & Investments</div>
                    <button className="btn bg bsm" onClick={() => setMoOpen("asset")}>+ Add Asset</button>
                  </div>
                  <div className="irow">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Emergency Cash Fund</div>
                      <div style={{ fontSize: 11, color: C.muted }}>High-Yield Savings</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ color: C.success, fontSize: 14, fontWeight: 500 }}>{fmt(efund)}</div>
                    </div>
                  </div>
                  {assets.map(a => (
                    <div className="irow" key={a.id}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ color: C.muted, fontSize: 10 }}>Investments</div>
                      </div>
                      <div className="mono" style={{ color: C.blue, fontSize: 14, fontWeight: 500 }}>{fmt(a.value)}</div>
                    </div>
                  ))}
                </div>

                {/* DASHBOARD ADJUSTMENTS */}
                <div className="card">
                  <div className="lbl">Test Your Strategy</div>
                  <div className="fld" style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.muted }}>Extra Monthly Payment Plan:</span>
                      <span className="mono" style={{ color: C.accent, fontWeight: 600 }}>{fmt(extraPay)}/mo</span>
                    </div>
                    <input type="range" className="sli" min="0" max="2000" step="25" value={extraPay} onChange={e => setExtraPay(parseFloat(e.target.value))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                    <div>
                      <div className="flb">Your Credit Score</div>
                      <input type="number" className="inp mono" value={creditScore} onChange={e => setCreditScore(parseInt(e.target.value) || 300)} />
                    </div>
                    <div>
                      <div className="flb">Monthly Income (Post-Tax)</div>
                      <input type="number" className="inp mono" value={income} onChange={e => setIncome(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYOFF TAB */}
            {tab === "plan" && (
              <div>
                <div className="stog">
                  <button className={`sbtn${strategy === "avalanche" ? " on" : ""}`} onClick={() => setStrategy("avalanche")}>Highest Interest First (Avalanche)</button>
                  <button className={`sbtn${strategy === "snowball" ? " on" : ""}`} onClick={() => setStrategy("snowball")}>Smallest Balance First (Snowball)</button>
                </div>

                {(() => {
                  let totalMonths = 0;
                  let simulationDebts = debts.map(d => ({ ...d }));
                  let maxLimit = 360; 

                  while (simulationDebts.some(d => d.balance > 0) && totalMonths < maxLimit) {
                    totalMonths++;
                    
                    // Add monthly interest
                    simulationDebts.forEach(d => {
                      if (d.balance > 0) {
                        d.balance += d.balance * ((d.rate / 100) / 12);
                      }
                    });

                    let extraPool = extraPay;

                    // Pay minimums first
                    simulationDebts.forEach(d => {
                      if (d.balance > 0) {
                        if (d.balance <= d.min) {
                          extraPool += (d.min - d.balance);
                          d.balance = 0;
                        } else {
                          d.balance -= d.min;
                        }
                      }
                    });

                    // Direct leftover cash to the chosen target priority card
                    let activeSort = [...simulationDebts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);
                    for (let target of activeSort) {
                      let originalItem = simulationDebts.find(d => d.id === target.id);
                      if (originalItem && originalItem.balance > 0) {
                        if (originalItem.balance <= extraPool) {
                          extraPool -= originalItem.balance;
                          originalItem.balance = 0;
                        } else {
                          originalItem.balance -= extraPool;
                          extraPool = 0;
                          break;
                        }
                      }
                    }
                  }

                  const sortedDisplay = [...debts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);

                  return (
                    <>
                      <div className="fhero">
                        <div className="lbl">Your Estimated Debt-Free Date</div>
                        <div className="fdate">{toDate(totalMonths)}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                          Paying using the <span style={{ color: C.text, fontWeight: 600 }}>{strategy === "avalanche" ? "Avalanche Plan" : "Snowball Plan"}</span> saves you money on high interest fees.
                        </div>
                      </div>

                      <div className="card">
                        <div style={{ display: "flex", justifycontent: "space-between", alignitems: "center", marginBottom: 14, justifyContent: "space-between" }}>
                          <div className="lbl" style={{ margin: 0 }}>Your Debt List</div>
                          <button className="btn bg bsm" onClick={() => setMoOpen("debt")}>+ Add Debt</button>
                        </div>
                        {sortedDisplay.map((d, index) => (
                          <div className="irow" key={d.id} style={{ opacity: d.balance === 0 ? 0.4 : 1 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: index === 0 && d.balance > 0 ? C.accent : C.border }} />
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                              </div>
                              <div style={{ fontSize: 11, color: C.muted, marginLeft: 14 }}>
                                {d.rate}% interest • {fmt(d.min)}/mo min payment
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{fmt(d.balance)}</div>
                              {index === 0 && d.balance > 0 && <span className="tag tg bsm" style={{ fontSize: 8, padding: "1px 4px", marginTop: 2 }}>Paying Extra</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* AUTO-PILOT TAB (No crash loops, pure manual or clean state execution) */}
            {tab === "queue" && (
              <div>
                <div className="card" style={{ borderLeft: `4px solid ${C.purple}` }}>
                  <div style={{ display: "flex", justifycontent: "space-between", alignitems: "center", marginBottom: 6, justifyContent: "space-between" }}>
                    <div className="lbl" style={{ color: C.purple, margin: 0 }}>Auto-Invest Work Bonuses & Extra Cash</div>
                    <Toggle on={autoRouteEquity} set={setAutoRouteEquity} />
                  </div>
                  <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4, marginTop: 6 }}>
                    When turned on, any sudden cash bonuses, extra cash gifts, or spare round-ups can clear automatically into your long-term savings or debt accounts before you have a chance to spend it.
                  </p>
                </div>

                <div className="lbl" style={{ paddingLeft: 4 }}>Pending Moves to Review</div>
                {pendingQueue.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 13 }}>
                    🎉 No pending items! Your savings rules are running smoothly.
                  </div>
                ) : (
                  pendingQueue.map(item => (
                    <div className="card" key={item.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span className="tag tp" style={{ fontSize: 9 }}>{item.badge}</span>
                          <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{item.title}</h4>
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{item.source}</p>
                        </div>
                        {item.amount > 0 && <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: C.accent }}>{fmt(item.amount)}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <button className="btn bp bsm" style={{ flex: 1 }} onClick={() => {
                          if (item.amount > 0) {
                            setAssets(prev => prev.map(a => a.id === 1 ? { ...a, value: a.value + item.amount } : a));
                          }
                          setProcessedLog(prev => [`✓ Approved: Moved ${fmt(item.amount)} from "${item.title}" straight into your savings!`, ...prev]);
                          setPendingQueue(prev => prev.filter(p => p.id !== item.id));
                          triggerToast("Money moved successfully!");
                        }}>Approve & Move Money</button>
                        <button className="btn bg bsm" onClick={() => {
                          setPendingQueue(prev => prev.filter(p => p.id !== item.id));
                          triggerToast("Item skipped");
                        }}>Skip</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="lbl" style={{ paddingLeft: 4, marginTop: 16 }}>Auto-Pilot History</div>
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

            {/* LEARN TAB */}
            {tab === "learn" && (
              <div>
                <div className="lbl" style={{ paddingLeft: 4 }}>Learn the Basics</div>
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
                      {isDone && <div style={{ fontSize: 11, color: C.success, fontWeight: 600, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>✓ Topic Mastered</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TAB BAR */}
          <div className="tabbar">
            <button className={`tab${tab === "home" ? " on" : ""}`} onClick={() => setTab("home")}><I.Home />Home</button>
            <button className={`tab${tab === "plan" ? " on" : ""}`} onClick={() => setTab("plan")}><I.Debt />Payoff Plan</button>
            <button className={`tab${tab === "queue" ? " on" : ""}`} onClick={() => setTab("queue")}><I.Sync />Auto-Pilot</button>
            <button className={`tab${tab === "learn" ? " on" : ""}`} onClick={() => setTab("learn")}><I.Learn />Learn</button>
          </div>
        </>
      )}

      {/* POPUP: ADD A DEBT */}
      {moOpen === "debt" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Add a Debt</h3>
            <div className="fld"><div className="flb">Name (e.g., Credit Card, Car Loan)</div><input className="inp" placeholder="e.g. Discover Card" value={newDebt.name} onChange={e => setNewDebt(v => ({ ...v, name: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Type of Debt</div>
              <select className="inp" value={newDebt.type} onChange={e => setNewDebt(v => ({ ...v, type: e.target.value }))}>
                <option value="credit">Credit Card</option>
                <option value="auto">Car Loan</option>
                <option value="student">Student Loan</option>
                <option value="personal">Personal Loan</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="fld"><div className="flb">Balance Owed ($)</div><input className="inp mono" type="number" placeholder="0" value={newDebt.balance} onChange={e => setNewDebt(v => ({ ...v, balance: e.target.value }))} /></div>
              <div className="fld"><div className="flb">Interest Rate (APR %)</div><input className="inp mono" type="number" placeholder="18.5" value={newDebt.rate} onChange={e => setNewDebt(v => ({ ...v, rate: e.target.value }))} /></div>
            </div>
            <div className="fld"><div className="flb">Minimum Monthly Payment ($)</div><input className="inp mono" type="number" placeholder="35" value={newDebt.min} onChange={e => setNewDebt(v => ({ ...v, min: e.target.value }))} /></div>
            <button className="btn bp bfull" style={{ marginTop: 10 }} disabled={!newDebt.name || !newDebt.balance} onClick={() => {
              const b = parseFloat(newDebt.balance) || 0;
              setDebts(prev => [...prev, { id: Date.now(), name: newDebt.name, balance: b, original: b * 1.5, rate: parseFloat(newDebt.rate) || 0, min: parseFloat(newDebt.min) || 0, type: newDebt.type, color: C.accent }]);
              setMoOpen(null);
              setNewDebt({ name: "", balance: "", rate: "", min: "", type: "credit" });
              triggerToast("Debt added!");
            }}>Add Debt</button>
          </div>
        </div>
      )}

      {/* POPUP: ADD AN ASSET */}
      {moOpen === "asset" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Add an Asset</h3>
            <div className="fld"><div className="flb">Asset Name (e.g., Savings Account, Stocks)</div><input className="inp" placeholder="e.g. Coinbase Crypto" value={newAsset.name} onChange={e => setNewAsset(v => ({ ...v, name: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Type of Asset</div>
              <select className="inp" value={newAsset.type} onChange={e => setNewAsset(v => ({ ...v, type: e.target.value }))}>
                <option value="brokerage">Investment Account (Stocks/Crypto)</option>
                <option value="cash">Savings Account / Cash</option>
              </select>
            </div>
            <div className="fld"><div className="flb">Current Value ($)</div><input className="inp mono" type="number" placeholder="500" value={newAsset.value} onChange={e => setNewAsset(v => ({ ...v, value: e.target.value }))} /></div>
            <button className="btn bp bfull" style={{ marginTop: 10 }} disabled={!newAsset.name || !newAsset.value} onClick={() => {
              setAssets(prev => [...prev, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value) || 0, type: newAsset.type }]);
              setMoOpen(null);
              setNewAsset({ name: "", value: "", type: "brokerage" });
              triggerToast("Asset added!");
            }}>Add Asset</button>
          </div>
        </div>
      )}

      {/* POPUP: LESSONS */}
      {moOpen?.type === "lesson" && (
        <LessonOverlay lesson={moOpen.data} onClose={() => setMoOpen(null)} onComplete={(id) => {
          if (!learnedLessons.includes(id)) setLearnedLessons(v => [...v, id]);
          setMoOpen(null);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
          triggerToast("Lesson completed!");
        }} />
      )}
    </div>
  );
}

// ── INTERACTIVE QUIZ OVERLAY ─────────────────────────────────────────────────
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
      <div style={{ display: "flex", justifycontent: "space-between", alignitems: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{lesson.emoji}</span>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{lesson.title}</div>
        </div>
        <button className="btn bg bsm" onClick={onClose}>Exit Lesson</button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "10px 20px 0" }}>
        {lesson.steps.map((_, idx) => <div key={idx} className={`ps${idx <= currStep ? " on" : ""}`} />)}
      </div>

      <div className="lesson-content">
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, lineHeight: 1.25 }}>{lesson.steps[currStep].heading}</h2>
        <p style={{ fontSize: 14, color: "#D2DEEB", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: 16 }}>{lesson.steps[currStep].body}</p>

        {lesson.steps[currStep].realLife && (
          <div className="real-life">
            <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 9, letterSpacing: ".06em", marginBottom: 4 }}>Real-Life Example</div>
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
          {currStep === lesson.steps.length - 1 ? "Finish Lesson" : "Next Concept →"}
        </button>
      </div>
    </div>
  );
}

// ── LESSONS LIST ────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: "credit-cards",
    emoji: "💳",
    title: "How Credit Cards Work",
    subtitle: "Understanding high interest rates vs. building real wealth",
    duration: "2 min",
    color: C.red,
    steps: [
      {
        type: "explain",
        heading: "A credit card is a short-term loan",
        body: "When you swipe a credit card, you aren't spending your own cash. You're using the bank's money.\n\nIf you pay off your full 'Statement Balance' every month before the due date, you pay exactly $0 in interest fees. But if you carry over a balance, high interest charges spark instantly.",
        realLife: "🛒 Buy a $100 jacket. Pay it off on time: it costs exactly $100. Leave it on the card at 24% interest: that jacket costs you $124 by next year.",
      },
      {
        type: "explain",
        heading: "The 'Minimum Due' trap",
        body: "Credit card companies calculate the lowest payment possible specifically to keep you in debt longer. That is how they make their profit.\n\nOnly paying the minimum on a large card balance means you'll be stuck paying off a simple balance for years.",
        realLife: "⚠️ If you owe $1,000 on a store card and only make the basic $25 monthly minimum payment, it will take you over 5 years to clear, and you will double the cost of what you bought in interest fees.",
      },
      {
        type: "quiz",
        heading: "What happens if you pay your full credit card statement balance before the due date every month?",
        body: "Test your understanding:",
        options: [
          "The bank will still charge you basic monthly interest fees.",
          "You avoid paying any interest fees entirely while building up your credit score.",
          "Your credit score takes an automatic penalty drop."
        ],
        correct: 1
      }
    ]
  },
  {
    id: "equity-flipping",
    emoji: "📈",
    title: "How to Build Savings Automatically",
    subtitle: "Setting up rules to secure long-term investments effortlessly",
    duration: "2 min",
    color: C.purple,
    steps: [
      {
        type: "explain",
        heading: "Beat impulse spending before it starts",
        body: "The hardest part of saving money is keeping it in your checking account without spending it.\n\nBy turning on Auto-Pilot tracking, extra cash transfers, spare cash from round-ups, or occasional pay bonuses skip your daily budget and go straight to work in your savings or investments.",
        realLife: "⚡ Automatically pushing $50 from every paycheck directly into a separate high-yield savings account ensures you build up a safety net without ever missing the cash.",
      },
      {
        type: "quiz",
        heading: "Why is automated saving/investing usually more successful than doing it manually?",
        body: "Select the best answer:",
        options: [
          "It completely makes taxes vanish.",
          "It removes emotional choices, cuts down on human delays, and builds wealth behind the scenes.",
          "It forces you to lock up all your emergency cash so you can never use it."
        ],
        correct: 1
      }
    ]
  }
];

// ── ONBOARDING COMPONENTS ─────────────────────────────────────────────────────
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
    const debt = src.name && src.balance ? [{ id: Date.now(), name: src.name, balance: parseFloat(src.balance) || 0, original: (parseFloat(src.balance) || 0) * 1.5, rate: parseFloat(src.rate) || 0, min: parseFloat(src.min) || 0, type: src.type, color: C.red }] : [];
    onDone({ name, hasDebts, hasJob, income: parseFloat(income) || 0, firstDebt: debt });
  };

  return (
    <div className="ob">
      <div style={{ display: "flex", justifycontent: "space-between", alignitems: "center", marginBottom: 24, justifyContent: "space-between" }}>
        <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
        {step > 0 && <button className="btn bg bsm" onClick={() => setStep(s => s - 1)}>← Back</button>}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {[0, 1, 2, 3, 4].map(i => <div key={i} className={`opip${i <= step ? " on" : ""}`} />)}
      </div>

      {step === 0 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Let's build your tracker</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.55 }}>Welcome to moneycode! We make it easy to track what you own, crush what you owe, and build your savings—without the confusing financial jargon.</p>
        <div className="fld"><input className="inp" placeholder="Your First Name" value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 16, padding: "14px" }} /></div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 8 }} disabled={!name.trim()} onClick={next}>Get Started →</button>
      </>}

      {step === 1 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Do you have any debt to track?</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>This includes credit cards, car loans, student loans, or personal loans.</p>
        {[
          { id: true, e: "⚡", l: "Yes, let's track my debt", s: "Credit cards, auto loans, or balances to pay off." },
          { id: false, e: "💎", l: "No, I am completely debt-free!", s: "No active debts. Ready to focus entirely on building savings." }
        ].map(o => (
          <div key={String(o.id)} className={`oopt${hasDebts === o.id ? " on" : ""}`} onClick={() => setHasDebts(o.id)}>
            <span style={{ fontSize: 20, width: 32 }}>{o.e}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.l}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.s}</div></div>
          </div>
        ))}
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} disabled={hasDebts === null} onClick={next}>Next Step →</button>
      </>}

      {step === 2 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>How do you earn money?</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>This helps us see how much extra cash you can safely save or put toward debt.</p>
        {[
          { id: "yes", e: "💰", l: "Regular Paycheck", s: "Salary, hourly jobs, or consistent side income." },
          { id: "sometimes", e: "📊", l: "It Changes", s: "Freelance work, variable commission, or gig work." },
          { id: "no", e: "☕", l: "No Steady Income Right Now", s: "Currently focusing on budgets or managing current funds." }
        ].map(o => (
          <div key={o.id} className={`oopt${hasJob === o.id ? " on" : ""}`} onClick={() => setHasJob(o.id)}>
            <span style={{ fontSize: 20, width: 32 }}>{o.e}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.l}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.s}</div></div>
          </div>
        ))}
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} disabled={!hasJob} onClick={next}>Next Step →</button>
      </>}

      {step === 3 && <>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💵</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your Monthly Take-Home Pay</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Enter an estimate of how much money hits your bank account each month after taxes.</p>
        <div className="fld" style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 16 }}>$</span>
          <input className="inp mono" type="number" placeholder="3000" value={income} onChange={e => setIncome(e.target.value)} style={{ paddingLeft: 28, fontSize: 18, padding: "14px" }} />
        </div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 12 }} onClick={next}>{income ? "See My Dashboard →" : "Skip For Now"}</button>
      </>}

      {step === 4 && hasDebts === true && <>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Add your first debt</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Enter details for one of your debts below to see how fast you can knock it out.</p>
        <div className="fld"><div className="flb">Name of Debt (e.g., Capital One Card)</div><input className="inp" placeholder="e.g. Chase Slate Card" value={firstDebt.name} onChange={e => setFirstDebt(v => ({ ...v, name: e.target.value }))} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="fld"><div className="flb">Balance Owed ($)</div><input className="inp mono" type="number" placeholder="1500" value={firstDebt.balance} onChange={e => setFirstDebt(v => ({ ...v, balance: e.target.value }))} /></div>
          <div className="fld"><div className="flb">Interest Rate (APR %)</div><input className="inp mono" type="number" placeholder="22.9" value={firstDebt.rate} onChange={e => setFirstDebt(v => ({ ...v, rate: e.target.value }))} /></div>
        </div>
        <div className="fld"><div className="flb">Min Monthly Payment ($)</div><input className="inp mono" type="number" placeholder="45" value={firstDebt.min} onChange={e => setFirstDebt(v => ({ ...v, min: e.target.value }))} /></div>
        <button className="btn bp bfull" style={{ padding: 14, marginTop: 8 }} disabled={!firstDebt.name || !firstDebt.balance} onClick={() => finish()}>Create My Dashboard →</button>
      </>}
    </div>
  );
}

// ── UTILITY ICONS ────────────────────────────────────────────────────────────
const I = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Debt: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Sync: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Learn: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
};
