(function(root,factory){const node=typeof module==='object'&&module.exports;const content=node?require('./content.js'):root.MakerContent,stories=node?require('./stories.js'):root.MakerStories,festival=node?require('./festival.js'):root.MakerFestival,shop=node?require('./shop.js'):root.MakerShop;const api=factory(content,stories,festival,shop);if(node)module.exports=api;else root.MakerLegacyEngine=api;})(globalThis,function(C,S,F,P){
  'use strict';
  const KEYS=Object.keys(C.STATS),MAX_MONTHS=96,VERSION=1;
  const activities=Object.assign(Object.create(null),Object.fromEntries(C.ACTIVITIES.map(a=>[a.id,a])));
  const events=Object.assign(Object.create(null),Object.fromEntries([...C.EVENTS,...S.EVENTS,F.EVENT].map(e=>[e.id,e])));
  const endings=Object.assign(Object.create(null),Object.fromEntries([...C.ENDINGS,...(C.EXTRA_ENDINGS||[])].map(e=>[e.id,e])));
  const items=Object.assign(Object.create(null),Object.fromEntries(P.ITEMS.map(item=>[item.id,item])));
  const copy=value=>JSON.parse(JSON.stringify(value));
  const clamp=(number,min=0,max=100)=>Math.round(Math.max(min,Math.min(max,number)));
  const fail=message=>{throw new Error(message)};
  function random(game){let x=game.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;game.seed=x>>>0||1;return game.seed/4294967296}
  function date(game){const m=3+game.elapsed;return {year:1201+Math.floor(m/12),month:m%12+1,age:10+Math.floor(game.elapsed/12)}}
  function season(game){const m=date(game).month;return m>=3&&m<=5?'봄':m>=6&&m<=8?'여름':m>=9&&m<=11?'가을':'겨울'}
  function snapshot(game){return {month:game.elapsed,stats:{...game.stats},gold:game.gold,condition:game.condition,fatigue:game.fatigue,stress:game.stress,trust:game.trust}}
  function journal(game,title,body,tone='normal',month=game.elapsed){game.journal.unshift({month,title,body,tone});game.journal=game.journal.slice(0,400)}
  function cleanName(value,fallback){const result=String(value??'').trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,16);return result||fallback}
  function createGame(options={}){
    const characterId=options.characterId||'ciel',originId=options.originId||'artist';
    const character=Object.hasOwn(C.CHARACTERS,characterId)?C.CHARACTERS[characterId]:null,origin=Object.hasOwn(C.ORIGINS,originId)?C.ORIGINS[originId]:null;
    if(!character||!origin)fail('캐릭터와 시작 배경을 골라 주세요.');
    const game={version:VERSION,characterId,originId,childName:cleanName(options.childName,character.name),guardianName:cleanName(options.guardianName,'보호자'),dreamId:endings[options.dreamId]&&!endings[options.dreamId].fallback?options.dreamId:character.dream,elapsed:0,gold:origin.gold,condition:90,fatigue:10,stress:10,trust:50,stats:{...character.stats},seed:(Number(options.seed)>>>0)||((Date.now()^Math.floor(Math.random()*0xffffffff))>>>0)||1,phase:'planning',pendingEvent:null,endingId:null,careMonth:-1,lastPlan:[],lastReport:null,counters:{explorations:0,weeksWorked:0,weeksStudied:0},eventCooldowns:{},history:[],journal:[]};
    game.storyChoices={};
    game.festivalResults=[];
    game.shop=emptyShop(0);
    for(const [key,value] of Object.entries(origin.bonus))game.stats[key]+=value;
    game.history.push(snapshot(game));journal(game,'우리의 첫 번째 봄',`${game.childName}와 함께하는 시간이 시작되었습니다. 어떤 하루를 쌓아 갈까요?`);return game;
  }
  function requirement(game,activity){
    const a=typeof activity==='string'?activities[activity]:activity;if(!a)return '알 수 없는 활동입니다.';
    if(date(game).age<(a.minAge||10))return `${a.minAge}세부터 할 수 있어요.`;
    const unmet=Object.entries(a.requires||{}).filter(([key,value])=>game.stats[key]<value);
    return unmet.length?unmet.map(([key,value])=>`${C.STATS[key].name} ${value} 이상`).join(' · ')+'이 필요해요.':null;
  }
  function monthlyBudget(game){
    const starterGrant=game.elapsed<3?15:0,age=date(game).age;
    return {allowance:C.ORIGINS[game.originId].allowance+starterGrant,starterGrant,livingCost:age<12?18:age<14?24:age<16?30:36};
  }
  function workStatus(game){
    const weeks=game.counters.weeksWorked;
    return weeks<8?{label:'처음 배우는 손길',factor:.8,weeks,next:8}:weeks<24?{label:'익숙한 손길',factor:1,weeks,next:24}:{label:'믿음직한 손길',factor:1.15,weeks,next:null};
  }
  function workIncome(game,a){const pace=(game.condition<45?.7:1)*(game.fatigue>75?.65:game.fatigue>55?.85:1)*(game.stress>75?.8:1);return a.income?Math.round(a.income*workStatus(game).factor*pace*(1+(C.ORIGINS[game.originId].workBonus||0))):0}
  function trustGain(game,value,care=false){
    if(value<=0)return value;
    const limit=care?90:100,factor=game.trust>=90?.08:game.trust>=80?.25:game.trust>=65?.55:1;
    return Math.max(0,Math.min(limit-game.trust,Math.round(value*factor)));
  }
  function careEffects(game,kind){return {cost:kind==='treat'?15:0,trust:trustGain(game,kind==='treat'?8:5,true),stress:kind==='treat'?-10:-6,fatigue:kind==='treat'?-6:-2,condition:kind==='treat'?5:2}}
  function emptyShop(month){return {inventory:{},equippedToolId:null,usage:{month,recovery:0,gift:0},lastUse:null}}
  function shopState(game){return game.shop||emptyShop(game.elapsed)}
  function itemQuantity(game,id){return shopState(game).inventory[id]||0}
  function itemBuyReason(game,item){
    if(game.phase!=='planning')return '이번 이야기를 마무리한 뒤 살 수 있어요.';
    if(itemQuantity(game,item.id)>=(item.category==='tool'?1:P.LIMITS.stack))return item.category==='tool'?'이미 가지고 있는 도구예요.':'이 물건은 다섯 개까지 보관할 수 있어요.';
    if(game.gold<item.price)return '소지금이 부족해요.';return null;
  }
  function itemUsePreview(game,id){
    const item=items[id];if(!item)fail('소지품을 다시 확인해 주세요.');
    const state=shopState(game),usage=state.usage.month===game.elapsed?state.usage:{month:game.elapsed,recovery:0,gift:0},quantity=itemQuantity(game,id),favorite=item.favorite===game.characterId;
    const baseEffects={...item.effects};if(favorite){baseEffects.trust+=3;baseEffects.stress-=4}const effects={...baseEffects};
    for(const key of Object.keys(effects))effects[key]=clamp(game[key]+(key==='trust'?trustGain(game,effects[key],true):effects[key]))-game[key];
    let reason=game.phase!=='planning'?'이번 이야기를 마무리한 뒤 사용할 수 있어요.':quantity<1?'가지고 있지 않은 물건이에요.':null;
    if(!reason&&item.category==='tool'&&state.equippedToolId===id)reason='지금 준비해 둔 도구예요.';
    if(!reason&&item.category!=='tool'&&usage[item.category]>=P.LIMITS[item.category])reason=item.category==='gift'?'이번 달에는 이미 선물을 건넸어요.':'이번 달의 회복품을 모두 사용했어요.';
    if(!reason&&item.category!=='tool'&&!Object.values(effects).some(n=>n!==0))reason='지금은 이 물건으로 달라지는 몸과 마음의 상태가 없어요.';
    const detail=item.category==='tool'?`${item.activities.map(a=>activities[a].name).join(' · ')} 활동을 실제로 마친 주에 ${C.STATS[item.bonus.stat].name} +1 · 한 달 최대 ${P.LIMITS.toolBonus}주`:Object.entries(effects).map(([key,n])=>`${{condition:'컨디션',fatigue:'피로',stress:'스트레스',trust:'친밀도'}[key]} ${n>0?'+':''}${n}`).join(' · ');
    return {quantity,effects,baseEffects,favorite,canUse:!reason,reason,detail,quote:P.QUOTES[game.characterId][id]||null};
  }
  function shopInfo(game){
    const state=shopState(game),usage=state.usage.month===game.elapsed?state.usage:{month:game.elapsed,recovery:0,gift:0};
    return {items:P.ITEMS.map(item=>{const reason=itemBuyReason(game,item);return {...item,owned:itemQuantity(game,item.id),canBuy:!reason,buyReason:reason,equipped:state.equippedToolId===item.id,preview:itemUsePreview(game,item.id)}}),categories:P.CATEGORIES,limits:P.LIMITS,remaining:{recovery:P.LIMITS.recovery-usage.recovery,gift:P.LIMITS.gift-usage.gift},equippedTool:items[state.equippedToolId]||null,totalQuantity:Object.values(state.inventory).reduce((sum,n)=>sum+n,0),lastUse:state.lastUse};
  }
  function buyItem(input,id){
    const item=items[id];if(!item)fail('살 물건을 다시 확인해 주세요.');
    const reason=itemBuyReason(input,item);if(reason)fail(reason);
    const game=copy(input);game.shop??=emptyShop(game.elapsed);game.gold-=item.price;game.shop.inventory[id]=itemQuantity(input,id)+1;
    journal(game,'작은 가게에서 고른 물건',`${item.name} 한 개를 ${item.price}G에 샀어요. 소지품함에 보관했습니다.`);
    game.history[game.history.length-1]=snapshot(game);return game;
  }
  function equipTool(input,id){
    if(input.phase!=='planning')fail('이번 이야기를 마무리한 뒤 도구를 준비해 주세요.');
    const state=shopState(input);if(id===null){if(!state.equippedToolId)fail('준비해 둔 도구가 없어요.')}else{
      if(!items[id]||items[id].category!=='tool')fail('준비할 도구를 다시 골라 주세요.');
      const preview=itemUsePreview(input,id);if(!preview.canUse)fail(preview.reason);
    }
    const game=copy(input);game.shop??=emptyShop(game.elapsed);game.shop.equippedToolId=id;
    journal(game,id?'배움을 위한 작은 준비':'도구를 소지품함에 넣었어요',id?`준비한 도구: ${items[id].name}. ${itemUsePreview(input,id).detail}.`:`${items[state.equippedToolId].name} 보관을 마쳤어요. 필요할 때 다시 준비할 수 있습니다.`);return game;
  }
  function useItem(input,id){
    const item=items[id];if(!item||item.category==='tool')fail('사용할 간식이나 선물을 다시 골라 주세요.');
    const preview=itemUsePreview(input,id);if(!preview.canUse)fail(preview.reason);
    const game=copy(input);game.shop??=emptyShop(game.elapsed);const state=game.shop;
    if(state.usage.month!==game.elapsed)state.usage={month:game.elapsed,recovery:0,gift:0};state.usage[item.category]++;
    state.inventory[id]--;if(state.inventory[id]===0)delete state.inventory[id];
    for(const [key,value] of Object.entries(preview.effects))game[key]+=value;
    state.lastUse={itemId:id,month:game.elapsed,quote:preview.quote,detail:preview.detail};
    journal(game,item.category==='gift'?'마음을 담아 건넨 선물':'잠깐 쉬어 가는 시간',`${item.name}. ${preview.detail}. ${game.childName}: “${preview.quote}”`,'care');
    game.history[game.history.length-1]=snapshot(game);return {game,quote:preview.quote,detail:preview.detail};
  }
  function toolBonus(game,activity,used){
    const item=items[shopState(game).equippedToolId];
    if(!item||used>=P.LIMITS.toolBonus||!item.activities.includes(activity.id))return null;
    const amount=Math.min(item.bonus.amount,999-game.stats[item.bonus.stat]);return amount>0?{itemId:item.id,stat:item.bonus.stat,amount}:null;
  }
  function weeklyActivity(game,planned){
    if(game.condition<25)return {activity:activities.rest,note:'컨디션이 낮아 회복하는 시간을 보냈어요.',reason:'condition'};
    if((planned.cost||0)>game.gold)return {activity:activities.rest,note:'비용이 부족해 이번 주는 집에서 쉬었어요.',reason:'money'};
    return {activity:planned,note:'',reason:null};
  }
  function wellbeing(game,a){
    game.fatigue=clamp(game.fatigue+a.fatigue);game.stress=clamp(game.stress+a.stress);
    game.trust=clamp(game.trust+trustGain(game,a.trust||0));
    game.condition=clamp(game.condition+(a.condition||0)+(game.fatigue>85?-12:game.fatigue>65?-5:2));
    if(game.fatigue>85)game.stress=clamp(game.stress+7);
  }
  function forecast(game,plan){
    const budget=monthlyBudget(game),projected={...game,counters:{...game.counters}};
    projected.gold+=budget.allowance-budget.livingCost;
    let cost=0,income=0,peakFatigue=game.fatigue,minimumCondition=game.condition;
    const unaffordableWeeks=[],recoveryWeeks=[],weeks=[];
    for(let i=0;i<4;i++){
      const planned=activities[plan[i]];if(!planned)continue;
      cost+=planned.cost||0;
      const selected=weeklyActivity(projected,planned),a=selected.activity,pay=workIncome(projected,a);
      if(selected.reason==='money')unaffordableWeeks.push(i+1);
      if(selected.reason==='condition')recoveryWeeks.push(i+1);
      projected.gold-=(a.cost||0);projected.gold+=pay;income+=pay;
      wellbeing(projected,a);if(a.category==='work')projected.counters.weeksWorked++;
      peakFatigue=Math.max(peakFatigue,projected.fatigue);minimumCondition=Math.min(minimumCondition,projected.condition);
      weeks.push({week:i+1,activityId:a.id,income:pay,cost:a.cost||0});
    }
    return {...budget,cost,income,gold:game.gold+budget.allowance-budget.livingCost+income-cost,goldAfterFallback:projected.gold,fatigue:projected.fatigue,stress:projected.stress,condition:projected.condition,peakFatigue,minimumCondition,unaffordableWeeks,recoveryWeeks,weeks,complete:plan.length===4&&plan.every(id=>!!activities[id])};
  }
  function requirementValue(game,r){return r.type==='stat'?game.stats[r.key]:r.type==='counter'?game.counters[r.key]:game[r.key]}
  function possibilities(game){return C.ENDINGS.filter(e=>!e.fallback).map(e=>{const requirements=e.requirements.map(r=>({...r,current:requirementValue(game,r)}));return {...e,requirements,progress:requirements.reduce((sum,r)=>sum+Math.min(1,r.current/r.min),0)/requirements.length,eligible:requirements.every(r=>r.current>=r.min)}})}
  function selectEnding(game){const possible=possibilities(game).filter(e=>e.eligible);if(possible.some(e=>e.id===game.dreamId))return game.dreamId;possible.sort((a,b)=>b.requirements.reduce((sum,r)=>sum+r.current/r.min,0)/b.requirements.length-a.requirements.reduce((sum,r)=>sum+r.current/r.min,0)/a.requirements.length);return possible[0]?.id||'ownPath'}
  function finishPhase(game){if(game.pendingEvent){game.phase='event';return}if(game.elapsed>=MAX_MONTHS){game.phase='ending';game.endingId=selectEnding(game)}else game.phase='planning'}
  function storyAvailable(game,event){return event.character===game.characterId&&game.elapsed>=event.minMonth&&!game.storyChoices?.[event.id]&&(!event.after||!!game.storyChoices?.[event.after])}
  function characterStory(game){
    const episodes=S.EVENTS.filter(e=>e.character===game.characterId);
    const memories=episodes.filter(e=>game.storyChoices?.[e.id]).map(e=>{const record=game.storyChoices[e.id],choice=e.choices.find(c=>c.id===record.choiceId);return {id:e.id,episode:e.episode,chapter:e.chapter,title:e.title,month:record.month,label:choice.label,reaction:choice.reaction}});
    const next=episodes.find(e=>!game.storyChoices?.[e.id])||null;
    return {memories,completed:memories.length,total:episodes.length,latest:memories.at(-1)||null,next:next?{chapter:next.chapter,minMonth:next.minMonth}:null};
  }
  function characterVoice(game){
    const voice=S.VOICES[game.characterId];
    if(game.condition<45||game.fatigue>65)return voice.tired;
    if(game.stress>65)return voice.stressed;
    const lastItem=game.shop?.lastUse;if(lastItem?.month===game.elapsed)return lastItem.quote;
    const latest=characterStory(game).latest;
    if(latest&&game.elapsed-latest.month<3)return latest.reaction;
    const lines=date(game).age<14?voice.young:voice.older;return lines[game.elapsed%lines.length];
  }
  function activityReaction(game,activity,week){
    const voice=S.VOICES[game.characterId];
    if(game.condition<45||game.fatigue>75)return voice.tired;
    if(game.stress>70)return voice.stressed;
    if(voice.favorite[activity.id])return voice.favorite[activity.id];
    const lines=voice[activity.category]||voice.rest;
    return lines[(game.elapsed+week)%lines.length];
  }
  function festivalRank(score){return F.RANKS.find(rank=>score>=rank.min)}
  function festivalPreview(game,contestId,age){
    const contest=F.CONTESTS.find(c=>c.id===contestId);if(!contest)fail('참가할 종목을 다시 골라 주세요.');
    age??=date({elapsed:game.pendingEvent?.id==='harvest'?game.pendingEvent.monthIndex:game.elapsed}).age;
    const entrantAge=clamp(age,10,17),target=[180,290,410,520,640,740,850,940][entrantAge-10];
    const skill=game.stats[contest.primary]*.72+game.stats[contest.secondary]*.28;
    const readiness=(.65+game.condition*.0035)*(game.fatigue>65?.85:1)*(game.stress>65?.9:1);
    const base=skill/target*100*readiness,min=clamp(base-4),max=clamp(base+4);
    return {...contest,ageGroup:`${entrantAge}세부`,target,min,max,base,readiness,affordable:game.gold>=F.FEE,possibleRank:festivalRank(min).name,primaryValue:game.stats[contest.primary],secondaryValue:game.stats[contest.secondary]};
  }
  function festivalInfo(game){
    const current=date(game),pending=game.pendingEvent?.id==='harvest';
    const monthIndex=pending?game.pendingEvent.monthIndex:game.elapsed+(10-current.month+12)%12;
    const next=monthIndex<MAX_MONTHS?{...date({elapsed:monthIndex}),monthIndex,monthsUntil:Math.max(0,monthIndex-game.elapsed),pending}:null;
    const age=next?.age||Math.min(17,current.age),contests=F.CONTESTS.map(c=>festivalPreview(game,c.id,age));
    const best=[...contests].sort((a,b)=>b.min-a.min)[0];
    return {next,contests,bestId:best.id,fee:F.FEE,ranks:F.RANKS,results:game.festivalResults||[]};
  }
  function festivalOutcome(game,choice){
    const monthIndex=game.pendingEvent.monthIndex,d=date({elapsed:monthIndex});
    if(d.month!==10||(game.festivalResults||[]).some(r=>date({elapsed:r.monthIndex}).year===d.year))fail('올해의 가을제는 이미 마무리했어요.');
    if(choice.id==='watch')return {monthIndex,contestId:'watch',score:null,rank:'watch',reward:0,fee:0,quote:F.QUOTES[game.characterId].watch,feedback:'여러 종목을 둘러보며 다른 아이들의 준비 과정을 들었습니다. 올해는 응원의 기억을 남겼어요.'};
    const preview=festivalPreview(game,choice.id,d.age),score=clamp(preview.base+Math.floor(random(game)*9)-4),rank=festivalRank(score);
    let feedback=`${C.STATS[preview.primary].name}을 중심으로 ${C.STATS[preview.secondary].name}도 함께 살폈어요. `;
    if(preview.readiness<.85)feedback+='몸과 마음이 지쳐 평소의 실력을 모두 보여 주지는 못했어요. 다음에는 준비만큼 회복할 시간도 챙겨 보세요.';
    else if(score>=85)feedback+='꾸준한 연습과 자신만의 표현이 잘 드러났어요. 준비한 것을 차분하게 나눈 자리였습니다.';
    else if(game.stats[preview.secondary]<preview.target*.6)feedback+=`${C.STATS[preview.secondary].name}을 더 기르면 배운 것을 한층 안정적으로 보여 줄 수 있겠어요.`;
    else feedback+=`${activities[preview.practice].name}에서 기본기를 더 다지면 다음 무대가 한결 편해질 거예요.`;
    return {monthIndex,contestId:choice.id,score,rank:rank.id,reward:rank.reward,fee:F.FEE,quote:F.QUOTES[game.characterId][rank.id],feedback};
  }
  function pickEvent(game,oldDate){
    if(game.elapsed===MAX_MONTHS)return events.comingOfAge;
    if([24,48,72,84].includes(game.elapsed))return events.growing;
    if(oldDate.month===4)return events.birthday;
    if(oldDate.month===10)return events.harvest;
    const seasonal=C.EVENTS.find(e=>e.month===oldDate.month);if(seasonal)return seasonal;
    const lastStory=Math.max(0,...Object.values(game.storyChoices||{}).map(row=>row.month));
    if(game.elapsed-lastStory>=2){const story=S.EVENTS.find(e=>storyAvailable(game,e));if(story)return story}
    if(random(game)>.43)return null;
    const pool=C.EVENTS.filter(e=>!e.scheduled&&!e.month&&date(game).age>=(e.minAge||10)&&(game.eventCooldowns[e.id]===undefined||game.elapsed-game.eventCooldowns[e.id]>=10));
    return pool.length?pool[Math.floor(random(game)*pool.length)]:null;
  }
  function advanceMonth(input,plan){
    if(input.phase!=='planning'||input.elapsed>=MAX_MONTHS)fail('지금은 한 달을 진행할 수 없어요. 먼저 이야기를 마무리해 주세요.');
    if(!Array.isArray(plan)||plan.length!==4||plan.some(id=>!activities[id]))fail('4주 일정을 모두 정해 주세요.');
    for(const id of plan){const reason=requirement(input,id);if(reason)fail(reason)}
    const game=copy(input),oldDate=date(game),before=snapshot(game),weeks=[];
    const budget=monthlyBudget(game),allowance=budget.allowance;game.gold+=allowance-budget.livingCost;let expenses=0,income=0,toolUses=0;
    for(let week=0;week<4;week++){
      const planned=activities[plan[week]],selected=weeklyActivity(game,planned),a=selected.activity;let note=selected.note;
      const oldWorkStatus=workStatus(game);
      const cost=a.cost||0,pay=workIncome(game,a);game.gold-=cost;game.gold+=pay;expenses+=cost;income+=pay;
      const efficiency=(game.condition<45?.72:1)*(game.fatigue>75?.65:game.fatigue>55?.85:1)*(game.stress>75?.75:1)*(C.CHARACTERS[game.characterId].preferences.includes(a.id)?1.12:1);
      const gains={};
      for(const [key,value] of Object.entries(a.gains)){
        const taper=game.stats[key]>=500?.35:game.stats[key]>=250?.65:1;
        const increase=Math.max(1,Math.round(value*efficiency*taper*(.9+random(game)*.2)));
        const actual=Math.min(999-game.stats[key],increase);game.stats[key]+=actual;gains[key]=actual;
      }
      const bonus=toolBonus(game,a,toolUses);if(bonus){game.stats[bonus.stat]+=bonus.amount;gains[bonus.stat]=(gains[bonus.stat]||0)+bonus.amount;toolUses++}
      wellbeing(game,a);
      if(a.category==='work'&&pay<Math.round(a.income*oldWorkStatus.factor*(1+(C.ORIGINS[game.originId].workBonus||0))))note+=(note?' ':'')+'몸과 마음이 지쳐 일의 양과 주급이 줄었어요.';
      if(game.fatigue>85)note+=(note?' ':'')+'피로가 많이 쌓여 몸이 무거웠어요.';
      if(a.category==='work')game.counters.weeksWorked++;if(a.category==='study')game.counters.weeksStudied++;
      if(a.category==='work'&&workStatus(game).label!==oldWorkStatus.label)note+=(note?' ':'')+'일손에 익숙해져 다음 일부터 주급이 올라요.';
      let discovery=0;if(a.id==='explore'){game.counters.explorations++;if(random(game)<.4){discovery=12+Math.floor(random(game)*19);game.gold+=discovery;income+=discovery;note=`숲에서 발견한 약초를 나누고 ${discovery}G를 받았어요.`}}
      weeks.push({week:week+1,plannedId:planned.id,activityId:a.id,cost,income:pay+discovery,gains,note,toolBonus:bonus,reaction:activityReaction(game,a,week),efficiency:Math.round(efficiency*100),fatigue:game.fatigue,stress:game.stress,condition:game.condition});
    }
    if(game.stress>=80)game.trust=clamp(game.trust-3);
    game.elapsed++;game.gold=clamp(game.gold,0,999999999);game.lastPlan=[...plan];
    game.shop??=emptyShop(game.elapsed);game.shop.usage={month:game.elapsed,recovery:0,gift:0};
    const event=pickEvent(game,oldDate);if(event){game.pendingEvent={id:event.id,monthIndex:game.elapsed-1};game.eventCooldowns[event.id]=game.elapsed}
    game.lastReport={date:oldDate,monthIndex:game.elapsed-1,before,after:snapshot(game),weeks,allowance,starterGrant:budget.starterGrant,livingCost:budget.livingCost,expenses,income,eventId:event?.id||null,choiceLabel:null,eventReaction:null};
    journal(game,`${oldDate.year}년 ${oldDate.month}월의 기록`,`${weeks.map(w=>activities[w.activityId].name).join(' → ')}. 활동에 ${expenses}G, 생활비에 ${budget.livingCost}G를 쓰고 ${income}G를 벌었어요.`,game.condition<40?'rest':'normal',game.elapsed-1);
    game.history.push(snapshot(game));finishPhase(game);return game;
  }
  function choiceDetail(game,choice){
    const parts=[],signed=n=>(n>0?'+':'')+n;
    if(choice.cost)parts.push(`${choice.cost}G 비용`);if(choice.gold)parts.push(`${signed(choice.gold)}G 수입`);
    for(const [key,value] of Object.entries(choice.stats||{}))parts.push(`${C.STATS[key].name} ${signed(clamp(game.stats[key]+value,0,999)-game.stats[key])}`);
    for(const [key,label] of [['condition','컨디션'],['fatigue','피로'],['stress','스트레스'],['trust','친밀도']])if(choice[key])parts.push(`${label} ${signed(clamp(game[key]+(key==='trust'?trustGain(game,choice[key]):choice[key]))-game[key])}`);
    return parts.join(' · ');
  }
  function pendingEvent(game){
    if(!game.pendingEvent)return null;
    const e=events[game.pendingEvent.id],variant=e.variants?.find(v=>game.storyChoices?.[v.eventId]?.choiceId===v.choiceId);
    return {...e,body:(variant?.body||e.body).replaceAll('{name}',game.childName),choices:e.choices.map(c=>({...c,detail:choiceDetail(game,c),affordable:game.gold>=(c.cost||0)}))};
  }
  function resolveEvent(input,choiceId){
    if(input.phase!=='event'||!input.pendingEvent)fail('선택할 이야기가 없어요.');
    const event=events[input.pendingEvent.id];let choice=event.choices.find(c=>c.id===choiceId);if(!choice)fail('선택지를 다시 확인해 주세요.');
    if(input.gold<(choice.cost||0))fail('이 선택에 필요한 돈이 부족해요.');
    const game=copy(input);let festivalResult=null;
    if(event.id==='harvest'){
      festivalResult=festivalOutcome(game,choice);game.festivalResults??=[];game.festivalResults.push(festivalResult);
      choice={...choice,gold:festivalResult.reward,reaction:festivalResult.quote};
    }
    game.gold=clamp(game.gold-(choice.cost||0)+(choice.gold||0),0,999999999);
    for(const [key,value] of Object.entries(choice.stats||{}))game.stats[key]=clamp(game.stats[key]+value,0,999);
    for(const key of ['condition','fatigue','stress','trust'])game[key]=clamp(game[key]+(key==='trust'?trustGain(input,choice.trust||0):(choice[key]||0)));
    if(event.character){game.storyChoices??={};game.storyChoices[event.id]={choiceId:choice.id,month:game.elapsed}}
    const title=festivalResult?festivalResult.rank==='watch'?'가을제에서 보낸 응원의 하루':`${F.CONTESTS.find(c=>c.id===festivalResult.contestId).name} · ${festivalRank(festivalResult.score).name}`:event.title;
    const detail=choiceDetail(input,choice)+(festivalResult?.score!=null?` · 심사 ${festivalResult.score}점`:'');
    journal(game,title,choice.label+'. '+detail+(choice.reaction?` ${game.childName}: “${choice.reaction}”`:''),'event',game.pendingEvent.monthIndex);game.pendingEvent=null;
    if(game.lastReport){game.lastReport.after=snapshot(game);game.lastReport.choiceLabel=choice.label;game.lastReport.eventReaction=choice.reaction?{title,quote:choice.reaction,detail}:null}
    game.history[game.history.length-1]=snapshot(game);finishPhase(game);return game;
  }
  function care(input,kind){
    if(input.phase!=='planning')fail('먼저 이번 이야기를 마무리해 주세요.');
    if(input.careMonth===input.elapsed)fail('이번 달에는 이미 함께 시간을 보냈어요.');
    if(!['talk','treat'].includes(kind))fail('함께 보낼 시간을 골라 주세요.');
    if(kind==='treat'&&input.gold<15)fail('간식을 준비하려면 15G가 필요해요.');
    const game=copy(input),treat=kind==='treat',effects=careEffects(input,kind);game.gold-=effects.cost;
    for(const key of ['trust','stress','fatigue','condition'])game[key]=clamp(game[key]+effects[key]);game.careMonth=game.elapsed;
    const voice=S.VOICES[game.characterId],lines=input.condition<45||input.fatigue>65?[voice.tired]:input.stress>65?[voice.stressed]:[characterVoice(input),...(date(input).age<14?voice.young:voice.older)];
    const quote=lines[Math.floor(random(game)*lines.length)];journal(game,treat?'달콤한 오후':'함께 나눈 이야기',`${game.childName}: “${quote}”`,'care');game.history[game.history.length-1]=snapshot(game);return {game,quote};
  }
  function recommend(game){
    const target=endings[game.dreamId]||endings[C.CHARACTERS[game.characterId].dream];
    const score=a=>target.requirements.filter(r=>r.type==='stat').reduce((sum,r)=>sum+Math.max(0,1-game.stats[r.key]/r.min)*(a.gains[r.key]||0)/r.min,0)+(target.focus.includes(a.id)?.0004:0);
    const study=C.ACTIVITIES.filter(a=>a.category==='study'&&!requirement(game,a)).sort((a,b)=>score(b)-score(a));
    const work=C.ACTIVITIES.filter(a=>a.category==='work'&&!requirement(game,a)).sort((a,b)=>(score(b)+workIncome(game,b)*.00002)-(score(a)+workIncome(game,a)*.00002))[0].id;
    const first=study[0].id,second=game.dreamId==='traveler'&&game.counters.explorations<16&&!requirement(game,'explore')?'explore':study[1].id;
    let selected=[first,second,work,'rest'];
    if(game.condition<55||game.fatigue>55||game.stress>60)selected=[first,work,'rest','stroll'];
    const reserve=game.dreamId==='merchant'?2550:200;
    if(forecast(game,selected).gold<reserve)selected=[first,work,work,'rest'];
    if(game.condition<40||game.fatigue>80||game.stress>80)selected=[work,'rest',work,'rest'];
    let best=selected,bestScore=Infinity;
    function arrange(prefix,remaining){
      if(!remaining.length){const f=forecast(game,prefix),penalty=f.unaffordableWeeks.length*100000+f.recoveryWeeks.length*10000+Math.max(0,85-f.minimumCondition)*2+Math.max(0,f.peakFatigue-75)*3+f.fatigue*.2+f.stress*.1-f.condition*.1;if(penalty<bestScore){bestScore=penalty;best=prefix}return}
      for(let i=0;i<remaining.length;i++)if(remaining.indexOf(remaining[i])===i)arrange([...prefix,remaining[i]],remaining.filter((_,j)=>j!==i));
    }
    arrange([],selected);return best;
  }
  function setDream(input,id){if(input.phase!=='planning'||!endings[id]||endings[id].fallback)fail('지금은 목표를 바꿀 수 없어요.');const game=copy(input);game.dreamId=id;return game}
  function mood(game){if(game.condition<35)return '충분한 휴식이 필요해요';if(game.stress>70)return '마음에 여유가 필요해요';if(game.fatigue>65)return '조금 지친 하루예요';if(game.trust>80)return '함께하는 시간이 편안해요';return '새로운 하루가 기대돼요'}
  function integer(value,min,max,label){if(!Number.isInteger(value)||value<min||value>max)fail(`저장 파일의 ${label} 값이 올바르지 않습니다.`);return value}
  function text(value,max,label){if(typeof value!=='string'||value.length>max)fail(`저장 파일의 ${label} 내용을 확인해 주세요.`);return value}
  function readStats(value){if(!value||typeof value!=='object'||Array.isArray(value))fail('능력치 정보가 올바르지 않습니다.');return Object.fromEntries(KEYS.map(k=>[k,integer(value[k]===undefined&&C.INHERIT_STATS[k]?Math.round(value[C.INHERIT_STATS[k]]*.6):value[k],0,999,C.STATS[k].name)]))}
  function readSnapshot(s){if(!s||typeof s!=='object')fail('성장 기록을 읽을 수 없습니다.');return {month:integer(s.month,0,96,'기록 시점'),stats:readStats(s.stats),gold:integer(s.gold,0,999999999,'소지금'),...Object.fromEntries(['condition','fatigue','stress','trust'].map(k=>[k,integer(s[k],0,100,k)]))}}
  function readFestivalResult(row,game){
    if(!row||typeof row!=='object')fail('가을제 기록을 읽을 수 없습니다.');
    const monthIndex=integer(row.monthIndex,0,game.elapsed-1,'가을제 시점');
    if(date({elapsed:monthIndex}).month!==10)fail('가을제 기록의 날짜가 올바르지 않습니다.');
    if(!F.CONTESTS.some(c=>c.id===row.contestId)&&row.contestId!=='watch')fail('가을제 종목을 읽을 수 없습니다.');
    const watching=row.contestId==='watch',score=watching?null:integer(row.score,0,100,'심사 점수'),rank=watching?{id:'watch',reward:0}:festivalRank(score);
    if((watching&&row.score!==null)||row.rank!==rank.id||row.reward!==rank.reward||row.fee!==(watching?0:F.FEE))fail('가을제 성적과 상금이 맞지 않습니다.');
    return {monthIndex,contestId:row.contestId,score,rank:rank.id,reward:rank.reward,fee:row.fee,quote:text(row.quote,300,'가을제 답변'),feedback:text(row.feedback,500,'가을제 심사평')};
  }
  function readShopState(value,game){
    if(value===undefined)return emptyShop(game.elapsed);
    if(!value||typeof value!=='object'||Array.isArray(value)||!value.inventory||typeof value.inventory!=='object'||Array.isArray(value.inventory))fail('소지품함을 읽을 수 없습니다.');
    const state=emptyShop(game.elapsed);
    for(const [id,count] of Object.entries(value.inventory)){
      const item=items[id];if(!item)fail('알 수 없는 소지품이 있습니다.');state.inventory[id]=integer(count,1,item.category==='tool'?1:P.LIMITS.stack,'소지품 수량');
    }
    if(value.equippedToolId!==null&&(!items[value.equippedToolId]||items[value.equippedToolId].category!=='tool'||state.inventory[value.equippedToolId]!==1))fail('준비한 도구 정보가 올바르지 않습니다.');
    state.equippedToolId=value.equippedToolId;
    if(!value.usage||value.usage.month!==game.elapsed)fail('소지품 사용 시점이 올바르지 않습니다.');
    for(const key of ['recovery','gift'])state.usage[key]=integer(value.usage[key],0,P.LIMITS[key],'월간 사용 횟수');
    if(value.lastUse!==null){
      const row=value.lastUse,item=items[row?.itemId];if(!item||item.category==='tool')fail('소지품 사용 기록이 올바르지 않습니다.');
      state.lastUse={itemId:item.id,month:integer(row.month,0,Math.min(game.elapsed,95),'소지품 사용 날짜'),quote:text(row.quote,300,'소지품 답변'),detail:text(row.detail,500,'소지품 변화')};
      if(row.month===game.elapsed&&state.usage[item.category]===0)fail('소지품 사용 횟수와 기록이 맞지 않습니다.');
    }
    return state;
  }
  function validateGame(value){
    if(!value||value.version!==VERSION||!Object.hasOwn(C.CHARACTERS,value.characterId)||!Object.hasOwn(C.ORIGINS,value.originId))fail('이 게임에서 사용할 수 있는 저장 파일이 아닙니다.');
    const g={version:VERSION,characterId:value.characterId,originId:value.originId,childName:cleanName(text(value.childName,32,'이름'),C.CHARACTERS[value.characterId].name),guardianName:cleanName(text(value.guardianName,32,'보호자 이름'),'보호자'),dreamId:value.dreamId,elapsed:integer(value.elapsed,0,96,'진행 기간'),gold:integer(value.gold,0,999999999,'소지금'),stats:readStats(value.stats),seed:integer(value.seed,1,4294967295,'진행 정보'),phase:value.phase,careMonth:integer(value.careMonth,-1,96,'대화 기록'),pendingEvent:null,endingId:null,eventCooldowns:{},lastPlan:[],lastReport:null,counters:{},history:[],journal:[]};
    if(!endings[g.dreamId]||endings[g.dreamId].fallback)fail('진로 정보가 올바르지 않습니다.');
    for(const k of ['condition','fatigue','stress','trust'])g[k]=integer(value[k],0,100,k);
    g.shop=readShopState(value.shop,g);
    for(const k of ['explorations','weeksWorked','weeksStudied'])g.counters[k]=integer(value.counters?.[k],0,384,'활동 횟수');
    if(g.careMonth>g.elapsed)fail('대화 기록의 날짜가 올바르지 않습니다.');
    if(!Array.isArray(value.lastPlan)||![0,3,4].includes(value.lastPlan.length)||value.lastPlan.some(id=>!activities[id]))fail('이전 일정 정보가 올바르지 않습니다.');g.lastPlan=[...value.lastPlan];
    if(!Array.isArray(value.history)||value.history.length!==g.elapsed+1)fail('성장 기록의 길이가 올바르지 않습니다.');
    g.history=value.history.map((row,i)=>{const s=readSnapshot(row);if(s.month!==i)fail('성장 기록의 순서가 올바르지 않습니다.');return s});
    if(!Array.isArray(value.journal)||value.journal.length>400)fail('이야기 기록을 읽을 수 없습니다.');
    g.journal=value.journal.map(row=>({month:integer(row.month,0,96,'이야기 날짜'),title:text(row.title,120,'이야기 제목'),body:text(row.body,800,'이야기 본문'),tone:['normal','rest','event','care'].includes(row.tone)?row.tone:'normal'}));
    if(!value.eventCooldowns||typeof value.eventCooldowns!=='object'||Array.isArray(value.eventCooldowns))fail('이벤트 정보가 올바르지 않습니다.');
    for(const [id,month] of Object.entries(value.eventCooldowns)){if(!events[id])fail('알 수 없는 이야기 정보입니다.');g.eventCooldowns[id]=integer(month,0,96,'이벤트 날짜')}
    g.storyChoices={};
    if(value.storyChoices!==undefined&&(!value.storyChoices||typeof value.storyChoices!=='object'||Array.isArray(value.storyChoices)))fail('성장 에피소드를 읽을 수 없습니다.');
    for(const [id,row] of Object.entries(value.storyChoices||{})){
      const event=events[id];if(!event||event.character!==g.characterId||!row||!event.choices.some(c=>c.id===row.choiceId))fail('성장 에피소드의 선택이 올바르지 않습니다.');
      g.storyChoices[id]={choiceId:row.choiceId,month:integer(row.month,event.minMonth,g.elapsed,'에피소드 시점')};
    }
    for(const [id,row] of Object.entries(g.storyChoices)){const previous=events[id].after;if(previous&&(!g.storyChoices[previous]||g.storyChoices[previous].month>=row.month))fail('성장 에피소드의 순서가 올바르지 않습니다.')}
    if(value.festivalResults!==undefined&&(!Array.isArray(value.festivalResults)||value.festivalResults.length>8))fail('가을제 기록을 읽을 수 없습니다.');
    g.festivalResults=(value.festivalResults||[]).map(row=>readFestivalResult(row,g));
    if(g.festivalResults.some((r,i)=>i>0&&r.monthIndex<=g.festivalResults[i-1].monthIndex))fail('가을제 기록의 순서가 올바르지 않습니다.');
    if(value.pendingEvent){if(!events[value.pendingEvent.id])fail('진행 중인 이야기를 읽을 수 없습니다.');g.pendingEvent={id:value.pendingEvent.id,monthIndex:integer(value.pendingEvent.monthIndex,0,95,'이벤트 시점')};if(g.pendingEvent.monthIndex!==g.elapsed-1)fail('이벤트의 날짜가 맞지 않습니다.');}
    if(g.pendingEvent?.id==='harvest'&&(date({elapsed:g.pendingEvent.monthIndex}).month!==10||g.festivalResults.some(r=>r.monthIndex===g.pendingEvent.monthIndex)))fail('진행 중인 가을제가 올바르지 않습니다.');
    if(g.pendingEvent&&events[g.pendingEvent.id].character&&!storyAvailable(g,events[g.pendingEvent.id]))fail('진행 중인 성장 에피소드가 올바르지 않습니다.');
    if(!['planning','event','ending'].includes(g.phase)||(g.phase==='event')!==!!g.pendingEvent||(g.phase==='planning'&&g.elapsed>=96)||(g.phase==='ending'&&g.elapsed!==96))fail('이야기 진행 상태가 올바르지 않습니다.');
    if(g.phase==='ending'){if(!endings[value.endingId]||(value.ruleset!==2&&value.endingId!==selectEnding(g)))fail('엔딩 정보가 올바르지 않습니다.');g.endingId=value.endingId}
    if(value.lastReport){
      const r=value.lastReport;if(!Array.isArray(r.weeks)||![3,4].includes(r.weeks.length)||!r.date)fail('월간 기록을 읽을 수 없습니다.');
      const weeks=r.weeks.map((w,i)=>{if(!activities[w.activityId]||!activities[w.plannedId]||w.week!==i+1)fail('주간 활동을 읽을 수 없습니다.');return {week:i+1,activityId:w.activityId,plannedId:w.plannedId,cost:integer(w.cost,0,10000,'활동 비용'),income:integer(w.income,0,10000,'활동 수입'),gains:Object.fromEntries(Object.entries(w.gains||{}).map(([key,n])=>{if(!C.STATS[key])fail('성장 능력치를 읽을 수 없습니다.');return [key,integer(n,-999,999,'성장량')]})),note:text(w.note,500,'활동 내용'),reaction:w.reaction==null?null:text(w.reaction,300,'활동 대사'),efficiency:integer(w.efficiency,0,200,'성장 효율'),fatigue:integer(w.fatigue,0,100,'피로'),stress:integer(w.stress,0,100,'스트레스'),condition:integer(w.condition,0,100,'컨디션')}});
      for(let i=0;i<weeks.length;i++){
        const bonus=r.weeks[i].toolBonus;weeks[i].toolBonus=null;if(bonus==null)continue;
        const item=items[bonus.itemId];if(!item||item.category!=='tool'||bonus.stat!==item.bonus.stat||!item.activities.includes(weeks[i].activityId)||!(weeks[i].gains[bonus.stat]>=bonus.amount))fail('도구의 성장 기록이 올바르지 않습니다.');
        weeks[i].toolBonus={itemId:item.id,stat:bonus.stat,amount:integer(bonus.amount,1,1,'도구 성장량')};
      }
      if(weeks.filter(w=>w.toolBonus).length>P.LIMITS.toolBonus)fail('도구의 월간 성장 횟수가 올바르지 않습니다.');
      if(r.eventId&&!events[r.eventId])fail('월간 이벤트를 읽을 수 없습니다.');
      g.lastReport={date:{year:integer(r.date.year,1201,1209,'연도'),month:integer(r.date.month,1,12,'월'),age:integer(r.date.age,10,17,'나이')},monthIndex:integer(r.monthIndex,0,95,'월간 기록 시점'),before:readSnapshot(r.before),after:readSnapshot(r.after),weeks,allowance:integer(r.allowance,0,10000,'지원금'),expenses:integer(r.expenses,0,10000,'총비용'),income:integer(r.income,0,10000,'총수입'),eventId:r.eventId||null,choiceLabel:r.choiceLabel===null?null:text(r.choiceLabel,200,'선택 기록')};
      g.lastReport.starterGrant=integer(r.starterGrant??0,0,10000,'정착 지원금');g.lastReport.livingCost=integer(r.livingCost??0,0,10000,'생활비');
      g.lastReport.eventReaction=r.eventReaction==null?null:{title:text(r.eventReaction.title,120,'답변 제목'),quote:text(r.eventReaction.quote,300,'아이의 답변'),detail:text(r.eventReaction.detail,300,'선택의 변화')};
    }
    return g;
  }
  function serialize(game){return JSON.stringify({format:'starlight-life',version:VERSION,savedAt:new Date().toISOString(),game:validateGame(game)},null,2)}
  function deserialize(raw){if(typeof raw!=='string'||raw.length>2000000)fail('저장 파일의 크기가 너무 큽니다.');let data;try{data=JSON.parse(raw)}catch{fail('올바른 JSON 저장 파일이 아닙니다.')}if(data.format!=='starlight-life'||data.version!==VERSION)fail('이 게임의 저장 파일이 아닙니다.');return validateGame(data.game)}
  return {VERSION,MAX_MONTHS,activities,events,endings,createGame,date,season,requirement,monthlyBudget,workStatus,workIncome,careEffects,shopInfo,itemUsePreview,buyItem,useItem,equipTool,forecast,possibilities,advanceMonth,pendingEvent,resolveEvent,care,recommend,setDream,mood,characterStory,characterVoice,festivalInfo,festivalPreview,serialize,deserialize,validateGame,snapshot};
});
