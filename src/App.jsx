import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#080C12", surface:"#0F1520", card:"#141B27", border:"#1E2D42",
  accent:"#B5FF4D", red:"#FF5A5A", yellow:"#FFD166", blue:"#58A6FF",
  purple:"#A78BFA", text:"#E6EDF3", muted:"#5B7087", success:"#3FB950",
};

const fmt  = n => "$" + Math.abs(n).toLocaleString("en-US",{maximumFractionDigits:0});
const fmtD = n => "$" + Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const toDate = m => { const d=new Date(); d.setMonth(d.getMonth()+Math.round(m)); return d.toLocaleDateString("en-US",{month:"long",year:"numeric"}); };
const pct = (a,b) => b===0?0:Math.round((a/b)*100);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#080C12;color:#E6EDF3;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.scroll{flex:1;overflow-y:auto;padding:16px 16px 100px;}
.scroll::-webkit-scrollbar{display:none;}
.mono{font-family:'DM Mono',monospace;}
.tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#0F1520;border-top:1px solid #1E2D42;display:flex;z-index:100;}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 0 6px;gap:2px;cursor:pointer;border:none;background:none;color:#5B7087;font-size:8px;font-family:Inter,sans-serif;font-weight:600;letter-spacing:.05em;text-transform:uppercase;transition:color .15s;position:relative;}
.tab.on{color:#B5FF4D;}
.tab svg{width:17px;height:17px;}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 0;}
.logo{font-weight:800;font-size:17px;letter-spacing:-.03em;}
.card{background:#141B27;border:1px solid #1E2D42;border-radius:14px;padding:16px;margin-bottom:12px;}
.lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5B7087;margin-bottom:10px;}
.chips{display:flex;gap:8px;margin-bottom:14px;}
.chip{background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:11px;flex:1;}
.cv{font-family:'DM Mono',monospace;font-size:15px;font-weight:500;line-height:1;}
.cl{font-size:9px;color:#5B7087;margin-top:4px;font-weight:500;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:10px;border:none;font-family:Inter,sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.bp{background:#B5FF4D;color:#080C12;}
.bp:hover{filter:brightness(1.08);}
.bp:disabled{opacity:.4;cursor:not-allowed;}
.bplus{background:linear-gradient(135deg,#FFD166,#FFA620);color:#080C12;}
.bg{background:transparent;color:#E6EDF3;border:1px solid #1E2D42;}
.bg:hover{border-color:#B5FF4D44;}
.bsm{padding:6px 11px;font-size:11px;border-radius:8px;}
.bfull{width:100%;}
.bico{padding:8px;border-radius:8px;}
.tag{display:inline-block;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
.tr{background:#FF5A5A20;color:#FF5A5A;}
.tg{background:#3FB95020;color:#3FB950;}
.tb{background:#58A6FF20;color:#58A6FF;}
.ty{background:#FFD16620;color:#FFD166;}
.tp{background:#A78BFA20;color:#A78BFA;}
.tpl{background:#FFD16625;color:#FFD166;border:1px solid #FFD16630;}
.inp{background:#0F1520;border:1px solid #1E2D42;border-radius:9px;padding:10px 12px;color:#E6EDF3;font-family:Inter,sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#B5FF4D80;}
.fld{margin-bottom:12px;}
.flb{font-size:11px;color:#5B7087;margin-bottom:4px;font-weight:600;}
.mover{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.mo{background:#0F1520;border:1px solid #1E2D42;border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:18px 18px 40px;max-height:88vh;overflow-y:auto;}
.mo::-webkit-scrollbar{display:none;}
.hdl{width:32px;height:4px;background:#1E2D42;border-radius:2px;margin:0 auto 16px;}
.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:9px 15px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;display:flex;align-items:center;gap:8px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
.pbar{height:4px;background:#1E2D42;border-radius:2px;overflow:hidden;}
.pfill{height:100%;border-radius:2px;transition:width .6s ease;}
.irow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #1E2D42;}
.irow:last-child{border-bottom:none;}
.fhero{background:linear-gradient(135deg,rgba(181,255,77,.12),transparent);border:1px solid rgba(181,255,77,.28);border-radius:16px;padding:18px;text-align:center;margin-bottom:14px;}
.fdate{font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#B5FF4D;margin:6px 0 4px;}
.sli{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#1E2D42;outline:none;}
.sli::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#B5FF4D;cursor:pointer;}
.stog{display:flex;background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:3px;margin-bottom:14px;}
.sbtn{flex:1;padding:7px;border:none;border-radius:8px;font-family:Inter,sans-serif;font-size:11px;font-weight:600;cursor:pointer;background:transparent;color:#5B7087;}
.sbtn.on{background:#B5FF4D;color:#080C12;}
.cel{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.88);flex-direction:column;gap:14px;padding:32px;}
@keyframes pop{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes fall{from{transform:translateY(-20px) rotate(0deg);opacity:1;}to{transform:translateY(100vh) rotate(720deg);opacity:0;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
.ob{min-height:100vh;display:flex;flex-direction:column;padding:44px 22px 36px;}
.opip{height:3px;flex:1;border-radius:2px;background:#1E2D42;transition:background .3s;}
.opip.on{background:#B5FF4D;}
.oopt{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid #1E2D42;border-radius:12px;margin-bottom:9px;cursor:pointer;background:#141B27;transition:all .15s;}
.oopt.on{border-color:#B5FF4D;background:rgba(181,255,77,.07);}
.ring{position:relative;width:160px;height:160px;margin:0 auto 14px;}
.rinv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ttrk{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0;}
.ttmb{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
.msg{max-width:88%;padding:10px 13px;border-radius:14px;font-size:13px;line-height:1.55;margin-bottom:8px;}
.mai{background:#141B27;border:1px solid #1E2D42;border-radius:4px 14px 14px 14px;}
.mme{background:#B5FF4D;color:#080C12;font-weight:500;margin-left:auto;border-radius:14px 4px 14px 14px;}
.dot{width:6px;height:6px;border-radius:50%;background:#5B7087;animation:pulse 1.2s ease-in-out infinite;}
.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px;}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:11px;font-weight:600;position:relative;cursor:default;}
.cal-hdr{font-size:9px;color:#5B7087;text-align:center;padding:4px 0;font-weight:700;text-transform:uppercase;}
.score-arc{transform-origin:center;}
.health-bar{height:8px;border-radius:4px;overflow:hidden;background:#1E2D42;margin:6px 0;}
.health-fill{height:100%;border-radius:4px;transition:width .8s ease;}
.dz{border:2px dashed #1E2D42;border-radius:12px;padding:24px 16px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:10px;}
.dz:hover{border-color:#B5FF4D;background:rgba(181,255,77,.05);}
.budget-bar{height:6px;border-radius:3px;overflow:hidden;background:#1E2D42;margin-top:6px;}
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Home:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Debt:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Plan:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Worth:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Budget:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  More:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  Send:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Sync:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Bell:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Lock:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Check:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Up:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Credit:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  AI:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  Cal:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Heart:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({on,set}) {
  return <button className="ttrk" style={{background:on?C.accent:C.border}} onClick={()=>set(!on)}><div className="ttmb" style={{left:on?23:3}}/></button>;
}
function Confetti() {
  const dots=Array.from({length:32},(_,i)=>({id:i,x:Math.random()*100,delay:Math.random()*1.2,dur:1.4+Math.random(),color:[C.accent,C.yellow,C.blue,C.purple,C.red][i%5],size:5+Math.random()*7}));
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:499}}>{dots.map(d=><div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:0,width:d.size,height:d.size,borderRadius:2,background:d.color,animation:`fall ${d.dur}s ${d.delay}s linear forwards`}}/>)}</div>;
}
function Gauge({pct:p}) {
  const r=68,cx=84,cy=76,toR=d=>d*Math.PI/180,a=Math.min(p||0,1)*180;
  const ax=cx+r*Math.cos(toR(180-a)),ay=cy-r*Math.sin(toR(180-a));
  const color=(p||0)>0.7?C.red:(p||0)>0.4?C.yellow:C.success;
  const arc=(f,t,c)=>{const x1=cx+r*Math.cos(toR(180-f)),y1=cy-r*Math.sin(toR(180-f)),x2=cx+r*Math.cos(toR(180-t)),y2=cy-r*Math.sin(toR(180-t));return<path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="8" strokeLinecap="butt"/>;};
  return (
    <div style={{position:"relative",width:168,height:88,margin:"0 auto 4px"}}>
      <svg width="168" height="88" viewBox="0 0 168 88">
        {arc(0,60,C.success+"40")}{arc(60,120,C.yellow+"40")}{arc(120,180,C.red+"40")}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${ax} ${ay}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
        <circle cx={cx} cy={cy} r="4.5" fill={C.text}/>
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center"}}>
        <div className="mono" style={{fontSize:20,fontWeight:500,color}}>{Math.round((1-(p||0))*100)}%</div>
        <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>paid off</div>
      </div>
    </div>
  );
}
function ScoreRing({score}) {
  const r=62,cx=80,cy=80,circ=2*Math.PI*r,p=(score-300)/550,dash=circ*p;
  const color=score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red;
  const band=score>=740?"Excellent":score>=670?"Good":score>=580?"Fair":"Poor";
  return (
    <div className="ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="10"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div className="rinv"><div className="mono" style={{fontSize:32,fontWeight:500,color,lineHeight:1}}>{score}</div><div style={{fontSize:11,color,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>{band}</div></div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({onDone}) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [goal,setGoal]=useState("payoff");
  const [incType,setIncType]=useState("regular");
  const [income,setIncome]=useState("");
  const next=()=>step<3?setStep(s=>s+1):onDone(name);
  const GOALS=[{id:"payoff",e:"🎯",l:"Get out of debt",s:"Payoff strategies + savings"},{id:"invest",e:"💹",l:"Start investing",s:"Build wealth while managing debt"},{id:"score",e:"📈",l:"Build my credit",s:"Score tracking + utilization"},{id:"both",e:"⚡",l:"All of the above",s:"Debt payoff + credit + investing"}];
  const ITYPES=[{id:"regular",e:"🗓️",l:"Regular salary",s:"Same amount each paycheck"},{id:"variable",e:"📊",l:"Variable income",s:"Freelance, gig, hourly"},{id:"multiple",e:"💼",l:"Multiple streams",s:"Side hustles + investments"}];
  return (
    <div className="ob" style={{background:C.bg}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
        <div className="logo">money<span style={{color:C.accent}}>code</span></div>
        {step>0&&<button className="btn bg bsm" onClick={()=>setStep(s=>s-1)}>← Back</button>}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:30}}>{[0,1,2,3].map(i=><div key={i} className={`opip${i<=step?" on":""}`}/>)}</div>
      {step===0&&<><div style={{fontSize:42,marginBottom:14}}>👋</div><div style={{fontSize:24,fontWeight:800,marginBottom:8}}>What's your name?</div><div style={{fontSize:14,color:C.muted,marginBottom:26,lineHeight:1.6}}>We'll personalize your plan and keep things real.</div><div className="fld"><input className="inp" placeholder="First name" value={name} onChange={e=>setName(e.target.value)} style={{fontSize:18,padding:"13px 15px"}}/></div><button className="btn bp bfull" style={{padding:14,fontSize:15,marginTop:8}} disabled={!name.trim()} onClick={next}>Let's go →</button></>}
      {step===1&&<><div style={{fontSize:42,marginBottom:14}}>🎯</div><div style={{fontSize:24,fontWeight:800,marginBottom:8}}>What's your main goal{name?`, ${name}`:""}?</div><div style={{fontSize:14,color:C.muted,marginBottom:26}}>We'll build your experience around this.</div>{GOALS.map(g=><div key={g.id} className={`oopt${goal===g.id?" on":""}`} onClick={()=>setGoal(g.id)}><span style={{fontSize:20,width:30,textAlign:"center"}}>{g.e}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{g.l}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{g.s}</div></div>{goal===g.id&&<I.Check/>}</div>)}<button className="btn bp bfull" style={{padding:13,marginTop:12}} onClick={next}>Continue →</button></>}
      {step===2&&<><div style={{fontSize:42,marginBottom:14}}>💰</div><div style={{fontSize:24,fontWeight:800,marginBottom:8}}>How do you get paid?</div><div style={{fontSize:14,color:C.muted,marginBottom:26}}>Shapes your payoff plan and advice.</div>{ITYPES.map(t=><div key={t.id} className={`oopt${incType===t.id?" on":""}`} onClick={()=>setIncType(t.id)}><span style={{fontSize:20,width:30,textAlign:"center"}}>{t.e}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{t.l}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{t.s}</div></div>{incType===t.id&&<I.Check/>}</div>)}<button className="btn bp bfull" style={{padding:13,marginTop:12}} onClick={next}>Continue →</button></>}
      {step===3&&<><div style={{fontSize:42,marginBottom:14}}>📊</div><div style={{fontSize:24,fontWeight:800,marginBottom:8}}>Monthly take-home pay?</div><div style={{fontSize:14,color:C.muted,marginBottom:26}}>After taxes — used for your debt-to-income ratio.</div><div className="fld" style={{position:"relative"}}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:16}}>$</span><input className="inp mono" type="number" placeholder="3200" value={income} onChange={e=>setIncome(e.target.value)} style={{paddingLeft:26,fontSize:20,padding:"13px 13px 13px 26px"}}/></div><button className="btn bp bfull" style={{padding:13}} disabled={!income} onClick={next}>Set up my plan →</button><button className="btn bg bfull bsm" style={{marginTop:8}} onClick={next}>Skip for now</button></>}
    </div>
  );
}

// ── Financial Health Score ────────────────────────────────────────────────────
function HealthScore({debts,score,assets,income,efund}) {
  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const totalAssets=assets.reduce((s,a)=>s+a.value,0);
  const netWorth=totalAssets-totalDebt;
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const dti=income>0?mins/income:0;
  const highRate=debts.length>0?Math.max(...debts.map(d=>d.rate)):0;
  const efundGoal=income*3;
  const efundPct=efundGoal>0?Math.min(efund/efundGoal,1):0;

  const factors=[
    {l:"Credit score",     v:score>=740?100:score>=670?75:score>=580?50:25, w:25, color:score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red},
    {l:"Debt-to-income",   v:dti<.15?100:dti<.3?70:dti<.4?40:10,          w:25, color:dti<.15?C.success:dti<.3?C.accent:dti<.4?C.yellow:C.red},
    {l:"Emergency fund",   v:Math.round(efundPct*100),                      w:20, color:efundPct>=1?C.success:efundPct>=.5?C.yellow:C.red},
    {l:"Interest rates",   v:highRate===0?100:highRate<7?80:highRate<15?50:20, w:15, color:highRate<7?C.success:highRate<15?C.yellow:C.red},
    {l:"Net worth trend",  v:netWorth>=0?Math.min(100,50+netWorth/1000):10, w:15, color:netWorth>=0?C.success:C.red},
  ];
  const overall=Math.round(factors.reduce((s,f)=>s+(f.v*f.w/100),0));
  const label=overall>=80?"Excellent":overall>=65?"Good":overall>=45?"Fair":"Needs work";
  const color=overall>=80?C.success:overall>=65?C.accent:overall>=45?C.yellow:C.red;

  return {overall,label,color,factors};
}

// ── Home Tab ──────────────────────────────────────────────────────────────────
function HomeTab({debts,isPlus,onSync,onUpgrade,onCelebrate,name,onAddDebt,score,assets,income,efund}) {
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const orig=debts.reduce((s,d)=>s+d.original,0);
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const intMo=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12),0);
  const p=orig>0?total/orig:0;
  const mo=mins>0?Math.ceil(total/(mins*1.3)):0;
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const health=HealthScore({debts,score,assets,income,efund});
  const MS=[{e:"🎉",t:"First $1,000 paid",s:"You started.",ok:(orig-total)>=1000},{e:"🔥",t:"25% cleared",s:fmt(orig*.25)+" milestone",ok:p<=.75&&orig>0},{e:"⚡",t:"Halfway there",s:fmt(orig*.5)+" down",ok:p<=.5&&orig>0},{e:"🏁",t:"Final stretch",s:"Under 25% left",ok:p<=.25&&orig>0}];
  const done=MS.filter(m=>m.ok);

  if(debts.length===0) return (
    <div className="scroll">
      <div style={{marginBottom:18}}><div style={{fontSize:13,color:C.muted,marginBottom:4}}>{greet}{name?`, ${name}`:""} 👋</div><div style={{fontSize:24,fontWeight:800,marginBottom:8,lineHeight:1.2}}>Let's build your financial plan</div><div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Add your first debt to get started.</div></div>
      <div className="card" style={{borderColor:C.accent+"40",textAlign:"center",padding:26,marginBottom:12}}>
        <div style={{fontSize:40,marginBottom:10}}>💳</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>No debts added yet</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:18,lineHeight:1.6}}>Add your student loans, credit cards, and car payments to see your full picture.</div>
        <button className="btn bp bfull" onClick={onAddDebt}>+ Add your first debt</button>
      </div>
      <div className="card">
        <div className="lbl">What you'll unlock</div>
        {[["📊","Debt overview & payoff timeline"],["🎯","Your personal Freedom Date"],["💡","Daily interest cost"],["🏆","Milestone celebrations"],["❤️","Financial Health Score"]].map(([e,t],i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:18,flexShrink:0}}>{e}</span>
            <div style={{fontSize:13,color:C.muted,alignSelf:"center"}}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="scroll">
      <div style={{marginBottom:16}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{greet}{name?`, ${name}`:""} 👋</div>
        <div className="mono" style={{fontSize:34,fontWeight:500,letterSpacing:"-.02em",lineHeight:1}}>{fmt(total)}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:5}}>{fmt(orig-total)} paid · {Math.round((1-p)*100)}% done</div>
      </div>
      <Gauge pct={p}/>
      <div className="chips" style={{marginTop:12}}>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(mins)}</div><div className="cl">due / mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(intMo)}</div><div className="cl">interest / mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.accent}}>{mo>0?`${mo}mo`:"—"}</div><div className="cl">to free</div></div>
      </div>

      {/* Health Score mini */}
      <div className="card" style={{marginBottom:12,borderColor:health.color+"44"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontWeight:700,fontSize:14}}>Financial Health</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{health.label}</div></div>
          <div className="mono" style={{fontSize:32,fontWeight:500,color:health.color}}>{health.overall}</div>
        </div>
        <div className="health-bar"><div className="health-fill" style={{width:`${health.overall}%`,background:health.color}}/></div>
      </div>

      {isPlus?(
        <div className="fhero">
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Your Freedom Date</div>
          <div className="fdate">{mo>0?toDate(mo):"Add debts to calculate"}</div>
          <div style={{fontSize:12,color:C.muted}}>at current pace + {fmt(mins*.3)} extra/mo</div>
          <button className="btn bg bsm" style={{marginTop:10}} onClick={onSync}><I.Sync/>Sync</button>
        </div>
      ):(
        <div style={{position:"relative",marginBottom:12}}>
          <div style={{filter:"blur(4px)",userSelect:"none",pointerEvents:"none"}}><div className="fhero"><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Your Freedom Date</div><div className="fdate">March 2028</div></div></div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}><I.Lock/><div style={{fontWeight:700,fontSize:13}}>Freedom Date — Plus only</div><button className="btn bplus bsm" onClick={onUpgrade}>Unlock — $6.99/mo</button></div>
        </div>
      )}

      <div className="card" style={{borderColor:C.red+"30",marginBottom:12}}>
        <div style={{fontSize:10,color:C.red,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>What debt costs you</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13}}>Per day in interest</span><span className="mono" style={{color:C.red}}>{fmt(intMo/30)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13}}>Per year</span><span className="mono" style={{color:C.red}}>{fmt(intMo*12)}</span></div>
      </div>

      <p className="lbl">Milestones</p>
      <div className="card">
        {MS.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:i<MS.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:18,opacity:m.ok?1:.25,marginTop:2}}>{m.e}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:m.ok?C.text:C.muted}}>{m.t}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{m.s}</div></div>
            {m.ok&&<span className="tag tg">Done</span>}
          </div>
        ))}
      </div>
      {done.length>0&&<button className="btn bg bsm bfull" style={{marginTop:4}} onClick={()=>onCelebrate(done[done.length-1])}>🎉 Celebrate a milestone</button>}
    </div>
  );
}

// ── Debts Tab ─────────────────────────────────────────────────────────────────
function DebtsTab({debts,setDebts,openModal,pop}) {
  const [sort,setSort]=useState("rate");
  const TM={student:"tb",auto:"ty",credit:"tr",personal:"tb",medical:"tp",imported:"tb"};
  const TL={student:"Student",auto:"Auto",credit:"Credit",personal:"Personal",medical:"Medical",imported:"CSV"};
  const sorted=[...debts].sort((a,b)=>sort==="rate"?b.rate-a.rate:sort==="balance"?b.balance-a.balance:a.min-b.min);
  return (
    <div className="scroll">
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button className="btn bp bsm" onClick={()=>openModal("add")}><I.Plus/>Add debt</button>
        <button className="btn bg bsm" onClick={()=>openModal("import")}><I.Up/>Import CSV</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[["rate","Highest APR"],["balance","Largest"],["min","Min pmt"]].map(([s,l])=>(
          <button key={s} className={`btn bsm ${sort===s?"bp":"bg"}`} onClick={()=>setSort(s)}>{l}</button>
        ))}
      </div>
      {debts.length===0?(
        <div className="card" style={{textAlign:"center",padding:28}}>
          <div style={{fontSize:36,marginBottom:10}}>💳</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>No debts yet</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Tap "+ Add debt" to get started.</div>
          <button className="btn bp bfull" onClick={()=>openModal("add")}>+ Add your first debt</button>
        </div>
      ):(
        <div className="card">
          {sorted.map(d=>{
            const paid=d.original>0?1-(d.balance/d.original):0;
            return (
              <div key={d.id} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:3,display:"flex",alignItems:"center",gap:6}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span><span className={`tag ${TM[d.type]||"tb"}`}>{TL[d.type]||"Other"}</span></div>
                    <div style={{fontSize:11,color:C.muted}}>{d.rate}% APR · {fmtD(d.min)}/mo min</div>
                  </div>
                  <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}><div className="mono" style={{fontSize:14,fontWeight:500}}>{fmtD(d.balance)}</div><div style={{fontSize:10,color:C.muted}}>{Math.round(paid*100)}% paid</div></div>
                </div>
                <div className="pbar"><div className="pfill" style={{width:`${paid*100}%`,background:d.color}}/></div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:5}}><button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}} onClick={()=>{setDebts(x=>x.filter(v=>v.id!==d.id));pop("Removed","✕");}}>✕ remove</button></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Plan Tab ──────────────────────────────────────────────────────────────────
function PlanTab({debts,isPlus,onUpgrade}) {
  const [extra,setExtra]=useState(100);
  const [strat,setStrat]=useState("avalanche");
  const [inc,setInc]=useState(3500);
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const mo=mins+extra>0?Math.ceil(total/(mins+extra)):0;
  const totI=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*mo),0);
  const dti=inc>0?mins/inc:0;
  const ord=strat==="avalanche"?[...debts].sort((a,b)=>b.rate-a.rate):[...debts].sort((a,b)=>a.balance-b.balance);

  // Payoff comparison
  const moMinOnly=mins>0?Math.ceil(total/mins):0;
  const moAvalanche=mins+100>0?Math.ceil(total/(mins+100)):0;
  const moSnowball=mins+100>0?Math.ceil(total/(mins+100)):0;
  const intMinOnly=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*moMinOnly),0);
  const intAvalanche=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*moAvalanche),0);
  const saved=intMinOnly-intAvalanche;

  return (
    <div className="scroll">
      <p className="lbl">Extra payment / month</p>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:13,color:C.muted}}>+$</span><input className="inp mono" type="number" value={extra} onChange={e=>setExtra(Math.max(0,parseInt(e.target.value)||0))} style={{flex:1}}/><span style={{fontSize:13,color:C.muted}}>/mo</span></div>
        <input className="sli" type="range" min="0" max="1000" step="25" value={extra} onChange={e=>setExtra(parseInt(e.target.value))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>{[0,50,100,200,500].map(v=><button key={v} className={`btn bsm ${extra===v?"bp":"bg"}`} onClick={()=>setExtra(v)}>+{fmt(v)}</button>)}</div>
      </div>

      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.accent}}>{mo>0?`${mo}mo`:"—"}</div><div className="cl">debt-free</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(mins+extra)}</div><div className="cl">total/mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(totI)}</div><div className="cl">total interest</div></div>
      </div>

      {isPlus&&mo>0&&<div className="fhero" style={{marginBottom:14}}><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Debt-free by</div><div className="fdate">{toDate(mo)}</div><div style={{fontSize:11,color:C.muted}}>with {fmt(extra)} extra/mo</div></div>}

      {/* Payoff comparison */}
      <p className="lbl">Payoff strategy comparison</p>
      <div className="card" style={{marginBottom:14}}>
        {[
          {l:"Minimums only",    mo:moMinOnly,   int:intMinOnly,   color:C.red,     tag:"Slowest"},
          {l:"Avalanche +$100", mo:moAvalanche, int:intAvalanche, color:C.accent,  tag:"Saves most"},
          {l:"Snowball +$100",  mo:moSnowball,  int:intAvalanche*1.05, color:C.blue, tag:"Motivating"},
        ].map((r,i)=>(
          <div key={i} style={{padding:"11px 0",borderBottom:i<2?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{r.l}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.mo>0?`${r.mo} months`:"—"} · {fmt(r.int)} interest</div></div>
              <span className={`tag ${i===0?"tr":i===1?"tg":"tb"}`}>{r.tag}</span>
            </div>
            <div className="pbar"><div className="pfill" style={{width:moMinOnly>0?`${Math.min((r.mo/moMinOnly)*100,100)}%`:"0%",background:r.color}}/></div>
          </div>
        ))}
        {saved>0&&<div style={{marginTop:12,padding:"10px 12px",background:C.success+"12",borderRadius:8,border:`1px solid ${C.success}30`}}>
          <div style={{fontSize:12,color:C.success,fontWeight:600}}>💡 Avalanche saves you {fmt(saved)} in interest vs. minimums only</div>
        </div>}
      </div>

      <p className="lbl">Attack order — {strat}</p>
      <div className="stog"><button className={`sbtn${strat==="avalanche"?" on":""}`} onClick={()=>setStrat("avalanche")}>⚡ Avalanche</button><button className={`sbtn${strat==="snowball"?" on":""}`} onClick={()=>setStrat("snowball")}>☃️ Snowball</button></div>
      <div className="card" style={{marginBottom:14}}>
        {ord.length===0?<div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:13}}>Add debts to see your attack order</div>:ord.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:i<ord.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:i===0?C.accent:C.border,color:i===0?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{d.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{d.rate}% APR · {fmtD(d.balance)}</div></div>
            {i===0&&<span className="tag tg">Focus</span>}
          </div>
        ))}
      </div>

      {isPlus?(
        <><p className="lbl">Debt-to-income ratio</p>
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:12,color:C.muted}}>Monthly income $</span><input className="inp mono" type="number" value={inc} onChange={e=>setInc(parseInt(e.target.value)||0)} style={{width:110}}/></div>
          <div className="pbar" style={{marginBottom:7}}><div className="pfill" style={{width:`${Math.min(dti,1)*100}%`,background:dti>.4?C.red:dti>.2?C.yellow:C.success}}/></div>
          <div style={{fontSize:13}}>Payments = <span className="mono" style={{color:dti>.4?C.red:dti>.2?C.yellow:C.success}}>{Math.round(dti*100)}%</span> of income{dti>.4&&<span style={{fontSize:12,color:C.red}}> · High</span>}{dti<=.2&&<span style={{fontSize:12,color:C.success}}> · Healthy</span>}</div>
        </div></>
      ):(
        <div style={{position:"relative"}}><div style={{filter:"blur(3px)",pointerEvents:"none",userSelect:"none"}}><p className="lbl">Debt-to-income ratio</p><div className="card"><div style={{height:50}}/></div></div><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><I.Lock/><button className="btn bplus bsm" onClick={onUpgrade}>Unlock with Plus</button></div></div>
      )}
    </div>
  );
}

