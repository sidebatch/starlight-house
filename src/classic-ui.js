(function(){
  'use strict';
  const C=window.MakerContent,E=window.MakerEngine,S=window.MakerStatUI;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const groups={'마음과 몸':E.CORE_STATS,'전투 능력':['combat','attack','defense','magic','magicPower','magicDefense'],'생활과 교양':['strength','art','manners','cooking','housework','dexterity','faith']};
  const paths={
    plan:'M6 4h12v17H6z M9 2v5m6-5v5M9 11h6m-6 4h6',
    status:'M5 4h14v17H5zM8 8h3m3 0h2M8 12h3m3 0h2M8 16h3m3 0h2',
    outing:'M3 21V9l9-7 9 7v12M9 21v-8h6v8M1 21h22',
    wardrobe:'M9 3h6l1 3 6 3-3 5-3-2v9H8v-9l-3 2-3-5 6-3z',
    care:'M3 4h18v13H10l-5 5v-5H3zM7 9h10m-10 4h6',
    shop:'M4 8h16l1 13H3zM8 9V6a4 4 0 0 1 8 0v3',
    festival:'M8 3h8v8a4 4 0 0 1-8 0zM8 5H3v4a4 4 0 0 0 5 4m8-8h5v4a4 4 0 0 1-5 4M12 15v6m-5 0h10',
    journal:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1zm0 0v16',
    adventure:'M3 21 9 5l5 10 3-6 5 12zM9 5V2h6l-2 2h-4',dreams:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    home:'m2 11 10-9 10 9M5 9v13h14V9M10 22v-8h4v8'
  };
  function icon(id){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[id]||paths.dreams}"/></svg>`}
  function statRows(g,keys){return keys.map(key=>S.row({key,label:C.STATS[key].name,value:g.stats[key]})).join('')}
  function reputation(g,full=false){const scores=E.reputation(g);return '<div class="reputation-ledger">'+Object.entries(E.REPUTATIONS).map(([key,r])=>S.row({key,label:r.name.replace(' 평가',''),value:scores[key],scope:'reputation'})).join('')+'</div>'}
  function status(g,full=false){
    const panel=(title,keys,style)=>'<section class="ability-group stat-panel '+style+'"><h3>'+title+'</h3>'+statRows(g,keys)+'</section>';
    const core=panel('기본 능력',E.CORE_STATS,'core-panel');if(!full)return '<div class="status-ledger-mini">'+core+'</div>';
    const body='<section class="ability-group stat-panel body-panel"><h3>몸과 마음</h3>'+Object.entries({condition:'건강',fatigue:'피로',stress:'스트레스',trust:'친밀도'}).map(([key,label])=>S.row({key,label,value:g[key],max:100,scope:'condition'})).join('')+'</section>';
    const reputations='<section class="ability-group stat-panel reputation-panel"><h3>분야별 평가</h3>'+reputation(g,true)+'<p class="ability-note">능력과 일·전투·수확제의 실적을 함께 평가합니다.</p></section>';
    return '<div class="status-overview"><strong>'+esc(g.childName)+' · '+E.date(g).age+'세</strong></div><div class="status-ledger status-ledger-full"><div class="status-column">'+core+'</div><div class="status-column">'+panel('전투 능력',groups['전투 능력'],'combat-panel')+reputations+'</div><div class="status-column">'+panel('생활과 교양',groups['생활과 교양'],'culture-panel')+body+'</div><details class="status-notes stat-notes"><summary>육성 기록과 능력 설명</summary><p>교육 '+g.counters.weeksStudied+'회 · 아르바이트 '+g.counters.weeksWorked+'회 · 무사수행 '+g.counters.explorations+'회</p><p>전투기술은 검의 명중·회피, 공격력은 검의 위력, 방어력은 물리 피해 감소에 쓰입니다. 마법기술은 마법의 명중·회피, 마력은 주문의 위력, 항마력은 마법 피해 감소에 쓰입니다.</p><p>평가는 관련 능력과 쌓아 온 실적을 함께 반영합니다.</p></details></div>';
  }
  function render({game:g,plan,view,portrait,meter,content}){
    const d=E.date(g),title={home:'집',plan:'한 달 일정',status:'능력 일람',outing:'외출',journal:'성장 일지',adventure:'무사수행','harvest-run':'수확제',daily:'하루 일정',festival:'수확제',shop:'상점 · 소지품'}[view]||'집';
    const commands=[['plan','일정'],['status','능력'],['wardrobe','옷장'],['care','대화'],['shop','상점'],['festival','수확제'],['journal','일지'],['adventure','무사수행']];
    return `<div class="game-shell" data-view="${view}"><header class="game-top"><div class="game-title">✦ 별이 자라는 집</div><div class="game-calendar"><b>${d.year}</b>년 <strong>${d.month}월</strong><span>${E.season(g)}</span></div><div class="game-gold">소지금 <strong>${g.gold.toLocaleString('ko-KR')}</strong> G</div><button class="button" data-action="saves">저장함</button><button class="button install-button" data-pwa-action="install">설치</button><button class="button game-help" data-action="help">?</button></header>
      <main class="game-board">
      <section class="home-stage profile-card" aria-label="${esc(g.childName)}의 방"><div class="stage-heading">${C.ORIGINS[g.originId].room}<span> ${d.age}세의 ${E.season(g)}</span></div><div class="stage-picture">${portrait()}</div><div class="stage-floor">${esc(g.childName)} · ${d.age}세 · ${E.mood(g)}</div></section>
      <aside class="command-panel"><div class="command-heading"><h1>${esc(g.childName)}</h1><span>${d.age}세 · ${C.ORIGINS[g.originId].name}의 가족</span></div><nav class="game-commands tabs" aria-label="육성 메뉴">${commands.map(([id,label])=>`<button class="command tab ${id===view?'active':''}" ${id==='wardrobe'||id==='care'?`data-action="${id}"`:`data-action="view" data-view="${id}"`} ${id==='care'&&(g.careMonth===g.elapsed||g.phase!=='planning')?'disabled':''}>${icon(id)}<span>${label}</span></button>`).join('')}</nav><div class="month-notebook"><h3>이달의 일정</h3>${plan.map((id,i)=>`<div><span>${E.periodLabel(g,i).split(' · ')[0]}</span><b>${id?E.activities[id].name:'미정'}</b></div>`).join('')}</div></aside>
      <section class="home-dialogue" aria-label="아이의 대화"><div class="speaker-name">${esc(g.childName)}</div><p>“${esc(E.characterVoice(g))}”</p>${['adventure','festival','daily'].includes(g.phase)?'<button class="button primary" data-action="resume-run">진행 중인 여정으로 ▸</button>':g.phase==='event'?'<button class="button primary" data-action="pending-event">이야기 이어보기 ▸</button>':g.phase==='ending'?'<button class="button primary" data-action="ending">열여덟 살의 이야기 ▸</button>':`<span class="dialogue-cue">${E.mood(g)} <b>◆</b></span>`}</section>
      ${view!=='home'?`<section class="game-window" aria-label="${title}"><header class="window-bar"><h2>${title}</h2><button class="button" data-action="view" data-view="home">집으로 ×</button></header><div id="main-view" class="window-content">${content}</div></section>`:''}
      </main><footer class="game-bottom"><span>${d.age}세의 기록 · ${g.elapsed} / 96개월</span><span>교육과 일, 휴식으로 함께하는 여덟 해</span></footer></div>`;
  }
  window.MakerClassic={render,status};
})();
