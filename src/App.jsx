import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#080C12", surface:"#0F1520", card:"#141B27", border:"#1E2D42",
  accent:"#B5FF4D", red:"#FF5A5A", yellow:"#FFD166", blue:"#58A6FF",
  purple:"#A78BFA", text:"#E6EDF3", muted:"#5B7087", success:"#3FB950",
};

const fmt  = n => "$" + Math.abs(n).toLocaleString("en-US",{maximumFractionDigits:0});
const fmtD = n => "$" + Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const toDate = m => {
  if(!m||!isFinite(m)||m<=0||m>600) return "50+ years";
  const d=new Date();
  d.setMonth(d.getMonth()+Math.round(Math.min(m,600)));
  return d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
};

// ── Plain English glossary ────────────────────────────────────────────────────
const TERMS = {
  apr:       {word:"APR",      plain:"Interest rate",  explain:"The extra percentage you pay per year just for borrowing money. A 20% APR on $1,000 means you pay $200 extra every year you carry that balance."},
  minimum:   {word:"Minimum payment", plain:"Smallest allowed payment", explain:"The least you can pay each month without getting penalized. Paying only the minimum is a trap — most of it goes to interest, barely touching what you owe."},
  balance:   {word:"Balance",  plain:"What you owe",    explain:"The total amount you still need to pay back right now."},
  utilization:{word:"Utilization",plain:"How much of your credit limit you're using", explain:"If your credit card limit is $1,000 and you've spent $300, your utilization is 30%. Keeping this under 10% helps your credit score a lot."},
  creditScore:{word:"Credit score",plain:"Your money reputation score", explain:"A number from 300–850 that tells lenders how reliably you pay back money. Higher is better. It affects whether you can rent an apartment, get a car loan, or buy a house — and at what cost."},
  netWorth:  {word:"Net worth", plain:"What you'd actually have if you paid everything off", explain:"Add up everything you own (savings, car, investments), then subtract everything you owe (loans, credit cards). Even if it's negative right now, watching it go up is the most motivating number in personal finance."},
  avalanche: {word:"Avalanche method",plain:"Pay highest interest first", explain:"Focus all extra money on your highest-interest debt first. Mathematically saves the most money. Like fighting the most dangerous enemy first."},
  snowball:  {word:"Snowball method",plain:"Pay smallest debt first", explain:"Pay off your smallest debt completely, then roll that payment to the next one. Slower than avalanche mathematically, but the wins keep you motivated."},
  compound:  {word:"Compound interest",plain:"Interest on top of interest", explain:"When you don't pay off your debt, the interest gets added to what you owe — and then you pay interest on THAT too. It snowballs against you. The same thing works FOR you in investments."},
  efund:     {word:"Emergency fund",plain:"Your financial safety net", explain:"3–6 months of expenses saved in a bank account, only touched in emergencies. Without one, any unexpected cost (car repair, medical bill) goes on a credit card and starts costing you interest."},
};

