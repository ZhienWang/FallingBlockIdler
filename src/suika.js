(function(root){
  'use strict';
  const FRUITS=[['Cherry',7,'#ed5572'],['Strawberry',10,'#ff777c'],['Grape',14,'#b789df'],['Orange',18,'#ffac50'],['Persimmon',23,'#f98647'],['Apple',29,'#ef6561'],['Pear',35,'#cadd71'],['Peach',42,'#ffb9ac'],['Pineapple',49,'#e9c65b'],['Melon',57,'#a5d583'],['Watermelon',66,'#66b88b']];
  class Game{
    constructor({seed=Date.now()}={}){this.seed=seed>>>0;this.fruits=[];this.score=0;this.lines=0;this.level=1;this.pieces=0;this.over=false;this.events=[];this.clock=0;this.danger=0;this.next=this.random();this.queue=[this.random()];this.pendingClear=null;this.target=100;this.last='Ready to merge';}
    random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed%5;}
    acknowledgeClear(){
      if(!this.pendingClear||this.over)return false;
      const {a,b}=this.pendingClear;this.pendingClear=null;
      const i=this.fruits.indexOf(a),j=this.fruits.indexOf(b);if(i<0||j<0)return false;
      const tier=a.tier+1,points=(tier+1)*(tier+2)/2;
      const merged={tier,x:(a.x+b.x)/2,y:(a.y+b.y)/2,vx:(a.vx+b.vx)/2,vy:Math.min(0,(a.vy+b.vy)/2),age:Math.min(a.age,b.age)};
      this.fruits.splice(j,1);this.fruits.splice(i,1,merged);
      const r=FRUITS[tier][1];merged.x=Math.max(r+2,Math.min(198-r,merged.x));merged.y=Math.min(398-r,merged.y);
      this.score+=points;this.lines++;this.level=Math.max(this.level,tier+1);this.last=FRUITS[tier][0]+' merge +'+points;this.events.push({points,label:this.last});if(tier===10){this.won=true;this.over=true;this.last='Watermelon reached!';}return true;
    }
    drop(x){if(this.over||this.pendingClear)return false;const r=FRUITS[this.next][1];this.fruits.push({tier:this.next,x:Math.max(r+2,Math.min(198-r,x)),y:25,vx:0,vy:0,age:0});this.pieces++;this.next=this.queue.shift();this.queue.push(this.random());return true;}
    choose(){
      const r=FRUITS[this.next][1];let best=-Infinity,target=100;
      for(let x=r+3;x<=197-r;x+=5){let y=398-r;
        for(const f of this.fruits){const sum=r+FRUITS[f.tier][1],dx=x-f.x;if(Math.abs(dx)<sum)y=Math.min(y,f.y-Math.sqrt(sum*sum-dx*dx));}
        let value=y*.8-Math.abs(x-100)*.025;
        for(const f of this.fruits){const distance=Math.hypot(x-f.x,y-f.y),sum=r+FRUITS[f.tier][1];if(f.tier===this.next)value+=Math.max(0,1-(distance-sum)/25)*100;}
        if(y<65)value-=300;if(value>best){best=value;target=x;}
      }return target;
    }
    tick(ms,auto=true){if(this.over||this.pendingClear)return;const dt=Math.min(ms,1000/60)/1000;this.clock+=ms;
      for(const f of this.fruits){f.age+=ms;f.vy+=360*dt;f.vx*=.995;f.x+=f.vx*dt;f.y+=f.vy*dt;}
      for(let pass=0;pass<6;pass++){
        for(const f of this.fruits){const r=FRUITS[f.tier][1];if(f.x<r+2){f.x=r+2;f.vx=Math.abs(f.vx)*.2;}if(f.x>198-r){f.x=198-r;f.vx=-Math.abs(f.vx)*.2;}if(f.y>398-r){f.y=398-r;f.vy=-Math.abs(f.vy)*.12;f.vx*=.9;}}
        for(let i=0;i<this.fruits.length;i++)for(let j=i+1;j<this.fruits.length;j++){
          const a=this.fruits[i],b=this.fruits[j],ra=FRUITS[a.tier][1],rb=FRUITS[b.tier][1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),sum=ra+rb;if(d>=sum)continue;
          if(a.tier===b.tier&&a.tier<10){this.pendingClear={a,b};return;}
          const nx=d>0?dx/d:1,ny=d>0?dy/d:0,overlap=sum-d,ma=ra*ra,mb=rb*rb,wa=mb/(ma+mb),wb=1-wa;
          a.x-=nx*overlap*wa;b.x+=nx*overlap*wb;a.y-=ny*overlap*wa;b.y+=ny*overlap*wb;
          const velocity=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(velocity<0){const impulse=-velocity*1.1;a.vx-=impulse*nx*wa;a.vy-=impulse*ny*wa;b.vx+=impulse*nx*wb;b.vy+=impulse*ny*wb;}
        }
      }
      for(const f of this.fruits){const r=FRUITS[f.tier][1];f.x=Math.max(r+2,Math.min(198-r,f.x));f.y=Math.min(398-r,f.y);}
      this.danger=this.fruits.some(f=>f.age>1800&&f.y-FRUITS[f.tier][1]<48)?this.danger+ms:0;if(this.danger>=1800){this.over=true;return;}
      if(auto&&this.clock>=1000){this.target=this.choose();this.drop(this.target);this.clock=0;}
    }
  }
  function fruit(ctx,tier,x,y,r=FRUITS[tier][1]){const color=FRUITS[tier][2];ctx.save();const g=ctx.createRadialGradient(x-r*.3,y-r*.4,1,x,y,r);g.addColorStop(0,'#fff1d4');g.addColorStop(.35,color);g.addColorStop(1,color);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#00000025';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#55784b';ctx.beginPath();ctx.ellipse(x+2,y-r+2,r*.25,r*.1,-.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#382b36';for(const side of [-1,1]){ctx.beginPath();ctx.arc(x+side*r*.24,y,r*.06+ .6,0,Math.PI*2);ctx.fill();}ctx.beginPath();ctx.arc(x,y+r*.12,r*.17,0,Math.PI);ctx.strokeStyle='#382b36';ctx.stroke();ctx.restore();}
  const api={Game,FRUITS,fruit};if(typeof module!=='undefined')module.exports=api;else root.Suika=api;
})(typeof self!=='undefined'?self:globalThis);
