(function(root){
  'use strict';
  const T=typeof module!=='undefined'?require('./engine.js'):root.FallingBlocks;
  const AI=typeof module!=='undefined'?require('./ai.js'):root.IdlerAI;
  function mutate(weights,random){const candidate={...weights};for(const k of Object.keys(candidate)){const span=Math.max(.2,Math.abs(candidate[k])*.25);candidate[k]=Math.max(-30,Math.min(30,candidate[k]+(random()*2-1)*span));}return candidate;}
  function train({weights,skill,seed,mode='modern'},progress=()=>{},benchmark=AI.benchmark){
    mode=mode==='classic'?'classic':'modern';
    const random=T.rng(seed),used=new Set();
    const pick=()=>{let value;do{value=Math.floor(random()*0x7fffffff);}while(used.has(value));used.add(value);return value;};
    const trainSeeds=Array.from({length:2},pick),validation=Array.from({length:3},pick);
    const original={...weights};let best={...original},bestResult=benchmark(best,skill,trainSeeds,35,mode);progress(10);
    for(let i=0;i<6;i++){const candidate=mutate(best,random),result=benchmark(candidate,skill,trainSeeds,35,mode);if(result.fitness>bestResult.fitness){best=candidate;bestResult=result;}progress(20+i*10);}
    const before=benchmark(original,skill,validation,50,mode);progress(85);
    const after=benchmark(best,skill,validation,50,mode),accepted=after.fitness>before.fitness&&after.pieces>=before.pieces&&after.lines>=before.lines;progress(100);
    return {weights:accepted?best:original,result:{before:before.fitness,after:after.fitness,accepted,mode,date:new Date().toISOString()},metrics:{before,after}};
  }
  const api={mutate,train};if(typeof module!=='undefined')module.exports=api;else root.IdlerTraining=api;
})(typeof self!=='undefined'?self:globalThis);
