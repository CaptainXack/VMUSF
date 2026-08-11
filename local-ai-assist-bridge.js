(()=>{
 const broadChoice=key=>{
  const k=String(key||'');
  if(/^(broadband_|wifi_|hub_)/.test(k))return 'Broadband or Wi-Fi';
  if(/^tv_/.test(k))return 'TV';
  if(/^(billing_|premium_rate)/.test(k))return 'Bill or price';
  if(/^(complaint_|deadlock_adr|auto_compensation|engineer_)/.test(k))return 'Complaint';
  if(/^(contract_|cancellation_|cooling_off|moving_home|switch_)/.test(k))return 'Contract or leaving';
  return 'Something else';
 };
 let working=false,lastText='';
 async function maybeRoute(){
  if(working)return;
  const ai=window.VMUSF_LOCAL_AI,s=ai?.state?.();
  if(!ai||!s?.installed||!s?.optedIn)return;
  const log=document.getElementById('assist-log');if(!log)return;
  const choices=[...log.querySelectorAll('.assist-choices')].at(-1);if(!choices||choices.dataset.localAiChecked)return;
  const buttons=[...choices.querySelectorAll('[data-assist-answer]')];
  if(!buttons.some(b=>b.dataset.assistAnswer==='Broadband or Wi-Fi'))return;
  const users=[...log.querySelectorAll('.assist-bubble.user')];
  const text=users.at(-1)?.textContent?.trim()||'';
  if(!text||text===lastText)return;
  choices.dataset.localAiChecked='1';working=true;lastText=text;
  const note=document.createElement('small');note.className='assist-ai-note';note.textContent='Local AI is checking what you meant on this device…';choices.before(note);
  try{
   const r=await ai.classify(text);
   if(!r||r.score<0.42){note.textContent='Local AI was not confident enough, so you choose the closest option.';return}
   const wanted=broadChoice(r.scenario_key),btn=buttons.find(b=>b.dataset.assistAnswer===wanted);
   if(!btn){note.textContent='Choose the closest option below.';return}
   note.textContent=`Local AI understood this as ${r.label}.`;
   setTimeout(()=>btn.click(),180);
  }catch(e){console.warn('Local AI Assist bridge',e);note.textContent='Local AI was unavailable, so standard Assist is continuing.'}
  finally{working=false}
 }
 let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(maybeRoute,120)});mo.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('vmusf-local-ai-ready',maybeRoute);
})();