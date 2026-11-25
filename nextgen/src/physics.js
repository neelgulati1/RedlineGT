export class Vehicle {
 constructor(){this.reset()}
 reset(){Object.assign(this,{x:0,z:0,yaw:0,u:0,v:0,r:0,steer:0,rpm:900,gear:1,spin:0,ax:0,ay:0})}
 step(dt,input,mu=1){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,k)=>a+(b-a)*Math.min(1,k*dt);
 const m=1450,I=2450,a=1.22,b=1.48,L=a+b,g=9.81,h=.49,R=.33;
 const t=clamp(input.throttle||0,0,1),br=clamp(input.brake||0,0,1),hand=!!input.handbrake,speed=Math.hypot(this.u,this.v);
 this.steer=smooth(this.steer,clamp(input.steer||0,-1,1)*.48/(1+speed*.045),9);
 const ratios=[3.65,2.19,1.52,1.18,.94,.76],final=3.42;
 const engineRPM=gear=>Math.abs(this.u)/R*ratios[gear-1]*final*60/(2*Math.PI);
 if(engineRPM(this.gear)>6750&&this.gear<6)this.gear++;else if(engineRPM(this.gear)<2600&&this.gear>1&&engineRPM(this.gear-1)<6500)this.gear--;
 this.rpm=smooth(this.rpm,clamp(engineRPM(this.gear)+t*500,900,7200),12);
 const torque=310+120*Math.sin(Math.PI*clamp((this.rpm-900)/6500,0,1));
 const fzF=clamp(m*(g*b-this.ax*h)/L,m*g*.22,m*g*.78),fzR=m*g-fzF;
 const drive=t*(1-br)*torque*ratios[this.gear-1]*final*.87/R;
 let fxF=-Math.min(br*10000*.62,Math.max(0,this.u)*m*.62/dt),fxR=drive-Math.min(br*10000*.38+(hand?8000:0),Math.max(0,this.u)*m*.38/dt);
 const ref=Math.max(2,Math.abs(this.u));
 let fyF=-85000*(Math.atan2(this.v+a*this.r,ref)-this.steer*clamp(this.u/2,0,1)),fyR=-92000*Math.atan2(this.v-b*this.r,ref);
 const limit=(fx,fy,max)=>{const k=Math.min(1,max/Math.max(1,Math.hypot(fx,fy)));return[fx*k,fy*k]};
 [fxF,fyF]=limit(fxF,fyF,mu*fzF);[fxR,fyR]=limit(fxR,fyR,mu*fzR*(hand?.6:1));
 const f=(fxF*Math.cos(this.steer)-fyF*Math.sin(this.steer)+fxR-.43*this.u*Math.abs(this.u)-115*Math.tanh(this.u))/m;
 const l=(fyF*Math.cos(this.steer)+fxF*Math.sin(this.steer)+fyR)/m;
 const oldU=this.u;this.u=Math.max(0,this.u+dt*(f+this.r*this.v));this.v+=dt*(l-this.r*oldU);
 this.r+=dt*((a*(fyF*Math.cos(this.steer)+fxF*Math.sin(this.steer))-b*fyR)/I-.48*this.r);
 if(speed<2){this.v*=Math.exp(-6*dt);this.r*=Math.exp(-4*dt)}
 if(!t&&this.u<.15&&br){this.u=0;this.v=0;this.r=0}
 this.yaw+=this.r*dt;this.x+=dt*(Math.sin(this.yaw)*this.u+Math.cos(this.yaw)*this.v);this.z+=dt*(Math.cos(this.yaw)*this.u-Math.sin(this.yaw)*this.v);
 this.ax=smooth(this.ax,f,8);this.ay=smooth(this.ay,l,8);this.spin=(this.spin+this.u/R*dt)%(2*Math.PI);
 }
}
