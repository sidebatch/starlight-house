(function(){
  'use strict';
  const C=window.MakerContent,E=window.MakerEngine;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const groups={ '기본 능력':['vitality','strength','intellect','elegance','charm','sensitivity','morality','faith'], '배운 기술':['combat','magic','art','manners','cooking','housework','dexterity'] };
  const paths={
    plan:'M6 4h12v17H6z M9 2v5m6-5v5M9 11h6m-6 4h6',
    status:'M5 4h14v17H5zM8 8h3m3 0h2M8 12h3m3 0h2M8 16h3m3 0h2',
    outing:'M3 21V9l9-7 9 7v12M9 21v-8h6v8M1 21h22',
    wardrobe:'M9 3h6l1 3 6 3-3 5-3-2v9H8v-9l-3 2-3-5 6-3z',
    care:'M3 4h18v13H10l-5 5v-5H3zM7 9h10m-10 4h6',
    shop:'M4 8h16l1 13H3zM8 9V6a4 4 0 0 1 8 0v3',
    festival:'M8 3h8v8a4 4 0 0 1-8 0zM8 5H3v4a4 4 0 0 0 5 4m8-8h5v4a4 4 0 0 1-5 4M12 15v6m-5 0h10',
    journal:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1zm0 0v16',
    dreams:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    home:'m2 11 10-9 10 9M5 9v13h14V9M10 22v-8h4v8'
  };
  function icon(id){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[id]||paths.dreams}"/></svg>`}
  function statRows(g,keys){return keys.map(key=>{const delta=g.lastReport?g.lastReport.after.stats[key]-g.lastReport.before.stats[key]:0;return `<div class="ability-row" data-stat="${key}"><span>${C.STATS[key].name}</span><div class="ability-track"><i style="width:${g.stats[key]/999*100}%"></i></div><strong>${g.stats[key]}</strong>${delta?`<small>${delta>0?'+':''}${delta}</small>`:'<small></small>'}</div>`}).join('')}
  function status(g,full=false){return `<div class="${full?'status-ledger':'status-ledger-mini'}">${Object.entries(groups).map(([name,keys])=>`<section class="ability-group"><h3>${name}</h3>${statRows(g,keys)}</section>`).join('')}${full?`<section class="ability-group status-notes"><h3>육성 기록</h3><p>교육 ${g.counters.weeksStudied}주 · 아르바이트 ${g.counters.weeksWorked}주 · 무사수행 ${g.counters.explorations}회</p><p>능력치 최대 999. 작은 숫자는 지난달의 변화입니다. 일정에서 교육·일·휴식을 선택하면 해당 능력치가 성장합니다.</p><p>근력은 운동·검술, 도덕심·신앙은 성당 봉사, 예법은 예절, 마법은 마법 수업, 요리는 요리 수업, 손재주는 그림·공방에서 기를 수 있습니다.</p><p>기존 저장에 없는 추가 능력치는 관련 능력의 60%로 이어받습니다. 기존 진로의 달성 조건은 유지됩니다.</p></section>`:''}</div>`}
  function outing(art){return `<div class="town-intro">${art('locations','town','마을 전경')}<p>오늘은 어디를 둘러볼까요?</p></div><div class="destination-grid">${[
    ['school','교육원','학문 · 검술 · 예법 · 마법 · 요리','education','plan'],
    ['town','일자리','농장 · 공방 · 응접실 · 도서관','work','shop'],
    ['forest','성 밖의 숲','12세부터 무사수행 · 일정에 배치','adventure','outing'],
    ['church','성당','봉사로 신앙과 도덕심을 기릅니다','church','dreams'],
    ['shop','상점','회복품 · 선물 · 학습 도구','shop','shop'],
    ['town','가을제 광장','대회 준비와 지난 수상 기록','festival','festival']
  ].map(([image,title,desc,dest,symbol])=>`<button class="destination" data-action="destination" data-destination="${dest}">${art('locations',image,title)}${icon(symbol)}<strong>${title}</strong><span>${desc}</span></button>`).join('')}</div>`}
  function render({game:g,plan,view,portrait,meter,content}){
    const d=E.date(g),title={home:'집',plan:'한 달 일정',status:'능력 일람',outing:'외출',journal:'성장 일지',dreams:'장래의 꿈',festival:'가을제',shop:'상점 · 소지품'}[view]||'집';
    const commands=[['plan','일정'],['status','능력'],['outing','외출'],['wardrobe','옷장'],['care','대화'],['shop','상점'],['festival','가을제'],['journal','일지'],['dreams','진로'],['home','집으로']];
    return `<div class="game-shell"><header class="game-top"><div class="game-title">✦ 별이 자라는 집</div><div class="game-calendar"><b>${d.year}</b>년 <strong>${d.month}월</strong><span>${E.season(g)}</span></div><div class="game-gold">소지금 <strong>${g.gold.toLocaleString('ko-KR')}</strong> G</div><button class="button" data-action="saves">저장함</button><button class="button install-button" data-pwa-action="install">설치</button><button class="button game-help" data-action="help">?</button></header>
      <main class="game-board"><aside class="character-sheet"><div class="sheet-name"><h1>${esc(g.childName)}</h1><span>${d.age}세 · ${C.ORIGINS[g.originId].name}의 가족</span></div>${status(g)}<div class="body-status">${meter('condition','건강')}${meter('fatigue','피로','tired')}${meter('stress','스트레스','stress')}${meter('trust','친밀도','trust')}</div></aside>
      <section class="home-stage profile-card" aria-label="${esc(g.childName)}의 방"><div class="stage-heading">${C.ORIGINS[g.originId].room}<span> ${d.age}세의 ${E.season(g)}</span></div><div class="stage-picture">${portrait()}</div><div class="stage-floor">✧ ${esc(g.guardianName)}와 함께하는 ${Math.min(8,Math.floor(g.elapsed/12)+1)}번째 해 ✧</div></section>
      <aside class="command-panel"><div class="command-heading">무엇을 할까요?</div><nav class="game-commands tabs" aria-label="육성 메뉴">${commands.map(([id,label])=>`<button class="command tab ${id===view?'active':''}" ${id==='wardrobe'||id==='care'?`data-action="${id}"`:`data-action="view" data-view="${id}"`} ${id==='care'&&(g.careMonth===g.elapsed||g.phase!=='planning')?'disabled':''}>${icon(id)}<span>${label}</span></button>`).join('')}</nav><div class="month-notebook"><h3>이달의 일정</h3>${plan.map((id,i)=>`<div><span>${i+1}주</span><b>${id?E.activities[id].name:'미정'}</b></div>`).join('')}<button class="button" data-action="view" data-view="plan">일정표 펼치기</button></div></aside>
      <section class="home-dialogue" aria-label="아이의 대화"><div class="speaker-name">${esc(g.childName)}</div><p>“${esc(E.characterVoice(g))}”</p>${g.phase==='event'?'<button class="button primary" data-action="pending-event">이야기 이어보기 ▸</button>':g.phase==='ending'?'<button class="button primary" data-action="ending">열여덟 살의 이야기 ▸</button>':`<span class="dialogue-cue">${E.mood(g)} <b>◆</b></span>`}</section>
      ${view!=='home'?`<section class="game-window" aria-label="${title}"><header class="window-bar"><h2>${title}</h2><button class="button" data-action="view" data-view="home">집으로 ×</button></header><div id="main-view" class="window-content">${content}</div></section>`:''}
      </main><footer class="game-bottom"><span>${d.age}세의 기록 · ${g.elapsed} / 96개월</span><span>교육과 일, 휴식으로 함께하는 여덟 해</span></footer></div>`;
  }
  window.MakerClassic={render,status,outing};
})();
