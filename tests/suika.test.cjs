const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game,FRUITS}=require('../src/suika.js');
const Progress=require('../src/progression.js');
test('matching fruit wait for input, then merge once and award points',()=>{
  const g=new Game({seed:1});g.fruits=[{tier:0,x:80,y:390,vx:0,vy:0,age:2000},{tier:0,x:90,y:390,vx:0,vy:0,age:2000}];
  assert.equal(g.acknowledgeClear(),false);
  g.tick(1000/60,false);assert.ok(g.pendingClear);assert.equal(g.fruits.length,2);assert.equal(g.score,0);assert.equal(g.events.length,0);
  const before=JSON.stringify(g.fruits),clock=g.clock;for(let i=0;i<300;i++)g.tick(1000/60);assert.equal(JSON.stringify(g.fruits),before);assert.equal(g.clock,clock);assert.equal(g.drop(100),false);
  assert.equal(g.acknowledgeClear(),true);assert.equal(g.acknowledgeClear(),false);assert.equal(g.fruits.length,1);assert.equal(g.fruits[0].tier,1);assert.equal(g.score,3);assert.equal(g.lines,1);assert.equal(g.events.length,1);
});
test('AI plays, merges fruit, stays finite, and respects basket walls',()=>{
  const g=new Game({seed:42});for(let i=0;i<12000&&!g.over;i++){g.tick(1000/60);if(g.pendingClear)g.acknowledgeClear();}
  assert.ok(g.pieces>10);assert.ok(g.score>0);for(const f of g.fruits){assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.y));assert.ok(f.x>=FRUITS[f.tier][1]+1&&f.x<=199-FRUITS[f.tier][1]);}
});
test('overflow ends run after grace period',()=>{
  const g=new Game();g.fruits=Array.from({length:7},(_,i)=>({tier:10,x:100,y:398-i*125,vx:0,vy:0,age:3000}));
  for(let i=0;i<300&&!g.over;i++)g.tick(1000/60,false);assert.equal(g.over,true);
});
test('Suika selection persists without unlocking other modes',()=>{
  const d=Progress.fresh();d.mode='suika';assert.equal(Progress.sanitize(d).mode,'suika');assert.equal(Progress.unlocked(d,'modern'),false);
});

test('each chain merge needs a fresh input',()=>{
  const g=new Game();g.fruits=[{tier:0,x:80,y:380,vx:0,vy:0,age:2000},{tier:0,x:90,y:380,vx:0,vy:0,age:2000},{tier:1,x:85,y:390,vx:0,vy:0,age:2000}];
  g.tick(1000/60,false);g.acknowledgeClear();assert.equal(g.score,3);
  g.tick(1000/60,false);assert.ok(g.pendingClear);assert.equal(g.score,3);g.acknowledgeClear();assert.equal(g.score,9);assert.equal(g.fruits.length,1);
});
