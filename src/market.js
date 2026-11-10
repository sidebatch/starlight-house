(function(root,factory){const node=typeof module==='object';const api=factory(node?require('./content.js'):root.MakerContent,node?require('./rules.js'):root.MakerRules,node?require('./legacy-engine.js'):root.MakerLegacyEngine,node?require('./items.js'):root.MakerItems,node?require('./shop.js'):root.MakerShop);if(node)module.exports=api;else root.MakerMarket=api})(globalThis,function(C,R,B,I,P){
 'use strict';
 const items=Object.fromEntries(I.ITEMS.map(i=>[i.id,i])),oldIds=new Set(P.ITEMS.map(i=>i.id)),body={condition:'컨디션',fatigue:'피로',stress:'스트레스',trust:'친밀도'};
 const clone=g=>JSON.parse(JSON.stringify(g)),clamp=(n,max=999)=>Math.round(Math.max(0,Math.min(max,n))),fail=s=>{throw Error(s)};
 function get(id){if(typeof id!=='string'||!Object.hasOwn(items,id))fail('알 수 없는 물건입니다.');return items[id]}
 const quantity=(g,id)=>g.shop?.inventory?.[id]||0;
 function empty(month){return {inventory:{},equippedToolId:null,equipment:{weapon:null,armor:null,accessory:null},usage:{month,recovery:0,gift:0,growth:0},lastUse:null}}
 function usage(g){return g.shop?.usage?.month===g.elapsed?{growth:0,...g.shop.usage}:empty(g.elapsed).usage}
 function equipment(g){return {...empty(g.elapsed).equipment,...g.shop?.equipment}}
 function effectiveStats(g){const stats={...g.stats};for(const id of Object.values(equipment(g)))if(id&&quantity(g,id)){for(const [key,n] of Object.entries(get(id).modifiers))stats[key]=(stats[key]??0)+n}for(const key of Object.keys(stats))stats[key]=clamp(stats[key]);return stats}
 function reputation(g){return R.reputation({...g,stats:effectiveStats(g)})}
 function effectsText(effects){return Object.entries(effects).filter(([,n])=>n!==0).map(([key,n])=>(C.STATS[key]?.name||body[key]||key)+' '+(n>0?'+':'')+n).join(' · ')||'변화 없음'}
 function isEquipped(g,item){return item.category==='tool'?g.shop?.equippedToolId===item.id:item.category==='equipment'?equipment(g)[item.slot]===item.id:false}
 function buyReason(g,item){if(!item.store)return '수확제 입상 상품입니다.';if(g.phase!=='planning')return '일정을 마친 뒤 구매할 수 있습니다.';if(quantity(g,item.id)>=item.maxOwned)return '더 보관할 수 없습니다.';if(g.gold<item.price)return '소지금이 부족합니다.';return null}
 function sellReason(g,item){if(g.phase!=='planning')return '일정을 마친 뒤 판매할 수 있습니다.';if(!quantity(g,item.id))return '가지고 있지 않습니다.';if(isEquipped(g,item))return '먼저 장착을 해제해 주세요.';if(g.gold+item.sellPrice>999999999)return '소지금을 더 받을 수 없습니다.';return null}
 function preview(g,id,choiceId){
  const item=get(id),u=usage(g),favorite=item.favorite===g.characterId,choice=item.choices?.find(c=>c.id===choiceId);
  let reason=g.phase!=='planning'?'일정을 마친 뒤 사용할 수 있습니다.':quantity(g,id)<1?'가지고 있지 않습니다.':null;
  if(['tool','equipment'].includes(item.category)){
   if(!reason&&isEquipped(g,item))reason='이미 장착했습니다.';
   const detail=item.category==='tool'?item.activities.map(id=>B.activities[id]?.name||id).join(' · ')+' 일정에서 '+C.STATS[item.bonus.stat].name+' +'+item.bonus.amount+' · 월 2구간':effectsText(item.modifiers)+' · 장착 중';
   return {canUse:!reason,reason,favorite:false,quantity:quantity(g,id),baseEffects:item.modifiers||{},effects:{},displayEffects:item.modifiers||{},detail};
  }
  if(!reason&&u[item.category]>=I.LIMITS[item.category])reason='이번 달 '+I.CATEGORIES[item.category]+' 사용을 마쳤습니다.';
  if(!reason&&item.choices&&!choice)reason='사용 방법을 골라 주세요.';
  if(choiceId&&!choice)fail('사용 방법을 다시 골라 주세요.');
  const baseEffects={...(choice?.effects||item.effects)};if(favorite){baseEffects.trust=(baseEffects.trust||0)+3;baseEffects.stress=(baseEffects.stress||0)-4}
  const effects={},after={...g,stats:{...g.stats}},beforeStats=effectiveStats(g);
  for(const [key,value] of Object.entries(baseEffects)){
   const stat=Object.hasOwn(C.STATS,key),from=stat?g.stats[key]:g[key],max=stat?999:100;
   const gain=key==='trust'&&value>0?Math.max(0,Math.min(90-g.trust,Math.round(value*(g.trust>=90?.08:g.trust>=80?.25:g.trust>=65?.55:1)))):value;
   effects[key]=clamp(from+gain,max)-from;if(stat)after.stats[key]+=effects[key];else after[key]+=effects[key];
  }
  const afterStats=effectiveStats(after),displayEffects=Object.fromEntries(Object.keys(effects).map(key=>[key,Object.hasOwn(C.STATS,key)?afterStats[key]-beforeStats[key]:after[key]-g[key]]));
  const beneficial=Object.entries(displayEffects).some(([key,n])=>['karma','fatigue','stress'].includes(key)?n<0:n>0);
  if(!reason&&!beneficial)reason='지금은 이 물건의 도움이 필요하지 않습니다.';
  return {canUse:!reason,reason,favorite,quantity:quantity(g,id),baseEffects,effects,displayEffects,detail:effectsText(displayEffects),choiceId:choice?.id,quote:choice?.quote||P.QUOTES[g.characterId]?.[id]||(g.characterId==='ciel'?'천천히 제 것으로 익혀 볼게요.':'잘 써 볼게요. 고마워요!')};
 }
 function info(g){const u=usage(g);return {items:I.ITEMS.map(item=>{const reason=buyReason(g,item);return {...item,owned:quantity(g,item.id),canBuy:!reason,buyReason:reason,equipped:isEquipped(g,item),preview:preview(g,item.id),canSell:!sellReason(g,item),sellReason:sellReason(g,item)}}),stores:I.STORES,categories:I.CATEGORIES,slots:I.SLOTS,limits:I.LIMITS,remaining:Object.fromEntries(['recovery','gift','growth'].map(k=>[k,I.LIMITS[k]-u[k]])),equippedTool:items[g.shop?.equippedToolId]||null,equipment:Object.fromEntries(Object.entries(equipment(g)).map(([k,id])=>[k,items[id]||null])),totalQuantity:Object.values(g.shop?.inventory||{}).reduce((a,b)=>a+b,0),lastUse:g.shop?.lastUse||null}}
 function log(g,title,body){g.journal.unshift({month:g.elapsed,title,body,tone:'care'});g.journal=g.journal.slice(0,400);g.history[g.history.length-1]=B.snapshot(g)}
 function buy(g,id){const item=get(id),reason=buyReason(g,item);if(reason)fail(reason);const next=clone(g);next.gold-=item.price;next.shop.inventory[id]=quantity(g,id)+1;log(next,I.STORES[item.store].name,item.name+' 구입 · '+item.price+'G');return next}
 function sell(g,id){const item=get(id),reason=sellReason(g,item);if(reason)fail(reason);const next=clone(g);next.gold+=item.sellPrice;take(next,id);log(next,'물건을 정리했어요',item.name+' 판매 · '+item.sellPrice+'G');return next}
 function take(g,id){g.shop.inventory[id]--;if(!g.shop.inventory[id])delete g.shop.inventory[id]}
 function equip(g,id,slot){
  if(g.phase!=='planning')fail('일정을 마친 뒤 장비를 바꿀 수 있습니다.');
  const next=clone(g);next.shop.equipment=equipment(g);
  if(id===null){if(slot==='tool'){if(!next.shop.equippedToolId)fail('준비한 도구가 없습니다.');next.shop.equippedToolId=null}else {if(!Object.hasOwn(I.SLOTS,slot)||!next.shop.equipment[slot])fail('장착한 물건이 없습니다.');next.shop.equipment[slot]=null}}
  else {const item=get(id);if(!['tool','equipment'].includes(item.category))fail('장착할 물건이 아닙니다.');const p=preview(g,id);if(!p.canUse)fail(p.reason);if(item.category==='tool')next.shop.equippedToolId=id;else next.shop.equipment[item.slot]=id}
  log(next,id?'물건을 준비했어요':'물건을 넣어두었어요',id?get(id).name:(slot==='tool'?'학습 도구':I.SLOTS[slot])+' 장착 해제');return next;
 }
 function use(g,id,choiceId){const item=get(id);if(['tool','equipment'].includes(item.category))fail('장착해서 사용하는 물건입니다.');const p=preview(g,id,choiceId);if(!p.canUse)fail(p.reason);const next=clone(g);next.shop.usage=usage(next);next.shop.usage[item.category]++;take(next,id);for(const [key,n] of Object.entries(p.effects)){if(Object.hasOwn(C.STATS,key))next.stats[key]+=n;else next[key]+=n}next.shop.lastUse={itemId:id,month:g.elapsed,quote:p.quote,detail:p.detail};log(next,item.name+' · '+(item.category==='gift'?'선물':'사용'),p.detail);return {game:next,quote:p.quote,detail:p.detail}}
 function grant(g,contest,rank){const id=I.PRIZES[contest]?.[rank];if(!id)return null;const item=get(id),count=quantity(g,id);if(count>=item.maxOwned)fail('입상 상품의 보관 수량을 확인해 주세요.');g.shop.inventory[id]=count+1;return id}
 function int(n,min,max){if(!Number.isInteger(n)||n<min||n>max)fail('소지품 저장 값이 올바르지 않습니다.');return n}
 function read(value,g){
  if(value===undefined)return empty(g.elapsed);if(!value||!value.inventory||Array.isArray(value.inventory)||typeof value.inventory!=='object')fail('소지품함을 읽을 수 없습니다.');const state=empty(g.elapsed);
  for(const [id,n] of Object.entries(value.inventory))state.inventory[id]=int(n,1,get(id).maxOwned);
  state.equippedToolId=value.equippedToolId??null;if(state.equippedToolId!==null&&(!state.inventory[state.equippedToolId]||get(state.equippedToolId).category!=='tool'))fail('학습 도구 기록이 올바르지 않습니다.');
  if(value.equipment!==undefined&&(!value.equipment||typeof value.equipment!=='object'||Array.isArray(value.equipment)))fail('장비 기록을 읽을 수 없습니다.');
  for(const [slot,id] of Object.entries(value.equipment||{})){if(!Object.hasOwn(I.SLOTS,slot)||id!==null&&(!state.inventory[id]||get(id).slot!==slot))fail('장착 위치나 소유 기록이 올바르지 않습니다.');state.equipment[slot]=id}
  if(!value.usage||value.usage.month!==g.elapsed)fail('아이템 사용 월이 올바르지 않습니다.');for(const key of ['recovery','gift','growth'])state.usage[key]=int(value.usage[key]??(key==='growth'?0:NaN),0,I.LIMITS[key]);
  if(value.lastUse!=null){const r=value.lastUse,item=get(r.itemId);if(!Object.hasOwn(I.LIMITS,item.category)||['tool','equipment'].includes(item.category))fail('사용 기록을 확인해 주세요.');if(typeof r.quote!=='string'||r.quote.length>300||typeof r.detail!=='string'||r.detail.length>500)fail('아이템 기록을 읽을 수 없습니다.');state.lastUse={itemId:item.id,month:int(r.month,0,Math.min(g.elapsed,95)),quote:r.quote,detail:r.detail};if(r.month===g.elapsed&&!state.usage[item.category])fail('사용 횟수와 기록이 맞지 않습니다.')}
  return state;
 }
 // Let the original validator continue checking legacy save fields. New item fields are validated separately.
 function legacyState(s){if(s===undefined)return undefined;if(!s||!s.inventory||typeof s.inventory!=='object')fail('소지품함을 읽을 수 없습니다.');return {...s,inventory:Object.fromEntries(Object.entries(s.inventory).filter(([id])=>oldIds.has(id))),equippedToolId:oldIds.has(s.equippedToolId)?s.equippedToolId:null,lastUse:s.lastUse&&oldIds.has(s.lastUse.itemId)?s.lastUse:null}}
 function validateBonuses(weeks){let count=0;for(const w of weeks||[]){if(!w.toolBonus)continue;const b=w.toolBonus,item=get(b.itemId);if(item.category!=='tool'||b.stat!==item.bonus.stat||!item.activities.includes(w.activityId)||!(w.gains[b.stat]>=b.amount))fail('도구 성장 기록이 올바르지 않습니다.');int(b.amount,1,item.bonus.amount);if(++count>I.LIMITS.toolBonus)fail('도구 사용 횟수가 올바르지 않습니다.')}}
 return {items,I,empty,read,legacyState,validateBonuses,effectiveStats,reputation,effectsText,info,preview,buy,sell,equip,use,grant,quantity};
});