const CSS = `
input,select,textarea{font-size:16px!important;}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#080C12;color:#E6EDF3;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;}
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;}
.scroll{overflow-y:auto;padding:14px 14px 96px;}
.scroll::-webkit-scrollbar{display:none;}
.mono{font-family:'DM Mono',monospace;}
.tabbar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#0F1520;border-top:1px solid #1E2D42;display:flex;z-index:100;}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;padding:9px 0 7px;gap:2px;cursor:pointer;border:none;background:none;color:#5B7087;font-size:8px;font-family:Inter,sans-serif;font-weight:600;letter-spacing:.05em;text-transform:uppercase;transition:color .15s;position:relative;}
.tab.on{color:#B5FF4D;}
.tab svg{width:18px;height:18px;}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:14px 14px 0;}
.logo{font-weight:800;font-size:18px;letter-spacing:-.03em;}
.card{background:#141B27;border:1px solid #1E2D42;border-radius:14px;padding:14px;margin-bottom:10px;}
.lbl{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5B7087;margin-bottom:8px;}
.chips{display:flex;gap:7px;margin-bottom:12px;}
.chip{background:#141B27;border:1px solid #1E2D42;border-radius:10px;padding:11px;flex:1;}
.cv{font-family:'DM Mono',monospace;font-size:15px;font-weight:500;line-height:1;}
.cl{font-size:9px;color:#5B7087;margin-top:3px;font-weight:500;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;border-radius:9px;border:none;font-family:Inter,sans-serif;font-weight:600;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
.bp{background:#B5FF4D;color:#080C12;}
.bp:hover{filter:brightness(1.08);}
.bp:disabled{opacity:.4;cursor:not-allowed;}
.bplus{background:linear-gradient(135deg,#FFD166,#FFA620);color:#080C12;}
.bg{background:transparent;color:#E6EDF3;border:1px solid #1E2D42;}
.bg:hover{border-color:#B5FF4D44;}
.bsm{padding:5px 10px;font-size:11px;border-radius:7px;}
.bfull{width:100%;}
.bico{padding:8px;border-radius:8px;}
.tag{display:inline-block;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
.tr{background:#FF5A5A20;color:#FF5A5A;}
.tg{background:#3FB95020;color:#3FB950;}
.tb{background:#58A6FF20;color:#58A6FF;}
.ty{background:#FFD16620;color:#FFD166;}
.tp{background:#A78BFA20;color:#A78BFA;}
.tpl{background:#FFD16625;color:#FFD166;border:1px solid #FFD16630;}
.inp{background:#0F1520;border:1px solid #1E2D42;border-radius:8px;padding:9px 11px;color:#E6EDF3;font-family:Inter,sans-serif;font-size:13px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#B5FF4D80;}
.fld{margin-bottom:10px;}
.flb{font-size:10px;color:#5B7087;margin-bottom:3px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;}
.mover{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.mo{background:#0F1520;border:1px solid #1E2D42;border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:16px 16px 40px;max-height:90vh;overflow-y:auto;}
.mo::-webkit-scrollbar{display:none;}
.hdl{width:32px;height:4px;background:#1E2D42;border-radius:2px;margin:0 auto 14px;}
.toast{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#141B27;border:1px solid #1E2D42;border-radius:9px;padding:8px 14px;font-size:12px;font-weight:600;z-index:999;white-space:nowrap;display:flex;align-items:center;gap:8px;box-shadow:0 8px 40px rgba(0,0,0,.6);}
.pbar{height:4px;background:#1E2D42;border-radius:2px;overflow:hidden;}
.pfill{height:100%;border-radius:2px;transition:width .6s ease;}
.irow{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #1E2D42;}
.irow:last-child{border-bottom:none;}
.fhero{background:linear-gradient(135deg,rgba(181,255,77,.11),transparent);border:1px solid rgba(181,255,77,.25);border-radius:14px;padding:16px;text-align:center;margin-bottom:10px;}
.fdate{font-family:'DM Mono',monospace;font-size:22px;font-weight:500;color:#B5FF4D;margin:5px 0 3px;}
.sli{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#1E2D42;outline:none;}
.sli::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#B5FF4D;cursor:pointer;}
.stog{display:flex;background:#141B27;border:1px solid #1E2D42;border-radius:9px;padding:3px;margin-bottom:12px;}
.sbtn{flex:1;padding:7px;border:none;border-radius:7px;font-family:Inter,sans-serif;font-size:11px;font-weight:600;cursor:pointer;background:transparent;color:#5B7087;}
.sbtn.on{background:#B5FF4D;color:#080C12;}
.cel{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.9);flex-direction:column;gap:12px;padding:30px;}
@keyframes pop{from{transform:scale(0);}to{transform:scale(1);}}
@keyframes fall{from{transform:translateY(-20px) rotate(0deg);opacity:1;}to{transform:translateY(100vh) rotate(720deg);opacity:0;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
@keyframes slideup{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.ob{height:100vh;display:flex;flex-direction:column;padding:40px 20px 36px;overflow-y:auto;box-sizing:border-box;}
.opip{height:3px;flex:1;border-radius:2px;background:#1E2D42;transition:background .3s;}
.opip.on{background:#B5FF4D;}
.oopt{display:flex;align-items:center;gap:11px;padding:13px;border:1px solid #1E2D42;border-radius:11px;margin-bottom:8px;cursor:pointer;background:#141B27;transition:all .15s;-webkit-tap-highlight-color:transparent;user-select:none;}
.oopt.on{border-color:#B5FF4D;background:rgba(181,255,77,.06);}
.ttrk{width:42px;height:23px;border-radius:12px;border:none;cursor:pointer;transition:background .2s;position:relative;flex-shrink:0;}
.ttmb{position:absolute;top:3px;width:17px;height:17px;border-radius:50%;background:#fff;transition:left .2s;}
.msg{max-width:88%;padding:10px 13px;border-radius:13px;font-size:13px;line-height:1.55;margin-bottom:8px;}
.mai{background:#141B27;border:1px solid #1E2D42;border-radius:4px 13px 13px 13px;}
.mme{background:#B5FF4D;color:#080C12;font-weight:500;margin-left:auto;border-radius:13px 4px 13px 13px;}
.dot{width:6px;height:6px;border-radius:50%;background:#5B7087;animation:pulse 1.2s ease-in-out infinite;}
.dot:nth-child(2){animation-delay:.2s;}
.dot:nth-child(3){animation-delay:.4s;}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
.subnav{display:flex;gap:4px;padding:10px 12px 0;border-bottom:1px solid #1E2D42;background:#0F1520;flex-shrink:0;overflow-x:auto;}
.subnav::-webkit-scrollbar{display:none;}
.snbtn{padding:6px 11px;border-radius:7px;border:none;background:transparent;color:#5B7087;font-family:Inter,sans-serif;font-weight:600;font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.snbtn.on{background:#B5FF4D;color:#080C12;}
.tip{display:inline-flex;align-items:center;gap:4px;cursor:pointer;}
.tip-icon{width:14px;height:14px;border-radius:50%;background:#1E2D42;color:#5B7087;font-size:9px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
.tip-popup{background:#0F1520;border:1px solid #B5FF4D44;border-radius:10px;padding:12px;margin-top:6px;font-size:12px;color:#A0B4C8;line-height:1.6;animation:slideup .2s ease;}
.learn-card{background:#141B27;border:1px solid #1E2D42;border-radius:14px;padding:18px;margin-bottom:10px;cursor:pointer;transition:all .2s;}
.learn-card:hover{border-color:#B5FF4D44;}
.learn-card.done{border-color:#3FB95044;background:#0F1A14;}
.lesson-screen{position:fixed;inset:0;background:#080C12;z-index:300;display:flex;flex-direction:column;padding:0;max-width:430px;margin:0 auto;overflow:hidden;}
.lesson-content{flex:1;overflow-y:auto;padding:24px 20px;}
.lesson-content::-webkit-scrollbar{display:none;}
.quiz-opt{padding:13px;border:1px solid #1E2D42;border-radius:10px;margin-bottom:8px;cursor:pointer;font-size:13px;transition:all .15s;}
.quiz-opt:hover{border-color:#B5FF4D44;}
.quiz-opt.correct{background:#3FB95020;border-color:#3FB950;}
.quiz-opt.wrong{background:#FF5A5A20;border-color:#FF5A5A;}
.progress-steps{display:flex;gap:4px;padding:14px 20px;}
.ps{flex:1;height:3px;border-radius:2px;background:#1E2D42;transition:background .3s;}
.ps.on{background:#B5FF4D;}
.real-life{background:linear-gradient(135deg,#141B27,#1A1200);border:1px solid #FFD16630;border-radius:10px;padding:11px 13px;margin-top:8px;font-size:12px;color:#FFD166;line-height:1.5;}
.goal-bar{height:6px;border-radius:3px;overflow:hidden;background:#1E2D42;margin:7px 0 4px;}
.ring{position:relative;width:150px;height:150px;margin:0 auto 12px;}
select{font-size:16px!important;}
.rinv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Home:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Debt:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Plan:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Money:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>,
  Learn:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  Send:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Sync:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Lock:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Check:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Up:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Invest: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Health: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Worth:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Budget: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toggle({on,set}){return <button className="ttrk" style={{background:on?C.accent:C.border}} onClick={()=>set(!on)}><div className="ttmb" style={{left:on?22:3}}/></button>;}
function Confetti(){const dots=Array.from({length:30},(_,i)=>({id:i,x:Math.random()*100,delay:Math.random()*1.2,dur:1.4+Math.random(),color:[C.accent,C.yellow,C.blue,C.purple,C.red][i%5],size:5+Math.random()*7}));return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:499}}>{dots.map(d=><div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:0,width:d.size,height:d.size,borderRadius:2,background:d.color,animation:`fall ${d.dur}s ${d.delay}s linear forwards`}}/>)}</div>;}

// ── Tooltip / "What does this mean?" ─────────────────────────────────────────
function Tip({termKey, children}) {
  const [open, setOpen] = useState(false);
  const term = TERMS[termKey];
  if(!term) return <span>{children}</span>;
  return (
    <span>
      <span className="tip" onClick={()=>setOpen(v=>!v)}>
        <span>{children || term.plain}</span>
        <span className="tip-icon">?</span>
      </span>
      {open && (
        <div className="tip-popup">
          <div style={{fontWeight:700,fontSize:12,color:C.text,marginBottom:5}}>{term.word}</div>
          {term.explain}
        </div>
      )}
    </span>
  );
}

// ── Gauge ─────────────────────────────────────────────────────────────────────
function Gauge({pct:p}){
  const r=66,cx=82,cy=74,toR=d=>d*Math.PI/180,a=Math.min(p||0,1)*180;
  const ax=cx+r*Math.cos(toR(180-a)),ay=cy-r*Math.sin(toR(180-a));
  const color=(p||0)>.7?C.red:(p||0)>.4?C.yellow:C.success;
  const arc=(f,t,c)=>{const x1=cx+r*Math.cos(toR(180-f)),y1=cy-r*Math.sin(toR(180-f)),x2=cx+r*Math.cos(toR(180-t)),y2=cy-r*Math.sin(toR(180-t));return <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={c} strokeWidth="8" strokeLinecap="butt"/>;};
  return (
    <div style={{position:"relative",width:164,height:86,margin:"0 auto 4px"}}>
      <svg width="164" height="86" viewBox="0 0 164 86">
        {arc(0,60,C.success+"40")}{arc(60,120,C.yellow+"40")}{arc(120,180,C.red+"40")}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${ax} ${ay}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={C.text} strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
        <circle cx={cx} cy={cy} r="4" fill={C.text}/>
      </svg>
      <div style={{position:"absolute",bottom:0,left:0,right:0,textAlign:"center"}}>
        <div className="mono" style={{fontSize:19,fontWeight:500,color}}>{Math.round((1-(p||0))*100)}%</div>
        <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>paid off</div>
      </div>
    </div>
  );
}

function ScoreRing({score}){
  const r=58,cx=75,cy=75,circ=2*Math.PI*r,p=(score-300)/550,dash=circ*p;
  const color=score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red;
  const band=score>=740?"Excellent":score>=670?"Good":score>=580?"Fair":"Poor";
  return (
    <div className="ring">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="9"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="9" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{transition:"stroke-dasharray 1s ease"}}/>
      </svg>
      <div className="rinv">
        <div className="mono" style={{fontSize:30,fontWeight:500,color,lineHeight:1}}>{score}</div>
        <div style={{fontSize:10,color,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginTop:3}}>{band}</div>
      </div>
    </div>
  );
}

// ── Health score calc ─────────────────────────────────────────────────────────
function calcHealth({debts,score,assets,income,efund}){
  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const totalAssets=assets.reduce((s,a)=>s+a.value,0);
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const dti=income>0?mins/income:0;
  const highRate=debts.length>0?Math.max(...debts.map(d=>d.rate)):0;
  const efGoal=income*3;
  const efPct=efGoal>0?Math.min(efund/efGoal,1):0;
  const netWorth=totalAssets-totalDebt;
  const safeScore=isFinite(score)&&score>=300&&score<=850?score:300;
  const factors=[
    {l:"Credit score",w:25,v:safeScore>=740?100:safeScore>=670?75:safeScore>=580?50:25,c:safeScore>=740?C.success:safeScore>=670?C.accent:safeScore>=580?C.yellow:C.red},
    {l:"Debt-to-income",w:25,v:dti<.15?100:dti<.3?70:dti<.4?40:10,c:dti<.15?C.success:dti<.3?C.accent:dti<.4?C.yellow:C.red},
    {l:"Emergency fund",w:20,v:Math.round(efPct*100),c:efPct>=1?C.success:efPct>=.5?C.yellow:C.red},
    {l:"Interest rates",w:15,v:highRate===0?100:highRate<7?80:highRate<15?50:20,c:highRate<7?C.success:highRate<15?C.yellow:C.red},
    {l:"Net worth",w:15,v:isFinite(netWorth)?(netWorth>=0?Math.min(100,50+netWorth/500):10):10,c:netWorth>=0?C.success:C.red},
  ];
  const overall=Math.round(factors.reduce((s,f)=>s+(f.v*f.w/100),0));
  const label=overall>=80?"Excellent":overall>=65?"Good":overall>=45?"Fair":"Needs work";
  const color=overall>=80?C.success:overall>=65?C.accent:overall>=45?C.yellow:C.red;
  return{overall,label,color,factors};
}

// ── ONBOARDING ─────────────────────────────────────────────────────────────────
function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  // Prevent browser zoom on input focus
  useEffect(()=>{ const m=document.querySelector("meta[name=viewport]"); if(m) m.content="width=device-width,initial-scale=1,maximum-scale=1"; },[]);
  const [name,setName]=useState("");
  const [hasDebts,setHasDebts]=useState(null);
  const [hasJob,setHasJob]=useState(null);
  const [income,setIncome]=useState("");

  const maxStep=hasDebts?4:4;
  const next=()=>{
    if(step===0&&!name.trim())return;
    if(step<maxStep)setStep(s=>s+1);
    else{
      const debt=firstDebt.name&&firstDebt.balance?[{id:Date.now(),name:firstDebt.name,balance:parseFloat(firstDebt.balance)||0,original:parseFloat(firstDebt.balance)||0,rate:parseFloat(firstDebt.rate)||0,min:parseFloat(firstDebt.min)||0,type:firstDebt.type,color:{credit:C.red,student:C.blue,auto:C.yellow,personal:C.blue}[firstDebt.type]||C.blue}]:[];
      onDone({name,hasDebts,hasJob,income:parseFloat(income)||0,firstDebt:debt});
    }
  };

  return (
    <div className="ob" style={{background:C.bg}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div className="logo">money<span style={{color:C.accent}}>code</span></div>
        {step>0&&<button className="btn bg bsm" onClick={()=>setStep(s=>s-1)}>← Back</button>}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:28}}>
        {[0,1,2,3,4].map(i=><div key={i} className={`opip${i<=step?" on":""}`}/>)}
      </div>

      {step===0&&<>
        <div style={{fontSize:40,marginBottom:12}}>👋</div>
        <div style={{fontSize:24,fontWeight:800,marginBottom:6,lineHeight:1.2}}>What's your name?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.6}}>Moneycode teaches you how money actually works — while helping you fix yours.</div>
        <div className="fld"><input className="inp" placeholder="First name" value={name} onChange={e=>setName(e.target.value)} style={{fontSize:18,padding:"13px 14px"}}/></div>
        <button className="btn bp bfull" style={{padding:14,fontSize:15,marginTop:6}} disabled={!name.trim()} onClick={next}>Let's go →</button>
      </>}

      {step===1&&<>
        <div style={{fontSize:40,marginBottom:12}}>💳</div>
        <div style={{fontSize:24,fontWeight:800,marginBottom:6}}>Do you have any debt, {name}?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.6}}>Credit cards, student loans, car payments — anything you owe money on counts.</div>
        {[
          {id:true,  e:"✅", l:"Yes — I owe money on something", s:"Credit card, student loan, car payment, etc."},
          {id:false, e:"🙌", l:"No debt yet",                   s:"Great starting point — let's keep it that way"},
        ].map(o=>(
          <div key={String(o.id)} className={`oopt${hasDebts===o.id?" on":""}`} onClick={()=>setHasDebts(o.id)}>
            <span style={{fontSize:20,width:28}}>{o.e}</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{o.l}</div><div style={{fontSize:12,color:C.muted,marginTop:1}}>{o.s}</div></div>
            {hasDebts===o.id&&<I.Check/>}
          </div>
        ))}
        <button className="btn bp bfull" style={{padding:13,marginTop:12}} disabled={hasDebts===null} onClick={next}>Continue →</button>
      </>}

      {step===2&&<>
        <div style={{fontSize:40,marginBottom:12}}>💼</div>
        <div style={{fontSize:24,fontWeight:800,marginBottom:6}}>Do you have a job?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.6}}>Any income counts — full-time, part-time, gig work, even occasional cash jobs.</div>
        {[
          {id:"yes",      e:"💰", l:"Yes, I earn money regularly",  s:"Full-time, part-time, or gig work"},
          {id:"sometimes",e:"📊", l:"Sometimes — it varies",        s:"Freelance, seasonal, or irregular income"},
          {id:"no",       e:"🎓", l:"Not right now",                s:"Student, between jobs, or just starting out"},
        ].map(o=>(
          <div key={o.id} className={`oopt${hasJob===o.id?" on":""}`} onClick={()=>setHasJob(o.id)}>
            <span style={{fontSize:20,width:28}}>{o.e}</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{o.l}</div><div style={{fontSize:12,color:C.muted,marginTop:1}}>{o.s}</div></div>
            {hasJob===o.id&&<I.Check/>}
          </div>
        ))}
        <button className="btn bp bfull" style={{padding:13,marginTop:12}} disabled={!hasJob} onClick={next}>Continue →</button>
      </>}

      {step===3&&<>
        <div style={{fontSize:40,marginBottom:12}}>📊</div>
        <div style={{fontSize:24,fontWeight:800,marginBottom:6}}>How much do you take home each month?</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:8,lineHeight:1.6}}>After taxes. This helps us figure out how much of your income goes to debt payments.</div>
        <div className="card" style={{borderColor:C.blue+"40",marginBottom:16,padding:12}}>
          <div style={{fontSize:12,color:C.blue,fontWeight:600,marginBottom:4}}>💡 Why does this matter?</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Experts say debt payments should be under 20% of your take-home pay. We'll show you exactly where you stand.</div>
        </div>
        <div className="fld" style={{position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:15}}>$</span>
          <input className="inp mono" type="number" placeholder="e.g. 1800" value={income} onChange={e=>setIncome(e.target.value)} style={{paddingLeft:24,fontSize:19,padding:"12px 12px 12px 24px"}}/>
        </div>
        {hasJob==="no"&&<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Enter 0 if you don't have income right now — that's okay.</div>}
        <button className="btn bp bfull" style={{padding:13}} onClick={next}>
          {income?"Build my plan →":"Skip for now"}
        </button>
      </>}
    </div>
  );
}

// ── LEARN TAB ─────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id:"credit-cards",
    emoji:"💳",
    title:"How credit cards actually work",
    subtitle:"Why they're dangerous — and how to use them right",
    duration:"2 min",
    color:C.red,
    steps:[
      {
        type:"explain",
        heading:"A credit card is a short-term loan",
        body:"When you swipe your credit card, you're not spending your own money. You're borrowing the bank's money and promising to pay it back.\n\nThe bank makes money by charging you interest if you don't pay the full balance every month.",
        realLife:"🛒 You buy $100 of groceries on a credit card. If you pay it off this month: costs $100. If you carry it for a year at 25% APR: costs $125.",
      },
      {
        type:"explain",
        heading:"The minimum payment trap",
        body:"Banks set the minimum payment low on purpose. It keeps you in debt longer — which means more interest for them.\n\nOn a $1,000 balance at 25% APR, paying only the minimum ($25/month) takes over 5 years to pay off. You'd pay $800+ in interest on top of the $1,000 you borrowed.",
        realLife:"⚠️ Minimum payment on a $1,000 credit card = paying for 5 years instead of 3 months if you paid it off fully.",
      },
      {
        type:"explain",
        heading:"The right way to use a credit card",
        body:"Used correctly, credit cards are powerful tools:\n• Build your credit score (which saves you money later)\n• Get cashback and rewards\n• Fraud protection\n\nThe rule: only charge what you can pay off IN FULL every month. Treat it like a debit card.",
        realLife:"✅ Pay your full balance every month → zero interest, free rewards, building credit. It's genuinely free money if you're disciplined.",
      },
      {
        type:"quiz",
        question:"You have a $500 credit card balance at 20% APR. You only pay the $15 minimum each month. What happens?",
        options:["You pay it off in about 4 months","You pay it off eventually but it costs you way more than $500 total","The bank forgives the rest after a year","Your balance stays the same"],
        correct:1,
        explanation:"Paying only minimums on a $500 balance at 20% APR takes 4+ years and costs you nearly $350 in interest. You'd pay $850 for $500 worth of stuff.",
      },
    ],
  },
  {
    id:"interest-explained",
    emoji:"📈",
    title:"Why interest is the most important number",
    subtitle:"How compound interest works for and against you",
    duration:"2 min",
    color:C.yellow,
    steps:[
      {
        type:"explain",
        heading:"Interest works 24/7",
        body:"Interest never sleeps. Every single day, your debt is growing — even while you sleep, eat, and hang out with friends.\n\nMost credit cards charge daily. They take your annual rate (APR), divide by 365, and apply it to your balance every day.",
        realLife:"😴 A $3,000 credit card at 24% APR charges you about $2 per day in interest. That's $60/month just to stay in place.",
      },
      {
        type:"explain",
        heading:"Compound interest — the double-edged sword",
        body:"When you carry debt, interest gets added to your balance. Then you pay interest on THAT interest. It compounds against you.\n\nBut the same math works in your favor with investments. $100/month invested at 10% for 40 years becomes over $500,000.",
        realLife:"🔄 $5,000 in credit card debt at 20% APR that you only pay minimums on: becomes $8,000+ in 5 years. Same math — $5,000 invested: becomes $8,000+ in 5 years.",
      },
      {
        type:"quiz",
        question:"Your APR is 24%. Roughly how much interest do you pay per day on a $1,000 balance?",
        options:["About $0.07/day","About $0.66/day","About $2.40/day","About $6.60/day"],
        correct:1,
        explanation:"24% APR ÷ 365 days = 0.066% per day. On $1,000 that's about $0.66/day, or about $20/month. Doesn't sound like much — but multiply by a $5,000 balance and it's $100/month just in interest.",
      },
    ],
  },
  {
    id:"credit-score",
    emoji:"⭐",
    title:"Your credit score — and why it costs real money",
    subtitle:"What it is, what affects it, and why you should care",
    duration:"2 min",
    color:C.accent,
    steps:[
      {
        type:"explain",
        heading:"Your credit score is your money reputation",
        body:"Banks, landlords, and even some employers check your credit score. It's a number from 300–850 that signals how reliably you pay back money.\n\nHigher score = you're seen as lower risk = you get better deals on loans, credit cards, and even insurance.",
        realLife:"🏠 Renting your first apartment? Many landlords require a minimum credit score. No score or bad score = no apartment, or a larger deposit required.",
      },
      {
        type:"explain",
        heading:"What affects your score — in order of importance",
        body:"1. Payment history (35%) — pay on time, every time\n2. Credit utilization (30%) — keep usage under 10% of your limit\n3. Length of credit history (15%) — older accounts help\n4. Credit mix (10%) — different types of credit\n5. New inquiries (10%) — applying for new credit hurts temporarily",
        realLife:"💡 The two biggest factors (payment history + utilization) are totally within your control. Pay on time and keep balances low.",
      },
      {
        type:"quiz",
        question:"Which action has the BIGGEST positive impact on your credit score over time?",
        options:["Applying for more credit cards","Paying every bill on time, every month","Checking your score frequently","Closing old accounts you don't use"],
        correct:1,
        explanation:"Payment history is 35% of your score — the single biggest factor. One missed payment can drop your score 50–100 points. Pay on time, every time, even if it's just the minimum.",
      },
    ],
  },
  {
    id:"debt-payoff",
    emoji:"🎯",
    title:"The smartest way to pay off debt",
    subtitle:"Avalanche vs. snowball — and why it matters",
    duration:"2 min",
    color:C.blue,
    steps:[
      {
        type:"explain",
        heading:"Not all debt is equal",
        body:"Your student loan at 5% and your credit card at 25% are completely different problems. The credit card is costing you 5x more per dollar every year.\n\nThis is why the order you pay off debt matters — a lot.",
        realLife:"📊 $5,000 in student loans at 5% costs $250/year in interest. $5,000 on a credit card at 25% costs $1,250/year. Same balance — 5x the cost.",
      },
      {
        type:"explain",
        heading:"Two strategies — pick what works for you",
        body:"Avalanche: Pay minimums on everything, throw all extra money at the highest interest rate debt first. Saves the most money mathematically.\n\nSnowball: Pay minimums on everything, throw all extra money at the smallest balance first. Pay it off completely, then roll that payment to the next one.\n\nAvalanche wins with math. Snowball wins with motivation.",
        realLife:"🏔️ Avalanche saves more money. ☃️ Snowball wins psychologically — quick wins keep you going. Either beats paying minimums only.",
      },
      {
        type:"quiz",
        question:"You have 3 debts: $500 at 5%, $2,000 at 20%, $800 at 12%. Using the Avalanche method, which do you attack first?",
        options:["The $500 one — smallest balance","The $2,000 one — highest interest rate","The $800 one — middle ground","Pay them all equally"],
        correct:1,
        explanation:"Avalanche = attack highest interest rate first. The $2,000 at 20% is costing you the most per day. Killing it first saves the most money overall.",
      },
    ],
  },
  {
    id:"emergency-fund",
    emoji:"🛡️",
    title:"Why you need an emergency fund first",
    subtitle:"The financial safety net that changes everything",
    duration:"1 min",
    color:C.success,
    steps:[
      {
        type:"explain",
        heading:"Without an emergency fund, everything goes on a credit card",
        body:"Car breaks down: $800. Medical bill: $400. Phone dies: $600.\n\nWithout cash saved, every emergency becomes credit card debt at 20%+ interest. You're paying a premium for being unprepared.\n\nAn emergency fund breaks this cycle.",
        realLife:"🚗 Car repair costs $800. With an emergency fund: you pay $800. Without one: $800 on a credit card = could cost $1,000+ by the time you pay it off.",
      },
      {
        type:"explain",
        heading:"How much do you actually need?",
        body:"The standard advice is 3–6 months of expenses. But starting is what matters — even $500 changes your relationship with unexpected costs.\n\nStart with a goal of $500 in a high-yield savings account (HYSA). Then build to 1 month. Then 3.",
        realLife:"💧 A high-yield savings account (HYSA) pays 4–5% APY right now — about 10x more than a regular savings account. Your emergency fund should be in one.",
      },
      {
        type:"quiz",
        question:"What's the best place to keep your emergency fund?",
        options:["Under your mattress","A regular checking account","A high-yield savings account (HYSA)","Invested in the stock market"],
        correct:2,
        explanation:"A HYSA pays 4–5% APY and is FDIC insured. The stock market is too risky for emergency funds (could be down when you need it). Regular savings pays almost nothing.",
      },
    ],
  },
  {
    id:"investing-basics",
    emoji:"💹",
    title:"When and how to start investing",
    subtitle:"The basics that school never taught you",
    duration:"2 min",
    color:C.purple,
    steps:[
      {
        type:"explain",
        heading:"Pay off high-interest debt before investing",
        body:"If your credit card charges 20% interest and stocks return ~10% per year, paying off the credit card is a guaranteed 20% return. Investing while carrying high-interest debt is mathematically backwards.\n\nRule of thumb: pay off anything above 7% APR before investing beyond your 401k match.",
        realLife:"🧮 Paying off a 20% APR credit card = 20% guaranteed return. S&P 500 average = ~10%/yr. Pay the card first.",
      },
      {
        type:"explain",
        heading:"The 401k match is always free money",
        body:"If your employer matches your 401k contributions, that's an instant 50–100% return. Nothing beats it.\n\nExample: You contribute $100. Employer matches $100. You now have $200 invested. That's a 100% return before the market does anything.\n\nAlways contribute at least enough to get the full match.",
        realLife:"🎁 Employer 401k match = the only guaranteed 100% return in personal finance. If you're not getting the full match, you're leaving free money on the table.",
      },
      {
        type:"quiz",
        question:"You have a credit card at 22% APR and your employer matches 401k contributions 100%. What should you do?",
        options:["Only pay credit card minimums and max out 401k","Contribute enough to 401k to get the full match, then attack the credit card","Ignore the 401k until the credit card is paid off","Invest everything in crypto"],
        correct:1,
        explanation:"The 401k match is a 100% instant return — nothing beats it. Get the full match first (that's your priority), then throw everything at the 22% credit card. The card is costing more than any investment will earn.",
      },
    ],
  },
];

// ── Lesson Screen ─────────────────────────────────────────────────────────────
function LessonScreen({lesson, onClose, onComplete}){
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const s=lesson.steps[step];
  const isLast=step===lesson.steps.length-1;

  const next=()=>{
    if(s.type==="quiz"&&!revealed)return;
    if(isLast){onComplete(lesson.id);onClose();}
    else{setStep(v=>v+1);setSelected(null);setRevealed(false);}
  };

  return (
    <div className="lesson-screen">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
        <button className="btn bg bsm bico" onClick={onClose} style={{padding:"6px 10px",fontSize:13}}>✕</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14}}>{lesson.title}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>Step {step+1} of {lesson.steps.length}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-steps">
        {lesson.steps.map((_,i)=><div key={i} className={`ps${i<=step?" on":""}`}/>)}
      </div>

      {/* Content */}
      <div className="lesson-content">
        {s.type==="explain"&&<>
          <div style={{fontSize:11,color:lesson.color,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Lesson</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:14,lineHeight:1.3}}>{s.heading}</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.8,whiteSpace:"pre-line",marginBottom:16}}>{s.body}</div>
          {s.realLife&&<div className="real-life">{s.realLife}</div>}
        </>}

        {s.type==="quiz"&&<>
          <div style={{fontSize:11,color:C.yellow,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Quick check</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:16,lineHeight:1.4}}>{s.question}</div>
          {s.options.map((o,i)=>(
            <div key={i}
              className={`quiz-opt${selected===i?(i===s.correct?" correct":" wrong"):""}`}
              onClick={()=>{if(revealed)return;setSelected(i);setRevealed(true);}}
              style={{pointerEvents:revealed?"none":"auto"}}
            >
              {revealed&&i===s.correct&&<span style={{color:C.success,marginRight:8}}>✓</span>}
              {revealed&&selected===i&&i!==s.correct&&<span style={{color:C.red,marginRight:8}}>✗</span>}
              {o}
            </div>
          ))}
          {revealed&&<div style={{marginTop:14,padding:"12px 14px",background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,color:C.muted,lineHeight:1.6}}>
            <div style={{fontWeight:700,color:selected===s.correct?C.success:C.red,marginBottom:6}}>{selected===s.correct?"✓ Correct!":"✗ Not quite"}</div>
            {s.explanation}
          </div>}
        </>}
      </div>

      {/* Next button */}
      <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
        <button
          className="btn bp bfull"
          style={{padding:13,fontSize:14,opacity:(s.type==="quiz"&&!revealed)?0.4:1}}
          onClick={next}
          disabled={s.type==="quiz"&&!revealed}
        >
          {isLast?"Complete lesson ✓":"Next →"}
        </button>
        {s.type==="quiz"&&!revealed&&<div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:8}}>Choose an answer to continue</div>}
      </div>
    </div>
  );
}

// ── LEARN TAB ─────────────────────────────────────────────────────────────────
function LearnTab({completedLessons, onComplete, onOpenLesson}){
  const done = completedLessons.length;
  const total = LESSONS.length;

  return (
    <div className="scroll">
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>Money 101</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:12}}>Short lessons that teach you what school never did. Each one takes 1–2 minutes.</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:C.accent,borderRadius:3,width:`${(done/total)*100}%`,transition:"width .5s ease"}}/></div>
          <span style={{fontSize:11,color:C.muted,fontWeight:600,flexShrink:0}}>{done}/{total} done</span>
        </div>
      </div>

      {done===total&&<div className="card" style={{borderColor:C.accent+"44",background:"linear-gradient(135deg,#141B27,#0F1A0F)",marginBottom:14,textAlign:"center",padding:20}}>
        <div style={{fontSize:36,marginBottom:8}}>🎓</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>You've completed Money 101</div>
        <div style={{fontSize:12,color:C.muted}}>You now know more about personal finance than most adults. Use the other tabs to put it into practice.</div>
      </div>}

      {LESSONS.map(lesson=>{
        const isDone=completedLessons.includes(lesson.id);
        return(
          <div key={lesson.id} className={`learn-card${isDone?" done":""}`} onClick={()=>onOpenLesson(lesson)}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{lesson.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:14,lineHeight:1.3,flex:1,marginRight:8}}>{lesson.title}</div>
                  {isDone
                    ?<span className="tag tg" style={{flexShrink:0}}>Done ✓</span>
                    :<span style={{fontSize:10,color:C.muted,flexShrink:0,marginTop:2}}>{lesson.duration}</span>
                  }
                </div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{lesson.subtitle}</div>
                {!isDone&&<div style={{marginTop:10,display:"flex",gap:4}}>
                  {lesson.steps.map((_,i)=><div key={i} style={{width:20,height:3,borderRadius:2,background:C.border}}/>)}
                </div>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Glossary */}
      <p className="lbl" style={{marginTop:6}}>Glossary — tap any term to learn what it means</p>
      <div className="card">
        {Object.entries(TERMS).map(([key,term],i)=>(
          <div key={key} style={{padding:"9px 0",borderBottom:i<Object.keys(TERMS).length-1?`1px solid ${C.border}`:"none"}}>
            <Tip termKey={key}><span style={{fontWeight:600,fontSize:13}}>{term.word}</span></Tip>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{term.plain}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────────
function HomeTab({debts,isPlus,onSync,onUpgrade,onCelebrate,name,onAddDebt,score,assets,income,efund,onOpenManage,onShowCert}){
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const orig=debts.reduce((s,d)=>s+d.original,0);
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const intMo=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12),0);
  const p=orig>0?total/orig:0;
  const mo=mins>0?Math.min(Math.ceil(total/(mins*1.3)),600):0;
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const health=calcHealth({debts,score,assets,income,efund});
  const intPerDay=intMo/30;
  const coffeePerDay=(intPerDay/5).toFixed(1);
  const MS=[
    {e:"🎉",t:"First $1,000 paid",s:"You started — that's the hardest part.",ok:(orig-total)>=1000},
    {e:"🔥",t:"25% cleared",s:"One quarter gone.",ok:p<=.75&&orig>0},
    {e:"⚡",t:"Halfway there",s:fmt(orig*.5)+" down.",ok:p<=.5&&orig>0},
    {e:"🏁",t:"Final stretch",s:"Under 25% left.",ok:p<=.25&&orig>0},
  ];
  const done=MS.filter(m=>m.ok);

  if(debts.length===0) return (
    <div className="scroll">
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:4}}>{greet}{name?`, ${name}`:""} 👋</div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:6,lineHeight:1.2}}>Let's see your full financial picture</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Add what you owe to get started. It takes 2 minutes.</div>
      </div>
      <div className="card" style={{borderColor:C.accent+"40",textAlign:"center",padding:24,marginBottom:10}}>
        <div style={{fontSize:36,marginBottom:8}}>💳</div>
        <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>No debts added yet</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.5}}>Add your credit cards, student loans, and car payments to see what they're really costing you.</div>
        <button className="btn bp bfull" onClick={onAddDebt}>+ Add your first debt</button>
      </div>
      <div className="card" style={{borderColor:C.blue+"40",marginBottom:10}}>
        <div style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>💡 Did you know?</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>The average American pays <span style={{color:C.red,fontWeight:600}}>$1,000+ per year</span> in credit card interest alone. Most people have no idea how much debt is actually costing them.</div>
      </div>
      <div className="card"><div className="lbl">What you'll see when you add debts</div>{[["📊","How much debt costs you per day"],["🎯","Your exact debt-free date"],["💡","The fastest way to pay it off"],["🏆","Milestones to celebrate"],["❤️","Your Financial Health Score"]].map(([e,t],i)=><div key={i} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}><span style={{fontSize:16}}>{e}</span><div style={{fontSize:12,color:C.muted,alignSelf:"center"}}>{t}</div></div>)}</div>
    </div>
  );

  return (
    <div className="scroll">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:4}}>{greet}{name?`, ${name}`:""} 👋</div>

        {/* The one key number */}
        <div style={{background:"linear-gradient(135deg,#141B27,#0F1520)",border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:10}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>You owe</div>
          <div className="mono" style={{fontSize:34,fontWeight:500,letterSpacing:"-.02em",lineHeight:1,color:C.text}}>{fmt(total)}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:5,marginBottom:12}}>{fmt(orig-total)} paid off so far · {Math.round((1-p)*100)}% to go</div>
          {intPerDay>0&&<div style={{padding:"10px 12px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>
              This debt costs you <span style={{color:C.red,fontWeight:700}}>{fmt(intPerDay)}/day</span> in interest.
              {parseFloat(coffeePerDay)>=1&&<span style={{color:C.muted}}> That's {coffeePerDay} coffees a day just to stay in place.</span>}
            </div>
            {mo>0&&<div style={{fontSize:12,color:C.muted,marginTop:5}}>
              At current pace, you'll be debt-free by <span style={{color:C.accent,fontWeight:700}}>{toDate(mo)}</span>.
              {income>0&&mo<600&&<span> Pay <span style={{color:C.success,fontWeight:600}}>{fmt(Math.round(income*.05))}</span> extra/mo → <span style={{color:C.success}}>{toDate(Math.round(mo*.8))}</span>.</span>}
            </div>}
          </div>}
        </div>
      </div>

      <Gauge pct={p}/>

      <div className="chips" style={{marginTop:10}}>
        <div className="chip">
          <div className="cv mono" style={{color:C.yellow}}>{fmt(mins)}</div>
          <div className="cl">min. payments/mo</div>
        </div>
        <div className="chip">
          <div className="cv mono" style={{color:C.red}}>{fmt(intMo)}</div>
          <div className="cl"><Tip termKey="apr">interest/mo</Tip></div>
        </div>
        <div className="chip">
          <div className="cv mono" style={{color:C.accent}}>{mo>0?`${mo}mo`:"—"}</div>
          <div className="cl">to debt-free</div>
        </div>
      </div>

      {/* Health mini */}
      <div className="card" style={{marginBottom:10,borderColor:health.color+"44"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>Financial Health</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>{health.label} — {health.overall}/100</div>
          </div>
          <div className="mono" style={{fontSize:28,fontWeight:500,color:health.color}}>{health.overall}</div>
        </div>
        <div className="pbar"><div className="pfill" style={{width:`${health.overall}%`,background:health.color}}/></div>
      </div>

      {/* Freedom date */}
      {isPlus?(
        <div className="fhero">
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Your Freedom Date</div>
          <div className="fdate">{mo>0?toDate(mo):"Add debts to calculate"}</div>
          <div style={{fontSize:11,color:C.muted}}>the month you make your last debt payment</div>
          <button className="btn bg bsm" style={{marginTop:9}} onClick={onSync}><I.Sync/>Sync balances</button>
        </div>
      ):(
        <div style={{position:"relative",marginBottom:10}}>
          <div style={{filter:"blur(4px)",userSelect:"none",pointerEvents:"none"}}>
            <div className="fhero"><div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase"}}>Your Freedom Date</div><div className="fdate">March 2028</div></div>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7}}>
            <I.Lock/>
            <div style={{fontWeight:700,fontSize:13}}>Freedom Date — Plus only</div>
            <button className="btn bplus bsm" onClick={onUpgrade}>Unlock — $6.99/mo</button>
          </div>
        </div>
      )}

      {/* Your next move */}
      {debts.length>0&&(()=>{
        const highRate=debts.length>0?[...debts].sort((a,b)=>b.rate-a.rate)[0]:null;
        const cards=debts.filter(d=>d.type==="credit");
        const lim=cards.reduce((s,d)=>s+d.original,0);
        const bal=cards.reduce((s,d)=>s+d.balance,0);
        const util=lim>0?(bal/lim)*100:0;
        const efGoal=income*3;
        const needsEfund=efund<500;
        const needsUtil=util>30;
        const move=needsEfund
          ?{icon:"🛡️",title:"Build your emergency fund first",body:`You have ${fmt(efund)} saved. Getting to $500 protects you from putting the next emergency on a credit card.`,action:"Set a savings goal",color:C.blue,tab:"manage",sub:"budget"}
          :needsUtil
          ?{icon:"💳",title:`Pay down your ${cards[0]?.name||"credit card"}`,body:`Your credit card usage is at ${Math.round(util)}% of your limit. Getting under 30% could improve your credit score this month.`,action:"See payoff plan",color:C.yellow,tab:"manage",sub:"plan"}
          :highRate&&highRate.rate>15
          ?{icon:"🔥",title:`Attack ${highRate.name}`,body:`At ${highRate.rate}% interest, this is costing you ${fmt(highRate.balance*highRate.rate/100/12)}/month just in interest. Put every extra dollar here.`,action:"See attack plan",color:C.red,tab:"manage",sub:"plan"}
          :{icon:"📈",title:"You're on track — keep going",body:`You've paid off ${fmt(debts.reduce((s,d)=>s+d.original,0)-debts.reduce((s,d)=>s+d.balance,0))} so far. Stay consistent and you'll be debt-free by ${toDate(income>0?Math.ceil(debts.reduce((s,d)=>s+d.balance,0)/(debts.reduce((s,d)=>s+d.min,0)*1.3)):0)}.`,action:"See full plan",color:C.success,tab:"manage",sub:"plan"};
        return(
          <div style={{marginBottom:12}}>
            <p className="lbl">Your next move</p>
            <div className="card" style={{borderColor:move.color+"44",background:`linear-gradient(135deg,#141B27,#0F1520)`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:24,flexShrink:0}}>{move.icon}</span>
                <div><div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{move.title}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{move.body}</div></div>
              </div>
              <button className="btn bp bfull bsm" onClick={()=>{onOpenManage();}}>{move.action} →</button>
            </div>
          </div>
        );
      })()}

      {/* Milestones */}
      <p className="lbl">Milestones</p>
      <div className="card">
        {MS.map((m,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 0",borderBottom:i<MS.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:16,opacity:m.ok?1:.22,marginTop:1}}>{m.e}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12,color:m.ok?C.text:C.muted}}>{m.t}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{m.s}</div></div>
            {m.ok&&<span className="tag tg">Done</span>}
          </div>
        ))}
      </div>
      {done.length>0&&<button className="btn bg bsm bfull" style={{marginTop:6}} onClick={()=>onCelebrate(done[done.length-1])}>🎉 Celebrate a milestone</button>}
      {debts.length>0&&debts.every(d=>d.balance<=0)&&<button className="btn bp bfull bsm" style={{marginTop:6}} onClick={onShowCert}>🏆 Get your debt-free certificate</button>}
    </div>
  );
}

