(function (root) {
  'use strict';
  const TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const BASE = {
    I: [[0,1],[1,1],[2,1],[3,1]], J: [[0,0],[0,1],[1,1],[2,1]],
    L: [[2,0],[0,1],[1,1],[2,1]], O: [[1,0],[2,0],[1,1],[2,1]],
    S: [[1,0],[2,0],[0,1],[1,1]], T: [[1,0],[0,1],[1,1],[2,1]], Z: [[0,0],[1,0],[1,1],[2,1]]
  };
  // Nintendo's 19 orientations, expressed about the NES pivot; r=0 is spawn.
  const NES = {
    T: [[[-1,0],[0,0],[1,0],[0,1]],[[0,-1],[-1,0],[0,0],[0,1]],[[-1,0],[0,0],[1,0],[0,-1]],[[0,-1],[0,0],[1,0],[0,1]]],
    J: [[[-1,0],[0,0],[1,0],[1,1]],[[0,-1],[0,0],[-1,1],[0,1]],[[-1,-1],[-1,0],[0,0],[1,0]],[[0,-1],[1,-1],[0,0],[0,1]]],
    L: [[[-1,0],[0,0],[1,0],[-1,1]],[[-1,-1],[0,-1],[0,0],[0,1]],[[1,-1],[-1,0],[0,0],[1,0]],[[0,-1],[0,0],[0,1],[1,1]]],
    O: [[[-1,0],[0,0],[-1,1],[0,1]]],
    S: [[[0,0],[1,0],[-1,1],[0,1]],[[0,-1],[0,0],[1,0],[1,1]]],
    Z: [[[-1,0],[0,0],[0,1],[1,1]],[[1,-1],[0,0],[1,0],[0,1]]],
    I: [[[-2,0],[-1,0],[0,0],[1,0]],[[0,-2],[0,-1],[0,0],[0,1]]]
  };
  const NES_ORDER=['T','J','Z','O','S','L','I'],NES_IDS=[2,7,8,10,11,14,18];
  function nesNext(value){return (value>>>1)|((((value>>>1)^(value>>>9))&1)<<15);}
  function spawnPiece(type,mode='modern') {return {type,x:mode==='classic'?5:3,y:mode==='classic'?0:-2,r:0,mode,lastRotation:false,kick:0};}
  function classicLevel(start,lines) {const first=Math.min(start*10+10,Math.max(100,start*10-50));return start+(lines<first?0:1+Math.floor((lines-first)/10));}
  // SRS offsets in board coordinates: positive y points down.
  const JL = {
    '0>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]], '1>0': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
    '1>2': [[0,0],[1,0],[1,1],[0,-2],[1,-2]], '2>1': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
    '2>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]], '3>2': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
    '3>0': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]], '0>3': [[0,0],[1,0],[1,-1],[0,2],[1,2]]
  };
  const IK = {
    '0>1': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]], '1>0': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
    '1>2': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]], '2>1': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
    '2>3': [[0,0],[2,0],[-1,0],[2,-1],[-1,2]], '3>2': [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
    '3>0': [[0,0],[1,0],[-2,0],[1,2],[-2,-1]], '0>3': [[0,0],[-1,0],[2,0],[-1,-2],[2,1]]
  };
  function rng(seed) { let state = seed >>> 0 || 1; return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; }; }
  function cells(p) {
    if(p.mode==='classic')return NES[p.type][p.r%NES[p.type].length].map(([x,y])=>[x+p.x,y+p.y]);
    let points = BASE[p.type].map(v => [...v]);
    if (p.type !== 'O') for (let i=0;i<p.r;i++) points = points.map(([x,y]) => [(p.type === 'I' ? 3 : 2)-y,x]);
    return points.map(([x,y]) => [x+p.x,y+p.y]);
  }
  function valid(board,p) { return cells(p).every(([x,y]) => x>=0 && x<10 && y>=(p.mode==='classic'?-2:-20) && y<20 && (y<0 || !board[y][x])); }
  function rotated(board,p,dir,mode='modern') {
    if(mode==='classic'){const n=NES[p.type].length,q={...p,mode,r:(p.r+dir+n)%n,lastRotation:false,kick:0};return valid(board,q)?q:null;}
    if (p.type==='O') return {...p, lastRotation:true, kick:0};
    const r=(p.r+dir+4)%4;
    const offsets=mode==='classic' ? [[0,0]] : (p.type==='I' ? IK : JL)[`${p.r}>${r}`];
    for(let k=0;k<offsets.length;k++) {
      const [dx,dy]=offsets[k], q={...p,r,x:p.x+dx,y:p.y+dy,lastRotation:true,kick:k};
      if(valid(board,q)) return q;
    }
    return null;
  }
  function spin(board,p) {
    if(p.mode==='classic')return '';
    if(p.type!=='T' || !p.lastRotation) return '';
    const cx=p.x+1,cy=p.y+1, occupied=(x,y)=>x<0||x>=10||y>=20||(y>=0&&!!board[y][x]);
    const corners=[occupied(cx-1,cy-1),occupied(cx+1,cy-1),occupied(cx+1,cy+1),occupied(cx-1,cy+1)];
    if(corners.filter(Boolean).length<3) return '';
    const fronts=[[0,1],[1,2],[2,3],[3,0]][p.r];
    return (corners[fronts[0]]&&corners[fronts[1]])||p.kick===4 ? 'full' : 'mini';
  }
  function placed(board,p) {
    const result=board.map(row=>[...row]);
    const hidden=cells(p).some(([,y])=>y<0);
    for(const [x,y] of cells(p)) if(y>=0) result[y][x]=p.type;
    const cleared=result.filter(row=>row.every(Boolean)).length;
    const kept=result.filter(row=>!row.every(Boolean));
    while(kept.length<20) kept.unshift(Array(10).fill(null));
    return {board:kept,cleared,spin:spin(board,p),hidden:p.mode==='classic'?false:hidden,perfect:cleared>0&&kept.every(row=>row.every(v=>!v))};
  }
  function award({cleared,spin:sp,perfect},mode,level,b2b,combo) {
    if(mode==='classic') return {points:[0,40,100,300,1200][cleared]*(level+1),b2b:false,combo:-1,label:cleared?`${cleared===4?'FALLING BLOCKS':cleared+' LINE'} CLEAR`:'PLACED'};
    const difficult=cleared>0&&(cleared===4||!!sp), chain=difficult&&b2b;
    let base=sp==='full' ? [400,800,1200,1600][cleared] : sp==='mini' ? [100,200,400,0][cleared] : [0,100,300,500,800][cleared];
    let points=Math.floor(base*level*(chain?1.5:1));
    const nextCombo=cleared?combo+1:-1;
    if(cleared) points+=50*nextCombo*level;
    if(perfect) points+=([0,800,1200,1800,chain?3200:2000][cleared])*level;
    return {points,b2b:cleared?difficult:b2b,combo:nextCombo,label:[chain?'B2B':'',sp?`T-SPIN${sp==='mini'?' MINI':''}`:'',cleared===4?'FALLING BLOCKS':cleared?`${cleared} LINE`:'',perfect?'PERFECT CLEAR':'',nextCombo>0?`COMBO ${nextCombo}`:''].filter(Boolean).join(' · ')||'PLACED'};
  }
  const CLASSIC_FRAMES=[48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2,2,2,2,2,2,2,2,2,1];
  class Game {
    constructor({mode='modern',seed=Date.now(),startLevel=0,waitForKey=false}={}) {
      this.mode=mode; this.random=rng(seed); this.board=Array.from({length:20},()=>Array(10).fill(null));
      this.waitForKey=waitForKey;this.pendingClear=null;
      this.classicRng=0x8988;this.spawnCount=0;this.lastSpawnId=0;
      if(mode==='classic')for(let i=0;i<(seed>>>0)%32767;i++)this.classicRng=nesNext(this.classicRng);
      this.startLevel=Number.isInteger(startLevel)?Math.max(0,Math.min(19,startLevel)):0;
      this.bag=[];this.queue=[];this.hold=null;this.held=false;this.score=0;this.lines=0;this.level=mode==='classic'?this.startLevel:1;
      this.b2b=false;this.combo=-1;this.over=false;this.pieces=0;this.gravityClock=0;this.lockClock=0;this.resets=0;this.last='READY';this.events=[];
      this.frameClock=0;this.buttons={};this.das=0;this.softCounter=0;this.softPoints=0;this.entryFrames=0;this.openingFrames=mode==='classic'?96:0;this.inputResults=[];this.clearAnimation=null;this.pendingSpawn=false;
      this.fillQueue();this.spawn();
    }
    drawType() {
      if(this.mode==='classic') {this.spawnCount=(this.spawnCount+1)&255;let index=((this.classicRng>>>8)+this.spawnCount)&7;if(index===7||NES_IDS[index]===this.lastSpawnId){this.classicRng=nesNext(this.classicRng);index=(((this.classicRng>>>8)&7)+this.lastSpawnId)%7;}this.lastSpawnId=NES_IDS[index];return NES_ORDER[index];}
      if(!this.bag.length) {this.bag=[...TYPES];for(let i=6;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}
      return this.bag.pop();
    }
    fillQueue() {while(this.queue.length<(this.mode==='classic'?1:6))this.queue.push(this.drawType());}
    spawn(type) {this.active=spawnPiece(type||this.queue.shift(),this.mode);this.fillQueue();this.gravityClock=0;this.lockClock=0;this.resets=0;this.softCounter=0;this.softPoints=0;this.pendingSpawn=false;if(!valid(this.board,this.active))this.over=true;}
    add(points){this.score+=points;if(points>0)this.events.push({points});}
    action(name) {
      if(this.over||this.pendingSpawn)return false;
      if(name==='hold') {if(this.mode==='classic'||this.held)return false;const t=this.active.type, h=this.hold;this.hold=t;this.spawn(h);this.held=true;return true;}
      if(name==='drop'){if(this.mode==='classic')return false;let n=0;while(valid(this.board,{...this.active,y:this.active.y+1})){this.active.y++;n++;}if(n)this.active.lastRotation=false;this.add(n*2);this.lock();return true;}
      const grounded=!valid(this.board,{...this.active,y:this.active.y+1});
      let next;
      if(name==='cw'||name==='ccw') next=rotated(this.board,this.active,name==='cw'?1:-1,this.mode);
      else {next={...this.active,x:this.active.x+(name==='left'?-1:name==='right'?1:0),y:this.active.y+(name==='down'?1:0),lastRotation:false,kick:0};if(!valid(this.board,next))next=null;}
      if(!next)return false;
      this.active=next;
      if(name==='down'){if(this.mode==='classic')this.softPoints++;else this.add(1);this.gravityClock=0;}
      if(grounded&&this.mode!=='classic'&&this.resets<15){this.lockClock=0;this.resets++;}
      return true;
    }
    lock() {
      if(this.over||this.pendingSpawn)return;
      const lockedCells=cells(this.active),oldBoard=this.board.map(row=>[...row]);
      const result=placed(this.board,this.active);
      if(this.mode==='classic')this.level=classicLevel(this.startLevel,this.lines+result.cleared);
      const reward=award(result,this.mode,this.level,this.b2b,this.combo);
      this.board=result.board;this.add(reward.points);this.b2b=reward.b2b;this.combo=reward.combo;this.last=reward.label;
      if(this.mode==='classic')this.add(this.softPoints);
      this.lines+=result.cleared;if(this.mode!=='classic')this.level=Math.floor(this.lines/10)+1;this.pieces++;this.held=false;
      this.events.push({clear:result.cleared,spin:result.spin,perfect:result.perfect,label:this.last});
      if(this.waitForKey&&result.cleared){
        for(const [x,y]of lockedCells)if(y>=0)oldBoard[y][x]=this.active.type;
        this.pendingClear={board:result.board,rows:oldBoard.flatMap((row,y)=>row.every(Boolean)?[y]:[]),hidden:result.hidden};
        this.board=oldBoard;this.pendingSpawn=true;this.softPoints=0;
        this.entryFrames=this.mode==='classic'?10+Math.min(4,Math.floor(Math.max(0,18-this.active.y)/4))*2:0;
        return;
      }
      // This project's profile uses partial lock-out before line clear.
      if(result.hidden){this.over=true;return;}
      if(this.mode==='classic'){
        for(const [x,y]of lockedCells)if(y>=0)oldBoard[y][x]=this.active.type;
        const rows=oldBoard.flatMap((row,y)=>row.every(Boolean)?[y]:[]);
        this.entryFrames=10+Math.min(4,Math.floor(Math.max(0,18-this.active.y)/4))*2;
        if(rows.length)this.clearAnimation={board:oldBoard,rows,frame:0,duration:20};
        this.pendingSpawn=true;this.softPoints=0;return;
      }
      this.spawn();
    }
    acknowledgeClear(){
      if(!this.pendingClear)return false;
      const clear=this.pendingClear,oldBoard=this.board;this.pendingClear=null;this.board=clear.board;
      if(clear.hidden){this.over=true;this.pendingSpawn=false;}
      else if(this.mode!=='classic')this.spawn();
      else this.clearAnimation={board:oldBoard,rows:clear.rows,frame:0,duration:20};
      return true;
    }
    classicFrame(input={}) {
      this.inputResults=[];if(this.over||this.pendingClear)return;
      this.classicRng=nesNext(this.classicRng);
      if(this.pendingSpawn){this.buttons={...input};if(this.clearAnimation){this.clearAnimation.frame++;if(this.clearAnimation.frame>=this.clearAnimation.duration)this.clearAnimation=null;return;}if(--this.entryFrames<=0)this.spawn();return;}
      const old=this.buttons,pressed=k=>!!input[k]&&!old[k];
      const attempt=name=>{const success=this.action(name);this.inputResults.push({name,success});return success;};
      const direction=input.down?null:input.left?'left':input.right?'right':null;
      if(direction){if(pressed(direction)){this.das=0;if(!attempt(direction))this.das=16;}else{this.das++;if(this.das>=16){this.das=10;if(!attempt(direction))this.das=16;}}}else if(!input.down)this.das=0;
      if(pressed('cw'))attempt('cw');else if(pressed('ccw'))attempt('ccw');
      if(this.openingFrames>0){if(pressed('down'))this.openingFrames=0;else this.openingFrames--;}
      let soft=false;
      if(input.down&&!input.left&&!input.right){if(pressed('down')){this.softCounter=1;this.softPoints=0;}else if(this.softCounter>0)this.softCounter++;if(this.softCounter>=3){this.softCounter=1;soft=true;}}
      else{this.softCounter=0;this.softPoints=0;}
      if(this.openingFrames===0){this.gravityClock++;const gravity=CLASSIC_FRAMES[Math.min(this.level,29)];
        if(soft){if(!attempt('down'))this.lock();}
        else if(this.gravityClock>=gravity){this.gravityClock=0;const next={...this.active,y:this.active.y+1};if(valid(this.board,next))this.active=next;else this.lock();}
      }
      this.buttons={...input};
    }
    tick(ms,input={}) {
      if(this.over||this.pendingClear)return;
      if(this.mode==='classic'){this.frameClock+=ms;while(this.frameClock+1e-7>=1000/60&&!this.over){this.frameClock-=1000/60;this.classicFrame(input);}return;}
      const interval=this.mode==='classic'?(CLASSIC_FRAMES[Math.min(this.level,29)]*1000/60):Math.max(10,1000*Math.pow(Math.max(.05,.8-(this.level-1)*.007),this.level-1));
      this.gravityClock+=ms;
      while(this.gravityClock>=interval&&!this.over){this.gravityClock-=interval;const p={...this.active,y:this.active.y+1};if(valid(this.board,p))this.active=p;else if(this.mode==='classic'){this.lock();return;}else break;}
      if(!valid(this.board,{...this.active,y:this.active.y+1})){this.lockClock+=ms;if(this.mode!=='classic'&&this.lockClock>=500)this.lock();}else this.lockClock=0;
    }
    snapshot(){return {mode:this.mode,board:this.board,active:this.active,hold:this.hold,held:this.held,queue:this.queue,level:this.level,b2b:this.b2b,combo:this.combo};}
  }
  const api={TYPES,BASE,NES,JL,IK,CLASSIC_FRAMES,rng,nesNext,spawnPiece,classicLevel,cells,valid,rotated,spin,placed,award,Game};
  if(typeof module!=='undefined')module.exports=api;else root.FallingBlocks=api;
})(typeof self!=='undefined'?self:globalThis);
