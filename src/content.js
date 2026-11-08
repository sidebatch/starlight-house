(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.MakerContent=data;})(globalThis,function(){
  'use strict';
  const STATS={
    vitality:{name:'체력',color:'#9b7851'},intellect:{name:'지력',color:'#647e96'},
    elegance:{name:'기품',color:'#99809d'},charm:{name:'매력',color:'#bd877e'},
    art:{name:'예술',color:'#b49b57'},combat:{name:'무술',color:'#728e85'},
    housework:{name:'생활력',color:'#929061'},sensitivity:{name:'감수성',color:'#82a4a2'},
    strength:{name:'근력',color:'#a87956'},morality:{name:'도덕심',color:'#708d68'},
    faith:{name:'신앙',color:'#b49b57'},manners:{name:'예법',color:'#99809d'},
    magic:{name:'마법',color:'#7878b0'},cooking:{name:'요리',color:'#bd877e'},
    dexterity:{name:'손재주',color:'#929061'}
  };
  const LEGACY_STATS=['vitality','intellect','elegance','charm','art','combat','housework','sensitivity'];
  // Old saves inherit related experience; future growth is independent and stored.
  const INHERIT_STATS={strength:'vitality',morality:'sensitivity',faith:'sensitivity',manners:'elegance',magic:'intellect',cooking:'housework',dexterity:'art'};
  const CHARACTERS={
    ciel:{name:'시엘',initial:'C',tag:'세상을 천천히 들여다보는 아이',description:'작은 풍경과 이야기에서 영감을 얻습니다. 학문과 그림을 배울 때 조금 더 빠르게 성장합니다.',preferences:['reading','painting'],dream:'artist',stats:{vitality:34,intellect:48,elegance:37,charm:35,art:42,combat:18,housework:30,sensitivity:52}},
    valeria:{name:'발레리아',initial:'V',tag:'새로운 길을 먼저 발견하는 아이',description:'몸을 움직이고 낯선 곳을 탐험하는 것을 좋아합니다. 운동과 검술을 배울 때 조금 더 빠르게 성장합니다.',preferences:['athletics','sword'],dream:'knight',stats:{vitality:50,intellect:32,elegance:24,charm:44,art:28,combat:47,housework:36,sensitivity:35}}
  };
  const ORIGINS={
    artist:{name:'예술가',room:'예술가의 방',description:'작은 작업실에서 시작하는 이야기',gold:500,allowance:45,bonus:{art:8,sensitivity:6}},
    knight:{name:'기사',room:'기사의 방',description:'용기와 약속을 소중하게 여기는 집',gold:450,allowance:45,bonus:{combat:8,vitality:6}},
    merchant:{name:'상인',room:'상인의 방',description:'여러 사람과 물건이 오가는 집',gold:650,allowance:45,bonus:{housework:8,intellect:5},workBonus:0.1},
    monk:{name:'수도사',room:'수도사의 방',description:'차분한 마음을 배우는 소박한 집',gold:400,allowance:45,bonus:{sensitivity:10,elegance:5}},
    noble:{name:'귀족',room:'귀족의 방',description:'예절과 배움을 가까이하는 집',gold:750,allowance:45,bonus:{elegance:12,charm:5}},
    wanderer:{name:'방랑자',room:'방랑자의 방',description:'먼 길의 이야기를 간직한 집',gold:350,allowance:45,bonus:{vitality:8,housework:8}}
  };
  const ACTIVITIES=[
    {id:'reading',name:'학문 수업',category:'study',mark:'學',description:'책 속에서 세상을 이해하는 방법을 배워요.',cost:55,gains:{intellect:9,sensitivity:2},fatigue:12,stress:4},
    {id:'painting',name:'그림 수업',category:'study',mark:'彩',description:'눈에 담아 둔 장면을 색으로 옮겨요.',cost:65,gains:{art:10,sensitivity:5},fatigue:9,stress:-3},
    {id:'sword',name:'검술 수업',category:'study',mark:'劍',description:'기본 자세와 자신을 지키는 기술을 익혀요.',cost:60,gains:{combat:11,vitality:4},fatigue:19,stress:4},
    {id:'etiquette',name:'예절 수업',category:'study',mark:'禮',description:'다른 사람을 배려하며 자신을 표현해요.',cost:70,gains:{elegance:10,charm:4},fatigue:8,stress:8},
    {id:'athletics',name:'기초 운동',category:'study',mark:'健',description:'몸을 튼튼하게 만들고 균형을 잡아요.',cost:35,gains:{vitality:10,combat:3},fatigue:15,stress:2},
    {id:'nature',name:'자연 관찰',category:'study',mark:'葉',description:'나무와 계절의 변화를 천천히 관찰해요.',cost:25,gains:{sensitivity:9,vitality:3},fatigue:-4,stress:-12},
    {id:'chores',name:'집안일 돕기',category:'work',mark:'家',description:'집안의 작은 일을 맡고 용돈을 받아요.',income:24,gains:{housework:8},fatigue:9,stress:2},
    {id:'farm',name:'농장 일손 돕기',category:'work',mark:'田',description:'밭을 돌보며 성실함과 생활력을 길러요.',income:52,gains:{vitality:4,housework:5},fatigue:20,stress:8},
    {id:'library',name:'도서관 보조',category:'work',mark:'書',description:'서가를 정리하고 사람들에게 책을 찾아줘요.',income:65,gains:{intellect:5,sensitivity:2},fatigue:12,stress:4,minAge:12,requires:{intellect:60}},
    {id:'workshop',name:'공방 견습',category:'work',mark:'工',description:'도구를 다루며 손끝의 솜씨를 익혀요.',income:80,gains:{housework:6,combat:3},fatigue:21,stress:8,minAge:14,requires:{vitality:80}},
    {id:'salon',name:'응접실 보조',category:'work',mark:'茶',description:'손님을 맞으며 대화와 예절에 익숙해져요.',income:90,gains:{charm:6,elegance:3},fatigue:14,stress:12,minAge:14,requires:{elegance:80,charm:80}},
    {id:'rest',name:'집에서 쉬기',category:'rest',mark:'休',description:'서두르지 않는 한 주. 몸과 마음을 돌봐요.',gains:{},fatigue:-42,stress:-24,condition:14},
    {id:'stroll',name:'마을 산책',category:'rest',mark:'路',description:'익숙한 길에서도 새로운 이야기를 만나요.',cost:15,gains:{sensitivity:3,charm:2},fatigue:-15,stress:-28,condition:7},
    {id:'trip',name:'함께 떠나는 소풍',category:'rest',mark:'遊',description:'잠시 일상을 벗어나 함께 추억을 만들어요.',cost:60,gains:{sensitivity:7},fatigue:-30,stress:-44,condition:12,trust:4},
    {id:'explore',name:'숲길 탐험',category:'adventure',mark:'森',description:'낯선 길을 살피며 작은 발견을 모아요.',cost:25,gains:{combat:6,vitality:4,sensitivity:3},fatigue:22,stress:-5,minAge:12,requires:{vitality:50,combat:40}}
  ];
  const additionalGains={reading:{magic:2,morality:1},painting:{dexterity:5},sword:{strength:5,morality:1},etiquette:{manners:9,morality:2},athletics:{strength:8},nature:{faith:2},chores:{cooking:4,morality:3},farm:{strength:5,dexterity:2},library:{morality:3,magic:2},workshop:{dexterity:8,strength:3},salon:{manners:6,cooking:2},stroll:{manners:1},trip:{faith:2},explore:{strength:3,dexterity:3}};
  for(const activity of ACTIVITIES)Object.assign(activity.gains,additionalGains[activity.id]||{});
  for(const character of Object.values(CHARACTERS))for(const [key,source] of Object.entries(INHERIT_STATS))character.stats[key]=Math.round(character.stats[source]*.6);
  ACTIVITIES.push(
    {id:'magic',name:'마법 수업',category:'study',mark:'魔',description:'마력을 느끼고 간단한 주문부터 익힙니다.',cost:65,gains:{magic:11,intellect:3},fatigue:14,stress:6},
    {id:'cooking',name:'요리 수업',category:'study',mark:'食',description:'식재료를 다루고 정성스러운 한 끼를 만듭니다.',cost:40,gains:{cooking:10,dexterity:4,housework:3},fatigue:10,stress:-2},
    {id:'church',name:'성당 봉사',category:'work',mark:'祈',description:'이웃을 돌보며 신앙과 책임감을 기릅니다.',income:24,gains:{faith:8,morality:7,sensitivity:2},fatigue:10,stress:-6}
  );
  const CATEGORIES={study:'교육',work:'아르바이트',rest:'휴식',adventure:'무사수행'};
  const EVENTS=[
    {id:'birthday',title:'생일의 아침',body:'아침 햇살 아래 작은 생일상이 놓였습니다. {name}는 올해 하고 싶은 일이 많다며 웃습니다.',scheduled:true,choices:[{id:'letter',label:'마음을 담은 편지를 건넨다',detail:'친밀도 +10 · 스트레스 -8',trust:10,stress:-8,gold:40,stats:{sensitivity:5}},{id:'gift',label:'취향에 맞는 선물을 준비한다',detail:'30G · 매력 +8 · 친밀도 +14',cost:30,trust:14,stress:-12,stats:{charm:8}}]},
    {id:'growing',title:'조금 더 넓어진 세상',body:'어느새 {name}가 혼자 해 보고 싶은 일을 이야기합니다. 성장의 문턱에서 어떤 응원을 건네면 좋을까요?',scheduled:true,choices:[{id:'support',label:'스스로 선택해 보라고 응원한다',detail:'감수성 +12 · 친밀도 +8',stats:{sensitivity:12},trust:8},{id:'practice',label:'새로운 일을 함께 연습한다',detail:'생활력 +12 · 지력 +6',stats:{housework:12,intellect:6},trust:4}]},
    {id:'comingOfAge',title:'열여덟, 문 앞에서',body:'오랜 시간 함께 지낸 집을 돌아보며 {name}가 말합니다. “앞으로도 제 이야기를 들려드릴게요.” 마지막으로 어떤 말을 전할까요?',scheduled:true,choices:[{id:'believe',label:'네가 고른 길을 믿는다고 말한다',detail:'친밀도 +12 · 스트레스 -15',trust:12,stress:-15},{id:'home',label:'언제든 돌아올 집이 있다고 말한다',detail:'컨디션 +15 · 친밀도 +10',condition:15,trust:10,stress:-10}]},
    {id:'festival',title:'등불이 켜지는 저녁',body:'광장에 작은 축제가 열렸습니다. {name}는 사람들 사이에서 들려오는 음악에 귀를 기울입니다.',month:7,choices:[{id:'join',label:'함께 축제를 즐긴다',detail:'25G · 매력 +10 · 스트레스 -18',cost:25,stats:{charm:10,art:5},stress:-18,trust:5},{id:'watch',label:'언덕에서 등불을 바라본다',detail:'감수성 +8 · 친밀도 +5',stats:{sensitivity:8},trust:5,stress:-8}]},
    {id:'winter',title:'창문에 서리가 내린 날',body:'차가운 바람이 창틀을 스칩니다. 오늘은 집에서 보내는 시간도 특별할 것 같습니다.',month:1,choices:[{id:'soup',label:'따뜻한 수프를 함께 만든다',detail:'생활력 +8 · 컨디션 +10',stats:{housework:8},condition:10,trust:4},{id:'stories',label:'담요 속에서 이야기를 읽는다',detail:'지력 +6 · 감수성 +6',stats:{intellect:6,sensitivity:6},stress:-10}]},
    {id:'lostPurse',title:'길가의 작은 주머니',body:'산책길에서 동전이 든 주머니를 주웠습니다. 조금 떨어진 곳에서 누군가 물건을 찾고 있습니다.',choices:[{id:'return',label:'주인을 찾아 돌려준다',detail:'감수성 +8 · 기품 +5',stats:{sensitivity:8,elegance:5},trust:3},{id:'guard',label:'마을 관리소에 맡긴다',detail:'지력 +5 · 기품 +8',stats:{intellect:5,elegance:8}}]},
    {id:'exhibition',title:'작은 전시회의 초대',body:'마을 화가가 작업실을 열었습니다. 완성된 그림들 옆에는 수많은 습작이 쌓여 있습니다.',choices:[{id:'learn',label:'그림이 만들어진 과정을 묻는다',detail:'예술 +10 · 지력 +4',stats:{art:10,intellect:4}},{id:'sketch',label:'마음에 든 장면을 그려 본다',detail:'10G · 예술 +14',cost:10,stats:{art:14,sensitivity:4},stress:-6}]},
    {id:'friend',title:'친구의 부탁',body:'친구가 가족 일을 도와줄 사람이 필요하다고 합니다. {name}는 어떻게 하면 좋을지 고민합니다.',choices:[{id:'time',label:'시간을 내어 직접 돕는다',detail:'생활력 +8 · 피로 +8',stats:{housework:8,sensitivity:5},fatigue:8,trust:4},{id:'supplies',label:'필요한 물품을 함께 준비한다',detail:'20G · 지력 +6 · 친밀도 +7',cost:20,stats:{intellect:6},trust:7}]},
    {id:'sparrow',title:'처마 밑의 작은 손님',body:'비를 피한 참새 한 마리가 처마에 앉아 있습니다. {name}는 한참 동안 그 모습을 지켜봅니다.',choices:[{id:'shelter',label:'안전하게 쉴 자리를 마련한다',detail:'생활력 +5 · 감수성 +8',stats:{housework:5,sensitivity:8},stress:-8},{id:'observe',label:'멀리서 조용히 관찰한다',detail:'지력 +5 · 예술 +6',stats:{intellect:5,art:6},stress:-6}]},
    {id:'challenge',title:'연습장의 작은 도전',body:'친구가 연습용 표적을 가리키며 함께 실력을 겨뤄 보자고 합니다. 승부보다 중요한 건 어떤 마음일까요?',choices:[{id:'try',label:'끝까지 집중해서 도전한다',detail:'무술 +10 · 체력 +5 · 피로 +8',stats:{combat:10,vitality:5},fatigue:8},{id:'together',label:'서로의 자세를 봐 주며 연습한다',detail:'무술 +6 · 기품 +6',stats:{combat:6,elegance:6},trust:3}]},
    {id:'market',title:'장날의 계산대',body:'단골 가게 주인이 잠깐 자리를 비워야 한다며 도움을 청합니다. 가게 안에는 여러 동네 사람이 모여 있습니다.',choices:[{id:'count',label:'장부와 물건 수를 정리한다',detail:'25G 수입 · 생활력 +6',gold:25,stats:{housework:6,intellect:4},fatigue:6},{id:'welcome',label:'손님을 맞고 이야기를 듣는다',detail:'매력 +8 · 감수성 +5',stats:{charm:8,sensitivity:5},stress:-5}]},
    {id:'rain',title:'계획에 없던 소나기',body:'외출하려던 순간 비가 내립니다. {name}는 창밖을 보다가 새로운 생각이 떠오른 듯 웃습니다.',choices:[{id:'read',label:'책장 속 오래된 책을 꺼낸다',detail:'지력 +8 · 스트레스 -8',stats:{intellect:8},stress:-8},{id:'music',label:'빗소리에 맞춰 노래를 만든다',detail:'예술 +8 · 감수성 +5',stats:{art:8,sensitivity:5},stress:-8}]},
    {id:'invitation',title:'낯선 자리의 초대',body:'이웃이 작은 다과회에 초대했습니다. 처음 보는 사람들이 많아 {name}는 조금 긴장한 눈치입니다.',minAge:12,choices:[{id:'speak',label:'먼저 인사를 건네도록 격려한다',detail:'매력 +10 · 기품 +5',stats:{charm:10,elegance:5},stress:4},{id:'listen',label:'곁에서 이야기를 들어 준다',detail:'감수성 +8 · 친밀도 +6',stats:{sensitivity:8},trust:6,stress:-6}]},
    {id:'map',title:'접힌 지도 한 장',body:'책 사이에서 오래된 숲길 지도를 발견했습니다. 지도에는 마을 가까운 곳에 작은 표시가 남아 있습니다.',minAge:12,choices:[{id:'walk',label:'안전한 길을 골라 찾아가 본다',detail:'체력 +6 · 무술 +6 · 피로 +6',stats:{vitality:6,combat:6},fatigue:6},{id:'study',label:'지도를 읽으며 경로를 연구한다',detail:'지력 +10 · 감수성 +4',stats:{intellect:10,sensitivity:4}}]}
  ];
  const s=(key,min)=>({type:'stat',key,min});
  const v=(key,min)=>({type:'value',key,min});
  const ENDINGS=[
    {id:'knight',title:'왕국의 기사',short:'약한 이의 곁을 지키는 용기',description:'오랜 수련은 믿음직한 실력이 되었습니다. 이제 더 넓은 세상을 지킬 차례입니다.',letter:'검을 드는 법보다, 언제 검을 내려놓아야 하는지 배운 시간이 더 소중해요. 지켜 주신 만큼 저도 누군가의 곁을 지킬게요.',focus:['sword','athletics','etiquette'],requirements:[s('combat',400),s('vitality',220),s('elegance',140)]},
    {id:'scholar',title:'왕립 도서관의 학자',short:'물음표를 따라 발견한 세계',description:'끝없는 호기심이 배움의 길을 열었습니다. 한 권의 책 너머에 새로운 세계가 기다립니다.',letter:'처음에는 답을 잘 맞히고 싶었는데, 이제는 좋은 질문을 하고 싶어요. 함께 책장을 넘기던 저녁을 오래 기억할게요.',focus:['reading','nature','etiquette'],requirements:[s('intellect',400),s('sensitivity',200),s('elegance',120)]},
    {id:'artist',title:'왕국의 예술가',short:'평범한 하루에 빛을 더하는 손',description:'자신만의 시선과 표현이 사람들의 마음에 닿기 시작했습니다.',letter:'제가 그리는 색에는 함께 보낸 날들이 들어 있어요. 이 집의 창문으로 들어오던 빛을, 어디에 있든 그릴 수 있을 것 같아요.',focus:['painting','nature','etiquette'],requirements:[s('art',400),s('sensitivity',240),s('charm',140)]},
    {id:'merchant',title:'새 길을 여는 상인',short:'사람과 사람을 잇는 거래',description:'성실한 손과 정확한 판단으로 자신만의 가게를 열었습니다.',letter:'물건을 잘 고르는 것만큼 사람의 마음을 살피는 것도 중요하더라고요. 첫 손님으로 꼭 와 주세요. 따뜻한 차를 준비해 둘게요.',focus:['chores','reading','farm'],requirements:[s('housework',380),s('intellect',220),v('gold',2000)]},
    {id:'diplomat',title:'궁정의 외교관',short:'다른 마음 사이에 놓인 다리',description:'품위 있는 태도와 따뜻한 대화가 서로 다른 사람들을 연결합니다.',letter:'말을 잘하는 사람보다, 서로를 이해하게 만드는 사람이 되고 싶어요. 제 이야기를 끝까지 들어 주셨던 것처럼요.',focus:['etiquette','stroll','reading'],requirements:[s('elegance',360),s('charm',300),s('intellect',180)]},
    {id:'healer',title:'마을의 돌봄 선생님',short:'작은 변화를 먼저 알아보는 마음',description:'섬세한 관찰과 배움으로 이웃을 돌보는 길을 선택했습니다.',letter:'누군가가 조금 나아지는 순간을 보면 마음이 놓여요. 제가 지칠 때 알아봐 주셨던 마음을 이제 이웃에게 전하려고 해요.',focus:['nature','reading','chores'],requirements:[s('sensitivity',380),s('intellect',230),v('trust',65)]},
    {id:'traveler',title:'세계를 기록하는 여행가',short:'두려움 너머에서 만난 풍경',description:'튼튼한 몸과 호기심으로 길을 나섰습니다. 돌아올 집이 있어 더 멀리 갈 수 있습니다.',letter:'지도에 없는 이야기를 많이 모아 올게요. 먼 길에서도 밥은 잘 챙겨 먹을 테니 걱정 마세요. 다음 계절에는 어떤 풍경을 만나게 될까요?',focus:['athletics','sword','nature'],requirements:[s('vitality',280),s('combat',220),s('sensitivity',220),{type:'counter',key:'explorations',min:16}]},
    {id:'balanced',title:'사랑이 머무는 일상',short:'자신의 속도로 단단해진 삶',description:'여러 경험을 고르게 쌓으며 자신에게 맞는 삶의 속도를 찾았습니다.',letter:'특별한 이름으로 불리지 않아도 괜찮아요. 좋아하는 것을 알고, 쉬어 갈 줄 알고, 함께 웃을 사람이 있으니까요. 제 하루가 마음에 들어요.',focus:['reading','painting','athletics'],requirements:[...LEGACY_STATS.map(key=>s(key,80)),v('trust',80),v('condition',60)]},
    {id:'ownPath',title:'아직 쓰이지 않은 이야기',short:'앞으로의 계절은 나의 손으로',description:'한 가지 이름으로 정리되지 않는 가능성을 안고, 새로운 하루를 시작합니다.',letter:'아직 모르는 것이 많지만, 앞으로 좋아하는 일을 더 찾아보고 싶어요. 제 이야기는 이제부터라고 생각해요. 언제나 응원해 주실 거죠?',focus:[],requirements:[],fallback:true}
  ];
  return {STATS,LEGACY_STATS,INHERIT_STATS,CHARACTERS,ORIGINS,ACTIVITIES,CATEGORIES,EVENTS,ENDINGS};
});