// ── DEBTS TAB ─────────────────────────────────────────────────────────────────
function DebtsTab({debts,setDebts,openModal,pop,onEdit}){
  const [sort,setSort]=useState("rate");
  const TM={student:"tb",auto:"ty",credit:"tr",personal:"tb",medical:"tp",imported:"tb"};
  const TL={student:"Student loan",auto:"Auto loan",credit:"Credit card",personal:"Personal loan",medical:"Medical debt",imported:"Imported"};
  const sorted=[...debts].sort((a,b)=>sort==="rate"?b.rate-a.rate:sort==="balance"?b.balance-a.balance:a.min-b.min);

  return (
    <div className="scroll">
      <div style={{marginBottom:12}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:10,lineHeight:1.5}}>
          List everything you owe. Being honest here is the first step to fixing it.
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="btn bp bsm" onClick={()=>openModal("add")}><I.Plus/>Add debt</button>
          <button className="btn bg bsm" onClick={()=>openModal("import")}><I.Up/>Import CSV</button>
        </div>
      </div>

      <div style={{display:"flex",gap:5,marginBottom:10}}>
        <div style={{fontSize:10,color:C.muted,alignSelf:"center",marginRight:2}}>Sort:</div>
        {[["rate","Highest interest"],["balance","Largest balance"],["min","Min payment"]].map(([s,l])=>(
          <button key={s} className={`btn bsm ${sort===s?"bp":"bg"}`} onClick={()=>setSort(s)}>{l}</button>
        ))}
      </div>

      {debts.length===0?(
        <div className="card" style={{textAlign:"center",padding:26}}>
          <div style={{fontSize:32,marginBottom:8}}>💳</div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>No debts added yet</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Add your credit cards, loans, and anything else you owe money on.</div>
          <button className="btn bp bfull" onClick={()=>openModal("add")}>+ Add your first debt</button>
        </div>
      ):(
        <div className="card">
          {sorted.map(d=>{
            const paid=d.original>0?1-(d.balance/d.original):0;
            const intPerMo=d.balance*d.rate/100/12;
            return (
              <div key={d.id} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:2,display:"flex",alignItems:"center",gap:5}}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                      <span className={`tag ${TM[d.type]||"tb"}`}>{TL[d.type]||"Debt"}</span>
                    </div>
                    <div style={{fontSize:11,color:C.muted}}>
                      <Tip termKey="apr">{d.rate}% APR</Tip>
                      {" · "}
                      <Tip termKey="minimum">{fmtD(d.min)}/mo min</Tip>
                      {d.due?` · Due ${d.due}th`:""}
                    </div>
                    {intPerMo>0&&<div style={{fontSize:10,color:C.red,marginTop:3}}>Costs {fmtD(intPerMo)}/mo in interest</div>}
                  </div>
                  <div style={{textAlign:"right",marginLeft:8,flexShrink:0}}>
                    <div className="mono" style={{fontSize:13,fontWeight:500}}>{fmtD(d.balance)}</div>
                    <div style={{fontSize:10,color:C.muted}}>{Math.round(paid*100)}% paid</div>
                  </div>
                </div>
                <div className="pbar"><div className="pfill" style={{width:`${paid*100}%`,background:d.color}}/></div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:4}}>
                  <button style={{background:"none",border:"none",color:C.blue,cursor:"pointer",fontSize:10}} onClick={()=>onEdit(d)}>✎ edit</button>
                  <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:10}} onClick={()=>{setDebts(x=>x.filter(v=>v.id!==d.id));pop("Removed","✕");}}>✕ remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {debts.length>0&&(
        <div className="card" style={{borderColor:C.blue+"40",marginTop:4}}>
          <div style={{fontSize:11,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>💡 Quick tip</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>
            The debt sorted by "Highest interest" is costing you the most per day.
            {" "}<Tip termKey="avalanche">Paying that one off first saves the most money.</Tip>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PLAN TAB ──────────────────────────────────────────────────────────────────
function PlanTab({debts,isPlus,onUpgrade,income,setIncome}){
  const [extra,setExtra]=useState(50);
  const [strat,setStrat]=useState("avalanche");
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const mins=debts.reduce((s,d)=>s+d.min,0);
  const mo=mins+extra>0?Math.min(Math.ceil(total/(mins+extra)),600):0;
  const totI=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*mo),0);
  const dti=(income||0)>0?mins/(income||0):0;
  const moMin=mins>0?Math.min(Math.ceil(total/mins),600):0;
  const intMin=debts.reduce((s,d)=>s+(d.balance*d.rate/100/12*moMin),0);
  const saved=intMin-totI;
  const ord=strat==="avalanche"?[...debts].sort((a,b)=>b.rate-a.rate):[...debts].sort((a,b)=>a.balance-b.balance);

  return (
    <div className="scroll">
      <div style={{fontSize:13,color:C.muted,marginBottom:12,lineHeight:1.5}}>
        Your payoff plan. Even small extra payments make a huge difference.
      </div>

      {/* Extra payment */}
      <p className="lbl">How much extra can you pay each month?</p>
      <div className="card" style={{marginBottom:12}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:10,lineHeight:1.5}}>
          On top of your <Tip termKey="minimum">minimum payments</Tip> of {fmt(mins)}/mo. Even $25 extra helps.
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <span style={{fontSize:13,color:C.muted}}>+$</span>
          <input className="inp mono" type="number" value={extra} onChange={e=>setExtra(Math.max(0,parseInt(e.target.value)||0))} style={{flex:1}}/>
          <span style={{fontSize:13,color:C.muted}}>/mo extra</span>
        </div>
        <input className="sli" type="range" min="0" max="500" step="25" value={extra} onChange={e=>setExtra(parseInt(e.target.value))}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
          {[0,25,50,100,200].map(v=><button key={v} className={`btn bsm ${extra===v?"bp":"bg"}`} onClick={()=>setExtra(v)}>+{fmt(v)}</button>)}
        </div>
      </div>

      {/* Outcome */}
      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.accent}}>{mo>0?`${mo}mo`:"—"}</div><div className="cl">months to free</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.yellow}}>{fmt(mins+extra)}</div><div className="cl">total/mo</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(totI)}</div><div className="cl">total interest</div></div>
      </div>

      {isPlus&&mo>0&&<div className="fhero" style={{marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em"}}>Debt-free by</div>
        <div className="fdate">{toDate(mo)}</div>
        <div style={{fontSize:10,color:C.muted}}>paying {fmt(mins+extra)}/mo total</div>
      </div>}

      {/* Comparison */}
      <p className="lbl">Minimums only vs. your plan</p>
      <div className="card" style={{marginBottom:12}}>
        {[
          {l:"Paying minimums only",mo:moMin,int:intMin,color:C.red,tag:"Slowest"},
          {l:`Your plan (+${fmt(extra)}/mo)`,mo,int:totI,color:C.accent,tag:"Your plan"},
        ].map((r,i)=>(
          <div key={i} style={{padding:"10px 0",borderBottom:i===0?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <div>
                <div style={{fontWeight:600,fontSize:12}}>{r.l}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>{r.mo>0?`${r.mo} months`:"—"} · {fmt(r.int)} in interest</div>
              </div>
              <span className={`tag ${i===0?"tr":"tg"}`}>{r.tag}</span>
            </div>
            <div className="pbar"><div className="pfill" style={{width:moMin>0?`${Math.min((r.mo/moMin)*100,100)}%`:"10%",background:r.color}}/></div>
          </div>
        ))}
        {saved>100&&<div style={{marginTop:10,padding:"9px 11px",background:C.success+"12",borderRadius:8,border:`1px solid ${C.success}30`,fontSize:12,color:C.success,fontWeight:600}}>
          💡 Your plan saves you {fmt(saved)} in interest compared to paying minimums only
        </div>}
      </div>

      {/* Strategy */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <p className="lbl" style={{marginBottom:0}}>Attack order</p>
        <div style={{display:"flex",gap:6,fontSize:11}}>
          <Tip termKey="avalanche">What's avalanche?</Tip>
          {" · "}
          <Tip termKey="snowball">Snowball?</Tip>
        </div>
      </div>
      <div className="stog">
        <button className={`sbtn${strat==="avalanche"?" on":""}`} onClick={()=>setStrat("avalanche")}>⚡ Highest interest first — saves most</button>
        <button className={`sbtn${strat==="snowball"?" on":""}`} onClick={()=>setStrat("snowball")}>☃️ Smallest balance first — most motivating</button>
      </div>
      <div className="card" style={{marginBottom:12}}>
        {ord.length===0?<div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:12}}>Add debts to see your attack order</div>:ord.map((d,i)=>(
          <div key={d.id} style={{display:"flex",gap:9,alignItems:"center",padding:"9px 0",borderBottom:i<ord.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:i===0?C.accent:C.border,color:i===0?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:12}}>{d.name}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>{d.rate}% <Tip termKey="apr">APR</Tip> · {fmtD(d.balance)} left</div>
            </div>
            {i===0&&<span className="tag tg">Focus here first</span>}
          </div>
        ))}
      </div>

      {/* DTI */}
      {isPlus?(
        <><p className="lbl">How much of your income goes to debt?</p>
        <div className="card">
          <div style={{fontSize:12,color:C.muted,marginBottom:8,lineHeight:1.5}}>
            <Tip termKey="minimum">Debt payments</Tip> should be under 20% of take-home pay. What's yours?
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
            <span style={{fontSize:11,color:C.muted}}>Monthly take-home $</span>
            <input className="inp mono" type="number" value={income||""} onChange={e=>setIncome(parseFloat(e.target.value)||0)} placeholder="0" style={{width:110,padding:"6px 9px",fontSize:12}}/>
          </div>
          <div className="pbar" style={{marginBottom:6}}><div className="pfill" style={{width:`${Math.min(dti,1)*100}%`,background:dti>.4?C.red:dti>.2?C.yellow:C.success}}/></div>
          <div style={{fontSize:12}}>
            Debt payments = <span className="mono" style={{color:dti>.4?C.red:dti>.2?C.yellow:C.success,fontWeight:700}}>{Math.round(dti*100)}%</span> of your income
            {dti>.4&&<div style={{fontSize:11,color:C.red,marginTop:4}}>⚠️ That's high — over 40% of income to debt payments puts serious strain on your finances.</div>}
            {dti>.2&&dti<=.4&&<div style={{fontSize:11,color:C.yellow,marginTop:4}}>This is manageable but worth reducing. Ideal is under 20%.</div>}
            {dti<=.2&&dti>0&&<div style={{fontSize:11,color:C.success,marginTop:4}}>✓ Healthy range. Under 20% means debt isn't overwhelming your budget.</div>}
          </div>
        </div></>
      ):(
        <div style={{position:"relative"}}>
          <div style={{filter:"blur(3px)",pointerEvents:"none",userSelect:"none"}}>
            <p className="lbl">How much of your income goes to debt?</p>
            <div className="card"><div style={{height:56}}/></div>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <I.Lock/>
            <button className="btn bplus bsm" onClick={onUpgrade}>Unlock with Plus</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MONEY TAB (Net Worth + Budget + Invest) ───────────────────────────────────
function MoneyTab({debts,assets,setAssets,income,setIncome,efund,setEfund,isPlus,onUpgrade,pop}){
  const [sub,setSub]=useState("worth");
  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 14px 0",background:C.surface,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",gap:4,borderBottom:`1px solid ${C.border}`}}>
          {[{id:"worth",l:"Net Worth"},{id:"budget",l:"Budget"},{id:"invest",l:"Invest"}].map(s=>(
            <button key={s.id} className={`snbtn${sub===s.id?" on":""}`} onClick={()=>setSub(s.id)}>{s.l}</button>
          ))}
        </div>
      </div>
      <div>
        {sub==="worth" &&<WorthTab  debts={debts} assets={assets} setAssets={setAssets} pop={pop}/>}
        {sub==="budget"&&<BudgetTab income={income} setIncome={setIncome} efund={efund} setEfund={setEfund} debts={debts}/>}
        {sub==="invest"&&<InvestTab debts={debts} isPlus={isPlus} onUpgrade={onUpgrade}/>}
      </div>
    </div>
  );
}

// ── NET WORTH ─────────────────────────────────────────────────────────────────
function WorthTab({debts,assets,setAssets,pop}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",value:"",type:"Savings"});
  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const totalAssets=assets.reduce((s,a)=>s+a.value,0);
  const nw=totalAssets-totalDebt;
  const pos=nw>=0;
  const TYPES=["Savings","Checking","Retirement","Investment","Home","Vehicle","Other"];
  const add=()=>{
    if(!form.name||!form.value)return;
    const val=Math.abs(parseFloat(form.value)||0);
    if(!isFinite(val)||val<=0)return;
    setAssets(a=>[...a,{id:Date.now(),name:form.name,value:val,type:form.type,color:{Savings:C.blue,Checking:C.blue,Retirement:C.success,Investment:C.success,Home:C.purple,Vehicle:C.yellow,Other:C.muted}[form.type]||C.blue}]);
    setForm({name:"",value:"",type:"Savings"});setShowAdd(false);pop("Asset added");
  };
  const grouped=TYPES.filter(t=>assets.some(a=>a.type===t)).map(t=>({type:t,items:assets.filter(a=>a.type===t),total:assets.filter(a=>a.type===t).reduce((s,a)=>s+a.value,0)}));

  return(
    <div className="scroll">
      <div style={{fontSize:13,color:C.muted,marginBottom:10,lineHeight:1.5}}>
        <Tip termKey="netWorth">Net worth</Tip> = everything you own minus everything you owe. Even if it's negative right now, tracking it is powerful.
      </div>
      <div className="card" style={{textAlign:"center",padding:22,marginBottom:10,borderColor:(pos?C.success:C.red)+"44",background:`linear-gradient(135deg,#141B27,${pos?"#0F1A14":"#1A0F0F"})`}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Net Worth</div>
        <div className="mono" style={{fontSize:34,fontWeight:500,color:pos?C.success:C.red,letterSpacing:"-.02em"}}>{nw<0?"-":""}{fmt(Math.abs(nw))}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:5}}>{pos?"You own more than you owe ✓":"Keep going — every payment improves this number"}</div>
      </div>
      <div className="chips">
        <div className="chip"><div className="cv mono" style={{color:C.success}}>{fmt(totalAssets)}</div><div className="cl">what you own</div></div>
        <div className="chip"><div className="cv mono" style={{color:C.red}}>{fmt(totalDebt)}</div><div className="cl">what you owe</div></div>
      </div>
      {totalAssets+totalDebt>0&&<div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginBottom:5}}>
          <span>What you own {fmt(totalAssets)}</span>
          <span>What you owe {fmt(totalDebt)}</span>
        </div>
        <div style={{height:7,borderRadius:4,background:C.border,overflow:"hidden",display:"flex"}}>
          <div style={{height:"100%",background:C.success,width:`${(totalAssets/(totalAssets+totalDebt))*100}%`,transition:"width .6s ease"}}/>
          <div style={{height:"100%",background:C.red,flex:1}}/>
        </div>
        <div style={{fontSize:10,color:C.muted,marginTop:5,textAlign:"center"}}>Assets are {Math.round((totalAssets/(totalAssets+totalDebt))*100)}% of your total picture</div>
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p className="lbl" style={{marginBottom:0}}>What you own (assets)</p>
        <button className="btn bp bsm" onClick={()=>setShowAdd(v=>!v)}>+ Add</button>
      </div>
      {showAdd&&<div className="card" style={{marginBottom:8,borderColor:C.accent+"40"}}>
        <div className="fld"><div className="flb">Name</div><input className="inp" placeholder="e.g. Chase savings account" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
        <div className="fld"><div className="flb">Current value</div><input className="inp mono" type="number" placeholder="0.00" value={form.value} onChange={e=>setForm(v=>({...v,value:e.target.value}))}/></div>
        <div className="fld"><div className="flb">Type</div><select className="inp" value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value}))}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={add}>Add asset</button></div>
      </div>}
      {assets.length===0?(
        <div className="card" style={{textAlign:"center",padding:22}}>
          <div style={{fontSize:28,marginBottom:7}}>🏦</div>
          <div style={{fontWeight:600,fontSize:13,marginBottom:5}}>No assets added yet</div>
          <div style={{fontSize:12,color:C.muted}}>Add your savings, car value, investments, or anything else you own to see your true net worth.</div>
        </div>
      ):(
        <>
          {grouped.map(g=><div key={g.type} className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:g.items.length?8:0}}>
              <span style={{fontWeight:700,fontSize:12}}>{g.type}</span>
              <span className="mono" style={{color:C.success,fontSize:12}}>{fmt(g.total)}</span>
            </div>
            {g.items.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>{a.name}</span>
              <div style={{display:"flex",alignItems:"center",gap:9}}><span className="mono" style={{fontSize:12}}>{fmt(a.value)}</span><button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:10}} onClick={()=>{setAssets(x=>x.filter(v=>v.id!==a.id));pop("Removed","✕");}}>✕</button></div>
            </div>)}
          </div>)}
          <p className="lbl">What you owe (debts)</p>
          <div className="card">
            {debts.length===0?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"10px 0"}}>No debts added</div>:debts.map((d,i)=><div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<debts.length-1?`1px solid ${C.border}`:"none"}}><span style={{fontSize:12}}>{d.name}</span><span className="mono" style={{fontSize:12,color:C.red}}>-{fmt(d.balance)}</span></div>)}
            {debts.length>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4,borderTop:`1px solid ${C.border}`}}><span style={{fontWeight:700,fontSize:12}}>Total owed</span><span className="mono" style={{fontWeight:700,color:C.red}}>-{fmt(totalDebt)}</span></div>}
          </div>
        </>
      )}
    </div>
  );
}

