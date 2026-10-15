const {test}=require('node:test'),assert=require('node:assert/strict');
const P=require('../src/progression.js');
test('temporary unlocks expose everything without changing score or purchased skills',()=>{
  const d=P.fresh();P.earn(d,99000000);const before=JSON.stringify(d);
  try{
    P.setTestUnlocks(true);
    for(const mode of P.MODES)assert.ok(P.unlocked(d,mode.id));
    for(const skin of P.SKINS)assert.ok(P.skinUnlocked(d,skin.id));
    assert.equal(P.skill(d),P.SKILLS.length);assert.equal(JSON.stringify(d),before);
    const saved=P.sanitize({...d,mode:'blind',skin:'ivy'});
    assert.equal(saved.mode,'blind');assert.equal(saved.skin,'ivy');assert.equal(saved.skill,0);
    P.setTestUnlocks(false);
    assert.equal(P.unlocked(d,'blind'),false);assert.equal(P.skinUnlocked(d,'ivy'),false);assert.equal(P.skill(d),0);
    assert.equal(P.sanitize(saved).mode,'classic');assert.equal(P.sanitize(saved).skin,'8bit');
  }finally{P.setTestUnlocks(false);}
});