// ── Net Worth Tab ─────────────────────────────────────────────────────────────
function WorthTab({debts,assets,setAssets,pop}) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",value:"",type:"Savings"});
  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const totalAssets=assets.reduce((s,a)=>s+a.value,0);
  const netWorth=totalAssets-totalDebt;
  const positive=netWorth>=0;
  const TYPES=["Savings","Checking","Retirement","Investment","Home","Vehicle","Other"];
  const addAsset=()=>{
    if(!form.name||!form.value)return;
    setAssets(a=>[...a,{id:Date.now(),name:form.name,value:parseFloat(form.value),type:form.type,color:{Savings:C.blue,Checking:C.blue,Retirement:C.success,Investment:C.success,Home:C.purple,Vehicle:C.yellow,Other:C.muted}[form.type]||C.blue}]);
    setForm({name:"",value:"",type:"Savings"});setShowAdd(false);
    pop("Asset added");
  };
  const grouped=TYPES.filter(t=>assets.some(a=>a.type===t)).map(t=>({type:t,items:assets.filter(a=>a.type===t),total:assets.filter(a=>a.type===t).reduce((s,a)=>s+a.value,0)}));

  return (
    <div className="scroll">
      {/* Net worth hero */}
      <div className="card" style={{textAlign:"center",padding:24,marginBottom:12,borderColor:(positive?C.success:C.red)+"44",background:`linear-gradient(135deg,#141B27,${positive?"#0F1A14":"#1A0F0F"})`}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Net Worth</div>
        <div className="mono" style={{fontSize:38,fontWeight:500,color:positive?C.success:C.red,letterSpacing:"-.02em"}}>{netWorth<0?"-":""}{fmt(Math.abs(netWorth))}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:6}}>{positive?"You own more than you owe ✓":"You owe more than you own — keep going"}</div>
      </div>

      {/* Assets vs debts */}
      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.success}}>{fmt(totalAssets)}</div><div className="cl">total assets</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(totalDebt)}</div><div className="cl">total debts</div></div>
      </div>

      {/* Visual bar */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:6}}>
          <span>Assets {fmt(totalAssets)}</span>
          <span>Debts {fmt(totalDebt)}</span>
        </div>
        <div style={{height:8,borderRadius:4,background:C.border,overflow:"hidden",display:"flex"}}>
          {totalAssets+totalDebt>0&&<>
            <div style={{height:"100%",background:C.success,width:`${(totalAssets/(totalAssets+totalDebt))*100}%`,transition:"width .6s ease"}}/>
            <div style={{height:"100%",background:C.red,flex:1}}/>
          </>}
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:8,textAlign:"center"}}>
          {totalAssets+totalDebt>0?`Assets are ${Math.round((totalAssets/(totalAssets+totalDebt))*100)}% of your total picture`:"Add assets and debts to see your breakdown"}
        </div>
      </div>

      {/* Assets */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p className="lbl" style={{marginBottom:0}}>Your assets</p>
        <button className="btn bp bsm" onClick={()=>setShowAdd(v=>!v)}>+ Add asset</button>
      </div>

      {showAdd&&(
        <div className="card" style={{marginBottom:10,borderColor:C.accent+"40"}}>
          <div className="fld"><div className="flb">Asset name</div><input className="inp" placeholder="e.g. Chase Savings" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
          <div className="fld"><div className="flb">Current value</div><input className="inp mono" type="number" placeholder="0.00" value={form.value} onChange={e=>setForm(v=>({...v,value:e.target.value}))}/></div>
          <div className="fld"><div className="flb">Type</div><select className="inp" value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addAsset}>Add asset</button></div>
        </div>
      )}

      {assets.length===0?(
        <div className="card" style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:32,marginBottom:8}}>🏦</div>
          <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>No assets added yet</div>
          <div style={{fontSize:12,color:C.muted}}>Add savings, investments, home value, and vehicles to see your true net worth.</div>
        </div>
      ):(
        <>
          {grouped.map(g=>(
            <div key={g.type} style={{marginBottom:10}}>
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:g.items.length>0?10:0}}>
                  <span style={{fontWeight:700,fontSize:13}}>{g.type}</span>
                  <span className="mono" style={{color:C.success,fontSize:13}}>{fmt(g.total)}</span>
                </div>
                {g.items.map((a,i)=>(
                  <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
                    <span style={{fontSize:13,color:C.muted}}>{a.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span className="mono" style={{fontSize:13}}>{fmt(a.value)}</span>
                      <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}} onClick={()=>{setAssets(x=>x.filter(v=>v.id!==a.id));pop("Removed","✕");}}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Debts summary */}
          <p className="lbl">Debts (liabilities)</p>
          <div className="card">
            {debts.length===0?<div style={{fontSize:13,color:C.muted,textAlign:"center",padding:"12px 0"}}>No debts added</div>:debts.map((d,i)=>(
              <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<debts.length-1?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:13}}>{d.name}</span>
                <span className="mono" style={{fontSize:13,color:C.red}}>-{fmt(d.balance)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:4,borderTop:`1px solid ${C.border}`}}>
              <span style={{fontWeight:700,fontSize:13}}>Total liabilities</span>
              <span className="mono" style={{fontWeight:700,color:C.red}}>-{fmt(totalDebt)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Budget Tab ────────────────────────────────────────────────────────────────
function BudgetTab({income,setIncome:setGlobalIncome,efund,setEfund,debts}) {
  const [cats,setCats]=useState([
    {id:1,name:"Housing",    budget:1200,spent:1200,color:C.blue,   icon:"🏠"},
    {id:2,name:"Food",       budget:400, spent:320, color:C.yellow, icon:"🍔"},
    {id:3,name:"Transport",  budget:300, spent:280, color:C.purple, icon:"🚗"},
    {id:4,name:"Utilities",  budget:150, spent:140, color:C.teal,   icon:"💡"},
    {id:5,name:"Subscriptions",budget:80,spent:75, color:C.red,    icon:"📱"},
    {id:6,name:"Fun",        budget:200, spent:95,  color:C.success,icon:"🎉"},
  ]);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",budget:"",icon:"💰"});
  const [editIncome,setEditIncome]=useState(false);
  const [incInput,setIncInput]=useState(income||"");
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0)+mins;
  const totalSpent=cats.reduce((s,c)=>s+c.spent,0)+mins;
  const left=(income||0)-totalSpent;
  const efGoal=(income||0)*3;

  const addCat=()=>{
    if(!form.name||!form.budget)return;
    setCats(c=>[...c,{id:Date.now(),name:form.name,budget:parseFloat(form.budget),spent:0,color:C.accent,icon:form.icon}]);
    setForm({name:"",budget:"",icon:"💰"});setShowAdd(false);
  };
  const updateSpent=(id,val)=>setCats(c=>c.map(x=>x.id===id?{...x,spent:parseFloat(val)||0}:x));
  const updateBudget=(id,val)=>setCats(c=>c.map(x=>x.id===id?{...x,budget:parseFloat(val)||0}:x));

  return (
    <div className="scroll">
      {/* Income */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:14}}>Monthly income</div>
          <button className="btn bg bsm" onClick={()=>setEditIncome(v=>!v)}>{editIncome?"Done":"Edit"}</button>
        </div>
        {editIncome?(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:C.muted,fontSize:16}}>$</span>
            <input className="inp mono" type="number" value={incInput} onChange={e=>{setIncInput(e.target.value);setGlobalIncome(parseFloat(e.target.value)||0);}} style={{flex:1}}/>
          </div>
        ):(
          <div className="mono" style={{fontSize:28,fontWeight:500,color:C.accent}}>{income?fmt(income):"$0"}</div>
        )}
      </div>

      {/* Summary chips */}
      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.text}}>{fmt(totalBudget)}</div><div className="cl">budgeted</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(totalSpent)}</div><div className="cl">spent</div></div>
        <div className="chip"><div className="cv mono" style={{color:left>=0?C.success:C.red}}>{fmt(Math.abs(left))}</div><div className="cl">{left>=0?"left over":"over budget"}</div></div>
      </div>

      {/* Emergency fund */}
      <p className="lbl">Emergency fund</p>
      <div className="card" style={{marginBottom:12,borderColor:efund>=efGoal?C.success+"44":C.yellow+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>🛡️ Emergency fund</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Goal: {fmt(efGoal)} (3 months income)</div>
          </div>
          <span className={`tag ${efund>=efGoal?"tg":efund>=efGoal*.5?"ty":"tr"}`}>{efund>=efGoal?"Funded":efund>=efGoal*.5?"Halfway":"Building"}</span>
        </div>
        <div className="pbar" style={{marginBottom:8}}><div className="pfill" style={{width:`${Math.min((efund/Math.max(efGoal,1))*100,100)}%`,background:efund>=efGoal?C.success:efund>=efGoal*.5?C.yellow:C.red}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:10}}>
          <span className="mono" style={{color:C.text}}>{fmt(efund)}</span>
          <span>{efGoal>0?Math.round((efund/efGoal)*100):0}% of goal</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:C.muted}}>Current balance $</span>
          <input className="inp mono bsm" type="number" value={efund||""} onChange={e=>setEfund(parseFloat(e.target.value)||0)} style={{width:120,padding:"6px 10px",fontSize:13}}/>
        </div>
      </div>

      {/* Debt minimums */}
      {mins>0&&<div className="card" style={{marginBottom:12,borderColor:C.red+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:600,fontSize:13}}>💳 Debt minimums</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{debts.length} accounts</div></div>
          <div className="mono" style={{color:C.red,fontSize:14,fontWeight:500}}>{fmt(mins)}</div>
        </div>
        <div className="budget-bar"><div style={{height:"100%",borderRadius:3,background:C.red,width:"100%"}}/></div>
      </div>}

      {/* Categories */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p className="lbl" style={{marginBottom:0}}>Budget categories</p>
        <button className="btn bp bsm" onClick={()=>setShowAdd(v=>!v)}>+ Add</button>
      </div>

      {showAdd&&(
        <div className="card" style={{marginBottom:10,borderColor:C.accent+"40"}}>
          <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:8,marginBottom:10}}>
            <div className="fld"><div className="flb">Icon</div><input className="inp" value={form.icon} onChange={e=>setForm(v=>({...v,icon:e.target.value}))} style={{textAlign:"center",fontSize:20}}/></div>
            <div className="fld"><div className="flb">Category name</div><input className="inp" placeholder="e.g. Gym" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
          </div>
          <div className="fld"><div className="flb">Monthly budget</div><input className="inp mono" type="number" placeholder="0.00" value={form.budget} onChange={e=>setForm(v=>({...v,budget:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addCat}>Add category</button></div>
        </div>
      )}

      {cats.map(c=>{
        const over=c.spent>c.budget;
        const barW=Math.min((c.spent/Math.max(c.budget,1))*100,100);
        return (
          <div key={c.id} className="card" style={{marginBottom:8,borderColor:over?C.red+"44":"transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>Budget: {fmt(c.budget)}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="mono" style={{fontSize:14,fontWeight:500,color:over?C.red:C.text}}>{fmt(c.spent)}</div>
                {over&&<div style={{fontSize:10,color:C.red,marginTop:2}}>+{fmt(c.spent-c.budget)} over</div>}
              </div>
            </div>
            <div className="budget-bar"><div style={{height:"100%",borderRadius:3,background:over?C.red:c.color,width:`${barW}%`,transition:"width .4s ease"}}/></div>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <div style={{flex:1}}>
                <div className="flb">Spent $</div>
                <input className="inp mono" type="number" value={c.spent} onChange={e=>updateSpent(c.id,e.target.value)} style={{padding:"6px 10px",fontSize:12}}/>
              </div>
              <div style={{flex:1}}>
                <div className="flb">Budget $</div>
                <input className="inp mono" type="number" value={c.budget} onChange={e=>updateBudget(c.id,e.target.value)} style={{padding:"6px 10px",fontSize:12}}/>
              </div>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11,alignSelf:"flex-end",paddingBottom:8}} onClick={()=>setCats(x=>x.filter(v=>v.id!==c.id))}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── More Tab (Health + Calendar + Credit + Invest + AI) ───────────────────────
function MoreTab({debts,isPlus,onUpgrade,score,setScore,assets,income,efund,setTab}) {
  const [sub,setSub]=useState("health");
  const health=HealthScore({debts,score,assets,income,efund});
  const now=new Date();
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const firstDay=new Date(now.getFullYear(),now.getMonth(),1).getDay();
  const today=now.getDate();
  const billDays=debts.filter(d=>d.due).reduce((acc,d)=>{acc[d.due]=d;return acc;},{});

  // AI
  const [msgs,setMsgs]=useState([{r:"ai",t:"Hey! I'm your Moneycode advisor. Ask me anything about your finances."}]);
  const [input,setInput]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const [aiScore,setAiScore]=useState(null);
  const [aiScoreLoad,setAiScoreLoad]=useState(false);
  const ref=useRef();
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,aiLoad]);

  const QUICK=["What should I do this month?","Am I on track?","How much interest am I wasting?","Should I invest or pay debt?"];
  const send=async(txt)=>{
    if(!txt.trim()||aiLoad)return;
    setInput("");setMsgs(m=>[...m,{r:"me",t:txt}]);setAiLoad(true);
    const sum=debts.map(d=>`${d.name}: ${fmtD(d.balance)} at ${d.rate}% APR`).join("\n");
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`Sharp financial advisor inside Moneycode. Direct, specific, real numbers. Max 130 words. End with one action.\n\nDebts:\n${sum||"None added yet"}\nTotal: ${fmt(debts.reduce((s,d)=>s+d.balance,0))}\nIncome: ${fmt(income||0)}/mo`,messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),{role:"user",content:txt}]})});const d=await res.json();setMsgs(m=>[...m,{r:"ai",t:d.content?.[0]?.text||"Something went wrong."}]);}
    catch{setMsgs(m=>[...m,{r:"ai",t:"Couldn't connect. Try again."}]);}
    setAiLoad(false);
  };

  const getAiScore=async()=>{
    setAiScoreLoad(true);
    const cards=debts.filter(d=>d.type==="credit");
    const lim=cards.reduce((s,d)=>s+d.original,0);
    const bal=cards.reduce((s,d)=>s+d.balance,0);
    const util=lim>0?(bal/lim)*100:0;
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"Concise credit advisor. Max 80 words. One action at end.",messages:[{role:"user",content:`Score: ${score}. Utilization: ${Math.round(util)}% ($${Math.round(bal)} of $${Math.round(lim)}). ${cards.length} credit cards. Fastest path to improve?`}]})});const d=await res.json();setAiScore(d.content?.[0]?.text||"");}
    catch{setAiScore("Couldn't connect.");}
    setAiScoreLoad(false);
  };

  const SUBS=[{id:"health",l:"Health"},{id:"calendar",l:"Calendar"},{id:"credit",l:"Credit"},{id:"invest",l:"Invest"},{id:"ai",l:"AI"}];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
      {/* Sub nav */}
      <div style={{display:"flex",gap:4,padding:"12px 14px 0",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
        {SUBS.map(s=><button key={s.id} onClick={()=>setSub(s.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:sub===s.id?C.accent:"transparent",color:sub===s.id?"#080C12":C.muted,fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",transition:"all .15s"}}>{s.l}</button>)}
      </div>

      {/* Health score */}
      {sub==="health"&&<div className="scroll">
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Financial Health Score</div>
          <div style={{position:"relative",width:160,height:160,margin:"0 auto 12px"}}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="62" fill="none" stroke={C.border} strokeWidth="10"/>
              <circle cx="80" cy="80" r="62" fill="none" stroke={health.color} strokeWidth="10" strokeDasharray={`${(health.overall/100)*2*Math.PI*62} ${2*Math.PI*62}`} strokeLinecap="round" transform="rotate(-90 80 80)" style={{transition:"stroke-dasharray 1s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div className="mono" style={{fontSize:36,fontWeight:500,color:health.color,lineHeight:1}}>{health.overall}</div>
              <div style={{fontSize:11,color:health.color,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>{health.label}</div>
            </div>
          </div>
        </div>
        <p className="lbl">Score breakdown</p>
        <div className="card" style={{marginBottom:12}}>
          {health.factors.map((f,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<health.factors.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{f.l}</div><div style={{fontSize:10,color:C.muted}}>{f.w}% weight</div></div>
                <span className="mono" style={{color:f.color,fontSize:14,fontWeight:500}}>{f.v}</span>
              </div>
              <div className="health-bar"><div className="health-fill" style={{width:`${f.v}%`,background:f.color}}/></div>
            </div>
          ))}
        </div>
        <p className="lbl">How to improve</p>
        <div className="card">
          {[
            {t:"Pay on time, every time",s:"Payment history is 35% of your credit score",ok:true},
            {t:"Get utilization under 10%",s:"Biggest quick-win for your credit score",ok:score>=670},
            {t:"Build 3-month emergency fund",s:"Removes financial fragility immediately",ok:efund>=(income||0)*3},
            {t:"Pay off high-rate debt first",s:"Avalanche method saves the most interest",ok:debts.filter(d=>d.rate>15).length===0},
            {t:"Start investing for retirement",s:"Even $50/mo compounds dramatically",ok:assets.some(a=>a.type==="Retirement")},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:r.ok?C.success:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0,marginTop:2}}>{r.ok?"✓":""}</div>
              <div><div style={{fontWeight:600,fontSize:13,color:r.ok?C.muted:C.text}}>{r.t}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.s}</div></div>
            </div>
          ))}
        </div>
      </div>}

      {/* Bill calendar */}
      {sub==="calendar"&&<div className="scroll">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:16}}>{now.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
          <div style={{fontSize:12,color:C.muted}}>{debts.filter(d=>d.due).length} bills this month</div>
        </div>
        <div className="cal-grid">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="cal-hdr">{d}</div>)}
          {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const day=i+1;
            const bill=billDays[day];
            const isToday=day===today;
            return (
              <div key={day} className="cal-day" style={{background:bill?C.red+"22":isToday?C.accent+"22":"transparent",border:isToday?`1px solid ${C.accent}`:bill?`1px solid ${C.red}44`:"none",color:bill?C.red:isToday?C.accent:C.text}}>
                {day}
                {bill&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:C.red}}/>}
              </div>
            );
          })}
        </div>
        <p className="lbl">Upcoming bills</p>
        {debts.filter(d=>d.due).length===0?(
          <div className="card" style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:13,color:C.muted}}>Add due dates to your debts to see them here.</div>
            <button className="btn bp bsm" style={{marginTop:12}} onClick={()=>setTab("debts")}>Go to Debts →</button>
          </div>
        ):debts.filter(d=>d.due).sort((a,b)=>a.due-b.due).map(d=>(
          <div key={d.id} className="card" style={{marginBottom:8,borderColor:d.due<=today+3?C.red+"44":"transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{d.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>Due the {d.due}{d.due===1?"st":d.due===2?"nd":d.due===3?"rd":"th"} of each month</div></div>
              <div style={{textAlign:"right"}}>
                <div className="mono" style={{fontSize:14,color:d.due<=today+3?C.red:C.text}}>{fmtD(d.min)}</div>
                {d.due<=today+3&&<div style={{fontSize:10,color:C.red,marginTop:2}}>Due soon</div>}
              </div>
            </div>
          </div>
        ))}
        <div className="card" style={{borderColor:C.blue+"30"}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:6}}>💡 Add due dates to your debts</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Edit any debt in the Debts tab to add a due date and see it appear on this calendar.</div>
        </div>
      </div>}

      {/* Credit */}
      {sub==="credit"&&<div className="scroll">
        <div style={{textAlign:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Credit Score</div>
          <ScoreRing score={score}/>
        </div>
        <div className="card" style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,fontSize:13}}>Update score</span><span className="tag tb">Self-reported</span></div>
          <input className="sli" type="range" min="300" max="850" step="5" value={score} onChange={e=>setScore(parseInt(e.target.value))}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:5}}><span>300</span><span style={{color:score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red,fontWeight:700}}>{score}</span><span>850</span></div>
        </div>
        {(() => {
          const cards=debts.filter(d=>d.type==="credit");
          const lim=cards.reduce((s,d)=>s+d.original,0);
          const bal=cards.reduce((s,d)=>s+d.balance,0);
          const util=lim>0?(bal/lim)*100:0;
          return (<>
            <p className="lbl">Utilization</p>
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div className="mono" style={{fontSize:20,fontWeight:700,color:util>30?C.red:util>10?C.yellow:C.success}}>{Math.round(util)}%</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>of {fmt(lim)} limit used</div></div>
                <span className={`tag ${util>30?"tr":util>10?"ty":"tg"}`}>{util>30?"High":util>10?"OK":"Great"}</span>
              </div>
              <div className="pbar"><div className="pfill" style={{width:`${Math.min(util,100)}%`,background:util>30?C.red:util>10?C.yellow:C.success}}/></div>
              {util>10&&<div style={{marginTop:10,padding:"8px 10px",background:C.accent+"10",borderRadius:8,border:`1px solid ${C.accent}30`,fontSize:12,color:C.accent,fontWeight:600}}>💡 Pay down {fmtD(Math.max(0,bal-lim*.1))} to get under 10% — est. +20–40 pts</div>}
            </div>
            <p className="lbl">Score impact of your plan</p>
            <div className="card" style={{marginBottom:12}}>
              {[{a:"Pay off smallest card",i:"+15–25 pts",w:"~3 months"},{a:"Get utilization under 10%",i:"+20–40 pts",w:"Next cycle"},{a:"6 months on-time payments",i:"+10–20 pts",w:"6 months"},{a:"No new hard inquiries",i:"+5–10 pts",w:"12 months"}].map((r,i)=>(
                <div className="irow" key={i}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{r.a}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.w}</div></div><span className="tag tg">{r.i}</span></div>
              ))}
            </div>
          </>);
        })()}
        {isPlus?(
          aiScore?(
            <div className="card" style={{borderColor:C.accent+"30",marginBottom:12}}>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>✦ AI Analysis</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{aiScore}</div>
              <button className="btn bg bsm" style={{marginTop:10}} onClick={()=>setAiScore(null)}>Refresh</button>
            </div>
          ):(
            <button className="btn bp bfull" style={{marginBottom:12}} onClick={getAiScore} disabled={aiScoreLoad}>{aiScoreLoad?"Analyzing…":"✦ Analyze my score"}</button>
          )
        ):(
          <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>✦ AI Credit Analysis — Plus only</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Personalized score explanation and top moves to improve it fast.</div>
            <button className="btn bplus bfull" onClick={onUpgrade}>Unlock — $6.99/mo</button>
          </div>
        )}
      </div>}

      {/* Invest */}
      {sub==="invest"&&<div className="scroll">
        {(() => {
          const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
          const highRate=debts.length>0?Math.max(...debts.map(d=>d.rate)):0;
          const hasHighRate=debts.some(d=>d.rate>15);
          const readyToInvest=highRate<8||totalDebt===0;
          const [invAccts,setInvAccts]=useState([]);
          const [showAddInv,setShowAddInv]=useState(false);
          const [invForm,setInvForm]=useState({name:"",balance:"",type:"Retirement"});
          const [checkedSteps,setCheckedSteps]=useState({});
          const STEP_DEFS=[{n:1,t:"Emergency fund",s:"1–3 months expenses in HYSA"},{n:2,t:"401(k) match",s:"Get the full employer match — free money"},{n:3,t:"High-rate debt",s:"Pay off debts above 7% APR"},{n:4,t:"Roth IRA",s:"Max $7,000/yr tax-free growth"},{n:5,t:"Max 401(k)",s:"$23,000/yr pre-tax limit"},{n:6,t:"Taxable brokerage",s:"Index funds after maxing tax-advantaged"}];
          const firstUnchecked=STEP_DEFS.findIndex(s=>!checkedSteps[s.n]);
          const totalInvested=invAccts.reduce((s,a)=>s+a.balance,0);
          const addInv=()=>{if(!invForm.name||!invForm.balance)return;setInvAccts(a=>[...a,{id:Date.now(),name:invForm.name,balance:parseFloat(invForm.balance),type:invForm.type}]);setInvForm({name:"",balance:"",type:"Retirement"});setShowAddInv(false);};
          return (<>
            <div className="card" style={{borderColor:readyToInvest?C.success+"44":C.yellow+"44",background:readyToInvest?"linear-gradient(135deg,#141B27,#0F1A14)":"linear-gradient(135deg,#141B27,#1A1800)",marginBottom:12}}>
              <div style={{fontSize:20,marginBottom:8}}>{readyToInvest?"📈":"⚖️"}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{readyToInvest?"You're ready to invest":"Debt vs. investing — the math"}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:10}}>{totalDebt===0?"You have no debt — invest aggressively.":hasHighRate?`High-rate debt costs you more than investing earns. Focus there first.`:`Your highest rate is ${highRate}%. S&P 500 averages ~10%/yr — it makes sense to do both.`}</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1,background:C.surface,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Highest APR</div><div className="mono" style={{fontSize:16,color:highRate>10?C.red:highRate>7?C.yellow:C.success}}>{highRate}%</div></div>
                <div style={{flex:1,background:C.surface,borderRadius:8,padding:"9px 11px",border:`1px solid ${C.border}`}}><div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>S&P 500 avg</div><div className="mono" style={{fontSize:16,color:C.success}}>~10%</div></div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <p className="lbl" style={{marginBottom:0}}>Order of operations</p>
              <span style={{fontSize:11,color:C.muted}}>{Object.values(checkedSteps).filter(Boolean).length}/{STEP_DEFS.length}</span>
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Tap to mark complete — work in order.</div>
            <div className="card" style={{marginBottom:12}}>
              {STEP_DEFS.map((s,i)=>{const done=!!checkedSteps[s.n],isCur=i===firstUnchecked;return(
                <div key={i} onClick={()=>setCheckedSteps(x=>({...x,[s.n]:!x[s.n]}))} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"11px 0",borderBottom:i<STEP_DEFS.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:done?C.success:isCur?C.accent:C.border,color:done||isCur?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:1}}>{done?"✓":s.n}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:done?C.muted:C.text,textDecoration:done?"line-through":"none"}}>{s.t}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.s}</div></div>
                  <span className={`tag ${done?"tg":isCur?"tb":"tp"}`} style={{marginTop:2,flexShrink:0}}>{done?"Done":isCur?"Next":"Later"}</span>
                </div>
              );})}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <p className="lbl" style={{marginBottom:0}}>Investment accounts</p>
              <button className="btn bp bsm" onClick={()=>setShowAddInv(v=>!v)}>+ Add</button>
            </div>
            {showAddInv&&<div className="card" style={{marginBottom:10,borderColor:C.accent+"40"}}>
              <div className="fld"><div className="flb">Account name</div><input className="inp" placeholder="e.g. Roth IRA — Vanguard" value={invForm.name} onChange={e=>setInvForm(v=>({...v,name:e.target.value}))}/></div>
              <div className="fld"><div className="flb">Balance</div><input className="inp mono" type="number" placeholder="0.00" value={invForm.balance} onChange={e=>setInvForm(v=>({...v,balance:e.target.value}))}/></div>
              <div className="fld"><div className="flb">Type</div><select className="inp" value={invForm.type} onChange={e=>setInvForm(v=>({...v,type:e.target.value}))}>{["Retirement","Brokerage","Savings"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>setShowAddInv(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addInv}>Add</button></div>
            </div>}
            <div className="card" style={{marginBottom:12}}>
              {invAccts.length===0?<div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:13}}>No accounts added yet</div>:invAccts.map((a,i)=>(
                <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:i<invAccts.length-1?`1px solid ${C.border}`:"none"}}>
                  <div><div style={{fontWeight:600,fontSize:13}}>{a.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{a.type}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span className="mono" style={{fontSize:14,color:C.success}}>{fmt(a.balance)}</span><button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}} onClick={()=>setInvAccts(x=>x.filter(v=>v.id!==a.id))}>✕</button></div>
                </div>
              ))}
              {invAccts.length>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:10,marginTop:4,borderTop:`1px solid ${C.border}`}}><span style={{fontWeight:700,fontSize:13}}>Total</span><span className="mono" style={{fontWeight:700,color:C.success}}>{fmt(totalInvested)}</span></div>}
            </div>
          </>);
        })()}
      </div>}

      {/* AI */}
      {sub==="ai"&&(isPlus?(
        <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
            <div style={{marginBottom:12}}><div style={{fontSize:15,fontWeight:700}}>AI Advisor</div><div style={{fontSize:11,color:C.muted}}>Knows your {debts.length} debts</div></div>
            <div style={{display:"flex",flexDirection:"column"}}>
              {msgs.map((m,i)=><div key={i} className={`msg ${m.r==="ai"?"mai":"mme"}`} style={{alignSelf:m.r==="ai"?"flex-start":"flex-end"}}>{m.t}</div>)}
              {aiLoad&&<div className="msg mai" style={{alignSelf:"flex-start"}}><div style={{display:"flex",gap:4,alignItems:"center"}}><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
            </div>
            {!aiLoad&&msgs.length<3&&<div style={{marginTop:10}}><div className="lbl" style={{marginBottom:8}}>Try asking</div>{QUICK.map(q=><button key={q} className="btn bg bsm" style={{display:"block",textAlign:"left",width:"100%",marginBottom:6}} onClick={()=>send(q)}>"{q}"</button>)}</div>}
            <div ref={ref}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:8,flexShrink:0}}>
            <input className="inp" placeholder="Ask anything…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} style={{flex:1}}/>
            <button className="btn bp bico" onClick={()=>send(input)} disabled={!input.trim()||aiLoad}><I.Send/></button>
          </div>
        </div>
      ):(
        <div className="scroll">
          <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,marginBottom:6}}>AI Advisor</div><div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Real answers about your real numbers.</div></div>
          <div className="card" style={{marginBottom:12}}><div style={{fontSize:26,marginBottom:8}}>💬</div><div style={{fontWeight:700,fontSize:14,marginBottom:10}}>What you can ask</div>{QUICK.map(q=><div key={q} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 11px",fontSize:13,color:C.muted,fontStyle:"italic",marginBottom:6}}>"{q}"</div>)}</div>
          <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>✦ AI Advisor — Plus only</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:12}}>14-day free trial. No credit card required.</div>
            <button className="btn bplus bfull" onClick={onUpgrade}>Unlock — $6.99/mo</button>
            <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.muted}}>or $59/yr · Cancel any time</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function AddDebtModal({onClose,onAdd}) {
  const [f,setF]=useState({name:"",balance:"",original:"",rate:"",min:"",type:"credit",due:""});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:17,marginBottom:14}}>Add a debt</div>
        <div className="fld"><div className="flb">Account name</div><input className="inp" placeholder="e.g. Navient Loan" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
        <div className="fld"><div className="flb">Type</div><select className="inp" value={f.type} onChange={e=>s("type",e.target.value)}>{["student","auto","credit","personal","medical"].map(t=><option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>)}</select></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["balance","Current balance"],["original","Original balance"],["rate","APR %"],["min","Min payment"]].map(([k,l])=><div className="fld" key={k}><div className="flb">{l}</div><input className="inp mono" type="number" placeholder="0.00" value={f[k]} onChange={e=>s(k,e.target.value)}/></div>)}
        </div>
        <div className="fld"><div className="flb">Due date (day of month, e.g. 15)</div><input className="inp mono" type="number" placeholder="e.g. 15" min="1" max="28" value={f.due} onChange={e=>s("due",e.target.value)}/></div>
        <button className="btn bp bfull" onClick={()=>{if(!f.name||!f.balance)return;onAdd({id:Date.now(),name:f.name,balance:parseFloat(f.balance),original:parseFloat(f.original||f.balance),rate:parseFloat(f.rate||0),min:parseFloat(f.min||0),type:f.type,due:f.due?parseInt(f.due):null,color:{student:C.blue,auto:C.yellow,credit:C.red,personal:C.blue,medical:C.purple}[f.type]||C.blue});onClose();}}>Add debt</button>
      </div>
    </div>
  );
}