// ── BUDGET ────────────────────────────────────────────────────────────────────
function BudgetTab({income,setIncome,efund,setEfund,debts}){
  const [cats,setCats]=useState([
    {id:1,name:"Housing",budget:1000,spent:1000,color:C.blue,icon:"🏠"},
    {id:2,name:"Food & groceries",budget:300,spent:240,color:C.yellow,icon:"🍔"},
    {id:3,name:"Transportation",budget:200,spent:180,color:C.purple,icon:"🚗"},
    {id:4,name:"Utilities & phone",budget:150,spent:130,color:"#2DD4BF",icon:"💡"},
    {id:5,name:"Entertainment",budget:150,spent:80,color:C.success,icon:"🎉"},
  ]);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",budget:"",icon:"💰"});
  const [goals,setGoals]=useState([{id:1,name:"Emergency fund",target:1500,saved:efund,color:C.blue,icon:"🛡️"}]);
  const [showGoal,setShowGoal]=useState(false);
  const [gform,setGform]=useState({name:"",target:"",saved:"",icon:"🎯"});

  const mins=debts.reduce((s,d)=>s+d.min,0);
  const totalSpend=cats.reduce((s,c)=>s+c.spent,0);
  const totalBudget=cats.reduce((s,c)=>s+c.budget,0);
  const leftover=Math.max(0,(income||0)-totalSpend-mins);
  const efGoal=(income||0)*3;

  const addCat=()=>{if(!form.name||!form.budget)return;setCats(c=>[...c,{id:Date.now(),name:form.name,budget:parseFloat(form.budget)||0,spent:0,color:C.accent,icon:form.icon}]);setForm({name:"",budget:"",icon:"💰"});setShowAdd(false);};
  const addGoal=()=>{if(!gform.name||!gform.target)return;setGoals(g=>[...g,{id:Date.now(),name:gform.name,target:parseFloat(gform.target)||0,saved:parseFloat(gform.saved)||0,color:C.accent,icon:gform.icon}]);setGform({name:"",target:"",saved:"",icon:"🎯"});setShowGoal(false);};

  return(
    <div className="scroll">
      {/* Income */}
      <div className="card" style={{marginBottom:10}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Monthly take-home pay</div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{color:C.muted,fontSize:14}}>$</span>
          <input className="inp mono" type="number" value={income||""} onChange={e=>setIncome(parseFloat(e.target.value)||0)} placeholder="Enter your monthly income after taxes" style={{flex:1,fontSize:15}}/>
        </div>
      </div>

      {/* One number */}
      <div className="card" style={{background:"linear-gradient(135deg,#141B27,#0F1A27)",borderColor:C.blue+"30",marginBottom:12,textAlign:"center",padding:18}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Left over after bills & spending</div>
        <div className="mono" style={{fontSize:32,fontWeight:500,color:leftover>0?C.accent:C.red}}>{fmt(leftover)}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:5}}>This is your flex money — for extra debt payments, savings, or fun</div>
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{l:"Income",v:fmt(income||0),c:C.success},{l:"Debt mins",v:fmt(mins),c:C.red},{l:"Spending",v:fmt(totalSpend),c:C.yellow}].map(r=><div key={r.l} style={{background:C.surface,borderRadius:8,padding:"8px 6px"}}><div className="mono" style={{fontSize:12,fontWeight:500,color:r.c}}>{r.v}</div><div style={{fontSize:9,color:C.muted,marginTop:2}}>{r.l}</div></div>)}
        </div>
      </div>

      {/* Emergency fund */}
      <p className="lbl"><Tip termKey="efund">Emergency fund</Tip></p>
      <div className="card" style={{marginBottom:10,borderColor:efund>=efGoal?C.success+"44":C.yellow+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <div>
            <div style={{fontWeight:700,fontSize:13}}>🛡️ Safety net</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>Goal: {fmt(efGoal)} (3 months of income)</div>
          </div>
          <span className={`tag ${efund>=efGoal?"tg":efund>=(efGoal*.5)?"ty":"tr"}`}>{efund>=efGoal?"Fully funded":efund>=(efGoal*.5)?"Halfway":"Just starting"}</span>
        </div>
        <div className="pbar" style={{marginBottom:7}}><div className="pfill" style={{width:`${Math.min((efund/Math.max(efGoal,1))*100,100)}%`,background:efund>=efGoal?C.success:efund>=efGoal*.5?C.yellow:C.red}}/></div>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:11,color:C.muted}}>Currently saved $</span>
          <input className="inp mono" type="number" value={efund||""} onChange={e=>setEfund(parseFloat(e.target.value)||0)} style={{flex:1,padding:"6px 9px",fontSize:12}} placeholder="0"/>
        </div>
        {efund<500&&<div className="real-life" style={{marginTop:8}}>🎯 Start with a goal of $500. That alone changes how you handle unexpected costs — they become problems with solutions, not emergencies.</div>}
      </div>

      {/* Categories */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p className="lbl" style={{marginBottom:0}}>Spending categories</p>
        <button className="btn bp bsm" onClick={()=>setShowAdd(v=>!v)}>+ Add</button>
      </div>
      {showAdd&&<div className="card" style={{marginBottom:8,borderColor:C.accent+"40"}}>
        <div style={{display:"grid",gridTemplateColumns:"48px 1fr",gap:7,marginBottom:8}}>
          <div className="fld"><div className="flb">Icon</div><input className="inp" value={form.icon} onChange={e=>setForm(v=>({...v,icon:e.target.value}))} style={{textAlign:"center",fontSize:18,padding:"6px"}}/></div>
          <div className="fld"><div className="flb">Category</div><input className="inp" placeholder="e.g. Gym membership" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
        </div>
        <div className="fld"><div className="flb">Monthly budget</div><input className="inp mono" type="number" placeholder="0" value={form.budget} onChange={e=>setForm(v=>({...v,budget:e.target.value}))}/></div>
        <div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addCat}>Add</button></div>
      </div>}
      {cats.map(c=>{const over=c.spent>c.budget,barW=Math.min((c.spent/Math.max(c.budget,1))*100,100);return(
        <div key={c.id} className="card" style={{marginBottom:7,borderColor:over?C.red+"44":"transparent"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:16}}>{c.icon}</span><div><div style={{fontWeight:600,fontSize:12}}>{c.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>Budget: {fmt(c.budget)}</div></div></div>
            <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:13,fontWeight:500,color:over?C.red:C.text}}>{fmt(c.spent)}</div>{over&&<div style={{fontSize:9,color:C.red,marginTop:1}}>+{fmt(c.spent-c.budget)} over</div>}</div>
          </div>
          <div style={{height:5,borderRadius:3,background:C.border,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",borderRadius:3,background:over?C.red:c.color,width:`${barW}%`,transition:"width .4s ease"}}/></div>
          <div style={{display:"flex",gap:7}}>
            <div style={{flex:1}}><div className="flb">Spent $</div><input className="inp mono" type="number" value={c.spent} onChange={e=>setCats(x=>x.map(v=>v.id===c.id?{...v,spent:parseFloat(e.target.value)||0}:v))} style={{padding:"5px 8px",fontSize:11}}/></div>
            <div style={{flex:1}}><div className="flb">Budget $</div><input className="inp mono" type="number" value={c.budget} onChange={e=>setCats(x=>x.map(v=>v.id===c.id?{...v,budget:parseFloat(e.target.value)||0}:v))} style={{padding:"5px 8px",fontSize:11}}/></div>
            <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:10,alignSelf:"flex-end",paddingBottom:6}} onClick={()=>setCats(x=>x.filter(v=>v.id!==c.id))}>✕</button>
          </div>
        </div>
      );})}

      {/* Goals */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,marginTop:4}}>
        <p className="lbl" style={{marginBottom:0}}>Savings goals</p>
        <button className="btn bp bsm" onClick={()=>setShowGoal(v=>!v)}>+ Goal</button>
      </div>
      {showGoal&&<div className="card" style={{marginBottom:8,borderColor:C.accent+"40"}}>
        <div style={{display:"grid",gridTemplateColumns:"48px 1fr",gap:7,marginBottom:8}}>
          <div className="fld"><div className="flb">Icon</div><input className="inp" value={gform.icon} onChange={e=>setGform(v=>({...v,icon:e.target.value}))} style={{textAlign:"center",fontSize:18,padding:"6px"}}/></div>
          <div className="fld"><div className="flb">Goal name</div><input className="inp" placeholder="e.g. New laptop" value={gform.name} onChange={e=>setGform(v=>({...v,name:e.target.value}))}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          <div className="fld"><div className="flb">Target $</div><input className="inp mono" type="number" placeholder="1000" value={gform.target} onChange={e=>setGform(v=>({...v,target:e.target.value}))}/></div>
          <div className="fld"><div className="flb">Saved so far $</div><input className="inp mono" type="number" placeholder="0" value={gform.saved} onChange={e=>setGform(v=>({...v,saved:e.target.value}))}/></div>
        </div>
        <div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setShowGoal(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addGoal}>Add goal</button></div>
      </div>}
      {goals.map(g=>{const p=Math.min((g.saved/Math.max(g.target,1))*100,100),left=Math.max(0,g.target-g.saved);return(
        <div key={g.id} className="card" style={{marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div style={{display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:16}}>{g.icon}</span><div><div style={{fontWeight:600,fontSize:12}}>{g.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{left>0?`${fmt(left)} to go`:"🎉 Goal reached!"}</div></div></div>
            <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:12,color:C.success}}>{fmt(g.saved)}</div><div style={{fontSize:9,color:C.muted}}>of {fmt(g.target)}</div></div>
          </div>
          <div className="goal-bar"><div style={{height:"100%",borderRadius:3,background:p>=100?C.success:g.color||C.accent,width:`${p}%`,transition:"width .5s ease"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:3}}>
            <span>{Math.round(p)}% complete</span>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <input className="inp mono" type="number" value={g.saved} onChange={e=>setGoals(gs=>gs.map(x=>x.id===g.id?{...x,saved:parseFloat(e.target.value)||0}:x))} style={{width:80,padding:"3px 7px",fontSize:11}}/>
              <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:10}} onClick={()=>setGoals(x=>x.filter(v=>v.id!==g.id))}>✕</button>
            </div>
          </div>
        </div>
      );})}
    </div>
  );
}

