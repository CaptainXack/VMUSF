(() => {
  const LS='vmusf-sound-prefs-v1';
  const defaults={enabled:true,volume:0.34,notifications:true,success:true,moderation:true,ui:true};
  let prefs={...defaults};
  try{prefs={...defaults,...JSON.parse(localStorage.getItem(LS)||'{}')}}catch{}
  let ctx=null,unlocked=false,lastPlayed=0;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function save(){try{localStorage.setItem(LS,JSON.stringify(prefs))}catch{}}
  function audio(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();return ctx}
  async function unlock(){if(unlocked)return;try{const c=audio();if(c.state==='suspended')await c.resume();unlocked=true}catch{}}
  ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,unlock,{once:true,capture:true}));
  function tone(freq,start,dur,gain,type='sine',endFreq=null){if(!prefs.enabled||!unlocked)return;const c=audio(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+start);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,c.currentTime+start+dur);g.gain.setValueAtTime(0.0001,c.currentTime+start);g.gain.exponentialRampToValueAtTime(Math.max(0.0001,gain*prefs.volume),c.currentTime+start+0.015);g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+start+dur);o.connect(g).connect(c.destination);o.start(c.currentTime+start);o.stop(c.currentTime+start+dur+0.03)}
  function play(name,{force=false}={}){const now=Date.now();if(!force&&now-lastPlayed<120)return;lastPlayed=now;if(!prefs.enabled)return;
    if(name==='notify'){if(!prefs.notifications)return;tone(659,0,.12,.18,'sine');tone(880,.11,.18,.16,'sine');}
    else if(name==='reply'){if(!prefs.notifications)return;tone(523,0,.10,.16,'triangle');tone(659,.08,.12,.15,'triangle');tone(784,.17,.16,.14,'triangle');}
    else if(name==='solved'){if(!prefs.success)return;tone(523,0,.12,.18,'sine');tone(659,.10,.14,.18,'sine');tone(988,.21,.24,.20,'sine');}
    else if(name==='worked'){if(!prefs.success)return;tone(740,0,.08,.13,'triangle');tone(932,.07,.13,.12,'triangle');}
    else if(name==='saved'){if(!prefs.success)return;tone(587,0,.08,.13,'sine');tone(784,.07,.14,.13,'sine');}
    else if(name==='moderation'){if(!prefs.moderation)return;tone(220,0,.10,.14,'square');tone(330,.13,.14,.12,'square');}
    else if(name==='warning'){if(!prefs.moderation)return;tone(440,0,.09,.12,'sawtooth',330);tone(330,.13,.14,.12,'sawtooth',247);}
    else if(name==='open'){if(!prefs.ui)return;tone(700,0,.05,.08,'sine',840);}
    else if(name==='close'){if(!prefs.ui)return;tone(600,0,.05,.07,'sine',480);}
  }
  function settings(){
    const existing=document.getElementById('vmusf-sound-settings');if(existing)return;
    const panel=document.getElementById('access');if(!panel)return;
    const wrap=document.createElement('div');wrap.id='vmusf-sound-settings';
    wrap.innerHTML=`<div class="arow"><span>VMUSF sounds</span><button id="vmu-sound-toggle">${prefs.enabled?'On':'Off'}</button></div><div class="arow"><span>Sound volume</span><input id="vmu-sound-volume" type="range" min="0" max="100" step="5" value="${Math.round(prefs.volume*100)}" aria-label="Sound volume"></div><div class="arow"><span>Notification sounds</span><button id="vmu-notify-toggle">${prefs.notifications?'On':'Off'}</button></div><div class="arow"><span>Success sounds</span><button id="vmu-success-toggle">${prefs.success?'On':'Off'}</button></div><div class="arow"><span>Moderation sounds</span><button id="vmu-mod-toggle">${prefs.moderation?'On':'Off'}</button></div><div class="arow"><span>Preview</span><button id="vmu-sound-preview">Play</button></div>`;
    panel.appendChild(wrap);
    const flip=(key,id)=>document.getElementById(id)?.addEventListener('click',async e=>{await unlock();prefs[key]=!prefs[key];save();e.currentTarget.textContent=prefs[key]?'On':'Off';play(key==='notifications'?'notify':key==='moderation'?'moderation':'saved',{force:true})});
    flip('enabled','vmu-sound-toggle');flip('notifications','vmu-notify-toggle');flip('success','vmu-success-toggle');flip('moderation','vmu-mod-toggle');
    document.getElementById('vmu-sound-volume')?.addEventListener('input',e=>{prefs.volume=clamp(Number(e.target.value)/100,0,1);save()});
    document.getElementById('vmu-sound-preview')?.addEventListener('click',async()=>{await unlock();play('solved',{force:true})});
  }
  const observer=new MutationObserver(settings);observer.observe(document.documentElement,{childList:true,subtree:true});settings();
  let knownUnread=null;
  async function pollNotifications(){if(!window.VMUSF_AUTH?.user?.id||!window.SUPABASE_URL||!window.SUPABASE_KEY)return;try{const uid=window.VMUSF_AUTH.user.id,token=window.VMUSF_AUTH.session?.access_token||'';const r=await fetch(`${SUPABASE_URL}/rest/v1/vmusf_notifications?select=id,kind&user_id=eq.${encodeURIComponent(uid)}&read_at=is.null&order=created_at.desc&limit=20`,{headers:{apikey:SUPABASE_KEY,...(token?{Authorization:'Bearer '+token}:{})}});if(!r.ok)return;const rows=await r.json();const n=rows.length;if(knownUnread!==null&&n>knownUnread){const kind=rows[0]?.kind;play(kind==='solution'?'solved':kind==='confirmation'?'worked':kind==='reply'?'reply':'notify');}knownUnread=n}catch{}}
  setInterval(()=>{if(document.visibilityState==='visible')pollNotifications()},12000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pollNotifications()});
  const oldToast=window.toastMsg; if(typeof oldToast==='function'){window.toastMsg=function(msg){const s=String(msg||'').toLowerCase();if(/solved|solution marked/.test(s))play('solved');else if(/saved|updated|posted|added|synced|bookmarked/.test(s))play('saved');else if(/report|moderation/.test(s))play('moderation');return oldToast.apply(this,arguments)}}
  window.VMUSF_SOUNDS={play,prefs,save,unlock};
})();