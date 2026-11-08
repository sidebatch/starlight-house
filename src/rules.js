(function(root,factory){const api=factory(typeof module==='object'?require('./content.js'):root.MakerContent);if(typeof module==='object')module.exports=api;else root.MakerRules=api})(globalThis,function(C){
  'use strict';
  const CORE=['vitality','intellect','energy','pride','morality','elegance','attitude','sensitivity','charm','courage','karma'];
  const additions={energy:{name:'기력',source:'vitality'},pride:{name:'자존심',source:'elegance'},attitude:{name:'성품',source:'morality'},courage:{name:'용기',source:'combat'},karma:{name:'업보',source:null}};
  for(const [key,s] of Object.entries(additions)){C.STATS[key]={name:s.name,color:'#927150'};for(const c of Object.values(C.CHARACTERS))c.stats[key]=s.source?Math.round(c.stats[s.source]*.8):0}
  C.STATS.morality.name='도덕성';C.STATS.sensitivity.name='센스';
  const more={reading:{pride:2,energy:-1},painting:{pride:2,attitude:1},sword:{courage:5,energy:3},etiquette:{attitude:5,pride:3},athletics:{energy:6,courage:3},nature:{attitude:3,energy:2},chores:{attitude:5,pride:-1},farm:{energy:5,pride:-2},library:{attitude:3},workshop:{courage:3,energy:3},salon:{attitude:4,pride:1},church:{attitude:4,karma:-5},magic:{pride:3,energy:2},cooking:{attitude:3},explore:{courage:5,energy:3},trip:{attitude:2},stroll:{attitude:1}};
  for(const a of C.ACTIVITIES)Object.assign(a.gains,more[a.id]||{});
  const explore=C.ACTIVITIES.find(a=>a.id==='explore');Object.assign(explore,{description:'동쪽 숲의 길을 직접 걸으며 전투와 만남을 경험합니다.',minAge:10,requires:{},region:'forest',name:'동쪽 숲 무사수행'});
  C.ACTIVITIES.push(
    {id:'music',name:'음악 수업',category:'study',mark:'音',cost:60,gains:{art:8,sensitivity:5,charm:3,pride:2},fatigue:10,stress:-3,description:'악기와 노래로 마음을 표현합니다.'},
    {id:'dance',name:'무용 수업',category:'study',mark:'舞',cost:65,gains:{elegance:7,charm:8,energy:3,pride:2},fatigue:15,stress:2,description:'몸의 균형과 무대 위의 표현을 익힙니다.'},
    {id:'medicine',name:'의학 수업',category:'study',mark:'醫',cost:65,gains:{intellect:8,morality:4,attitude:4},fatigue:13,stress:4,description:'약초와 사람의 몸을 공부합니다.',minAge:12},
    {id:'strategy',name:'전술 수업',category:'study',mark:'陣',cost:70,gains:{intellect:5,combat:7,courage:5,pride:3},fatigue:14,stress:5,description:'전장의 흐름을 읽고 동료를 지휘합니다.',minAge:12},
    {id:'market',name:'시장 점원',category:'work',mark:'商',income:56,gains:{intellect:3,charm:3,attitude:3,housework:3,pride:-1},fatigue:15,stress:6,description:'흥정과 장부 정리로 장사의 기본을 배웁니다.'},
    {id:'inn',name:'여관 일',category:'work',mark:'宿',income:48,gains:{cooking:4,housework:5,attitude:4,pride:-2},fatigue:17,stress:5,description:'손님을 맞고 식사와 잠자리를 준비합니다.'},
    {id:'guard',name:'경비대 보조',category:'work',mark:'衛',income:76,gains:{combat:5,courage:5,energy:3,morality:2},fatigue:20,stress:7,minAge:14,requires:{combat:90},description:'성문과 마을의 안전을 지킵니다.'},
    {id:'courier',name:'비밀 운송',category:'work',mark:'影',income:100,gains:{courage:6,dexterity:4,karma:12,morality:-5,attitude:-3},fatigue:21,stress:9,minAge:15,description:'내용을 묻지 않는 수상한 의뢰. 많은 보수에는 책임이 따릅니다.'},
    ...[['ruins','남쪽 폐허',12,60],['desert','서쪽 사막',14,100],['mountain','북쪽 설산',16,160]].map(([region,name,minAge,vit])=>({id:'explore_'+region,name:name+' 무사수행',category:'adventure',mark:'旅',cost:35,gains:{combat:6,vitality:4,courage:6,energy:3},fatigue:18,stress:0,minAge,requires:{vitality:vit},region,description:name+'의 길을 직접 탐색합니다.'}))
  );
  const rows=[];
  function add(id,title,group,stats,letter,extra={}){rows.push({id,title,group,stats,short:letter.split('.')[0],description:letter,letter,focus:[],requirements:[],...extra})}
  // These conditions are only evaluated at adulthood; none are sent to the game UI as hints.
  const branches=[
    ['reading','학문',[['philosopher','왕립 대학의 철학자',{intellect:440,pride:150},'모든 질문에 답을 붙이지 않아도 괜찮다는 것을 배웠어요. 이제 제 질문을 다음 세대와 나누려 해요.'],['teacher','작은 학교의 선생님',{intellect:240,attitude:120},'서툰 목소리를 기다려 주던 집처럼, 누구나 질문할 수 있는 교실을 만들었어요.'],['scribe','마을의 서기',{intellect:100},'장부 사이에 사람들의 삶이 있더군요. 작고 정확한 글씨로 우리 마을의 하루를 남깁니다.']]],
    ['painting','그림',[['courtPainter','왕실의 화가',{art:420,sensitivity:250,elegance:140},'왕궁의 벽을 채우면서도 처음 그림을 걸었던 우리 집을 떠올려요. 그 창가의 색은 잊지 않았어요.'],['illustrator','동화 삽화가',{art:240,sensitivity:160},'어린 독자가 오래 들여다보는 그림을 그리고 있어요. 제 이야기를 들어 주셨던 저녁에서 시작된 일이에요.'],['signPainter','거리의 간판 화가',{art:100},'골목마다 제가 그린 작은 그림이 걸려 있어요. 사람들의 발길이 잠시 머무는 일이 기뻐요.']]],
    ['music','음악',[['composer','왕국의 작곡가',{art:400,intellect:200,sensitivity:180},'이 집에서 들었던 빗소리가 첫 악장의 시작이 되었어요. 멀리서도 알아들을 수 있는 노래를 쓸게요.'],['singer','여행하는 가수',{art:220,charm:180},'처음에는 떨리던 목소리가 이제 낯선 도시를 잇습니다. 돌아오는 날에는 새 노래를 들려드릴게요.'],['musicTeacher','동네의 음악 선생님',{art:100,attitude:80},'박자를 놓치는 아이에게 다시 시작하자고 말했어요. 저도 그렇게 배웠으니까요.']]],
    ['dance','무용',[['prima','왕립 무용단의 수석',{elegance:400,charm:340,energy:160},'막이 오르기 전의 고요가 이제 두렵지 않아요. 무대 뒤에서 늘 제 편이 되어 준 마음을 기억해요.'],['dancer','축제의 무희',{charm:220,elegance:180},'광장에 음악이 울리면 누구나 함께 춤출 수 있어요. 웃음이 번져 가는 순간이 가장 좋아요.'],['danceTeacher','무용 교사',{elegance:100,attitude:100},'몸을 움직이는 즐거움을 함께 배우고 있어요. 서툰 첫걸음도 무대의 시작이라고 말해 줍니다.']]],
    ['sword','검술',[['paladin','왕국의 수호 기사',{combat:400,courage:250,morality:200},'검을 뽑는 용기와 거두는 용기를 함께 배웠어요. 누군가 무사히 집으로 돌아오는 길을 지킬게요.'],['swordswoman','검술 도장의 사범',{combat:240,courage:130},'수련장을 열었습니다. 강한 사람이 되기 전에 믿을 만한 사람이 되자고 가르치고 있어요.'],['soldier','왕국의 병사',{combat:100,energy:80},'동료들과 성문을 지키고 있어요. 평범한 아침이 이어지는 것도 누군가의 일이라는 걸 알게 되었어요.']]],
    ['magic','마법',[['archmage','별의 대마법사',{magic:430,intellect:300,pride:140},'별빛을 기록한 책의 마지막 장에는 우리 집으로 돌아오는 주문을 적었어요. 배움은 아직 끝나지 않았어요.'],['alchemist','도시의 연금술사',{magic:240,intellect:180,dexterity:100},'실험실에 온 손님이 고장 난 시계를 맡겼어요. 거대한 비밀보다 작은 필요를 해결하는 마법도 좋더군요.'],['apprenticeMage','마법사의 제자',{magic:100},'아직 실패하는 주문이 많아요. 그래도 내일 다시 해 보고 싶다는 마음이 저를 여기까지 데려왔어요.']]],
    ['cooking','요리',[['royalChef','왕실 요리장',{cooking:420,sensitivity:160,attitude:160},'가장 귀한 재료를 다루면서도 함께 먹던 소박한 식탁을 생각해요. 한 끼로 마음을 전하는 사람이 되었어요.'],['restaurant','작은 식당의 주인',{cooking:220,housework:150},'문 앞에 오늘의 메뉴를 적었습니다. 제가 만든 음식을 먹고 힘내는 손님들을 보면 마음이 든든해요.'],['baker','골목의 제빵사',{cooking:100,dexterity:70},'해 뜨기 전에 빵을 굽고 있어요. 하루를 시작하는 사람들에게 따뜻한 봉투를 건넵니다.']]],
    ['church','신앙',[['highPriest','대성당의 사제',{faith:400,morality:300,attitude:150},'기도만큼 귀 기울이는 일이 중요하다는 것을 배웠어요. 문을 두드리는 이에게 먼저 자리를 내어 줄게요.'],['nun','작은 성당의 수도자',{faith:220,morality:160},'화려하지 않은 하루를 선택했어요. 누군가의 짐을 조금 나누는 일로 충분한 날도 있더군요.'],['volunteer','마을의 봉사자',{faith:80,attitude:100},'도움을 청하는 목소리가 들리면 손을 내밀어요. 제게 건네 주었던 따뜻함을 이웃에게 옮기고 있어요.']]],
    ['medicine','의학',[['physician','왕립 병원의 의사',{intellect:420,morality:200,attitude:180},'환자의 이름부터 기억하려고 합니다. 몸과 마음을 함께 돌보는 의사가 되고 싶어요.'],['herbalist','숲의 약초사',{intellect:220,sensitivity:200},'숲길에서 배운 계절의 변화를 약으로 엮었어요. 먼 마을에서도 약초를 구하러 찾아옵니다.'],['nurse','마을 진료소의 간호사',{intellect:100,attitude:100},'회복한 사람이 문 밖으로 걸어 나가는 모습을 좋아해요. 오늘도 돌아올 자리를 깨끗이 준비합니다.']]],
    ['etiquette','예법',[['chancellor','왕국의 재상',{intellect:350,elegance:350,morality:200,pride:180},'회의실의 많은 목소리 사이에서 놓친 사람은 없는지 살펴요. 권한이 커진 만큼 더 신중해지려 합니다.'],['ambassador','왕국의 사절',{elegance:250,charm:220,attitude:140},'서로 다른 말과 풍습 사이를 여행합니다. 상대를 이해하려는 마음은 어디서나 통하더군요.'],['steward','귀족 저택의 집사',{manners:120,elegance:100},'누군가의 하루가 자연스럽게 흘러가도록 작은 일들을 챙깁니다. 믿고 맡길 수 있다는 말이 기뻐요.']]],
    ['strategy','전술',[['general','왕국의 장군',{combat:350,intellect:300,courage:260},'싸움에서 이기는 것보다 모두가 돌아오는 작전을 고민합니다. 집을 지키겠다는 약속은 아직 제 중심에 있어요.'],['tactician','성의 전술가',{intellect:230,combat:180},'지도 위의 작은 표식에도 사람들의 삶이 있다는 걸 잊지 않으려고 해요. 오래 생각한 뒤 명령을 내립니다.'],['officer','경비대의 부관',{combat:100,intellect:100},'동료들의 이름과 습관을 기억하며 근무표를 짭니다. 익숙한 도시를 지키는 일이 제 일이 되었어요.']]],
    ['workshop','공예',[['masterArtisan','왕국의 명장',{dexterity:400,housework:250,pride:160},'손에서 나온 물건이 오래 쓰이기를 바랍니다. 닳은 도구에는 배운 날들의 흔적이 남아 있어요.'],['jeweler','보석 세공사',{dexterity:220,art:160},'작은 돌에 빛이 머물 자리를 만듭니다. 소중한 순간에 오래 곁에 있을 물건을 만들고 싶어요.'],['craftswoman','마을의 공방 주인',{dexterity:100,housework:80},'부러진 의자부터 새 문고리까지, 이웃의 부탁으로 하루가 채워집니다. 제 손이 필요한 곳이 생겼어요.']]]
  ];
  for(const [group,,entries] of branches)entries.forEach((r,i)=>add(r[0],r[1],group,r[2],r[3],{tier:3-i}));
  add('guildmaster','상인 조합장','market',{intellect:300,charm:220,housework:200},'사람들의 길을 이어 시장을 넓혔어요. 정직한 거래가 오래가는 약속이 된다는 걸 배웠습니다.',{gold:3000});
  add('shopkeeper','거리의 가게 주인','market',{intellect:100,housework:100},'작은 가게의 문을 열었습니다. 첫 손님을 기다리며 차를 끓이고 있어요. 언제든 들러 주세요.');
  add('farmer','풍요로운 농장의 주인','farm',{vitality:180,energy:160},'씨앗을 심고 기다리는 일은 아이를 기르는 일과 닮았더군요. 올해도 무사히 수확을 마쳤어요.');
  add('innkeeper','길손의 여관 주인','inn',{housework:170,attitude:160},'긴 여행을 마친 이들이 쉬어 가는 집을 열었어요. 제게도 늘 돌아갈 곳이 있었다는 걸 떠올립니다.');
  add('ranger','숲의 길잡이','explore',{courage:200,vitality:180},'낯선 길을 지나려는 사람들의 곁을 걷습니다. 길을 찾는 일만큼 돌아오는 일도 잘 알고 있어요.',{visits:5});
  add('guardian','변경의 수호자','guard',{combat:240,morality:140},'누군가 부당한 일을 겪으면 지나치지 않기로 했어요. 작은 약속들이 저를 이 자리로 데려왔습니다.');
  add('shadowBroker','뒷골목의 중개인','courier',{charm:170,courage:200,karma:200},'공식 장부에는 남지 않는 거래를 맡고 있어요. 손에 쥔 것은 많아졌지만, 선택의 무게도 잊지 않으려 합니다.',{maxMorality:180});
  add('wanderer','자유로운 방랑자','',{},'한 가지 이름에 머무르지 않기로 했어요. 배운 것과 만난 사람들을 짐에 담고 다음 길을 고릅니다.',{fallback:true});
  const special=[
    ['fairyQueen','숲의 여왕',{sensitivity:350,attitude:250},'숲에서 건넨 작은 친절이 오래된 약속을 깨웠어요. 두 세계가 서로를 해치지 않도록 경계를 지키겠습니다.',{flag:'fairy',minBond:3,maxKarma:80}],
    ['starKeeper','별의 수호자',{magic:350,morality:220},'폐허의 봉인이 열리던 날, 오래된 별의 목소리를 들었어요. 이 힘을 무엇을 위해 쓸지 매일 다시 선택합니다.',{flag:'star',cleared:'ruins',maxKarma:100}],
    ['desertSovereign','모래 도시의 지도자',{courage:300,intellect:220},'메마른 길에 다시 물이 흐릅니다. 함께 길을 연 사람들과 누구도 버려지지 않는 도시를 만들고 있어요.',{flag:'oasis',cleared:'desert'}],
    ['dragonFriend','용과 약속한 사람',{courage:350,attitude:180},'설산에서 맺은 약속은 힘으로 빼앗은 것이 아니었어요. 다른 존재를 이해하려는 시간이 제 삶을 바꿨습니다.',{flag:'dragon',cleared:'mountain'}],
    ['darkMage','금단의 마법사',{magic:330,karma:220},'지름길의 대가를 이제는 알아요. 손에 넣은 힘과 남겨진 책임을 안고, 제가 고른 길을 끝까지 돌아보려 합니다.',{flag:'pact'}],
    ['royalPartner','왕실과 맺은 새 인연',{elegance:350,charm:300,attitude:220},'열여덟 살의 봄, 오랫동안 편지를 주고받던 사람이 미래를 함께 걷자고 청했어요. 제 뜻으로 고른 새로운 시작입니다.',{flag:'court',minBond:3,maxKarma:100}],
    ['forestPartner','숲의 왕자와의 약속',{charm:250,sensitivity:250},'두 세계의 길을 함께 걷던 친구와 앞으로도 함께하기로 했어요. 제가 돌아갈 집의 이야기를 가장 먼저 들려주었습니다.',{flag:'forestFriend',minBond:3,maxKarma:120}],
    ['champion','왕국의 대회 영웅',{combat:350,courage:250},'세 번의 우승보다 도전을 멈추지 않았던 날들이 먼저 떠올라요. 다음에는 새로운 도전자에게 자리를 내어 줄게요.',{wins:3}],
    ['atonement','새 삶을 택한 순례자',{morality:250,faith:200},'예전의 선택을 없던 일로 만들 수는 없어요. 다만 오늘의 행동은 다시 고를 수 있다는 것을 배웠습니다.',{flag:'atonement',maxKarma:70}]
  ];
  for(const r of special)add(r[0],r[1],'special',r[2],r[3],r[4]);
  C.EXTRA_ENDINGS=rows;
  const count=(g,id)=>g.activityCounts?.[id]||0;
  function matches(g,e){const x=g.exploration||{};return Object.entries(e.stats).every(([k,v])=>g.stats[k]>=v)&&(!e.gold||g.gold>=e.gold)&&(!e.maxMorality||g.stats.morality<=e.maxMorality)&&(e.maxKarma===undefined||g.stats.karma<=e.maxKarma)&&(!e.flag||(x.bonds?.[e.flag]||0)>=(e.minBond||1))&&(!e.cleared||x.cleared?.includes(e.cleared))&&(!e.visits||(x.visits||0)>=e.visits)&&(!e.wins||g.festivalResults.filter(r=>r.contestId==='martial'&&r.rank==='gold').length>=e.wins)}
  function resolveEnding(g){const special=rows.filter(e=>e.group==='special'&&matches(g,e));if(special.length)return special[0].id;const candidates=rows.filter(e=>e.group!=='special'&&!e.fallback&&matches(g,e)&&count(g,e.group)>=8);candidates.sort((a,b)=>count(g,b.group)-count(g,a.group)||(b.tier||1)-(a.tier||1));return candidates[0]?.id||'wanderer'}
  return {CORE,additions,endings:rows,resolveEnding,branches:branches.map(b=>b[0])};
});
