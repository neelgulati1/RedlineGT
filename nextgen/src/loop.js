export class FixedLoop{
 constructor(step=1/120,maxSteps=12){this.step=step;this.maxSteps=maxSteps;this.acc=0;this.dropped=0}
 advance(seconds,update){if(seconds>.1)this.dropped++;this.acc+=Math.min(.1,Math.max(0,seconds));let n=0;while(this.acc+1e-9>=this.step&&n<this.maxSteps){update(this.step);this.acc-=this.step;n++}if(this.acc>=this.step){this.dropped++;this.acc%=this.step}return n}
}
