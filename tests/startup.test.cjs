const {test}=require('node:test'),assert=require('node:assert/strict');
const {createStartup}=require('../src/startup.cjs');
function fixture(isPackaged=false){let saved;return {app:{isPackaged,getAppPath:()=> 'C:\\My Games\\Falling Blocks',getLoginItemSettings:()=>({openAtLogin:!!saved?.openAtLogin,executableWillLaunchAtLogin:!!saved?.enabled}),setLoginItemSettings:s=>saved=s},saved:()=>saved};}
test('startup toggle registers correct source launch and removes registration',()=>{
  const f=fixture(),s=createStartup(f.app,{platform:'win32',executable:'C:\\Game\\electron.exe',unlockAll:true});
  assert.equal(s.status().enabled,false);assert.equal(s.set(true).enabled,true);assert.deepEqual(f.saved().args,['"C:\\My Games\\Falling Blocks"','--unlock-all']);assert.equal(f.saved().name,'Falling Blocks');assert.equal(s.set(false).enabled,false);assert.equal(f.saved().openAtLogin,false);
});
test('packaged game launches executable without source path',()=>{const f=fixture(true);createStartup(f.app,{platform:'win32'}).set(true);assert.deepEqual(f.saved().args,[]);});
test('test profiles and other platforms cannot change real startup settings',()=>{for(const options of [{platform:'win32',testMode:true},{platform:'linux'}]){const f=fixture(),s=createStartup(f.app,options);assert.deepEqual(s.set(true),{supported:false,enabled:false});assert.equal(f.saved(),undefined);}});
test('startup rejects invalid renderer values',()=>{const f=fixture(),s=createStartup(f.app,{platform:'win32'});assert.throws(()=>s.set('true'),TypeError);assert.equal(f.saved(),undefined);});
