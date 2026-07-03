import React, { useState, useMemo } from 'react';

// ── SYSTEM ARCHITECTURE CONSTANTS ─────────────────────────────────────────────
const C = {
  bg: "#0A0F1D",
  surface: "#141B2D",
  border: "#242F48",
  accent: "#3B82F6",
  accentGlow: "rgba(59,130,246,0.15)",
  text: "#F3F4F6",
  muted: "#9CA3AF",
  success: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  blue: "#60A5FA"
};

const CSS = `
  body { margin: 0; background: ${C.bg}; color: ${C.text}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; background: ${C.bg}; display: flex; flex-direction: column; position: relative; padding-bottom: 75px; box-sizing: border-box; }
  .scroll { flex: 1; overflow-y: auto; padding: 16px; }
  .card { background: ${C.surface}; border: 1px solid ${C.border}; borderRadius: 12px; padding: 14px; margin-bottom: 12px; border-radius: 12px; }
  .hdr { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid ${C.border}; background: rgba(20,27,45,0.8); backdrop-filter: blur(8px); sticky; top: 0; z-index: 10; }
  .logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
  .btn { border: none; border-radius: 8px; font-weight: 600; font-size: 13px; padding: 10px 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; color: white; }
  .bp { background: ${C.accent}; }
  .bp:hover { opacity: 0.9; }
  .bg { background: ${C.border}; color: ${C.text}; }
  .bg:hover { background: #2f3d5e; }
  .bplus { background: linear-gradient(135deg, ${C.purple}, ${C.accent}); text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .bfull { width: 100%; display: flex; margin-top: 10px; }
  .bsm { padding: 6px 12px; font-size: 11px; border-radius: 6px; }
  .tabbar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; height: 64px; background: rgba(20,27,45,0.95); backdrop-filter: blur(12px); border-top: 1px solid ${C.border}; display: grid; grid-template-columns: repeat(5, 1fr); z-index: 100; }
  .tab { display: flex; flex-direction: column; align-items: center; justify-content: center; background: none; border: none; color: ${C.muted}; font-size: 10px; font-weight: 500; gap: 4px; cursor: pointer; }
  .tab.on { color: ${C.accent}; }
  .inp { width: 100%; background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 8px; padding: 10px 12px; color: white; font-size: 14px; box-sizing: border-box; transition: border 0.2s; }
  .inp:focus { border-color: ${C.accent}; outline: none; }
  .fld { margin-bottom: 12px; }
  .flb { font-size: 11px; color: ${C.muted}; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
  .mono { font-family: monospace; font-size: 14px; }
  .tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
  .tb { background: ${C.border}; color: ${C.muted}; }
  .toast { position: fixed; top: 75px; left: 50%; transform: translateX(-50%); background: #1E293B; border: 1px solid ${C.border}; padding: 10px 16px; border-radius: 30px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 1000; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
  .mover { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: flex-end; z-index: 500; }
  .mo { width: 100%; background: ${C.surface}; border-top: 1px solid ${C.border}; border-radius: 20px 20px 0 0; padding: 20px 16px 34px 16px; box-sizing: border-box; animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); max-height: 90vh; overflow-y: auto; }
  .hdl { width: 36px; height: 4px; background: ${C.border}; border-radius: 2px; margin: 0 auto 16px auto; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .lbl { font-size: 12px; color: ${C.muted}; font-weight: 700; text-transform: uppercase; margin: 16px 0 8px 0; letter-spacing: 0.5px; }
`;

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

const I = {
  Home: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Debt: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Plan: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  Money: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>,
  Learn: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
};

