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
  .card { background: ${C.surface}; border: 1px solid ${C.border}; padding: 14px; margin-bottom: 12px; border-radius: 12px; position: relative; }
  .hdr { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid ${C.border}; background: rgba(20,27,45,0.8); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 10; }
  .logo { font-weight: 800; font-size: 18px; letter-spacing: -0.5px; }
  .btn { border: none; border-radius: 8px; font-weight: 600; font-size: 13px; padding: 10px 16px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; color: white; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bp { background: ${C.accent}; }
  .bp:hover:not(:disabled) { opacity: 0.9; }
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
  .tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; display: inline-block; }
  .toast { position: fixed; top: 75px; left: 50%; transform: translateX(-50%); background: #1E293B; border: 1px solid ${C.border}; padding: 10px 16px; border-radius: 30px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 1000; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
  .badge-premium { background: linear-gradient(135deg, ${C.purple}, ${C.accent}); color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-left: 6px; }
  .matrix-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  .matrix-table th { text-align: left; padding: 8px; color: ${C.muted}; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid ${C.border}; }
  .matrix-table td { padding: 10px 8px; border-bottom: 1px solid rgba(36,47,72,0.5); }
  .matrix-row-highlight { background: rgba(59,130,246,0.03); }
`;

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

const I = {
  Home: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Review: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  Sync: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.75 12a7.25 7.25 0 0111.458-5.887M21.25 12a7.25 7.25 0 01-11.458 5.887M21.25 9V3.25M4.75 15v5.75"/></svg>,
  Plan: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  Learn: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
};

function Onboarding({ onDone }) {
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");

  return (
    <div className="scroll" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 24, marginTop: 40 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>moneycode</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>High-velocity ledger engine for complex personal capital flows.</div>
      </div>
      <div className="card">
        <div className="fld"><div className="flb">First Name / Identifier</div><input className="inp" placeholder="e.g. Alex" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="fld"><div className="flb">Monthly Take-Home Allocation ($)</div><input className="inp mono" type="number" placeholder="7500" value={income} onChange={e => setIncome(e.target.value)} /></div>
      </div>
      <button className="btn bp bfull" onClick={() => onDone({ name: name.trim() || "User", income: parseFloat(income) || 7500 })} style={{ padding: '14px' }}>Initialize Engine Profile</button>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("home");
  const [name, setName] = useState("");
  const [income, setIncome] = useState(7500);
  const [isPremium, setIsPremium] = useState(false);
  const [multiplayerActive, setMultiplayerActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [plaidHealthy, setPlaidHealthy] = useState(true);
  const [finicityFallback, setFinicityFallback] = useState(false);

  // Manual review queue contains ONLY unassigned transactions requiring human choices
  const [manualQueue, setManualQueue] = useState([
    { id: 2, merchant: "Target Store #2410", amount: 124.50, date: "Yesterday", desc: "Unassigned Consumer Liability Outflow" }
  ]);

  // Read-only background log proving zero-friction smart rules ran flawlessly
  const [autoExcludedLog, setAutoExcludedLog] = useState([
    { id: 1, merchant: "Flipped RSU Cash Settlement", amount: 14500, date: "Today", rule: "Smart Auto-Exclusion Engine", reason: "Isolated internal Brokerage to Checking self-transfer." },
    { id: 3, merchant: "ESPP Share Liquidation Flip", amount: 4800, date: "2 days ago", rule: "Smart Auto-Exclusion Engine", reason: "Isolated programmatic payroll stock liquidation swap." }
  ]);

  const pop = (msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2500);
  };

  const safeToSpend = useMemo(() => income * 0.45, [income]);

  return (
    <div className="app">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {toast && <div className="toast">{toast.icon} <span>{toast.msg}</span></div>}

      {!onboarded ? (
        <Onboarding onDone={(d) => {
          setName(d.name);
          setIncome(d.income);
          setOnboarded(true);
          pop("Ledger active!", "🚀");
        }} />
      ) : (
        <>
          <div className="hdr">
            <div className="logo">money<span style={{ color: C.accent }}>code</span>{isPremium && <span className="badge-premium">PRO</span>}</div>
            <button className={`btn ${isPremium ? "bplus" : "bg"} bsm`} onClick={() => {
              setIsPremium(!isPremium);
              pop(!isPremium ? "Premium Engine Active ($7/mo)" : "Switched to Free Tier (Manual)", "⚡");
            }}>
              {isPremium ? "Premium Tier Active" : "Simulate $7 Paywall"}
            </button>
          </div>

          {/* TAB 1: HOME */}
          {tab === "home" && (
            <div className="scroll">
              <div style={{ display: "flex", justifycontent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ACTIVE LEDGER PROFILE</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{name}'s Household</div>
                </div>
                {isPremium && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: multiplayerActive ? C.success : C.muted }}>
                      {multiplayerActive ? "MULTIPLAYER SYNCED" : "SINGLE PLAYER"}
                    </span>
                    <input type="checkbox" checked={multiplayerActive} onChange={(e) => {
                      setMultiplayerActive(e.target.checked);
                      pop(e.target.checked ? "Partner session link connected!" : "Switched to individual view");
                    }} style={{ accentColor: C.success }} />
                  </div>
                )}
              </div>

              <div className="card" style={{ background: `linear-gradient(135deg, #1E293B, ${C.surface})` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: 0.5 }}>SNAPPY HOME PHONE WIDGET METER</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>"Safe to Spend" Balance</div>
                  </div>
                  <span style={{ fontSize: 18 }}>📱</span>
                </div>
                <div className="mono" style={{ fontSize: 32, fontWeight: 900, color: C.success, margin: "8px 0 4px 0" }}>
                  {fmt(safeToSpend)}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>Calculated system net liquidity protection buffer.</div>
              </div>

              <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>INGESTION ENGINE PATHWAY</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: !isPremium ? C.yellow : (plaidHealthy ? C.success : C.purple) }}>
                    {!isPremium ? "Manual Input Mode Only" : (plaidHealthy ? "Primary API Core Link: Plaid Live" : "Fallback Router Live: Finicity Active")}
                  </div>
                </div>
                <button className="btn bg bsm" onClick={() => setTab("sync")}>View Routing</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="card" style={{ marginBottom: 0 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>MANUAL REVIEW QUEUE</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: manualQueue.length > 0 ? C.yellow : C.success }}>
                    {manualQueue.length} items
                  </div>
                  {manualQueue.length > 0 && <button className="btn bp bsm bfull" style={{ marginTop: 8, fontSize: 10 }} onClick={() => setTab("review")}>Launch Two-Tap UI</button>}
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>SILENT EXCLUSIONS RUN</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: C.purple }}>
                    {autoExcludedLog.length} filtered
                  </div>
                  <button className="btn bg bsm bfull" style={{ marginTop: 8, fontSize: 10 }} onClick={() => setTab("review")}>View Logs</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TWO-TAP REVIEW UI */}
          {tab === "review" && (
            <div className="scroll">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Two-Tap Verification Hub</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>High-velocity action queue for inputs requiring human evaluation.</div>
              </div>

              {/* MANUAL INTERACTION BLOCK */}
              <p className="lbl">Needs Action ({manualQueue.length})</p>
              {manualQueue.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "24px 12px" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Manual Queue Cleared</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>All outstanding unassigned leakage vectors verified.</div>
                </div>
              ) : (
                manualQueue.map(tx => (
                  <div key={tx.id} className="card" style={{ border: `1px solid ${C.accent}`, background: "#111827" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="tag" style={{ background: "rgba(59,130,246,0.15)", color: C.blue, marginBottom: 6 }}>Unassigned Outflow</span>
                        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{tx.merchant}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tx.desc}</div>
                      </div>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: C.yellow }}>
                        -{fmt(tx.amount)}
                      </div>
                    </div>
                    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <button className="btn bg bsm" onClick={() => pop("Split parameters expanded.")}>Split Cashflow</button>
                      <button className="btn bp bsm" onClick={() => {
                        setManualQueue(manualQueue.filter(x => x.id !== tx.id));
                        pop("Approved to ledger!");
                      }}>Approve Choice</button>
                    </div>
                  </div>
                ))
              )}

              {/* TRUE BACKGROUND AUTO-EXCLUSION DISPLAY ROW */}
              <p className="lbl" style={{ marginTop: 24 }}>Background Exclusions (Zero Input Run)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {autoExcludedLog.map(log => (
                  <div key={log.id} className="card" style={{ borderLeft: `3px solid ${C.purple}`, opacity: 0.85, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{log.merchant}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{log.reason}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>{fmt(log.amount)}</div>
                        <span className="tag" style={{ background: "rgba(139,92,246,0.12)", color: C.purple, fontSize: 9, marginTop: 4 }}>Isolated</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROUTING STATUS */}
          {tab === "sync" && (
            <div className="scroll">
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Multi-Aggregator Failover Core</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Simulation parameters testing API connection continuity.</div>
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: plaidHealthy ? C.success : C.red }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Primary Tunnel Core (Plaid)</span>
                  </div>
                  <button className="btn bg bsm" style={{ fontSize: 9, padding: "4px 8px" }} onClick={() => {
                    setPlaidHealthy(!plaidHealthy);
                    if (plaidHealthy) setFinicityFallback(true);
                    pop(plaidHealthy ? "Simulated Plaid outage. Running backup loop..." : "Plaid connection online");
                  }}>
                    {plaidHealthy ? "Drop Connection" : "Repair Link"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: (!plaidHealthy && finicityFallback) ? C.purple : C.muted }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Secondary Failover (Finicity)</span>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: (!plaidHealthy && finicityFallback) ? C.purple : C.muted, fontWeight: 700 }}>
                    {(!plaidHealthy && finicityFallback) ? "ACTIVE ROUTE" : "STANDBY"}
                  </span>
                </div>
              </div>

              <p className="lbl">Core Product Structural Architecture</p>
              <div className="card" style={{ padding: "8px" }}>
                <table className="matrix-table">
                  <thead>
                    <tr><th>Feature Array</th><th>Free Tier Mode</th><th>Premium ($7/mo)</th></tr>
                  </thead>
                  <tbody>
                    <tr className={!isPremium ? "matrix-row-highlight" : ""}>
                      <td><strong>Data Ingestion</strong></td>
                      <td style={{ color: !isPremium ? C.accent : C.text }}>Manual / CSV</td>
                      <td style={{ color: isPremium ? C.accent : C.text }}>Unlimited API Sync</td>
                    </tr>
                    <tr><td><strong>Account Caps</strong></td><td>Up to 2 Accounts</td><td>Unlimited Pipeline Links</td></tr>
                    <tr className={isPremium ? "matrix-row-highlight" : ""}>
                      <td><strong>Collaboration</strong></td><td>Single User</td><td><strong>Multiplayer Mode</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PLAN */}
          {tab === "plan" && (
            <div className="scroll">
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Strategic Allocations Engine</div>
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div className="flb" style={{ margin: 0 }}>Advanced "Rollover" Budget Rules</div>
                  {isPremium ? <span className="tag" style={{ background: C.success, color: "white" }}>Unlocked</span> : <span className="tag" style={{ background: C.border, color: C.muted }}>Locked</span>}
                </div>
                <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 10px 0" }}>Cascade remaining unspent monthly limits directly into your secondary investment horizons.</p>
                <div style={{ background: C.bg, padding: "8px", borderRadius: 6, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>Target Overflow Rule Vector:</span>
                  <strong style={{ color: isPremium ? C.accent : C.muted }}>{isPremium ? "Active -> Cascade to Portfolio Index" : "Inactive (Requires Premium)"}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPECS */}
          {tab === "learn" && (
            <div className="scroll">
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>System Intelligence Hub</div>
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Why $7/mo Beats the Competition</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  By keeping data-ingestion restricted to manual/CSV formats on the free track, API infrastructure cost runs at zero until monetization occurs. Premium tier unlocks localized multiplayer modes that deliver superior multi-user household velocity over heavy competitors.
                </div>
              </div>
            </div>
          )}

          {/* CORE TAB BAR */}
          <div className="tabbar">
            {[
              { id: "home", l: "Home", ico: <I.Home /> }, 
              { id: "review", l: "Two-Tap", ico: <I.Review /> }, 
              { id: "sync", l: "Routing", ico: <I.Sync /> }, 
              { id: "plan", l: "Plan", ico: <I.Plan /> }, 
              { id: "learn", l: "Specs", ico: <I.Learn /> }
            ].map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                {t.ico}
                <span>{t.l}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
