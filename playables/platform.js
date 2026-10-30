// YouTube-only persistence and lifecycle. Dependencies are injectable for unit tests.
export function createPlatform(sdk,storage=()=>globalThis.localStorage,officialTest=false){
 const hosted=!!sdk&&(!!sdk.IN_PLAYABLES_ENV||officialTest),listeners=new Set();let loaded=false,paused=false,audio=!hosted,values={},dirty=false,revision=0,writing=null,frame=false,ready=false,bound=false,bestPending=0,warningPending=false;
 const emit=(type,value)=>listeners.forEach(fn=>fn(type,value));
 const warn=()=>{if(paused){warningPending=true;return;}if(hosted)try{sdk.health.logWarning();}catch{}};
 function clean(v){const p={};if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid save');for(const k of ['best','clears','bestOriginal','bestExpedition','clarityVersion'])if(Number.isSafeInteger(v[k])&&v[k]>=0)p[k]=v[k];for(const k of ['checkpoint','music','sfx','gentle','light','expedition','focus','aimSlow'])if(typeof v[k]==='boolean')p[k]=v[k];if(!hosted&&['ja','en'].includes(v.lang))p.lang=v.lang;return p;}
 function bind(){if(bound||!hosted)return;bound=true;audio=!!sdk.system.isAudioEnabled();sdk.system.onAudioEnabledChange(v=>{audio=!!v;emit('audio',audio);});sdk.system.onPause(()=>{if(paused)return;paused=true;emit('pause');void flush(true);});sdk.system.onResume(()=>{if(!paused)return;paused=false;if(warningPending){warningPending=false;warn();}emit('resume');if(ready===false&&loaded)emit('active');void flush();void score(bestPending);});}
 async function init(){bind();let raw;if(hosted)raw=await sdk.game.loadData();else try{raw=storage().getItem('kazu-clean-orbit-action-playables-v1');}catch{raw=null;}
  if(raw){const doc=JSON.parse(raw);if(doc.schema!==1)throw Error('Unsupported save');values=clean(doc.prefs);}else values={};loaded=true;
  await whenActive();let language=values.lang||'en';if(hosted){try{language=(await sdk.system.getLanguage()).toLowerCase().startsWith('ja')?'ja':'en';}catch{warn();}}else if(!values.lang)language=globalThis.navigator?.language?.startsWith('ja')?'ja':'en';return {...values,lang:language};
 }
 function save(prefs){if(!loaded)return;values=clean(prefs);dirty=true;revision++;void flush();}
 async function flush(final=false){if(!loaded||paused&&!final)return false;if(writing)return final?writing.then(()=>flush(true)):writing;if(!dirty)return true;writing=(async()=>{let first=true;while(dirty&&(!paused||final&&first)){first=false;const rev=revision,raw=JSON.stringify({schema:1,prefs:values});try{if(hosted)await sdk.game.saveData(raw);else storage().setItem('kazu-clean-orbit-action-playables-v1',raw);}catch{warn();emit('save-error');return false;}if(revision===rev)dirty=false;if(paused)break;}return !dirty;})().finally(()=>writing=null);return writing;}
 async function score(n){if(!Number.isSafeInteger(n)||n<1||n!==values.best)return;bestPending=Math.max(bestPending,n);if(!hosted||paused||!await flush())return;const sending=bestPending;try{await sdk.engagement.sendScore({value:sending});if(bestPending===sending)bestPending=0;}catch{warn();}}
 function whenActive(){if(!paused)return Promise.resolve();return new Promise(resolve=>{const fn=t=>{if(t==='resume'){listeners.delete(fn);resolve();}};listeners.add(fn);});}
 function firstFrame(){if(frame)return;frame=true;sdk?.game?.firstFrameReady?.();}
 function gameReady(){if(!loaded||!frame||paused||ready)return;ready=true;sdk?.game?.gameReady?.();}
 return {hosted,init,save,flush,score,firstFrame,gameReady,whenActive,on:fn=>listeners.add(fn),warn,get paused(){return paused;},get audioEnabled(){return audio;},get loaded(){return loaded;}};
}
