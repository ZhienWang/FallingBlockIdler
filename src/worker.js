importScripts('engine.js','progression.js','ai.js','training.js');
self.onmessage=({data})=>{
  try{
    if(data.type==='plan'){const plan=IdlerAI.choose(data.state,data.skill,data.weights);postMessage({type:'plan',id:data.id,plan});return;}
    if(data.type==='train'){
      postMessage({type:'trained',...IdlerTraining.train(data,value=>postMessage({type:'progress',value}))});
    }
  }catch(e){postMessage({type:'error',message:e.message,id:data.id});}
};
