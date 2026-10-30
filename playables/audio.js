// Original music and sound design, synthesized locally after a user gesture.
const tune=[0,4,7,12,11,7,4,7, 9,12,16,14,12,9,7,4, 5,9,12,16,14,12,9,5, 7,11,14,19,16,14,11,7, 12,7,4,7,14,11,7,4, 9,4,0,4,16,12,9,7, 5,0,9,12,17,16,12,9, 7,11,14,16,19,14,11,7];
export class Audio{
 constructor(){this.ctx=null;this.music=true;this.sfx=true;this.active=false;this.hostAllowed=true;this.hostPaused=false;this.next=0;this.step=0;this.lastPickup=0;this.interval=setInterval(()=>this.schedule(),70);}
 unlock(){if(!this.hostAllowed||this.hostPaused)return;try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.6;this.master.connect(this.ctx.destination);this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate*.3,this.ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);}if(this.ctx.state!=='running')this.ctx.resume().catch(()=>{});const source=this.ctx.createBufferSource();source.buffer=this.ctx.createBuffer(1,1,22050);source.connect(this.master);source.start();}catch{}}
 tone(freq,time,duration=.2,volume=.1,type='sine',slide=0){if(!this.ctx||this.ctx.state!=='running')return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);if(slide)o.frequency.exponentialRampToValueAtTime(slide,time+duration);g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(this.master);o.start(time);o.stop(time+duration+.02);}
 noise(time,duration=.12,volume=.08,freq=1800){const s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='lowpass';f.frequency.value=freq;g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+duration);s.connect(f);f.connect(g);g.connect(this.master);s.start(time);s.stop(time+duration);}
 schedule(){const c=this.ctx;if(!c||c.state!=='running'||!this.active||!this.music||!this.hostAllowed||this.hostPaused){this.next=0;return;}if(!this.next||this.next<c.currentTime-.4)this.next=c.currentTime+.04;let guard=0;while(this.next<c.currentTime+.19&&guard++<5){const n=this.step%64,beat=n%8,t=this.next,chord=Math.floor(n/8)%4;this.tone(261.626*2**(tune[n]/12),t,.23,.052,'sine');if(n%2===0)this.tone(130.813*2**([0,9,5,7][chord]/12),t,.28,.075,'triangle');if(beat===0||beat===4)this.tone(125,t,.1,.12,'sine',45);if(beat===2||beat===6)this.noise(t,.065,.026,2300);if(n%2)this.noise(t,.027,.012,7000);if(beat===0)[0,4,7].forEach((v,i)=>this.tone(261.626*2**(([0,9,5,7][chord]+v)/12),t+i*.012,.75,.012,'triangle'));this.step++;this.next+=60/118/2;}}
 setHostState(enabled,paused){this.hostAllowed=enabled;this.hostPaused=paused;if(paused){clearInterval(this.interval);this.interval=null;}else if(!this.interval)this.interval=setInterval(()=>this.schedule(),70);if(this.ctx){this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setValueAtTime(enabled&&!paused?.6:0,this.ctx.currentTime);if(paused)this.ctx.suspend().catch(()=>{});else if(enabled&&this.active)this.ctx.resume().catch(()=>{});}this.next=0;}
 setActive(v){this.active=v;if(!v)this.next=0;}
 fx(kind,n=0){if(!this.hostAllowed||this.hostPaused||!this.sfx||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime;
  if(kind==='collect'){if(t-this.lastPickup<.05)return;this.lastPickup=t;this.tone(523.25*2**([0,4,7,9,12,16][n%6]/12),t,.115,.095);}
  if(kind==='shoot'){this.tone(180,t,.14,.17,'triangle',60);this.noise(t,.12,.08,1400);this.tone(780,t,.1,.05,'sine',220);}
  if(kind==='explosion'||kind==='slam'){this.tone(90,t,.25,.16,'sine',35);this.noise(t,.22,.07,900);}
  if(kind==='destroy'){[0,4,7].forEach((v,i)=>this.tone(392*2**((v+Math.min(12,n))/12),t+i*.035,.18,.07));}
  if(kind==='hurt'){this.tone(210,t,.18,.13,'triangle',90);this.noise(t,.13,.07,1700);}
  if(kind==='dash'){this.noise(t,.13,.055,3600);this.tone(480,t,.12,.05,'sine',960);}
  if(kind==='fieldGoal'||kind==='beacon'||kind==='start'||kind==='heal'){[0,4,7,12].forEach((v,i)=>this.tone(330*2**(v/12),t+i*.08,.35,.09,'triangle'));}
  if(kind==='bossAwake'){[110,146.8,164.8].forEach((v,i)=>this.tone(v,t+i*.2,.65,.11,'triangle'));}
  if(kind==='bossWindup'){this.tone(330,t,.13,.09,'sine');this.tone(392,t+.17,.13,.09,'sine');}
  if(kind==='bossDown'){[0,4,7,12,16,19,24].forEach((v,i)=>this.tone(261.6*2**(v/12),t+i*.12,.75,.12,'triangle'));}
  if(kind==='empty'){this.tone(180,t,.06,.06,'triangle');}
 }
}
