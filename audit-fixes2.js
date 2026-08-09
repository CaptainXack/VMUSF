/* VMUSF second-pass interaction hardening */
(function(){
  'use strict';
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};

  // Prevent rapid double navigation from adding phantom history entries.
  const previousGo=window.go;
  window.go=function(r){if(typeof moving!=='undefined'&&moving)return;if(r===current)return;return previousGo(r)};

  // Accessibility controls must still work when browser storage is unavailable.
  const darkBtn=document.getElementById('dark'),contrastBtn=document.getElementById('contrast'),motionBtn=document.getElementById('motion');
  if(darkBtn)darkBtn.onclick=()=>{const on=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=on?'dark':'light';darkBtn.textContent=on?'On':'Off';safeSet('vmusf-theme',on?'dark':'light')};
  if(contrastBtn)contrastBtn.onclick=()=>{const on=document.documentElement.dataset.contrast!=='high';document.documentElement.dataset.contrast=on?'high':'normal';contrastBtn.textContent=on?'On':'Off';safeSet('vmusf-contrast',on?'high':'normal')};
  if(motionBtn)motionBtn.onclick=()=>{const on=document.documentElement.dataset.motion!=='reduced';document.documentElement.dataset.motion=on?'reduced':'full';motionBtn.textContent=on?'On':'Off';safeSet('vmusf-motion',on?'reduced':'full')};
  function applyText(value){const n=Math.max(90,Math.min(140,value));document.documentElement.style.setProperty('--fs',n/100);safeSet('vmusf-text',String(n));return n}
  let textSize=Number((()=>{try{return localStorage.getItem('vmusf-text')}catch{return null}})()||100);
  const down=document.getElementById('down'),reset=document.getElementById('reset'),up=document.getElementById('up');
  if(down)down.onclick=()=>{textSize=applyText(textSize-10)};
  if(reset)reset.onclick=()=>{textSize=applyText(100)};
  if(up)up.onclick=()=>{textSize=applyText(textSize+10)};

  // Make deal controls match their labels.
  const previousAction=window.action;
  window.action=function(a,d){
    if(a==='deal-detail'&&d?.deal==='Example public alternative')return compareForm();
    if(a==='deal-detail'&&d?.deal==='Community-reported retention')return openModal('Community-reported retention offer',`<div class="result"><h3>Treat this as a lead, not a guaranteed price</h3><p class="lead">Community-reported retention prices can vary by account, package and date. Check what services are included and compare the total contract cost before deciding.</p><button class="btn primary" data-ma="open-community">See community discussions</button></div>`);
    return previousAction(a,d);
  };
  const previousModalAction=window.modalAction;
  window.modalAction=function(a,d){if(a==='open-community'){closeModal();return go('community')}return previousModalAction(a,d)};
})();