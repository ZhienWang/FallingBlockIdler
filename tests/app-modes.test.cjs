const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('app switches all games, draws, clears on input, pauses and restarts',async()=>{
  const Progress=require('../src/progression.js'),handlers={},nodes=new Map(),saved={};
  const canvasContext=new Proxy({}, {get:(_,key)=>key==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
  function node(){return {width:64,height:52,options:[],value:'',hidden:false,disabled:false,open:false,style:{},dataset:{},classList:{toggle(){}},getContext:()=>canvasContext,setAttribute(){},replaceChildren(){},append(){},showModal(){this.open=true;},close(){this.open=false;},click(){this.onclick?.();}};}
  const document={body:node(),getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},createElement:node,querySelectorAll:()=>[]};
  document.getElementById('mode').options=Progress.MODES.map(m=>({value:m.id}));
  const context={document,performance:{now:()=>0},Date,Math,console,localStorage:{getItem:()=>null,setItem:(k,v)=>saved[k]=v},Worker:class{terminate(){}postMessage(){}},requestAnimationFrame(){},FallingBlocks:require('../src/engine.js'),Progress,PairGames:require('../src/pair-games.js'),Suika:require('../src/suika.js'),BoardDog:{draw(){},wag(){}},BlockArt:{paint(){}}};
  context.window={addEventListener:(name,fn)=>handlers[name]=fn};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),context);await new Promise(resolve=>setImmediate(resolve));
  for(const mode of ['doctor','puyo','fighter','suika']){
    const selector=document.getElementById('mode');selector.value=mode;selector.onchange();vm.runInContext('draw();renderPanel();',context);
    assert.equal(context.window.idlerDebug().mode,mode);assert.equal(document.getElementById('practice').disabled,true);
    vm.runInContext("for(let i=0;i<16000&&!game.pendingClear&&!game.over;i++)simulation(60);",context);assert.equal(context.window.idlerDebug().waitingForKey,true,mode+' should produce a match');
    const score=context.window.idlerDebug().score;handlers.keydown({repeat:false});assert.ok(context.window.idlerDebug().score>score);
    vm.runInContext("for(let i=0;i<16000&&!game.pendingClear&&!game.over;i++)simulation(60);",context);const before=context.window.idlerDebug().score;handlers.mousedown({button:0});assert.ok(context.window.idlerDebug().score>before);
    document.getElementById('pause').click();assert.equal(context.window.idlerDebug().paused,true);document.getElementById('pause').click();
    const next=Progress.nextMode({mode,lifetime:0});vm.runInContext('game.over=true;restart=2999;simulation(60);draw();',context);assert.equal(context.window.idlerDebug().over,false);assert.equal(context.window.idlerDebug().mode,next);assert.equal(JSON.parse(saved['falling-blocks']).mode,next);
  }
  const selector=document.getElementById('mode');selector.value='classic';selector.onchange();vm.runInContext('draw();renderPanel();',context);assert.equal(context.window.idlerDebug().mode,'classic');
});
