(function(root){
  'use strict';
  const MODES=[{id:'doctor',name:'Dr. Mario',at:0},{id:'puyo',name:'Puyo Puyo',at:0},{id:'fighter',name:'Puzzle Fighter',at:0},{id:'suika',name:'Suika Game',at:0},{id:'classic',name:'NES Classic',at:0},{id:'modern',name:'Modern',at:1000000000},{id:'blind',name:'Blind Grandmaster',at:10000000000}];
  const SKINS=[{id:'classic',name:'Classic',at:0},{id:'8bit',name:'8-bit',at:0},{id:'handheld',name:'Handheld',at:100000000},{id:'neon',name:'Neon',at:200000000},{id:'frost',name:'Frost',at:600000000},{id:'terminal',name:'Terminal',at:1000000000},{id:'ember',name:'Ember',at:1500000000},{id:'arcade',name:'Arcade',at:3000000000},{id:'sunset',name:'Sunset',at:4000000000},{id:'cosmic',name:'Cosmic',at:6000000000},{id:'grandmaster',name:'Grandmaster',at:10000000000},{id:'candy',name:'Candy Glass',at:150000000,detail:'Glossy pastel candy tiles.'},{id:'mosaic',name:'Mosaic',at:400000000,detail:'Four tiny ceramic tiles in every block.'},{id:'crystal',name:'Crystal',at:900000000,detail:'Cut gemstones with luminous facets.'},{id:'circuit',name:'Circuit',at:2000000000,detail:'Neon traces on dark microchips.'},{id:'starlight',name:'Starlight',at:8000000000,detail:'Tiny stars framed in cosmic light.'},{id:'meadow',name:'Wildflower Meadow',at:250000000,detail:'Cream daisies, soft petals and sage greens.'},{id:'woodland',name:'Woodland',at:750000000,detail:'Pine trees, moss and warm timber.'},{id:'ivy',name:'Ivy Garden',at:1250000000,detail:'Climbing vines and tiny leafy blocks.'}].sort((a,b)=>a.at-b.at);
  const SKILLS=[{name:'Fundamentals',cost:100000000,detail:'Practice safer stacking and fewer holes.'},{name:'Look ahead',cost:300000000,detail:'Evaluate the next piece and hold options.'},{name:'Back-to-back',cost:800000000,detail:'Plan four-line clears and preserve chains.'},{name:'T-spin specialist',cost:1500000000,detail:'Build T slots and seek legal spin clears.'},{name:'Perfect clear',cost:2500000000,detail:'Search three pieces ahead for empty boards.'},{name:'Rotation master',cost:4000000000,detail:'Prioritize T-spin triples and deeper kick setups.'}];
  const DEFAULT_WEIGHTS={height:-.5,holes:-8,bump:-.35,lines:3,wells:-.15};
  let testUnlocks=false;
  function setTestUnlocks(enabled){testUnlocks=enabled===true;}
  function skinUnlocked(d,id){return SKINS.some(s=>s.id===id&&(testUnlocks||d.lifetime>=s.at));}
  function skill(d){return testUnlocks?SKILLS.length:d.skill;}
  function unlocked(d,mode){return MODES.some(m=>m.id===mode&&(testUnlocks||d.lifetime>=m.at));}
  function nextMode(d){const modes=MODES.filter(m=>unlocked(d,m.id));const index=modes.findIndex(m=>m.id===d.mode);return modes[(index+1)%modes.length]?.id||'classic';}
  function fresh(){return {version:1,lifetime:0,wallet:0,skill:0,skin:'8bit',mode:'classic',classicStartLevel:0,speed:1,scale:1,pin:true,position:null,runs:0,best:0,weights:{...DEFAULT_WEIGHTS},classicWeights:{...DEFAULT_WEIGHTS},training:null,stats:{pieces:0,tetrises:0,spins:0,perfects:0}};}
  function sanitize(input){const d=fresh();if(!input||input.version!==1)return d;for(const k of ['lifetime','wallet','runs','best'])if(Number.isSafeInteger(input[k])&&input[k]>=0)d[k]=input[k];d.wallet=Math.min(d.wallet,d.lifetime);d.skill=Number.isInteger(input.skill)?Math.max(0,Math.min(6,input.skill)):0;
    d.skin=skinUnlocked(d,input.skin)?input.skin:'8bit';d.mode=unlocked(d,input.mode)?input.mode:'classic';
    if(Number.isInteger(input.classicStartLevel))d.classicStartLevel=Math.max(0,Math.min(19,input.classicStartLevel));
    if([.5,1,2,4].includes(input.speed))d.speed=input.speed;if(Number.isFinite(input.scale))d.scale=Math.max(.5,Math.min(3,input.scale));d.pin=input.pin!==false;
    if(input.position&&Number.isFinite(input.position.x)&&Number.isFinite(input.position.y))d.position={x:Math.round(input.position.x),y:Math.round(input.position.y)};
    for(const k of Object.keys(d.weights))if(Number.isFinite(input.weights?.[k])&&Math.abs(input.weights[k])<=30)d.weights[k]=input.weights[k];
    for(const k of Object.keys(d.classicWeights))if(Number.isFinite(input.classicWeights?.[k])&&Math.abs(input.classicWeights[k])<=30)d.classicWeights[k]=input.classicWeights[k];
    for(const k of Object.keys(d.stats))if(Number.isSafeInteger(input.stats?.[k])&&input.stats[k]>=0)d.stats[k]=input.stats[k];
    if(input.training&&Number.isFinite(input.training.before)&&Number.isFinite(input.training.after))d.training={before:input.training.before,after:input.training.after,accepted:!!input.training.accepted,mode:input.training.mode==='classic'?'classic':'modern',date:String(input.training.date||'').slice(0,40)};return d;}
  function earn(d,points){if(!Number.isSafeInteger(points)||points<=0)return;d.lifetime+=points;d.wallet+=points;}
  function buy(d){const s=SKILLS[d.skill];if(!s||d.wallet<s.cost)return false;d.wallet-=s.cost;d.skill++;return true;}
  function level(d){return SKINS.filter(s=>s.id!=='8bit'&&d.lifetime>=s.at).length;}
  const api={nextMode,MODES,SKINS,SKILLS,DEFAULT_WEIGHTS,fresh,sanitize,earn,buy,level,unlocked,skinUnlocked,skill,setTestUnlocks};if(typeof module!=='undefined')module.exports=api;else root.Progress=api;
})(typeof self!=='undefined'?self:globalThis);
