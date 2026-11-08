(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.MakerFestival=data;})(globalThis,function(){
  'use strict';
  const FEE=20;
  const CONTESTS=[
    {id:'art',name:'그림 전시회',mark:'彩',primary:'art',secondary:'sensitivity',practice:'painting',description:'자신만의 시선으로 담은 장면을 나눠요.'},
    {id:'knowledge',name:'지식 발표회',mark:'學',primary:'intellect',secondary:'sensitivity',practice:'reading',description:'궁금했던 것을 찾아보고 자신의 말로 들려줘요.'},
    {id:'martial',name:'무술 시범',mark:'劍',primary:'combat',secondary:'vitality',practice:'sword',description:'익힌 동작을 안전하고 정확하게 펼쳐 보여요.'},
    {id:'craft',name:'생활 솜씨전',mark:'巧',primary:'housework',secondary:'elegance',practice:'chores',description:'생활 속에서 익힌 솜씨와 정성을 선보여요.'}
  ];
  const RANKS=[
    {id:'gold',name:'최우수상',min:85,reward:120,mark:'優'},
    {id:'silver',name:'우수상',min:65,reward:70,mark:'秀'},
    {id:'bronze',name:'장려상',min:45,reward:35,mark:'勵'},
    {id:'participant',name:'참가의 기억',min:0,reward:10,mark:'芽'}
  ];
  const EVENT={id:'harvest',title:'우리 마을의 가을제',scheduled:true,body:'광장에 한 해 동안 갈고닦은 솜씨가 모였습니다. {name}도 또래들과 배운 것을 나눌 수 있습니다. 어느 자리에 서 볼까요? 올해는 한 종목에 참가하거나 관람할 수 있습니다.',choices:[
    ...CONTESTS.map(c=>({id:c.id,label:c.name+'에 참가한다',cost:FEE,stats:{[c.primary]:4,[c.secondary]:2},fatigue:4,stress:2})),
    {id:'watch',label:'오늘은 관람하며 다른 아이들을 응원한다',stats:{sensitivity:3},stress:-10,trust:3}
  ]};
  const QUOTES={
    ciel:{gold:'제가 준비한 것을 이렇게 오래 봐 주실 줄 몰랐어요. 함께 연습한 날들도 자꾸 떠올라요.',silver:'제가 전하고 싶었던 것이 조금은 닿은 것 같아요. 다음에는 더 제답게 표현하고 싶어요.',bronze:'떨렸지만 끝까지 제 이야기를 해 봤어요. 다른 아이들의 방법도 기억해 두고 싶어요.',participant:'앞에 서 보니 연습할 때와는 달랐어요. 무엇을 더 배우고 싶은지 한 가지는 알겠어요.',watch:'같은 주제를 이렇게 다르게 표현할 수 있네요. 돌아가면 오늘 본 것을 적어 두고 싶어요.'},
    valeria:{gold:'상도 기쁘지만 끝까지 해냈다는 게 더 뿌듯해요! 같이 준비해 주셔서 고마워요.',silver:'연습한 만큼 몸과 생각이 따라와 줬어요. 다른 아이들한테 배운 것도 정말 많아요.',bronze:'처음에는 긴장했는데 시작하니 끝까지 해 보고 싶어졌어요. 다음 도전도 기대돼요!',participant:'생각처럼 되지는 않았지만, 다음에 연습할 부분은 찾았어요. 오늘 해 보길 잘했어요.',watch:'응원하는 자리에서도 배울 게 많네요! 다음에는 저도 준비해서 같이 해 보고 싶어요.'}
  };
  return {FEE,CONTESTS,RANKS,EVENT,QUOTES};
});
