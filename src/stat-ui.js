(function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function row({key,label,value,max=999,delta=0,scope='stat',changeLabel='지난달 변화'}){
    const before=Math.max(0,Math.min(max,value-delta)),from=before/max*100,to=value/max*100;
    const tone=delta>0?'gain-up':delta<0?'gain-down':'gain-still',daily=scope==='change';
    return `<div class="game-stat-row ${daily?'daily-change':'ability-row'} ${tone}" data-${scope}="${esc(key)}" data-delta="${delta}"><span class="stat-name">${esc(label)}</span><strong class="stat-value">${value}</strong><div class="stat-gauge ${daily?'daily-bar':'ability-track'}" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" style="--from:${from}%;--to:${to}%"><i class="stat-fill" style="width:${to}%"></i>${delta?`<em class="stat-trail" style="left:${Math.min(from,to)}%;width:${Math.abs(delta)/max*100}%"></em>`:''}<span class="stat-ticks" aria-hidden="true"></span><span class="stat-limit" aria-hidden="true">${max}</span></div><small class="stat-delta" ${scope==='reputation'?'aria-hidden="true"':'aria-label="'+esc(changeLabel)+' '+(delta>0?'+':'')+delta+'"'}>${scope==='reputation'?'':delta>0?'▲ +'+delta:delta<0?'▼ '+delta:'—'}</small></div>`;
  }
  function columns(change='전월'){return `<div class="stat-columns" aria-hidden="true"><span>항목</span><span>현재</span><span>0 <b>막대</b> 최대</span><span>${esc(change)}</span></div>`}
  window.MakerStatUI={row,columns};
})();
