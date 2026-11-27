export const extent=190;
export function surface(x,z){return Math.abs(x)<15||Math.abs(z)<12||Math.abs(Math.abs(x)-90)<9||Math.abs(Math.abs(z)-90)<9?1:.62}
export function constrain(car){for(const k of ['x','z'])if(Math.abs(car[k])>extent-3){car[k]=Math.sign(car[k])*(extent-3);car.u*=.35;car.v*=.35;car.r*=.5}}
export function buildWorld(m){
 const asphalt=[.09,.10,.11],stripe=[.76,.73,.56],curb=[.43,.45,.44];
 m.box(0,-.2,0,380,.4,380,[.19,.25,.19]);
 for(const x of [-90,0,90]){const w=x===0?30:18;m.box(x,.015,0,w,.03,380,asphalt);for(const s of [-1,1])m.box(x+s*(w/2-.45),.04,0,.12,.025,380,curb);for(let z=-185;z<185;z+=12)if(Math.abs(z)>14&&Math.abs(Math.abs(z)-90)>11)m.box(x,.05,z,.13,.025,5,stripe)}
 for(const z of [-90,0,90]){const w=z===0?24:18;m.box(0,.025,z,380,.03,w,asphalt);for(let x=-185;x<185;x+=12)if(Math.abs(x)>16&&Math.abs(Math.abs(x)-90)>11)m.box(x,.06,z,5,.025,.13,stripe)}
 for(let i=0;i<26;i++){const x=-170+i*13,z=205+(i%3)*12,h=12+(i*17%45);m.box(x,h/2,z,10,h,12,[.24+(i%4)*.025,.29,.32]);for(let y=4;y<h-2;y+=4)m.box(x,y,z-6.03,7,.7,.08,[.12,.19,.24])}
 for(let z=-170;z<=170;z+=20)for(const x of [-18,18]){m.box(x,2.3,z,.13,4.6,.13,[.35,.36,.35]);m.box(x,4.6,z,.9,.17,.32,[.72,.71,.62])}
 for(let k=-180;k<=180;k+=8)for(const s of [-1,1]){m.box(k,.36,s*190,.55,.72,.55,curb);m.box(s*190,.36,k,.55,.72,.55,curb)}
}
