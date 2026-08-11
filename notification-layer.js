(() => {
  const uid=()=>window.VMUSF_AUTH?.user?.id||'';
  const token=()=>window.VMUSF_AUTH?.session?.access_token||'';
  const hx=()=>({apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token()?{Authorization:'Bearer '+token()}:{})});
  async function q(path,{method='GET',body}={}){const r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{method,headers:hx(),body:body===undefined?undefined:JSON.stringify(body)});const t=await r.text();let d=null;if(t)try{d=JSON.parse(t)}catch{d=t}if(!r.ok)throw new Error(d?.message||d?.details||'Request failed');return d}
  const ex=s=>esc(String(s??''));
  let lastSeenId='';
  let checking=false;

  function ensureBell(){
    if(document.getElementById('vmusf-bell'))return document.getElementById('vmusf-bell');
    const nav=document.querySelector('.top .nav');
    const acc=document.getElementById('accbtn');
    if(!nav||!acc)return null;
    const b=document.createElement('button');
    b.id='vmusf-bell';
    b.className='vmusf-bell';
    b.type='button';
    b.setAttribute('aria-label','Notifications');
    b.innerHTML='<span aria-hidden="true">🔔</span><span class="vmusf-bell-count" hidden></span>';
    b.onclick=e=>{e.preventDefault();viewer()};
    nav.insertBefore(b,acc);
    return b;
  }

  function paintCount(n){
    const b=ensureBell(); if(!b)return;
    const c=b.querySelector('.vmusf-bell-count');
    if(!c)return;
    c.hidden=!n;
    c.textContent=n>99?'99+':String(n||'');
    b.classList.toggle('has-unread',!!n);
    b.setAttribute('aria-label',n?`Notifications, ${n} unread`:'Notifications');
  }

  async function namesFor(ids){
    ids=[...new Set(ids.filter(Boolean))]; if(!ids.length)return{};
    const ps=await q('vmusf_profiles?select=user_id,display_name,username&user_id=in.('+ids.map(encodeURIComponent).join(',')+')');
    const names={}; (ps||[]).forEach(x=>names[x.user_id]=x.display_name||x.username||'A member'); return names;
  }

  const wording=n=>n.kind==='reply'?'replied to your topic':n.kind==='solution'?'had their reply chosen as your solution':n.kind==='confirmation'?'said your topic worked for them':n.kind==='moderation'?'sent you a moderation notice':'sent you an update';

  async function checkUnread(showToast=false){
    if(!uid()||checking)return;
    checking=true;
    try{
      const rows=await q('vmusf_notifications?select=id,actor_id,kind,topic_id,reply_id,created_at&user_id=eq.'+encodeURIComponent(uid())+'&read_at=is.null&order=created_at.desc&limit=20');
      paintCount((rows||[]).length);
      const newest=rows?.[0];
      if(showToast&&newest&&newest.id!==lastSeenId){
        const names=await namesFor([newest.actor_id]);
        toastMsg(`${names[newest.actor_id]||'A member'} ${wording(newest)}.`);
      }
      if(newest)lastSeenId=newest.id;
    }catch(e){console.warn('Notification check',e)}finally{checking=false}
  }

  async function viewer(){if(!uid())return;try{
    const rows=await q('vmusf_notifications?select=id,actor_id,kind,topic_id,reply_id,read_at,created_at&user_id=eq.'+encodeURIComponent(uid())+'&order=created_at.desc&limit=60');
    const names=await namesFor((rows||[]).map(x=>x.actor_id));
    const list=(rows||[]).map(n=>`<button class="choice" data-vn-id="${ex(n.id)}" data-vn-topic="${ex(n.topic_id||'')}"><b>${n.kind==='moderation'?'VMUSF moderation':ex(names[n.actor_id]||'A member')} ${wording(n)}</b><small>${new Date(n.created_at).toLocaleString('en-GB')}${n.read_at?'':' • New'}</small></button>`).join('')||'<div class="empty">No notifications yet.</div>';
    openModal('Notifications',`<div class="form">${list}<div class="actions"><button class="btn" id="vn-all">Mark all read</button></div></div>`);
    document.getElementById('vn-all')?.addEventListener('click',async()=>{await q('vmusf_notifications?user_id=eq.'+encodeURIComponent(uid())+'&read_at=is.null',{method:'PATCH',body:{read_at:new Date().toISOString()}});paintCount(0);closeModal();toastMsg('Notifications marked read.')});
    modalbody.querySelectorAll('[data-vn-id]').forEach(b=>b.onclick=async()=>{await q('vmusf_notifications?id=eq.'+encodeURIComponent(b.dataset.vnId),{method:'PATCH',body:{read_at:new Date().toISOString()}}).catch(()=>{});await checkUnread(false);if(b.dataset.vnTopic){closeModal();go('community');setTimeout(()=>document.querySelector(`[data-topic="${CSS.escape(b.dataset.vnTopic)}"]`)?.click(),350)}})
  }catch(e){openModal('Notifications',`<div class="notice warn">${ex(e.message)}</div>`)}}

  const oldAction=action; action=function(a,d){if(a==='notifications')return viewer();return oldAction(a,d)};
  function boot(){ensureBell();checkUnread(false)}
  window.addEventListener('vmusf-auth-changed',()=>setTimeout(boot,150));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkUnread(true)});
  setTimeout(boot,500);
  setInterval(()=>{if(document.visibilityState==='visible')checkUnread(true)},30000);
})();