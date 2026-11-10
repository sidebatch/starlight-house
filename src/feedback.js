(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'),require('./content.js'),require('./rules.js'));
  else root.MakerFeedback=factory(root.MakerEngine,root.MakerContent,root.MakerRules);
})(globalThis,function(E,C,R){
  'use strict';
  const bodies={condition:'컨디션',fatigue:'피로',stress:'스트레스',trust:'친밀도'};
  const fields=[...Object.entries(C.STATS).map(([key,s])=>({key,label:s.name,max:999})),
    ...Object.entries(bodies).map(([key,label])=>({key,label,max:100})),
    ...Object.entries(R.REPUTATIONS).map(([id,r])=>({key:'rep-'+id,label:r.name,max:999}))];
  const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
  const clone=o=>JSON.parse(JSON.stringify(o));
  function capture(g){return {elapsed:g.elapsed,gold:g.gold,values:{...E.effectiveStats(g),...Object.fromEntries(Object.keys(bodies).map(k=>[k,g[k]])),...Object.fromEntries(Object.entries(E.reputation(g)).map(([k,n])=>['rep-'+k,n]))}}}
  function snapshot(s,elapsed){return {elapsed,gold:s.gold,values:{...s.stats,...Object.fromEntries(Object.keys(bodies).map(k=>[k,s[k]]))}}}
  function changes(before,after){return fields.filter(f=>Number.isFinite(before.values[f.key])&&Number.isFinite(after.values[f.key])&&before.values[f.key]!==after.values[f.key]).map(f=>({...f,value:after.values[f.key],delta:after.values[f.key]-before.values[f.key]}))}
  function seasonStart(month){return Math.max(0,Math.floor((month+1)/3)*3-1)}
  function isSeasonEnd(month){return [2,5,8,11].includes(E.date({elapsed:month}).month)}
  function fresh(g){
    const month=g.phase==='event'?Math.max(0,g.elapsed-1):g.elapsed,start=seasonStart(month);
    const old=start===g.elapsed&&g.runState?g.runState.before:g.lastReport?.monthIndex===start?g.lastReport.before:g.history[start];
    return {version:1,start,before:start===g.elapsed&&!g.runState?capture(g):snapshot(old||g,start),completedThrough:g.phase==='event'?g.elapsed-1:g.elapsed,last:null,pendingSeason:null,pendingFeedback:null};
  }
  function validSnapshot(s){return s&&integer(s.elapsed,0,96)&&Number.isFinite(s.gold)&&s.values&&fields.every(f=>s.values[f.key]===undefined||integer(s.values[f.key],0,f.max))&&Object.keys(C.STATS).every(k=>Number.isFinite(s.values[k]))}
  function validSeason(s){return s&&integer(s.start,0,95)&&integer(s.end,s.start,95)&&s.end-s.start<3&&isSeasonEnd(s.end)&&validSnapshot(s.before)&&validSnapshot(s.after)}
  function restore(g,s){
    const fallback=fresh(g);
    if(!s||s.version!==1||!integer(s.start,0,g.elapsed)||!integer(s.completedThrough,0,g.elapsed)||!validSnapshot(s.before)||s.before.elapsed!==s.start)return fallback;
    const result={...fallback,start:s.start,before:clone(s.before),completedThrough:s.completedThrough};
    for(const key of ['last','pendingSeason'])if(validSeason(s[key])&&s[key].end<g.elapsed)result[key]=clone(s[key]);
    const p=s.pendingFeedback;
    if(p&&['modal','inline'].includes(p.kind)&&typeof p.title==='string'&&validSnapshot(p.before)&&validSnapshot(p.after)&&p.after.elapsed===g.elapsed){
      result.pendingFeedback={kind:p.kind,title:p.title.slice(0,120),quote:String(p.quote||'').slice(0,1000),label:String(p.label||'').slice(0,200),before:clone(p.before),after:clone(p.after)};
    }
    return result;
  }
  function record(s,before,g,{title,quote='',label='',inline=false,always=false}){
    const after=capture(g),rows=changes(before,after);
    s.pendingFeedback=rows.length||always?{kind:inline?'inline':'modal',title,quote,label,before,after}:null;
    return rows;
  }
  function settle(s,g){
    if(['daily','adventure','festival','event','running'].includes(g.phase)||!g.lastReport||g.elapsed<=s.completedThrough)return;
    const end=g.elapsed-1;s.completedThrough=g.elapsed;
    if(!isSeasonEnd(end))return;
    s.last={start:s.start,end,before:clone(s.before),after:capture(g)};
    s.pendingSeason=clone(s.last);s.start=g.elapsed;s.before=capture(g);
  }
  function seasonName(record){return ({2:'겨울',5:'봄',8:'여름',11:'가을'})[E.date({elapsed:record.end}).month]}
  function range(record){const a=E.date({elapsed:record.start}),b=E.date({elapsed:record.end});return a.year===b.year?`${a.year}년 ${a.month}–${b.month}월`:`${a.year}년 ${a.month}월 – ${b.year}년 ${b.month}월`}
  return {fields,capture,changes,fresh,restore,record,settle,seasonStart,isSeasonEnd,seasonName,range};
});
