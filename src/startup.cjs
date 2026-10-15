'use strict';
function createStartup(app,{platform=process.platform,executable=process.execPath,testMode=false,unlockAll=false}={}){
  const supported=platform==='win32'&&!testMode;
  const options={path:executable,args:app.isPackaged?[]:[`"${app.getAppPath()}"`]};
  if(unlockAll)options.args.push('--unlock-all');
  function status(){if(!supported)return {supported:false,enabled:false};const s=app.getLoginItemSettings(options);return {supported:true,enabled:s.openAtLogin===true&&s.executableWillLaunchAtLogin!==false};}
  function set(enabled){if(typeof enabled!=='boolean')throw new TypeError('Startup setting must be a boolean.');if(!supported)return status();app.setLoginItemSettings({...options,name:'Falling Blocks',openAtLogin:enabled,enabled});return status();}
  return {status,set};
}
module.exports={createStartup};
