(function(root){
  'use strict';
  const PALETTES={meadow:['#689fac','#8a89b2','#d69b75','#c5aa61','#7eaa82','#b48ea9','#cb8792'],woodland:['#508f93','#72869e','#b48661','#afa060','#63947c','#9784a8','#b47878'],ivy:['#408b89','#708ba3','#ae895a','#a8a457','#67995b','#9382aa','#b27883'],candy:['#69e5ec','#97aaff','#ffb98d','#ffe892','#9ce6bc','#e3a5ff','#ff91b3'],crystal:['#72e7ff','#8aa8ff','#ffc18a','#fff0a0','#8ff0d0','#c7a0ff','#ff9cce'],circuit:['#42ffe3','#729cff','#ffb359','#f6ed6b','#8dff75','#d88cff','#ff759a'],mosaic:['#57bfc7','#6a8ad4','#e49d65','#e2c875','#85bb91','#ad8dcc','#d67f90'],starlight:['#78d9ff','#919cff','#e6b1ff','#ffe3a3','#8de2cf','#cf9cff','#ffabd4']};
  const TYPES=['I','J','L','O','S','T','Z'];
  function paint(ctx,x,y,size,type,skin,color,ghost=false){
    const c=PALETTES[skin]?.[TYPES.indexOf(type)]||color;
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=ghost?.2:1;
    const edge=1,w=size-2;
    if(['meadow','woodland','ivy'].includes(skin)){
      const botanical=ctx.createLinearGradient(0,0,size,size);botanical.addColorStop(0,'#f9e6bf');botanical.addColorStop(.25,c);botanical.addColorStop(1,'#394d3b');
      ctx.fillStyle=botanical;ctx.beginPath();ctx.roundRect(1,1,w,w,size*.14);ctx.fill();
      ctx.strokeStyle='#3d302955';ctx.lineWidth=.7;ctx.stroke();
      ctx.fillStyle='#ffffff22';ctx.fillRect(2,2,size-4,2);
      if(skin==='meadow'){
        ctx.fillStyle='#fff2dc';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.ellipse(size*.5+Math.cos(a)*size*.17,size*.5+Math.sin(a)*size*.17,size*.13,size*.1,a,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle='#e9b44f';ctx.beginPath();ctx.arc(size*.5,size*.5,size*.09,0,Math.PI*2);ctx.fill();
      }else if(skin==='woodland'){
        ctx.fillStyle='#49392d';ctx.fillRect(size*.46,size*.57,size*.09,size*.25);
        ctx.fillStyle='#eff5cf';ctx.beginPath();ctx.moveTo(size*.5,size*.16);ctx.lineTo(size*.24,size*.62);ctx.lineTo(size*.76,size*.62);ctx.closePath();ctx.fill();
        ctx.fillStyle='#c7dfad';ctx.beginPath();ctx.moveTo(size*.5,size*.35);ctx.lineTo(size*.2,size*.73);ctx.lineTo(size*.8,size*.73);ctx.closePath();ctx.fill();
      }else{
        ctx.strokeStyle='#f1f4bf';ctx.lineWidth=Math.max(1,size*.065);ctx.beginPath();ctx.moveTo(size*.25,size*.8);ctx.quadraticCurveTo(size*.7,size*.55,size*.64,size*.2);ctx.stroke();
        ctx.fillStyle='#d3edac';for(const [lx,ly,a]of [[.36,.59,-.6],[.66,.46,.6]]){ctx.beginPath();ctx.ellipse(size*lx,size*ly,size*.17,size*.08,a,0,Math.PI*2);ctx.fill();}
      }
    }else if(skin==='candy'){
      const g=ctx.createLinearGradient(0,0,size,size);g.addColorStop(0,'#fff5ff');g.addColorStop(.35,c);g.addColorStop(1,'#49335f');ctx.fillStyle=g;
      ctx.beginPath();ctx.roundRect(edge,edge,w,w,size*.22);ctx.fill();ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.roundRect(3,3,size-6,size*.23,2);ctx.fill();
    }else if(skin==='crystal'){
      ctx.fillStyle=c;ctx.fillRect(edge,edge,w,w);
      ctx.fillStyle='#ffffff88';ctx.beginPath();ctx.moveTo(1,1);ctx.lineTo(size-1,1);ctx.lineTo(size*.52,size*.46);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffffff33';ctx.beginPath();ctx.moveTo(1,1);ctx.lineTo(size*.52,size*.46);ctx.lineTo(1,size-1);ctx.closePath();ctx.fill();
      ctx.fillStyle='#19295777';ctx.beginPath();ctx.moveTo(size-1,1);ctx.lineTo(size-1,size-1);ctx.lineTo(1,size-1);ctx.lineTo(size*.52,size*.46);ctx.closePath();ctx.fill();
    }else if(skin==='circuit'){
      ctx.fillStyle='#102b30';ctx.fillRect(edge,edge,w,w);ctx.strokeStyle=c;ctx.lineWidth=1;ctx.strokeRect(1.5,1.5,size-3,size-3);
      ctx.beginPath();ctx.moveTo(size*.25,1);ctx.lineTo(size*.25,size*.45);ctx.lineTo(size*.65,size*.45);ctx.lineTo(size*.65,size-1);ctx.stroke();ctx.fillStyle=c;ctx.fillRect(size*.25-1,size*.45-1,3,3);ctx.fillRect(size*.65-1,size*.7-1,3,3);
    }else if(skin==='mosaic'){
      ctx.fillStyle='#28333e';ctx.fillRect(edge,edge,w,w);const gap=size*.1,tile=(size-gap*3)/2;
      for(let row=0;row<2;row++)for(let col=0;col<2;col++){ctx.fillStyle=c;ctx.fillRect(gap+col*(tile+gap),gap+row*(tile+gap),tile,tile);ctx.fillStyle=(row+col)%2?'#00000022':'#ffffff44';ctx.fillRect(gap+col*(tile+gap),gap+row*(tile+gap),tile,tile);}
    }else if(skin==='starlight'){
      const g=ctx.createLinearGradient(0,0,size,size);g.addColorStop(0,'#38437a');g.addColorStop(1,'#131b38');ctx.fillStyle=g;ctx.fillRect(edge,edge,w,w);ctx.strokeStyle=c;ctx.strokeRect(1.5,1.5,size-3,size-3);
      ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(size*.52,size*.22);ctx.lineTo(size*.6,size*.43);ctx.lineTo(size*.8,size*.52);ctx.lineTo(size*.6,size*.6);ctx.lineTo(size*.52,size*.81);ctx.lineTo(size*.44,size*.6);ctx.lineTo(size*.23,size*.52);ctx.lineTo(size*.44,size*.43);ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(size*.22,size*.2,1,1);ctx.fillRect(size*.78,size*.76,1,1);
    }else{
      ctx.fillStyle=c;ctx.fillRect(1,1,w,w);ctx.fillStyle='#ffffff55';ctx.fillRect(2,2,size-4,2);ctx.fillStyle='#00000033';ctx.fillRect(2,size-4,size-4,2);if(skin==='8bit'){ctx.strokeStyle='#ffffffaa';ctx.strokeRect(3,3,size-6,size-6);}
    }
    ctx.restore();
  }
  const api={PALETTES,paint};if(typeof module!=='undefined')module.exports=api;else root.BlockArt=api;
})(typeof self!=='undefined'?self:globalThis);
