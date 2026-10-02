const fmtPct=v=>v===null||v===undefined||v===""?"—":Number(v).toFixed(1)+"%";
const fmtPP=v=>v===null||v===undefined||v===""?"—":(Number(v)>0?"+":"")+Number(v).toFixed(1)+" pp";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function loadJSON(path){const r=await fetch(path);if(!r.ok)throw new Error(path);return r.json();}

async function initResults(){
  const data=await loadJSON("data/qb_results.json");
  const table=document.querySelector("#qb-table");
  const tbody=table.querySelector("tbody");
  const search=document.querySelector("#qb-search");
  const count=document.querySelector("#qb-count");
  const wrap=document.querySelector("#qb-results-wrap");
  const viewLabel=document.querySelector("#qb-view-label");
  const viewButtons=[...document.querySelectorAll("[data-result-view]")];
  const scrollLeft=document.querySelector("#qb-scroll-left");
  const scrollRight=document.querySelector("#qb-scroll-right");
  const topScroll=document.querySelector("#qb-top-scroll");
  const topScrollInner=document.querySelector("#qb-top-scroll-inner");

  const views={
    core:{
      label:"Core results",
      columns:["rank","qb","opportunities","cdcr_pct","clutch_response_events"]
    },
    adjusted:{
      label:"Adjusted metrics",
      columns:["rank","qb","opportunities","xcdcr_pct","cae_pp","cae_rank","sdcr_pct","sdcr_rank"]
    },
    outcomes:{
      label:"Outcomes & responses",
      columns:["rank","qb","opportunities","cdcr_pct","clutch_response_events","trailing_cdcr_rank","trailing_sdcr_rank","raw_outcome_rank","adjusted_outcome_rank","conversion_nonwin_pct"]
    },
    all:{
      label:"All columns",
      columns:["rank","qb","opportunities","cdcr_pct","clutch_response_events","xcdcr_pct","cae_pp","cae_rank","sdcr_pct","sdcr_rank","trailing_cdcr_rank","trailing_sdcr_rank","raw_outcome_rank","adjusted_outcome_rank","conversion_nonwin_pct"]
    }
  };

  let sortKey="rank",dir=1,activeView="core";

  function applyView(){
    const visible=new Set(views[activeView].columns);
    table.querySelectorAll("[data-col]").forEach(el=>{
      el.hidden=!visible.has(el.dataset.col);
    });
    viewButtons.forEach(btn=>btn.classList.toggle("active",btn.dataset.resultView===activeView));
    viewLabel.textContent=views[activeView].label;
  }

  function syncTopScrollbarWidth(){
    topScrollInner.style.width=table.scrollWidth+"px";
  }

  function render(){
    const q=(search.value||"").toLowerCase();
    let rows=data.filter(r=>!q||r.qb.toLowerCase().includes(q)||r.teams.toLowerCase().includes(q));
    rows.sort((a,b)=>{
      const av=a[sortKey],bv=b[sortKey];
      if(av===null||av===undefined)return 1;if(bv===null||bv===undefined)return -1;
      if(typeof av==="number"&&typeof bv==="number")return (av-bv)*dir;
      return String(av).localeCompare(String(bv))*dir;
    });
    count.textContent=rows.length+" quarterbacks";
    tbody.innerHTML=rows.map(r=>`<tr>
      <td data-col="rank">${r.rank}</td>
      <td data-col="qb"><strong><a href="players.html?qb=${encodeURIComponent(r.qb_id)}">${esc(r.qb)}</a></strong><br><span class="fineprint">${esc(r.teams)}</span></td>
      <td data-col="opportunities">${r.opportunities}</td>
      <td data-col="cdcr_pct">${fmtPct(r.cdcr_pct)}</td>
      <td data-col="clutch_response_events">${r.clutch_response_events}</td>
      <td data-col="xcdcr_pct">${fmtPct(r.xcdcr_pct)}</td>
      <td data-col="cae_pp" class="${r.cae_pp>0?"positive":r.cae_pp<0?"negative":""}">${fmtPP(r.cae_pp)}</td>
      <td data-col="cae_rank">${r.cae_rank??"—"}</td>
      <td data-col="sdcr_pct">${fmtPct(r.sdcr_pct)}</td>
      <td data-col="sdcr_rank">${r.sdcr_rank??"—"}</td>
      <td data-col="trailing_cdcr_rank">${r.trailing_cdcr_rank??"—"}</td>
      <td data-col="trailing_sdcr_rank">${r.trailing_sdcr_rank??"—"}</td>
      <td data-col="raw_outcome_rank">${r.raw_outcome_rank??"—"}</td>
      <td data-col="adjusted_outcome_rank">${r.adjusted_outcome_rank??"—"}</td>
      <td data-col="conversion_nonwin_pct">${fmtPct(r.conversion_nonwin_pct)}</td>
    </tr>`).join("");
    applyView();
    requestAnimationFrame(syncTopScrollbarWidth);
  }

  search.addEventListener("input",render);
  table.querySelectorAll("th[data-key]").forEach(th=>th.addEventListener("click",()=>{
    const k=th.dataset.key;if(sortKey===k)dir*=-1;else{sortKey=k;dir=1}render();
  }));
  viewButtons.forEach(btn=>btn.addEventListener("click",()=>{
    activeView=btn.dataset.resultView;
    wrap.scrollLeft=0;
    topScroll.scrollLeft=0;
    applyView();
    requestAnimationFrame(syncTopScrollbarWidth);
  }));

  let syncing=false;
  topScroll.addEventListener("scroll",()=>{
    if(syncing)return;
    syncing=true;
    wrap.scrollLeft=topScroll.scrollLeft;
    requestAnimationFrame(()=>{syncing=false});
  });
  wrap.addEventListener("scroll",()=>{
    if(syncing)return;
    syncing=true;
    topScroll.scrollLeft=wrap.scrollLeft;
    requestAnimationFrame(()=>{syncing=false});
  });

  scrollLeft.addEventListener("click",()=>wrap.scrollBy({left:-Math.max(320,wrap.clientWidth*.7),behavior:"smooth"}));
  scrollRight.addEventListener("click",()=>wrap.scrollBy({left:Math.max(320,wrap.clientWidth*.7),behavior:"smooth"}));
  window.addEventListener("resize",syncTopScrollbarWidth);

  render();
}

