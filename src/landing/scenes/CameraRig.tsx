import {useFrame,useThree} from '@react-three/fiber';import * as THREE from 'three';
import {PATH} from '../config/cameraPath';import {progress} from '../scroll/engine';
const look=new THREE.Vector3(),pos=new THREE.Vector3(),mouse=new THREE.Vector2();
if(typeof window!=='undefined'){
  window.addEventListener('pointermove',e=>{
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    mouse.set(e.clientX/w*2-1,e.clientY/h*2-1);
  });
}
export default function CameraRig({shake=true}:{shake?:boolean}){
  const {camera}=useThree();
  useFrame(({clock})=>{
    const p=progress.value,t=clock.elapsedTime;
    PATH.getPointAt(p,pos);
    PATH.getPointAt(p,look);
    look.set(0, 1.4, look.z - 7.5);
    const s=shake?Math.min(1,Math.abs(progress.velocity)*.02)*.04:0;
    camera.position.lerp(pos.add(new THREE.Vector3(mouse.x*.3+Math.sin(t*9)*s,-mouse.y*.2+Math.cos(t*7)*s,0)),.12);
    camera.lookAt(look);
  });
  return null;}
