const {test}=require('node:test'),assert=require('node:assert/strict');
const P=require('../src/progression.js'),AI=require('../src/ai.js'),Training=require('../src/training.js');
test('NES starts unlocked; Modern and Grandmaster unlock at lifetime thresholds',()=>{
  const d=P.fresh();assert.equal(d.mode,'classic');assert.equal(d.skin,'8bit');assert.ok(P.unlocked(d,'classic'));
  P.earn(d,999999999);assert.equal(P.unlocked(d,'modern'),false);P.earn(d,1);assert.ok(P.unlocked(d,'modern'));assert.ok(P.buy(d));assert.ok(P.unlocked(d,'modern'));
  P.earn(d,8999999999);assert.equal(P.unlocked(d,'blind'),false);P.earn(d,1);assert.ok(P.unlocked(d,'blind'));
});
test('saved modes enforce unlocks while preserving previous progress and learned weights',()=>{
  const old={...P.fresh(),mode:'modern',lifetime:12345,wallet:3000,skill:2,weights:{...P.DEFAULT_WEIGHTS,holes:-12}};delete old.classicWeights;
  const d=P.sanitize(old);assert.equal(d.mode,'classic');assert.equal(d.lifetime,12345);assert.equal(d.skill,2);assert.equal(d.weights.holes,-12);assert.equal(d.classicWeights.holes,P.DEFAULT_WEIGHTS.holes);
  assert.equal(P.sanitize({...old,lifetime:1000000000}).mode,'modern');assert.equal(P.sanitize({...old,mode:'blind',lifetime:9999999999}).mode,'classic');assert.equal(P.sanitize({...old,mode:'blind',lifetime:10000000000}).mode,'blind');
});
test('new skins unlock at their milestones and survive saving',()=>{for(const id of ['handheld','terminal','sunset','candy','mosaic','crystal','circuit','starlight','meadow','woodland','ivy']){const skin=P.SKINS.find(s=>s.id===id);assert.notEqual(P.sanitize({...P.fresh(),skin:id,lifetime:skin.at-1}).skin,id);assert.equal(P.sanitize({...P.fresh(),skin:id,lifetime:skin.at}).skin,id);}});
test('practice can explore zero-valued weights and stays within bounds',()=>{assert.notEqual(Training.mutate({holes:0},()=>.9).holes,0);assert.equal(Training.mutate({holes:30},()=>1).holes,30);});
test('practice uses mode-specific, disjoint sequences and rejects survival regression',()=>{
  const calls=[],weights={...P.DEFAULT_WEIGHTS};
  const benchmark=(w,skill,seeds,limit,mode)=>{calls.push({seeds:[...seeds],limit,mode});const n=calls.length;return n<=7?{fitness:n,pieces:70,lines:20}:n===8?{fitness:100,pieces:150,lines:50}:{fitness:101,pieces:149,lines:51};};
  const result=Training.train({weights,skill:1,seed:123,mode:'classic'},()=>{},benchmark);
  assert.equal(result.result.accepted,false);assert.deepEqual(result.weights,weights);assert.ok(calls.every(c=>c.mode==='classic'));assert.equal(new Set([...calls[0].seeds,...calls[7].seeds]).size,5);assert.deepEqual(calls[7].seeds,calls[8].seeds);
});
test('practice accepts a validation gain without line or survival regression',()=>{
  let n=0;const benchmark=()=>{n++;return n<=7?{fitness:n,pieces:70,lines:20}:n===8?{fitness:100,pieces:150,lines:50}:{fitness:101,pieces:150,lines:51};};
  const result=Training.train({weights:P.DEFAULT_WEIGHTS,skill:1,seed:123,mode:'modern'},()=>{},benchmark);assert.ok(result.result.accepted);assert.notDeepEqual(result.weights,P.DEFAULT_WEIGHTS);
});
test('classic practice advances entry phases and benchmarks multiple legal pieces',()=>{const a=AI.benchmark(P.DEFAULT_WEIGHTS,0,[113],12,'classic'),b=AI.benchmark(P.DEFAULT_WEIGHTS,0,[113],12,'classic');assert.equal(a.pieces,12);assert.deepEqual(a,b);});

test('every earned unlock and skill requires at least 100 million points',()=>{for(const reward of [...P.MODES,...P.SKINS].filter(r=>r.at>0))assert.ok(reward.at>=100000000);for(const skill of P.SKILLS)assert.ok(skill.cost>=100000000);const d=P.fresh();P.earn(d,99000000);assert.equal(P.buy(d),false);assert.equal(P.level(d),1);P.earn(d,1000000);assert.ok(P.buy(d));assert.equal(d.wallet,0);});
