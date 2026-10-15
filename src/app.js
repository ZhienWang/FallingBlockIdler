/* global FallingBlocks, Progress */
'use strict';
const $=id=>document.getElementById(id),num=n=>Math.floor(n).toLocaleString();
let data,game,worker,trainer,plan=null,pending=false,requestId=0,paused=false,thinking='Safe stack',restart=0,accumulator=0,stepClock=0,training=false,lastTime=performance.now(),saveClock=0,panelKey='',runRecorded=false,reportedWaiting=false,globalKeyboard=false;
const COLORS={I:'#65d8ed',J:'#7298f9',L:'#f6aa69',O:'#f3d66c',S:'#8dd690',T:'#c396ed',Z:'#f18093'};
const RETRO_PALETTES=[['#2878f8','#38b8f8'],['#00a800','#b8f818'],['#a800d0','#f878f8'],['#0058f8','#58d854'],['#e80058','#58f898'],['#58f898','#6888fc'],['#f83800','#b8b8b8'],['#6844fc','#a8f0e0'],['#0058f8','#f83800'],['#f83800','#f8a800']];
function pieceColor(type){const i=FallingBlocks.TYPES.indexOf(type);if(data.skin==='handheld')return ['#344d24','#526b32','#6d833e'][i%3];if(data.skin==='terminal')return ['#64ff8c','#2ab95b','#b5ffd0'][i%3];if(data.skin==='sunset')return ['#ffa15c','#ef668e','#c68bfa','#ffd17e','#f48e73','#b19cff','#f0a0bd'][i];if(data.skin==='8bit'){const palette=RETRO_PALETTES[game.level%10];return ['I','T','O'].includes(type)?'#fcfcfc':['J','S'].includes(type)?palette[0]:palette[1];}return COLORS[type];}
const pairMode=()=>Object.hasOwn(PairGames.MODES,data.mode);
const extraMode=()=>data.mode==='suika'||pairMode();
function practiceWeights(){return data.mode==='classic'?data.classicWeights:data.weights;}
const MODE_TEXT={modern:'Unlocks at 1,000,000,000 lifetime points. Hold, ghost, seven-bag pieces, SRS wall kicks, spin bonuses and back-to-backs.',classic:'Nintendo rotation shapes and visible spawns, one preview, frame-based taps and soft drop, classic gravity and scoring. No hold, ghost, hard drop or wall kicks.',blind:'Locked blocks vanish. The active piece and previews stay visible; the AI remembers the board. Unlocks at 10,000,000,000 lifetime points.'};
function makeWorker(){const w=new Worker('worker.js');w.onmessage=({data:m})=>{if(m.type==='plan'&&m.id===requestId){pending=false;plan=m.plan;if(plan)thinking=plan.reason;else if(!game.over){game.over=true;}}else if(m.type==='error'){pending=false;$('event').textContent=`AI: ${m.message}`;paused=true;update();}};w.onerror=e=>{pending=false;paused=true;$('event').textContent=`AI worker failed: ${e.message}`;update();};return w;}
function start(){worker?.terminate();worker=extraMode()?null:makeWorker();game=pairMode()?new PairGames.Game({mode:data.mode}):data.mode==='suika'?new Suika.Game():new FallingBlocks.Game({mode:data.mode==='classic'?'classic':'modern',startLevel:data.classicStartLevel,waitForKey:true});plan=null;pending=false;restart=0;accumulator=0;stepClock=0;runRecorded=false;requestId++;$('event').textContent='Watching a little mind grow.';update();}
function requestPlan(){if(pending||game.over)return;pending=true;worker.postMessage({type:'plan',id:++requestId,state:game.snapshot(),skill:Progress.skill(data),weights:practiceWeights()});}
function collect(){for(const e of game.events){if(e.points)Progress.earn(data,e.points);if(extraMode()&&e.label)$('event').textContent=e.label;if(e.clear!==undefined){data.stats.pieces++;if(e.clear===4)data.stats.tetrises++;if(e.spin&&e.clear)data.stats.spins++;if(e.perfect)data.stats.perfects++;if(e.label!=='PLACED')$('event').textContent=e.label;}}game.events=[];}
function finishRun(){collect();if(game.over&&!runRecorded){runRecorded=true;data.runs++;data.best=Math.max(data.best,game.score);save();}}
function classicSimulation(ms){
  if(game.pendingSpawn){game.tick(ms);plan=null;finishRun();return;}
  if(!plan){requestPlan();return;}
  const before={...game.active},serial=game.pieces;
  if(!plan.path.length&&(before.x!==plan.target.x||before.y!==plan.target.y||before.r!==plan.target.r)){plan=null;return;}
  const action=plan.path[0]||'down',input={};
  if(action==='down'||!game.buttons[action])input[action]=true;
  const expected=action==='cw'||action==='ccw'?FallingBlocks.rotated(game.board,before,action==='cw'?1:-1,'classic'):{...before,x:before.x+(action==='left'?-1:action==='right'?1:0),y:before.y+(action==='down'?1:0)};
  game.tick(ms,input);
  const applied=game.inputResults.find(r=>r.name===action);
  if(applied){if(applied.success&&plan.path.length)plan.path.shift();else if(!applied.success)plan=null;}
  if(game.pieces!==serial||game.over)plan=null;
  else{const wanted=applied?.success?expected:before;if(!wanted||game.active.x!==wanted.x||game.active.y!==wanted.y||game.active.r!==wanted.r)plan=null;}
  finishRun();
}
function simulation(ms){if(game.over){finishRun();restart+=ms;if(restart>=3000){if(training)stopPractice();data.mode=Progress.nextMode(data);if(data.mode==='classic')data.skin='8bit';else if(data.skin==='8bit')data.skin='classic';start();save();}return;}
  if(extraMode()){game.tick(ms);thinking=pairMode()?'Planning pairs and chains':'Seeking fruit pairs';collect();finishRun();return;}
  if(game.pendingClear){finishRun();return;}
  if(data.mode==='classic'){classicSimulation(ms);return;}
  if(!plan){requestPlan();return;} // Planning time is excluded from game time.
  const serial=game.pieces;stepClock+=ms;
  if(stepClock>=35){stepClock=0;for(let i=0;i<3&&plan.path.length;i++){if(!game.action(plan.path.shift())){plan=null;break;}if(game.pieces!==serial)break;}
    if(plan&&!plan.path.length){const a=game.active,t=plan.target;if(a.x!==t.x||a.y!==t.y||a.r!==t.r||a.type!==t.type){plan=null;}else game.tick(500);if(game.pieces!==serial||game.over)plan=null;}
  }
  if(plan&&game.pieces===serial)game.tick(ms);
  if(game.pieces!==serial)plan=null;collect();
  finishRun();
}
function update(){document.body.dataset.skin=data.skin;$('linesLabel').textContent=pairMode()?(data.mode==='doctor'?'VIRUSES':'CLEARED'):data.mode==='suika'?'MERGES':'LINES';$('levelLabel').textContent=data.mode==='suika'?'FRUIT LV':'GAME LV';$('holdLabel').textContent=pairMode()?'PAIR':data.mode==='suika'?'DROP':'HOLD';$('board').setAttribute('aria-label',pairMode()?'Self-playing '+PairGames.MODES[data.mode].name+' board':data.mode==='suika'?'Self-playing Suika fruit board':'Self-playing Falling Blocks board');$('score').textContent=num(game.score);$('topScore').textContent=num(game.score);$('lines').textContent=num(data.mode==='doctor'?game.viruses:game.lines);$('gameLevel').textContent=game.level;$('lifetime').textContent=num(data.lifetime);$('wallet').textContent=num(data.wallet);$('rank').textContent=`LEVEL ${Progress.level(data)}`;$('modeTag').textContent=pairMode()?PairGames.MODES[data.mode].name.toUpperCase():data.mode==='suika'?'SUIKA':data.mode==='classic'?'8-BIT CLASSIC':data.mode==='blind'?'BLIND':'MODERN';$('state').textContent=paused?'PAUSED':game.pendingClear?'WAITING FOR INPUT':pending?'THINKING':'AUTOPILOT';$('liveDot').style.opacity=paused?'.3':'1';$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';
  const waiting=!!game.pendingClear;if(waiting!==reportedWaiting){reportedWaiting=waiting;window.desktop?.waitingForKey(waiting);}
  if(waiting&&data.mode==='suika')$('event').textContent=globalKeyboard?'Fruit pair ready ? Type or click anywhere to merge':'Fruit pair ready ? Type or click in game to merge';
  else if(waiting&&pairMode())$('event').textContent=globalKeyboard?'Match ready ? Type or click anywhere to clear':'Match ready ? Type or click in game to clear';
  else if(waiting)$('event').textContent=globalKeyboard?'Score added · Type or click anywhere to clear':'Score added · Type or click in game to clear';
  const next=[...Progress.MODES,...Progress.SKINS].filter(s=>s.at>data.lifetime).sort((a,b)=>a.at-b.at)[0];$('meterFill').style.width=`${next?Math.min(100,data.lifetime/next.at*100):100}%`;$('milestone').textContent=next?`${next.name} at ${num(next.at)} · ${num(next.at-data.lifetime)} to go`:'All skins unlocked · Grandmaster ready';
  $('overlay').hidden=!paused&&!game.over;if(game.over){$('overlayTitle').textContent='NEXT RUN';$('overlayText').textContent=`${num(game.score)} points · restarting in ${Math.max(1,Math.ceil((3000-restart)/1000))}s`;}else{$('overlayTitle').textContent='PAUSED';$('overlayText').textContent=thinking;}
  if($('panel').open){$('panelWallet').textContent=num(data.wallet);const key=[Progress.skill(data),data.skin,data.mode,training,...Progress.SKILLS.map(s=>data.wallet>=s.cost),...Progress.SKINS.map(s=>Progress.skinUnlocked(data,s.id))].join('|');if(key!==panelKey){panelKey=key;renderPanel();}}}
