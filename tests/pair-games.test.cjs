const {test}=require('node:test'),assert=require('node:assert/strict');
const P=require('../src/pair-games.js'),Progress=require('../src/progression.js');
const board=(w=6,h=12)=>Array.from({length:h},()=>Array(w).fill(null));
const cell=(color,kind='puyo',link=0)=>({color,kind,link});
test('doctor clears lines of four, not a connected square',()=>{
  const b=board(8,16);for(let x=0;x<4;x++)b[15][x]=cell(0,x===0?'virus':'capsule');assert.equal(P.matches(b,'doctor').length,4);
  const square=board();for(const [x,y]of [[0,10],[1,10],[0,11],[1,11]])square[y][x]=cell(0);assert.equal(P.matches(square,'doctor').length,0);assert.equal(P.matches(square,'puyo').length,4);
});
test('virus stays fixed; capsule halves remain linked until one is cleared',()=>{
  const b=board(8,16);b[14][0]=cell(0,'virus');b[13][0]=cell(1,'capsule',1);b[13][1]=cell(2,'capsule',1);P.gravity(b,'doctor');assert.equal(b[13][1]?.color,2);assert.equal(b[14][0]?.kind,'virus');
  b[13][0]=null;P.gravity(b,'doctor');assert.equal(b[15][1]?.color,2);
});
test('Puyo groups use orthogonal connections and require at least four',()=>{
  const b=board();for(const [x,y]of [[0,11],[1,11],[1,10]])b[y][x]=cell(0);assert.equal(P.matches(b,'puyo').length,0);b[9][1]=cell(0);assert.equal(P.matches(b,'puyo').length,4);b[8][2]=cell(0);assert.equal(P.matches(b,'puyo').length,4);
});
test('Puzzle Fighter normal gems wait for a matching crash; diamonds clear a color',()=>{
  const b=board();for(let x=0;x<4;x++)b[11][x]=cell(0,'gem');assert.equal(P.matches(b,'fighter').length,0);assert.equal(P.powerGems(b).size,0);b[11][0].kind='crash';assert.equal(P.matches(b,'fighter').length,4);
  const d=board();d[10][0]=cell(-1,'diamond');d[11][0]=cell(1,'gem');d[11][5]=cell(1,'gem');d[11][2]=cell(2,'gem');assert.equal(P.matches(d,'fighter').length,3);
});
test('matching 2x2 gems form a Power Gem',()=>{const b=board();for(const [x,y]of [[0,10],[1,10],[0,11],[1,11]])b[y][x]=cell(0,'gem');assert.equal(P.powerGems(b).size,4);b[10][1].color=1;assert.equal(P.powerGems(b).size,0);});
test('Power Gems fall together and earn a larger crash bonus',()=>{
  const b=board();for(const [x,y]of [[0,8],[1,8],[0,9],[1,9]])b[y][x]=cell(0,'gem');b[11][0]=cell(1,'gem');P.gravity(b,'fighter');assert.equal(b[9][1]?.color,0);assert.equal(b[10][1]?.color,0);assert.equal(b[11][1],null);
  const g=new P.Game({mode:'fighter'});g.board=b;g.board[10][2]=cell(0,'crash');g.active=null;g.check();g.acknowledgeClear();assert.equal(g.score,130);
});
test('pending clears freeze play and require new input for each chain',()=>{
  const g=new P.Game({mode:'puyo',seed:1});g.board=board();for(let x=0;x<4;x++)g.board[11][x]=cell(0);for(const [x,y]of [[0,10],[1,10],[2,10],[3,9]])g.board[y][x]=cell(1);
  assert.equal(g.acknowledgeClear(),false);g.active=null;g.check();assert.ok(g.pendingClear);const before=JSON.stringify(g.board);g.tick(5000);assert.equal(JSON.stringify(g.board),before);assert.equal(g.score,0);
  assert.equal(g.acknowledgeClear(),true);assert.equal(g.score,40);assert.ok(g.pendingClear);assert.equal(g.chain,1);g.acknowledgeClear();assert.equal(g.score,120);assert.equal(g.pendingClear,null);assert.equal(g.acknowledgeClear(),false);
});
test('doctor wins after last virus is cleared',()=>{
  const g=new P.Game({mode:'doctor',seed:2});g.board=board(8,16);for(let x=0;x<4;x++)g.board[15][x]=cell(0,x===0?'virus':'capsule');g.active=null;g.check();assert.equal(g.viruses,1);g.acknowledgeClear();assert.equal(g.won,true);assert.equal(g.over,true);assert.equal(g.viruses,0);assert.equal(g.score,140);
});
for(const mode of Object.keys(P.MODES))test(mode+' AI executes legal placements, clears, and preserves selected mode',()=>{
  const g=new P.Game({mode,seed:42});let clears=0;for(let i=0;i<12000&&!g.over&&g.pieces<50;i++){g.tick(60);if(g.active)assert.ok(P.valid(g.board,g.active));if(g.pendingClear){clears++;g.acknowledgeClear();}}
  assert.ok(g.pieces>=10,'AI should survive at least ten pairs');assert.ok(clears>0,'AI should find matches');assert.ok(g.score>0);const d=Progress.fresh();d.mode=mode;assert.equal(Progress.sanitize(d).mode,mode);
});
test('blocked spawn ends the run',()=>{const g=new P.Game({mode:'puyo'});g.board[0][2]=cell(0);g.spawn();assert.equal(g.over,true);});