// ── ONBOARDING COMPONENT (FIXED LEDGER PARSING) ────────────────────────────────
function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [debtName, setDebtName] = useState("");
  const [debtBal, setDebtBal] = useState("");
  const [debtRate, setDebtRate] = useState("");
  const [debtMin, setDebtMin] = useState("");

  const submit = () => {
    const initialDebtsList = [];
    if (debtName.trim() && debtBal) {
      initialDebtsList.push({
        id: Date.now(),
        name: debtName.trim(),
        type: "credit",
        balance: parseFloat(debtBal) || 0,
        original: parseFloat(debtBal) || 0,
        rate: parseFloat(debtRate) || 0,
        min: parseFloat(debtMin) || 0,
        color: C.red
      });
    }
    onDone({
      name: name.trim() || "User",
      income: parseFloat(income) || 4000,
      initialDebts: initialDebtsList
    });
  };

  return (
    <div className="scroll" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Clear Your Liabilities</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Let's initialize your primary ledger parameters.</div>
      </div>

      <div className="card">
        <div className="fld"><div className="flb">Your First Name</div><input className="inp" placeholder="John" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="fld"><div className="flb">Monthly Take-Home Pay</div><input className="inp mono" type="number" placeholder="4000" value={income} onChange={e => setIncome(e.target.value)} /></div>
      </div>

      <p className="lbl">Optional: Input Your Highest Target Debt</p>
      <div className="card">
        <div className="fld"><div className="flb">Liability Identifier</div><input className="inp" placeholder="e.g. Sapphire Card" value={debtName} onChange={e => setDebtName(e.target.value)} /></div>
        <div className="fld"><div className="flb">Outstanding Principal ($)</div><input className="inp mono" type="number" placeholder="5000" value={debtBal} onChange={e => setDebtBal(e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="fld"><div className="flb">Interest Rate (APR %)</div><input className="inp mono" type="number" placeholder="19.9" value={debtRate} onChange={e => setDebtRate(e.target.value)} /></div>
          <div className="fld"><div className="flb">Minimum Payment ($)</div><input className="inp mono" type="number" placeholder="150" value={debtMin} onChange={e => setDebtMin(e.target.value)} /></div>
        </div>
      </div>

      <button className="btn bp bfull" onClick={submit} style={{ padding: '14px' }}>Build Active Profiles</button>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────
function HomeTab({ debts, name, onOpenManage, triggerSavingsForm, assets, income, efund }) {
  const totalOwed = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <div className="scroll">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>WELCOME BACK</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{name}</div>
      </div>

      <div className="card" style={{ background: `linear-gradient(135deg, ${C.surface}, #1E293B)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, bottom: -20, fontSize: 100, opacity: 0.08 }}>📉</div>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 0.5 }}>AGGREGATE DEBT LOAD</div>
        <div className="mono" style={{ fontSize: 32, fontWeight: 800, margin: "4px 0 12px 0", color: totalOwed > 0 ? C.red : C.success }}>
          {fmt(totalOwed)}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn bp bsm" onClick={onOpenManage}>Launch Engine</button>
          <button className="btn bg bsm" onClick={triggerSavingsForm}>🎯 Set a Savings Goal</button>
        </div>
      </div>

      <p className="lbl">Overview Metrics</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>LIQUID RESERVES</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: C.success }}>{fmt(efund)}</div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>MONTHLY NET INCOME</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{fmt(income)}</div>
        </div>
      </div>

      <p className="lbl">Active AI Financial Advisor</p>
      <AiAdvisorComponent debts={debts} income={income} efund={efund} />
    </div>
  );
}

// ── AI ADVISOR FIXED COMPONENT ───────────────────────────────────────────────
function AiAdvisorComponent({ debts, income, efund }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Systems online. Point out your strategy bottlenecks, and let's run optimization mechanics." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = "I've run the numbers against your active balances. Focus your surplus cash aggressively into your highest APR fields to minimize interest leakage.";
      const low = userText.toLowerCase();
      
      if (low.includes("snowball")) {
        reply = "The Snowball framework prioritizes lower fractional individual totals first to create compounding psychological momentum. Excellent for building fast behavioral wins.";
      } else if (low.includes("avalanche") || low.includes("rate") || low.includes("interest")) {
        reply = "The Avalanche strategy mathematically saves the most cash by prioritizing the highest APR. Keep pushing capital there to shut down compounding interest charges.";
      } else if (low.includes("savings") || low.includes("invest")) {
        reply = "Ensure your baseline emergency cash reserve is backstopped before scaling speculative market allocations. Protect your downside framework first.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="card">
      <div style={{ height: 140, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? C.accent : C.bg, padding: "8px 12px", borderRadius: 8, fontSize: 12, maxWidth: "85%", lineHeight: 1.4 }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ alignSelf: 'flex-start', color: C.muted, fontSize: 11, fontStyle: "italic" }}>Analyzing parameters...</div>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input className="inp" style={{ fontSize: 12, padding: "8px" }} placeholder="Ask about snowball vs avalanche..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <button className="btn bp bsm" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

// ── DEBTS TAB ─────────────────────────────────────────────────────────────────
function DebtsTab({ debts, setDebts, openModal, onEdit, pop }) {
  return (
    <div className="scroll">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Account Ledgers</div>
        <button className="btn bp bsm" onClick={() => openModal("add")}>+ Log Liability</button>
      </div>

      {debts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 600, color: "white" }}>Zero Active Liabilities</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Your regular ledger overhead is cleared. All net cashflow is fully available.</div>
        </div>
      ) : (
        debts.map(d => (
          <div key={d.id} className="card" style={{ borderLeft: `4px solid ${d.color || C.accent}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  Rate: <span className="mono">{d.rate}% APR</span> • Min: <span className="mono">{fmt(d.min)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontWeight: 700, fontSize: 15 }}>{fmt(d.balance)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6, justifyContent: "flex-end" }}>
                  <button style={{ background: "none", border: "none", color: C.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => onEdit(d)}>Modify</button>
                  <button style={{ background: "none", border: "none", color: C.red, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }} onClick={() => { setDebts(debts.filter(x => x.id !== d.id)); pop("Account Removed"); }}>Wipe</button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── PLAN TAB ──────────────────────────────────────────────────────────────────
function PlanTab({ debts, income }) {
  const [extra, setExtra] = useState(300);
  
  const [rawAge, setRawAge] = useState("30");
  const [rawRetireAge, setRawRetireAge] = useState("65");
  const [rawLumpSum, setRawLumpSum] = useState("10000");

  const currentAge = parseInt(rawAge) || 0;
  const retireAge = parseInt(rawRetireAge) || 0;
  const lumpSum = parseFloat(rawLumpSum) || 0;

  return (
    <div className="scroll">
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Payoff Optimization Profile</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Fine-tune system distribution levels to project asset horizons.</div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="flb" style={{ margin: 0 }}>Extra Monthly Payoff Allocation</div>
          <span className="mono" style={{ color: C.accent, fontWeight: 700 }}>{fmt(extra)}</span>
        </div>
        <input type="range" min="0" max="1000" step="25" value={extra} onChange={e => setExtra(parseInt(e.target.value))} style={{ width: "100%", accentColor: C.accent, marginBottom: 6 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted }}>
          <span>$0</span>
          <span>$500</span>
          <span>$1,000 max</span>
        </div>
      </div>

      <p className="lbl">Wealth Compound Calculator</p>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div className="fld" style={{ marginBottom: 0 }}>
            <div className="flb">Current Age</div>
            <input className="inp mono" type="number" placeholder="30" value={rawAge} onChange={e => setRawAge(e.target.value)} />
          </div>
          <div className="fld" style={{ marginBottom: 0 }}>
            <div className="flb">Retire at Age</div>
            <input className="inp mono" type="number" placeholder="65" value={rawRetireAge} onChange={e => setRawRetireAge(e.target.value)} />
          </div>
        </div>

        <div className="fld">
          <div className="flb">Starting Lump Sum ($10M max)</div>
          <input className="inp mono" type="number" max="10000000" placeholder="10000" value={rawLumpSum} onChange={e => {
            const v = e.target.value;
            if (parseFloat(v) > 10000000) setRawLumpSum("10000000");
            else setRawLumpSum(v);
          }} />
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ESTIMATED TOTAL BALANCES AT RETIREMENT (7% AVG)</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: C.success, marginTop: 4 }}>
            {fmt(
              lumpSum * Math.pow(1.07, Math.max(0, retireAge - currentAge)) +
              ((extra || 0) * 12 * (Math.pow(1.07, Math.max(0, retireAge - currentAge)) - 1)) / 0.07
            )}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
            Assumes your extra monthly allocation compounding directly over {Math.max(0, retireAge - currentAge)} years.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MONEY TAB ─────────────────────────────────────────────────────────────────
function MoneyTab({ debts, assets, setAssets, income, setIncome, efund, setEfund, pop, forceShowGoalForm, closeForceGoal }) {
  const [goals, setGoals] = useState([
    { id: 1, name: "Emergency Core", target: 10000, saved: 2500, icon: "🛡️", color: C.accent }
  ]);
  const [showGoal, setShowGoal] = useState(false);
  const [gform, setGform] = useState({ icon: "🎯", name: "", target: "", saved: "" });

  React.useEffect(() => {
    if (forceShowGoalForm) {
      setShowGoal(true);
      closeForceGoal();
    }
  }, [forceShowGoalForm, closeForceGoal]);

  const addGoal = () => {
    if (!gform.name || !gform.target) return;
    setGoals([...goals, {
      id: Date.now(),
      icon: gform.icon || "🎯",
      name: gform.name,
      target: parseFloat(gform.target) || 0,
      saved: parseFloat(gform.saved) || 0,
      color: [C.accent, C.purple, C.success, C.yellow][Math.floor(Math.random() * 4)]
    }]);
    setGform({ icon: "🎯", name: "", target: "", saved: "" });
    setShowGoal(false);
    pop("Savings goal registered!");
  };

  return (
    <div className="scroll">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>Target Savings Matrix</div>
        <button className="btn bp bsm" onClick={() => setShowGoal(true)}>+ New Goal</button>
      </div>

      {showGoal && (
        <div className="card" style={{ borderColor: C.accent }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: 8, marginBottom: 8 }}>
            <div className="fld"><div className="flb">Icon</div><input className="inp" value={gform.icon} onChange={e => setGform(v => ({ ...v, icon: e.target.value }))} style={{ textAlign: "center", fontSize: 18, padding: "6px" }} /></div>
            <div className="fld"><div className="flb">Goal Name</div><input className="inp" placeholder="e.g. Down Payment" value={gform.name} onChange={e => setGform(v => ({ ...v, name: e.target.value }))} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
            <div className="fld"><div className="flb">Target Target ($)</div><input className="inp mono" type="number" placeholder="5000" value={gform.target} onChange={e => setGform(v => ({ ...v, target: e.target.value }))} /></div>
            <div className="fld"><div className="flb">Current Saved ($)</div><input className="inp mono" type="number" placeholder="0" value={gform.saved} onChange={e => setGform(v => ({ ...v, saved: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn bg bsm" onClick={() => setShowGoal(false)}>Cancel</button>
            <button className="btn bp bsm" style={{ flex: 1 }} onClick={addGoal}>Save Goal</button>
          </div>
        </div>
      )}

      {goals.map(g => {
        const pct = Math.min((g.saved / Math.max(g.target, 1)) * 100, 100);
        return (
          <div key={g.id} className="card" style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Target: {fmt(g.target)}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{fmt(g.saved)}</div>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{Math.round(pct)}%</div>
              </div>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: C.border, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", borderRadius: 3, background: g.color || C.accent, width: `${pct}%`, transition: "width .4s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <div style={{ flex: 1 }}><div className="flb">Modify Saved</div><input className="inp mono" type="number" value={g.saved} onChange={e => setGoals(x => x.map(v => v.id === g.id ? { ...v, saved: parseFloat(e.target.value) || 0 } : v))} style={{ padding: "5px 8px", fontSize: 11 }} /></div>
              <div style={{ flex: 1 }}><div className="flb">Modify Target</div><input className="inp mono" type="number" value={g.target} onChange={e => setGoals(x => x.map(v => v.id === g.id ? { ...v, target: parseFloat(e.target.value) || 0 } : v))} style={{ padding: "5px 8px", fontSize: 11 }} /></div>
              <button style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 10, alignSelf: "flex-end", paddingBottom: 6 }} onClick={() => setGoals(x => x.filter(v => v.id !== g.id))}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── LEARN TAB ─────────────────────────────────────────────────────────────────
function LearnTab() {
  return (
    <div className="scroll">
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>System Intelligence Hub</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Review strategic guidelines to increase individual financial conversion velocities.</div>
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Interest Rate Drag Mechanics</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Uncollateralized structural accounts showing rates over 10% represent functional holes in net individual savings metrics. Prioritize resolving those vectors systematically before acquiring non-liquid alternative positions.</div>
      </div>
    </div>
  );
}

// ── MAIN APP ENGINE CONTAINER ─────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("home");
  const [name, setName] = useState("");
  const [income, setIncome] = useState(4000);
  const [efund, setEfund] = useState(2500);
  const [debts, setDebts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isPlus, setIsPlus] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [forceGoalOpen, setForceGoalOpen] = useState(false);

  const [dForm, setDForm] = useState({ name: "", type: "credit", balance: "", rate: "", min: "" });

  const pop = (msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2500);
  };

  if (!onboarded) {
    return <Onboarding onDone={(d) => {
      setName(d.name);
      setIncome(d.income);
      setDebts(d.initialDebts || []);
      setOnboarded(true);
      pop("Ledger active!", "🚀");
    }} />;
  }

  return (
    <div className="app">
      <style>{CSS}</style>
      
      {toast && <div className="toast">{toast.icon} <span>{toast.msg}</span></div>}

      <div className="hdr">
        <div className="logo">money<span style={{ color: C.accent }}>code</span></div>
        <button className={`btn ${isPlus ? "bplus" : "bg"} bsm`} onClick={() => setModal("upgrade")}>
          {isPlus ? "Plus Engine Pro" : "Upgrade Engine"}
        </button>
      </div>

      {tab === "home" && (
        <HomeTab 
          debts={debts} 
          name={name} 
          income={income} 
          efund={efund} 
          onOpenManage={() => setTab("plan")} 
          triggerSavingsForm={() => {
            setTab("money");
            setForceGoalOpen(true);
          }}
        />
      )}
      
      {tab === "debts" && (
        <DebtsTab 
          debts={debts} 
          setDebts={setDebts} 
          openModal={(m) => setModal(m)} 
          pop={pop} 
          onEdit={(d) => {
            setEditingDebt(d);
            setDForm({ name: d.name, type: d.type, balance: d.balance, rate: d.rate, min: d.min });
            setModal("edit");
          }}
        />
      )}
      
      {tab === "plan" && <PlanTab debts={debts} income={income} />}
      
      {tab === "money" && (
        <MoneyTab 
          debts={debts} 
          assets={assets} 
          setAssets={setAssets} 
          income={income} 
          setIncome={setIncome} 
          efund={efund} 
          setEfund={setEfund} 
          pop={pop}
          forceShowGoalForm={forceGoalOpen}
          closeForceGoal={() => setForceGoalOpen(false)}
        />
      )}
      
      {tab === "learn" && <LearnTab />}

      {/* SYSTEM MODALS */}
      {modal === "upgrade" && (
        <div className="mover" onClick={() => setModal(null)}>
          <div className="mo" onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div className="hdl" />
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Unlock Complete Projections</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>Unlock predictive amortization tracks, multi-factor simulations, and expanded cloud ledger parsing options.</div>
            <button className="btn bplus bfull" onClick={() => { setIsPlus(true); setModal(null); pop("Pro Systems Ready!", "✨"); }}>Activate Pro Access ($6.99/mo)</button>
          </div>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <div className="mover" onClick={() => setModal(null)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="hdl" />
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{modal === "add" ? "Log New Liability Record" : "Modify Record Parameters"}</div>
            <div className="fld"><div className="flb">Identifier</div><input className="inp" value={dForm.name} onChange={e => setDForm({ ...dForm, name: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div className="fld"><div className="flb">Principal Owed</div><input className="inp mono" type="number" value={dForm.balance} onChange={e => setDForm({ ...dForm, balance: e.target.value })} /></div>
              <div className="fld"><div className="flb">Rate % (APR)</div><input className="inp mono" type="number" value={dForm.rate} onChange={e => setDForm({ ...dForm, rate: e.target.value })} /></div>
            </div>
            <div className="fld"><div className="flb">Minimum Requirement</div><input className="inp mono" type="number" value={dForm.min} onChange={e => setDForm({ ...dForm, min: e.target.value })} /></div>
            <button className="btn bp bfull" disabled={!dForm.name || !dForm.balance} onClick={() => {
              const b = parseFloat(dForm.balance) || 0, r = parseFloat(dForm.rate) || 0, m = parseFloat(dForm.min) || 0;
              if (modal === "add") {
                setDebts([...debts, { id: Date.now(), name: dForm.name, type: "credit", balance: b, original: b, rate: r, min: m, color: C.accent }]);
                pop("Account Cataloged!");
              } else {
                setDebts(debts.map(x => x.id === editingDebt.id ? { ...x, name: dForm.name, balance: b, rate: r, min: m } : x));
                pop("Ledger Adjusted!");
              }
              setModal(null); setDForm({ name: "", type: "credit", balance: "", rate: "", min: "" });
            }}>{modal === "add" ? "Commit Entry" : "Save Structural Changes"}</button>
          </div>
        </div>
      )}

      {/* CORE TAB NAVIGATION */}
      <div className="tabbar">
        {[
          { id: "home", l: "Home", ico: <I.Home /> }, 
          { id: "debts", l: "Debts", ico: <I.Debt /> }, 
          { id: "plan", l: "Plan", ico: <I.Plan /> }, 
          { id: "money", l: "Money", ico: <I.Money /> }, 
          { id: "learn", l: "Learn", ico: <I.Learn /> }
        ].map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.ico}
            <span>{t.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
