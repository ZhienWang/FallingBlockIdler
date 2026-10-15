const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({executablePath:path.resolve('node_modules/electron/dist/electron.exe'),args:['.','--test-profile'],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>typeof game!=='undefined'&&game);
    await app.evaluate(({app})=>process.mainModule.require(app.getAppPath()+'/node_modules/uiohook-napi').uIOhook.stop());await page.evaluate(()=>{globalKeyboard=false;});
    for(const mode of ['doctor','puyo','fighter']){
      await page.locator('#details').click();await page.locator('[data-tab="settings"]').click();await page.locator('#mode').selectOption(mode);assert.equal(await page.locator('#practice').isDisabled(),true);await page.locator('#closePanel').click();await page.locator('#speed').selectOption('4');
      await page.waitForFunction(()=>!!game.pendingClear,null,{timeout:30000});const before=await page.evaluate(()=>({score:game.score,board:JSON.stringify(game.board)}));await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>({score:game.score,board:JSON.stringify(game.board)})),before);
      await page.keyboard.press('a');assert.ok(await page.evaluate(score=>game.score>score,before.score));
      await page.waitForFunction(()=>!!game.pendingClear,null,{timeout:30000});const score=await page.evaluate(()=>game.score);await page.mouse.click(100,80);assert.ok(await page.evaluate(before=>game.score>before,score));
      await page.locator('#pause').click();const pieces=await page.evaluate(()=>game.pieces);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>game.pieces),pieces);await page.locator('#pause').click();
      await page.evaluate(()=>{game.over=true;restart=2990;});await page.waitForFunction(()=>!game.over);assert.equal(await page.evaluate(()=>data.mode),{doctor:'puyo',puyo:'fighter',fighter:'suika'}[mode]);
    }
    await page.locator('#details').click();await page.locator('#mode').selectOption('classic');await page.locator('#closePanel').click();await page.waitForFunction(()=>game.pieces>=2,null,{timeout:30000});assert.deepEqual(errors,[]);
    console.log('PASS: all three games switch, autoplay, keyboard and mouse clear, pause, restart, and return to Falling Blocks without renderer errors.');
  }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
