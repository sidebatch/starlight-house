(function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function row({key,label,value,max=999,delta=0,scope='stat',changeLabel='오늘 변화'}){
    const before=Math.max(0,Math.min(max,value-delta)),from=before/max*100,to=value/max*100;
    const daily=scope==='change',tone=daily&&delta>0?'gain-up':daily&&delta<0?'gain-down':'gain-still';
    return `<div class="game-stat-row ${daily?'daily-change':'ability-row'} ${tone}" data-${scope}="${esc(key)}"${daily?` data-delta="${delta}"`:''}><span class="stat-name">${esc(label)}</span><strong class="stat-value">${value}</strong><div class="stat-gauge ${daily?'daily-bar':'ability-track'}" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${value}" style="--from:${from}%;--to:${to}%"><i class="stat-fill" style="width:${to}%"></i></div>${daily?`<small class="stat-delta" aria-label="${esc(changeLabel)} ${delta>0?'+':''}${delta}">${delta>0?'▲ +'+delta:delta<0?'▼ '+delta:'—'}</small>`:''}</div>`;
  }
  function columns(change='오늘'){return `<div class="stat-columns" aria-hidden="true"><span>항목</span><span>현재</span><span></span><span>${esc(change)}</span></div>`}
  window.MakerStatUI={row,columns};
})();
