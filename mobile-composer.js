(()=>{
  const lastSubmit=new WeakMap();
  const multilinePass=new WeakSet();

  function recent(el){
    const now=Date.now(), last=lastSubmit.get(el)||0;
    if(now-last<450)return true;
    lastSubmit.set(el,now);
    return false;
  }

  function sendAssist(el){
    if(!el||el.id!=='assist-input')return false;
    if(recent(el))return true;
    const form=el.closest('#assist-form');
    if(!form)return false;
    const text=el.value.trim();
    if(!text)return true;
    if(typeof form.requestSubmit==='function') form.requestSubmit();
    else form.querySelector('button[type="submit"]')?.click();
    return true;
  }

  function runLocalAI(el){
    if(!el||el.id!=='localAiPhrase')return false;
    if(recent(el))return true;
    if(!el.value.trim())return true;
    document.getElementById('localAiTry')?.click();
    return true;
  }

  function enhance(root=document){
    const assist=root.querySelector?.('#assist-input');
    if(assist){
      assist.setAttribute('enterkeyhint','send');
      assist.setAttribute('inputmode','text');
      assist.setAttribute('autocomplete','off');
      assist.setAttribute('autocapitalize','sentences');
      assist.setAttribute('aria-keyshortcuts','Enter');
      assist.dataset.mobileComposer='1';
    }
    const local=root.querySelector?.('#localAiPhrase');
    if(local){
      local.setAttribute('enterkeyhint','send');
      local.setAttribute('inputmode','text');
      local.setAttribute('aria-keyshortcuts','Enter');
      local.dataset.mobileComposer='1';
    }
  }

  document.addEventListener('keydown',e=>{
    const el=e.target;
    if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement))return;
    if(e.key!=='Enter')return;
    if(e.isComposing||e.keyCode===229)return;
    if(el.id==='assist-input'&&e.shiftKey){multilinePass.add(el);setTimeout(()=>multilinePass.delete(el),100);return;}
    if(el.id==='assist-input'||el.id==='localAiPhrase'){
      e.preventDefault();e.stopPropagation();
      el.id==='assist-input'?sendAssist(el):runLocalAI(el);
    }
  },true);

  document.addEventListener('beforeinput',e=>{
    const el=e.target;
    if(!(el instanceof HTMLTextAreaElement||el instanceof HTMLInputElement))return;
    if(e.isComposing)return;
    if(e.inputType!=='insertLineBreak'&&e.inputType!=='insertParagraph')return;
    if(multilinePass.has(el)){multilinePass.delete(el);return;}
    if(el.id==='assist-input'||el.id==='localAiPhrase'){
      e.preventDefault();
      el.id==='assist-input'?sendAssist(el):runLocalAI(el);
    }
  },true);

  document.addEventListener('input',e=>{
    const el=e.target;
    if(!(el instanceof HTMLTextAreaElement))return;
    if(el.id!=='assist-input'||multilinePass.has(el)||el.isComposing)return;
    if(/\r?\n$/.test(el.value)){
      el.value=el.value.replace(/\r?\n$/,'');
      sendAssist(el);
    }
  },true);

  document.addEventListener('compositionend',e=>{
    const el=e.target;
    if(!(el instanceof HTMLTextAreaElement)||el.id!=='assist-input')return;
    setTimeout(()=>{
      if(/\r?\n$/.test(el.value)){
        el.value=el.value.replace(/\r?\n$/,'');
        sendAssist(el);
      }
    },0);
  },true);

  const mo=new MutationObserver(m=>{
    for(const x of m){for(const n of x.addedNodes){if(n.nodeType===1)enhance(n)}}
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();