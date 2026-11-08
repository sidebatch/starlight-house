(function(){
  'use strict';
  const GAME_URL='https://sidebatch.github.io/starlight-house/';
  let promptEvent=null,registration=null,updateRequested=false,offlineReady=!!navigator.serviceWorker?.controller,registrationFailed=false,reloading=false;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notice=document.createElement('aside');notice.id='pwa-notice';notice.className='pwa-notice';notice.hidden=true;notice.setAttribute('aria-label','게임 설치와 업데이트');document.body.append(notice);
  const dialog=document.createElement('dialog');dialog.id='pwa-dialog';dialog.className='pwa-dialog';dialog.setAttribute('aria-labelledby','pwa-title');document.body.append(dialog);
  const installedMedia=window.matchMedia('(display-mode: standalone)');
  function markInstalled(){document.documentElement.classList.toggle('game-installed',standalone())}
  markInstalled();installedMedia.addEventListener?.('change',markInstalled);
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event});
  window.addEventListener('appinstalled',()=>{promptEvent=null;document.documentElement.classList.add('game-installed');if(dialog.open)dialog.close()});
  function renderNotice(){
    let body='';
    if(registration?.waiting)body='<p>새로운 게임 버전이 준비됐어요.</p><button class="button primary small-button" data-pwa-action="update">저장하고 업데이트</button>';
    else if(!navigator.onLine)body=`<p>${offlineReady?'인터넷 연결 없이 플레이 중이에요. 기록은 이 기기에 저장됩니다.':'처음 실행할 때는 인터넷 연결이 필요해요. 연결되면 게임을 다시 열어 주세요.'}</p>`;
    else if(registrationFailed)body='<p>오프라인 준비를 마치지 못했어요. 지금은 인터넷에 연결해 플레이할 수 있습니다.</p><button class="button small-button" data-pwa-action="retry">다시 준비</button>';
    notice.innerHTML=body;notice.hidden=!body;document.documentElement.classList.toggle('pwa-notice-visible',!!body);
  }
  function showGuide(message=''){
    const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const embedded=/KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\/|; wv\)/i.test(navigator.userAgent);
    const local=location.protocol==='file:',url=location.protocol==='https:'?new URL('./',document.querySelector('link[rel="manifest"]').href).href:GAME_URL;
    let steps;
    if(local)steps='<li>아래의 게임 접속 주소를 휴대폰 브라우저에서 엽니다.</li><li>게임이 열린 뒤 설치 버튼을 누릅니다.</li>';
    else if(embedded)steps='<li>지금 앱의 메뉴에서 <strong>브라우저에서 열기</strong>를 선택합니다.</li><li>Chrome·Samsung Internet 또는 Safari에서 이 게임 주소를 엽니다.</li><li>게임의 설치 버튼이나 브라우저 메뉴의 <strong>홈 화면에 추가</strong>를 선택합니다.</li>';
    else if(ios)steps='<li>Safari의 <strong>공유</strong> 버튼을 누릅니다.</li><li><strong>홈 화면에 추가</strong>를 선택하고 추가합니다.</li><li>홈 화면에 생긴 별 모양 아이콘으로 게임을 엽니다.</li>';
    else steps='<li>브라우저 메뉴에서 <strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택합니다.</li><li>게임 이름을 확인하고 설치합니다.</li><li>홈 화면의 별 모양 아이콘으로 게임을 엽니다.</li>';
    if(dialog.open)dialog.close();
    dialog.innerHTML=`<div class="modal-heading"><div><h2 id="pwa-title">홈 화면에서 만나요</h2><p>별이 자라는 집을 앱처럼 열 수 있어요.</p></div><button class="close-button" data-pwa-action="close" aria-label="설치 안내 닫기">×</button></div>${message?`<p class="pwa-help-message">${escape(message)}</p>`:''}${standalone()?'<p class="pwa-help-message">지금 홈 화면 앱으로 실행하고 있어요.</p>':`<ol class="pwa-install-steps">${steps}</ol>`}<label class="pwa-url-label" for="pwa-game-url">게임 접속 주소</label><input id="pwa-game-url" class="text-input pwa-url" readonly value="${escape(url)}"><div class="pwa-guide-actions"><button class="button small-button" data-pwa-action="copy">주소 복사</button>${promptEvent?'<button class="button primary small-button" data-pwa-action="native-install">설치 창 열기</button>':''}</div><p id="pwa-copy-status" class="pwa-copy-status" role="status"></p><div class="pwa-save-help"><h3>다른 기기에서 이어 하려면</h3><p>기존 게임의 <strong>저장함 → 파일로 내보내기</strong>로 이야기를 보관한 뒤, 이 주소의 저장함에서 가져오세요. 기기와 접속 주소별로 기록을 보관합니다.</p><p>${offlineReady?'오프라인 플레이 준비가 완료됐어요.':'처음에는 인터넷에 연결해 게임을 한 번 끝까지 불러와 주세요.'}</p></div>`;
    dialog.showModal();
  }
  async function install(){
    if(!promptEvent){showGuide();return}
    const event=promptEvent;promptEvent=null;
    try{await event.prompt();const choice=await event.userChoice;if(choice.outcome!=='accepted')showGuide('설치는 나중에 다시 선택할 수 있어요.')}catch{showGuide()}
  }
  function requestUpdate(){
    if(!registration?.waiting)return;
    const detail={saved:true};window.dispatchEvent(new CustomEvent('starlight:before-update',{detail}));
    if(!detail.saved){showGuide('현재 기록을 자동저장하지 못했어요. 저장함에서 파일로 보관한 뒤 업데이트해 주세요.');return}
    updateRequested=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
  }
  async function register(){
    if(!('serviceWorker'in navigator)||!window.isSecureContext||!/^https?:$/.test(location.protocol))return;
    registrationFailed=false;
    try{
      registration=await navigator.serviceWorker.register(new URL('../sw.js',document.currentScript?.src||new URL('src/pwa.js',document.baseURI)),{updateViaCache:'none'});
      renderNotice();
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed')renderNotice();
          if(worker.state==='redundant'&&!registration.active){registrationFailed=true;renderNotice()}
        });
      });
      navigator.serviceWorker.ready.then(()=>{offlineReady=true;renderNotice()});
    }catch{registrationFailed=true;renderNotice()}
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    offlineReady=true;
    if(updateRequested&&!reloading){reloading=true;location.reload()}else renderNotice();
  });
  window.addEventListener('online',()=>{renderNotice();if(registrationFailed)register()});
  window.addEventListener('offline',renderNotice);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine)registration?.update().catch(()=>{})});
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-pwa-action]');if(!button||button.disabled)return;
    const action=button.dataset.pwaAction;
    if(action==='install'||action==='native-install'){await install();return}
    if(action==='close'){dialog.close();return}
    if(action==='update'){requestUpdate();return}
    if(action==='retry'){await register();return}
    if(action==='copy'){
      const field=document.getElementById('pwa-game-url'),status=document.getElementById('pwa-copy-status');
      try{await navigator.clipboard.writeText(field.value);status.textContent='게임 주소를 복사했어요.'}catch{field.focus();field.select();status.textContent='주소를 길게 누르거나 복사 메뉴로 복사해 주세요.'}
    }
  });
  renderNotice();register();
})();
