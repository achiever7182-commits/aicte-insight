import {useMemo,useRef,useLayoutEffect} from 'react';import {useFrame} from '@react-three/fiber';import * as THREE from 'three';
import {C} from '../config/tokens';import {progress} from '../scroll/engine';
const o=new THREE.Object3D();
export default function Particles({count=4000}:{count?:number}){
  const ref=useRef<THREE.InstancedMesh>(null!);
  const seeds=useMemo(()=>Array.from({length:count},()=>({r:3+Math.random()*16,a:Math.random()*6.28,y:(Math.random()-.5)*14,z:-Math.random()*95+10,s:.4+Math.random()*1.2,c:[C.saffron,C.gold,C.ivory][Math.floor(Math.random()*3)]})),[count]);
  useLayoutEffect(()=>{seeds.forEach((d,i)=>ref.current.setColorAt(i,new THREE.Color(d.c)));ref.current.instanceColor!.needsUpdate=true;},[seeds]);
  useFrame(({clock})=>{
    const t=clock.elapsedTime,swirl=1-Math.min(1,progress.value*6); // swirl in hero, drift during flight
    seeds.forEach((d,i)=>{
      const a=d.a+t*.08*d.s*(.3+swirl);
      o.position.set(Math.cos(a)*d.r,d.y+Math.sin(t*.3+i)*.3,d.z+Math.sin(a)*d.r*.4);
      o.rotation.set(t*.2*d.s,a,i);o.scale.setScalar(.09*d.s);o.updateMatrix();ref.current.setMatrixAt(i,o.matrix);});
    ref.current.instanceMatrix.needsUpdate=true;});
  return <instancedMesh ref={ref} args={[undefined,undefined,count]} frustumCulled={false}>
    <planeGeometry args={[1,1.35]}/><meshBasicMaterial transparent opacity={.75} side={THREE.DoubleSide} toneMapped={false}/></instancedMesh>;}
