(()=>{
  function isPlainEnter(e){return e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.isComposing}
  document.addEventListener('keydown',e=>{
    const el=e.target;
    if(!isPlainEnter(e)||!el)return;
    if(el.id==='assist-input'){
      e.preventDefault();
      const form=el.closest('form');
      if(!form||!el.value.trim())return;
      if(typeof form.requestSubmit==='function')form.requestSubmit();
      else form.querySelector('[type="submit"]')?.click();
      return;
    }
    if(el.id==='localAiPhrase'){
      e.preventDefault();
      document.getElementById('localAiTry')?.click();
    }
  },true);
})();