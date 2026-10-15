const {app,BrowserWindow,ipcMain,Tray,Menu,nativeImage,screen}=require('electron');
const path=require('node:path');
const storage=require('./storage.cjs');
const legacySaveId=String.fromCharCode(102,97,110,107,117,97,105);
const {uIOhook}=require('uiohook-napi');
const heldKeys=new Set();let awaitingKeystroke=false,keyboardAvailable=false;
let win,tray,data,saveFile,quitting=false;
app.setPath('userData',path.join(app.getPath('appData'),'falling-blocks'));
const smoke=process.argv.includes('--smoke-test');
const testMode=smoke||process.argv.includes('--test-profile');
if(testMode)app.setPath('userData',path.join(app.getPath('temp'),'falling-blocks-tests',String(process.pid)));
const unlockAll=process.argv.includes('--unlock-all');
const startup=require('./startup.cjs').createStartup(app,{testMode,unlockAll});
require('./progression.js').setTestUnlocks(unlockAll);
const width=340,height=560;
function persist(){if(!smoke)storage.save(saveFile,data);}
function bounds(scale){const area=screen.getDisplayMatching(win?win.getBounds():screen.getPrimaryDisplay().workArea).workArea;const s=Math.min(scale,area.width/width,area.height/height);return {width:Math.round(width*s),height:Math.round(height*s),scale:s,area};}
function applyScale(value){const requested=Math.max(.5,Math.min(3,value)),b=bounds(requested),old=win.getBounds();data.scale=b.scale;win.setBounds({x:Math.max(b.area.x,Math.min(old.x,b.area.x+b.area.width-b.width)),y:Math.max(b.area.y,Math.min(old.y+old.height-b.height,b.area.y+b.area.height-b.height)),width:b.width,height:b.height});win.webContents.setZoomFactor(b.scale);persist();}
function menu(){return Menu.buildFromTemplate([{label:'Show',click:()=>win.showInactive()},{label:'Pause / resume',click:()=>win.webContents.send('toggle-pause')},{label:'Always on top',type:'checkbox',checked:data.pin,click:item=>{data.pin=item.checked;win.setAlwaysOnTop(data.pin);persist();}},{label:'Size',submenu:[.5,.75,1,1.5,2,3].map(scale=>({label:`${scale*100}%`,click:()=>applyScale(scale)}))},{label:'Reset position',click:()=>{const a=screen.getPrimaryDisplay().workArea;win.setPosition(a.x+a.width-win.getBounds().width-16,a.y+a.height-win.getBounds().height-16);}},{label:'Hide to tray',click:()=>win.hide()},{type:'separator'},{label:'Quit',click:()=>app.quit()}]);}
if(!app.requestSingleInstanceLock())app.quit();else{
  app.on('second-instance',()=>win?.showInactive());
  app.whenReady().then(()=>{
    saveFile=path.join(app.getPath('userData'),'progress.json');data=testMode?require('./progression.js').fresh():storage.load(saveFile,[path.join(app.getPath('appData'),legacySaveId,'progress.json'),path.join(app.getPath('appData'),'tetris-idler','progress.json')]);
    const area=screen.getPrimaryDisplay().workArea,b=bounds(data.scale),pos=data.position;
    const onScreen=pos&&screen.getAllDisplays().some(d=>pos.x>=d.workArea.x&&pos.y>=d.workArea.y&&pos.x+b.width<=d.workArea.x+d.workArea.width&&pos.y+b.height<=d.workArea.y+d.workArea.height);
    win=new BrowserWindow({width:b.width,height:b.height,x:onScreen?pos.x:area.x+area.width-b.width-16,y:onScreen?pos.y:area.y+area.height-b.height-16,frame:false,resizable:false,alwaysOnTop:data.pin,skipTaskbar:true,show:false,backgroundColor:'#111720',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,zoomFactor:b.scale}});
    win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
    win.on('ready-to-show',()=>win.showInactive());win.on('move',()=>{const b=win.getBounds();data.position={x:b.x,y:b.y};});
    win.on('close',e=>{if(!quitting){e.preventDefault();win.hide();}});
    win.webContents.on('did-finish-load',()=>win.webContents.setZoomFactor(b.scale));
    win.loadFile(path.join(__dirname,'index.html'));
    const icon=nativeImage.createFromPath(path.join(__dirname,'..','assets','icon.png'));win.setIcon(icon);tray=new Tray(icon);tray.setToolTip('Falling Blocks');tray.on('click',()=>win.showInactive());tray.on('right-click',()=>tray.popUpContextMenu(menu()));
    const allowed=e=>e.sender===win.webContents;
    ipcMain.on('waiting-for-key',(e,waiting)=>{if(allowed(e))awaitingKeystroke=waiting===true;});
    ipcMain.handle('test-unlocks',e=>allowed(e)&&unlockAll);
    ipcMain.handle('keyboard-status',e=>allowed(e)&&keyboardAvailable);
    ipcMain.handle('startup-status',e=>allowed(e)?startup.status():null);
    ipcMain.handle('startup-set',(e,enabled)=>{if(!allowed(e))return null;return startup.set(enabled);});
    uIOhook.on('keydown',event=>{if(heldKeys.has(event.keycode))return;heldKeys.add(event.keycode);if(win&&!win.isDestroyed())win.webContents.send('dog-keystroke');if(awaitingKeystroke){awaitingKeystroke=false;win.webContents.send('player-keystroke');}});
    uIOhook.on('keyup',event=>heldKeys.delete(event.keycode));
    uIOhook.on('mousedown',event=>{if(![1,2,3].includes(event.button)||!win||win.isDestroyed())return;win.webContents.send('dog-keystroke');if(awaitingKeystroke){awaitingKeystroke=false;win.webContents.send('player-keystroke');}});
    try{uIOhook.start();keyboardAvailable=true;}catch(error){console.error('Desktop keystroke listener failed:',error.message);}
    ipcMain.handle('load',e=>allowed(e)?data:null);
    ipcMain.handle('save',(e,input)=>{if(!allowed(e))return false;const scale=data.scale,position=data.position,pin=data.pin;data={...require('./progression.js').sanitize(input),scale,position,pin};persist();return true;});
    ipcMain.on('scale',(e,factor)=>{if(allowed(e)&&Number.isFinite(factor)&&factor>.5&&factor<2)applyScale(data.scale*factor);});
    ipcMain.on('menu',e=>{if(allowed(e))menu().popup({window:win});});ipcMain.on('hide',e=>{if(allowed(e))win.hide();});
    ipcMain.on('quit',e=>{if(allowed(e))app.quit();});
    setInterval(persist,10000).unref();
    if(smoke){win.webContents.on('console-message',(_e,...args)=>console.log('renderer:',...args));setTimeout(async()=>{try{console.log('SMOKE',JSON.stringify(await win.webContents.executeJavaScript('window.idlerDebug()')));}catch(e){console.error(e);}app.quit();},15000);}
  });app.on('before-quit',()=>{quitting=true;uIOhook.stop();heldKeys.clear();if(data)persist();});
}
