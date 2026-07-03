import { useState } from "react";

// ── COLOR SYSTEM ────────────────────────────────────────────────────────────
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
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 14px" }}>
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

// ── CORE MATH ENGINE ─────────────────────────────────────────────────────────
function calcHealth({ debts, assets, income, efund, score }) {
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalAssets = assets.reduce((s, a) => s + a.value, 0) + efund;
  const mins = debts.reduce((s, d) => s + d.min, 0);
  const dti = income > 0 ? mins / income : 0;
  const highRate = debts.length > 0 ? Math.max(...debts.map(d => d.rate)) : 0;
  const efGoal = income * 3;
  const efPct = efGoal > 0 ? Math.min(efund / efGoal, 1) : 1;
  const netWorth = totalAssets - totalDebt;
  const safeScore = isFinite(score) && score >= 300 && score <= 850 ? score : 720;

  const factors = [
    { l: "Credit", w: 25, v: safeScore >= 740 ? 100 : safeScore >= 670 ? 75 : 50 },
    { l: "Debt Load", w: 25, v: dti < .15 ? 100 : dti < .30 ? 75 : 45 },
    { l: "Savings Safety", w: 20, v: Math.round(efPct * 100) },
    { l: "Interest Lock", w: 15, v: highRate === 0 ? 100 : highRate < 15 ? 60 : 20 },
    { l: "Wealth Build", w: 15, v: netWorth >= 0 ? 70 : 20 },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + (f.v * f.w / 100), 0));
  return {
    overall,
    label: overall >= 82 ? "Excellent" : overall >= 65 ? "Healthy" : "Needs Focus",
    color: overall >= 65 ? C.accent : C.red,
    netWorth,
    totalAssets,
    totalDebt
  };
}

// ── CSS INJECT ──────────────────────────────────────────────────────────────
const CSS = `
input, select { font-size: 16px !important; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #06090E; color: #F0F4F8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.app { max-width: 430px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #06090E; border-left: 1px solid #1C2838; border-right: 1px solid #1C2838; position: relative; }
.scroll { flex: 1; overflow-y: auto; padding: 16px 16px 100px; }
.scroll::-webkit-scrollbar { display: none; }
.mono { font-family: monospace; }
.tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: #0B111A; border-top: 1px solid #1C2838; display: flex; z-index: 100; }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px 0; gap: 4px; cursor: pointer; border: none; background: none; color: #62778F; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.tab.on { color: #B5FF4D; }
.tab svg { width: 20px; height: 20px; }
.hdr { display: flex; justifyContent: space-between; alignItems: center; padding: 16px; }
.logo { font-weight: 800; font-size: 20px; letter-spacing: -.03em; }
.card { background: #111823; border: 1px solid #1C2838; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
.lbl { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #62778F; margin-bottom: 8px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 10px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .15s ease; }
.bp { background: #B5FF4D; color: #06090E; }
.bg { background: transparent; color: #F0F4F8; border: 1px solid #1C2838; }
.bsm { padding: 6px 12px; font-size: 11px; border-radius: 8px; }
.bfull { width: 100%; }
.tag { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.tg { background: rgba(52, 211, 153, 0.12); color: #34D399; }
.tp { background: rgba(158, 123, 255, 0.12); color: #9E7BFF; }
.inp { background: #0B111A; border: 1px solid #1C2838; border-radius: 10px; padding: 11px 14px; color: #F0F4F8; width: 100%; outline: none; }
.fld { margin-bottom: 12px; }
.flb { font-size: 10px; color: #62778F; margin-bottom: 5px; font-weight: 700; text-transform: uppercase; }
.mover { position: fixed; inset: 0; background: rgba(4, 6, 9, 0.85); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
.mo { background: #0B111A; border: 1px solid #1C2838; border-radius: 24px 24px 0 0; width: 100%; max-width: 430px; padding: 20px 20px 48px; }
.hdl { width: 36px; height: 4px; background: #1C2838; border-radius: 2px; margin: 0 auto 18px; }
.irow { display: flex; justifyContent: space-between; alignItems: center; padding: 12px 0; border-bottom: 1px solid #1C2838; }
.irow:last-child { border-bottom: none; }
.fhero { background: rgba(181,255,77,0.05); border: 1px solid rgba(181,255,77,0.15); border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 14px; }
.fdate { font-size: 24px; font-weight: 700; color: #B5FF4D; margin: 6px 0 4px; }
.sli { -webkit-appearance: none; width: 100%; height: 5px; border-radius: 3px; background: #1C2838; outline: none; margin: 10px 0; }
.sli::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #B5FF4D; cursor: pointer; }
.stog { display: flex; background: #111823; border: 1px solid #1C2838; border-radius: 10px; padding: 3px; margin-bottom: 14px; }
.sbtn { flex: 1; padding: 8px; border: none; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; background: transparent; color: #62778F; }
.sbtn.on { background: #B5FF4D; color: #06090E; }
.ttrk { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; }
.ttmb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #FFF; transition: left .2s; }
.learn-card { background: #111823; border: 1px solid #1C2838; border-radius: 14px; padding: 16px; margin-bottom: 12px; cursor: pointer; }
.lesson-screen { position: fixed; inset: 0; background: #06090E; z-index: 300; display: flex; flex-direction: column; max-width: 430px; margin: 0 auto; }
.lesson-content { flex: 1; overflow-y: auto; padding: 24px 20px; }
.quiz-opt { padding: 14px; border: 1px solid #1C2838; border-radius: 12px; margin-bottom: 10px; cursor: pointer; font-size: 13.5px; background: #111823; }
.quiz-opt.correct { background: rgba(52, 211, 153, 0.12); border-color: #34D399; color: #34D399; }
.quiz-opt.wrong { background: rgba(255, 83, 83, 0.12); border-color: #FF5353; color: #FF5353; }
.ob { padding: 24px 16px; min-height: 100vh; display: flex; flex-direction: column; background: #06090E; }
.opip { flex: 1; height: 4px; background: #1C2838; border-radius: 2px; }
.opip.on { background: #B5FF4D; }
.oopt { background: #111823; border: 1px solid #1C2838; border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.oopt.on { border-color: #B5FF4D; background: rgba(181, 255, 77, 0.04); }
.ps { flex: 1; height: 4px; background: #1C2838; border-radius: 2px; }
.ps.on { background: #B5FF4D; }
`;