async function initExplore(){
  const data=await loadJSON("data/decisions.json");
  const tbody=document.querySelector("#decision-table tbody");
  const search=document.querySelector("#decision-search");
  const cls=document.querySelector("#decision-class");
  const result=document.querySelector("#decision-result");
  const season=document.querySelector("#decision-season");
  const count=document.querySelector("#decision-count");
  const note=document.querySelector("#decision-page-note");
  const pnum=document.querySelector("#page-number");
  const prev=document.querySelector("#prev-page");
  const next=document.querySelector("#next-page");
  const PAGE=100;let page=0;
  const scoreLabel=d=>d===0?"Tied":d<0?"Down "+Math.abs(d):"Up "+d;
  function filtered(){
    const q=(search.value||"").toLowerCase().trim();
    return data.filter(r=>{
      if(q&&!([r.qb,r.offense,r.opponent,r.game_id].join(" ").toLowerCase().includes(q)))return false;
      if(cls.value&&r.classification!==cls.value)return false;
      if(result.value&&r.team_result!==result.value)return false;
      if(season.value&&String(r.season)!==season.value.trim())return false;
      return true;
    });
  }
  function render(reset=false){
    if(reset)page=0;
    const rows=filtered();const pages=Math.max(1,Math.ceil(rows.length/PAGE));page=Math.min(page,pages-1);
    const slice=rows.slice(page*PAGE,(page+1)*PAGE);
    count.textContent=rows.length.toLocaleString();
    note.textContent=rows.length?" · showing "+(page*PAGE+1)+"–"+Math.min((page+1)*PAGE,rows.length):"";
    pnum.textContent="Page "+(page+1)+" of "+pages;prev.disabled=page===0;next.disabled=page>=pages-1;
    tbody.innerHTML=slice.map(r=>`<tr>
      <td>${esc(r.game_date)}</td>
      <td><strong>${esc(r.qb)}</strong></td>
      <td>${esc(r.offense)} vs ${esc(r.opponent)}<br><span class="fineprint">${esc(r.game_id)}</span></td>
      <td>Q${r.quarter} ${esc(r.clock)}</td>
      <td>${scoreLabel(r.score_diff)}</td>
      <td>${esc(r.field_position||"—")}</td>
      <td>${esc(r.required_result)}</td>
      <td><span class="decision-badge ${esc(r.classification)}">${esc(r.classification)}</span></td>
      <td>${esc(r.team_result)}</td>
      <td>${fmtPct(r.xcdcr_pct)}</td>
      <td>${esc(r.decision_note||"—")}${r.manual_override?' <span class="fineprint">(audited override)</span>':''}</td>
    </tr>`).join("");
  }
  [search,cls,result,season].forEach(el=>el.addEventListener("input",()=>render(true)));
  prev.addEventListener("click",()=>{if(page>0){page--;render();scrollTo({top:document.querySelector(".ledger-summary").offsetTop-100,behavior:"smooth"})}});
  next.addEventListener("click",()=>{page++;render();scrollTo({top:document.querySelector(".ledger-summary").offsetTop-100,behavior:"smooth"})});
  render();
}


