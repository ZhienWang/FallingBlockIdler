const {test}=require('node:test'),assert=require('node:assert/strict');
const Progress=require('../src/progression.js'),Suika=require('../src/suika.js');
test('rotation follows selector order, skips locks, and wraps',()=>{
  const d=Progress.fresh();for(const [mode,next]of [['doctor','puyo'],['puyo','fighter'],['fighter','suika'],['suika','classic'],['classic','doctor']]){d.mode=mode;assert.equal(Progress.nextMode(d),next);}
  d.mode='classic';Progress.earn(d,1000000000);assert.equal(Progress.nextMode(d),'modern');d.mode='modern';assert.equal(Progress.nextMode(d),'doctor');Progress.earn(d,9000000000);assert.equal(Progress.nextMode(d),'blind');d.mode='blind';assert.equal(Progress.nextMode(d),'doctor');
});
test('temporary unlocks participate in rotation',()=>{try{Progress.setTestUnlocks(true);const d=Progress.fresh();assert.equal(Progress.nextMode(d),'modern');d.mode='modern';assert.equal(Progress.nextMode(d),'blind');}finally{Progress.setTestUnlocks(false);}});
test('Suika waits for input before winning with a watermelon',()=>{
  const g=new Suika.Game();g.fruits=[{tier:9,x:75,y:340,vx:0,vy:0,age:2000},{tier:9,x:125,y:340,vx:0,vy:0,age:2000}];g.tick(16,false);assert.ok(g.pendingClear);assert.equal(g.over,false);g.acknowledgeClear();assert.equal(g.won,true);assert.equal(g.over,true);assert.equal(g.fruits[0].tier,10);
});