function SyncModal({debts,onClose,onSync}) {
  const [step,setStep]=useState("edit");
  const [vals,setVals]=useState(debts.map(d=>({...d,next:parseFloat(Math.max(0,d.balance-d.min).toFixed(2))})));
  const go=()=>{setStep("syncing");setTimeout(()=>setStep("done"),1600);}
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:17,marginBottom:14}}>Monthly sync</div>
        {step==="edit"&&<>{vals.map((u,i)=><div className="fld" key={u.id}><div className="flb">{u.name} — was {fmtD(u.balance)}</div><input className="inp mono" type="number" value={u.next} onChange={e=>setVals(v=>v.map((x,j)=>j===i?{...x,next:parseFloat(e.target.value)||0}:x))}/></div>)}<button className="btn bp bfull" onClick={go}>Sync balances</button></>}
        {step==="syncing"&&<div style={{textAlign:"center",padding:"36px 0"}}><div style={{fontSize:36,display:"inline-block",animation:"spin .8s linear infinite"}}>⟳</div><div style={{fontWeight:600,marginTop:14}}>Recalculating…</div></div>}
        {step==="done"&&<>{vals.map(u=>{const d=u.next-u.balance;return(<div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><div><div style={{fontWeight:600,fontSize:13}}>{u.name}</div><div className="mono" style={{fontSize:11,color:C.muted}}>{fmtD(u.balance)} → {fmtD(u.next)}</div></div><span className={`tag ${d<0?"tg":"tr"}`}>{d<0?"−":"+"}{fmtD(Math.abs(d))}</span></div>);})} <button className="btn bp bfull" style={{marginTop:14}} onClick={()=>{onSync(vals);onClose();}}>Save & update plan</button></>}
      </div>
    </div>
  );
}

