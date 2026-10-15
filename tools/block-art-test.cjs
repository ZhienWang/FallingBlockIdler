const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({executablePath:path.resolve('node_modules/electron/dist/electron.exe'),args:['.','--test-profile'],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.waitForFunction(()=>typeof data!=='undefined'&&!!game);
    await page.evaluate(()=>{paused=true;data.lifetime=99000000;});
    await page.locator('#details').click();await page.locator('[data-tab="skins"]').click();
    for(const id of ['candy','mosaic','crystal','circuit','starlight','meadow','woodland','ivy']){
      const card=page.locator(`.skin[data-skin="${id}"]`);assert.ok(await card.isDisabled());
      await page.evaluate(id=>{data.lifetime=Progress.SKINS.find(s=>s.id===id).at;renderPanel();},id);
      await card.click();assert.equal(await page.locator('body').getAttribute('data-skin'),id);
      assert.equal(await page.evaluate(()=>Progress.sanitize(data).skin),id);
      await page.evaluate(()=>{draw();data.lifetime=99000000;renderPanel();});
    }
    await page.evaluate(()=>{data.lifetime=10000000000;renderPanel();});
    await page.locator('.skin[data-skin="candy"]').click();
    await page.locator('.skin[data-skin="candy"]').scrollIntoViewIfNeeded();
    await page.screenshot({path:'artifacts/block-art-unlocks.png'});
    assert.deepEqual(errors,[]);console.log('PASS: all block arts lock, unlock, render, select and survive saves.');
  }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
