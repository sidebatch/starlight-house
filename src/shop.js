(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.MakerShop=data;})(globalThis,function(){
  'use strict';
  const CATEGORIES={recovery:'간식과 회복품',tool:'배움을 돕는 도구',gift:'마음을 전하는 선물'};
  const LIMITS={recovery:2,gift:1,stack:5,toolBonus:2};
  const ITEMS=[
    {id:'herbalTea',name:'향긋한 허브차',category:'recovery',mark:'茶',price:20,description:'따뜻한 잔을 사이에 두고 잠시 숨을 골라요.',effects:{stress:-14,fatigue:-4}},
    {id:'warmSoup',name:'따뜻한 수프',category:'recovery',mark:'湯',price:28,description:'천천히 한 그릇을 비우며 몸을 돌봐요.',effects:{condition:12,fatigue:-8}},
    {id:'honeyBread',name:'작은 꿀빵',category:'recovery',mark:'蜜',price:18,description:'출출한 오후, 달콤한 빵을 나눠 먹어요.',effects:{fatigue:-14,stress:-5}},
    {id:'referenceBook',name:'곁에 두는 참고서',category:'tool',mark:'書',price:120,description:'궁금한 내용을 다시 찾아보고 배운 것을 정리해요.',activities:['reading','library'],bonus:{stat:'intellect',amount:1}},
    {id:'paintBox',name:'작은 수채화 상자',category:'tool',mark:'彩',price:140,description:'자주 쓰는 색을 손에 익히며 표현을 다듬어요.',activities:['painting'],bonus:{stat:'art',amount:1}},
    {id:'practiceBlade',name:'연습용 목검',category:'tool',mark:'劍',price:135,description:'손에 익은 도구로 기본 동작을 차분히 반복해요.',activities:['sword','athletics'],bonus:{stat:'combat',amount:1}},
    {id:'sewingKit',name:'바느질 꾸러미',category:'tool',mark:'巧',price:110,description:'바늘과 실, 작은 도구를 정리해 솜씨를 길러요.',activities:['chores','workshop'],bonus:{stat:'housework',amount:1}},
    {id:'pressedFlowers',name:'압화 책갈피',category:'gift',mark:'花',price:32,description:'작은 꽃과 잎을 눌러 만든, 책 사이에 놓는 선물이에요.',effects:{trust:5,stress:-5},favorite:'ciel'},
    {id:'trailCharm',name:'작은 여행 부적',category:'gift',mark:'結',price:32,description:'건강히 다녀오라는 마음을 담은 작은 매듭이에요.',effects:{trust:5,stress:-5},favorite:'valeria'}
  ];
  const QUOTES={
    ciel:{herbalTea:'차 향을 맡고 있으니 서두르던 생각이 조금 가라앉아요.',warmSoup:'따뜻한 것을 먹으니 몸이 풀려요. 오늘은 천천히 지내고 싶어요.',honeyBread:'부스러기까지 달콤하네요. 조금 쉬었다가 하던 것을 이어 볼래요.',pressedFlowers:'책을 펼칠 때마다 이 꽃을 만나겠네요. 제가 좋아할 것을 생각해 주셔서 기뻐요.',trailCharm:'작은 매듭 안에 잘 다녀오라는 마음이 들어 있네요. 소중히 간직할게요.'},
    valeria:{herbalTea:'향이 좋아요! 급하게 움직이던 마음도 잠깐 쉬어 가는 것 같아요.',warmSoup:'속이 따뜻해지니까 기운이 돌아와요. 잘 먹고 쉬는 것도 준비겠지요?',honeyBread:'이런 간식이 있으면 잠깐 쉬는 시간도 기다려져요. 같이 먹으니 더 맛있어요!',pressedFlowers:'꽃이 이렇게 책 속에 오래 남을 수도 있네요. 다음에 본 풍경도 끼워 두고 싶어요.',trailCharm:'제 가방에 꼭 달아 둘래요! 어디를 가든 잘 돌아오라는 마음을 기억할게요.'}
  };
  return {CATEGORIES,LIMITS,ITEMS,QUOTES};
});
