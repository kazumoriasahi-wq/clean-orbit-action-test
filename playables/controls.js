export const CHARGE_MS=420;
export const chargeProgress=ms=>Math.max(0,Math.min(1,ms/CHARGE_MS));
export function stickVector(x,z){const d=Math.hypot(x,z);if(d<=.12)return{x:0,z:0};const strength=Math.min(1,(d-.12)/.88);return{x:x/d*strength,z:z/d*strength};}
export class FixedClock{
 constructor(){this.reset();}
 reset(){this.accumulator=0;}
 advance(dt,step){this.accumulator+=Math.max(0,Math.min(.1,dt));let n=0;while(this.accumulator>=1/120&&n<12){step(1/120);this.accumulator-=1/120;n++;}return n;}
}