// ── INVEST ────────────────────────────────────────────────────────────────────
function InvestTab({debts,isPlus,onUpgrade}){
  const [sub,setSub]=useState("vs");
  const [accounts,setAccounts]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",balance:"",type:"Retirement"});
  const [steps,setSteps]=useState({});
  const totalDebt=debts.reduce((s,d)=>s+d.balance,0);
  const highRate=debts.length>0?Math.max(...debts.map(d=>d.rate)):0;
  const hasHigh=debts.some(d=>d.rate>15);
  const ready=highRate<8||totalDebt===0;
  const totalInvested=accounts.reduce((s,a)=>s+a.balance,0);
  const STEPS=[{n:1,t:"Build $500 emergency fund",s:"Before anything else — so emergencies don't become debt"},{n:2,t:"Get full 401(k) employer match",s:"Free money. Always do this first if your employer matches"},{n:3,t:"Pay off high-interest debt",s:"Anything above 7% APR — costs more than investing earns"},{n:4,t:"Open a Roth IRA",s:"Contribute up to $7,000/yr — grows completely tax-free"},{n:5,t:"Max out your 401(k)",s:"$23,000/yr pre-tax limit"},{n:6,t:"Open a brokerage account",s:"Invest in index funds after tax-advantaged accounts are maxed"}];
  const firstUnchecked=STEPS.findIndex(s=>!steps[s.n]);
  const addAcct=()=>{if(!form.name||!form.balance)return;const bal=Math.abs(parseFloat(form.balance)||0);if(!isFinite(bal))return;setAccounts(a=>[...a,{id:Date.now(),name:form.name,balance:bal,type:form.type,color:{Retirement:C.success,Brokerage:C.blue,Savings:C.yellow,Crypto:C.purple}[form.type]||C.blue}]);setForm({name:"",balance:"",type:"Retirement"});setShowAdd(false);};

  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      <div className="subnav" style={{position:"sticky",top:0,zIndex:10}}>
        {[{id:"vs",l:"Debt vs Invest"},{id:"steps",l:"What to do first"},{id:"accounts",l:"My accounts"}].map(s=>(
          <button key={s.id} className={`snbtn${sub===s.id?" on":""}`} onClick={()=>setSub(s.id)}>{s.l}</button>
        ))}
      </div>
      <div className="scroll" style={{padding:"12px 14px 80px"}}>
        {sub==="vs"&&<>
          <div style={{fontSize:13,color:C.muted,marginBottom:12,lineHeight:1.5}}>Should you invest while you have debt? It depends on your <Tip termKey="apr">interest rates</Tip>.</div>
          <div className="card" style={{borderColor:ready?C.success+"44":C.yellow+"44",background:ready?"linear-gradient(135deg,#141B27,#0F1A14)":"linear-gradient(135deg,#141B27,#1A1800)",marginBottom:12}}>
            <div style={{fontSize:20,marginBottom:7}}>{ready?"📈":"⚖️"}</div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:5}}>{ready?"You're in good shape to invest":"Here's what the math says"}</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:10}}>
              {totalDebt===0?"No debt — invest as aggressively as you can.":hasHigh?`Your ${debts.filter(d=>d.rate>15)[0]?.name||"credit card"} charges ${highRate}% interest. Paying that off is a guaranteed ${highRate}% return — better than the stock market's average ~10%/yr.`:`Your highest rate is ${highRate}%. The stock market averages ~10%/yr, so it makes sense to do both: get your employer's 401k match, then attack your debt.`}
            </div>
            <div style={{display:"flex",gap:7}}>
              <div style={{flex:1,background:C.surface,borderRadius:8,padding:"9px 10px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Your highest APR</div>
                <div className="mono" style={{fontSize:18,color:highRate>10?C.red:highRate>7?C.yellow:C.success}}>{debts.length>0?`${highRate}%`:"0%"}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>cost of your debt</div>
              </div>
              <div style={{flex:1,background:C.surface,borderRadius:8,padding:"9px 10px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>S&P 500 average</div>
                <div className="mono" style={{fontSize:18,color:C.success}}>~10%</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>return/yr historically</div>
              </div>
            </div>
          </div>
          <p className="lbl">The simple rule</p>
          <div className="card">
            {[{cond:highRate>15,e:"🔥",t:"Pay debt first",s:`${highRate}% interest beats any investment. Wipe it out.`,c:C.red},{cond:highRate>=7&&highRate<=15,e:"⚖️",t:"Do both at once",s:"Get your 401k match (free money), then put extra toward debt.",c:C.yellow},{cond:highRate<7||totalDebt===0,e:"📈",t:"Invest aggressively",s:"Low-rate debt is cheap. Let compound interest work for you.",c:C.success}].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<2?`1px solid ${C.border}`:"none",opacity:r.cond?1:.3}}>
                <span style={{fontSize:18,flexShrink:0}}>{r.e}</span>
                <div><div style={{fontWeight:700,fontSize:12,color:r.c}}>{r.t}{r.cond&&<span className="tag tg" style={{marginLeft:6}}>Your situation</span>}</div><div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{r.s}</div></div>
              </div>
            ))}
          </div>
        </>}
        {sub==="steps"&&<>
          <div style={{fontSize:13,color:C.muted,marginBottom:10,lineHeight:1.5}}>Work through these in order. Tap to check off each step when you've done it.</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p className="lbl" style={{marginBottom:0}}>Your financial order of operations</p>
            <span style={{fontSize:10,color:C.muted}}>{Object.values(steps).filter(Boolean).length}/{STEPS.length} done</span>
          </div>
          <div className="card">
            {STEPS.map((s,i)=>{const done=!!steps[s.n],isCur=i===firstUnchecked;return(
              <div key={i} onClick={()=>setSteps(x=>({...x,[s.n]:!x[s.n]}))} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"11px 0",borderBottom:i<STEPS.length-1?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                <div style={{width:23,height:23,borderRadius:"50%",background:done?C.success:isCur?C.accent:C.border,color:done||isCur?"#080C12":C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:1,transition:"all .2s"}}>{done?"✓":s.n}</div>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12,color:done?C.muted:C.text,textDecoration:done?"line-through":"none"}}>{s.t}</div><div style={{fontSize:10,color:C.muted,marginTop:2,lineHeight:1.4}}>{s.s}</div></div>
                <span className={`tag ${done?"tg":isCur?"tb":"tp"}`} style={{marginTop:2,flexShrink:0,fontSize:9}}>{done?"Done":isCur?"Next":"Later"}</span>
              </div>
            );})}
          </div>
        </>}
        {sub==="accounts"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p className="lbl" style={{marginBottom:0}}>My investment accounts</p>
            <button className="btn bp bsm" onClick={()=>setShowAdd(v=>!v)}>+ Add</button>
          </div>
          {showAdd&&<div className="card" style={{marginBottom:8,borderColor:C.accent+"40"}}>
            <div className="fld"><div className="flb">Account name</div><input className="inp" placeholder="e.g. Roth IRA at Vanguard" value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))}/></div>
            <div className="fld"><div className="flb">Current balance</div><input className="inp mono" type="number" placeholder="0.00" value={form.balance} onChange={e=>setForm(v=>({...v,balance:e.target.value}))}/></div>
            <div className="fld"><div className="flb">Type</div><select className="inp" value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value}))}>{["Retirement","Brokerage","Savings","Crypto"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn bp" style={{flex:1}} onClick={addAcct}>Add account</button></div>
          </div>}
          <div className="card" style={{marginBottom:10}}>
            {accounts.length===0?<div style={{textAlign:"center",padding:"16px 0",color:C.muted,fontSize:12}}>No accounts yet.<br/>Add your 401k, Roth IRA, savings, and brokerage accounts.</div>:accounts.map((a,i)=>(
              <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<accounts.length-1?`1px solid ${C.border}`:"none"}}>
                <div><div style={{fontWeight:600,fontSize:12}}>{a.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{a.type}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:9}}><span className="mono" style={{fontSize:13,color:a.color}}>{fmt(a.balance)}</span><button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:10}} onClick={()=>setAccounts(x=>x.filter(v=>v.id!==a.id))}>✕</button></div>
              </div>
            ))}
            {accounts.length>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4,borderTop:`1px solid ${C.border}`}}><span style={{fontWeight:700,fontSize:12}}>Total invested</span><span className="mono" style={{fontWeight:700,color:C.success,fontSize:13}}>{fmt(totalInvested)}</span></div>}
          </div>
          <p className="lbl">Quick explainers</p>
          <div className="card">
            {[{e:"🏦",t:"401(k)",s:"Retirement account through your employer. Contributions are pre-tax. Always get the full employer match."},{e:"🌱",t:"Roth IRA",s:"You invest after-tax dollars. The money grows tax-free forever, and withdrawals in retirement are completely tax-free."},{e:"📊",t:"Index funds",s:"Funds that track the whole stock market (like the S&P 500). Low fees, historically beat most managed funds."},{e:"💧",t:"HYSA (High-Yield Savings)",s:"A savings account paying 4–5% APY. 10x more than a regular savings account. Best place for emergency funds."}].map((r,i)=>(
              <div key={i} style={{display:"flex",gap:9,padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:17,flexShrink:0,marginTop:1}}>{r.e}</span>
                <div><div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{r.t}</div><div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{r.s}</div></div>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// ── HEALTH TAB ────────────────────────────────────────────────────────────────
function HealthTab({debts,isPlus,onUpgrade,score,setScore,assets,income,efund,defaultSub}){
  const [sub,setSub]=useState(defaultSub||"score");
  const health=calcHealth({debts,score,assets,income,efund});
  const [msgs,setMsgs]=useState([{r:"ai",t:"Hey! I'm your Moneycode advisor. I know your debts and your situation. Ask me anything — no judgment, just real answers."}]);
  const [input,setInput]=useState(""),[aiLoad,setAiLoad]=useState(false);
  const [aiCredit,setAiCredit]=useState(null),[aiCreditLoad,setAiCreditLoad]=useState(false);
  const ref=useRef();
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,aiLoad]);

  const QUICK=["What should I do this month?","I'm 18 and just got my first credit card — what should I know?","How much is my debt costing me?","When should I start investing?"];

  const send=async(txt)=>{
    if(!txt.trim()||aiLoad)return;
    setInput("");setMsgs(m=>[...m,{r:"me",t:txt}]);setAiLoad(true);
    const sum=debts.map(d=>`${d.name}: ${fmtD(d.balance)} at ${d.rate}% APR`).join("\n");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`You are a financial advisor inside Moneycode, an app for 18–30 year olds. Be real, direct, and human. Use plain English — no jargon without explanation. Max 150 words. One concrete action at the end. Never be preachy. Treat them like a smart adult who just hasn't learned this stuff yet.\n\nTheir debts:\n${sum||"None added yet"}\nTotal owed: ${fmt(debts.reduce((s,d)=>s+d.balance,0))}\nMonthly income: ${fmt(income||0)}\nCredit score: ${score}`,messages:[...msgs.filter((_,i)=>i>0).map(m=>({role:m.r==="ai"?"assistant":"user",content:m.t})),{role:"user",content:txt}]})});
      const d=await res.json();
      setMsgs(m=>[...m,{r:"ai",t:d.content?.[0]?.text||"Something went wrong."}]);
    }catch{setMsgs(m=>[...m,{r:"ai",t:"Couldn't connect. Try again."}]);}
    setAiLoad(false);
  };

  const getAiCredit=async()=>{
    setAiCreditLoad(true);
    const cards=debts.filter(d=>d.type==="credit"),lim=cards.reduce((s,d)=>s+d.original,0),bal=cards.reduce((s,d)=>s+d.balance,0),util=lim>0?(bal/lim)*100:0;
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:"Concise credit coach for young adults. Plain English only. Max 80 words. One specific action at the end.",messages:[{role:"user",content:`My credit score is ${score}. Credit card utilization: ${Math.round(util)}% ($${Math.round(bal)} of $${Math.round(lim)} limit). ${cards.length} credit cards. What's the most important thing I can do to improve my score?`}]})});const d=await res.json();setAiCredit(d.content?.[0]?.text||"");}
    catch{setAiCredit("Couldn't connect. Try again.");}
    setAiCreditLoad(false);
  };

  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 14px 0",background:C.surface,position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",gap:4,borderBottom:`1px solid ${C.border}`}}>
          {[{id:"score",l:"Health Score"},{id:"credit",l:"Credit Score"},{id:"ai",l:`AI Advisor${!isPlus?" ✦":""}`}].map(s=>(
            <button key={s.id} className={`snbtn${sub===s.id?" on":""}`} onClick={()=>setSub(s.id)}>{s.l}</button>
          ))}
        </div>
      </div>

      {sub==="score"&&<div className="scroll" style={{padding:"12px 14px 80px"}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{position:"relative",width:150,height:150,margin:"0 auto 10px"}}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="58" fill="none" stroke={C.border} strokeWidth="9"/>
              <circle cx="75" cy="75" r="58" fill="none" stroke={health.color} strokeWidth="9" strokeDasharray={`${(health.overall/100)*2*Math.PI*58} ${2*Math.PI*58}`} strokeLinecap="round" transform="rotate(-90 75 75)" style={{transition:"stroke-dasharray 1s ease"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div className="mono" style={{fontSize:34,fontWeight:500,color:health.color,lineHeight:1}}>{health.overall}</div>
              <div style={{fontSize:10,color:health.color,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginTop:3}}>{health.label}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:C.muted}}>out of 100 — updates as you improve your finances</div>
        </div>
        <p className="lbl">What makes up your score</p>
        <div className="card" style={{marginBottom:10}}>
          {health.factors.map((f,i)=>(
            <div key={i} style={{padding:"9px 0",borderBottom:i<health.factors.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div><div style={{fontWeight:600,fontSize:12}}>{f.l}</div><div style={{fontSize:9,color:C.muted}}>{f.w}% of total score</div></div>
                <span className="mono" style={{color:f.c,fontSize:13,fontWeight:500}}>{f.v}/100</span>
              </div>
              <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:f.c,width:`${f.v}%`,transition:"width .8s ease"}}/></div>
            </div>
          ))}
        </div>
        <p className="lbl">Your top moves right now</p>
        <div className="card">
          {[
            {t:"Pay every bill on time",s:"Even one missed payment can drop your score 50–100 points",ok:score>=670,icon:"✓"},
            {t:"Keep credit card usage under 10%",s:"The fastest way to improve your credit score",ok:debts.filter(d=>d.type==="credit").every(d=>d.original>0&&(d.balance/d.original)<.1),icon:"💳"},
            {t:"Build a $500 emergency fund",s:"Stops emergencies from becoming credit card debt",ok:efund>=500,icon:"🛡️"},
            {t:"Attack your highest-interest debt",s:"Saves the most money per dollar",ok:debts.filter(d=>d.rate>15).length===0,icon:"🎯"},
            {t:"Open a Roth IRA",s:"The younger you start, the more it compounds",ok:false,icon:"🌱"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:9,padding:"9px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:r.ok?C.success:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,flexShrink:0,marginTop:2,color:r.ok?"#080C12":C.muted}}>{r.ok?"✓":""}</div>
              <div>
                <div style={{fontWeight:600,fontSize:12,color:r.ok?C.muted:C.text}}>{r.t}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {sub==="credit"&&<div className="scroll" style={{padding:"12px 14px 80px"}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:12,lineHeight:1.5}}>
          <Tip termKey="creditScore">Your credit score</Tip> — a number that follows you for years and affects things you might not expect.
        </div>
        <div style={{textAlign:"center",marginBottom:10}}><ScoreRing score={score}/></div>
        <div className="card" style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <span style={{fontWeight:600,fontSize:12}}>Update my score (self-reported)</span>
          </div>
          <input className="sli" type="range" min="300" max="850" step="5" value={score} onChange={e=>setScore(parseInt(e.target.value))}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
            <span>300 (Poor)</span>
            <span style={{color:score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red,fontWeight:700}}>{score}</span>
            <span>850 (Excellent)</span>
          </div>
        </div>
        {(()=>{const cards=debts.filter(d=>d.type==="credit"),lim=cards.reduce((s,d)=>s+d.original,0),bal=cards.reduce((s,d)=>s+d.balance,0),util=lim>0?(bal/lim)*100:0;return(<>
          <p className="lbl"><Tip termKey="utilization">Credit utilization</Tip></p>
          <div className="card" style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <div>
                <div className="mono" style={{fontSize:18,fontWeight:700,color:util>30?C.red:util>10?C.yellow:C.success}}>{lim>0?`${Math.round(util)}%`:"—"}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>{lim>0?`$${Math.round(bal)} used of $${Math.round(lim)} total limit`:"Add credit cards to see utilization"}</div>
              </div>
              {lim>0&&<span className={`tag ${util>30?"tr":util>10?"ty":"tg"}`}>{util>30?"Too high":util>10?"OK":"Great"}</span>}
            </div>
            {lim>0&&<>
              <div className="pbar"><div className="pfill" style={{width:`${Math.min(util,100)}%`,background:util>30?C.red:util>10?C.yellow:C.success}}/></div>
              {util>10&&<div className="real-life" style={{marginTop:8}}>💡 Pay down {fmtD(Math.max(0,bal-lim*.1))} to get under 10% utilization — this alone could add 20–40 points to your score.</div>}
            </>}
          </div>
        </>);})()}
        <p className="lbl">What moves your score (in order of impact)</p>
        <div className="card" style={{marginBottom:10}}>
          {[{pct:"35%",t:"Pay on time, every time",s:"One missed payment = -50 to -100 points immediately"},{pct:"30%",t:"Keep utilization under 10%",s:"Quick win — can improve score within 1 billing cycle"},{pct:"15%",t:"Keep old accounts open",s:"Longer credit history = higher score"},{pct:"10%",t:"Mix of credit types",s:"Having both cards and loans helps"},{pct:"10%",t:"Limit new applications",s:"Every hard inquiry temporarily drops your score ~5 pts"}].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
              <div style={{width:32,flexShrink:0}}><div className="mono" style={{fontSize:11,color:C.accent,fontWeight:700}}>{r.pct}</div></div>
              <div><div style={{fontWeight:600,fontSize:12}}>{r.t}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>{r.s}</div></div>
            </div>
          ))}
        </div>
        {isPlus?(
          aiCredit?(
            <div className="card" style={{borderColor:C.accent+"30"}}>
              <div style={{fontSize:10,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>✦ AI Analysis</div>
              <div style={{fontSize:12,lineHeight:1.6}}>{aiCredit}</div>
              <button className="btn bg bsm" style={{marginTop:9}} onClick={()=>setAiCredit(null)}>Refresh</button>
            </div>
          ):(
            <button className="btn bp bfull" onClick={getAiCredit} disabled={aiCreditLoad}>{aiCreditLoad?"Analyzing…":"✦ What should I do to improve my score?"}</button>
          )
        ):(
          <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:5}}>✦ Get personalized credit advice</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Tell me your score and I'll tell you the exact moves to improve it fastest.</div>
            <button className="btn bplus bfull" onClick={onUpgrade}>Unlock Plus — $6.99/mo</button>
          </div>
        )}
      </div>}

      {sub==="ai"&&(isPlus?(
        <div style={{display:"flex",flexDirection:"column",minHeight:"calc(100vh - 120px)"}}>
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px 8px"}}>
            <div style={{marginBottom:10}}><div style={{fontSize:14,fontWeight:700}}>AI Advisor</div><div style={{fontSize:11,color:C.muted}}>Real answers. No judgment. Plain English.</div></div>
            <div style={{display:"flex",flexDirection:"column"}}>
              {msgs.map((m,i)=><div key={i} className={`msg ${m.r==="ai"?"mai":"mme"}`} style={{alignSelf:m.r==="ai"?"flex-start":"flex-end"}}>{m.t}</div>)}
              {aiLoad&&<div className="msg mai" style={{alignSelf:"flex-start"}}><div style={{display:"flex",gap:4,alignItems:"center"}}><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
            </div>
            {!aiLoad&&msgs.length<3&&<div style={{marginTop:8}}>
              <div className="lbl" style={{marginBottom:7}}>Not sure what to ask? Try these:</div>
              {QUICK.map(q=><button key={q} className="btn bg bsm" style={{display:"block",textAlign:"left",width:"100%",marginBottom:5}} onClick={()=>send(q)}>"{q}"</button>)}
            </div>}
            <div ref={ref}/>
          </div>
          <div style={{padding:"9px 12px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:7,flexShrink:0}}>
            <input className="inp" placeholder="Ask anything about money…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} style={{flex:1}}/>
            <button className="btn bp bico" onClick={()=>send(input)} disabled={!input.trim()||aiLoad}><I.Send/></button>
          </div>
        </div>
      ):(
        <div className="scroll" style={{padding:"12px 14px 80px"}}>
          <div style={{marginBottom:14}}><div style={{fontSize:17,fontWeight:800,marginBottom:5}}>AI Advisor</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>A financial advisor in your pocket that actually knows your situation. Real answers, plain English, no judgment.</div></div>
          <div className="card" style={{marginBottom:10}}><div style={{fontSize:24,marginBottom:7}}>💬</div><div style={{fontWeight:700,fontSize:13,marginBottom:9}}>Things people ask</div>{QUICK.map(q=><div key={q} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.muted,fontStyle:"italic",marginBottom:5}}>"{q}"</div>)}</div>
          <div className="card" style={{borderColor:C.yellow+"30",background:"linear-gradient(135deg,#141B27,#1A1A2E)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:5}}>✦ AI Advisor — Plus feature</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.5}}>14-day free trial. No credit card needed. Cancel any time.</div>
            <button className="btn bplus bfull" onClick={onUpgrade}>Start free trial — then $6.99/mo</button>
            <div style={{textAlign:"center",marginTop:7,fontSize:10,color:C.muted}}>or $59/yr (save 30%)</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

// ── BILL CALENDAR ─────────────────────────────────────────────────────────────
function BillCalendar({debts}){
  const now=new Date();
  const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
  const firstDay=new Date(now.getFullYear(),now.getMonth(),1).getDay();
  const today=now.getDate();
  const billMap={};
  debts.filter(d=>d.due).forEach(d=>{ if(!billMap[d.due]) billMap[d.due]=[]; billMap[d.due].push(d); });
  const upcoming=debts.filter(d=>d.due).sort((a,b)=>a.due-b.due).map(d=>({...d,daysLeft:d.due>=today?d.due-today:daysInMonth-today+d.due})).sort((a,b)=>a.daysLeft-b.daysLeft);
  return(
    <div className="scroll">
      <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{now.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{debts.filter(d=>d.due).length} bills tracked this month</div>
      {/* Calendar grid */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:8}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:C.muted,fontWeight:700,padding:"3px 0"}}>{d}</div>)}
          {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const day=i+1;
            const bills=billMap[day]||[];
            const isToday=day===today;
            const isPast=day<today;
            return(
              <div key={day} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:7,background:bills.length?C.red+"22":isToday?C.accent+"22":"transparent",border:isToday?`1px solid ${C.accent}`:bills.length?`1px solid ${C.red}44`:"none",position:"relative",opacity:isPast&&!isToday?.5:1}}>
                <span style={{fontSize:11,fontWeight:isToday?700:bills.length?600:400,color:bills.length?C.red:isToday?C.accent:C.text}}>{day}</span>
                {bills.length>0&&<div style={{width:4,height:4,borderRadius:"50%",background:C.red,position:"absolute",bottom:3}}/>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Upcoming bills */}
      <p className="lbl">Upcoming payments</p>
      {upcoming.length===0?(
        <div className="card" style={{textAlign:"center",padding:20}}>
          <div style={{fontSize:28,marginBottom:8}}>📅</div>
          <div style={{fontWeight:600,fontSize:13,marginBottom:6}}>No due dates set</div>
          <div style={{fontSize:12,color:C.muted}}>Edit any debt in the Debts tab and add a due date to see it here.</div>
        </div>
      ):upcoming.map(d=>(
        <div key={d.id} className="card" style={{marginBottom:8,borderColor:d.daysLeft<=3?C.red+"66":d.daysLeft<=7?C.yellow+"44":"transparent"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{d.name}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Due the {d.due}{d.due===1?"st":d.due===2?"nd":d.due===3?"rd":"th"} · {d.daysLeft===0?"Today!":d.daysLeft===1?"Tomorrow":`${d.daysLeft} days`}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div className="mono" style={{fontSize:14,color:d.daysLeft<=3?C.red:C.text}}>${d.min.toFixed(2)}</div>
              {d.daysLeft<=3&&<div style={{fontSize:9,color:C.red,marginTop:2,fontWeight:700}}>DUE SOON</div>}
            </div>
          </div>
        </div>
      ))}
      {/* Total due this month */}
      {upcoming.length>0&&<div className="card" style={{borderColor:C.blue+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:700,fontSize:13}}>Total due this month</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>{upcoming.length} payments</div></div>
          <div className="mono" style={{fontSize:16,fontWeight:500,color:C.yellow}}>${upcoming.reduce((s,d)=>s+d.min,0).toFixed(2)}</div>
        </div>
      </div>}
    </div>
  );
}

// ── MILESTONE SHARE CARD ──────────────────────────────────────────────────────
function MilestoneCard({milestone,name,debts,onClose}){
  const total=debts.reduce((s,d)=>s+d.balance,0);
  const orig=debts.reduce((s,d)=>s+d.original,0);
  const paid=orig-total;
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:14}}>Share your win 🎉</div>
        {/* The card itself */}
        <div style={{background:"linear-gradient(135deg,#0F1520,#141B27)",border:`1px solid ${C.accent}44`,borderRadius:16,padding:24,marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>money<span style={{color:C.accent}}>code</span></div>
          <div style={{fontSize:44,marginBottom:10}}>{milestone.e}</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:6,color:C.text}}>{milestone.t}</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:16}}>{name?`${name} has`:"I've"} paid off <span style={{color:C.accent,fontWeight:700}}>${Math.round(paid).toLocaleString()}</span> of debt</div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <div style={{background:C.surface,borderRadius:10,padding:"10px 16px",border:`1px solid ${C.border}`}}>
              <div className="mono" style={{fontSize:18,color:C.success,fontWeight:500}}>${Math.round(paid).toLocaleString()}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>PAID OFF</div>
            </div>
            <div style={{background:C.surface,borderRadius:10,padding:"10px 16px",border:`1px solid ${C.border}`}}>
              <div className="mono" style={{fontSize:18,color:C.accent,fontWeight:500}}>{Math.round((paid/Math.max(orig,1))*100)}%</div>
              <div style={{fontSize:9,color:C.muted,marginTop:2}}>COMPLETE</div>
            </div>
          </div>
          <div style={{marginTop:14,fontSize:11,color:C.muted}}>moneycode.app</div>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14,textAlign:"center",lineHeight:1.6}}>Screenshot this card and share it. You earned it.</div>
        <button className="btn bp bfull" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ── CREDIT SCORE SIMULATOR ────────────────────────────────────────────────────
function CreditSimulator({debts,score}){
  const cards=debts.filter(d=>d.type==="credit");
  const totalLim=cards.reduce((s,d)=>s+d.original,0);
  const totalBal=cards.reduce((s,d)=>s+d.balance,0);
  const currentUtil=totalLim>0?(totalBal/totalLim)*100:0;
  const [simBal,setSimBal]=useState(totalBal);
  const simUtil=totalLim>0?(simBal/totalLim)*100:0;
  const utilDrop=currentUtil-simUtil;
  const scoreBoost=utilDrop>30?Math.round(utilDrop*1.2):utilDrop>20?Math.round(utilDrop*0.9):utilDrop>10?Math.round(utilDrop*0.6):Math.round(utilDrop*0.3);
  const simScore=Math.min(850,score+scoreBoost);

  return(
    <div className="scroll">
      <div style={{fontSize:13,color:C.muted,marginBottom:14,lineHeight:1.6}}>
        See how paying down debt could change your credit score. Drag the slider to simulate.
      </div>
      {/* Score comparison */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div className="card" style={{textAlign:"center",padding:16}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Current score</div>
          <div className="mono" style={{fontSize:32,fontWeight:500,color:score>=740?C.success:score>=670?C.accent:score>=580?C.yellow:C.red}}>{score}</div>
        </div>
        <div className="card" style={{textAlign:"center",padding:16,borderColor:simScore>score?C.success+"44":"transparent"}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>After paydown</div>
          <div className="mono" style={{fontSize:32,fontWeight:500,color:simScore>=740?C.success:simScore>=670?C.accent:simScore>=580?C.yellow:C.red}}>{simScore}</div>
          {scoreBoost>0&&<div style={{fontSize:10,color:C.success,marginTop:4,fontWeight:700}}>+{scoreBoost} pts</div>}
        </div>
      </div>

      {cards.length===0?(
        <div className="card" style={{textAlign:"center",padding:20}}>
          <div style={{fontSize:28,marginBottom:8}}>💳</div>
          <div style={{fontSize:13,color:C.muted}}>Add credit cards in the Debts tab to simulate score impact.</div>
        </div>
      ):<>
        <p className="lbl">Simulate paying down your cards</p>
        <div className="card" style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontWeight:600,fontSize:13}}>Credit card balance</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>of ${Math.round(totalLim).toLocaleString()} total limit</div></div>
            <div style={{textAlign:"right"}}>
              <div className="mono" style={{fontSize:14,color:simUtil>30?C.red:simUtil>10?C.yellow:C.success}}>${Math.round(simBal).toLocaleString()}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:1}}>{Math.round(simUtil)}% utilization</div>
            </div>
          </div>
          <input className="sli" type="range" min="0" max={Math.ceil(totalBal)} step="50" value={simBal} onChange={e=>setSimBal(parseInt(e.target.value))}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
            <span>$0 (paid off)</span>
            <span>${Math.round(totalBal).toLocaleString()} (current)</span>
          </div>
          {simUtil<=10&&<div style={{marginTop:10,padding:"8px 10px",background:C.success+"12",borderRadius:8,border:`1px solid ${C.success}30`,fontSize:12,color:C.success,fontWeight:600}}>✓ Under 10% — optimal utilization for maximum score impact</div>}
          {simUtil>10&&simUtil<=30&&<div style={{marginTop:10,padding:"8px 10px",background:C.yellow+"12",borderRadius:8,border:`1px solid ${C.yellow}30`,fontSize:12,color:C.yellow}}>Get below 10% for maximum score boost</div>}
          {simUtil>30&&<div style={{marginTop:10,padding:"8px 10px",background:C.red+"12",borderRadius:8,border:`1px solid ${C.red}30`,fontSize:12,color:C.red}}>High utilization — this is hurting your score significantly</div>}
        </div>
        <p className="lbl">Score impact by card</p>
        <div className="card">
          {cards.map((d,i)=>{
            const util=d.original>0?(d.balance/d.original)*100:0;
            return(
              <div key={d.id} style={{padding:"10px 0",borderBottom:i<cards.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div><div style={{fontWeight:600,fontSize:12}}>{d.name}</div><div style={{fontSize:10,color:C.muted,marginTop:1}}>${Math.round(d.balance).toLocaleString()} of ${Math.round(d.original).toLocaleString()} limit</div></div>
                  <span className={`tag ${util>30?"tr":util>10?"ty":"tg"}`}>{Math.round(util)}%</span>
                </div>
                <div className="pbar"><div className="pfill" style={{width:`${Math.min(util,100)}%`,background:util>30?C.red:util>10?C.yellow:C.success}}/></div>
                {util>30&&<div style={{fontSize:10,color:C.red,marginTop:4}}>Pay ${Math.round(d.balance-d.original*.1).toLocaleString()} to get under 10% → est. +{Math.round((util-10)*0.8)} pts</div>}
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}

// ── DEBT FREE CERTIFICATE ─────────────────────────────────────────────────────
function DebtFreeCert({name,debts,onClose}){
  const orig=debts.reduce((s,d)=>s+d.original,0);
  const today=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:14}}>Your debt-free certificate 🏆</div>
        <div style={{background:"linear-gradient(135deg,#0A1A0A,#141B27)",border:`2px solid ${C.success}`,borderRadius:16,padding:28,textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:10,color:C.success,fontWeight:700,textTransform:"uppercase",letterSpacing:".15em",marginBottom:16}}>Certificate of Achievement</div>
          <div style={{fontSize:36,marginBottom:10}}>🏆</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>This certifies that</div>
          <div style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:6}}>{name||"You"}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:16}}>has become completely</div>
          <div style={{fontSize:28,fontWeight:800,color:C.success,marginBottom:16,letterSpacing:"-.02em"}}>DEBT FREE</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:16,lineHeight:1.6}}>Having paid off <span style={{color:C.accent,fontWeight:700}}>${Math.round(orig).toLocaleString()}</span> in total debt</div>
          <div style={{borderTop:`1px solid ${C.success}44`,paddingTop:14,display:"flex",justifyContent:"center",gap:24}}>
            <div><div style={{fontSize:10,color:C.muted}}>Date achieved</div><div style={{fontWeight:600,fontSize:12,marginTop:2,color:C.text}}>{today}</div></div>
          </div>
          <div style={{marginTop:16,fontSize:10,color:C.muted}}>money<span style={{color:C.accent}}>code</span> · moneycode.app</div>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14,textAlign:"center"}}>Screenshot this and keep it forever. You earned it.</div>
        <button className="btn bp bfull" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ── ONBOARDING WITH FIRST DEBT ────────────────────────────────────────────────
