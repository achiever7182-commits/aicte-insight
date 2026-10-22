import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const progress = { value: 0, velocity: 0 };
export function startScroll(trigger:string){
  const lenis=new Lenis({lerp:.08});
  lenis.on('scroll',()=>{progress.velocity=lenis.velocity;ScrollTrigger.update();});
  const tick=(t:number)=>lenis.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  const st=ScrollTrigger.create({trigger,start:'top top',end:'bottom bottom',scrub:true,onUpdate:s=>{progress.value=s.progress;}});
  return {lenis,stop:()=>{st.kill();gsap.ticker.remove(tick);lenis.destroy();}};
}
