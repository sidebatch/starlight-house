(function(root,factory){const api=factory(typeof module==='object'?require('./rules.js'):root.MakerRules);if(typeof module==='object')module.exports=api;else root.MakerAdventure=api})(globalThis,function(R){
 'use strict';
 const REGIONS={
  forest:{name:'동쪽의 초록 숲',minAge:10,level:1,color:'#688251',tiles:{2:'treasure',6:'enemy',8:'npc',12:'camp',14:'enemy',18:'shrine',22:'boss',24:'gate'},enemy:'숲의 들개',boss:'숲길의 도적',npc:'숲의 요정',bond:'fairy',relic:'leaf',story:'큰 나무 아래에서 요정이 다친 새를 안고 있습니다. 잠시 걸음을 멈출까요?'},
  ruins:{name:'남쪽의 별빛 폐허',minAge:12,level:2,color:'#7e7497',tiles:{2:'enemy',6:'treasure',8:'npc',12:'camp',14:'shrine',18:'enemy',22:'boss',24:'gate'},enemy:'폐허의 수호상',boss:'잠들지 못한 기사',npc:'별의 기록자',bond:'star',relic:'star',story:'기록자가 흩어진 서판을 모으고 있습니다. 봉인의 의미를 함께 읽어 보자고 합니다.'},
  desert:{name:'서쪽의 황금 사막',minAge:14,level:3,color:'#b59458',tiles:{2:'treasure',6:'npc',8:'enemy',12:'camp',14:'shrine',18:'enemy',22:'boss',24:'gate'},enemy:'모래 전갈',boss:'오아시스의 약탈자',npc:'길 잃은 상인',bond:'oasis',relic:'sun',story:'상인이 마지막 물통을 들고 주저앉아 있습니다. 목적지까지 함께 갈 길을 찾을 수 있을까요?'},
  mountain:{name:'북쪽의 은빛 설산',minAge:16,level:4,color:'#7a96a6',tiles:{2:'enemy',6:'shrine',8:'treasure',12:'camp',14:'npc',18:'enemy',22:'boss',24:'gate'},enemy:'눈보라의 정령',boss:'산길을 지키는 용',npc:'산의 파수꾼',bond:'dragon',relic:'ice',story:'파수꾼은 용이 둥지를 지키려는 것뿐이라고 말합니다. 인간과 용이 함께 지날 길을 찾고 있습니다.'}
 };
 const limit=(n,min,max)=>Math.round(Math.max(min,Math.min(max,n)));
 function random(g){let x=g.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;g.seed=x>>>0||1;return g.seed/4294967296}
 function capacities(g){return {hp:Math.round(50+g.stats.vitality*.22+g.stats.energy*.12),mp:Math.round(15+g.stats.magic*.13+g.stats.intellect*.04)}}
 function ledger(){return {visits:0,wins:0,defeats:0,cleared:[],treasures:[],bonds:{},relics:[]}}
 function create(g,region){const r=REGIONS[region];if(!r)throw Error('알 수 없는 지역입니다.');const cap=capacities(g);g.exploration.visits++;return {region,position:0,days:10,hp:Math.max(10,Math.round(cap.hp*(.55+g.condition*.0045))),mp:cap.mp,maxHP:cap.hp,maxMP:cap.mp,herbs:2,visited:[0],battle:null,encounter:null,log:[r.name+'에 도착했습니다. 열흘 안에 돌아오는 길을 찾으세요.'],finished:false,result:null}}
 function battle(g,level,name,boss=false){const year=Math.floor(g.elapsed/12);return {name,level,boss,hp:Math.round(30+level*22+(boss?30:0)+year*3),maxHP:Math.round(30+level*22+(boss?30:0)+year*3),attack:6+level*4+year,defense:2+level*2,combatSkill:30+level*22+year*8,magicSkill:level>=2?25+level*22+year*8:0,magicPower:level>=2?8+level*4+year:0,magicDefense:level*2,damageBy:{physical:0,magic:0},turn:0,guarding:false,result:null,log:[name+'이 앞을 가로막았습니다.']}}
 function hitChance(skill,opposing){return Math.max(.1,Math.min(.98,.75+(skill-opposing)*.0012))}
 function win(g,b){b.result='won';const key=b.damageBy.magic>b.damageBy.physical?'mage':'fighter',amount=b.boss?12:5;R.award(g,key,amount);b.log.push('승리했습니다. '+R.REPUTATIONS[key].name+' +'+amount);return 'won'}
 function combat(g,a,action){const b=a.battle;if(!b||b.result)throw Error('진행 중인 전투가 없습니다.');if(!['attack','magic','guard','herb','flee'].includes(action))throw Error('전투 행동을 골라 주세요.');
  if(action==='magic'&&a.mp<5)throw Error('마력이 부족합니다.');if(action==='herb'&&a.herbs<1)throw Error('약초가 없습니다.');
  b.turn++;const bonus=g.exploration.relics.length*2+(g.trophies?.includes('martial')?4:0);let damage=0,guard=false;
  if(action==='flee'){b.result='fled';b.log.push('무리하지 않고 물러났습니다.');return b.result}
  if(action==='attack'){if(random(g)<hitChance(g.stats.combat,b.combatSkill)){damage=Math.max(1,Math.round((9+g.stats.attack*.12+g.stats.strength*.08+bonus)*(0.9+random(g)*.2)-b.defense*(b.guarding?1.8:1)));b.damageBy.physical+=Math.min(b.hp,damage);b.log.push('검으로 '+damage+'의 피해를 주었습니다.')}else b.log.push('상대가 검을 피했습니다. 전투기술을 더 익혀야겠어요.')}
  if(action==='magic'){a.mp-=5;if(random(g)<hitChance(g.stats.magic,b.magicSkill)){damage=Math.max(1,Math.round((10+g.stats.magicPower*.18+g.stats.intellect*.06+bonus)*(.9+random(g)*.2)-b.magicDefense));b.damageBy.magic+=Math.min(b.hp,damage);b.log.push('마법으로 '+damage+'의 피해를 주었습니다.')}else b.log.push('마법이 빗나갔습니다. 마법기술을 더 익혀야겠어요.')}
  if(action==='guard'){guard=true;a.mp=Math.min(a.maxMP,a.mp+3);b.log.push('공격에 대비하며 마력을 가다듬습니다.')}
  if(action==='herb'){a.herbs--;const heal=Math.round(a.maxHP*.38);a.hp=Math.min(a.maxHP,a.hp+heal);b.log.push('약초로 생명력을 회복했습니다.')}
  b.hp=Math.max(0,b.hp-damage);if(b.hp===0)return win(g,b);
  b.guarding=b.turn%4===0;const spell=b.magicPower>0&&b.turn%3===0,skill=spell?b.magicSkill:b.combatSkill,opposing=spell?g.stats.magic:g.stats.combat;
  if(random(g)<hitChance(skill,opposing)){const power=spell?b.magicPower:b.attack*(b.turn%3===0?1.35:1),defense=spell?g.stats.magicDefense*.04:g.stats.defense*.04,enemyDamage=Math.max(1,Math.round((power-defense)*(guard?.3:1)*(.9+random(g)*.2)));a.hp=Math.max(0,a.hp-enemyDamage);b.log.push((spell?'상대의 마법! ':b.turn%3===0?'거센 공격! ':'')+enemyDamage+'의 피해를 받았습니다.')}else b.log.push(spell?'상대의 마법을 피했습니다.':'상대의 공격을 피했습니다.');
  if(a.hp===0||b.turn>=60){b.result='lost';b.log.push('더 싸울 수 없어 구조대의 도움을 받았습니다.');return 'lost'}
  b.log=b.log.slice(-6);return null;
 }
 function move(g,index){const a=g.adventure,r=REGIONS[a.region];if(a.finished||a.battle||a.encounter)throw Error('현재 상황을 먼저 마무리해 주세요.');if(!Number.isInteger(index)||index<0||index>24||Math.abs(index%5-a.position%5)+Math.abs(Math.floor(index/5)-Math.floor(a.position/5))!==1)throw Error('바로 옆 칸으로 이동해 주세요.');
  a.position=index;a.days--;const seen=a.visited.includes(index);if(!seen)a.visited.push(index);const tile=r.tiles[index]||'path';a.log.push((index+1)+'번 길로 이동했습니다.');
  if(!seen){
   if(tile==='enemy'||tile==='boss')a.battle=battle(g,r.level,tile==='boss'?r.boss:r.enemy,tile==='boss');
   if(tile==='treasure'){const id=a.region+':'+index;if(!g.exploration.treasures.includes(id)){g.exploration.treasures.push(id);g.gold+=35*r.level;a.herbs++;a.log.push('오래된 상자에서 '+35*r.level+'G와 약초를 찾았습니다.')}else a.log.push('한 번 열었던 상자입니다.')}
   if(tile==='camp'){a.hp=Math.min(a.maxHP,a.hp+Math.round(a.maxHP*.4));a.mp=Math.min(a.maxMP,a.mp+10);a.log.push('안전한 야영지에서 쉬었습니다.')}
   if(tile==='npc'||tile==='shrine')a.encounter=tile;
   if(tile==='gate'){a.finished=true;a.result='returned';a.log.push('귀환로를 따라 집으로 돌아갑니다.')}
  }
  if(a.days<=0&&!a.battle&&!a.encounter){a.finished=true;a.result='returned';a.log.push('약속한 열흘이 지나 귀환합니다.')}a.log=a.log.slice(-7);return g;
 }
 function choice(g,id){const a=g.adventure,r=REGIONS[a.region],kind=a.encounter;if(!kind)throw Error('대화할 상대가 없습니다.');const allowed=kind==='npc'?['help','talk','steal']:['pray','pact','leave'];if(!allowed.includes(id))throw Error('선택지를 다시 골라 주세요.');
  const bond=key=>g.exploration.bonds[key]=Math.min(20,(g.exploration.bonds[key]||0)+1);
  if(id==='help'){if(g.gold<20)throw Error('도울 물자를 마련하려면 20G가 필요합니다.');g.gold-=20;bond(r.bond);if(a.region==='forest')bond('forestFriend');g.stats.attitude=limit(g.stats.attitude+8,0,999);g.stats.morality=limit(g.stats.morality+6,0,999);g.stats.karma=limit(g.stats.karma-5,0,999);a.log.push(r.npc+'와 신뢰를 쌓았습니다.')}
  if(id==='talk'){g.stats.sensitivity=limit(g.stats.sensitivity+5,0,999);a.log.push('서로의 이야기를 나누고 길을 떠났습니다.')}
  if(id==='steal'){g.gold+=50*r.level;g.stats.karma=limit(g.stats.karma+30,0,999);g.stats.morality=limit(g.stats.morality-10,0,999);a.log.push('주인이 없는 틈에 짐을 가져왔습니다. 마음에 무거운 흔적이 남았습니다.')}
  if(id==='pray'){if(g.stats.karma>=100)bond('atonement');g.stats.karma=limit(g.stats.karma-20,0,999);g.stats.faith=limit(g.stats.faith+6,0,999);a.log.push('지나온 선택을 돌아보며 기도했습니다.')}
  if(id==='pact'){bond('pact');g.stats.magic=limit(g.stats.magic+20,0,999);g.stats.magicPower=limit(g.stats.magicPower+20,0,999);g.stats.karma=limit(g.stats.karma+40,0,999);a.log.push('낯선 힘을 받아들였습니다. 약속의 대가도 함께 남았습니다.')}
  a.encounter=null;if(a.days<=0){a.finished=true;a.result='returned'}return g;
 }
 function fight(g,action){const a=g.adventure,result=combat(g,a,action);if(result){a.log.push(...a.battle.log.slice(-2));if(result==='won'){g.exploration.wins++;g.gold+=a.battle.level*12;g.stats.courage=limit(g.stats.courage+5,0,999);if(a.battle.boss){if(!g.exploration.cleared.includes(a.region)){g.exploration.cleared.push(a.region);g.exploration.relics.push(REGIONS[a.region].relic);a.log.push('지역의 위협을 해결하고 유물을 얻었습니다.')}g.stats.combat=limit(g.stats.combat+8,0,999)}}
   if(result==='lost'){g.exploration.defeats++;a.finished=true;a.result='rescued';g.condition=Math.max(10,g.condition-20);g.gold=Math.max(0,g.gold-25);a.log.push('구조되어 무사히 돌아왔습니다. 생명을 잃지 않습니다.')}
   a.battle=null;if(a.days<=0){a.finished=true;a.result??='returned'}
  }return g;
 }
 return {REGIONS,capacities,ledger,create,move,choice,fight,battle,combat,random,hitChance};
});