// ── EDIT DEBT MODAL ───────────────────────────────────────────────────────────
function EditDebtModal({debt, onClose, onSave}){
  const [f,setF]=useState({
    name:debt.name,
    balance:String(debt.balance),
    original:String(debt.original),
    rate:String(debt.rate),
    min:String(debt.min),
    type:debt.type,
    due:debt.due?String(debt.due):"",
  });
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const submit=()=>{
    if(!f.name||!f.balance)return;
    const bal=Math.abs(parseFloat(f.balance)||0);
    if(!isFinite(bal)||bal<=0)return;
    const orig=Math.abs(parseFloat(f.original||f.balance)||bal);
    const rate=Math.min(Math.abs(parseFloat(f.rate)||0),100);
    const min=Math.abs(parseFloat(f.min)||0);
    onSave({...debt,name:f.name.trim(),balance:bal,original:isFinite(orig)?orig:bal,rate:isFinite(rate)?rate:0,min:isFinite(min)?min:0,type:f.type,due:f.due?Math.min(parseInt(f.due)||1,28):null,color:{student:C.blue,auto:C.yellow,credit:C.red,personal:C.blue,medical:C.purple}[f.type]||C.blue});
    onClose();
  };
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Edit debt</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Update any details for {debt.name}.</div>
        <div className="fld"><div className="flb">Name</div><input className="inp" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
        <div className="fld"><div className="flb">Type</div>
          <select className="inp" value={f.type} onChange={e=>s("type",e.target.value)}>
            <option value="credit">Credit card</option>
            <option value="student">Student loan</option>
            <option value="auto">Car loan</option>
            <option value="personal">Personal loan</option>
            <option value="medical">Medical debt</option>
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <div className="fld"><div className="flb">Current balance</div><input className="inp mono" type="number" value={f.balance} onChange={e=>s("balance",e.target.value)}/></div>
          <div className="fld"><div className="flb">Original balance</div><input className="inp mono" type="number" value={f.original} onChange={e=>s("original",e.target.value)}/></div>
          <div className="fld"><div className="flb">APR %</div><input className="inp mono" type="number" value={f.rate} onChange={e=>s("rate",e.target.value)}/></div>
          <div className="fld"><div className="flb">Min. payment</div><input className="inp mono" type="number" value={f.min} onChange={e=>s("min",e.target.value)}/></div>
        </div>
        <div className="fld"><div className="flb">Due date (day of month)</div><input className="inp mono" type="number" placeholder="e.g. 15" min="1" max="28" value={f.due} onChange={e=>s("due",e.target.value)}/></div>
        <button className="btn bp bfull" onClick={submit}>Save changes</button>
      </div>
    </div>
  );
}

