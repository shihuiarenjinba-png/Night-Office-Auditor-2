/* Paid-edition screen tabs + subtle synthesized click. */
(()=>{"use strict";
 const tabs=[...document.querySelectorAll("[data-tab]")],screens=[...document.querySelectorAll("[data-screen]")];let current="case",audio=null;
 function sound(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio??=new C();if(audio.state==="suspended")void audio.resume();const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type="triangle";o.frequency.setValueAtTime(330,now);o.frequency.exponentialRampToValueAtTime(500,now+.05);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.05,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.075);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+.08);}catch{}}
 function open(id,{sound:play=false}={}){if(!screens.some(x=>x.dataset.screen===id))return false;current=id;for(const s of screens)s.hidden=s.dataset.screen!==id;for(const t of tabs)t.setAttribute("aria-selected",String(t.dataset.tab===id));if(play)sound();return true;}
 for(const t of tabs)t.addEventListener("click",()=>open(t.dataset.tab,{sound:true}));
 window.OperationTabs=Object.freeze({open,current:()=>current});
 open(current);
})();