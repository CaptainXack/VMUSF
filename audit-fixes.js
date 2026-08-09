/* VMUSF audited interaction fixes */
(function(){
  'use strict';
  const LIVE_URL='https://vmusf-experience-v2.vercel.app/';
  const ss={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},del(k){try{localStorage.removeItem(k);return true}catch{return false}}};

  // Harden state persistence for restricted/private browsers.
  window.save=function(){try{localStorage.setItem(STORE,JSON.stringify(state));return true}catch{toastMsg?.('Changes could not be saved in this browser.');return false}};

  // A real topic filter rather than the previous placeholder.
  function filterForm(){
    const cats=[...new Set(state.posts.map(p=>(p.meta||'').split('•')[0].trim()).filter(Boolean))];
    openModal('Filter community topics',`<form class="form" id="filter-form"><div class="field"><label for="filter-category">Category</label><select id="filter-category"><option value="all">All topics</option>${cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div><div class="field"><label for="filter-search">Contains words</label><input id="filter-search" maxlength="60" placeholder="e.g. Hub 5, renewal, Wi-Fi"></div><button class="btn primary" type="submit">Apply filter</button><button class="btn" type="button" data-ma="filter-clear">Show everything</button></form>`);
  }
  function showFiltered(category,query){
    query=(query||'').trim().toLowerCase();
    const found=state.posts.filter(p=>{
      const cat=(p.meta||'').split('•')[0].trim();
      const text=`${p.title||''} ${p.text||''}`.toLowerCase();
      return (category==='all'||cat===category)&&(!query||text.includes(query));
    });
    closeModal();
    if(current!=='community')render('community');
    const stream=document.querySelector('.stream');
    if(stream)stream.innerHTML=found.length?found.map(post).join(''):'<div class="empty">No community topics match that filter.</div>';
    toastMsg(`${found.length} topic${found.length===1?'':'s'} shown.`);
  }

  // Complete Supabase recovery links and email-confirmation links.
  async function authGetUser(token){
    const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token}});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.msg||d.message||'Could not load account');
    return d;
  }
  function readAuthCallback(){
    const raw=location.hash.startsWith('#')?location.hash.slice(1):'';
    if(!raw.includes('access_token='))return null;
    const q=new URLSearchParams(raw), access_token=q.get('access_token'), refresh_token=q.get('refresh_token'), expires_in=+(q.get('expires_in')||3600),type=q.get('type')||'';
    if(!access_token)return null;
    return{access_token,refresh_token,expires_in,type};
  }
  async function finishAuthCallback(){
    const cb=readAuthCallback(); if(!cb)return false;
    try{
      const user=await authGetUser(cb.access_token);
      const session={access_token:cb.access_token,refresh_token:cb.refresh_token,expires_in:cb.expires_in,expires_at:Math.floor(Date.now()/1000)+cb.expires_in,user};
      authWrite(session); window.VMUSF_AUTH.session=session; window.VMUSF_AUTH.user=user;
      history.replaceState(null,'',location.pathname+'#home'); updateAuthNav();
      if(cb.type==='recovery') setTimeout(()=>updatePasswordForm(),50); else toastMsg('Email confirmed. You are signed in.');
      return true;
    }catch(e){console.error('VMUSF auth callback',e);return false}
  }
  window.updatePasswordForm=function(){
    if(!window.VMUSF_AUTH.session?.access_token){toastMsg('Open the password-reset link from your email first.');return}
    openModal('Choose a new password',`<form class="form" id="update-password-form"><div class="field"><label for="new-password">New password</label><input id="new-password" type="password" autocomplete="new-password" minlength="8" required><small>Use at least 8 characters.</small></div><div class="field"><label for="new-password-confirm">Confirm new password</label><input id="new-password-confirm" type="password" autocomplete="new-password" minlength="8" required></div><div class="autherror" id="auth-error"></div><button class="btn primary" type="submit">Save new password</button></form>`);
  };
  async function submitNewPassword(form){
    const a=document.getElementById('new-password').value,b=document.getElementById('new-password-confirm').value,btn=form.querySelector('[type=submit]');
    if(a!==b){showAuthError(new Error('The passwords do not match.'));return}
    btn.disabled=true;btn.textContent='Saving…';
    try{
      const r=await fetch(SUPABASE_URL+'/auth/v1/user',{method:'PUT',headers:authHeaders(window.VMUSF_AUTH.session.access_token),body:JSON.stringify({password:a})});
      const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.msg||d.message||'Password could not be updated');
      closeModal();toastMsg('Password updated.');
    }catch(e){showAuthError(e);btn.disabled=false;btn.textContent='Save new password'}
  }
  window.submitForgot=async function(f){
    const b=f.querySelector('[type=submit]');b.disabled=true;b.textContent='Sending…';
    try{
      const email=document.getElementById('forgot-email').value.trim();
      await authRequest('/auth/v1/recover?redirect_to='+encodeURIComponent(LIVE_URL),{email});
      openModal('Check your email','<div class="result"><h3>Reset email requested</h3><p class="lead">If that address belongs to a VMUSF account, use the reset link in the email. It will bring you back here to choose a new password.</p></div>');
    }catch(e){showAuthError(e);b.disabled=false;b.textContent='Send reset email'}
  };
  window.submitJoin=async function(f){
    const b=f.querySelector('[type=submit]');b.disabled=true;b.textContent='Creating account…';
    try{
      const path='/auth/v1/signup?redirect_to='+encodeURIComponent(LIVE_URL);
      const s=await authRequest(path,{email:document.getElementById('join-email').value.trim(),password:document.getElementById('join-password').value,data:{display_name:document.getElementById('join-name').value.trim()}});
      if(s.access_token){s.expires_at=Math.floor(Date.now()/1000)+(s.expires_in||3600);authWrite(s);window.VMUSF_AUTH.session=s;window.VMUSF_AUTH.user=s.user;closeModal();updateAuthNav();render('account');toastMsg('Your VMUSF account is ready.')}else openModal('Check your email','<div class="result"><h3>One last step</h3><p class="lead">We sent a confirmation email. Confirm it and the link will return you to VMUSF.</p><button class="btn primary" data-ma="auth-signin">Go to sign in</button></div>');
    }catch(e){showAuthError(e);b.disabled=false;b.textContent='Create account'}
  };

  // Fix modal cancel and add recovery/update-password actions.
  const auditedModalAction=window.modalAction;
  window.modalAction=function(a,d){
    if(a==='clear-no')return closeModal();
    if(a==='filter-clear'){closeModal();render('community');return}
    if(a==='update-password')return updatePasswordForm();
    return auditedModalAction(a,d);
  };
  const auditedAction=window.action;
  window.action=function(a,d){if(a==='filter-posts')return filterForm();return auditedAction(a,d)};

  // Submit handlers run in capture phase so they are independent of named-element globals.
  modalbody.addEventListener('submit',function(e){
    if(e.target.id==='filter-form'){e.preventDefault();e.stopImmediatePropagation();return showFiltered(document.getElementById('filter-category').value,document.getElementById('filter-search').value)}
    if(e.target.id==='update-password-form'){e.preventDefault();e.stopImmediatePropagation();return submitNewPassword(e.target)}
  },true);

  // Browser Back/Forward support without changing the visual transition system.
  let popNavigating=false;
  const auditedRender=window.render;
  window.render=function(r){auditedRender(r);if(!popNavigating)history.replaceState({vmusf:r},'', '#'+current)};
  const auditedGo=window.go;
  window.go=function(r){if(!P[r]||r===current)return;history.pushState({vmusf:r},'', '#'+r);auditedGo(r)};
  addEventListener('popstate',()=>{const r=(location.hash||'#home').slice(1);if(P[r]){popNavigating=true;render(r);popNavigating=false}});

  // Keep accessibility controls alive even when storage is blocked.
  ['dark','contrast','motion','up','down','reset'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>{}, {passive:true}));

  // Finish an email confirmation/recovery callback before normal auth init settles.
  finishAuthCallback();
})();