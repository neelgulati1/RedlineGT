export class Mesh{
 constructor(){this.data=[]}
 tri(a,b,c,color){const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n)||1;n=n.map(x=>x/l);for(const p of [a,b,c])this.data.push(...p,...n,...color)}
 quad(a,b,c,d,color){this.tri(a,b,c,color);this.tri(a,c,d,color)}
 box(x,y,z,w,h,d,c){const l=x-w/2,r=x+w/2,o=y-h/2,t=y+h/2,f=z+d/2,b=z-d/2,p=[[l,o,b],[r,o,b],[r,t,b],[l,t,b],[l,o,f],[r,o,f],[r,t,f],[l,t,f]];for(const ids of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])this.quad(...ids.map(i=>p[i]),c)}
 loft(sections,color){const rings=sections.map(([z,w,lo,hi,inset])=>[[-w*.86,lo,z],[w*.86,lo,z],[w,hi-.12,z],[w-inset,hi,z],[-w+inset,hi,z],[-w,hi-.12,z]]);for(let j=0;j<rings.length-1;j++)for(let i=0;i<6;i++)this.quad(rings[j][i],rings[j][(i+1)%6],rings[j+1][(i+1)%6],rings[j+1][i],color);for(let i=1;i<5;i++){this.tri(rings[0][0],rings[0][i+1],rings[0][i],color);const q=rings.at(-1);this.tri(q[0],q[i],q[i+1],color)}}
 wheel(radius=.33,width=.23){const tire=[.035,.039,.043],rim=[.45,.48,.51],hub=[.16,.17,.19],n=24;for(let i=0;i<n;i++){const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n,p=(x,r,t)=>[x,r*Math.cos(t),r*Math.sin(t)];this.quad(p(-width/2,radius,a),p(-width/2,radius,b),p(width/2,radius,b),p(width/2,radius,a),tire);for(const s of [-1,1]){const x=s*width/2,v=[p(x,radius,a),p(x,radius,b),p(x,radius*.67,b),p(x,radius*.67,a)];if(s<0)v.reverse();this.quad(...v,tire);const w=[p(x,radius*.67,a),p(x,radius*.67,b),p(x,radius*.19,b),p(x,radius*.19,a)];if(s<0)w.reverse();this.quad(...w,i%4===0?rim:hub);this.tri(p(x,0,0),p(x,radius*.19,a),p(x,radius*.19,b),hub)}}}
}
export function bodyMesh(){const m=new Mesh(),paint=[.045,.21,.32],dark=[.026,.033,.042],glass=[.06,.105,.14];
 m.loft([[-2.15,.84,.43,.70,.09],[-1.65,.97,.37,.82,.07],[-.8,.94,.36,.81,.10],[.65,.93,.36,.78,.11],[1.65,.95,.38,.71,.08],[2.12,.83,.40,.59,.12]],paint);
 m.loft([[-1.25,.74,.79,.84,.05],[-.65,.69,.78,1.28,.10],[.28,.65,.77,1.26,.10],[.92,.76,.75,.84,.07]],glass);m.box(0,1.285,-.18,1.03,.045,.76,paint);
 m.box(0,.41,2.13,1.3,.13,.06,dark);m.box(0,.39,-2.16,1.4,.12,.06,dark);
 for(const s of [-1,1]){m.box(s*.61,.64,2.12,.39,.075,.07,[.82,.92,1]);m.box(s*.62,.68,-2.15,.43,.075,.07,[.85,.035,.045]);m.box(s*.93,.92,.43,.18,.11,.22,paint);m.box(s*.96,.38,-.03,.08,.09,1.8,dark)}return m}
