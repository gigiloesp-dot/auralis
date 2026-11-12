const A=Math.SQRT1_2,B=A/2;
export const project=(x,y,height=0)=>({x:(x-y+height)*A,y:(x+y)*B});
export const unproject=(x,y,height=0)=>({x:(x/A-height+y/B)/2,y:(y/B-x/A+height)/2});
export const projectAngle=angle=>Math.atan2((Math.cos(angle)+Math.sin(angle))*B,(Math.cos(angle)-Math.sin(angle))*A);
export function screenDirection(x,y){const world=unproject(x,y,0),length=Math.hypot(world.x,world.y);return length?{x:world.x/length,y:world.y/length}:{x:0,y:0};}