function AddDebtModal({onClose,onAdd}){
  const [f,setF]=useState({name:"",balance:"",original:"",rate:"",min:"",type:"credit",due:""});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const submit=()=>{
    if(!f.name||!f.balance)return;
    const bal=Math.abs(parseFloat(f.balance)||0);
    if(!isFinite(bal)||bal<=0)return;
    const orig=Math.abs(parseFloat(f.original||f.balance)||bal);
    const rate=Math.min(Math.abs(parseFloat(f.rate)||0),100);
    const min=Math.abs(parseFloat(f.min)||0);
    onAdd({id:Date.now(),name:f.name.trim(),balance:bal,original:isFinite(orig)?orig:bal,rate:isFinite(rate)?rate:0,min:isFinite(min)?min:0,type:f.type,due:f.due?Math.min(parseInt(f.due)||1,28):null,color:{student:C.blue,auto:C.yellow,credit:C.red,personal:C.blue,medical:C.purple}[f.type]||C.blue});
    onClose();
  };
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Add a debt</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Add anything you owe — credit cards, loans, medical bills.</div>
        <div className="fld"><div className="flb">What is it called?</div><input className="inp" placeholder="e.g. Chase Freedom card" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
        <div className="fld"><div className="flb">Type of debt</div>
          <select className="inp" value={f.type} onChange={e=>s("type",e.target.value)}>
            <option value="credit">Credit card</option>
            <option value="student">Student loan</option>
            <option value="auto">Car loan</option>
            <option value="personal">Personal loan</option>
            <option value="medical">Medical debt</option>
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
          <div className="fld"><div className="flb">What you owe now</div><input className="inp mono" type="number" placeholder="0.00" value={f.balance} onChange={e=>s("balance",e.target.value)}/></div>
          <div className="fld"><div className="flb">Original amount (if known)</div><input className="inp mono" type="number" placeholder="0.00" value={f.original} onChange={e=>s("original",e.target.value)}/></div>
          <div className="fld">
            <div className="flb"><Tip termKey="apr">Interest rate (APR %)</Tip></div>
            <input className="inp mono" type="number" placeholder="e.g. 24.99" value={f.rate} onChange={e=>s("rate",e.target.value)}/>
          </div>
          <div className="fld">
            <div className="flb"><Tip termKey="minimum">Min. monthly payment</Tip></div>
            <input className="inp mono" type="number" placeholder="0.00" value={f.min} onChange={e=>s("min",e.target.value)}/>
          </div>
        </div>
        <div className="fld"><div className="flb">Due date (day of month, e.g. 15)</div><input className="inp mono" type="number" placeholder="e.g. 15" min="1" max="28" value={f.due} onChange={e=>s("due",e.target.value)}/></div>
        <button className="btn bp bfull" onClick={submit} disabled={!f.name||!f.balance}>Add this debt</button>
      </div>
    </div>
  );
}

function SyncModal({debts,onClose,onSync}){
  const [step,setStep]=useState("edit");
  const [vals,setVals]=useState(debts.map(d=>({...d,next:parseFloat(Math.max(0,d.balance-d.min).toFixed(2))})));
  const go=()=>{setStep("syncing");setTimeout(()=>setStep("done"),1500);};
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Update your balances</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Enter your current balances after last month's payments.</div>
        {step==="edit"&&<>
          {vals.map((u,i)=><div className="fld" key={u.id}><div className="flb">{u.name} — was {fmtD(u.balance)}</div><input className="inp mono" type="number" value={u.next} onChange={e=>setVals(v=>v.map((x,j)=>j===i?{...x,next:parseFloat(e.target.value)||0}:x))}/></div>)}
          <button className="btn bp bfull" onClick={go}>Update balances</button>
        </>}
        {step==="syncing"&&<div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:34,display:"inline-block",animation:"spin .8s linear infinite"}}>⟳</div>
          <div style={{fontWeight:600,marginTop:12}}>Recalculating your plan…</div>
        </div>}
        {step==="done"&&<>
          {vals.map(u=>{const d=u.next-u.balance;return(
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div><div style={{fontWeight:600,fontSize:12}}>{u.name}</div><div className="mono" style={{fontSize:10,color:C.muted}}>{fmtD(u.balance)} → {fmtD(u.next)}</div></div>
              <span className={`tag ${d<0?"tg":"tr"}`}>{d<0?"−":"+"}{fmtD(Math.abs(d))}</span>
            </div>
          );})}
          <button className="btn bp bfull" style={{marginTop:12}} onClick={()=>{onSync(vals);onClose();}}>Save changes</button>
        </>}
      </div>
    </div>
  );
}

function CSVModal({onClose,onImport}){
  const [step,setStep]=useState("drop"),[prev,setPrev]=useState(null),[map,setMap]=useState({}),[drag,setDrag]=useState(false);
  const ref=useRef();
  const parse=t=>{const l=t.trim().split("\n"),h=l[0].split(",").map(x=>x.trim().replace(/"/g,""));return{headers:h,rows:l.slice(1).map(r=>r.split(",").map(c=>c.trim().replace(/"/g,"")))}};
  const load=f=>{const r=new FileReader();r.onload=e=>{const{headers,rows}=parse(e.target.result),m={};headers.forEach((h,i)=>{const l=h.toLowerCase();if(l.includes("name")||l.includes("account"))m.name=i;if(l.includes("balance")||l.includes("amount"))m.balance=i;if(l.includes("rate")||l.includes("apr"))m.rate=i;if(l.includes("min")||l.includes("payment"))m.min=i;});setPrev({headers,rows:rows.slice(0,4),all:rows});setMap(m);setStep("map");};r.readAsText(f);}
  const demo=()=>{const{headers,rows}=parse("Name,Balance,Rate,MinPayment\nStudent Loan,18500,5.05,220\nVisa Card,1240,22.99,25\nCar Loan,6800,7.4,310");setPrev({headers,rows,all:rows});setMap({name:0,balance:1,rate:2,min:3});setStep("map");}
  const confirm=()=>{onImport(prev.all.filter(r=>r.length>1).map((r,i)=>({id:Date.now()+i,name:r[map.name]||"Imported",balance:parseFloat(r[map.balance]?.replace(/[$,]/g,"")||0),original:parseFloat(r[map.balance]?.replace(/[$,]/g,"")||0),rate:parseFloat(r[map.rate]||0),min:parseFloat(r[map.min]?.replace(/[$,]/g,"")||0),type:"imported",color:C.blue})).filter(x=>x.balance>0));onClose();}
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Import from CSV</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Export a statement from your bank and drop it here. Works with Chase, BoA, Mint, and YNAB exports.</div>
        {step==="drop"&&<><div style={{border:"2px dashed #1E2D42",borderRadius:10,padding:"22px 14px",textAlign:"center",cursor:"pointer",marginBottom:8,transition:"all .2s"}} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);load(e.dataTransfer.files[0]);}} onClick={()=>ref.current.click()}><div style={{fontSize:28,marginBottom:6}}>📂</div><div style={{fontWeight:600,marginBottom:3,fontSize:13}}>Drop your CSV file here</div><div style={{fontSize:11,color:C.muted}}>or tap to browse</div></div><input ref={ref} type="file" accept=".csv" style={{display:"none"}} onChange={e=>load(e.target.files[0])}/><button className="btn bg bsm" onClick={demo}>No CSV? Use sample data</button></>}
        {step==="map"&&prev&&<><p className="lbl">{prev.all.length} rows found — match the columns</p>{["name","balance","rate","min"].map(f=><div className="fld" key={f}><div className="flb">{f==="name"?"Account name":f==="balance"?"Balance":f==="rate"?"Interest rate %":"Minimum payment"}</div><select className="inp" value={map[f]??""} onChange={e=>setMap(m=>({...m,[f]:parseInt(e.target.value)}))}>  <option value="">— skip this column —</option>{prev.headers.map((h,i)=><option key={i} value={i}>{h}</option>)}</select></div>)}<div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setStep("drop")}>Back</button><button className="btn bp" style={{flex:1}} onClick={()=>setStep("confirm")}>Continue →</button></div></>}
        {step==="confirm"&&<><div className="card" style={{borderColor:C.success+"44",background:C.success+"0A",marginBottom:12}}><div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:22}}>✓</span><div><div style={{fontWeight:700,fontSize:13}}>{prev.all.length} accounts ready to import</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>Will be added to your debt list</div></div></div></div><div style={{display:"flex",gap:7}}><button className="btn bg bsm" onClick={()=>setStep("map")}>Back</button><button className="btn bp" style={{flex:1}} onClick={confirm}>Import now</button></div></>}
      </div>
    </div>
  );
}


// ── RESET MODAL ───────────────────────────────────────────────────────────────
function ResetModal({onClose,onConfirm}){
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Reset everything?</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.6}}>This will delete all your debts, assets, and settings. You'll start fresh from onboarding. This can't be undone.</div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn bg" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn" style={{flex:1,background:C.red,color:"#fff"}} onClick={onConfirm}>Yes, reset</button>
        </div>
      </div>
    </div>
  );
}

