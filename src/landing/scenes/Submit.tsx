import {useRef} from 'react';import {useFrame} from '@react-three/fiber';import * as THREE from 'three';
import {Text} from '@react-three/drei';import {C} from '../config/tokens';import {SCENES,local} from '../config/cameraPath';import {progress} from '../scroll/engine';
const DOCS=[['AFFIDAVIT',-9,5],['NOC',9,4],['LEASE DEED',-8,-5],['ACCREDITATION',10,-4]] as const;
export default function Submit(){
  const refs=useRef<THREE.Group[]>([]);const tray=useRef<THREE.Mesh>(null!);
  useFrame(()=>{
    const l=local(progress.value,SCENES[1]);
    DOCS.forEach(([,x,y],i)=>{const g=refs.current[i];if(!g)return;
      const k=THREE.MathUtils.smoothstep(l,i*.12,.6+i*.1);
      g.position.set(x*(1-k),y*(1-k)-1.2+i*.12*k,-6+(1-k)*-4);g.rotation.set(0,(1-k)*(x>0?-1:1),(1-k)*.8);});
    (tray.current.material as THREE.MeshBasicMaterial).opacity=.2+l*.8;});
  return <group>
    {DOCS.map(([n],i)=><group key={n} ref={el=>{if(el)refs.current[i]=el;}}>
      <mesh><planeGeometry args={[2.6,3.4]}/><meshBasicMaterial color={C.ivory} toneMapped={false}/></mesh>
      <mesh position={[0,1.35,.01]}><planeGeometry args={[2.6,.4]}/><meshBasicMaterial color={C.saffron} toneMapped={false}/></mesh>
      <Text position={[0,1.35,.02]} fontSize={.2} color="#0A0806">{n}</Text></group>)}
    <mesh ref={tray} position={[0,-2.4,-6]} rotation={[-1.2,0,0]}><planeGeometry args={[4,3]}/>
      <meshBasicMaterial color={C.gold} transparent toneMapped={false}/></mesh></group>;}
