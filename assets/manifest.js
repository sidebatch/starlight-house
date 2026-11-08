// 이미지가 준비되면 빈 문자열에 이 파일을 기준으로 한 상대 경로를 넣으세요.
// 예: rooms.artist = 'rooms/artist.png'
// 예: portraits.ciel[10].base = 'characters/ciel/10-base.png'
// 전체 게임을 다른 위치로 옮겨도 함께 이동할 수 있도록 상대 경로를 사용합니다.
(function(root){
  const portraits={ciel:{},valeria:{}};
  for(const id of Object.keys(portraits))for(let age=10;age<=17;age++)portraits[id][age]={base:'',summer:'',winter:'',adventurer:'',church:'',dress:'',gown:''};
  root.MakerMedia={basePath:'assets/',rooms:{artist:'',knight:'',merchant:'',monk:'',noble:'',wanderer:''},painting:'',portraits};
})(globalThis);
