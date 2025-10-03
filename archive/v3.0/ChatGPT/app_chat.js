/* PWA + App State */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const K = 'daily-domains';
const load = () => JSON.parse(localStorage.getItem(K) || '{}');
const save = d => localStorage.setItem(K, JSON.stringify(d));
const state = Object.assign({
  sleep:{rest:'23:00',wake:'07:00'},
  fitness:{km:5,strength:false,skill:false},
  mind:{read:false,write:false},
  spirit:{quad:3,med:false}
}, load());

/* Helpers */
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const hm2h=t=>{if(!t) return 0; let [h,m]=t.split(':').map(Number); return h+m/60;}
const sleptHours=(rest,wake)=>{let a=hm2h(rest),b=hm2h(wake); let d=b-a; return d<0?d+24:d;}
const setToday=()=>{$('#today').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}

/* Scoring (simple, tweakable) */
function scoreSleep(s){
  let h=sleptHours(s.rest,s.wake); // target 8h → 100, -/+ each hour costs 12.5
  return clamp(Math.round(100 - Math.abs(8-h)*12.5),0,100);
}
function scoreFitness(f){
  let run = clamp(f.km,0,20); // 0..20km → 0..60
  let base = Math.round((run/20)*60);
  return clamp(base + (f.strength?20:0) + (f.skill?20:0),0,100);
}
function scoreMind(m){ return (m.read?50:0)+(m.write?50:0) }
function scoreSpirit(s){
  const map=[20,40,60,80]; // LL, LH, HL, HH
  return clamp(map[s.quad||0] + (s.med?20:0),0,100);
}
function computeScores(){
  return {
    sleep:scoreSleep(state.sleep),
    fitness:scoreFitness(state.fitness),
    mind:scoreMind(state.mind),
    spirit:scoreSpirit(state.spirit)
  };
}
function overall(sc){return Math.round((sc.sleep+sc.fitness+sc.mind+sc.spirit)/4)}

/* Render */
function render(){
  const sc=computeScores();
  $('#score-sleep').textContent=sc.sleep;
  $('#score-fitness').textContent=sc.fitness;
  $('#score-mind').textContent=sc.mind;
  $('#score-spirit').textContent=sc.spirit;
  $('#card-sleep').textContent=sc.sleep;
  $('#card-fitness').textContent=sc.fitness;
  $('#card-mind').textContent=sc.mind;
  $('#card-spirit').textContent=sc.spirit;
}

/* Overlay controls */
function openOv(d){
  const el = $('#ov-'+d);
  el.setAttribute('aria-hidden','false');
  el.addEventListener('click',e=>{ if(e.target===el) closeOv(d)},{once:true});
  document.body.style.overflow='hidden';
}
function closeOv(d){
  $('#ov-'+d).setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
$$('.score, .card').forEach(b=>b.addEventListener('click',()=>openOv(b.dataset.domain)));
$$('[data-close]').forEach(b=>b.addEventListener('click',e=>{
  const id=e.target.closest('.overlay').id.replace('ov-',''); closeOv(id);
}));

/* Bind inputs → state (auto-save + live scores) */
// Sleep
const rest=$('#sleep-rest'), wake=$('#sleep-wake');
rest.value=state.sleep.rest; wake.value=state.sleep.wake;
rest.addEventListener('change',()=>{state.sleep.rest=rest.value;save(state);render()});
wake.addEventListener('change',()=>{state.sleep.wake=wake.value;save(state);render()});

// Fitness
const km=$('#run-km'), srt=$('#fit-strength'), skl=$('#fit-skill');
km.value=state.fitness.km; srt.checked=state.fitness.strength; skl.checked=state.fitness.skill;
$('#run-minus').onclick=()=>{km.value=+km.value-1; km.dispatchEvent(new Event('change'))};
$('#run-plus').onclick=()=>{km.value=+km.value+1; km.dispatchEvent(new Event('change'))};
$$('.chip').forEach(c=>c.addEventListener('click',()=>{km.value=c.dataset.km; km.dispatchEvent(new Event('change'))}));
km.addEventListener('change',()=>{state.fitness.km=+km.value;save(state);render()});
srt.addEventListener('change',()=>{state.fitness.strength=srt.checked;save(state);render()});
skl.addEventListener('change',()=>{state.fitness.skill=skl.checked;save(state);render()});

// Mind
const mRead=$('#mind-read'), mWrite=$('#mind-write');
mRead.checked=state.mind.read; mWrite.checked=state.mind.write;
mRead.addEventListener('change',()=>{state.mind.read=mRead.checked;save(state);render()});
mWrite.addEventListener('change',()=>{state.mind.write=mWrite.checked;save(state);render()});

// Spirit
const quad=$('#spirit-quad'), med=$('#spirit-med');
[...quad.children].forEach((b,i)=>{ if(i===state.spirit.quad) b.classList.add('active');
  b.addEventListener('click',()=>{ [...quad.children].forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); state.spirit.quad=i; save(state); render(); });
});
med.checked=state.spirit.med;
med.addEventListener('change',()=>{state.spirit.med=med.checked;save(state);render()});

/* Init */
setToday(); render();
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') setToday(); });
