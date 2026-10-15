const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({executablePath:require('node:path').resolve('node_modules/electron/dist/electron.exe'),args:['.','--test-profile'],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.waitForFunction(()=>typeof game!=='undefined'&&game);await page.evaluate(()=>{globalKeyboard=false;});
    await page.locator('#details').click();await page.locator('[data-tab="settings"]').click();await page.locator('#mode').selectOption('suika');await page.locator('#closePanel').click();
    await page.locator('#speed').selectOption('4');await page.waitForFunction(()=>!!game.pendingClear,null,{timeout:30000});
    const score=await page.evaluate(()=>game.score);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>game.score),score);
    await page.keyboard.press('a');assert.ok(await page.evaluate(before=>game.score>before,score));
    await page.waitForFunction(()=>!!game.pendingClear,null,{timeout:30000});await page.mouse.click(100,80);assert.equal(await page.evaluate(()=>!!game.pendingClear),false);
    assert.equal(await page.locator('#modeTag').textContent(),'SUIKA');assert.equal(await page.locator('#linesLabel').textContent(),'MERGES');
    await page.locator('#pause').click();const pieces=await page.evaluate(()=>game.pieces);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>game.pieces),pieces);
    await page.evaluate(()=>save());assert.equal(await app.evaluate(({app})=>process.mainModule.require(app.getAppPath()+'/src/storage.cjs').load(require('node:path').join(app.getPath('userData'),'progress.json')).mode),'suika');
    await page.locator('#details').click();await page.locator('#mode').selectOption('classic');await page.locator('#closePanel').click();assert.equal(await page.evaluate(()=>game.mode),'classic');
    await page.locator('#pause').click();await page.waitForFunction(()=>game.pieces>=2,null,{timeout:30000});assert.deepEqual(errors,[]);
    console.log('PASS: Suika switch, AI drops and merges, pause, saved selection, return to Falling Blocks.');
  }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
