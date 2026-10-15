(function(root){
  'use strict';
  let wagUntil=0;
  const sprite=typeof Image!=='undefined'?new Image():null;
  if(sprite)sprite.src='../assets/corgi-sprite.png';
  function wag(now){wagUntil=now+1100;}
  function draw(ctx,now){
    const swing=now<wagUntil?Math.sin(now*.027)*.45:0;
    const ready=sprite?.complete&&sprite.naturalWidth>0;
    ctx.save();ctx.globalAlpha=.38;
    // Anchor the separate tail behind the left hip.
    ctx.save();ctx.translate(49,276);ctx.rotate(swing);ctx.scale(-1,1);
    if(ready)ctx.drawImage(sprite,sprite.naturalWidth*.25,sprite.naturalHeight*.82,sprite.naturalWidth*.48,sprite.naturalHeight*.18,0,-12,56,24);
    ctx.restore();
    if(ready)ctx.drawImage(sprite,0,0,sprite.naturalWidth,sprite.naturalHeight*.82,8,155,184,151);
    ctx.restore();
  }
  const api={wag,draw};if(typeof module!=='undefined')module.exports=api;else root.BoardDog=api;
})(typeof self!=='undefined'?self:globalThis);