function CSVModal({onClose,onImport}) {
  const [step,setStep]=useState("drop");
  const [prev,setPrev]=useState(null);
  const [map,setMap]=useState({});
  const [drag,setDrag]=useState(false);
  const ref=useRef();
  const parse=t=>{const l=t.trim().split("\n"),h=l[0].split(",").map(x=>x.trim().replace(/"/g,""));return{headers:h,rows:l.slice(1).map(r=>r.split(",").map(c=>c.trim().replace(/"/g,"")))}};
  const load=f=>{const r=new FileReader();r.onload=e=>{const{headers,rows}=parse(e.target.result),m={};headers.forEach((h,i)=>{const l=h.toLowerCase();if(l.includes("name")||l.includes("account"))m.name=i;if(l.includes("balance")||l.includes("amount"))m.balance=i;if(l.includes("rate")||l.includes("apr"))m.rate=i;if(l.includes("min")||l.includes("payment"))m.min=i;});setPrev({headers,rows:rows.slice(0,4),all:rows});setMap(m);setStep("map");};r.readAsText(f);}
  const demo=()=>{const{headers,rows}=parse("Name,Balance,Rate,MinPayment\nStudent Loan,18500,5.05,220\nVisa Card,1240,22.99,25\nCar Loan,6800,7.4,310");setPrev({headers,rows,all:rows});setMap({name:0,balance:1,rate:2,min:3});setStep("map");}
  const confirm=()=>{onImport(prev.all.filter(r=>r.length>1).map((r,i)=>({id:Date.now()+i,name:r[map.name]||"Imported",balance:parseFloat(r[map.balance]?.replace(/[$,]/g,"")||0),original:parseFloat(r[map.balance]?.replace(/[$,]/g,"")||0),rate:parseFloat(r[map.rate]||0),min:parseFloat(r[map.min]?.replace(/[$,]/g,"")||0),type:"imported",color:C.blue})).filter(x=>x.balance>0));onClose();}
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:17,marginBottom:14}}>Import CSV</div>
        {step==="drop"&&<><div className={`dz${drag?" ov":""}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);load(e.dataTransfer.files[0]);}} onClick={()=>ref.current.click()}><div style={{fontSize:30,marginBottom:8}}>📂</div><div style={{fontWeight:600,marginBottom:4}}>Drop CSV here</div><div style={{fontSize:12,color:C.muted}}>Chase, BoA, Mint, YNAB</div></div><input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={e=>load(e.target.files[0])}/><button className="btn bg bsm" style={{marginTop:4}} onClick={demo}>Use sample data</button></>}
        {step==="map"&&prev&&<><p className="lbl">{prev.all.length} rows — map columns</p>{["name","balance","rate","min"].map(f=><div className="fld" key={f}><div className="flb">{f==="name"?"Account":f==="balance"?"Balance":f==="rate"?"APR %":"Min pmt"}</div><select className="inp" value={map[f]??""} onChange={e=>setMap(m=>({...m,[f]:parseInt(e.target.value)}))}>  <option value="">— skip —</option>{prev.headers.map((h,i)=><option key={i} value={i}>{h}</option>)}</select></div>)}<div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>setStep("drop")}>Back</button><button className="btn bp" style={{flex:1}} onClick={()=>setStep("confirm")}>Continue →</button></div></>}
        {step==="confirm"&&<><div className="card" style={{borderColor:C.success+"44",background:C.success+"0A",marginBottom:14}}><div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:24}}>✓</span><div><div style={{fontWeight:700}}>{prev.all.length} accounts ready</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Will merge with your debts</div></div></div></div><div style={{display:"flex",gap:8}}><button className="btn bg bsm" onClick={()=>setStep("map")}>Back</button><button className="btn bp" style={{flex:1}} onClick={confirm}>Import</button></div></>}
      </div>
    </div>
  );
}

function PaywallModal({onClose,onUpgrade}) {
  const FEATS=[["💬","AI Advisor","Ask anything, get a plan with your real numbers"],["📅","Freedom Date","Your exact debt-free date, live"],["📈","Credit monitoring","Score tracking + AI analysis"],["📊","Debt-to-income","Know exactly where you stand"],["🎉","Milestones","Celebrate wins and share progress"],["🔔","Smart notifications","Score changes + AI weekly insights"]];
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:32,marginBottom:8}}>✦</div><div style={{fontSize:19,fontWeight:800,marginBottom:6}}>Moneycode Plus</div><div style={{fontSize:13,color:C.muted}}>Everything you need to get out of debt faster.</div></div>
        {FEATS.map(([e,t,s])=><div key={t} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}><span style={{fontSize:19,width:26,flexShrink:0,marginTop:1}}>{e}</span><div><div style={{fontWeight:600,fontSize:13}}>{t}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{s}</div></div></div>)}
        <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:8}}>
          <button className="btn bplus bfull" style={{fontSize:15,padding:13}} onClick={onUpgrade}>Start 14-day free trial</button>
          <div style={{textAlign:"center",fontSize:12,color:C.muted}}>Then $6.99/mo — or $59/yr (save 30%) · Cancel any time</div>
        </div>
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [boarded,setBoarded]=useState(false);
  const [name,setName]=useState("");
  const [tab,setTab]=useState("home");
  const [modal,setModal]=useState(null);
  const [debts,setDebts]=useState([]);
  const [assets,setAssets]=useState([]);
  const [isPlus,setIsPlus]=useState(false);
  const [score,setScore]=useState(672);
  const [income,setIncome]=useState(0);
  const [efund,setEfund]=useState(0);
  const [toast,setToast]=useState(null);
  const [celebrate,setCel]=useState(null);
  const [showPW,setShowPW]=useState(false);

  const pop=(msg,icon="✓")=>{setToast({msg,icon});setTimeout(()=>setToast(null),2400);};
  const upgrade=()=>{setIsPlus(true);setShowPW(false);pop("Welcome to Plus ✦","✦");};
  const onCelebrate=m=>{setCel(m);setTimeout(()=>setCel(null),3500);};

  if(!boarded) return (<><style>{CSS}</style><Onboarding onDone={n=>{setName(n);setBoarded(true);}}/></>);

  const TABS=[
    {id:"home",  l:"Home",   Icon:I.Home},
    {id:"debts", l:"Debts",  Icon:I.Debt},
    {id:"plan",  l:"Plan",   Icon:I.Plan},
    {id:"worth", l:"Worth",  Icon:I.Worth},
    {id:"budget",l:"Budget", Icon:I.Budget},
    {id:"more",  l:"More",   Icon:I.More},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {tab!=="more"&&(
          <div className="hdr">
            <div className="logo">money<span style={{color:C.accent}}>code</span></div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              {isPlus?<span className="tag tpl">✦ Plus</span>:<button className="btn bplus bsm" onClick={()=>setShowPW(true)}>✦ Plus</button>}
              <button className="btn bg bico bsm" onClick={()=>setModal("sync")}><I.Sync/></button>
            </div>
          </div>
        )}

        {tab==="home"  &&<HomeTab   debts={debts} isPlus={isPlus} onSync={()=>setModal("sync")} onUpgrade={()=>setShowPW(true)} onCelebrate={onCelebrate} name={name} onAddDebt={()=>{setTab("debts");setModal("add");}} score={score} assets={assets} income={income} efund={efund}/>}
        {tab==="debts" &&<DebtsTab  debts={debts} setDebts={setDebts} openModal={setModal} pop={pop}/>}
        {tab==="plan"  &&<PlanTab   debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)}/>}
        {tab==="worth" &&<WorthTab  debts={debts} assets={assets} setAssets={setAssets} pop={pop}/>}
        {tab==="budget"&&<BudgetTab income={income} setIncome={setIncome} efund={efund} setEfund={setEfund} debts={debts}/>}
        {tab==="more"  &&<MoreTab   debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)} score={score} setScore={setScore} assets={assets} income={income} efund={efund} setTab={setTab}/>}

        <nav className="tabbar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <t.Icon/>{t.l}
              {t.id==="more"&&!isPlus&&<div style={{position:"absolute",top:7,right:"calc(50% - 14px)",width:5,height:5,borderRadius:"50%",background:C.yellow}}/>}
            </button>
          ))}
        </nav>

        {modal==="add"   &&<AddDebtModal onClose={()=>setModal(null)} onAdd={d=>{setDebts(x=>[...x,d]);pop("Debt added");}}/>}
        {modal==="sync"  &&<SyncModal    debts={debts} onClose={()=>setModal(null)} onSync={u=>{setDebts(d=>d.map(x=>{const f=u.find(v=>v.id===x.id);return f?{...x,balance:Math.max(0,f.next)}:x;}));pop("Balances updated");}}/>}
        {modal==="import"&&<CSVModal     onClose={()=>setModal(null)} onImport={d=>{setDebts(x=>[...x,...d]);pop(`${d.length} debts imported`);}}/>}
        {showPW          &&<PaywallModal onClose={()=>setShowPW(false)} onUpgrade={upgrade}/>}

        {toast&&<div className="toast" style={{animation:"tin .2s ease"}}><span style={{color:C.accent}}>{toast.icon}</span>{toast.msg}</div>}
        {celebrate&&<><Confetti/><div className="cel" onClick={()=>setCel(null)}><div style={{fontSize:68,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>{celebrate.e}</div><div style={{fontSize:22,fontWeight:800,textAlign:"center"}}>{celebrate.t}</div><div style={{fontSize:14,color:C.muted,textAlign:"center",lineHeight:1.5}}>{celebrate.s}<br/><span style={{color:C.accent}}>Keep going — you're doing it.</span></div><button className="btn bp" style={{marginTop:8}}>Share this win</button></div></>}
      </div>
    </>
  );
}