// ── APP CONTAINER ───────────────────────────────────────────────────────────
export default function App() {
  const [showOb, setShowOb] = useState(true);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);

  // User Financial State
  const [income, setIncome] = useState(3200); 
  const [creditScore, setCreditScore] = useState(690);
  const [efund, setEfund] = useState(1500);
  const [extraPay, setExtraPay] = useState(200);
  const [strategy, setStrategy] = useState("avalanche");

  const [assets, setAssets] = useState([
    { id: 1, name: "Savings Account", value: 500, type: "cash" }
  ]);
  const [debts, setDebts] = useState([
    { id: 1, name: "Credit Card Balance", balance: 1800, original: 3000, rate: 24.2, min: 55, type: "credit" }
  ]);

  // Auto-Pilot Control State
  const [autoRoute, setAutoRoute] = useState(true);
  const [pendingQueue, setPendingQueue] = useState([
    { id: 101, title: "Birthday/Gift Cash Venmo", source: "Pending Verification", amount: 100, badge: "Extra Cash" },
    { id: 102, title: "Weekly Spare Change Round-Ups", source: "Bank Sync", amount: 24, badge: "Micro Saving" }
  ]);
  const [processedLog, setProcessedLog] = useState([
    { id: 201, text: "✓ Sent $75 leftover cash directly to clear down your Credit Card balance." }
  ]);

  const [moOpen, setMoOpen] = useState(null);
  const [newDebt, setNewDebt] = useState({ name: "", balance: "", rate: "", min: "", type: "credit" });
  const [newAsset, setNewAsset] = useState({ name: "", value: "", type: "cash" });
  const [learnedLessons, setLearnedLessons] = useState([]);

  const triggerToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const h = calcHealth({ debts, assets, income, efund, score: creditScore });

  return (
    <div className="app">
      <style>{CSS}</style>
      {toast && <div className="toast" style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: C.card, border: `1px solid ${C.border}`, padding: "10px 16px", borderRadius: 10, zIndex: 999, fontSize: 13 }}>✨ {toast}</div>}

      {showOb ? (
        <Onboarding 
          onSkip={() => setShowOb(false)}
          onDone={(data) => {
            setIncome(data.income || 3200);
            if (data.firstDebt) setDebts([data.firstDebt]);
            else setDebts([]);
            setShowOb(false);
            triggerToast("Dashboard Activated!");
          }} 
        />
      ) : (
        <>
          {/* HEADER BRANDING */}
          <div className="hdr">
            <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
            <div className="tag tg" style={{ fontWeight: 600 }}>Health: {h.overall}%</div>
          </div>

          <div className="scroll">
            {/* HOME DASHBOARD */}
            {tab === "home" && (
              <div>
                <div className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
                  <div className="lbl">Net Worth (Your Real Progress)</div>
                  <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: h.netWorth >= 0 ? C.accent : C.red }}>{fmt(h.netWorth)}</div>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>What you own minus what you owe.</p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>What You Own</div>
                      <div className="mono" style={{ color: C.blue, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalAssets)}</div>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: 2 }}>What You Owe</div>
                      <div className="mono" style={{ color: C.red, fontSize: 15, fontWeight: 600 }}>{fmt(h.totalDebt)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div className="card" style={{ margin: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="lbl">Debt Paid Off</div>
                    <Gauge pct={h.totalDebt === 0 ? 0 : h.totalDebt / (debts.reduce((s, d) => s + d.original, 0) || 1)} />
                  </div>
                  <div className="card" style={{ margin: 0, textAlign: "center" }}>
                    <div className="lbl">Credit Score</div>
                    <ScoreRing score={creditScore} />
                  </div>
                </div>

                {/* ASSETS AND CASH BOX */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div className="lbl" style={{ margin: 0 }}>Savings & Assets</div>
                    <button className="btn bg bsm" onClick={() => setMoOpen("asset")}>+ Add Asset</button>
                  </div>
                  <div className="irow">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Emergency Cash Nest</div>
                      <div style={{ fontSize: 11, color: C.muted }}>High-Yield Cash</div>
                    </div>
                    <div className="mono" style={{ color: C.success, fontSize: 14, fontWeight: 600 }}>{fmt(efund)}</div>
                  </div>
                  {assets.map(a => (
                    <div className="irow" key={a.id}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>Investments / Cash</div>
                      </div>
                      <div className="mono" style={{ color: C.blue, fontSize: 14, fontWeight: 600 }}>{fmt(a.value)}</div>
                    </div>
                  ))}
                </div>

                {/* LIVE METRIC MODIFIERS */}
                <div className="card">
                  <div className="lbl">Adjust Parameters</div>
                  <div className="fld">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.muted }}>Extra Pay Toward Target Debt:</span>
                      <span className="mono" style={{ color: C.accent, fontWeight: 600 }}>{fmt(extraPay)}/mo</span>
                    </div>
                    <input type="range" className="sli" min="0" max="1500" step="25" value={extraPay} onChange={e => setExtraPay(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <div className="flb">Score Variable</div>
                      <input type="number" className="inp mono" value={creditScore} onChange={e => setCreditScore(parseInt(e.target.value) || 300)} />
                    </div>
                    <div>
                      <div className="flb">Monthly Income</div>
                      <input type="number" className="inp mono" value={income} onChange={e => setIncome(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYOFF PLAN SIMULATOR */}
            {tab === "plan" && (
              <div>
                <div className="stog">
                  <button className={`sbtn${strategy === "avalanche" ? " on" : ""}`} onClick={() => setStrategy("avalanche")}>Highest Interest First (Avalanche)</button>
                  <button className={`sbtn${strategy === "snowball" ? " on" : ""}`} onClick={() => setStrategy("snowball")}>Smallest Balance First (Snowball)</button>
                </div>

                {(() => {
                  let months = 0, simDebts = debts.map(d => ({ ...d })), safeCap = 360;
                  while (simDebts.some(d => d.balance > 0) && months < safeCap) {
                    months++;
                    simDebts.forEach(d => { if (d.balance > 0) d.balance += d.balance * ((d.rate / 100) / 12); });
                    let pool = extraPay;
                    simDebts.forEach(d => {
                      if (d.balance > 0) {
                        if (d.balance <= d.min) { pool += (d.min - d.balance); d.balance = 0; }
                        else d.balance -= d.min;
                      }
                    });
                    let sortDebts = [...simDebts].sort((a, b) => strategy === "avalanche" ? b.rate - a.rate : a.balance - b.balance);
                    for (let target of sortDebts) {
                      let orig = simDebts.find(d => d.id === target.id);
                      if (orig && orig.balance > 0) {
                        if (orig.balance <= pool) { pool -= orig.balance; orig.balance = 0; }
                        else { orig.balance -= pool; pool = 0; break; }
                      }
                    }
                  }

                  return (
                    <>
                      <div className="fhero">
                        <div className="lbl">Estimated Debt-Free Track</div>
                        <div className="fdate">{debts.length === 0 ? "No Active Debt!" : toDate(months)}</div>
                        <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Using the mathematical {strategy} sequence.</p>
                      </div>

                      <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <div className="lbl" style={{ margin: 0 }}>Debts Tracked</div>
                          <button className="btn bg bsm" onClick={() => setMoOpen("debt")}>+ Add Debt</button>
                        </div>
                        {debts.length === 0 ? (
                          <div style={{ textAlign: "center", color: C.muted, padding: 16, fontSize: 13 }}>🎉 Clean slate! Zero debts uploaded.</div>
                        ) : (
                          debts.map((d, i) => (
                            <div className="irow" key={d.id}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{d.rate}% interest rate • {fmt(d.min)}/mo min</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{fmt(d.balance)}</div>
                                {i === 0 && <span className="tag tg" style={{ fontSize: 8, padding: "1px 4px", marginTop: 2 }}>Target Focus</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* AUTO-PILOT QUEUE */}
            {tab === "queue" && (
              <div>
                <div className="card" style={{ borderLeft: `4px solid ${C.purple}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div className="lbl" style={{ color: C.purple, margin: 0 }}>Auto-Pilot Shield</div>
                    <Toggle on={autoRoute} set={setAutoRoute} />
                  </div>
                  <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.4 }}>
                    Catches unexpected cash gifts, side income, or change round-ups and lets you intercept them into savings before they get spent.
                  </p>
                </div>

                <div className="lbl">Pending Incoming Cash</div>
                {pendingQueue.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 20 }}>🎉 All clear. No items waiting to route.</div>
                ) : (
                  pendingQueue.map(item => (
                    <div className="card" key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                          <span className="tag tp" style={{ fontSize: 9 }}>{item.badge}</span>
                          <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{item.title}</h4>
                          <p style={{ fontSize: 11, color: C.muted }}>{item.source}</p>
                        </div>
                        <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: C.accent }}>{fmt(item.amount)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                        <button className="btn bp bsm" style={{ flex: 1 }} onClick={() => {
                          setEfund(e => e + item.amount);
                          setProcessedLog(p => [`✓ Routed ${fmt(item.amount)} from "${item.title}" straight to Emergency Cash.`, ...p]);
                          setPendingQueue(q => q.filter(x => x.id !== item.id));
                          triggerToast("Money swept into Savings!");
                        }}>Approve Sweep</button>
                        <button className="btn bg bsm" onClick={() => {
                          setPendingQueue(q => q.filter(x => x.id !== item.id));
                          triggerToast("Dismissed to Checking");
                        }}>Skip</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="lbl">Recent Actions Log</div>
                <div className="card" style={{ padding: "12px 16px" }}>
                  {processedLog.map((log, i) => (
                    <div key={i} style={{ fontSize: 12, padding: "8px 0", color: C.muted, lineHeight: 1.4 }}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* LEARN ACTIONS */}
            {tab === "learn" && (
              <div>
                <div className="lbl">Financial Fundamentals</div>
                {LESSONS.map(l => (
                  <div className="learn-card" key={l.id} onClick={() => setMoOpen({ type: "lesson", data: l })}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{l.title}</h4>
                    <p style={{ fontSize: 12, color: C.muted }}>{l.subtitle} • <span style={{ color: C.accent }}>{l.duration}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TAB SYSTEM */}
          <div className="tabbar">
            <button className={`tab${tab === "home" ? " on" : ""}`} onClick={() => setTab("home")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>Home</button>
            <button className={`tab${tab === "plan" ? " on" : ""}`} onClick={() => setTab("plan")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>Payoff Simulator</button>
            <button className={`tab${tab === "queue" ? " on" : ""}`} onClick={() => setTab("queue")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/></svg>Auto-Pilot</button>
            <button className={`tab${tab === "learn" ? " on" : ""}`} onClick={() => setTab("learn")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/></svg>Learn</button>
          </div>
        </>
      )}

      {/* ASSET POPUP CONTROLLER */}
      {moOpen === "asset" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14 }}>Add Asset Baseline</h3>
            <div className="fld"><div className="flb">Name</div><input className="inp" placeholder="e.g., Crypto Wallet, Stock Account" value={newAsset.name} onChange={e => setNewAsset(v => ({ ...v, name: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Value ($)</div><input className="inp mono" type="number" placeholder="500" value={newAsset.value} onChange={e => setNewAsset(v => ({ ...v, value: e.target.value }))} /></div>
            <button className="btn bp bfull" disabled={!newAsset.name || !newAsset.value} onClick={() => {
              setAssets(prev => [...prev, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value) || 0 }]);
              setMoOpen(null); setNewAsset({ name: "", value: "", type: "cash" }); triggerToast("Asset Tracked!");
            }}>Save Asset</button>
          </div>
        </div>
      )}

      {/* DEBT POPUP CONTROLLER */}
      {moOpen === "debt" && (
        <div className="mover" onClick={() => setMoOpen(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <h3 style={{ marginBottom: 14 }}>Track New Balance</h3>
            <div className="fld"><div className="flb">Account Name</div><input className="inp" placeholder="e.g. Credit Card B" value={newDebt.name} onChange={e => setNewDebt(v => ({ ...v, name: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="fld"><div className="flb">Balance Owed</div><input className="inp mono" type="number" value={newDebt.balance} onChange={e => setNewDebt(v => ({ ...v, balance: e.target.value }))} /></div>
              <div className="fld"><div className="flb">APR %</div><input className="inp mono" type="number" value={newDebt.rate} onChange={e => setNewDebt(v => ({ ...v, rate: e.target.value }))} /></div>
            </div>
            <div className="fld"><div className="flb">Minimum Payment</div><input className="inp mono" type="number" value={newDebt.min} onChange={e => setNewDebt(v => ({ ...v, min: e.target.value }))} /></div>
            <button className="btn bp bfull" disabled={!newDebt.name || !newDebt.balance} onClick={() => {
              setDebts(prev => [...prev, { id: Date.now(), name: newDebt.name, balance: parseFloat(newDebt.balance) || 0, original: parseFloat(newDebt.balance) * 1.3, rate: parseFloat(newDebt.rate) || 18, min: parseFloat(newDebt.min) || 25 }]);
              setMoOpen(null); setNewDebt({ name: "", balance: "", rate: "", min: "", type: "credit" }); triggerToast("Debt Loaded!");
            }}>Add To Calculations</button>
          </div>
        </div>
      )}

      {/* QUIZ INTERACTIVE OVERLAY */}
      {moOpen?.type === "lesson" && (
        <div className="lesson-screen">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: C.surface }}>
            <div style={{ fontWeight: 700 }}>{moOpen.data.title}</div>
            <button className="btn bg bsm" onClick={() => setMoOpen(null)}>Exit</button>
          </div>
          <div className="lesson-content">
            <h3 style={{ marginBottom: 12 }}>{moOpen.data.heading}</h3>
            <p style={{ fontSize: 14, color: "#D2DEEB", lineHeight: 1.6, whiteSpace: "pre-line" }}>{moOpen.data.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ONBOARDING CONTROLLER ───────────────────────────────────────────────────
function Onboarding({ onDone, onSkip }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [hasDebt, setHasDebt] = useState(null);
  const [income, setIncome] = useState("");
  const [firstDebt, setFirstDebt] = useState({ name: "", balance: "", rate: "", min: "" });

  const processNext = () => {
    if (step === 0 && !name.trim()) return;
    if (step === 1) {
      if (hasDebt === false) { onDone({ name, income: 0, firstDebt: null }); return; }
    }
    if (step === 2) {
      if (hasDebt) { setStep(3); return; }
      onDone({ name, income: parseFloat(income) || 0, firstDebt: null }); return;
    }
    if (step === 3) {
      if (firstDebt.name && firstDebt.balance) {
        onDone({ name, income: parseFloat(income) || 0, firstDebt: { id: Date.now(), name: firstDebt.name, balance: parseFloat(firstDebt.balance) || 0, original: parseFloat(firstDebt.balance) * 1.4, rate: parseFloat(firstDebt.rate) || 21, min: parseFloat(firstDebt.min) || 35 } });
      } else {
        onDone({ name, income: parseFloat(income) || 0, firstDebt: null });
      }
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="ob">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
        <button className="btn bg bsm" onClick={onSkip} style={{ color: C.yellow, borderColor: "rgba(255,199,69,0.3)" }}>⚡ Skip Entirely</button>
      </div>
      
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {[0, 1, 2, 3].map(i => <div key={i} className={`opip${i <= step ? " on" : ""}`} />)}
      </div>

      {step === 0 && <>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Let's assemble your app</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>A clean, jargon-free way to track assets, simulate card payoff dates, and check your real numbers.</p>
        <div className="fld"><input className="inp" placeholder="Your First Name" value={name} onChange={e => setName(e.target.value)} /></div>
        <button className="btn bp bfull" disabled={!name.trim()} onClick={processNext}>Continue →</button>
      </>}

      {step === 1 && <>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Are there active debts to clear?</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Credit cards, vehicle funding, or student financing items.</p>
        <div className={`oopt${hasDebt === true ? " on" : ""}`} onClick={() => setHasDebt(true)}>
          <div><div style={{ fontWeight: 600 }}>Yes, I have balances to clear</div></div>
        </div>
        <div className={`oopt${hasDebt === false ? " on" : ""}`} onClick={() => setHasDebt(false)}>
          <div><div style={{ fontWeight: 600 }}>No active debt balances</div></div>
        </div>
        <button className="btn bp bfull" style={{ marginTop: 12 }} disabled={hasDebt === null} onClick={processNext}>Next Step →</button>
      </>}

      {step === 2 && <>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your Monthly Take-Home Income</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>An estimate of the actual money that deposits into your checking account monthly after payroll taxes.</p>
        <div className="fld"><input className="inp mono" type="number" placeholder="2500" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <button className="btn bp bfull" onClick={processNext}>Build My Dashboard →</button>
      </>}

      {step === 3 && <>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Optional: Load your first card</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>You can skip this and add accounts later on the dashboard if you prefer.</p>
        <div className="fld"><div className="flb">Card / Loan Identification</div><input className="inp" placeholder="e.g. Discovery Card" value={firstDebt.name} onChange={e => setFirstDebt(v => ({ ...v, name: e.target.value }))} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="fld"><div className="flb">Balance ($)</div><input className="inp mono" type="number" placeholder="1200" value={firstDebt.balance} onChange={e => setFirstDebt(v => ({ ...v, balance: e.target.value }))} /></div>
          <div className="fld"><div className="flb">APR %</div><input className="inp mono" type="number" placeholder="22.5" value={firstDebt.rate} onChange={e => setFirstDebt(v => ({ ...v, rate: e.target.value }))} /></div>
        </div>
        <div className="fld"><div className="flb">Minimum Payment</div><input className="inp mono" type="number" placeholder="35" value={firstDebt.min} onChange={e => setFirstDebt(v => ({ ...v, min: e.target.value }))} /></div>
        <button className="btn bp bfull" onClick={processNext}>Complete Final Verification →</button>
      </>}
    </div>
  );
}

// ── FIXED EDUCATIONAL CONTENT ───────────────────────────────────────────────
const LESSONS = [
  { id: "cc", title: "Credit Card Realities", heading: "Credit is a Temporary Bank Loan", body: "Every swipe is the bank's money. Paying your exact 'Statement Balance' on time completely bypasses interest fees. Carrying a balance triggers the APR multiplier instantly, compounding daily." },
  { id: "ap", title: "Automated Rules Rule", heading: "Bypassing the Impulse Choice", body: "Auto-Pilot captures random money additions before your eye categorizes them as disposable spending cash, securing long-term growth behind the scenes automatically." }
];
