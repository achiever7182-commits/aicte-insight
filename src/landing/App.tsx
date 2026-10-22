import {useEffect,useState} from 'react';import World from './scenes/World';import {Overlay,Loader} from './ui/Overlay';import {startScroll} from './scroll/engine';
const mobile=typeof matchMedia!=='undefined'&&(matchMedia('(max-width:768px)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches);
export default function App(){
  const [q,setQ]=useState<'high'|'low'>(mobile?'low':'high');
  useEffect(()=>{const s=startScroll('#scroll');(window as any).__lenis=s.lenis;return s.stop},[]);
  const skip=()=>(window as any).__lenis?.scrollTo(document.body.scrollHeight);
  return <main>
    <div className="fixed inset-0"><World quality={q}/></div>
    <Loader/><Overlay quality={q} setQuality={()=>setQ(q==='high'?'low':'high')} skip={skip}/>
    <div id="scroll" style={{height:'1000vh'}} aria-hidden/></main>;}
