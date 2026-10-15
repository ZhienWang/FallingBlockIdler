const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const app=await electron.launch({executablePath:path.resolve(process.env.IDLER_TEST_EXECUTABLE||'node_modules/electron/dist/electron.exe'),args:process.env.IDLER_TEST_EXECUTABLE?['--test-profile']:['.','--test-profile'],env});const errors=[];let autoKeys,allowKeys=true,keyBusy=false;
  try{const page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>typeof game!=='undefined'&&game?.pieces>=3,{timeout:30000});
    assert.ok(await page.evaluate(()=>desktop.keyboardStatus()),'native desktop listener must start successfully');
    assert.equal(await page.title(),'Falling Blocks');assert.match(await page.locator('.brand').innerText(),/Falling Blocks/);assert.doesNotMatch(await page.locator('body').innerText(),/tetris/i);
    autoKeys=setInterval(async()=>{if(!allowKeys||keyBusy)return;keyBusy=true;try{if(await page.evaluate(()=>!!game.pendingClear))await page.keyboard.press('a');}catch{}finally{keyBusy=false;}},250);
    await page.locator('#pause').click();assert.ok((await page.evaluate(()=>window.idlerDebug())).paused);
    assert.equal(await page.evaluate(()=>data.mode),'classic');assert.equal(await page.locator('body').getAttribute('data-skin'),'8bit');
    await page.locator('#details').click();await page.locator('[data-tab="settings"]').click();
    assert.ok(await page.locator('#mode option[value="modern"]').evaluate(el=>el.disabled));assert.ok(await page.locator('#mode option[value="blind"]').evaluate(el=>el.disabled));
    await page.evaluate(()=>{Progress.earn(data,1000000000);update();});assert.equal(await page.locator('#mode option[value="modern"]').evaluate(el=>el.disabled),false);
    await page.locator('#mode').selectOption('modern');await page.locator('#closePanel').click();
    const geometry=await page.locator('.controls').boundingBox();assert.ok(geometry.y+geometry.height<=560,JSON.stringify(geometry));
    const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight,bodyWidth:document.body.scrollWidth,bodyHeight:document.body.scrollHeight}));assert.ok(viewport.width>=340&&viewport.height>=560,JSON.stringify(viewport));
    fs.mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/modern.png'});
    allowKeys=false;while(keyBusy)await page.waitForTimeout(25);
    // Isolate fixtures from unrelated physical desktop activity; handlers remain installed.
    await app.evaluate(({app})=>process.mainModule.require(app.getAppPath()+'/node_modules/uiohook-napi').uIOhook.stop());await page.evaluate(()=>{globalKeyboard=false;});await page.waitForTimeout(200);
    const completed=await page.evaluate(()=>{game=new FallingBlocks.Game({seed:1,waitForKey:true});game.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');game.active={...FallingBlocks.spawnPiece('I'),y:18};plan=null;pending=false;requestId++;game.lock();collect();update();draw();return {score:game.score,lifetime:data.lifetime,board:JSON.stringify(game.board)};});
    assert.equal(await page.locator('#topScore').innerText(),completed.score.toLocaleString());
    assert.ok(await page.evaluate(()=>!!game.pendingClear));await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>JSON.stringify(game.board)),completed.board);await page.screenshot({path:'artifacts/score-awaiting-key.png'});
    await page.keyboard.press('a');assert.equal(await page.evaluate(()=>!!game.pendingClear),false);assert.equal(await page.evaluate(()=>game.score),completed.score);assert.equal(await page.evaluate(()=>data.lifetime),completed.lifetime);
    // Dispatch through the native listener while the game is hidden: no renderer key event.
    await page.evaluate(()=>{start();game.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');game.active={...FallingBlocks.spawnPiece('I'),y:18};game.lock();collect();update();});
    await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].hide();});
    await app.evaluate(({app})=>{const hook=process.mainModule.require(app.getAppPath()+'/node_modules/uiohook-napi').uIOhook;hook.emit('keyup',{keycode:30});hook.emit('keydown',{keycode:30});hook.emit('keyup',{keycode:30});});
    await page.waitForFunction(()=>!game.pendingClear);
    for(const button of [1,2,3]){
      const score=await page.evaluate(()=>{start();game.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');game.active={...FallingBlocks.spawnPiece('I'),y:18};game.lock();collect();update();return game.score;});
      await page.waitForTimeout(100);
      assert.ok(await page.evaluate(()=>!!game.pendingClear));
      await app.evaluate(({app},button)=>process.mainModule.require(app.getAppPath()+'/node_modules/uiohook-napi').uIOhook.emit('mousedown',{button}),button);
      await page.waitForFunction(()=>!game.pendingClear);
      assert.equal(await page.evaluate(()=>game.score),score,'mouse clear must not award score twice');
    }
    await app.evaluate(({app,BrowserWindow})=>{process.mainModule.require(app.getAppPath()+'/node_modules/uiohook-napi').uIOhook.start();BrowserWindow.getAllWindows()[0].show();});await page.evaluate(()=>{globalKeyboard=true;});allowKeys=true;
    await page.locator('#details').click();await page.locator('[data-tab="settings"]').click();await page.locator('#mode').selectOption('classic');assert.equal((await page.evaluate(()=>window.idlerDebug())).mode,'classic');assert.equal(await page.locator('body').getAttribute('data-skin'),'8bit');await page.locator('#closePanel').click();await page.locator('#pause').click();await page.waitForFunction(()=>window.idlerDebug().pieces>=3,{timeout:30000});await page.locator('#pause').click();await page.screenshot({path:'artifacts/8bit.png'});
    await page.locator('#details').click();await page.locator('[data-tab="settings"]').click();await page.locator('#classicLevel').selectOption('18');assert.equal(await page.evaluate(()=>game.level),18);assert.equal(await page.evaluate(()=>data.classicStartLevel),18);await page.locator('#closePanel').click();await page.locator('#speed').selectOption('4');
    const classicBaseline=await page.evaluate(()=>data.stats.pieces);await page.locator('#pause').click();await page.waitForFunction(baseline=>data.stats.pieces>=baseline+20,classicBaseline,{timeout:60000});await page.locator('#pause').click();assert.equal(await page.evaluate(()=>game.queue.length),1);await page.screenshot({path:'artifacts/8bit-level18.png'});
    await page.locator('#speed').selectOption('1');
    await page.evaluate(()=>{data.lifetime=10000000000;data.wallet=100000000;update();});await page.locator('#details').click();await page.locator('[data-tab="training"]').click();const modernWeights=await page.evaluate(()=>JSON.stringify(data.weights));await page.locator('.skill button').first().click();assert.equal((await page.evaluate(()=>window.idlerDebug())).skill,1);await page.waitForFunction(()=>!window.idlerDebug().training,null,{timeout:120000});assert.ok(await page.evaluate(()=>data.training));assert.equal(await page.evaluate(()=>data.training.mode),'classic');assert.equal(await page.evaluate(()=>JSON.stringify(data.weights)),modernWeights);
    await page.locator('[data-tab="skins"]').click();for(const id of ['handheld','terminal','sunset']){await page.locator('.skin').filter({has:page.locator('strong',{hasText:ProgressSkinName(id)})}).click();assert.equal(await page.locator('body').getAttribute('data-skin'),id);assert.equal(await page.evaluate(()=>data.mode),'classic');await page.locator('#closePanel').click();await page.screenshot({path:'artifacts/'+id+'.png'});await page.locator('#details').click();}
    await page.locator('[data-tab="settings"]').click();await page.locator('#mode').selectOption('blind');await page.locator('#closePanel').click();assert.equal((await page.evaluate(()=>window.idlerDebug())).mode,'blind');
    const visibility=await page.evaluate(()=>{game.board[19][0]='J';game.active={type:'O',x:3,y:0,r:0};draw();const hidden=$('board').getContext('2d').getImageData(10,390,1,1).data[3];game.over=true;draw();const shown=$('board').getContext('2d').getImageData(10,390,1,1).data[3];return {hidden,shown};});assert.equal(visibility.hidden,0);assert.equal(visibility.shown,255);await page.screenshot({path:'artifacts/blind-reveal.png'});
    await page.evaluate(()=>{game.over=true;paused=false;restart=2900;});await page.waitForFunction(()=>!window.idlerDebug().over,{timeout:10000});
    await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.webContents.send('toggle-pause');});await page.waitForFunction(()=>window.idlerDebug().paused);
    await app.evaluate(({ipcMain,BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];ipcMain.emit('scale',{sender:w.webContents},1.5);});assert.ok(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.getZoomFactor()>1));
    assert.deepEqual(errors,[]);console.log('UI PASS: NES default, lifetime mode unlocks, three new skins, separate Classic practice, desktop input clearing, autonomous modern/classic play, NES frame controls, level 18 at 4x speed, pause, layout, skins, purchase, real practice, blind rendering, restart, tray pause, scale.');console.log(JSON.stringify(await page.evaluate(()=>window.idlerDebug())));
  }finally{clearInterval(autoKeys);await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
function ProgressSkinName(id){return {handheld:'Handheld',terminal:'Terminal',sunset:'Sunset'}[id];}
