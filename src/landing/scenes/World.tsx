import {Canvas} from '@react-three/fiber';
import {EffectComposer,Bloom,SMAA,Vignette} from '@react-three/postprocessing';
import {Suspense} from 'react';
import {Environment} from '@react-three/drei';
import CameraRig from './CameraRig';
import Factory from './Factory';

const BG = '#0F0E0C';

export default function World({quality}:{quality:'high'|'low'}){
  const hi = quality === 'high';
  return (
    <Canvas
      shadows={hi}
      dpr={hi ? [1, 2] : 1}
      camera={{ fov: 50, near: 0.1, far: 260, position: [6, 4.8, 7.5] }}
      gl={{ antialias: hi, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 50, 180]} />
      <ambientLight intensity={1.2} color="#FFF8F0" />
      <directionalLight position={[8, 16, 6]} intensity={2.2} castShadow={hi} color="#FFF4E6" />
      <pointLight position={[0, 4.0, 0]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -14]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -28]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -42]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -56]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -70]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -84]} intensity={4.5} color="#FFE8D6" distance={22} />
      <pointLight position={[0, 4.0, -98]} intensity={4.5} color="#FFE8D6" distance={22} />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <CameraRig shake={hi} />
        <Factory />
        {hi && (
          <EffectComposer>
            <SMAA />
            <Bloom intensity={0.4} luminanceThreshold={0.8} mipmapBlur />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
