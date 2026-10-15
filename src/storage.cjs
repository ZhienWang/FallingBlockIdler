const fs=require('node:fs');
const path=require('node:path');
const {sanitize}=require('./progression.js');
function load(file,legacyFile){if(legacyFile&&!fs.existsSync(file)&&!fs.existsSync(file+'.bak')){for(const legacy of [].concat(legacyFile)){if(fs.existsSync(legacy)||fs.existsSync(legacy+'.bak'))return load(legacy);}}for(const candidate of [file,file+'.bak']){try{return sanitize(JSON.parse(fs.readFileSync(candidate,'utf8')));}catch{}}return sanitize(null);}
function save(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});const clean=sanitize(data),tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(clean,null,2));if(fs.existsSync(file)){try{JSON.parse(fs.readFileSync(file,'utf8'));fs.copyFileSync(file,file+'.bak');}catch{}}fs.renameSync(tmp,file);return clean;}
module.exports={load,save};
