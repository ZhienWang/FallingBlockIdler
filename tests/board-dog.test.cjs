const {test}=require('node:test'),assert=require('node:assert/strict');
const Dog=require('../src/board-dog.js');
function tailAngle(now){
  let angle;const ctx=new Proxy({}, {get:(_,key)=>key==='rotate'?value=>{angle=value;}:()=>{}});
  Dog.draw(ctx,now);return angle;
}
test('dog rests, wags after input, extends its wag on more input, then settles',()=>{
  assert.equal(tailAngle(0),0);
  Dog.wag(100);assert.notEqual(tailAngle(200),0);
  Dog.wag(1000);assert.notEqual(tailAngle(1300),0);
  assert.equal(tailAngle(2100),0);
});
