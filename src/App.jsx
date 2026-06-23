import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#080C12", surface:"#0F1520", card:"#141B27", border:"#1E2D42",
  accent:"#B5FF4D", red:"#FF5A5A", yellow:"#FFD166", blue:"#58A6FF",
  purple:"#A78BFA", text:"#E6EDF3", muted:"#5B7087", success:"#3FB950",
};

const fmt  = n => "$" + Math.abs(n).toLocaleString("en-US",{maximumFractionDigits:0});
const fmtD = n => "$" + Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const toDate = m => { const d=new Date(); d.setMonth(d.getMonth()+Math.round(m)); return d.toLocaleDateString("en-US",{month:"long",year:"numeric"}); };

const DEBTS = [
  {id:1,name:"Federal Student Loan",balance:24800,original:32000,rate:5.05,min:280,type:"student",color:C.blue},
  {id:2,name:"Car Payment",         balance:8400, original:14000,rate:7.9, min:320,type:"auto",   color:C.yellow},
  {id:3,name:"Chase Sapphire",      balance:2340, original:5000, rate:24.99,min:47, type:"credit", color:C.red},
  {id:4,name:"Discover It",         balance:680,  original:2000, rate:19.99,min:25, type:"credit", color:C.red},
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#080C12;color:#E6EDF3;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.scroll{flex:1;overflow-y:auto;padding:16px 16px 100px;}
.scroll::-webkit-scrollbar{display:none;}
.mono{font-family:'DM Mono',monospace;}
.tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#0F1520;border-top:1px solid #1E2D42;display:flex;z-index:100;}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 0 8px;gap:3px;cursor:pointer;border:none;background:none;color:#5B7087;font-size:9px;font-family:Inter,sans-serif;font-weight:600;letter-spacing:.06em;text-transform:uppercase;transition:color .15s;position:relative;}
.tab.on{color:#B5FF4D;}
.tab svg{width:18px;height:18px;}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:16px 16px 0;}
.logo{font-weight:800;font-size:18px;letter-spacing:-.03em;}
.card{background:#141B27;border:1px solid #1E2D42;border-radius:14px;padding:16px;margin-bottom:12px;}
.lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5B7087;margin-bottom:10px;}
.chips{display:flex;gap:8px;margin-bottom:16px;}
.chip{background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:12px;flex:1;}
.cv{font-family:'DM Mono',monospace;font-size:16px;font-weight:500;line-height:1;}
.cl{font-size:10px;color:#5B7087;margin-top:4px;font-weight:500;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:10px;border:none;font-family:Inter,sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.bp{background:#B5FF4D;color:#080C12;}
.bplus{background:linear-gradient(135deg,#FFD166,#FFA620);color:#080C12;}
.bg{background:transparent;color:#E6EDF3;border:1px solid #1E2D42;}
.bsm{padding:7px 12px;font-size:12px;border-radius:8px;}
.bfull{width:100%;}
.bico{padding:9px;border-radius:9px;}
.tag{display:inline-block;padding:3px 8px;border-radius:5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
.tr{background:#FF5A5A20;color:#FF5A5A;}
.tg{background:#3FB95020;color:#3FB950;}
.tb{background:#58A6FF20;color:#58A6FF;}
.ty{background:#FFD16620;color:#FFD166;}
.tp{background:#A78BFA20;color:#A78BFA;}
.tpl{background:#FFD16625;color:#FFD166;border:1px solid #FFD16630;}
.inp{background:#0F1520;border:1px solid #1E2D42;border-radius:9px;padding:11px 13px;color:#E6EDF3;font-family:Inter,sans-serif;font-size:14px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#B5FF4D80;}
.fld{margin-bottom:13px;}
.flb{font-size:11px;color:#5B7087;margin-bottom:5px;font-weight:600;}
.mover{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.mo{background:#0F1520;border:1px solid #1E2D42;border-radius:22px 22px 0 0;width:100%;max-width:430px;padding:20px 20px 44px;max-height:88vh;overflow-y:auto;}
.mo::-webkit-scrollbar{display:none;}
.hdl{width:34px;height:4px;background:#1E2D42;border-radius:2px;margin:0 auto 18px;}
.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;display:flex;align-items:center;gap:8px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
.pbar{height:4px;background:#1E2D42;border-radius:2px;overflow:hidden;}
.pfill{height:100%;border-radius:2px;transition:width .6s ease;}
.irow{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #1E2D42;}
.irow:last-child{border-bottom:none;}
.nrow{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #1E2D42;}
.nrow:last-child{border-bottom:none;}
.trow{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #1E2D42;}
.trow:last-child{border-bottom:none;}
.sli{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#1E2D42;outline:none;}
.sli::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#B5FF4D;cursor:pointer;}
.stog{display:flex;background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:3px;margin-bottom:16px;}
.sbtn{flex:1;padding:8px;border:none;border-radius:8px;font-family:Inter,sans-serif;font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:#5B7087;}
.sbtn.on{background:#B5FF4D;color:#080C12;}
.fhero{background:linear-gradient(135deg,rgba(181,255,77,.13),transparent);border:1px solid rgba(181,255,77,.3);border-radius:16px;padding:20px;text-align:center;margin-bottom:16px;}
.fdate{font-family:'DM Mono',monospace;font-size:24px;font-weight:500;color:#B5FF4D;margin:8px 0 4px;}
.cel{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);flex-direction:column;gap:14px;padding:32px;}
@keyframes pop{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes fall{from{transform:translateY(-20px) rotate(0deg);opacity:1;}to{transform:translateY(100vh) rotate(720deg);opacity:0;}}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.ob{min-height:100vh;display:flex;flex-direction:column;padding:44px 24px 40px;}
.opip{height:3px;flex:1;border-radius:2px;background:#1E2D42;transition:background .3s;}
.opip.on{background:#B5FF4D;}
.oopt{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #1E2D42;border-radius:12px;margin-bottom:10px;cursor:pointer;background:#141B27;transition:all .15s;}
.oopt.on{border-color:#B5FF4D;background:rgba(181,255,77,.07);}
.ring{position:relative;width:160px;height:160px;margin:0 auto 16px;}
.rinv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.fbar{flex:1;height:4px;background:#1E2D42;border-radius:2px;overflow:hidden;}
.ttrk{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0;}
.ttmb{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;}
.dz{border:2px dashed #1E2D42;border-radius:12px;padding:28px 20px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px;}
.dz.ov{border-color:#B5FF4D;background:rgba(181,255,77,.05);}
.msg{max-width:88%;padding:11px 14px;border-radius:14px;font-size:13px;line-height:1.55;margin-bottom:9px;}
.mai{background:#141B27;border:1px solid #1E2D42;border-radius:4px 14px 14px 14px;}
.mme{background:#B5FF4D;color:#080C12;font-weight:500;margin-left:auto;border-radius:14px 4px 14px 14px;}
.dot{width:6px;height:6px;border-radius:50%;background:#5B7087;animation:pulse 1.2s ease-in-out infinite;}
.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
.codebox{background:#0A0E16;border:1px solid #1E2D42;border-radius:10px;padding:14px;margin-bottom:12px;overflow-x:auto;}
.codebox pre{font-family:'DM Mono',monospace;font-size:10.5px;line-height:1.65;color:#A9C4D4;white-space:pre;}
`;

// ── Tiny icon set ─────────────────────────────────────────────────────────────
const I = {
  Home:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Debt:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Plan:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Credit: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  AI:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  Send:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Sync:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Bell:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Lock:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Check:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Up:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Invest: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
};

// ── Shared widgets ────────────────────────────────────────────────────────────
function Toggle({on, set}) {
  return (
    <button className="ttrk" style={{background:on?C.accent:C.border}} onClick={()=>set(!on)}>
      <div className="ttmb" style={{left:on?23:3}}/>
    </button>
  );
}

function Confetti() {
  const dots = Array.from({length:32},(_,i)=>({
    id:i, x:Math.random()*100, delay:Math.random()*1.2, dur:1.4+Math.random(),
    color:[C.accent,C.yellow,C.blue,C.purple,C.red][i%5], size:5+Math.random()*7,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:499}}>
      {dots.map(d=>(
        <div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:0,width:d.size,height:d.size,borderRadius:2,background:d.color,animation:`fall ${d.dur}s ${d.delay}s linear forwards`}}/>
      ))}
    </div>
  );
}

function Gauge({pct}) {
  const r=68, cx=84, cy=76;
  const toR = d => d*Math.PI/180;
  const a = Math.min(pct,1)*180;
  const ax = cx+r*Math.cos(toR(180-a)), ay = cy-r*Math.sin(toR(180-a));
  const color = pct>0.7?C.red:pct>0.4?C.yellow:C.success;
  const arc = (f,t,c) => {
    const x1=cx+r*Math.cos(toR(180-f)), y1=cy-r*Math.sin(toR(180-f));
    const x2=cx+r*Math.cos(toR(180-t)), y2=cy-r*Math.sin(toR(180-t));
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="8" strokeLinecap="butt"/>;
  };
  return (
    <div style={{position:"relative",width:168,height:88,margin:"0 auto 6px"}}>
      <svg width="168" height="88" viewBox="0 0 168 88">
        {arc(0,60,C.success+"40")}{arc(60,120,C.yellow+"40")}{arc(120,180,C.red+"40")}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${ax} ${ay}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
        <circle cx={cx} cy={cy} r="4.5" fill={C.text}/>
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center"}}>
        <div className="mono" style={{fontSize:22,fontWeight:500,color}}>{Math.round((1-pct)*100)}%</div>
        <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>paid off</div>
      </div>
    </div>
  );
}

function ScoreRing({score}) {
  const r=62, cx=80, cy=80, circ=2*Math.PI*r, pct=(score-300)/550, dash=circ*pct;
  const color = score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red;
  const band  = score>=740?"Excellent":score>=670?"Good":score>=580?"Fair":"Poor";
  return (
    <div className="ring">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="10"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div className="rinv">
        <div className="mono" style={{fontSize:34,fontWeight:500,color,lineHeight:1}}>{score}</div>
        <div style={{fontSize:11,color,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>{band}</div>
      </div>
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

  const next = () => step < 3 ? setStep(s=>s+1) : onDone(name);

  const GOALS=[{id:"payoff",e:"🎯",l:"Get out of debt",s:"Payoff strategies + savings"},{id:"invest",e:"💹",l:"Start investing",s:"Build wealth while managing debt"},{id:"score",e:"📈",l:"Build my credit",s:"Score tracking + utilization"},{id:"both",e:"⚡",l:"All of the above",s:"Debt payoff + credit + investing"}];
  const ITYPES=[{id:"regular",e:"🗓️",l:"Regular salary",s:"Same amount each paycheck"},{id:"variable",e:"📊",l:"Variable income",s:"Freelance, gig, hourly"},{id:"multiple",e:"💼",l:"Multiple streams",s:"Side hustles + investments"}];

  return (
    <div className="ob" style={{background:C.bg}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
        <div className="logo">money<span style={{color:C.accent}}>code</span></div>
        {step>0&&<button className="btn bg bsm" onClick={()=>setStep(s=>s-1)}>← Back</button>}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:32}}>
        {[0,1,2,3].map(i=><div key={i} className={`opip${i<=step?" on":""}`}/>)}
      </div>

      {step===0&&<>
        <div style={{fontSize:44,marginBottom:16}}>👋</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>What's your name?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.6}}>We'll personalize your plan and keep things real.</div>
        <div className="fld">
          <input className="inp" placeholder="First name" value={name} onChange={e=>setName(e.target.value)} style={{fontSize:18,padding:"14px 16px"}}/>
        </div>
        <button className="btn bp bfull" style={{padding:15,fontSize:15,marginTop:8}} disabled={!name.trim()} onClick={next}>Let's go →</button>
      </>}

      {step===1&&<>
        <div style={{fontSize:44,marginBottom:16}}>🎯</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>What's your main goal{name?`, ${name}`:""}?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:28}}>We'll build your experience around this.</div>
        {GOALS.map(g=>(
          <div key={g.id} className={`oopt${goal===g.id?" on":""}`} onClick={()=>setGoal(g.id)}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{g.e}</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{g.l}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{g.s}</div></div>
            {goal===g.id&&<I.Check/>}
          </div>
        ))}
        <button className="btn bp bfull" style={{padding:14,marginTop:12}} onClick={next}>Continue →</button>
      </>}

      {step===2&&<>
        <div style={{fontSize:44,marginBottom:16}}>💰</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>How do you get paid?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:28}}>Shapes your payoff plan and emergency fund advice.</div>
        {ITYPES.map(t=>(
          <div key={t.id} className={`oopt${incType===t.id?" on":""}`} onClick={()=>setIncType(t.id)}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{t.e}</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{t.l}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{t.s}</div></div>
            {incType===t.id&&<I.Check/>}
          </div>
        ))}
        <button className="btn bp bfull" style={{padding:14,marginTop:12}} onClick={next}>Continue →</button>
      </>}

      {step===3&&<>
        <div style={{fontSize:44,marginBottom:16}}>📊</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>Monthly take-home?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:28}}>After taxes — used for your debt-to-income ratio.</div>
        <div className="fld" style={{position:"relative"}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:16}}>$</span>
          <input className="inp mono" type="number" placeholder="3200" value={income} onChange={e=>setIncome(e.target.value)} style={{paddingLeft:28,fontSize:20,padding:"14px 14px 14px 28px"}}/>
        </div>
        <button className="btn bp bfull" style={{padding:14}} disabled={!income} onClick={next}>Set up my plan →</button>
        <button className="btn bg bfull bsm" style={{marginTop:8}} onClick={next}>Skip for now</button>
      </>}
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function HomeTab({debts,isPlus,onSync,onUpgrade,onCelebrate,name}) {
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const orig =debts.reduce((s,d)=>s+d.original,0);
  const mins =debts.reduce((s,d)=>s+d.min,0);
  const intMo=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12),0);
  const pct  =total/orig;
  const mo   =Math.ceil(total/(mins*1.3));
  const hr   =new Date().getHours();
  const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";

  const MS=[
    {e:"🎉",t:"First $1,000 paid",s:"You started.",ok:(orig-total)>=1000},
    {e:"🔥",t:"25% cleared",s:fmt(orig*.25)+" milestone",ok:pct<=.75},
    {e:"⚡",t:"Halfway there",s:fmt(orig*.5)+" down",ok:pct<=.5},
    {e:"🏁",t:"Final stretch",s:"Under 25% left",ok:pct<=.25},
  ];
  const done = MS.filter(m=>m.ok);

  return (
    <div className="scroll">
      <div style={{marginBottom:18}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{greet}{name?`, ${name}`:""} 👋</div>
        <div className="mono" style={{fontSize:36,fontWeight:500,letterSpacing:"-.02em",lineHeight:1}}>{fmt(total)}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:6}}>{fmt(orig-total)} paid · {Math.round((1-pct)*100)}% done</div>
      </div>

      <Gauge pct={pct}/>

      <div className="chips" style={{marginTop:14}}>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(mins)}</div><div className="cl">due / mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(intMo)}</div><div className="cl">interest / mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.accent}}>{mo}mo</div><div className="cl">to free</div></div>
      </div>

      {isPlus ? (
        <div className="fhero">
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Your Freedom Date</div>
          <div className="fdate">{toDate(mo)}</div>
          <div style={{fontSize:12,color:C.muted}}>at current pace + {fmt(mins*.3)} extra/mo</div>
          <button className="btn bg bsm" style={{marginTop:12}} onClick={onSync}><I.Sync/>Sync balances</button>
        </div>
      ) : (
        <div style={{position:"relative",marginBottom:16}}>
          <div style={{filter:"blur(4px)",userSelect:"none",pointerEvents:"none"}}>
            <div className="fhero"><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Your Freedom Date</div><div className="fdate">March 2028</div></div>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
            <I.Lock/>
            <div style={{fontWeight:700,fontSize:14}}>Freedom Date — Plus only</div>
            <button className="btn bplus bsm" onClick={onUpgrade}>Unlock — $6.99/mo</button>
          </div>
        </div>
      )}

      <div className="card" style={{borderColor:C.red+"30",marginBottom:16}}>
        <div style={{fontSize:10,color:C.red,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>What debt costs you</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13}}>Per day in interest</span><span className="mono" style={{color:C.red}}>{fmt(intMo/30)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13}}>Per year</span><span className="mono" style={{color:C.red}}>{fmt(intMo*12)}</span></div>
      </div>

      <p className="lbl">Milestones</p>
      <div className="card">
        {MS.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"11px 0",borderBottom:i<MS.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:20,opacity:m.ok?1:.25,marginTop:2}}>{m.e}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:m.ok?C.text:C.muted}}>{m.t}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{m.s}</div></div>
            {m.ok&&<span className="tag tg">Done</span>}
          </div>
        ))}
      </div>
      {done.length>0&&(
        <button className="btn bg bsm bfull" style={{marginTop:4}} onClick={()=>onCelebrate(done[done.length-1])}>
          🎉 Celebrate a milestone
        </button>
      )}
    </div>
  );
}

// ── Debts ─────────────────────────────────────────────────────────────────────
function DebtsTab({debts,setDebts,openModal,pop}) {
  const [sort,setSort]=useState("rate");
  const TM={student:"tb",auto:"ty",credit:"tr",personal:"tb",medical:"tp",imported:"tb"};
  const TL={student:"Student",auto:"Auto",credit:"Credit",personal:"Personal",medical:"Medical",imported:"CSV"};
  const sorted=[...debts].sort((a,b)=>sort==="rate"?b.rate-a.rate:sort==="balance"?b.balance-a.balance:a.min-b.min);
  return (
    <div className="scroll">
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button className="btn bp bsm" onClick={()=>openModal("add")}><I.Plus/>Add</button>
        <button className="btn bg bsm" onClick={()=>openModal("import")}><I.Up/>Import CSV</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["rate","Highest APR"],["balance","Largest"],["min","Min pmt"]].map(([s,l])=>(
          <button key={s} className={`btn bsm ${sort===s?"bp":"bg"}`} onClick={()=>setSort(s)}>{l}</button>
        ))}
      </div>
      <div className="card">
        {sorted.map(d=>{
          const paid=1-(d.balance/d.original);
          return (
            <div key={d.id} style={{padding:"13px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                    <span className={`tag ${TM[d.type]||"tb"}`}>{TL[d.type]||"Other"}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{d.rate}% APR · {fmtD(d.min)}/mo min</div>
                </div>
                <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                  <div className="mono" style={{fontSize:15,fontWeight:500}}>{fmtD(d.balance)}</div>
                  <div style={{fontSize:10,color:C.muted}}>{Math.round(paid*100)}% paid</div>
                </div>
              </div>
              <div className="pbar"><div className="pfill" style={{width:`${paid*100}%`,background:d.color}}/></div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:5}}>
                <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11}} onClick={()=>{setDebts(x=>x.filter(v=>v.id!==d.id));pop("Removed","✕");}}>✕ remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Plan ──────────────────────────────────────────────────────────────────────
function PlanTab({debts,isPlus,onUpgrade}) {
  const [extra,setExtra]=useState(100);
  const [strat,setStrat]=useState("avalanche");
  const [income,setIncome]=useState(3500);
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const mins =debts.reduce((s,d)=>s+d.min,0);
  const mo   =Math.ceil(total/(mins+extra));
  const totI =debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*mo),0);
  const dti  =mins/income;
  const ord  =strat==="avalanche"?[...debts].sort((a,b)=>b.rate-a.rate):[...debts].sort((a,b)=>a.balance-b.balance);
  return (
    <div className="scroll">
      <p className="lbl">Extra payment / month</p>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:13,color:C.muted}}>+$</span>
          <input className="inp mono" type="number" value={extra} onChange={e=>setExtra(Math.max(0,parseInt(e.target.value)||0))} style={{flex:1}}/>
          <span style={{fontSize:13,color:C.muted}}>/mo</span>
        </div>
        <input className="sli" type="range" min="0" max="1000" step="25" value={extra} onChange={e=>setExtra(parseInt(e.target.value))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
          {[0,50,100,200,500].map(v=><button key={v} className={`btn bsm ${extra===v?"bp":"bg"}`} onClick={()=>setExtra(v)}>+{fmt(v)}</button>)}
        </div>
      </div>
      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.accent}}>{mo}mo</div><div className="cl">debt-free</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(mins+extra)}</div><div className="cl">total/mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(totI)}</div><div className="cl">total interest</div></div>
      </div>
      {isPlus&&(
        <div className="fhero" style={{marginBottom:16}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Debt-free by</div>
          <div className="fdate">{toDate(mo)}</div>
          <div style={{fontSize:11,color:C.muted}}>with {fmt(extra)} extra/mo</div>
        </div>
      )}
      <p className="lbl">Strategy</p>
      <div className="stog">
        <button className={`sbtn${strat==="avalanche"?" on":""}`} onClick={()=>setStrat("avalanche")}>⚡ Avalanche — saves most</button>
        <button className={`sbtn${strat==="snowball"?" on":""}`} onClick={()=>setStrat("snowball")}>☃️ Snowball — motivating</button>
      </div>
      <div className="card" style={{marginBottom:16}}>
        {ord.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:i<ord.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:i===0?C.accent:C.border,color:i===0?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{d.name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{d.rate}% APR · {fmtD(d.balance)}</div></div>
            {i===0&&<span className="tag tg">Focus</span>}
          </div>
        ))}
      </div>
      {isPlus ? (
        <>
          <p className="lbl">Debt-to-income ratio</p>
          <div className="card">
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:12,color:C.muted}}>Monthly income $</span>
              <input className="inp mono" type="number" value={income} onChange={e=>setIncome(parseInt(e.target.value)||0)} style={{width:110}}/>
            </div>
            <div className="pbar" style={{marginBottom:8}}><div className="pfill" style={{width:`${Math.min(dti,1)*100}%`,background:dti>.4?C.red:dti>.2?C.yellow:C.success}}/></div>
            <div style={{fontSize:13}}>Payments = <span className="mono" style={{color:dti>.4?C.red:dti>.2?C.yellow:C.success}}>{Math.round(dti*100)}%</span> of income
              {dti>.4&&<span style={{fontSize:12,color:C.red}}> · High — prioritize payoff</span>}
              {dti<=.2&&<span style={{fontSize:12,color:C.success}}> · Healthy range</span>}
            </div>
          </div>
        </>
      ) : (
        <div style={{position:"relative"}}>
          <div style={{filter:"blur(3px)",pointerEvents:"none",userSelect:"none"}}><p className="lbl">Debt-to-income ratio</p><div className="card"><div style={{height:56}}/></div></div>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><I.Lock/><button className="btn bplus bsm" onClick={onUpgrade}>Unlock with Plus</button></div>
        </div>
      )}
    </div>
  );
}

// ── Credit ────────────────────────────────────────────────────────────────────
function CreditTab({debts,isPlus,onUpgrade,score,setScore}) {
  const [aiTip,setAiTip]=useState(null);
  const [aiLoad,setAiLoad]=useState(false);
  const cards=debts.filter(d=>d.type==="credit");
  const lim=cards.reduce((s,d)=>s+d.original,0);
  const bal=cards.reduce((s,d)=>s+d.balance,0);
  const util=lim>0?(bal/lim)*100:0;
  const color=score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red;
  const FACTS=[
    {l:"Payment history",w:35,v:82,c:C.success},
    {l:"Utilization",    w:30,v:Math.max(0,100-util),c:util>30?C.red:util>10?C.yellow:C.success},
    {l:"Credit age",     w:15,v:60,c:C.yellow},
    {l:"Credit mix",     w:10,v:70,c:C.blue},
    {l:"New inquiries",  w:10,v:90,c:C.success},
  ];
  const getAI=async()=>{
    setAiLoad(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:"Concise credit advisor inside Moneycode. Max 90 words. One concrete action at the end. No bullet points.",
          messages:[{role:"user",content:`Score: ${score}. Utilization: ${Math.round(util)}% ($${Math.round(bal)} of $${Math.round(lim)} limit). ${cards.length} credit cards. What's the fastest path to improve my score?`}]})
      });
      const d=await res.json();
      setAiTip(d.content?.[0]?.text||"");
    } catch(e) { setAiTip("Couldn't connect. Check your connection and try again."); }
    setAiLoad(false);
  };
  return (
    <div className="scroll">
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Your Credit Score</div>
        <ScoreRing score={score}/>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Update score</span>
          <span className="tag tb">Self-reported</span>
        </div>
        <input className="sli" type="range" min="300" max="850" step="5" value={score} onChange={e=>setScore(parseInt(e.target.value))}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginTop:6}}>
          <span>300</span><span style={{color,fontWeight:700}}>{score}</span><span>850</span>
        </div>
      </div>

      <p className="lbl">Credit utilization</p>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <div><div className="mono" style={{fontSize:18,fontWeight:700,color:util>30?C.red:util>10?C.yellow:C.success}}>{Math.round(util)}%</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>of {fmt(lim)} limit</div></div>
          <span className={`tag ${util>30?"tr":util>10?"ty":"tg"}`}>{util>30?"High":util>10?"OK":"Great"}</span>
        </div>
        <div className="pbar" style={{marginBottom:12}}><div className="pfill" style={{width:`${Math.min(util,100)}%`,background:util>30?C.red:util>10?C.yellow:C.success}}/></div>
        {cards.map(c=>{const u=(c.balance/c.original)*100;return(
          <div key={c.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:10,marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,fontWeight:600}}>{c.name}</span><span className="mono" style={{fontSize:12,color:u>30?C.red:u>10?C.yellow:C.success}}>{Math.round(u)}%</span></div>
            <div className="pbar"><div className="pfill" style={{width:`${Math.min(u,100)}%`,background:u>30?C.red:u>10?C.yellow:C.success}}/></div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>{fmtD(c.balance)} of {fmtD(c.original)}</div>
          </div>
        );})}
        {util>10&&(
          <div style={{marginTop:10,padding:"10px 12px",background:C.accent+"12",borderRadius:8,border:`1px solid ${C.accent}30`}}>
            <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:3}}>💡 Score boost opportunity</div>
            <div style={{fontSize:12,color:C.muted}}>Pay down {fmtD(Math.max(0,bal-lim*.1))} to get under 10% utilization — est. +20–40 pts.</div>
          </div>
        )}
      </div>

      <p className="lbl">Score factors</p>
      <div className="card" style={{marginBottom:16}}>
        {FACTS.map(f=>(
          <div key={f.l} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{width:108,flexShrink:0}}><div style={{fontSize:12,fontWeight:600}}>{f.l}</div><div style={{fontSize:10,color:C.muted}}>{f.w}% of score</div></div>
            <div className="fbar"><div style={{height:"100%",borderRadius:2,background:f.c,width:`${f.v}%`}}/></div>
            <div className="mono" style={{fontSize:11,color:f.c,minWidth:28,textAlign:"right"}}>{f.v}%</div>
          </div>
        ))}
      </div>

      {isPlus ? (
        <>
          <p className="lbl">AI score analysis</p>
          {aiTip ? (
            <div className="card" style={{borderColor:C.accent+"30",marginBottom:16}}>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>✦ AI Advisor</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{aiTip}</div>
              <button className="btn bg bsm" style={{marginTop:12}} onClick={()=>setAiTip(null)}>Refresh</button>
            </div>
          ) : (
            <button className="btn bp bfull" style={{marginBottom:16}} onClick={getAI} disabled={aiLoad}>
              {aiLoad?"Analyzing…":"✦ Analyze my score"}
            </button>
          )}
        </>
      ) : (
        <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>✦ AI Credit Analysis — Plus only</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Get a personalized explanation of your score and the top moves to improve it fast.</div>
          <button className="btn bplus bfull" onClick={onUpgrade}>Unlock — $6.99/mo</button>
        </div>
      )}

      <p className="lbl">Score impact of your plan</p>
      <div className="card">
        {[
          {a:`Pay off ${cards.sort((x,y)=>x.balance-y.balance)[0]?.name||"smallest card"}`,i:"+15–25 pts",w:"~3 months"},
          {a:"Get utilization under 10%",i:"+20–40 pts",w:"Next billing cycle"},
          {a:"6 months on-time payments",i:"+10–20 pts",w:"6 months"},
          {a:"Avoid new hard inquiries",i:"+5–10 pts",w:"12 months"},
        ].map((r,i)=>(
          <div className="irow" key={i}>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{r.a}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.w}</div></div>
            <span className="tag tg">{r.i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Advisor ────────────────────────────────────────────────────────────────
function AITab({debts,isPlus,onUpgrade}) {
  const [msgs,setMsgs]=useState([{r:"ai",t:"Hey! I'm your Moneycode advisor. I know your full debt picture — ask me anything."}]);
  const [input,setInput]=useState("");
  const [load,setLoad]=useState(false);
  const ref=useRef();
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,load]);

  const QUICK=["What should I do this month?","How much interest am I wasting?","Can I afford to invest yet?","What's my fastest path out of debt?"];

  const send=async(txt)=>{
    if(!txt.trim()||load) return;
    setInput(""); setMsgs(m=>[...m,{r:"me",t:txt}]); setLoad(true);
    const sum=debts.map(d=>`${d.name}: ${fmtD(d.balance)} at ${d.rate}% APR, ${fmtD(d.min)}/mo min`).join("\n");
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:`You are a sharp, empathetic financial advisor inside Moneycode — a debt payoff app for 18–30 year olds. Be direct. Use real numbers. Max 130 words. End with one concrete action they can take today.\n\nUser debts:\n${sum}\nTotal: ${fmt(debts.reduce((s,d)=>s+d.balance,0))}\nMonthly minimums: ${fmt(debts.reduce((s,d)=>s+d.min,0))}`,
          messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),{role:"user",content:txt}]
        })
      });
      const d=await res.json();
      setMsgs(m=>[...m,{r:"ai",t:d.content?.[0]?.text||"Something went wrong."}]);
    } catch(e) {
      setMsgs(m=>[...m,{r:"ai",t:"Couldn't connect. Try again."}]);
    }
    setLoad(false);
  };

  if(!isPlus) return (
    <div className="scroll">
      <div style={{marginBottom:20}}><div style={{fontSize:20,fontWeight:800,marginBottom:6}}>AI Advisor</div><div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Real answers about your real numbers — not generic tips.</div></div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{fontSize:28,marginBottom:10}}>💬</div>
        <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>What you can ask</div>
        {QUICK.map(q=><div key={q} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px",fontSize:13,color:C.muted,fontStyle:"italic",marginBottom:6}}>"{q}"</div>)}
      </div>
      <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)"}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>✦ AI Advisor — Plus only</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:14}}>14-day free trial. No credit card required.</div>
        <button className="btn bplus bfull" onClick={onUpgrade}>Unlock — $6.99/mo</button>
        <div style={{textAlign:"center",marginTop:10,fontSize:11,color:C.muted}}>or $59/yr · Cancel any time</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px"}}>
        <div style={{marginBottom:14}}><div style={{fontSize:16,fontWeight:700}}>AI Advisor</div><div style={{fontSize:11,color:C.muted}}>Knows your {debts.length} debts · {fmt(debts.reduce((s,d)=>s+d.balance,0))} total</div></div>
        <div style={{display:"flex",flexDirection:"column"}}>
          {msgs.map((m,i)=>(
            <div key={i} className={`msg ${m.r==="ai"?"mai":"mme"}`} style={{alignSelf:m.r==="ai"?"flex-start":"flex-end"}}>{m.t}</div>
          ))}
          {load&&<div className="msg mai" style={{alignSelf:"flex-start"}}><div style={{display:"flex",gap:4,alignItems:"center"}}><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
        </div>
        {!load&&msgs.length<3&&(
          <div style={{marginTop:10}}>
            <div className="lbl" style={{marginBottom:8}}>Try asking</div>
            {QUICK.map(q=><button key={q} className="btn bg bsm" style={{display:"block",textAlign:"left",width:"100%",marginBottom:6}} onClick={()=>send(q)}>"{q}"</button>)}
          </div>
        )}
        <div ref={ref}/>
      </div>
      <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:8}}>
        <input className="inp" placeholder="Ask anything…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} style={{flex:1}}/>
        <button className="btn bp bico" onClick={()=>send(input)} disabled={!input.trim()||load}><I.Send/></button>
      </div>
    </div>
  );
}

// ── Invest Tab ────────────────────────────────────────────────────────────────
function InvestTab({debts,isPlus,onUpgrade}) {
  const [aiTip,setAiTip]=useState(null);
  const [aiLoad,setAiLoad]=useState(false);

  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const highRate=Math.max(...debts.map(d=>d.rate));
  const creditCards=debts.filter(d=>d.type==="credit");
  const hasHighRateDebt=creditCards.some(d=>d.rate>15);

  // Should they invest at all?
  const readyToInvest=highRate<8;
  const match401k=true; // always grab free money

  const ACCOUNTS=[
    {name:"401(k) — Fidelity",  balance:4200, change:+3.2, color:C.success, type:"Retirement"},
    {name:"Roth IRA — Vanguard", balance:1800, change:+1.8, color:C.success, type:"Retirement"},
    {name:"HYSA — Marcus",       balance:3100, change:+0.4, color:C.blue,    type:"Savings"},
  ];
  const totalInvested=ACCOUNTS.reduce((s,a)=>s+a.balance,0);

  const STEPS=[
    {n:1, t:"Emergency fund",       s:"1–3 months expenses in HYSA",           ok:true,  tag:"Done"},
    {n:2, t:"401(k) match",         s:"Always grab free employer money first",  ok:true,  tag:"Done"},
    {n:3, t:"High-rate debt",       s:"Pay off any debt above 7% APR",          ok:!hasHighRateDebt, tag:hasHighRateDebt?"In progress":"Done"},
    {n:4, t:"Roth IRA",             s:"Max $7,000/yr tax-free growth",          ok:false, tag:"Next"},
    {n:5, t:"Max 401(k)",           s:"$23,000/yr pre-tax limit",               ok:false, tag:"Later"},
    {n:6, t:"Taxable brokerage",    s:"Index funds after tax-advantaged maxed", ok:false, tag:"Later"},
  ];

  const getAI=async()=>{
    setAiLoad(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:"You are a sharp financial advisor inside Moneycode. Be direct, specific, and use real numbers. Max 120 words. One concrete action at the end. No bullet walls.",
          messages:[{role:"user",content:`I have $${Math.round(totalDebt)} in total debt. My highest interest rate is ${highRate}%. I currently have $${totalInvested} invested. Should I be investing right now, or focus on debt payoff? What's the smartest move?`}]
        })
      });
      const d=await res.json();
      setAiTip(d.content?.[0]?.text||"");
    } catch(e) { setAiTip("Couldn't connect. Try again."); }
    setAiLoad(false);
  };

  return (
    <div className="scroll">

      {/* Invest vs. pay debt banner */}
      <div className="card" style={{borderColor:readyToInvest?C.success+"44":C.yellow+"44",background:readyToInvest?"linear-gradient(135deg,#141B27,#0F1A14)":"linear-gradient(135deg,#141B27,#1A1800)",marginBottom:16}}>
        <div style={{fontSize:22,marginBottom:8}}>{readyToInvest?"📈":"⚖️"}</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>
          {readyToInvest?"You're ready to invest":"Debt vs. investing — here's the math"}
        </div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:12}}>
          {hasHighRateDebt
            ? `Your ${creditCards[0]?.name} charges ${creditCards[0]?.rate}% APR. Paying it off is a guaranteed ${creditCards[0]?.rate}% return — better than most investments.`
            : `Your highest rate is ${highRate}%. Index funds average ~10%/yr — it makes sense to invest now while still paying down debt.`
          }
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:C.surface,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Highest debt APR</div>
            <div className="mono" style={{fontSize:18,fontWeight:500,color:highRate>10?C.red:highRate>7?C.yellow:C.success}}>{highRate}%</div>
          </div>
          <div style={{flex:1,background:C.surface,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>S&P 500 avg/yr</div>
            <div className="mono" style={{fontSize:18,fontWeight:500,color:C.success}}>~10%</div>
          </div>
        </div>
      </div>

      {/* Investment order of operations */}
      <p className="lbl">Investment order of operations</p>
      <div className="card" style={{marginBottom:16}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"11px 0",borderBottom:i<STEPS.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:s.ok?C.success:i===STEPS.findIndex(x=>!x.ok)?C.accent:C.border,color:s.ok||i===STEPS.findIndex(x=>!x.ok)?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,marginTop:1}}>{s.ok?"✓":s.n}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13,color:s.ok?C.muted:C.text}}>{s.t}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{s.s}</div>
            </div>
            <span className={`tag ${s.ok?"tg":i===STEPS.findIndex(x=>!x.ok)?"tb":"tp"}`} style={{marginTop:2,flexShrink:0}}>{s.tag}</span>
          </div>
        ))}
      </div>

      {/* Your accounts */}
      <p className="lbl">Your investment accounts</p>
      <div className="card" style={{marginBottom:16}}>
        {ACCOUNTS.map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:i<ACCOUNTS.length-1?`1px solid ${C.border}`:"none"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{a.name}</div>
              <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}>
                <span className="tag tb" style={{fontSize:9}}>{a.type}</span>
                <span style={{fontSize:11,color:C.success}}>+{a.change}% this month</span>
              </div>
            </div>
            <div className="mono" style={{fontSize:15,fontWeight:500,color:a.color}}>{fmt(a.balance)}</div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,marginTop:4,borderTop:`1px solid ${C.border}`}}>
          <span style={{fontWeight:700,fontSize:13}}>Total invested</span>
          <span className="mono" style={{fontWeight:700,fontSize:15,color:C.success}}>{fmt(totalInvested)}</span>
        </div>
      </div>

      {/* AI insight */}
      {isPlus ? (
        <>
          <p className="lbl">AI invest vs. payoff analysis</p>
          {aiTip ? (
            <div className="card" style={{borderColor:C.accent+"30",marginBottom:16}}>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>✦ AI Advisor</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{aiTip}</div>
              <button className="btn bg bsm" style={{marginTop:12}} onClick={()=>setAiTip(null)}>Refresh</button>
            </div>
          ) : (
            <button className="btn bp bfull" style={{marginBottom:16}} onClick={getAI} disabled={aiLoad}>
              {aiLoad?"Thinking…":"✦ Should I invest or pay debt first?"}
            </button>
          )}
        </>
      ) : (
        <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>✦ AI Invest Analysis — Plus only</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:14}}>Get a personalized debt vs. invest recommendation based on your exact rates and timeline.</div>
          <button className="btn bplus bfull" onClick={onUpgrade}>Unlock — $6.99/mo</button>
        </div>
      )}

      {/* Quick explainers */}
      <p className="lbl">Key concepts</p>
      <div className="card">
        {[
          {e:"🏦",t:"401(k)",s:"Pre-tax retirement account. Always get the employer match — it's a 50–100% instant return."},
          {e:"🌱",t:"Roth IRA",s:"Contribute after-tax dollars. Withdrawals in retirement are 100% tax-free."},
          {e:"📊",t:"Index funds",s:"Low-cost funds that track the S&P 500. Outperform 90%+ of actively managed funds over time."},
          {e:"💧",t:"HYSA",s:"High-yield savings account. Park your emergency fund here — currently 4–5% APY."},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"11px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{r.e}</span>
            <div><div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{r.t}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{r.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notification panel ────────────────────────────────────────────────────────
function NotifPanel({isPlus,onUpgrade}) {
  const [prefs,setP]=useState({pay:true,sync:true,mile:true,weekly:true,score:false,ai:false});
  const toggle=k=>setP(p=>({...p,[k]:!p[k]}));
  const FREE =[{k:"pay",e:"💳",t:"Payment reminders",s:"3 days before due date"},{k:"sync",e:"🔄",t:"Balance sync nudge",s:"Monthly reminder"},{k:"mile",e:"🎉",t:"Milestone alerts",s:"When you hit a payoff win"},{k:"weekly",e:"📋",t:"Weekly digest",s:"Sunday progress recap"}];
  const PLUS =[{k:"score",e:"📈",t:"Score change alerts",s:"When score moves ±10 pts"},{k:"ai",e:"✦",t:"AI weekly insight",s:"Personalized tip every Monday"}];
  const RECENT=[{e:"🎉",t:"Milestone hit!",b:"You've paid off 25% of total debt.",time:"2h ago",c:C.success},{e:"💳",t:"Payment due soon",b:"Chase Sapphire — $47 due in 3 days.",time:"1d ago",c:C.yellow},{e:"📊",t:"Monthly sync",b:"Time to update your balances.",time:"3d ago",c:C.blue}];
  return (
    <div style={{overflowY:"auto",maxHeight:"68vh"}}>
      <p className="lbl">Recent</p>
      <div className="card" style={{marginBottom:16}}>
        {RECENT.map((n,i)=>(
          <div className="nrow" key={i}>
            <div style={{width:8,height:8,borderRadius:"50%",background:n.c,marginTop:5,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontWeight:600,fontSize:13}}>{n.e} {n.t}</span><span style={{fontSize:10,color:C.muted}}>{n.time}</span></div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{n.b}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="lbl">Free alerts</p>
      <div className="card" style={{marginBottom:16}}>
        {FREE.map(item=>(
          <div className="trow" key={item.k}>
            <div style={{flex:1,marginRight:12}}><div style={{fontSize:13,fontWeight:600}}>{item.e} {item.t}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.s}</div></div>
            <Toggle on={prefs[item.k]} set={v=>setP(p=>({...p,[item.k]:v}))}/>
          </div>
        ))}
      </div>
      <p className="lbl">Plus alerts</p>
      <div className="card">
        {PLUS.map(item=>(
          <div className="trow" key={item.k}>
            <div style={{flex:1,marginRight:12}}><div style={{fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>{item.e} {item.t}<span className="tag tpl">Plus</span></div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.s}</div></div>
            {isPlus?<Toggle on={prefs[item.k]} set={v=>setP(p=>({...p,[item.k]:v}))}/>:<button className="btn bplus bsm" onClick={onUpgrade} style={{padding:"5px 10px",fontSize:11}}>Unlock</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Plaid panel ───────────────────────────────────────────────────────────────
function PlaidPanel({pop}) {
  const ROUTES=[
    {m:"POST",p:"/api/plaid/create-link-token",code:
`export default async function handler(req, res) {
  const r = await client.linkTokenCreate({
    user: { client_user_id: req.session.userId },
    client_name: 'Moneycode',
    products: ['transactions','liabilities'],
    country_codes: ['US'],
    language: 'en',
  });
  res.json({ link_token: r.data.link_token });
}`},
    {m:"POST",p:"/api/plaid/exchange-token",code:
`export default async function handler(req, res) {
  const { public_token } = req.body;
  const r = await client.itemPublicTokenExchange({ public_token });
  // Store encrypted — NEVER send access_token to client
  await db.users.update({
    where: { id: req.session.userId },
    data:  { plaid_token: encrypt(r.data.access_token) }
  });
  res.json({ success: true });
}`},
    {m:"POST",p:"/api/plaid/webhook",code:
`export default async function handler(req, res) {
  // Verify webhook signature before processing
  const sig = req.headers['plaid-verification'];
  if (!verifySignature(sig, req.body)) {
    return res.status(401).end();
  }
  if (req.body.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
    await syncTransactions(req.body.item_id);
  }
  res.status(200).end();
}`},
    {m:"GET",p:"/api/plaid/sync",code:
`export default async function handler(req, res) {
  const user = await db.users.findUnique({
    where: { id: req.session.userId }
  });
  const token  = decrypt(user.plaid_token);
  let cursor   = user.plaid_cursor;
  let added    = [];
  let hasMore  = true;

  while (hasMore) {
    const r = await client.transactionsSync({ access_token: token, cursor });
    added.push(...r.data.added);
    hasMore = r.data.has_more;
    cursor  = r.data.next_cursor;
  }
  await db.users.update({
    where: { id: req.session.userId },
    data:  { plaid_cursor: cursor }
  });
  res.json({ added });
}`},
  ];
  return (
    <div style={{overflowY:"auto",maxHeight:"68vh"}}>
      <p style={{fontSize:13,color:C.muted,marginBottom:14,lineHeight:1.5}}>Copy into <span className="mono" style={{color:C.accent,fontSize:12}}>pages/api/plaid/</span> in your Next.js project.</p>
      <p className="lbl">Env vars needed</p>
      <div className="card" style={{marginBottom:14}}>
        {["PLAID_CLIENT_ID","PLAID_SECRET","PLAID_ENV","DATABASE_URL","ENCRYPTION_KEY"].map(v=>(
          <div key={v} style={{padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <span className="mono" style={{fontSize:11,color:C.accent}}>{v}</span>
          </div>
        ))}
      </div>
      {ROUTES.map((r,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontWeight:700,fontSize:10,color:r.m==="POST"?C.yellow:C.blue}}>{r.m}</span>
            <span className="mono" style={{fontSize:11,flex:1}}>{r.p}</span>
            <button className="btn bg bsm" style={{padding:"4px 10px",fontSize:11}} onClick={()=>{navigator.clipboard?.writeText(r.code);pop("Copied!");}}>Copy</button>
          </div>
          <div className="codebox"><pre>{r.code}</pre></div>
        </div>
      ))}
    </div>
  );
}

// ── CSV Import ────────────────────────────────────────────────────────────────
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
        <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>Import CSV</div>
        {step==="drop"&&<>
          <div className={`dz${drag?" ov":""}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);load(e.dataTransfer.files[0]);}} onClick={()=>ref.current.click()}>
            <div style={{fontSize:32,marginBottom:8}}>📂</div>
            <div style={{fontWeight:600,marginBottom:4}}>Drop CSV here</div>
            <div style={{fontSize:12,color:C.muted}}>Chase, BoA, Mint, YNAB exports</div>
          </div>
          <input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={e=>load(e.target.files[0])}/>
          <button className="btn bg bsm" style={{marginTop:4}} onClick={demo}>Use sample data</button>
        </>}
        {step==="map"&&prev&&<>
          <p className="lbl">{prev.all.length} rows — map columns</p>
          {["name","balance","rate","min"].map(f=>(
            <div className="fld" key={f}>
              <div className="flb">{f==="name"?"Account":f==="balance"?"Balance":f==="rate"?"APR %":"Min pmt"}</div>
              <select className="inp" value={map[f]??""} onChange={e=>setMap(m=>({...m,[f]:parseInt(e.target.value)}))}>
                <option value="">— skip —</option>
                {prev.headers.map((h,i)=><option key={i} value={i}>{h}</option>)}
              </select>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg bsm" onClick={()=>setStep("drop")}>Back</button>
            <button className="btn bp" style={{flex:1}} onClick={()=>setStep("confirm")}>Continue →</button>
          </div>
        </>}
        {step==="confirm"&&<>
          <div className="card" style={{borderColor:C.success+"44",background:C.success+"0A",marginBottom:16}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:26}}>✓</span><div><div style={{fontWeight:700}}>{prev.all.length} accounts ready</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Will merge with your existing debts</div></div></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg bsm" onClick={()=>setStep("map")}>Back</button>
            <button className="btn bp" style={{flex:1}} onClick={confirm}>Import</button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ── Sync modal ────────────────────────────────────────────────────────────────
function SyncModal({debts,onClose,onSync}) {
  const [step,setStep]=useState("edit");
  const [vals,setVals]=useState(debts.map(d=>({...d,next:parseFloat(Math.max(0,d.balance-d.min*(0.9+Math.random()*.2)).toFixed(2))})));
  const go=()=>{setStep("syncing");setTimeout(()=>setStep("done"),1800);}
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>Monthly sync</div>
        {step==="edit"&&<>
          {vals.map((u,i)=>(
            <div className="fld" key={u.id}>
              <div className="flb">{u.name} — was {fmtD(u.balance)}</div>
              <input className="inp mono" type="number" value={u.next} onChange={e=>setVals(v=>v.map((x,j)=>j===i?{...x,next:parseFloat(e.target.value)||0}:x))}/>
            </div>
          ))}
          <button className="btn bp bfull" onClick={go}>Sync balances</button>
        </>}
        {step==="syncing"&&<div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:40,display:"inline-block",animation:"spin .8s linear infinite"}}>⟳</div>
          <div style={{fontWeight:600,marginTop:16}}>Recalculating…</div>
        </div>}
        {step==="done"&&<>
          {vals.map(u=>{const d=u.next-u.balance;return(
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:13}}>{u.name}</div><div className="mono" style={{fontSize:11,color:C.muted}}>{fmtD(u.balance)} → {fmtD(u.next)}</div></div>
              <span className={`tag ${d<0?"tg":"tr"}`}>{d<0?"−":"+"}{fmtD(Math.abs(d))}</span>
            </div>
          );})}
          <button className="btn bp bfull" style={{marginTop:16}} onClick={()=>{onSync(vals);onClose();}}>Save & update plan</button>
        </>}
      </div>
    </div>
  );
}

// ── Add Debt ──────────────────────────────────────────────────────────────────
function AddModal({onClose,onAdd}) {
  const [f,setF]=useState({name:"",balance:"",original:"",rate:"",min:"",type:"credit"});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const submit=()=>{
    if(!f.name||!f.balance) return;
    onAdd({id:Date.now(),name:f.name,balance:parseFloat(f.balance),original:parseFloat(f.original||f.balance),rate:parseFloat(f.rate||0),min:parseFloat(f.min||0),type:f.type,color:{student:C.blue,auto:C.yellow,credit:C.red,personal:C.blue,medical:C.purple}[f.type]||C.blue});
    onClose();
  };
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>Add a debt</div>
        <div className="fld"><div className="flb">Account name</div><input className="inp" placeholder="e.g. Navient Loan" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
        <div className="fld"><div className="flb">Type</div>
          <select className="inp" value={f.type} onChange={e=>s("type",e.target.value)}>
            {["student","auto","credit","personal","medical"].map(t=><option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["balance","Current"],["original","Original"],["rate","APR %"],["min","Min pmt"]].map(([k,l])=>(
            <div className="fld" key={k}><div className="flb">{l}</div><input className="inp mono" type="number" placeholder="0.00" value={f[k]} onChange={e=>s(k,e.target.value)}/></div>
          ))}
        </div>
        <button className="btn bp bfull" onClick={submit}>Add debt</button>
      </div>
    </div>
  );
}

// ── Paywall ───────────────────────────────────────────────────────────────────
function PaywallModal({onClose,onUpgrade}) {
  const FEATS=[["💬","AI Advisor","Ask anything, get a plan with your real numbers"],["📅","Freedom Date","Your exact debt-free date, live"],["📈","Credit monitoring","Score tracking + AI analysis"],["🔗","Plaid auto-sync","Balances update automatically"],["🎉","Milestones","Celebrate wins and share progress"],["📊","Debt-to-income","Know exactly where you stand"],["🔔","Smart notifications","Score changes + AI weekly insights"]];
  return (
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:34,marginBottom:10}}>✦</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:6}}>Moneycode Plus</div>
          <div style={{fontSize:14,color:C.muted}}>Everything you need to get out of debt faster.</div>
        </div>
        {FEATS.map(([e,t,s])=>(
          <div key={t} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
            <span style={{fontSize:20,width:28,flexShrink:0,marginTop:2}}>{e}</span>
            <div><div style={{fontWeight:600,fontSize:13}}>{t}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{s}</div></div>
          </div>
        ))}
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:8}}>
          <button className="btn bplus bfull" style={{fontSize:15,padding:14}} onClick={onUpgrade}>Start 14-day free trial</button>
          <div style={{textAlign:"center",fontSize:12,color:C.muted}}>Then $6.99/mo — or $59/yr (save 30%) · Cancel any time</div>
        </div>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [boarded,setBoarded] = useState(false);
  const [name,setName]       = useState("");
  const [tab,setTab]         = useState("home");
  const [modal,setModal]     = useState(null);
  const [sheet,setSheet]     = useState(null);
  const [debts,setDebts]     = useState(DEBTS);
  const [isPlus,setIsPlus]   = useState(false);
  const [score,setScore]     = useState(672);
  const [toast,setToast]     = useState(null);
  const [celebrate,setCel]   = useState(null);
  const [showPW,setShowPW]   = useState(false);

  const pop=(msg,icon="✓")=>{setToast({msg,icon});setTimeout(()=>setToast(null),2400);};
  const upgrade=()=>{setIsPlus(true);setShowPW(false);pop("Welcome to Plus ✦","✦");};
  const onCelebrate=m=>{setCel(m);setTimeout(()=>setCel(null),3500);};

  if(!boarded) return (
    <>
      <style>{STYLES}</style>
      <Onboarding onDone={n=>{setName(n);setBoarded(true);}}/>
    </>
  );

  const TABS=[{id:"home",l:"Home",Icon:I.Home},{id:"debts",l:"Debts",Icon:I.Debt},{id:"plan",l:"Plan",Icon:I.Plan},{id:"credit",l:"Credit",Icon:I.Credit},{id:"invest",l:"Invest",Icon:I.Invest},{id:"ai",l:"Advisor",Icon:I.AI}];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">

        {tab!=="ai"&&(
          <div className="hdr">
            <div className="logo">money<span style={{color:C.accent}}>code</span></div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {isPlus
                ? <span className="tag tpl">✦ Plus</span>
                : <button className="btn bplus bsm" onClick={()=>setShowPW(true)}>✦ Go Plus</button>
              }
              <button className="btn bg bico bsm" onClick={()=>setSheet("notif")} title="Notifications"><I.Bell/></button>
              <button className="btn bg bico bsm" onClick={()=>setModal("sync")} title="Sync"><I.Sync/></button>
            </div>
          </div>
        )}

        {tab==="home"  &&<HomeTab   debts={debts} isPlus={isPlus} onSync={()=>setModal("sync")} onUpgrade={()=>setShowPW(true)} onCelebrate={onCelebrate} name={name}/>}
        {tab==="debts" &&<DebtsTab  debts={debts} setDebts={setDebts} openModal={setModal} pop={pop}/>}
        {tab==="plan"  &&<PlanTab   debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)}/>}
        {tab==="credit"&&<CreditTab debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)} score={score} setScore={setScore}/>}
        {tab==="invest"&&<InvestTab debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)}/>}
        {tab==="ai"    &&<AITab     debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)}/>}

        <nav className="tabbar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <t.Icon/>{t.l}
              {t.id==="ai"&&!isPlus&&<div style={{position:"absolute",top:8,right:"calc(50% - 14px)",width:6,height:6,borderRadius:"50%",background:C.yellow}}/>}
            </button>
          ))}
        </nav>

        {/* Bottom sheet */}
        {sheet&&(
          <div className="mover" onClick={e=>e.target===e.currentTarget&&setSheet(null)}>
            <div className="mo" style={{maxHeight:"90vh"}}>
              <div className="hdl"/>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                <button className={`btn bsm ${sheet==="notif"?"bp":"bg"}`} onClick={()=>setSheet("notif")}>🔔 Notifications</button>
                <button className={`btn bsm ${sheet==="plaid"?"bp":"bg"}`} onClick={()=>setSheet("plaid")}>⚙️ Plaid Routes</button>
              </div>
              {sheet==="notif"&&<NotifPanel isPlus={isPlus} onUpgrade={upgrade}/>}
              {sheet==="plaid"&&<PlaidPanel pop={pop}/>}
            </div>
          </div>
        )}

        {modal==="import"&&<CSVModal  onClose={()=>setModal(null)} onImport={d=>{setDebts(x=>[...x,...d]);pop(`${d.length} debts imported`);}}/>}
        {modal==="sync"  &&<SyncModal debts={debts} onClose={()=>setModal(null)} onSync={u=>{setDebts(d=>d.map(x=>{const f=u.find(v=>v.id===x.id);return f?{...x,balance:Math.max(0,f.next)}:x;}));pop("Balances updated");}}/>}
        {modal==="add"   &&<AddModal  onClose={()=>setModal(null)} onAdd={d=>{setDebts(x=>[...x,d]);pop("Debt added");}}/>}
        {showPW          &&<PaywallModal onClose={()=>setShowPW(false)} onUpgrade={upgrade}/>}

        {toast&&<div className="toast" style={{animation:"tin .2s ease"}}><span style={{color:C.accent}}>{toast.icon}</span>{toast.msg}</div>}

        {celebrate&&(
          <>
            <Confetti/>
            <div className="cel" onClick={()=>setCel(null)}>
              <div style={{fontSize:72,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>{celebrate.e}</div>
              <div style={{fontSize:24,fontWeight:800,textAlign:"center"}}>{celebrate.t}</div>
              <div style={{fontSize:14,color:C.muted,textAlign:"center",lineHeight:1.5}}>{celebrate.s}<br/><span style={{color:C.accent}}>Keep going — you're doing it.</span></div>
              <button className="btn bp" style={{marginTop:8}}>Share this win</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