function block(ctx,x,y,size,type,ghost=false){BlockArt.paint(ctx,x,y,size,type,data.skin,pieceColor(type),ghost);}
function mini(id,types,size,gap){const canvas=$(id),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);types.forEach((type,i)=>{if(!type)return;const points=FallingBlocks.cells({...FallingBlocks.spawnPiece(type,data.mode==='classic'?'classic':'modern'),x:0,y:0}),minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));const ox=(canvas.width-(maxX-minX+1)*size)/2;for(const [x,y]of points)block(ctx,ox+(x-minX)*size,8+i*gap+(y-minY)*size,size,type);});}
function draw(){if(pairMode()){drawPairGame();return;}if(data.mode==='suika'){drawSuika();return;}const ctx=$('board').getContext('2d');ctx.clearRect(0,0,200,400);BoardDog.draw(ctx,performance.now());ctx.strokeStyle='#ffffff05';ctx.lineWidth=1;for(let x=0;x<=200;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,400);ctx.stroke();}for(let y=0;y<=400;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(200,y);ctx.stroke();}
  const visibleBoard=game.clearAnimation?.board||game.board;
  for(let y=0;y<20;y++)for(let x=0;x<10;x++)if(visibleBoard[y][x]&&(data.mode!=='blind'||game.over||game.pendingClear?.rows.includes(y))){const sweep=game.clearAnimation&&game.clearAnimation.rows.includes(y)&&Math.abs(x-4.5)<Math.floor(game.clearAnimation.frame/4)+.5;if(!sweep)block(ctx,x*20,y*20,20,visibleBoard[y][x]);}
  if(game.pendingClear){ctx.fillStyle='#ffffff33';for(const row of game.pendingClear.rows)ctx.fillRect(0,row*20,200,20);}
  if(!game.over&&!game.pendingSpawn){if(data.mode==='modern'){const ghost={...game.active};while(FallingBlocks.valid(game.board,{...ghost,y:ghost.y+1}))ghost.y++;for(const [x,y]of FallingBlocks.cells(ghost))if(y>=0)block(ctx,x*20,y*20,20,ghost.type,true);}for(const [x,y]of FallingBlocks.cells(game.active))if(y>=0)block(ctx,x*20,y*20,20,game.active.type);}
  mini('hold',data.mode==='classic'?[]:[game.hold],13,45);mini('next',game.queue.slice(0,data.mode==='classic'?1:5),10,48);
}
function drawSuika(){
  const ctx=$('board').getContext('2d');ctx.clearRect(0,0,200,400);BoardDog.draw(ctx,performance.now());
  ctx.save();ctx.strokeStyle=game.danger?'#ff777c':'#ffffff45';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(0,48);ctx.lineTo(200,48);ctx.stroke();ctx.restore();
  for(const f of game.fruits){Suika.fruit(ctx,f.tier,f.x,f.y);if(game.pendingClear&&(f===game.pendingClear.a||f===game.pendingClear.b)){ctx.save();ctx.strokeStyle='#fff1b0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,Suika.FRUITS[f.tier][1]+2,0,Math.PI*2);ctx.stroke();ctx.restore();}}
  if(!game.over){const x=game.choose();ctx.save();ctx.globalAlpha=.45;Suika.fruit(ctx,game.next,x,23);ctx.restore();}
  for(const [id,tier]of [['hold',game.next],['next',game.queue[0]]]){const c=$(id),p=c.getContext('2d');p.clearRect(0,0,c.width,c.height);Suika.fruit(p,tier,c.width/2,22,Math.min(18,Suika.FRUITS[tier][1]));}
}
function drawPairGame(){
  const ctx=$('board').getContext('2d');ctx.clearRect(0,0,200,400);BoardDog.draw(ctx,performance.now());
  const size=Math.min(200/game.width,400/game.height),ox=(200-game.width*size)/2,oy=400-game.height*size;
  const marked=new Set((game.pendingClear?.cells||[]).map(([x,y])=>y*game.width+x));
  ctx.strokeStyle='#ffffff15';ctx.strokeRect(ox,oy,game.width*size,game.height*size);
  for(let y=0;y<game.height;y++)for(let x=0;x<game.width;x++)if(game.board[y][x])PairGames.paint(ctx,game.board[y][x],ox+x*size,oy+y*size,size,data.mode,marked.has(y*game.width+x));
  if(data.mode==='fighter'){const powers=PairGames.powerGems(game.board);ctx.strokeStyle='#ffffff70';for(const k of powers)ctx.strokeRect(ox+(k%game.width)*size+1,oy+Math.floor(k/game.width)*size+1,size-2,size-2);}
  if(game.active)PairGames.coords(game.active).forEach(([x,y],i)=>PairGames.paint(ctx,game.current[i],ox+x*size,oy+y*size,size,data.mode));
  for(const [id,pairs]of [['hold',[game.current]],['next',game.queue]]){const canvas=$(id),p=canvas.getContext('2d');p.clearRect(0,0,canvas.width,canvas.height);pairs.forEach((pair,j)=>pair.forEach((cell,i)=>PairGames.paint(p,cell,(canvas.width-32)/2+i*16,8+j*42,16,data.mode)));}
}
function renderPanel(){
  $('panelWallet').textContent=num(data.wallet);$('skills').replaceChildren();Progress.SKILLS.forEach((s,i)=>{const row=document.createElement('div');row.className='skill';const copy=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small');name.textContent=s.name;detail.textContent=s.detail+(data.mode==='classic'&&i>=3?' Modern tactics apply after its unlock.':'');copy.append(name,detail);const b=document.createElement('button');b.textContent=i<Progress.skill(data)?'✓ Learned':num(s.cost);b.disabled=extraMode()||i!==Progress.skill(data)||data.wallet<s.cost||training;b.onclick=()=>{if(Progress.buy(data)){plan=null;pending=false;requestId++;save();renderPanel();update();runPractice();}};row.append(copy,b);$('skills').append(row);});
  $('skins').replaceChildren();for(const s of Progress.SKINS){const b=document.createElement('button');b.className='skin';b.dataset.skin=s.id;b.setAttribute('aria-pressed',String(s.id===data.skin));b.disabled=!Progress.skinUnlocked(data,s.id);const sw=document.createElement('canvas');sw.width=120;sw.height=48;sw.setAttribute('aria-label',s.name+' block preview');const preview=sw.getContext('2d');for(const [i,type]of ['T','I','O','S','Z'].entries())BlockArt.paint(preview,i*24,12,24,type,s.id,COLORS[type]);sw.className='swatch';const label=document.createElement('strong');label.textContent=s.name;const hint=document.createElement('small');hint.textContent=b.disabled?`${num(s.at)} lifetime pts`:s.id===data.skin?'✓ Selected':s.id==='8bit'?'Select · classic play':'Select skin';if(s.detail){const description=document.createElement('small');description.textContent=s.detail;b.append(sw,label,description,hint);}else b.append(sw,label,hint);b.onclick=()=>{data.skin=s.id;if(s.id==='8bit'&&data.mode!=='classic'&&!extraMode()){data.mode='classic';start();}save();update();};$('skins').append(b);}
  $('mode').value=data.mode;for(const option of $('mode').options){const mode=Progress.MODES.find(m=>m.id===option.value);option.disabled=!Progress.unlocked(data,option.value);option.textContent=mode.name+(mode.at?' at '+num(mode.at):'');}$('modeDescription').textContent=pairMode()?PairGames.MODES[data.mode].description+' AI plays automatically. Each clear waits for a keystroke or click.':data.mode==='suika'?'AI drops fruit automatically, aiming for matching pairs. Matching fruit wait for a keystroke or mouse click to merge into larger fruit. Keep the pile below the dashed line; a full basket starts a new run.':MODE_TEXT[data.mode];$('stats').textContent=`${num(data.runs)} completed runs · Best ${num(data.best)}\n${num(data.stats.pieces)} pieces · ${num(data.stats.tetrises)} four-line clears · ${num(data.stats.spins)} spin clears · ${num(data.stats.perfects)} perfect clears`;
  $('classicOptions').hidden=data.mode!=='classic';$('classicLevel').value=data.classicStartLevel;
  $('practice').disabled=extraMode()||training||Progress.skill(data)===0;$('cancelPractice').hidden=!training;
}
async function save(){if(!data)return;try{if(window.desktop)await desktop.save(data);else localStorage.setItem('falling-blocks',JSON.stringify(data));}catch(e){$('event').textContent=`Save failed: ${e.message}`;}}
function runPractice(){if(extraMode()||training||Progress.skill(data)===0)return;training=true;trainer=new Worker('worker.js');$('trainingProgress').hidden=false;$('trainingProgress').value=0;$('trainingStatus').textContent=(data.mode==='classic'?'NES Classic':'Modern')+' practice: checking fresh sequences, survival, and clears.';renderPanel();
  trainer.onmessage=({data:m})=>{if(m.type==='progress')$('trainingProgress').value=m.value;if(m.type==='trained'){data[m.result.mode==='classic'?'classicWeights':'weights']=m.weights;data.training=m.result;training=false;trainer.terminate();trainer=null;$('trainingProgress').value=100;$('trainingStatus').textContent=`${m.result.accepted?'Improved weights saved.':'Current weights retained.'} Validation fitness ${m.result.before.toFixed(1)} → ${m.result.after.toFixed(1)}. Lines ${m.metrics.before.lines} → ${m.metrics.after.lines}; survived pieces ${m.metrics.before.pieces} → ${m.metrics.after.pieces}.`;save();renderPanel();}if(m.type==='error')stopPractice(m.message);};trainer.onerror=e=>stopPractice(e.message);trainer.postMessage({type:'train',weights:practiceWeights(),skill:Progress.skill(data),seed:Date.now(),mode:data.mode});}
function stopPractice(message='Practice stopped. Existing weights kept.'){trainer?.terminate();trainer=null;training=false;$('trainingProgress').hidden=true;$('trainingStatus').textContent=message;renderPanel();}
function frame(now){const delta=Math.min(100,now-lastTime);lastTime=now;if(!paused){accumulator+=delta*data.speed;let steps=0;while(accumulator>=1000/60&&steps++<24){simulation(1000/60);accumulator-=1000/60;}}saveClock+=delta;if(saveClock>5000){save();saveClock=0;}update();draw();requestAnimationFrame(frame);}
async function init(){Progress.setTestUnlocks(window.desktop?await desktop.testUnlocks():false);try{data=Progress.sanitize(window.desktop?await desktop.load():JSON.parse(localStorage.getItem('falling-blocks')||localStorage.getItem(String.fromCharCode(102,97,110,107,117,97,105))||localStorage.getItem('tetris-idler')||'null'));}catch{data=Progress.fresh();}if(window.desktop)globalKeyboard=await desktop.keyboardStatus();start();$('speed').value=data.speed;
  const startupToggle=$('startWithWindows'),startupMessage=$('startupStatus');
  const showStartup=s=>{startupToggle.disabled=!s?.supported;startupToggle.checked=!!s?.enabled;startupMessage.textContent=s?.supported?(s.enabled?'The game will launch when you sign in to Windows.':'Launch the game when you sign in.'):'Windows startup is available in the desktop app.';};
  if(window.desktop?.startupStatus){try{showStartup(await desktop.startupStatus());}catch(e){startupMessage.textContent=`Could not read startup setting: ${e.message}`;}}else showStartup(null);
  startupToggle.onchange=async()=>{const enabled=startupToggle.checked;startupToggle.disabled=true;try{showStartup(await desktop.setStartup(enabled));if(startupToggle.checked!==enabled)startupMessage.textContent='Windows did not apply the startup setting. Check Startup apps in Windows Settings.';}catch(e){startupToggle.checked=!enabled;startupToggle.disabled=false;startupMessage.textContent=`Could not change startup setting: ${e.message}`;}};

  const acknowledge=()=>{if(game.acknowledgeClear()){collect();plan=null;pending=false;requestId++;$('event').textContent=game.last;save();update();draw();}};
  window.addEventListener('keydown',e=>{if(!e.repeat){if(!globalKeyboard){BoardDog.wag(performance.now());acknowledge();}}});window.desktop?.onKeystroke(acknowledge);window.desktop?.onDogKeystroke(()=>BoardDog.wag(performance.now()));
  window.addEventListener('mousedown',e=>{if([0,1,2].includes(e.button)){if(!globalKeyboard){BoardDog.wag(performance.now());acknowledge();}}});
  $('pause').onclick=()=>{paused=!paused;update();};window.desktop?.onPause(()=>{paused=!paused;update();});$('speed').onchange=()=>{data.speed=Number($('speed').value);save();};$('details').onclick=()=>{renderPanel();$('panel').showModal();};$('closePanel').onclick=()=>$('panel').close();$('menu').onclick=()=>window.desktop?desktop.menu():$('details').click();$('hide').onclick=()=>window.desktop?desktop.hide():$('pause').click();$('quit').onclick=async()=>{await save();window.desktop?.quit();};
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(t=>t.classList.toggle('selected',t===b));for(const name of ['training','skins','settings'])$(name+'Tab').hidden=name!==b.dataset.tab;});
  $('mode').onchange=()=>{if(!Progress.unlocked(data,$('mode').value)){$('mode').value=data.mode;return;}if(training)stopPractice();data.mode=$('mode').value;if(data.mode==='classic')data.skin='8bit';else if(data.skin==='8bit')data.skin='classic';start();save();};$('practice').onclick=runPractice;$('cancelPractice').onclick=()=>stopPractice();
  for(let level=0;level<=19;level++){const option=document.createElement('option');option.value=level;option.textContent=`Level ${level}`;$('classicLevel').append(option);}
  $('classicLevel').onchange=()=>{data.classicStartLevel=Number($('classicLevel').value);start();save();};
  window.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();window.desktop?.scale(e.deltaY<0?1.1:1/1.1);}},{passive:false});window.addEventListener('contextmenu',e=>{e.preventDefault();window.desktop?.menu();});window.addEventListener('beforeunload',()=>{save();trainer?.terminate();});
  if(data.training)$('trainingStatus').textContent=`Last practice: ${data.training.accepted?'improvement saved':'weights retained'} (${data.training.before.toFixed(1)} → ${data.training.after.toFixed(1)}).`;
  requestAnimationFrame(frame);
}
window.idlerDebug=()=>({mode:data.mode,score:game.score,pieces:game.pieces,lifetime:data.lifetime,over:game.over,won:!!game.won,paused,pending,waitingForKey:!!game.pendingClear,training,skill:Progress.skill(data)});
init();