function PaywallModal({onClose,onUpgrade}){
  const FEATS=[["💬","AI Advisor that knows your situation","Ask anything — real answers, plain English"],["📅","Freedom Date","The exact month you'll be debt-free"],["📊","Debt-to-income tracker","Know if you're carrying too much debt"],["📈","AI credit analysis","Specific moves to improve your score"],["🎉","Milestones","Celebrate every win along the way"]];
  return(
    <div className="mover" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo">
        <div className="hdl"/>
        <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:30,marginBottom:7}}>✦</div><div style={{fontSize:18,fontWeight:800,marginBottom:5}}>Moneycode Plus</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>Everything you need to actually get out of debt — and stay out.</div></div>
        {FEATS.map(([e,t,s])=><div key={t} style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:10}}><span style={{fontSize:18,width:24,flexShrink:0,marginTop:1}}>{e}</span><div><div style={{fontWeight:600,fontSize:12}}>{t}</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>{s}</div></div></div>)}
        <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:7}}>
          <button className="btn bplus bfull" style={{fontSize:14,padding:13}} onClick={onUpgrade}>Start 14-day free trial</button>
          <div style={{textAlign:"center",fontSize:11,color:C.muted}}>Then $6.99/mo — or $59/yr (save 30%) · Cancel any time</div>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  // ── localStorage persistence ──────────────────────────────────────────────
  const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const [boarded,setBoarded_]=useState(()=>load("mc_boarded",false));
  const [name,setName_]=useState(()=>load("mc_name",""));
  const [tab,setTab]=useState("home");
  const [modal,setModal]=useState(null);
  const [editingDebt,setEditingDebt]=useState(null);
  const [milestoneCard,setMilestoneCard]=useState(null);
  const [showCert,setShowCert]=useState(false);
  const [activeLesson,setActiveLesson]=useState(null);
  const [completedLessons,setCompletedLessons_]=useState(()=>load("mc_lessons",[]));
  const [debts,setDebts_]=useState(()=>load("mc_debts",[]));
  const [assets,setAssets_]=useState(()=>load("mc_assets",[]));
  const [isPlus,setIsPlus_]=useState(()=>load("mc_plus",false));
  const [score,setScore_]=useState(()=>load("mc_score",672));
  const [income,setIncome_]=useState(()=>load("mc_income",0));
  const [efund,setEfund_]=useState(()=>load("mc_efund",0));
  const [toast,setToast]=useState(null);
  const [celebrate,setCel]=useState(null);
  const [showPW,setShowPW]=useState(false);

  // Persisted setters
  const setBoarded = v => { setBoarded_(v); save("mc_boarded",v); };
  const setName = v => { setName_(v); save("mc_name",v); };
  const setCompletedLessons = v => { const nv=typeof v==="function"?v(completedLessons):v; setCompletedLessons_(nv); save("mc_lessons",nv); };
  const setDebts = v => { const nv=typeof v==="function"?v(debts):v; setDebts_(nv); save("mc_debts",nv); };
  const setAssets = v => { const nv=typeof v==="function"?v(assets):v; setAssets_(nv); save("mc_assets",nv); };
  const setIsPlus = v => { setIsPlus_(v); save("mc_plus",v); };
  const setScore = v => { setScore_(v); save("mc_score",v); };
  const setIncome = v => { setIncome_(v); save("mc_income",v); };
  const setEfund = v => { setEfund_(v); save("mc_efund",v); };

  const pop=(msg,icon="✓")=>{setToast({msg,icon});setTimeout(()=>setToast(null),2200);};
  const upgrade=()=>{setIsPlus(true);setShowPW(false);pop("Welcome to Plus ✦","✦");};
  const onCelebrate=m=>{setCel(m);setTimeout(()=>setCel(null),3500);};

  if(!boarded) return (
    <>
      <style>{CSS}</style>
      <Onboarding onDone={d=>{
        setName(d.name);
        if(d.income>0) setIncome(d.income);
        if(d.firstDebt&&d.firstDebt.length>0) setDebts(d.firstDebt);
        setBoarded(true);
      }}/>
    </>
  );

  const TABS=[
    {id:"home",  l:"Home",   Icon:I.Home},
    {id:"debts", l:"Debts",  Icon:I.Debt},
    {id:"plan",  l:"Plan",   Icon:I.Plan},
    {id:"money", l:"Money",  Icon:I.Money},
    {id:"learn", l:"Learn",  Icon:I.Learn},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {tab!=="money"&&tab!=="learn"&&(
          <div className="hdr">
            <div className="logo">money<span style={{color:C.accent}}>code</span></div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              {isPlus
                ?<span className="tag tpl">✦ Plus</span>
                :<button className="btn bplus bsm" onClick={()=>setShowPW(true)}>✦ Plus</button>
              }
              <button className="btn bg bico bsm" onClick={()=>setModal("sync")}><I.Sync/></button>
            </div>
          </div>
        )}

        {tab==="home" &&<HomeTab   debts={debts} isPlus={isPlus} onSync={()=>setModal("sync")} onUpgrade={()=>setShowPW(true)} onCelebrate={onCelebrate} name={name} onAddDebt={()=>{setTab("debts");setModal("add");}} score={score} assets={assets} income={income} efund={efund} onOpenManage={()=>setTab("plan")} onShowCert={()=>setShowCert(true)}/>}
        {tab==="debts"&&<DebtsTab  debts={debts} setDebts={setDebts} openModal={setModal} pop={pop} onEdit={d=>setEditingDebt(d)}/>}
        {tab==="plan" &&<PlanTab   debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)} income={income} setIncome={setIncome}/>}
        {tab==="money"&&<MoneyTab  debts={debts} assets={assets} setAssets={setAssets} income={income} setIncome={setIncome} efund={efund} setEfund={setEfund} isPlus={isPlus} onUpgrade={()=>setShowPW(true)} pop={pop}/>}
        {tab==="learn"&&(
          <HealthAndLearnTab
            completedLessons={completedLessons}
            onCompleteLesson={id=>setCompletedLessons(x=>[...x.filter(v=>v!==id),id])}
            onOpenLesson={setActiveLesson}
            debts={debts} isPlus={isPlus} onUpgrade={()=>setShowPW(true)}
            score={score} setScore={setScore} assets={assets} income={income} efund={efund}
          />
        )}

        <nav className="tabbar">
          {TABS.map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <t.Icon/>{t.l}
              {t.id==="learn"&&completedLessons.length<LESSONS.length&&<div style={{position:"absolute",top:7,right:"calc(50% - 14px)",width:5,height:5,borderRadius:"50%",background:C.accent}}/>}
            </button>
          ))}
        </nav>

        {modal==="add"   &&<AddDebtModal onClose={()=>setModal(null)} onAdd={d=>{setDebts(x=>[...x,d]);pop("Debt added");}}/>}
        {editingDebt    &&<EditDebtModal debt={editingDebt} onClose={()=>setEditingDebt(null)} onSave={d=>{setDebts(x=>x.map(v=>v.id===d.id?d:v));setEditingDebt(null);pop("Updated");}}/>}
        {modal==="sync"  &&<SyncModal    debts={debts} onClose={()=>setModal(null)} onSync={u=>{setDebts(d=>d.map(x=>{const f=u.find(v=>v.id===x.id);return f?{...x,balance:Math.max(0,f.next)}:x;}));pop("Balances updated");}}/>}
        {modal==="import"&&<CSVModal     onClose={()=>setModal(null)} onImport={d=>{setDebts(x=>[...x,...d]);pop(`${d.length} debts imported`);}}/>}
        {modal==="reset" &&<ResetModal   onClose={()=>setModal(null)} onConfirm={()=>{localStorage.clear();window.location.reload();}}/>}
        {showPW          &&<PaywallModal onClose={()=>setShowPW(false)} onUpgrade={upgrade}/>}

        {activeLesson&&<LessonScreen lesson={activeLesson} onClose={()=>setActiveLesson(null)} onComplete={id=>{setCompletedLessons(x=>[...x.filter(v=>v!==id),id]);pop("Lesson complete! 🎓","🎓");}}/>}

        {toast&&<div className="toast" style={{animation:"tin .2s ease"}}><span style={{color:C.accent}}>{toast.icon}</span>{toast.msg}</div>}
        {celebrate&&<><Confetti/><div className="cel" onClick={()=>setCel(null)}><div style={{fontSize:64,animation:"pop .5s cubic-bezier(.34,1.56,.64,1)"}}>{celebrate.e}</div><div style={{fontSize:20,fontWeight:800,textAlign:"center"}}>{celebrate.t}</div><div style={{fontSize:13,color:C.muted,textAlign:"center",lineHeight:1.5}}>{celebrate.s}<br/><span style={{color:C.accent}}>You're doing it.</span></div><div style={{display:"flex",gap:8,marginTop:8}}><button className="btn bp" onClick={()=>{setCel(null);setMilestoneCard(celebrate);}}>🎉 Share this win</button><button className="btn bg bsm" onClick={()=>setCel(null)}>Close</button></div></div></>}
        {milestoneCard&&<MilestoneCard milestone={milestoneCard} name={name} debts={debts} onClose={()=>setMilestoneCard(null)}/>}
        {showCert&&<DebtFreeCert name={name} debts={debts} onClose={()=>setShowCert(false)}/>}
      </div>
    </>
  );
}


// ── INVESTMENT CALCULATOR ─────────────────────────────────────────────────────
function InvestCalcTab(){
  const [monthly,setMonthly]=useState(100);
  const [age,setAge]=useState(22);
  const [retireAge,setRetireAge]=useState(65);
  const [rate,setRate]=useState(10);
  const [lump,setLump]=useState(0);

  const years=Math.max(0,retireAge-age);
  const r=rate/100/12;
  const n=years*12;

  // Future value of monthly contributions + lump sum
  const fvMonthly = r>0 ? monthly*((Math.pow(1+r,n)-1)/r) : monthly*n;
  const fvLump = lump*Math.pow(1+rate/100,years);
  const total = fvMonthly + fvLump;
  const totalContributed = monthly*n + lump;
  const gains = total - totalContributed;

  // Build chart data — value at each decade
  const chartPoints = [];
  for(let y=0;y<=years;y+=Math.max(1,Math.floor(years/8))){
    const ny=y*12;
    const fv = r>0 ? monthly*((Math.pow(1+r,ny)-1)/r) : monthly*ny;
    const fl = lump*Math.pow(1+rate/100,y);
    chartPoints.push({year:age+y,value:Math.round(fv+fl)});
  }
  if(chartPoints[chartPoints.length-1]?.year !== retireAge){
    chartPoints.push({year:retireAge,value:Math.round(total)});
  }
  const maxVal = Math.max(...chartPoints.map(p=>p.value),1);

  const fmt2 = n => {
    if(n>=1000000) return "$"+(n/1000000).toFixed(1)+"M";
    if(n>=1000) return "$"+Math.round(n/1000)+"k";
    return "$"+Math.round(n);
  };

  return(
    <div className="scroll">
      <div style={{fontSize:13,color:C.muted,marginBottom:14,lineHeight:1.6}}>
        See how much your money can grow over time. Small amounts invested early make a massive difference.
      </div>

      {/* Result hero */}
      <div className="card" style={{background:"linear-gradient(135deg,#141B27,#0F1A14)",borderColor:C.success+"44",textAlign:"center",padding:20,marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>
          At age {retireAge} you could have
        </div>
        <div className="mono" style={{fontSize:38,fontWeight:500,color:C.success,letterSpacing:"-.02em"}}>{fmt2(total)}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:5}}>
          from {fmt2(totalContributed)} invested → <span style={{color:C.accent,fontWeight:600}}>{fmt2(gains)} in gains</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{marginBottom:12}}>
        <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Growth over time</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:100,marginBottom:6}}>
          {chartPoints.map((p,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{fontSize:8,color:C.muted,fontWeight:600}}>{fmt2(p.value)}</div>
              <div style={{width:"100%",background:`linear-gradient(to top,${C.success},${C.accent})`,borderRadius:"3px 3px 0 0",height:`${Math.max(4,(p.value/maxVal)*84)}px`,transition:"height .6s ease"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
          {chartPoints.filter((_,i)=>i===0||i===Math.floor(chartPoints.length/2)||i===chartPoints.length-1).map(p=>(
            <span key={p.year}>Age {p.year}</span>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <p className="lbl">Adjust the numbers</p>
      <div className="card" style={{marginBottom:10}}>
        <div className="fld">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <div className="flb">Monthly contribution</div>
            <span className="mono" style={{fontSize:13,color:C.accent}}>${monthly}</span>
          </div>
          <input className="sli" type="range" min="0" max="2000" step="25" value={monthly} onChange={e=>setMonthly(parseInt(e.target.value))}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:7}}>
            {[25,50,100,200,500].map(v=><button key={v} className={`btn bsm ${monthly===v?"bp":"bg"}`} onClick={()=>setMonthly(v)}>${v}</button>)}
          </div>
        </div>

        <div className="fld" style={{marginTop:4}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <div className="flb">Lump sum to start (optional)</div>
            <span className="mono" style={{fontSize:13,color:C.accent}}>${lump.toLocaleString()}</span>
          </div>
          <input className="sli" type="range" min="0" max="50000" step="500" value={lump} onChange={e=>setLump(parseInt(e.target.value))}/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginTop:4}}>
          <div className="fld">
            <div className="flb">Your age</div>
            <input className="inp mono" type="number" min="10" max="80" value={age} onChange={e=>setAge(Math.min(80,Math.max(10,parseInt(e.target.value)||22)))}/>
          </div>
          <div className="fld">
            <div className="flb">Retire at age</div>
            <input className="inp mono" type="number" min="30" max="90" value={retireAge} onChange={e=>setRetireAge(Math.min(90,Math.max(age+1,parseInt(e.target.value)||65)))}/>
          </div>
        </div>

        <div className="fld">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <div className="flb">Expected annual return</div>
            <span className="mono" style={{fontSize:13,color:rate>=10?C.success:rate>=7?C.accent:C.yellow}}>{rate}%</span>
          </div>
          <input className="sli" type="range" min="1" max="15" step="0.5" value={rate} onChange={e=>setRate(parseFloat(e.target.value))}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
            <span>Conservative (4–6%)</span>
            <span>S&P 500 avg (~10%)</span>
            <span>Aggressive (12–15%)</span>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <p className="lbl">What if you started later?</p>
      <div className="card" style={{marginBottom:12}}>
        {[0,5,10].map(delay=>{
          const yrs=Math.max(0,years-delay);
          const nd=yrs*12;
          const fvM=r>0?monthly*((Math.pow(1+r,nd)-1)/r):monthly*nd;
          const fvL=lump*Math.pow(1+rate/100,yrs);
          const tot=fvM+fvL;
          const contrib=monthly*nd+lump;
          return(
            <div key={delay} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:delay<10?`1px solid ${C.border}`:"none"}}>
              <div>
                <div style={{fontWeight:600,fontSize:12,color:delay===0?C.accent:C.text}}>{delay===0?"Start now":`Start in ${delay} years (age ${age+delay})`}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>Contributing for {yrs} years</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="mono" style={{fontSize:14,fontWeight:500,color:delay===0?C.success:C.muted}}>{fmt2(tot)}</div>
                {delay>0&&<div style={{fontSize:10,color:C.red,marginTop:1}}>-{fmt2(total-tot)} less</div>}
              </div>
            </div>
          );
        })}
        <div style={{marginTop:10,padding:"9px 11px",background:C.accent+"10",borderRadius:8,border:`1px solid ${C.accent}30`,fontSize:12,color:C.accent,fontWeight:600,lineHeight:1.5}}>
          ⏰ Waiting just 5 years costs you {fmt2(total-(()=>{const y2=Math.max(0,years-5)*12;const fv=r>0?monthly*((Math.pow(1+r,y2)-1)/r):monthly*y2;return fv+lump*Math.pow(1+rate/100,Math.max(0,years-5));})())} in potential gains.
        </div>
      </div>

      {/* Rule of 72 */}
      <p className="lbl">The Rule of 72</p>
      <div className="card">
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:8}}>
          Divide 72 by your interest rate to find out how many years it takes to double your money.
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,background:C.surface,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div className="mono" style={{fontSize:20,color:C.accent,fontWeight:500}}>{(72/rate).toFixed(1)} yrs</div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>to double at {rate}%</div>
          </div>
          <div style={{flex:1,background:C.surface,borderRadius:8,padding:"10px 12px",border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div className="mono" style={{fontSize:20,color:C.success,fontWeight:500}}>{Math.floor(years/(72/rate))}x</div>
            <div style={{fontSize:10,color:C.muted,marginTop:3}}>doubles by age {retireAge}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Combined Health + Learn tab ───────────────────────────────────────────────
function HealthAndLearnTab({completedLessons,onCompleteLesson,onOpenLesson,debts,isPlus,onUpgrade,score,setScore,assets,income,efund}){
  const [sub,setSub]=useState("lessons");
  return(
    <div style={{display:"flex",flexDirection:"column"}}>
      <div className="subnav" style={{background:C.surface,position:"sticky",top:0,zIndex:10}}>
        {[{id:"lessons",l:"Money 101"},{id:"health",l:"Health"},{id:"credit",l:"Credit"},{id:"calendar",l:"Calendar"},{id:"simulator",l:"Score Sim"},{id:"calculator",l:"Calculator"},{id:"ai",l:`AI${!isPlus?" ✦":""}`}].map(s=>(
          <button key={s.id} className={`snbtn${sub===s.id?" on":""}`} onClick={()=>setSub(s.id)}>{s.l}</button>
        ))}
      </div>
      {sub==="lessons"   &&<LearnTab completedLessons={completedLessons} onComplete={onCompleteLesson} onOpenLesson={onOpenLesson}/>}
      {sub==="calendar"  &&<BillCalendar debts={debts}/>}
      {sub==="simulator" &&<CreditSimulator debts={debts} score={score}/>}
      {sub==="health"    &&<HealthTab debts={debts} isPlus={isPlus} onUpgrade={onUpgrade} score={score} setScore={setScore} assets={assets} income={income} efund={efund} defaultSub="score"/>}
      {sub==="credit"    &&<HealthTab debts={debts} isPlus={isPlus} onUpgrade={onUpgrade} score={score} setScore={setScore} assets={assets} income={income} efund={efund} defaultSub="credit"/>}
      {sub==="calculator"&&<InvestCalcTab/>}
      {sub==="ai"        &&<HealthTab debts={debts} isPlus={isPlus} onUpgrade={onUpgrade} score={score} setScore={setScore} assets={assets} income={income} efund={efund} defaultSub="ai"/>}
    </div>
  );
}
