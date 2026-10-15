(function(root){
  'use strict';
  const T=typeof module!=='undefined'?require('./engine.js'):root.FallingBlocks;
  const P=typeof module!=='undefined'?require('./progression.js'):root.Progress;
  function placements(board,start,mode='modern') {
    start={...start,mode};
    if(!T.valid(board,start))return [];
    const keyOf=p=>`${p.x},${p.y},${p.r},${p.lastRotation?1:0},${p.kick===4?1:0}`;
    const queue=[{p:{...start},path:[]}],seen=new Set([keyOf(start)]),out=[];let head=0;
    while(head<queue.length&&head<4000){
      const {p,path}=queue[head++];
      if(!T.valid(board,{...p,y:p.y+1}))out.push({p,path});
      for(const action of ['left','right','cw','ccw','down']){
        let q;
        if(action==='cw'||action==='ccw')q=T.rotated(board,p,action==='cw'?1:-1,mode);
        else {q={...p,x:p.x+(action==='left'?-1:action==='right'?1:0),y:p.y+(action==='down'?1:0),lastRotation:false,kick:0};if(!T.valid(board,q))q=null;}
        if(q&&!seen.has(keyOf(q))){seen.add(keyOf(q));queue.push({p:q,path:[...path,action]});}
      }
    }
    return out;
  }
  function features(board){const h=Array(10).fill(0);let holes=0;for(let x=0;x<10;x++){let found=false;for(let y=0;y<20;y++){if(board[y][x]){if(!found)h[x]=20-y;found=true;}else if(found)holes++;}}
    let bump=0,wells=0;for(let x=0;x<10;x++){if(x<9)bump+=Math.abs(h[x]-h[x+1]);wells+=Math.max(0,Math.min(x?h[x-1]:20,x<9?h[x+1]:20)-h[x]);}
    return {height:h.reduce((a,b)=>a+b,0),max:Math.max(...h),holes,bump,wells};}
  function slots(board){let n=0;for(let y=1;y<19;y++)for(let x=1;x<9;x++)if(!board[y][x]&&!board[y-1][x]){const c=[board[y-1][x-1],board[y-1][x+1],board[y+1][x-1],board[y+1][x+1]].filter(Boolean).length;if(c>=3)n++;}return n;}
  function evaluate(result,weights,skill,mode){if(result.hidden)return -1e6;const f=features(result.board);let v=f.height*weights.height+f.holes*weights.holes+f.bump*weights.bump+f.wells*weights.wells+result.cleared*weights.lines-Math.max(0,f.max-12)*3;
    if(skill>=3)v+=result.cleared===4?18:0;
    if(mode!=='classic'){
      if(skill>=4)v+=(result.spin&&result.cleared?25+result.cleared*8:0)+slots(result.board)*1.5;
      if(skill>=5&&result.perfect)v+=120;
      if(skill>=6&&result.spin&&result.cleared===3)v+=70;
    }
    return v;
  }
  function candidates(board,type,mode,weights,skill,start){return placements(board,start||T.spawnPiece(type,mode),mode).map(move=>{const result=T.placed(board,move.p);return {...move,result,value:evaluate(result,weights,skill,mode)};}).sort((a,b)=>b.value-a.value||a.path.length-b.path.length);}
  function choose(state,skill=0,weights=P.DEFAULT_WEIGHTS){
    const choices=candidates(state.board,state.active.type,state.mode,weights,skill,state.active);
    if(skill>=2&&state.mode!=='classic'&&!state.held){const type=state.hold||state.queue[0];for(const c of candidates(state.board,type,state.mode,weights,skill))choices.push({...c,path:['hold',...c.path],usesHold:true});}
    choices.sort((a,b)=>b.value-a.value);const shortlist=choices.slice(0,skill>=5?6:skill>=2?4:1);
    if(skill>=2)for(const c of shortlist){const next=state.queue[c.usesHold&&!state.hold?1:0];const second=candidates(c.result.board,next,state.mode,weights,skill).slice(0,skill>=5?2:1);let future=second[0]?.value??-1e6;
      if(skill>=5&&state.mode!=='classic'){future=-1e6;for(const s of second){const third=candidates(s.result.board,state.queue[c.usesHold&&!state.hold?2:1],state.mode,weights,skill)[0];const value=s.value+.3*(third?.value??-1e6);future=Math.max(future,value);}}
      c.total=c.value+.45*future;
    }
    shortlist.sort((a,b)=>(b.total??b.value)-(a.total??a.value));const best=shortlist[0];
    return best?{path:best.path,target:best.p,value:best.total??best.value,reason:best.result.perfect?'Perfect clear':best.result.spin?'T-spin path':best.result.cleared===4?'Four-line clear':best.result.cleared?'Line clear':'Safe stack'}:null;
  }
  function benchmark(weights,skill,seeds,pieceLimit=60,mode='modern'){let score=0,lines=0,pieces=0,spins=0,perfects=0;for(const seed of seeds){const g=new T.Game({seed,mode});while(!g.over&&g.pieces<pieceLimit){const move=choose(g.snapshot(),Math.min(skill,3),weights);if(!move)break;let legal=true;for(const a of move.path)if(!g.action(a)){legal=false;break;}if(!legal)break;if(!g.over)g.lock();while(g.pendingSpawn&&!g.over)g.tick(1000/60);for(const e of g.events){if(e.spin)spins++;if(e.perfect)perfects++;}g.events=[];}score+=g.score;lines+=g.lines;pieces+=g.pieces;}return {fitness:lines*15+pieces+score*.002,score,lines,pieces,spins,perfects};}
  const api={placements,features,evaluate,candidates,choose,benchmark};if(typeof module!=='undefined')module.exports=api;else root.IdlerAI=api;
})(typeof self!=='undefined'?self:globalThis);
