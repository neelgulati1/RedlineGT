import {Mesh,bodyMesh} from './mesh.js';import {buildWorld} from './world.js';
const ident=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[c*4+j]+=a[k*4+j]*b[c*4+k];return r}
function transform(x,y,z,t=0){const m=ident(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;m[12]=x;m[13]=y;m[14]=z;return m}
function rx(t){const m=ident(),c=Math.cos(t),s=Math.sin(t);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m}
function rz(t){const m=ident(),c=Math.cos(t),s=Math.sin(t);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m}
function perspective(aspect){const f=1/Math.tan(55*Math.PI/360),n=.15,q=550;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(q+n)/(n-q),-1,0,0,2*q*n/(n-q),0])}
const norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
function look(eye,target){const z=norm(eye.map((x,i)=>x-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
const vert=`#version 300 es
precision highp float;
layout(location=0) in vec3 pos;layout(location=1) in vec3 normal;layout(location=2) in vec3 col;
uniform mat4 vp,model;out vec3 N,C,W;
void main(){vec4 w=model*vec4(pos,1.);W=w.xyz;N=mat3(model)*normal;C=col;gl_Position=vp*w;}`;
const frag=`#version 300 es
precision mediump float;
in vec3 N,C,W;uniform vec3 eye;uniform float dusk;out vec4 color;
void main(){vec3 n=normalize(N),l=normalize(vec3(-.45,.82,.35)),v=normalize(eye-W);float diff=max(dot(n,l),0.);float spec=pow(max(dot(n,normalize(l+v)),0.),35.);vec3 lit=C*(mix(.50,.30,dusk)+diff*mix(.88,.55,dusk))+vec3(.16,.18,.2)*spec;vec3 fog=mix(vec3(.52,.63,.72),vec3(.29,.31,.39),dusk);float f=smoothstep(70.,350.,distance(eye,W));color=vec4(pow(clamp(mix(lit,fog,f),0.,1.),vec3(.85)),1.);}`;
export class Renderer{
 constructor(canvas){this.canvas=canvas;const g=this.g=canvas.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'low-power'});if(!g)throw Error('WebGL 2 unavailable. Enable hardware acceleration or use a supported browser.');
 const compile=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s};const p=this.p=g.createProgram();g.attachShader(p,compile(g.VERTEX_SHADER,vert));g.attachShader(p,compile(g.FRAGMENT_SHADER,frag));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error(g.getProgramInfoLog(p));
 this.loc=Object.fromEntries(['vp','model','eye','dusk'].map(n=>[n,g.getUniformLocation(p,n)]));g.enable(g.DEPTH_TEST);const w=new Mesh();buildWorld(w);this.world=this.upload(w);this.body=this.upload(bodyMesh());const wheel=new Mesh();wheel.wheel();this.wheel=this.upload(wheel);const shadow=new Mesh();shadow.box(0,.07,0,2.1,.018,4.5,[.038,.042,.045]);this.shadow=this.upload(shadow);this.eye=null;this.scale=.7;this.triangles=0}
 upload(m){const g=this.g,vao=g.createVertexArray(),buf=g.createBuffer();g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array(m.data),g.STATIC_DRAW);for(let i=0;i<3;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,36,i*12)}g.bindVertexArray(null);return{vao,count:m.data.length/9}}
 resize(){const c=this.canvas,dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.max(2,Math.round(c.clientWidth*dpr*this.scale)),h=Math.max(2,Math.round(c.clientHeight*dpr*this.scale));if(c.width!==w||c.height!==h){c.width=w;c.height=h}this.g.viewport(0,0,w,h)}
 draw(mesh,model){const g=this.g;g.uniformMatrix4fv(this.loc.model,false,model);g.bindVertexArray(mesh.vao);g.drawArrays(g.TRIANGLES,0,mesh.count);this.triangles+=mesh.count/3}
 render(car,dt,dusk){this.resize();const g=this.g,desired=[car.x-Math.sin(car.yaw)*7.6,3.3,car.z-Math.cos(car.yaw)*7.6];this.eye=this.eye?this.eye.map((v,i)=>v+(desired[i]-v)*Math.min(1,dt*8)):desired;const target=[car.x+Math.sin(car.yaw)*5,1.05,car.z+Math.cos(car.yaw)*5],vp=mul(perspective(this.canvas.width/this.canvas.height),look(this.eye,target));g.clearColor(.59-.25*dusk,.68-.33*dusk,.77-.34*dusk,1);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.p);g.uniformMatrix4fv(this.loc.vp,false,vp);g.uniform3fv(this.loc.eye,this.eye);g.uniform1f(this.loc.dusk,dusk);this.triangles=0;this.draw(this.world,ident());const root=transform(car.x,0,car.z,car.yaw);this.draw(this.shadow,root);this.draw(this.body,mul(root,mul(rx(car.ax*.006),rz(-car.ay*.009))));for(const side of [-1,1])for(const z of [-1.48,1.22])this.draw(this.wheel,mul(mul(root,transform(side*.91,.33,z,z>0?car.steer:0)),rx(car.spin)))}
}
