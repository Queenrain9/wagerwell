"use strict";
(function(){
const KEY="wagerwell-demo-v1";
const UNIT=100;const toUnit=n=>Math.max(0,Math.round(Number(n)||0));const fmt=n=>toUnit(n).toLocaleString("ko-KR");
const causes=[
{id:0,emoji:"🐾",title:"보호소 겨울 담요",tag:"PROJECT 001 · ANIMAL CARE",target:50000,base:18000,style:"a",desc:"유기동물 보호소에 겨울 담요를 마련하는 프로젝트. 코인이 모일수록 보호소가 더 따뜻해집니다."},
{id:1,emoji:"🍱",title:"따뜻한 한 끼 500인분",tag:"PROJECT 002 · MEAL SUPPORT",target:75000,base:31000,style:"b",desc:"따뜻한 한 끼를 채우는 금일 집중지원 프로젝트."},
{id:2,emoji:"📚",title:"작은 도서관 새 책",tag:"PROJECT 003 · EDUCATION",target:90000,base:43000,style:"c",desc:"작은 도서관의 빈 책장을 새 책들로 채우는 프로젝트."},
{id:3,emoji:"🌊",title:"바다 쓰레기 수거",tag:"PROJECT 004 · OCEAN",target:120000,base:53000,style:"d",desc:"해변에서 쓰레기를 수거하고 바다 생물의 서식지를 복원하는 프로젝트."}
];
const seed=()=>({coins:10000,donations:[0,0,0,0],history:[],claimed:"",total:0,count:0});
let s=seed();try{let v=JSON.parse(localStorage.getItem(KEY));if(v&&typeof v==="object"){s={...seed(),...v};s.coins=Math.max(0,Math.min(1e9,toUnit(s.coins)));s.donations=causes.map((_,i)=>toUnit(v.donations&&v.donations[i]));s.history=Array.isArray(v.history)?v.history.slice(0,20).map(x=>({...x,delta:(Number(x.delta)||0)===0?0:Math.sign(Number(x.delta)||0)*toUnit(Math.abs(Number(x.delta)||0))})):[];s.total=s.donations.reduce((a,b)=>a+b,0);s.count=Math.max(0,Math.floor(Number(s.count)||0));}}catch(_){}
let modalType="",currentCause=0,bj=null,baccaratResult=null,toastTimer=null;
const el=id=>document.getElementById(id);
function store(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(_){}}
function log(title,delta,detail){s.history.unshift({title,delta,detail,ts:new Date().toLocaleString("ko-KR")});s.history=s.history.slice(0,20);}
function showToast(msg){const t=el("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2800);}
function wallet(){el("balance").textContent=fmt(s.coins);el("sideBalance").textContent=fmt(s.coins);if(el("firstBalance"))el("firstBalance").textContent=fmt(s.coins);el("impactTotal").textContent=fmt(s.total);el("impactCount").textContent=fmt(s.count);el("claimBtn").textContent=s.coins<UNIT?"+ 무료 구제 코인 받기":s.claimed===new Date().toLocaleDateString("en-CA")?"오늘의 무료 코인 수령 완료":"+ 무료 코인 받기";}
function save(){store();wallet();renderHistory();renderCauses();}
function expense(n){if(!Number.isSafeInteger(n)||n<UNIT||n%UNIT!==0||n>s.coins){showToast("베팅/사용 금액은 100 C 단위로 선택하세요.");return false;}s.coins-=n;return true;}
function amount(min=UNIT,max=1000000,step=UNIT){let n=Number(el("betInput")?.value);if(!Number.isSafeInteger(n)||n<min||n>max||n%step!==0){showToast("금액은 "+fmt(min)+" C 이상, "+fmt(step)+" C 단위로 입력하세요.");return null;}return n;}
function pay(n){s.coins=Math.min(1e9,s.coins+toUnit(n));}
function betControl(label="BET AMOUNT",min=UNIT,presets=[100,500,1000,5000,10000]){
  const start=Math.min(Math.max(min,UNIT),Math.max(min,Math.floor(s.coins/UNIT)*UNIT));
  return '<div class="game-bankbar"><div class="modal-balance"><span>AVAILABLE</span><strong>ⓒ <span id="modalCoins">'+fmt(s.coins)+'</span></strong></div>'+
    '<div class="game-bet-control"><label>'+label+'<input id="betInput" aria-label="베팅 금액" type="number" min="'+min+'" max="1000000" step="'+UNIT+'" value="'+start+'"></label>'+
    '<div class="chip-row">'+presets.map(n=>'<button class="quick chip-btn" data-bet="'+n+'">'+fmt(n)+'</button>').join('')+'<button class="quick chip-btn max" data-bet="max">MAX</button></div></div></div>';
}
function syncModalCoins(){if(el("modalCoins"))el("modalCoins").textContent=fmt(s.coins);}
function result(msg){if(el("result"))el("result").textContent=msg;}
function open(title,kicker,html,type){
  modalType=type;
  el("modalTitle").textContent=title;
  el("modalKicker").textContent=kicker;
  el("modalBody").innerHTML=html;
  const dialog=el("modal").querySelector(".dialog");
  dialog.className="dialog"+(type&&["slots","baccarat","blackjack","roulette"].includes(type)?" game-dialog game-"+type:"");
  el("modal").classList.remove("hidden");
  el("modal").setAttribute("aria-hidden","false");
  el("closeModal").focus();
}
function close(){
  el("modal").classList.add("hidden");
  el("modal").setAttribute("aria-hidden","true");
  const dialog=el("modal").querySelector(".dialog");
  dialog.className="dialog";
  modalType="";
  bj=null;
}
function recordGame(name,stake,payout,detail){const paid=toUnit(payout);pay(paid);log(name,paid-stake,detail);save();syncModalCoins();}
function renderHistory(){const root=el("historyList");root.innerHTML="";if(!s.history.length){const p=document.createElement("p");p.className="hint";p.textContent="아직 거래 기록이 없습니다. 게임을 플레이하거나 광고 배너에 코인을 사용해 보세요.";root.append(p);return;}s.history.slice(0,8).forEach(h=>{const row=document.createElement("div");row.className="ledger-row";const left=document.createElement("div");const b=document.createElement("b");b.textContent=String(h.title||"GAME");const sm=document.createElement("small");sm.textContent=String(h.ts||"")+" · "+String(h.detail||"");left.append(b,sm);const val=document.createElement("strong");val.className=h.delta<0?"negative":"";val.textContent=(h.delta>=0?"+":"")+fmt(h.delta)+" C";row.append(left,val);root.append(row);});}
function renderCauses(){const root=el("causeGrid");root.innerHTML="";causes.forEach(c=>{const progress=Math.min(c.target,c.base+s.donations[c.id]),pct=Math.round(progress/c.target*100);const card=document.createElement("button");card.className="cause-card";card.dataset.cause=String(c.id);card.innerHTML='<div class="cause-cover '+c.style+'"><span>'+c.emoji+'</span><div><small>'+c.tag+'</small><b>'+c.title+'</b></div></div><div class="cause-meta"><div><span>PROJECT FUNDING</span><b>'+fmt(progress)+' / '+fmt(c.target)+' C</b></div><div class="progress"><span style="width:'+pct+'%"></span></div><small>'+(pct>=100?"프로젝트 목표 달성 ✓":"달성률 "+pct+"% · 후원하기 ↗")+'</small></div>';root.append(card);});}
function claim(){const today=new Date().toLocaleDateString("en-CA");let n=0;if(s.coins<UNIT){n=3000;}else if(s.claimed!==today){n=3000;s.claimed=today;}else{showToast("오늘의 무료 코인은 이미 받았어요. 잔액이 100 미만이면 구제 코인을 받을 수 있어요.");return;}pay(n);log("무료 코인",n,"DAILY BONUS");save();showToast(fmt(n)+" 코인이 지급됐어요.");}
function openCause(id){const c=causes[id];if(!c)return;currentCause=id;const progress=Math.min(c.target,c.base+s.donations[id]);const remaining=c.target-progress;open(c.title,"SPECIAL EVENT / "+c.tag,betControl("SUPPORT COINS")+'<div class="cause-detail-icon">'+c.emoji+'</div><h3 class="cause-detail-title">'+c.title+'</h3><p class="cause-description">'+c.desc+'</p><div class="cause-amount"><span>현재 진행액</span><span>'+fmt(progress)+' / '+fmt(c.target)+' C</span></div><div class="progress"><span style="width:'+(progress/c.target*100)+'%"></span></div><div class="action-row"><button id="donateBtn" class="play-btn" '+(!remaining?"disabled":"")+'>코인 보내기 ↗</button></div><div id="result" class="result">'+(remaining?"남은 목표 "+fmt(remaining)+" C":"목표 달성! 다른 프로젝트를 찾아보세요.")+'</div>',"cause");const inp=el("betInput");inp.max=Math.max(UNIT,remaining);inp.step=UNIT;inp.min=UNIT;inp.value=Math.min(UNIT,Math.max(UNIT,remaining),Math.max(UNIT,s.coins));el("donateBtn").onclick=()=>{const requested=amount();if(!requested)return;const room=Math.max(0,c.target-c.base-s.donations[id]);if(!room){showToast("이미 달성한 프로젝트입니다.");return;}const n=Math.min(requested,toUnit(room));if(n<UNIT||!expense(n))return;s.donations[id]+=n;s.total+=n;s.count+=1;log(c.title,-n,"EVENT SUPPORT");save();showToast(fmt(n)+" 코인으로 참여했어요.");openCause(id);};}
function openSlots(){
  const recent=[];
  const symbols=["A","K","Q","J","◆","♛"];
  const rows=5,cols=6;
  const cls=v=>v==="◆"?"gem":v==="♛"?"crown":"letter";
  const makeGrid=()=>Array.from({length:rows*cols},(_,i)=>'<i class="video-slot-symbol letter" id="slotCell'+i+'">A</i>').join("");
  const paytable={
    "♛":[[12,8],[10,4],[8,2],[5,.6]],
    "◆":[[12,6],[10,3],[8,1.5],[5,.5]],
    "A":[[12,3],[10,1.5],[8,.8],[5,.3]],
    "K":[[12,2.5],[10,1.2],[8,.6],[5,.25]],
    "Q":[[12,2],[10,1],[8,.5],[5,.2]],
    "J":[[12,1.5],[10,.8],[8,.4],[5,.15]]
  };
  const clusterPay=(v,count)=>{
    const row=paytable[v]||[];
    for(const [need,m] of row)if(count>=need)return m;
    return 0;
  };

  open("VAULT DROP","WAGERWELL SLOT · 6×5 TUMBLE",
    '<div class="game-statusbar"><span><i class="live-dot"></i> SLOT SERVER 01</span><b>VAULT DROP</b><em>MIN 100 C · 136 GAMES</em></div>'+
    '<div class="video-slot-frame">'+
      '<div class="video-slot-head"><span>7,776 WAYS</span><b>VAULT DROP</b><em>CLUSTER PAY</em></div>'+
      '<div class="video-slot-grid">'+makeGrid()+'</div>'+
      '<div class="video-slot-foot"><span><small>LAST WIN</small><b id="slotLastWin">0 C</b></span><span><small>TOTAL MULTI</small><b id="slotMulti">x0</b></span><span><small>BET RANGE</small><b>100–1M</b></span></div>'+
    '</div>'+
    '<div class="slot-paytable-real"><span><b>♛</b> 5+=0.6x · 8+=2x · 10+=4x · 12+=8x</span><span><b>◆</b> 5+=0.5x · 8+=1.5x · 10+=3x · 12+=6x</span><span><b>A/K/Q/J</b> 심볼별 배당 차등</span></div>'+
    betControl("BET",100,[100,500,1000,5000,10000])+
    '<div class="game-actionbar"><button id="spin" class="play-btn main-spin">SPIN</button><button class="quick" type="button">AUTO</button><button class="quick" type="button">PAYTABLE</button></div>'+
    '<div class="recent-panel"><div class="recent-head"><b>RECENT</b><span>최근 5회</span></div><div id="slotRecent" class="recent-strip"><i>—</i><i>—</i><i>—</i><i>—</i><i>—</i></div></div>'+
    '<div id="result" class="result casino-result">100 C부터 베팅 · 5개 이상 연결된 모든 클러스터가 합산됩니다.</div>'
  ,"slots");

  function clusters(grid){
    const seen=new Set(),hits=[],dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    for(let i=0;i<grid.length;i++){
      if(seen.has(i))continue;
      const v=grid[i],stack=[i],members=[];seen.add(i);
      while(stack.length){
        const cur=stack.pop();members.push(cur);
        const r=Math.floor(cur/cols),c=cur%cols;
        for(const [dr,dc] of dirs){
          const nr=r+dr,nc=c+dc;if(nr<0||nr>=rows||nc<0||nc>=cols)continue;
          const ni=nr*cols+nc;
          if(!seen.has(ni)&&grid[ni]===v){seen.add(ni);stack.push(ni);}
        }
      }
      if(members.length>=5)hits.push({v,count:members.length,members,mult:clusterPay(v,members.length)});
    }
    return hits;
  }

  el("spin").onclick=()=>{
    const n=amount(100);if(!n||!expense(n))return;
    const grid=Array.from({length:rows*cols},()=>symbols[Math.floor(Math.random()*symbols.length)]);
    grid.forEach((v,i)=>{
      const cell=el("slotCell"+i);
      cell.className="video-slot-symbol "+cls(v)+" spin-pop";
      cell.textContent=v;
      setTimeout(()=>cell.classList.remove("spin-pop"),220);
    });
    const hits=clusters(grid);
    const totalMult=hits.reduce((sum,h)=>sum+h.mult,0);
    const prize=Math.round(n*totalMult);
    hits.forEach(h=>h.members.forEach(i=>el("slotCell"+i)?.classList.add("cluster-hit")));
    setTimeout(()=>el("modalBody").querySelectorAll(".cluster-hit").forEach(x=>x.classList.remove("cluster-hit")),700);
    recordGame("VAULT DROP",n,prize,hits.length?hits.map(h=>h.v+"×"+h.count).join(", "):"NO CLUSTER");
    el("slotLastWin").textContent=fmt(prize)+" C";
    el("slotMulti").textContent="x"+(Math.round(totalMult*100)/100);
    recent.unshift(hits.length?(Math.round(totalMult*100)/100)+"x":"MISS");if(recent.length>5)recent.pop();
    el("slotRecent").innerHTML=Array.from({length:5},(_,i)=>'<i>'+(recent[i]||"—")+'</i>').join("");
    result(hits.length?"WIN · "+hits.length+" CLUSTER · PAY "+fmt(prize)+" C":"NO WIN · NEXT SPIN");
  };
}
const rank=card=>Math.min(10,card.r);function deck(){const cards=[];for(let d=0;d<4;d++)for(let r=1;r<=13;r++)cards.push({r,s:["♠","♥","♦","♣"][d]});for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
function handTotal(h){let v=0,a=0;h.forEach(c=>{v+=c.r===1?11:rank(c);if(c.r===1)a++;});while(v>21&&a){v-=10;a--;}return v;}
function cardsHtml(hand,hide=false){return hand.map((c,i)=>hide&&i===1?'<span class="card back">WW</span>':'<span class="card '+(c.s==="♥"||c.s==="♦"?"red":"")+'">'+(["A","2","3","4","5","6","7","8","9","10","J","Q","K"][c.r-1])+c.s+'</span>').join("");}
function bjView(){
  const running=bj&&bj.active;
  const dealerTotal=bj?(running?"?":handTotal(bj.dealer)):"—";
  const playerTotal=bj?handTotal(bj.player):"—";
  const canDouble=!!(running&&bj.player.length===2&&s.coins>=bj.baseBet);
  let html=
    '<div class="game-statusbar"><span><i class="live-dot"></i> TABLE 03</span><b>BLACKJACK</b><em>BLACKJACK 3:2 · WIN 1:1 · DEALER STAND 17</em></div>'+
    '<div class="bj-pro-table">'+
      '<div class="bj-dealer-stage"><div class="dealer-avatar">WW</div><div><small>DEALER</small><b>WAGERWELL TABLE</b><em>SHOE '+(bj?Math.max(12,Math.round(bj.cards.length/52*100)):100)+'%</em></div></div>'+
      '<div class="bj-felt-zone dealer-zone"><div class="zone-label"><span>DEALER</span><b>'+dealerTotal+'</b></div><div class="hand" id="dealerHand">'+(bj?cardsHtml(bj.dealer,running):'<span class="table-wait">WAITING FOR BET</span>')+'</div></div>'+
      '<div class="bj-felt-zone player-zone"><div class="zone-label"><span>PLAYER</span><b>'+playerTotal+'</b></div><div class="hand" id="playerHand">'+(bj?cardsHtml(bj.player):'<span class="table-wait">PLACE YOUR BET</span>')+'</div></div>'+
    '</div>'+
    betControl("BET",500,[500,1000,5000,10000,50000])+
    '<div class="game-actionbar bj-actions">'+
      (running?'<button class="play-btn" id="hit">HIT</button><button class="quick danger" id="stand">STAND</button>'+(canDouble?'<button class="quick bj-double" id="doubleDown">DOUBLE</button>':''):'<button class="play-btn" id="deal">DEAL CARDS</button>')+
    '</div>'+
    '<div class="game-info-grid"><div><small>PLAYER</small><b>'+playerTotal+'</b></div><div><small>DEALER</small><b>'+dealerTotal+'</b></div><div><small>'+(bj?"BET":"MIN BET")+'</small><b>'+(bj?fmt(bj.stake):"500")+' C</b></div></div>'+
    '<div id="result" class="result casino-result">'+(bj?bj.message:"500 C 이상 베팅 후 DEAL CARDS를 누르세요.")+'</div>';
  el("modalBody").innerHTML=html;
  if(running){
    el("betInput").disabled=true;
    el("hit").onclick=()=>{bj.player.push(bj.cards.pop());if(handTotal(bj.player)>21)finishBJ();else bjView();};
    el("stand").onclick=()=>finishBJ();
    if(canDouble)el("doubleDown").onclick=doubleBJ;
  }else el("deal").onclick=startBJ;
}
function openBlackjack(){bj=null;open("BLACKJACK","WAGERWELL TABLE · GAME 03","", "blackjack");bjView();}
function startBJ(){
  const n=amount(500);if(!n||!expense(n))return;
  const cards=deck();bj={baseBet:n,stake:n,cards,player:[cards.pop(),cards.pop()],dealer:[cards.pop(),cards.pop()],active:true,message:"PLAYER ACTION · HIT / STAND / DOUBLE"};
  save();
  if(handTotal(bj.player)===21||handTotal(bj.dealer)===21)finishBJ();else bjView();
}
function doubleBJ(){
  if(!bj||!bj.active||bj.player.length!==2||s.coins<bj.baseBet)return;
  if(!expense(bj.baseBet))return;
  bj.stake+=bj.baseBet;
  bj.player.push(bj.cards.pop());
  bj.message="DOUBLE DOWN · 1 CARD";
  finishBJ(true);
}
function finishBJ(){
  if(!bj||!bj.active)return;
  bj.active=false;
  const pt=handTotal(bj.player);let dt=handTotal(bj.dealer);
  const naturalP=bj.player.length===2&&pt===21,naturalD=bj.dealer.length===2&&dt===21;
  if(pt<=21&&!naturalP&&!naturalD)while(dt<17){bj.dealer.push(bj.cards.pop());dt=handTotal(bj.dealer);}
  let prize=0,label="LOSE";
  if(pt>21){label="BUST";}
  else if(naturalP&&!naturalD){prize=Math.round(bj.baseBet*2.5);label="BLACKJACK 3:2";}
  else if(naturalD&&!naturalP){label="DEALER BLACKJACK";}
  else if(pt===dt){prize=bj.stake;label="PUSH";}
  else if(dt>21||pt>dt){prize=bj.stake*2;label="WIN 1:1";}
  bj.message=label+" · PLAYER "+pt+" / DEALER "+dt+" · PAY "+fmt(prize)+" C";
  recordGame("BLACKJACK",bj.stake,prize,bj.message);bjView();
}
function baccaratScore(h){return h.reduce((n,c)=>n+(c.r===1?1:c.r>=10?0:c.r),0)%10;}
function baccaratRound(cards){const p=[cards.pop(),cards.pop()],b=[cards.pop(),cards.pop()];const p2=baccaratScore(p),b2=baccaratScore(b);if(p2>=8||b2>=8)return{p,b,pScore:p2,bScore:b2};let third=null;if(p2<=5){third=cards.pop();p.push(third);}if(third===null){if(b2<=5)b.push(cards.pop());}else{const x=third.r===1?1:third.r>=10?0:third.r;if(b2<=2||(b2===3&&x!==8)||(b2===4&&x>=2&&x<=7)||(b2===5&&x>=4&&x<=7)||(b2===6&&(x===6||x===7)))b.push(cards.pop());}return{p,b,pScore:baccaratScore(p),bScore:baccaratScore(b)};}
function openBaccarat(){
  baccaratResult=null;
  const road=[],bets={player:0,tie:0,banker:0,playerPair:0,bankerPair:0};
  let chip=500,lastBets=null;
  const total=()=>Object.values(bets).reduce((a,b)=>a+b,0);
  const renderRoad=()=>el("bacRoad")&&(el("bacRoad").innerHTML=Array.from({length:36},(_,i)=>{
    const r=road[i];return r?'<i class="'+r+'">'+(r==="player"?"P":r==="banker"?"B":"T")+'</i>':'<i></i>';
  }).join(""));
  const renderBets=()=>{
    el("modalBody").querySelectorAll("[data-bac-bet]").forEach(btn=>{
      const key=btn.dataset.bacBet,amount=bets[key]||0;
      const badge=btn.querySelector(".placed-bet");if(badge)badge.textContent=amount?fmt(amount)+" C":"";
      btn.classList.toggle("has-bet",amount>0);
    });
    if(el("bacTotalBet"))el("bacTotalBet").textContent=fmt(total())+" C";
    el("modalBody").querySelectorAll("[data-bac-chip]").forEach(btn=>btn.classList.toggle("selected",Number(btn.dataset.bacChip)===chip));
  };
  const addBet=key=>{
    const min=(key==="playerPair"||key==="bankerPair")?100:500;
    if(chip<min){showToast((min===500?"메인 베팅":"사이드 베팅")+" 최소 "+fmt(min)+" C");return;}
    if(total()+chip>s.coins){showToast("보유머니가 부족합니다.");return;}
    bets[key]+=chip;renderBets();
  };

  open("BACCARAT","WAGERWELL LIVE · TABLE 02",
    '<div class="game-statusbar"><span><i class="live-dot"></i> TABLE 02 · LIVE</span><b>WAGERWELL BACCARAT</b><em>MAIN 500 C · SIDE 100 C</em></div>'+
    '<div class="baccarat-live-stage">'+
      '<div class="live-video-panel"><div class="live-video-overlay"><span>LIVE</span><small>DEALER CAM 01</small></div><div class="video-bottom"><b>SPEED BACCARAT</b><em>BANKER COMMISSION 5%</em></div></div>'+
      '<div class="baccarat-side-stats"><div><small>PLAYER</small><b class="blue-txt">1:1</b></div><div><small>BANKER</small><b class="red-txt">0.95:1</b></div><div><small>TIE</small><b class="green">8:1</b></div><div><small>PAIR</small><b>11:1</b></div></div>'+
    '</div>'+
    '<div class="baccarat-board">'+
      '<div class="bac-hand player-hand"><div class="bac-label"><span>PLAYER</span><b id="pScore">—</b></div><div class="hand" id="pCards"><span class="table-wait">CARD WAIT</span></div></div>'+
      '<div class="bac-hand banker-hand"><div class="bac-label"><span>BANKER</span><b id="bScore">—</b></div><div class="hand" id="bCards"><span class="table-wait">CARD WAIT</span></div></div>'+
    '</div>'+
    '<div class="bac-bet-zones real-bac-zones">'+
      '<button class="choice bac-zone side-zone" data-bac-bet="playerPair"><small>PLAYER PAIR</small><b>11:1</b><em class="placed-bet"></em></button>'+
      '<button class="choice bac-zone player" data-bac-bet="player"><small>PLAYER</small><b>1:1</b><em class="placed-bet"></em></button>'+
      '<button class="choice bac-zone tie" data-bac-bet="tie"><small>TIE</small><b>8:1</b><em class="placed-bet"></em></button>'+
      '<button class="choice bac-zone banker" data-bac-bet="banker"><small>BANKER</small><b>0.95:1</b><em class="placed-bet"></em></button>'+
      '<button class="choice bac-zone side-zone" data-bac-bet="bankerPair"><small>BANKER PAIR</small><b>11:1</b><em class="placed-bet"></em></button>'+
    '</div>'+
    '<div class="table-chip-console"><div class="modal-balance"><span>AVAILABLE</span><strong>ⓒ <span id="modalCoins">'+fmt(s.coins)+'</span></strong></div><div class="casino-chip-rack">'+[100,500,1000,5000,10000].map(n=>'<button data-bac-chip="'+n+'">'+fmt(n)+'</button>').join('')+'</div><div class="table-total"><small>TOTAL BET</small><b id="bacTotalBet">0 C</b></div></div>'+
    '<div class="game-actionbar baccarat-actions"><button id="bacDeal" class="play-btn deal-wide">DEAL</button><button id="bacRebet" class="quick">REBET</button><button id="bacDouble" class="quick">DOUBLE</button><button id="bacClear" class="quick">CLEAR</button></div>'+
    '<div class="baccarat-road-panel"><div class="recent-head"><b>BEAD ROAD</b><span>최근 결과</span></div><div id="bacRoad" class="bac-road-grid"></div></div>'+
    '<div id="result" class="result casino-result">칩을 선택하고 원하는 베팅 영역에 올리세요.</div>'
  ,"baccarat");

  renderRoad();renderBets();
  el("modalBody").querySelectorAll("[data-bac-chip]").forEach(btn=>btn.onclick=()=>{chip=Number(btn.dataset.bacChip);renderBets();});
  el("modalBody").querySelectorAll("[data-bac-bet]").forEach(btn=>btn.onclick=()=>addBet(btn.dataset.bacBet));
  el("bacClear").onclick=()=>{Object.keys(bets).forEach(k=>bets[k]=0);renderBets();};
  el("bacDouble").onclick=()=>{
    const t=total();if(!t)return;
    if(t*2>s.coins){showToast("보유머니가 부족합니다.");return;}
    Object.keys(bets).forEach(k=>bets[k]*=2);renderBets();
  };
  el("bacRebet").onclick=()=>{
    if(!lastBets)return;
    const need=Object.values(lastBets).reduce((a,b)=>a+b,0);
    if(need>s.coins){showToast("보유머니가 부족합니다.");return;}
    Object.keys(bets).forEach(k=>bets[k]=lastBets[k]||0);renderBets();
  };
  el("bacDeal").onclick=()=>{
    const stake=total();if(!stake){showToast("베팅을 먼저 올려주세요.");return;}
    if(!expense(stake))return;
    lastBets={...bets};
    const r=baccaratRound(deck());
    el("pCards").innerHTML=cardsHtml(r.p);el("bCards").innerHTML=cardsHtml(r.b);
    el("pScore").textContent=r.pScore;el("bScore").textContent=r.bScore;
    const winner=r.pScore===r.bScore?"tie":r.pScore>r.bScore?"player":"banker";
    const pPair=r.p[0].r===r.p[1].r,bPair=r.b[0].r===r.b[1].r;
    let payout=0;
    if(winner==="player")payout+=bets.player*2;
    if(winner==="banker")payout+=Math.round(bets.banker*1.95);
    if(winner==="tie"){payout+=bets.tie*9;payout+=bets.player+bets.banker;}
    if(pPair)payout+=bets.playerPair*12;
    if(bPair)payout+=bets.bankerPair*12;
    road.unshift(winner);if(road.length>36)road.pop();renderRoad();
    recordGame("BACCARAT",stake,payout,"P "+r.pScore+" / B "+r.bScore+" · "+winner.toUpperCase()+(pPair?" · P PAIR":"")+(bPair?" · B PAIR":""));
    result(winner.toUpperCase()+" · "+(pPair?"PLAYER PAIR · ":"")+(bPair?"BANKER PAIR · ":"")+"PAY "+fmt(payout)+" C");
    Object.keys(bets).forEach(k=>bets[k]=0);renderBets();
  };
}
const redNums=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);const colorOf=n=>n===0?"green":redNums.has(n)?"red":"black";
function openRoulette(){
  const recent=[32,15,19,4,0,21],bets={};let chip=100,lastBets=null;
  const nums=Array.from({length:37},(_,i)=>i);
  const total=()=>Object.values(bets).reduce((a,b)=>a+b,0);
  const numberGrid='<div class="roulette-number-grid live-number-grid">'+nums.map(n=>'<button class="roulette-number '+colorOf(n)+'" data-rbet="n:'+n+'"><span>'+n+'</span><small></small></button>').join('')+'</div>';
  const outside=[
    ["red","RED","1:1"],["black","BLACK","1:1"],["odd","ODD","1:1"],["even","EVEN","1:1"],["low","1–18","1:1"],["high","19–36","1:1"],
    ["dozen1","1ST 12","2:1"],["dozen2","2ND 12","2:1"],["dozen3","3RD 12","2:1"],["col1","COL 1","2:1"],["col2","COL 2","2:1"],["col3","COL 3","2:1"]
  ];
  const outsideHtml='<div class="roulette-outside-bets real-outside">'+outside.map(([k,l,o])=>'<button class="choice" data-rbet="'+k+'"><span>'+l+'</span><b>'+o+'</b><small></small></button>').join('')+'</div>';
  const render=()=>{
    el("modalBody").querySelectorAll("[data-rbet]").forEach(btn=>{
      const v=bets[btn.dataset.rbet]||0,sm=btn.querySelector("small");if(sm)sm.textContent=v?fmt(v):"";
      btn.classList.toggle("has-bet",v>0);
    });
    el("modalBody").querySelectorAll("[data-rchip]").forEach(btn=>btn.classList.toggle("selected",Number(btn.dataset.rchip)===chip));
    if(el("rouletteTotalBet"))el("rouletteTotalBet").textContent=fmt(total())+" C";
  };
  const addBet=key=>{
    if(total()+chip>s.coins){showToast("보유머니가 부족합니다.");return;}
    bets[key]=(bets[key]||0)+chip;render();
  };

  open("LIVE ROULETTE","WAGERWELL LIVE · STUDIO 04",
    '<div class="game-statusbar"><span><i class="live-dot"></i> STUDIO 04 · LIVE</span><b>IMMERSIVE ROULETTE</b><em>MIN 100 C · SINGLE ZERO</em></div>'+
    '<div class="live-roulette-game">'+
      '<div class="live-roulette-video"><div class="lr-live"><i></i> LIVE</div><div class="lr-game-wheel"><span id="rouletteBall">—</span></div><div class="lr-caption"><small>STUDIO 04</small><b>IMMERSIVE ROULETTE</b><em>ROUND #1842</em></div></div>'+
      '<aside class="live-roulette-data"><div class="recent-head"><b>RECENT</b><span>LIVE DATA</span></div><div id="rouletteRecent" class="roulette-live-recent">'+recent.map(x=>'<i class="'+colorOf(x)+'">'+x+'</i>').join('')+'</div><div class="roulette-live-trend"><span>STRAIGHT <b>35:1</b></span><span>DOZEN/COL <b>2:1</b></span><span>EVEN MONEY <b>1:1</b></span></div></aside>'+
    '</div>'+
    '<div class="roulette-board-pro live-board">'+numberGrid+outsideHtml+'</div>'+
    '<div class="table-chip-console"><div class="modal-balance"><span>AVAILABLE</span><strong>ⓒ <span id="modalCoins">'+fmt(s.coins)+'</span></strong></div><div class="casino-chip-rack">'+[100,500,1000,5000,10000].map(n=>'<button data-rchip="'+n+'">'+fmt(n)+'</button>').join('')+'</div><div class="table-total"><small>TOTAL BET</small><b id="rouletteTotalBet">0 C</b></div></div>'+
    '<div class="game-actionbar roulette-actions"><button id="rouletteSpin" class="play-btn deal-wide">SPIN</button><button id="rouletteRebet" class="quick">REBET</button><button id="rouletteDouble" class="quick">DOUBLE</button><button id="rouletteClear" class="quick">CLEAR</button></div>'+
    '<div class="game-info-grid"><div><small>STRAIGHT</small><b>35:1</b></div><div><small>DOZEN / COLUMN</small><b>2:1</b></div><div><small>RED / BLACK ETC.</small><b>1:1</b></div></div>'+
    '<div id="result" class="result casino-result">칩을 선택하고 여러 베팅 영역에 동시에 올릴 수 있습니다.</div>'
  ,"roulette");

  render();
  el("modalBody").querySelectorAll("[data-rchip]").forEach(btn=>btn.onclick=()=>{chip=Number(btn.dataset.rchip);render();});
  el("modalBody").querySelectorAll("[data-rbet]").forEach(btn=>btn.onclick=()=>addBet(btn.dataset.rbet));
  el("rouletteClear").onclick=()=>{Object.keys(bets).forEach(k=>delete bets[k]);render();};
  el("rouletteDouble").onclick=()=>{
    const t=total();if(!t)return;
    if(t*2>s.coins){showToast("보유머니가 부족합니다.");return;}
    Object.keys(bets).forEach(k=>bets[k]*=2);render();
  };
  el("rouletteRebet").onclick=()=>{
    if(!lastBets)return;
    const need=Object.values(lastBets).reduce((a,b)=>a+b,0);
    if(need>s.coins){showToast("보유머니가 부족합니다.");return;}
    Object.keys(bets).forEach(k=>delete bets[k]);Object.assign(bets,lastBets);render();
  };
  el("rouletteSpin").onclick=()=>{
    const stake=total();if(!stake){showToast("베팅을 먼저 올려주세요.");return;}
    if(!expense(stake))return;
    lastBets={...bets};
    const ball=Math.floor(Math.random()*37),color=colorOf(ball);
    let payout=0;
    const wins=key=>{
      if(key.startsWith("n:"))return Number(key.slice(2))===ball?36:0;
      if(key==="red"||key==="black")return color===key?2:0;
      if(key==="odd")return ball!==0&&ball%2===1?2:0;
      if(key==="even")return ball!==0&&ball%2===0?2:0;
      if(key==="low")return ball>=1&&ball<=18?2:0;
      if(key==="high")return ball>=19&&ball<=36?2:0;
      if(key==="dozen1")return ball>=1&&ball<=12?3:0;
      if(key==="dozen2")return ball>=13&&ball<=24?3:0;
      if(key==="dozen3")return ball>=25&&ball<=36?3:0;
      if(key==="col1")return ball!==0&&(ball-1)%3===0?3:0;
      if(key==="col2")return ball!==0&&(ball-2)%3===0?3:0;
      if(key==="col3")return ball!==0&&ball%3===0?3:0;
      return 0;
    };
    Object.entries(bets).forEach(([k,v])=>payout+=v*wins(k));
    const dot=el("rouletteBall");dot.className=color;dot.textContent=String(ball);
    recent.unshift(ball);if(recent.length>8)recent.pop();
    el("rouletteRecent").innerHTML=recent.map(x=>'<i class="'+colorOf(x)+'">'+x+'</i>').join("");
    recordGame("ROULETTE",stake,payout,"BALL "+ball+" / "+color.toUpperCase());
    result((payout?"WIN":"LOSE")+" · "+ball+" "+color.toUpperCase()+" · PAY "+fmt(payout)+" C");
    Object.keys(bets).forEach(k=>delete bets[k]);render();
  };
}
function startGame(g){if(g==="slots")openSlots();else if(g==="baccarat")openBaccarat();else if(g==="blackjack")openBlackjack();else if(g==="roulette")openRoulette();}

const pageKeys=["home","live","slots","roulette","blackjack","events","money","notice","support"];
function renderPortalPage(key,{push=false}={}){
  if(!pageKeys.includes(key))key="live";
  document.querySelectorAll("[data-page-section]").forEach(node=>{
    node.classList.toggle("page-active",node.dataset.pageSection===key);
  });
  document.querySelectorAll(".main-nav [data-nav]").forEach(btn=>btn.classList.toggle("active",btn.dataset.nav===key));
  if(el("shellBalance"))el("shellBalance").textContent=fmt(s.coins);
  if(push){
    try{history.pushState({page:key},"","#"+key);}catch(_){location.hash=key;}
  }
  window.scrollTo({top:0,behavior:"smooth"});
}
function navigateTopMenu(key){renderPortalPage(key,{push:true});}
document.querySelectorAll(".main-nav [data-nav]").forEach(btn=>{
  btn.addEventListener("click",e=>{
    e.preventDefault();
    e.stopPropagation();
    navigateTopMenu(btn.dataset.nav);
  });
});
document.addEventListener("click",e=>{
  const jump=e.target.closest("[data-nav-jump]");
  if(!jump)return;
  e.preventDefault();
  navigateTopMenu(jump.dataset.navJump);
});
window.addEventListener("popstate",()=>renderPortalPage(location.hash.slice(1)||"live"));
renderPortalPage(location.hash.slice(1)||"live");

document.addEventListener("click",e=>{const b=e.target.closest("[data-game],[data-scroll],[data-cause],[data-close],[data-bet]");if(!b)return;if(b.dataset.close){close();return;}if(b.dataset.bet){const input=el("betInput");if(!input||input.disabled)return;input.value=b.dataset.bet==="max"?Math.max(UNIT,Math.floor(Math.min(1000000,s.coins)/UNIT)*UNIT):b.dataset.bet;return;}if(b.dataset.game){startGame(b.dataset.game);return;}if(b.dataset.cause!==undefined){openCause(Number(b.dataset.cause));return;}if(b.dataset.scroll){el(b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"});}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!el("modal").classList.contains("hidden"))close();if((e.key==="Enter"||e.key===" ")&&e.target.matches("[role=button][data-cause]")){e.preventDefault();openCause(Number(e.target.dataset.cause));}});
el("closeModal").onclick=close;el("claimBtn").onclick=claim;if(el("firstClaim"))el("firstClaim").onclick=claim;if(el("firstPromoClaim"))el("firstPromoClaim").onclick=claim;if(el("v2Daily"))el("v2Daily").onclick=claim;if(el("eventDaily"))el("eventDaily").onclick=claim;if(el("moneyClaim"))el("moneyClaim").onclick=claim;if(el("rightClaimBtn"))el("rightClaimBtn").onclick=claim;if(el("claimPromo"))el("claimPromo").onclick=claim;el("resetBtn").onclick=()=>{if(!confirm("현재 브라우저에 저장된 코인·게임 기록·지원 내역을 초기화할까요?"))return;s=seed();save();showToast("데모 데이터를 초기화했어요.");};
wallet();renderCauses();renderHistory();

el("tickerText").textContent="● LIVE | 바카라 전 테이블 정상 운영중   ◆   신규 무료충전 이벤트   ◆   금일 집중지원 이벤트 오픈   ◆   24H ONLINE";

(function enhanceCasinoPortal(){
  const main=document.querySelector(".center-stage");
  const grid=document.querySelector(".live-grid");
  if(grid){
    const extra=document.createElement("div");
    extra.className="extra-live-grid";
    extra.innerHTML=
      '<button class="game-tile bac-tile casino-room" data-game="baccarat"><span class="room-top"><b>LIVE</b><small>TABLE 07</small></span><span class="room-view fake-stream"><i class="dealer-mini"></i><em class="table-mini"></em><strong>NIGHT BACCARAT</strong></span><span class="roadmap"><i class="p"></i><i class="b"></i><i class="p"></i><i class="b"></i><i class="b"></i><i class="p"></i><i class="p"></i><i class="t"></i></span><span class="room-bottom"><span><b>나이트 바카라</b><small>MIN 500 C · OPEN</small></span><i>입장 ▶</i></span></button>'+
      '<button class="game-tile bac-tile casino-room" data-game="baccarat"><span class="room-top"><b>HOT</b><small>TABLE 08</small></span><span class="room-view fake-stream" style="background:radial-gradient(circle,#70264d,#1d0914)"><i class="dealer-mini"></i><em class="table-mini"></em><strong>RAPID BACCARAT</strong></span><span class="roadmap"><i class="b"></i><i class="p"></i><i class="b"></i><i class="p"></i><i class="t"></i><i class="p"></i><i class="b"></i><i class="b"></i></span><span class="room-bottom"><span><b>래피드 바카라</b><small>MIN 500 C · OPEN</small></span><i>입장 ▶</i></span></button>'+
      '<button class="game-tile bac-tile casino-room" data-game="baccarat"><span class="room-top"><b>VIP</b><small>TABLE 09</small></span><span class="room-view fake-stream" style="background:radial-gradient(circle,#6a4d18,#1b1305)"><i class="dealer-mini"></i><em class="table-mini"></em><strong>GOLD BACCARAT</strong></span><span class="roadmap"><i class="p"></i><i class="p"></i><i class="b"></i><i class="b"></i><i class="p"></i><i class="t"></i><i class="b"></i><i class="p"></i></span><span class="room-bottom"><span><b>골드 바카라</b><small>MIN 500 C · OPEN</small></span><i>입장 ▶</i></span></button>'+
      '<button class="game-tile bac-tile casino-room" data-game="baccarat"><span class="room-top"><b>LIVE</b><small>TABLE 10</small></span><span class="room-view fake-stream" style="background:radial-gradient(circle,#254b5f,#071621)"><i class="dealer-mini"></i><em class="table-mini"></em><strong>CLASSIC BACCARAT</strong></span><span class="roadmap"><i class="b"></i><i class="b"></i><i class="p"></i><i class="p"></i><i class="t"></i><i class="b"></i><i class="p"></i><i class="p"></i></span><span class="room-bottom"><span><b>클래식 바카라</b><small>MIN 500 C · OPEN</small></span><i>입장 ▶</i></span></button>';
    grid.insertAdjacentElement("afterend",extra);
  }

  const quick=document.querySelector(".quick-events");
  if(quick){
    const strip=document.createElement("div");
    strip.className="fake-win-strip";
    strip.innerHTML='<span>실시간 당첨</span><div class="fake-win-marquee">q***12 <b>+12,800 C</b>　k***09 <b>+22,000 C</b>　m***88 <b>+14,200 C</b>　p***31 <b>+5,600 C</b></div><em>최근 당첨 기록</em>';
    quick.insertAdjacentElement("afterend",strip);
  }

  const layer=document.createElement("div");
  layer.className="popup-layer";
  layer.id="promoLayer";
  layer.innerHTML=
    '<div class="popup-ad-card popup-left"><button class="popup-close" data-popup-close>×</button><span class="pop-tag">WELCOME BONUS</span><small>WAGERWELL 신규회원 이벤트</small><h2>매일 무료머니<br><em>3,000 C</em> 지급</h2><p>신규회원 웰컴 보너스</p><button class="pop-action" id="popupClaim">무료충전 받기 ▶</button></div>'+
    '<div class="popup-ad-card popup-right"><button class="popup-close" data-popup-close>×</button><span class="pop-tag">GOOD EVENT</span><small>오늘의 추천 프로젝트</small><h2>🐾 보호소<br>겨울 담요 지원</h2><p>보유 코인으로 참여할 수 있습니다.</p><button class="pop-action" data-cause="0">프로젝트 보기 ▶</button></div>'+
    '<label class="popup-today"><input type="checkbox" id="hidePromo"> 오늘은 팝업 그만 보기</label>';
  document.body.append(layer);

  const helper=document.createElement("div");
  helper.className="float-help";
  helper.innerHTML='<button data-scroll="history"><span>24H ONLINE</span><b>고객센터</b></button><button data-scroll="history">1:1 문의</button><button data-scroll="causes">이벤트</button><button id="floatClaim">무료충전</button>';
  document.body.append(helper);

  const dock=document.createElement("div");
  dock.className="bottom-quick";
  dock.innerHTML='<div class="site-width"><span><i></i> WAGERWELL LIVE</span><button class="hot" data-game="baccarat">바카라 바로입장</button><button id="dockClaim">무료머니</button><button data-scroll="causes">진행중 이벤트</button><em>24H LIVE</em></div>';
  document.body.append(dock);

  const key="wagerwell-hide-promo";
  const today=new Date().toLocaleDateString("en-CA");
  try{if(localStorage.getItem(key)===today)layer.classList.add("hidden");}catch(_){}
  layer.querySelectorAll("[data-popup-close]").forEach(btn=>btn.addEventListener("click",()=>layer.classList.add("hidden")));
  const hide=layer.querySelector("#hidePromo");
  if(hide)hide.addEventListener("change",()=>{if(hide.checked){try{localStorage.setItem(key,today);}catch(_){}layer.classList.add("hidden");}});
  const popClaim=layer.querySelector("#popupClaim");
  if(popClaim)popClaim.addEventListener("click",()=>{claim();layer.classList.add("hidden");});
  const fc=document.getElementById("floatClaim"); if(fc)fc.addEventListener("click",claim);
  const dc=document.getElementById("dockClaim"); if(dc)dc.addEventListener("click",claim);
})();
})();