async function initPlayers(){
  const data=await loadJSON("data/player_trajectories.json");
  const select=document.querySelector("#trajectory-qb");
  const chart=document.querySelector("#trajectory-chart");
  const title=document.querySelector("#trajectory-title");
  const summary=document.querySelector("#trajectory-summary");
  const tbody=document.querySelector("#trajectory-table tbody");
  const buttons=[...document.querySelectorAll("[data-scope]")];
  const params=new URLSearchParams(location.search);
  let scope=params.get("scope")==="overall"?"overall":"trailing";

  const latestByQB=new Map();
  data.forEach(r=>{
    const prev=latestByQB.get(r.qb_id);
    if(!prev||r.snapshot_season>prev.snapshot_season)latestByQB.set(r.qb_id,r);
  });
  const qbs=[...latestByQB.values()].sort((a,b)=>a.qb.localeCompare(b.qb));
  select.innerHTML=qbs.map(r=>`<option value="${esc(r.qb_id)}">${esc(r.qb)}</option>`).join("");
  const requested=params.get("qb");
  select.value=latestByQB.has(requested)?requested:(latestByQB.has("00-0036442")?"00-0036442":qbs[0].qb_id);

  const fmtRank=(v,n)=>v?`#${v} of ${n}`:"Provisional";

  function linePath(rows,key,x,y){
    return rows.map((r,i)=>(i?"L":"M")+x(r.snapshot_season).toFixed(1)+","+y(r[key]).toFixed(1)).join(" ");
  }
  function areaPath(rows,x,y){
    if(!rows.length)return "";
    const upper=rows.map((r,i)=>(i?"L":"M")+x(r.snapshot_season).toFixed(1)+","+y(r.sdcr_95_high_pct).toFixed(1)).join(" ");
    const lower=[...rows].reverse().map(r=>"L"+x(r.snapshot_season).toFixed(1)+","+y(r.sdcr_95_low_pct).toFixed(1)).join(" ");
    return upper+" "+lower+" Z";
  }

  function draw(rows){
    const W=960,H=430,m={l:58,r:24,t:28,b:54};
    const seasons=rows.map(r=>r.snapshot_season);
    const vals=rows.flatMap(r=>[r.raw_cdcr_pct,r.sdcr_pct,r.sdcr_95_low_pct,r.sdcr_95_high_pct]).filter(Number.isFinite);
    let ymin=Math.max(0,Math.floor((Math.min(...vals)-6)/5)*5);
    let ymax=Math.min(100,Math.ceil((Math.max(...vals)+6)/5)*5);
    if(ymax-ymin<20){const mid=(ymax+ymin)/2;ymin=Math.max(0,mid-10);ymax=Math.min(100,mid+10);}
    const xmin=Math.min(...seasons),xmax=Math.max(...seasons);
    const x=s=>m.l+(s-xmin)/Math.max(1,xmax-xmin)*(W-m.l-m.r);
    const y=v=>m.t+(ymax-v)/(ymax-ymin)*(H-m.t-m.b);
    const yticks=[];for(let v=Math.ceil(ymin/10)*10;v<=ymax;v+=10)yticks.push(v);
    const eligibility=rows.find(r=>r.eligible_for_rank);

    const grid=yticks.map(v=>`<g><line x1="${m.l}" y1="${y(v)}" x2="${W-m.r}" y2="${y(v)}" class="chart-grid"/><text x="${m.l-10}" y="${y(v)+4}" text-anchor="end" class="chart-axis">${v}%</text></g>`).join("");
    const xticks=rows.map((r,i)=>i===0||i===rows.length-1||r.snapshot_season%2===0?`<text x="${x(r.snapshot_season)}" y="${H-22}" text-anchor="middle" class="chart-axis">${r.snapshot_season}</text>`:"").join("");
    const marker=eligibility?`<g><line x1="${x(eligibility.snapshot_season)}" y1="${m.t}" x2="${x(eligibility.snapshot_season)}" y2="${H-m.b}" class="eligibility-line"/><text x="${x(eligibility.snapshot_season)+6}" y="${m.t+14}" class="eligibility-label">rank eligible</text></g>`:"";
    const rawPts=rows.map(r=>`<circle cx="${x(r.snapshot_season)}" cy="${y(r.raw_cdcr_pct)}" r="3.4" class="chart-point raw"><title>${r.snapshot_season}: CDCR ${r.raw_cdcr_pct.toFixed(1)}% · ${r.raw_cdcr_rank?("#"+r.raw_cdcr_rank):"provisional"}</title></circle>`).join("");
    const sPts=rows.map(r=>`<circle cx="${x(r.snapshot_season)}" cy="${y(r.sdcr_pct)}" r="3.4" class="chart-point standardized"><title>${r.snapshot_season}: sCDCR ${r.sdcr_pct.toFixed(1)}% · ${r.sdcr_rank?("#"+r.sdcr_rank):"provisional"}</title></circle>`).join("");

    chart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="CDCR and standardized CDCR by season-end">
      ${grid}${xticks}${marker}
      <path d="${areaPath(rows,x,y)}" class="confidence-band"/>
      <path d="${linePath(rows,"raw_cdcr_pct",x,y)}" class="trajectory-line raw"/>
      <path d="${linePath(rows,"sdcr_pct",x,y)}" class="trajectory-line standardized"/>
      ${rawPts}${sPts}
    </svg>`;
  }

  function render(){
    buttons.forEach(b=>b.classList.toggle("active",b.dataset.scope===scope));
    const qid=select.value;
    const allRows=data.filter(r=>r.qb_id===qid&&r.scope===scope).sort((a,b)=>a.snapshot_season-b.snapshot_season);
    if(!allRows.length)return;

    // v1 display rule: keep every as-of snapshot in the downloadable audit
    // data, but stop the visible trajectory at the final season in which the
    // QB added a new qualifying opportunity in the selected scope. This
    // prevents retired/inactive players from showing flat ghost extensions
    // through later league seasons. A trailing-only trajectory can therefore
    // end earlier than the overall trajectory.
    let lastGrowthIndex=0;
    for(let i=1;i<allRows.length;i++){
      if(allRows[i].n>allRows[i-1].n)lastGrowthIndex=i;
    }
    const rows=allRows.slice(0,lastGrowthIndex+1);
    const latest=rows[rows.length-1];
    title.textContent=latest.qb+" · "+(scope==="trailing"?"trailing CDCR opps":"all CDCR opps")+" · through "+latest.snapshot_season;
    summary.innerHTML=`<div><span>Current CDCR</span><strong>${fmtPct(latest.raw_cdcr_pct)}</strong><small>${fmtRank(latest.raw_cdcr_rank,latest.eligible_cohort_size)}</small></div>
      <div><span>Current sCDCR</span><strong>${fmtPct(latest.sdcr_pct)}</strong><small>${fmtRank(latest.sdcr_rank,latest.eligible_cohort_size)}</small></div>
      <div><span>Evidence</span><strong>${latest.n} CDCR opps</strong><small>${latest.conversions} conversions</small></div>
      <div><span>Current 95% interval</span><strong>${latest.sdcr_95_low_pct.toFixed(1)}–${latest.sdcr_95_high_pct.toFixed(1)}%</strong><small>sCDCR uncertainty</small></div>`;
    draw(rows);
    tbody.innerHTML=[...rows].reverse().map(r=>`<tr>
      <td>${r.snapshot_season}</td><td>${r.n}</td><td>${r.conversions}</td>
      <td>${fmtPct(r.raw_cdcr_pct)}</td><td>${r.raw_cdcr_rank?("#"+r.raw_cdcr_rank):"—"}</td>
      <td>${fmtPct(r.mean_xcdcr_pct)}</td><td class="${r.cae_pp>0?"positive":r.cae_pp<0?"negative":""}">${fmtPP(r.cae_pp)}</td>
      <td>${fmtPct(r.sdcr_pct)}</td><td>${r.sdcr_rank?("#"+r.sdcr_rank):"—"}</td>
      <td>${r.sdcr_95_low_pct.toFixed(1)}–${r.sdcr_95_high_pct.toFixed(1)}%</td>
      <td>${r.status==="RANKED"?"Ranked":"Provisional"}</td>
    </tr>`).join("");
    const u=new URL(location.href);u.searchParams.set("qb",qid);u.searchParams.set("scope",scope);history.replaceState(null,"",u);
  }

  select.addEventListener("change",render);
  buttons.forEach(b=>b.addEventListener("click",()=>{scope=b.dataset.scope;render();}));
  render();
}

function initInteractivePages(){
  if(document.querySelector("#qb-table")) initResults();
  if(document.querySelector("#trajectory-table")) initPlayers();
  if(document.querySelector("#decision-table")) initExplore();
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",initInteractivePages);
}else{
  initInteractivePages();
}
