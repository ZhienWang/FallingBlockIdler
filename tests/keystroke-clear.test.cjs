const {test}=require('node:test'),assert=require('node:assert/strict');
const T=require('../src/engine.js');
for(const mode of ['modern','classic'])test(`${mode}: line points are immediate; rows persist until a keystroke acknowledgment`,()=>{
  const g=new T.Game({mode,seed:1,waitForKey:true});
  g.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');
  g.active=mode==='classic'?{...T.spawnPiece('I',mode),y:19}:{...T.spawnPiece('I',mode),x:3,y:18};
  g.lock();const score=g.score,board=JSON.stringify(g.board),pieces=g.pieces;
  assert.ok(score>0);assert.equal(g.lines,1);assert.ok(g.board[19].every(Boolean));assert.deepEqual(g.pendingClear.rows,[19]);
  g.tick(60000);assert.equal(JSON.stringify(g.board),board);assert.equal(g.score,score);assert.equal(g.pieces,pieces);assert.equal(g.action('down'),false);
  assert.ok(g.acknowledgeClear());assert.equal(g.pendingClear,null);assert.equal(g.board.flat().filter(Boolean).length,0);assert.equal(g.score,score);
  assert.equal(g.acknowledgeClear(),false);assert.equal(g.score,score);
  if(mode==='classic'){assert.deepEqual(g.clearAnimation.rows,[19]);g.tick(1000/60*19);assert.ok(g.clearAnimation);g.tick(1000/60);assert.equal(g.clearAnimation,null);assert.ok(g.pendingSpawn);}
  if(mode==='classic')while(g.pendingSpawn)g.tick(1000/60);assert.ok(!g.pendingSpawn);
});
test('keys before a clear cannot preauthorize a later clear',()=>{const g=new T.Game({waitForKey:true});assert.equal(g.acknowledgeClear(),false);g.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');g.active={...T.spawnPiece('I'),y:18};g.lock();assert.ok(g.pendingClear);});
