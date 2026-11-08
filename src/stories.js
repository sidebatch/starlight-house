(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.MakerStories=data;})(globalThis,function(){
  'use strict';
  const EVENTS=[
    {id:'ciel_first_page',character:'ciel',episode:1,minMonth:2,chapter:'눈에 담은 작은 세계',title:'아직 덮여 있는 첫 장',body:'{name}가 작은 연습장을 품에 안고 서 있습니다. 창가의 화분을 그렸지만 누군가에게 보여 주는 건 망설여지는 모양입니다.',choices:[
      {id:'show',label:'한 장만 함께 보자고 제안한다',detail:'예술 +5 · 매력 +4 · 스트레스 +3',stats:{art:5,charm:4},stress:3,reaction:'그럼 이 장만요. 제가 본 빛이 다른 사람에게는 어떻게 보일지 조금 궁금해요.'},
      {id:'keep',label:'지금은 혼자 간직해도 좋다고 말한다',detail:'감수성 +6 · 예술 +3 · 스트레스 -5',stats:{sensitivity:6,art:3},stress:-5,reaction:'다 그리지 않아도 괜찮다고 하셔서 마음이 놓였어요. 내일의 빛도 더 보고 싶어요.'}
    ]},
    {id:'ciel_library_note',character:'ciel',episode:2,minMonth:5,after:'ciel_first_page',chapter:'눈에 담은 작은 세계',title:'책갈피에 남긴 질문',body:'서고지기 윤서가 {name}의 질문을 보고 빈 종이 한 장을 건넵니다. “답을 찾기 전에 네 생각부터 적어 볼래?” 종이 앞에서 손끝이 잠시 멈춥니다.',variants:[{eventId:'ciel_first_page',choiceId:'show',body:'연습장을 함께 펼쳤던 뒤로 {name}는 자신의 생각을 조금씩 들려줍니다. 서고지기 윤서가 이번에는 질문을 종이에 적어 보라고 권했습니다.'},{eventId:'ciel_first_page',choiceId:'keep',body:'혼자 간직한 연습장에는 그림 옆으로 작은 질문들이 늘어났습니다. 서고지기 윤서는 그중 하나를 골라 함께 찾아보자고 합니다.'}],choices:[
      {id:'research',label:'관련된 책을 찾아 질문을 따라간다',detail:'지력 +8 · 감수성 +4',stats:{intellect:8,sensitivity:4},reaction:'한 가지를 알면 또 궁금한 것이 생겨요. 질문을 적어 두길 잘했어요.'},
      {id:'imagine',label:'질문에서 시작하는 짧은 이야기를 쓴다',detail:'예술 +6 · 매력 +4',stats:{art:6,charm:4},reaction:'정답은 아직 모르지만, 제가 생각한 이야기도 누군가에게 들려주고 싶어요.'}
    ]},
    {id:'ciel_worn_notebook',character:'ciel',episode:3,minMonth:9,after:'ciel_library_note',chapter:'눈에 담은 작은 세계',title:'구겨진 연습장',body:'오래 쓴 연습장의 모서리가 닳고 몇 장에는 얼룩이 생겼습니다. {name}는 새 종이와, 지난 흔적이 남은 종이 사이에서 망설입니다.',choices:[
      {id:'new',label:'새 연습장을 마련해 다시 시작한다',detail:'20G · 예술 +10',cost:20,stats:{art:10},reaction:'깨끗한 첫 장이 조금 떨리지만, 예전 그림을 버리지는 않을 거예요.'},
      {id:'repair',label:'남은 종이를 모아 직접 엮는다',detail:'생활력 +6 · 예술 +5',stats:{housework:6,art:5},reaction:'종이마다 다른 자국이 있어요. 여기도 우리 집에서 보낸 시간이 남아 있네요.'}
    ]},
    {id:'ciel_small_exhibition',character:'ciel',episode:4,minMonth:13,after:'ciel_worn_notebook',chapter:'내 그림을 건네는 방법',title:'작은 전시의 자리',body:'마을에서 아이들의 그림과 글을 모아 전시한다고 합니다. {name}는 연습장 한 권을 오래 들여다봅니다. 누구에게, 어떤 모습으로 보여 주고 싶을까요?',variants:[{eventId:'ciel_first_page',choiceId:'show',body:'처음 연습장 한 장을 보여 주던 날을 떠올리며 {name}가 전시 안내문을 내밉니다. 이번에는 집 밖의 사람들에게도 작은 작품을 건넬 기회입니다.'},{eventId:'ciel_first_page',choiceId:'keep',body:'혼자 간직해 온 연습장을 {name}가 식탁 위에 올립니다. 전시에 내는 것도, 소중한 사람에게만 보여 주는 것도 스스로 골라 보고 싶다고 합니다.'}],choices:[
      {id:'public',label:'마을 전시에 작은 작품을 출품한다',detail:'25G · 예술 +12 · 매력 +8',cost:25,stats:{art:12,charm:8},reaction:'여러 사람 앞에 놓으니 낯설어요. 그래도 누군가 한참 보고 가 줘서 기뻤어요.'},
      {id:'home',label:'집에서 가까운 사람들과 나눈다',detail:'감수성 +10 · 친밀도 +6',stats:{sensitivity:10},trust:6,reaction:'그림을 보며 같이 이야기할 시간이 있어서 좋았어요. 이런 전시도 오래 기억할 것 같아요.'}
    ]},
    {id:'ciel_second_voice',character:'ciel',episode:5,minMonth:17,after:'ciel_small_exhibition',chapter:'내 그림을 건네는 방법',title:'서로 다른 감상',body:'같은 작품을 보고도 사람마다 다른 말을 했습니다. 칭찬과 조언을 모두 적어 놓은 {name}가 묻습니다. “다 맞추려고 하면 제 생각이 없어지지 않을까요?”',variants:[{eventId:'ciel_small_exhibition',choiceId:'public',body:'전시에서 받은 감상 쪽지를 다시 읽던 {name}가 고개를 갸웃합니다. 좋아하는 부분도, 고치라는 부분도 제각각입니다. 모든 의견을 따라야 하는 걸까요?'},{eventId:'ciel_small_exhibition',choiceId:'home',body:'집에서 작품을 나눌 때 들은 이야기를 {name}가 하나씩 떠올립니다. 친한 사람끼리도 감상이 다르다는 사실이 신기하면서 조금 어렵습니다.'}],choices:[
      {id:'own',label:'스스로 꼭 지키고 싶은 부분을 고른다',detail:'예술 +10 · 스트레스 +3',stats:{art:10},stress:3,reaction:'이 색만큼은 제가 본 그대로 남기고 싶어요. 왜 그런지도 이제 조금 설명할 수 있어요.'},
      {id:'listen',label:'어떤 마음으로 한 말인지 다시 묻는다',detail:'지력 +7 · 감수성 +7',stats:{intellect:7,sensitivity:7},reaction:'의견을 듣는 것과 그대로 따르는 건 다른 일이네요. 천천히 골라 볼게요.'}
    ]},
    {id:'ciel_yearbook',character:'ciel',episode:6,minMonth:21,after:'ciel_second_voice',chapter:'내 그림을 건네는 방법',title:'두 해를 묶는 끈',body:'이 집에서 보낸 두 번째 겨울이 다가옵니다. {name}는 그림과 글, 작은 쪽지들을 한 묶음으로 정리하고 있습니다. 맨 앞에 어떤 장을 놓으면 좋을까요?',choices:[
      {id:'share',label:'좋아하는 작품을 골라 작은 발표를 준비한다',detail:'30G · 매력 +10 · 예술 +8',cost:30,stats:{charm:10,art:8},reaction:'처음에는 한 장도 보여 주기 어려웠는데, 이제는 이 장의 이야기를 제가 해 보고 싶어요.'},
      {id:'remember',label:'그날의 기억을 짧은 문장으로 남긴다',detail:'감수성 +10 · 지력 +8',stats:{sensitivity:10,intellect:8},reaction:'멋진 날만 있는 건 아니지만, 빈 장으로 남겨 두고 싶은 날은 없어요.'}
    ]},
    {id:'ciel_workshop_invite',character:'ciel',episode:7,minMonth:27,after:'ciel_yearbook',chapter:'세상에 묻는 질문',title:'열두 살의 초대장',body:'마을의 배움터에서 청소년 작품 모임과 자료 조사 모임을 엽니다. {name}는 관심 가는 두 안내문을 나란히 놓았습니다.',choices:[
      {id:'create',label:'작품 모임에서 새로운 표현을 시도한다',detail:'40G · 예술 +16 · 기품 +5',cost:40,stats:{art:16,elegance:5},reaction:'익숙한 방식에서 한 발 벗어나 보려 해요. 서툴러지는 것도 배움이겠지요.'},
      {id:'study',label:'자료 조사 모임에서 궁금증을 깊게 파고든다',detail:'지력 +14 · 감수성 +8',stats:{intellect:14,sensitivity:8},reaction:'오래 붙들고 있던 질문이 다른 사람의 질문과 이어졌어요. 함께 찾으면 더 멀리 볼 수 있네요.'}
    ]},
    {id:'ciel_exchange',character:'ciel',episode:8,minMonth:33,after:'ciel_workshop_invite',chapter:'세상에 묻는 질문',title:'답장이 도착한 날',body:'멀리 사는 또래에게 보낸 질문에 답장이 왔습니다. 같은 나이에도 일상이 무척 다르다는 사실에 {name}가 편지를 여러 번 읽습니다.',choices:[
      {id:'letter',label:'서로의 생각을 묻는 편지를 이어 간다',detail:'지력 +12 · 매력 +8',stats:{intellect:12,charm:8},reaction:'다른 생각을 만나는 일이 꼭 저를 흔드는 건 아니었어요. 제 생각도 더 분명해지는 것 같아요.'},
      {id:'sketch',label:'우리 마을의 하루를 그림으로 전한다',detail:'예술 +14 · 감수성 +8',stats:{art:14,sensitivity:8},reaction:'설명하기 어려웠던 마음을 그림 옆에 조금 적었어요. 이 풍경이 그곳까지 닿으면 좋겠어요.'}
    ]},
    {id:'ciel_fourteen',character:'ciel',episode:9,minMonth:51,after:'ciel_exchange',chapter:'나의 기준을 세우는 시간',title:'완성하지 못한 그림',body:'열네 살이 된 {name}는 작업 하나를 몇 번이나 고칩니다. 잘하고 싶은 마음과 그만 쉬고 싶은 마음을 모두 말해 주었습니다.',choices:[
      {id:'finish',label:'작은 마감일을 정하고 끝까지 완성한다',detail:'예술 +18 · 생활력 +8 · 피로 +8',stats:{art:18,housework:8},fatigue:8,reaction:'고칠 곳이 남아 있어도 한 번 끝내 보니 다음에 할 일이 보여요. 오늘의 완성으로 남겨 둘래요.'},
      {id:'pause',label:'잠시 거리를 두고 다른 경험을 한다',detail:'감수성 +16 · 컨디션 +10 · 스트레스 -12',stats:{sensitivity:16},condition:10,stress:-12,reaction:'하루 떨어져 있었을 뿐인데 다시 보고 싶은 부분이 생겼어요. 멈춘 시간이 헛되지는 않았네요.'}
    ]},
    {id:'ciel_collaboration',character:'ciel',episode:10,minMonth:57,after:'ciel_fourteen',chapter:'나의 기준을 세우는 시간',title:'함께 쓰는 한 장',body:'다른 아이들과 마을 소식지를 만드는 일을 맡았습니다. 각자의 생각을 한 장에 담으려니 역할을 정하는 일부터 쉽지 않습니다.',variants:[{eventId:'ciel_second_voice',choiceId:'own',body:'자신의 기준을 지켜 본 {name}가 이번에는 다른 사람들과 한 장을 만듭니다. “제 생각도 남기고, 다른 사람의 자리도 만들고 싶어요.”'},{eventId:'ciel_second_voice',choiceId:'listen',body:'다른 의견을 묻는 데 익숙해진 {name}가 마을 소식지 모임에 참여했습니다. 이제는 여러 목소리를 듣고 하나의 결과물을 만들어 볼 차례입니다.'}],choices:[
      {id:'lead',label:'지면의 구성과 역할을 정리한다',detail:'기품 +14 · 생활력 +12',stats:{elegance:14,housework:12},reaction:'모두에게 같은 일을 부탁하는 것보다, 각자 잘할 자리를 찾는 게 중요했어요.'},
      {id:'connect',label:'서로의 이야기를 이어 주는 글을 쓴다',detail:'매력 +14 · 지력 +12',stats:{charm:14,intellect:12},reaction:'제 문장이 사람들 사이의 빈칸을 이어 줄 수도 있다는 걸 처음 알았어요.'}
    ]},
    {id:'ciel_sixteen',character:'ciel',episode:11,minMonth:75,after:'ciel_collaboration',chapter:'내가 고르는 다음 장',title:'두 장의 추천서',body:'열여섯 살의 {name}에게 두 통의 추천서가 도착했습니다. 한쪽은 표현의 가능성을, 다른 쪽은 끈기 있는 탐구를 알아봐 주었습니다.',choices:[
      {id:'studio',label:'작업실 견학에 참가해 진로를 살펴본다',detail:'60G · 예술 +22 · 매력 +10',cost:60,stats:{art:22,charm:10},reaction:'그곳의 생활을 보니 기대되는 일도, 감수해야 할 일도 알겠어요. 이제 제 선택을 더 구체적으로 말할 수 있어요.'},
      {id:'archive',label:'자료실 견학에서 배움의 길을 살펴본다',detail:'지력 +20 · 감수성 +12',stats:{intellect:20,sensitivity:12},reaction:'기록 하나를 오래 지키는 일에도 큰 책임이 있네요. 제 질문을 어디에 두고 싶은지 생각해 볼게요.'}
    ]},
    {id:'ciel_next_page',character:'ciel',episode:12,minMonth:81,after:'ciel_sixteen',chapter:'내가 고르는 다음 장',title:'비워 둔 마지막 장',body:'첫 연습장의 마지막 장은 아직 비어 있습니다. {name}는 어린 날의 흔적을 넘기다가 웃습니다. “이 장에는 앞으로의 나를 적어 볼까요?”',choices:[
      {id:'promise',label:'스스로에게 보내는 약속을 적는다',detail:'기품 +16 · 예술 +16 · 친밀도 +5',stats:{elegance:16,art:16},trust:5,reaction:'다른 사람이 알아봐 주기 전에도 제가 소중하게 여길 것을 잊지 않을게요.'},
      {id:'question',label:'계속 묻고 싶은 질문을 적는다',detail:'지력 +16 · 감수성 +18 · 친밀도 +5',stats:{intellect:16,sensitivity:18},trust:5,reaction:'답을 찾는 날도, 못 찾는 날도 제 이야기일 거예요. 다음 장은 제가 천천히 써 볼게요.'}
    ]},
    {id:'valeria_first_route',character:'valeria',episode:1,minMonth:2,chapter:'먼저 걷고 함께 돌아오는 길',title:'마을 밖으로 이어진 선',body:'{name}가 직접 그린 마을 지도를 펼칩니다. 익숙한 골목 너머에 선을 더 그어 놓았습니다. 처음 살펴볼 길을 어떻게 정하면 좋을까요?',choices:[
      {id:'lead',label:'밝은 낮에 익숙한 길부터 앞장서 보게 한다',detail:'체력 +6 · 무술 +4 · 스트레스 +3',stats:{vitality:6,combat:4},stress:3,reaction:'제가 먼저 알아본 길을 같이 걸으니까 더 신나요. 돌아오는 길도 잘 기억해 둘게요!'},
      {id:'notice',label:'지도에 사람과 쉼터부터 표시한다',detail:'감수성 +6 · 지력 +4',stats:{sensitivity:6,intellect:4},reaction:'길 이름만 적는 지도보다 이게 더 도움이 되겠어요. 여기서는 쉴 수 있고, 여기서는 인사할 사람이 있어요.'}
    ]},
    {id:'valeria_partner',character:'valeria',episode:2,minMonth:5,after:'valeria_first_route',chapter:'먼저 걷고 함께 돌아오는 길',title:'리안과의 연습 약속',body:'친구 리안이 {name}에게 함께 몸을 움직이며 연습하자고 합니다. 먼저 도전하고 싶은 마음과 친구의 속도를 살피는 마음이 함께 듭니다.',choices:[
      {id:'challenge',label:'작은 목표를 정해 서로 도전한다',detail:'무술 +9 · 피로 +7',stats:{combat:9},fatigue:7,reaction:'혼자 할 때보다 마지막 한 번을 더 해 봤어요. 리안도 다음에는 지지 않겠대요!'},
      {id:'help',label:'서로의 자세를 봐 주며 연습한다',detail:'기품 +6 · 매력 +5 · 피로 +3',stats:{elegance:6,charm:5},fatigue:3,reaction:'제가 아는 걸 설명하려니 더 정확히 알아야 하네요. 같이 나아지는 것도 꽤 멋진 일이에요.'}
    ]},
    {id:'valeria_strap',character:'valeria',episode:3,minMonth:9,after:'valeria_partner',chapter:'먼저 걷고 함께 돌아오는 길',title:'끊어진 가방끈',body:'자주 메고 다니던 가방끈이 끊어졌습니다. {name}는 당장 새것을 찾으려다가 가방에 달린 작은 흔적들을 만져 봅니다.',choices:[
      {id:'mend',label:'손질하는 방법을 배워 직접 수선한다',detail:'생활력 +7 · 체력 +4',stats:{housework:7,vitality:4},reaction:'매듭이 생각보다 단단해졌어요. 앞으로 길에서 이런 일이 생겨도 조금은 해낼 수 있겠죠?'},
      {id:'craft',label:'장인의 가게에서 구조와 수선법을 배운다',detail:'20G · 지력 +7 · 무술 +5',cost:20,stats:{intellect:7,combat:5},reaction:'힘으로 당기기만 하면 더 끊어질 수 있대요. 어디에 힘이 걸리는지 먼저 보는 게 신기했어요.'}
    ]},
    {id:'valeria_team_walk',character:'valeria',episode:4,minMonth:13,after:'valeria_strap',chapter:'나란히 걷는 연습',title:'함께 걷는 첫 소풍',body:'친구들과 마을 근처로 소풍을 가게 됐습니다. 걷는 속도도, 관심을 두는 풍경도 제각각입니다. {name}는 어느 자리를 맡을까요?',variants:[{eventId:'valeria_first_route',choiceId:'lead',body:'혼자 앞장서 보는 경험을 쌓은 {name}가 이번에는 친구들과 소풍길에 나섭니다. 선두에서 길을 볼지, 뒤에서 일행을 살필지 고를 차례입니다.'},{eventId:'valeria_first_route',choiceId:'notice',body:'쉼터와 사람을 적어 둔 {name}의 지도가 소풍길에서 도움이 됩니다. 지도를 챙긴 {name}가 친구들 사이에서 자신의 역할을 생각합니다.'}],choices:[
      {id:'front',label:'앞에서 표지와 갈림길을 확인한다',detail:'무술 +12 · 체력 +6 · 피로 +6',stats:{combat:12,vitality:6},fatigue:6,reaction:'제가 먼저 가는 만큼 뒤도 자주 돌아봐야 하네요. 모두 함께 도착하니 더 뿌듯했어요.'},
      {id:'back',label:'뒤에서 일행의 속도와 짐을 살핀다',detail:'감수성 +10 · 매력 +7 · 스트레스 -4',stats:{sensitivity:10,charm:7},stress:-4,reaction:'제일 앞이 아니어도 도움이 될 수 있었어요. 누가 힘들어하는지 보이는 자리도 필요하네요.'}
    ]},
    {id:'valeria_quiet_day',character:'valeria',episode:5,minMonth:17,after:'valeria_team_walk',chapter:'나란히 걷는 연습',title:'아무 데도 가지 않는 날',body:'쉬는 날인데도 {name}는 무엇인가 더 해야 할 것 같다고 말합니다. 바삐 움직이는 것과 힘을 모으는 것 사이에서 하루를 골라 봅니다.',choices:[
      {id:'small',label:'짧은 연습 하나만 정하고 마친다',detail:'체력 +8 · 무술 +6 · 피로 +8',stats:{vitality:8,combat:6},fatigue:8,reaction:'오늘은 딱 여기까지만요. 멈출 때를 스스로 정하는 것도 연습해 볼게요.'},
      {id:'rest',label:'지도를 정리하며 몸을 충분히 쉬게 한다',detail:'감수성 +7 · 컨디션 +12 · 피로 -18',stats:{sensitivity:7},condition:12,fatigue:-18,reaction:'가만히 있어도 다음 길을 생각할 수 있네요. 쉬고 나니 오히려 다시 걷고 싶어졌어요.'}
    ]},
    {id:'valeria_shared_map',character:'valeria',episode:6,minMonth:21,after:'valeria_quiet_day',chapter:'나란히 걷는 연습',title:'지도에 더해진 이름들',body:'두 해 가까이 쓴 지도에는 갈림길뿐 아니라 만난 사람의 이름도 늘었습니다. {name}는 지도를 새로 베끼며 무엇을 더 남길지 고민합니다.',variants:[{eventId:'valeria_team_walk',choiceId:'front',body:'친구들과 걸은 길을 정리하던 {name}가 선두에서 놓쳤던 풍경도 있었다고 말합니다. 다음 지도에는 어떤 정보를 더하면 좋을까요?'},{eventId:'valeria_team_walk',choiceId:'back',body:'일행을 살피며 걸은 뒤로 {name}의 지도에는 쉬어 간 자리와 친구들의 이름이 늘었습니다. 이번에는 그 지도를 다른 사람에게도 건네고 싶다고 합니다.'}],choices:[
      {id:'routes',label:'길의 특징과 주의할 점을 꼼꼼히 적는다',detail:'무술 +10 · 지력 +6',stats:{combat:10,intellect:6},reaction:'제가 헤맨 곳을 다음 사람은 덜 헤맬 수 있겠어요. 걷고 난 뒤에 할 일도 많네요.'},
      {id:'people',label:'함께 걸은 사람과 기억을 남긴다',detail:'매력 +10 · 감수성 +8',stats:{charm:10,sensitivity:8},reaction:'이 길은 누구와 걸었는지도 함께 떠올라요. 나중에 다시 만나면 꼭 이 지도를 보여 줄래요.'}
    ]},
    {id:'valeria_permit',character:'valeria',episode:7,minMonth:27,after:'valeria_shared_map',chapter:'준비해서 나서는 길',title:'열두 살의 길 안내',body:'안내인과 함께 숲길을 배우는 모임이 열립니다. {name}는 실제 길을 살펴보는 일과 출발 준비를 익히는 일 모두에 관심이 있습니다.',choices:[
      {id:'trail',label:'안내인과 현장에서 길을 살피는 법을 배운다',detail:'35G · 무술 +14 · 체력 +8 · 피로 +8',cost:35,stats:{combat:14,vitality:8},fatigue:8,reaction:'아는 길이라고 서두르면 안 되네요. 날씨와 발밑을 확인하는 습관부터 익힐게요.'},
      {id:'prepare',label:'지도와 준비물을 검토하는 역할을 맡는다',detail:'지력 +14 · 생활력 +8',stats:{intellect:14,housework:8},reaction:'출발하기 전에 할 수 있는 일이 이렇게 많았군요. 준비를 잘하면 모두가 덜 고생하겠어요.'}
    ]},
    {id:'valeria_new_member',character:'valeria',episode:8,minMonth:33,after:'valeria_permit',chapter:'준비해서 나서는 길',title:'처음 온 친구의 속도',body:'새로 모임에 들어온 아이가 다른 사람보다 자주 멈춥니다. {name}는 예전의 자신과 지금 맡은 역할을 함께 떠올립니다.',choices:[
      {id:'practice',label:'작은 목표부터 함께 연습한다',detail:'무술 +12 · 기품 +6',stats:{combat:12,elegance:6},reaction:'잘하라는 말보다 같이 한 번 해 보는 게 도움이 됐어요. 가르치면서 저도 기본을 다시 봤어요.'},
      {id:'listen',label:'어려운 점을 듣고 계획을 조정한다',detail:'감수성 +14 · 매력 +8',stats:{sensitivity:14,charm:8},reaction:'겁이 나서 느린 줄 알았는데 신발이 불편했대요. 먼저 물어보길 잘했어요.'}
    ]},
    {id:'valeria_guard_invite',character:'valeria',episode:9,minMonth:51,after:'valeria_new_member',chapter:'믿고 맡길 수 있는 사람',title:'연습장 밖의 일',body:'열네 살의 {name}가 마을 순찰대의 공개 연습을 돕게 됐습니다. 몸을 쓰는 일과 물품을 준비하는 일 중 어느 쪽을 더 배워 볼까요?',choices:[
      {id:'training',label:'연습에 참가해 기본기를 점검한다',detail:'45G · 무술 +18 · 체력 +8',cost:45,stats:{combat:18,vitality:8},reaction:'빠르게 움직이는 것보다 정확히 움직이는 게 어렵네요. 믿고 맡길 수 있는 사람이 되고 싶어요.'},
      {id:'supplies',label:'물품과 기록을 정리하는 일을 돕는다',detail:'생활력 +16 · 지력 +10',stats:{housework:16,intellect:10},reaction:'필요한 것이 제때 있어야 연습도 이어지네요. 눈에 덜 띄는 일의 무게를 조금 알겠어요.'}
    ]},
    {id:'valeria_rain_plan',character:'valeria',episode:10,minMonth:57,after:'valeria_guard_invite',chapter:'믿고 맡길 수 있는 사람',title:'비 때문에 바뀐 계획',body:'기다리던 야외 일정이 비로 미뤄졌습니다. {name}는 아쉬워하면서도 다른 방법으로 하루를 쓸 수 있겠다고 말합니다.',variants:[{eventId:'valeria_quiet_day',choiceId:'rest',body:'쉬면서 지도를 정리했던 날을 떠올린 {name}가 빗속의 길을 바라봅니다. 이번에도 멈춤을 다음 출발의 준비로 삼아 보려 합니다.'},{eventId:'valeria_quiet_day',choiceId:'small',body:'작은 목표를 정해 마치는 연습을 해 온 {name}가 비로 바뀐 계획을 다시 적습니다. 오늘 할 수 있는 것부터 골라 보려 합니다.'}],choices:[
      {id:'reschedule',label:'충분히 쉬고 다음 일정을 정비한다',detail:'체력 +10 · 컨디션 +8 · 스트레스 -12',stats:{vitality:10},condition:8,stress:-12,reaction:'길을 미루는 게 뒤처지는 일은 아니네요. 다음에 더 좋은 상태로 나갈 수 있겠어요.'},
      {id:'indoor',label:'실내에서 동작과 경로를 복습한다',detail:'무술 +16 · 지력 +8 · 피로 +5',stats:{combat:16,intellect:8},fatigue:5,reaction:'몸으로 익힌 것을 말로 설명해 보니 빠진 부분이 보여요. 다른 방식으로도 배울 수 있네요.'}
    ]},
    {id:'valeria_sixteen',character:'valeria',episode:11,minMonth:75,after:'valeria_rain_plan',chapter:'내가 함께하고 싶은 길',title:'서로 다른 두 제안',body:'열여섯 살의 {name}에게 연습 모임과 상단에서 각각 견학 제안을 보냈습니다. 어떤 현장에서 자신의 다음 모습을 찾아볼까요?',choices:[
      {id:'guard',label:'연습 모임에서 책임을 맡는 사람들을 만난다',detail:'60G · 무술 +22 · 기품 +10',cost:60,stats:{combat:22,elegance:10},reaction:'강한 사람이라는 말보다 믿을 수 있는 사람이라는 말이 더 오래 남아요. 저도 그런 사람이 되고 싶어요.'},
      {id:'caravan',label:'상단에서 길과 사람을 연결하는 일을 배운다',detail:'생활력 +18 · 매력 +12',stats:{housework:18,charm:12},reaction:'먼 곳을 잇는 데에는 준비와 약속이 필요하네요. 제가 좋아하는 길의 모습이 조금 넓어졌어요.'}
    ]},
    {id:'valeria_next_map',character:'valeria',episode:12,minMonth:81,after:'valeria_sixteen',chapter:'내가 함께하고 싶은 길',title:'다음 지도의 여백',body:'첫 지도에는 없던 먼 지명이 이제는 낯설지 않습니다. {name}는 빈 여백에 다음에 걷고 싶은 길을 표시하려고 합니다.',choices:[
      {id:'discover',label:'새로운 풍경을 만날 길을 남긴다',detail:'체력 +18 · 감수성 +16 · 친밀도 +5',stats:{vitality:18,sensitivity:16},trust:5,reaction:'먼저 가 보고 싶은 마음은 여전해요. 이제는 잘 돌아와 이야기를 들려주는 것까지 제 계획이에요.'},
      {id:'together',label:'다른 사람이 시작할 수 있는 길을 남긴다',detail:'기품 +15 · 매력 +16 · 친밀도 +5',stats:{elegance:15,charm:16},trust:5,reaction:'제 지도를 보고 누군가 첫걸음을 뗄 수 있으면 좋겠어요. 그때는 제가 옆에서 함께 걸어 줄래요.'}
    ]}
  ];
  const VOICES={
    ciel:{young:['창가의 빛이 어제랑 조금 달라요. 오늘은 어떤 색일까요?','궁금한 걸 적어 두면 언젠가 다시 찾아볼 수 있겠죠?'],older:['완성하는 일과 오래 바라보는 일, 둘 다 제게 필요한 것 같아요.','제가 좋아하는 이유를 제 말로 설명해 보고 싶어요.'],tired:'하고 싶은 건 있지만 지금은 머릿속이 조금 흐려요. 잠깐 쉬어도 될까요?',stressed:'잘해야 한다는 생각이 너무 커졌어요. 천천히 이야기하고 싶어요.',study:['몰랐던 부분이 조금 보였어요. 집에 가서 제 말로 정리해 볼래요.','설명 속에 숨어 있던 질문을 하나 적어 왔어요.'],work:['작은 일도 순서를 생각하고 하면 덜 서두르게 되네요.','누군가에게 도움이 된 걸 확인하니 기분이 좋았어요.'],rest:['서두르지 않으니 놓쳤던 소리가 들려요.','쉬는 동안 떠오른 생각을 작은 쪽지에 남겨 뒀어요.'],adventure:['같은 길도 자세히 보면 처음 보는 것이 있어요.','눈에 담아 온 풍경을 잊기 전에 적어 두고 싶어요.'],favorite:{reading:'책 속의 질문이 오늘 본 풍경과 이어졌어요.',painting:'이 색만큼은 오늘 제가 본 그대로 남기고 싶었어요.'}},
    valeria:{young:['오늘은 어제보다 조금 더 멀리 걸어 보고 싶어요!','같이 해 볼 일이 있으면 저도 불러 주세요.'],older:['먼저 나서는 만큼 뒤를 돌아보는 것도 잊지 않으려고요.','빠르게 가는 일보다 함께 도착하는 일이 더 오래 기억나요.'],tired:'마음은 앞서 가는데 다리가 무거워요. 힘을 좀 모아야겠어요.',stressed:'뭐든 잘해 보고 싶어서 자꾸 서두르게 돼요. 잠깐 숨을 고를래요.',study:['안 되던 동작을 한 번 더 해 봤어요. 어디가 어려운지 조금 알겠어요.','직접 해 보고 나니 설명이 다르게 들려요.'],work:['맡은 일을 끝내니까 든든해요. 다음에는 더 능숙하게 해 볼게요.','빨리하는 것보다 잘 마무리하는 게 중요하네요.'],rest:['쉬고 나면 다시 나설 힘이 생겨요. 오늘은 이 속도도 좋아요.','아무 데도 안 가도 같이 이야기할 건 많네요.'],adventure:['갈림길과 돌아오는 길을 잘 확인했어요. 다음에 들려드릴 이야기도 생겼고요!','앞서가다가 뒤도 돌아봤어요. 무사히 돌아오니 더 뿌듯해요.'],favorite:{athletics:'지난번보다 자세가 안정됐어요. 몸이 조금씩 따라와 줘요!',sword:'힘을 빼야 정확해진다는 말을 오늘은 조금 알 것 같아요.'}}
  };
  return {EVENTS,VOICES};
});
