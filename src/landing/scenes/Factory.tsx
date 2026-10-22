import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Text} from '@react-three/drei';
import {C} from '../config/tokens';
import {SCENES,sceneAt} from '../config/cameraPath';
import {progress} from '../scroll/engine';

export const GAP=14;
const ACC=[C.saffron,C.saffron,C.saffron,C.emerald,C.gold,C.crimson,C.crimson,C.emerald];
const techMetal={color:'#1E293B',roughness:0.3,metalness:0.6};
const frameMat={color:'#334155',roughness:0.4,metalness:0.5};

function Station({i}:{i:number}){
  const base=useRef<THREE.Group>(null!);
  const arm=useRef<THREE.Group>(null!);
  const fore=useRef<THREE.Group>(null!);
  const head=useRef<THREE.Group>(null!);
  const tip=useRef<THREE.MeshStandardMaterial>(null!);
  const laserBeam=useRef<THREE.Mesh>(null!);
  const laserDot=useRef<THREE.Mesh>(null!);
  const stampRing=useRef<THREE.Mesh>(null!);

  useFrame(({clock})=>{
    // Calculate exact document position passing station i on conveyor
    // Belt travel is driven by scroll progress plus time
    const scrollPos = progress.value * GAP * 7;
    const continuousMotion = clock.elapsedTime * 3.5;
    const totalDist = scrollPos + continuousMotion;
    // Station z is at -GAP*i
    const stationZ = GAP * i;
    // Packet cycle relative to station
    const cycle = (totalDist + stationZ) % 4; // every 4 units a document passes
    const phase = cycle / 4; // 0..1 progression as a document arrives, stops under robot, and leaves

    // Realistic Industrial Workflow Phases:
    // 0.0 -> 0.35 : Tracking arrival of document (smooth aim towards document)
    // 0.35 -> 0.65 : Inspection & Stamping (arm lowers down firmly, laser scans QR, stamp seal touches paper)
    // 0.65 -> 1.0 : Return to ready / reset position
    let aimAngle = 0;
    let armDip = 0;
    let foreExtend = 0;
    let isInspecting = false;
    let isStamping = false;

    if (phase < 0.35) {
      // Slewing in to meet arriving folder
      const p = phase / 0.35;
      aimAngle = -0.2 + p * 0.2;
      armDip = p * 0.15;
      foreExtend = p * 0.2;
    } else if (phase < 0.65) {
      // Active verification & stamp
      const p = (phase - 0.35) / 0.3;
      aimAngle = 0.0 + Math.sin(p * Math.PI) * 0.08;
      // Precision descent to document surface
      armDip = 0.15 + Math.sin(p * Math.PI) * 0.25;
      foreExtend = 0.2 + Math.sin(p * Math.PI) * 0.15;
      isInspecting = true;
      if (p > 0.4 && p < 0.7) {
        isStamping = true;
      }
    } else {
      // Retracting arm
      const p = (phase - 0.65) / 0.35;
      aimAngle = -p * 0.2;
      armDip = 0.15 * (1 - p);
      foreExtend = 0.2 * (1 - p);
    }

    if (base.current) base.current.rotation.y = aimAngle;
    if (arm.current) arm.current.rotation.z = -armDip;
    if (fore.current) fore.current.rotation.z = -foreExtend;
    if (head.current) head.current.rotation.z = armDip + foreExtend; // keep head pointing down

    // Laser beam fires during active scanning
    if (laserBeam.current) {
      laserBeam.current.visible = isInspecting;
      const pulse = 0.9 + Math.sin(clock.elapsedTime * 20) * 0.2;
      laserBeam.current.scale.set(pulse, 1, pulse);
    }
    if (laserDot.current) {
      laserDot.current.visible = isInspecting;
      laserDot.current.scale.setScalar(isStamping ? 1.6 : 1.0);
    }
    if (stampRing.current) {
      stampRing.current.visible = isStamping;
      stampRing.current.rotation.z = clock.elapsedTime * 4;
    }
    if (tip.current) {
      tip.current.emissiveIntensity = isStamping ? 4.5 : isInspecting ? 2.5 : 0.8;
    }
  });

  const accentColor = ACC[i];

  return (
    <group position={[0,0,-GAP*i]}>
      {/* Heavy industrial gantry over the conveyor */}
      {[-1.8, 1.8].map(x=>(
        <group key={x} position={[x, 1.7, 0]}>
          <mesh>
            <boxGeometry args={[0.28, 3.4, 0.28]}/>
            <meshStandardMaterial {...frameMat}/>
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.32, 0.08, 0.32]}/>
            <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={0.8}/>
          </mesh>
        </group>
      ))}

      {/* Crossbeam */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[3.9, 0.45, 0.7]}/>
        <meshStandardMaterial {...techMetal}/>
      </mesh>
      {/* Glowing status strip across gantry */}
      <mesh position={[0, 3.4, 0.36]}>
        <boxGeometry args={[3.8, 0.1, 0.02]}/>
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3}/>
      </mesh>

      {/* Target inspection spot on the belt where documents get verified */}
      <mesh ref={laserDot} position={[0, 0.52, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.22, 32]}/>
        <meshBasicMaterial color="#FF9933" transparent opacity={0.65} side={THREE.DoubleSide}/>
      </mesh>
      {/* Glowing Stamp Approval Stamp ring that appears upon verification */}
      <mesh ref={stampRing} position={[0, 0.53, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.25, 0.32, 32]}/>
        <meshBasicMaterial color="#10B981" side={THREE.DoubleSide}/>
      </mesh>

      {/* Industrial Articulated Robotic Inspector */}
      <group position={[2.6, 0, 0]}>
        {/* Heavy pedestal */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.65, 0.8, 0.5, 32]}/>
          <meshStandardMaterial {...techMetal}/>
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.1, 32]}/>
          <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={1.2}/>
        </mesh>

        {/* Rotating Turret Base */}
        <group ref={base} position={[0, 0.6, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]}/>
            <meshStandardMaterial {...techMetal}/>
          </mesh>

          {/* Lower Arm & Hydraulic Piston */}
          <group ref={arm} position={[0, 0.6, 0]}>
            {/* Main boom beam reaching towards belt center */}
            <mesh position={[-1.1, 0.9, 0]} rotation={[0, 0, 0.45]}>
              <boxGeometry args={[0.28, 2.4, 0.32]}/>
              <meshStandardMaterial {...frameMat}/>
            </mesh>
            {/* Hydraulic cylinder */}
            <mesh position={[-0.8, 0.8, 0]} rotation={[0, 0, 0.45]}>
              <cylinderGeometry args={[0.07, 0.07, 1.6, 16]}/>
              <meshStandardMaterial color="#A89F91" metalness={0.9} roughness={0.2}/>
            </mesh>
            <mesh position={[-1.9, 1.8, 0]}>
              <sphereGeometry args={[0.24, 20, 20]}/>
              <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={1.2}/>
            </mesh>

            {/* Forearm articulated assembly reaching down to center of belt */}
            <group ref={fore} position={[-1.9, 1.8, 0]}>
              <mesh position={[-0.7, -0.6, 0]} rotation={[0, 0, -0.7]}>
                <boxGeometry args={[0.24, 1.8, 0.24]}/>
                <meshStandardMaterial {...techMetal}/>
              </mesh>

              {/* Tool head / Optical Laser Scanner & Stamp Tool */}
              <group ref={head} position={[-0.7, -1.3, 0]}>
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.22, 0.16, 0.5, 24]}/>
                  <meshStandardMaterial {...frameMat}/>
                </mesh>
                {/* Glowing laser emitter lens */}
                <mesh position={[0, -0.28, 0]}>
                  <sphereGeometry args={[0.14, 24, 24]}/>
                  <meshStandardMaterial ref={tip} color={accentColor} emissive={accentColor} emissiveIntensity={2.5}/>
                </mesh>

                {/* Laser beam shooting directly from robotic nozzle down onto document */}
                <mesh ref={laserBeam} position={[0, -0.75, 0]}>
                  <cylinderGeometry args={[0.025, 0.025, 1.4, 16]}/>
                  <meshBasicMaterial color="#FF9933"/>
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Station Header Billboard */}
      <Text position={[-2.4, 3.8, 0]} fontSize={0.42} color="#FF9933" anchorX="center" fontWeight={800}>
        {`0${i} ${SCENES[i].key.toUpperCase()}`}
      </Text>
      <Text position={[-2.4, 3.4, 0]} fontSize={0.18} color="#D6CEBF" anchorX="center" fontWeight={500}>
        {`AUTOMATED VERIFICATION UNIT`}
      </Text>
    </group>
  );
}

// College document types that ride the inspection conveyor
const DOC_TYPES = [
  { label: "STUDENT ENROLLMENT", code: "AICTE/REG-2025", tag: "STUDENT FILE", color: "#FF9933" },
  { label: "LAND TITLE DEED", code: "DEED-NOC/094", tag: "CAMPUS DOC", color: "#10B981" },
  { label: "FACULTY BIO DOSSIER", code: "PHD-VERIFY/88", tag: "STAFF FOLDER", color: "#F5C542" },
  { label: "AFFILIATION NOC", code: "UNIV-REC/2025", tag: "NOC CERT", color: "#38BDF8" },
  { label: "AICTE AFFIDAVIT", code: "EOA-AFF/2025-26", tag: "AFFIDAVIT", color: "#FF9933" },
  { label: "FIRE & SAFETY NOC", code: "FIRE-CERT/102", tag: "SAFETY FILE", color: "#E11D48" },
  { label: "BUILDING PLAN", code: "ARCH-MAP/SEC-4", tag: "CAD BLUEPRINT", color: "#10B981" },
];

function CollegeDocumentPacket({
  index,
  groupRef,
}: {
  index: number;
  groupRef: (el: THREE.Group | null) => void;
}) {
  const doc = DOC_TYPES[index % DOC_TYPES.length];
  const isFolder = index % 2 === 0;

  return (
    /* Elevate and tilt smoothly so top cover faces viewer without clipping */
    <group ref={groupRef} position={[0, 0.45, 0]} rotation={[0.15, 0, 0]}>
      {/* 3D Document Title Badge */}
      <group position={[0, 0.55, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.7, 0.32]} />
          <meshBasicMaterial color="#141210" transparent opacity={0.88} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[1.74, 0.36]} />
          <meshBasicMaterial color={doc.color} wireframe />
        </mesh>
        <Text
          position={[0, 0.04, 0.01]}
          fontSize={0.12}
          color="#FFF8F0"
          fontWeight={800}
          anchorX="center"
          anchorY="middle"
        >
          {doc.label}
        </Text>
        <Text
          position={[0, -0.07, 0.01]}
          fontSize={0.08}
          color={doc.color}
          fontWeight={700}
          anchorX="center"
          anchorY="middle"
        >
          {doc.code}
        </Text>
      </group>

      {isFolder ? (
        /* ================= EXPANDABLE MANILA / INDUSTRIAL DOSSIER FOLDER ================= */
        <group>
          {/* Main folder base binder - warm rich saddle leather/cardboard */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[2.2, 0.12, 1.65]} />
            <meshStandardMaterial color="#3D3024" roughness={0.6} />
          </mesh>
          {/* Large prominent index tab on side */}
          <mesh position={[0.95, 0.09, -0.6]}>
            <boxGeometry args={[0.42, 0.06, 0.4]} />
            <meshStandardMaterial color={doc.color} emissive={doc.color} emissiveIntensity={0.6} roughness={0.4} />
          </mesh>
          {/* Crisp, clean white inner parchment student papers */}
          <mesh position={[-0.05, 0.14, 0]}>
            <boxGeometry args={[2.05, 0.07, 1.52]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
          </mesh>
          {/* Saffron official verification ribbon band across folder */}
          <mesh position={[0, 0.18, 0.28]}>
            <boxGeometry args={[2.1, 0.02, 0.24]} />
            <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={0.9} />
          </mesh>
          {/* Official AICTE Golden Seal badge */}
          <mesh position={[0.65, 0.19, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.22, 32]} />
            <meshStandardMaterial color="#F5C542" emissive="#F5C542" emissiveIntensity={0.8} metalness={0.7} />
          </mesh>
          {/* Simulated printed document text lines */}
          {[-0.45, -0.28, -0.11, 0.06].map((z, lineIdx) => (
            <mesh key={lineIdx} position={[-0.2, 0.18, z]}>
              <boxGeometry args={[1.5, 0.008, 0.05]} />
              <meshStandardMaterial color="#332D28" roughness={0.9} />
            </mesh>
          ))}
          {/* Document label printed on parchment */}
          <Text
            position={[-0.95, 0.185, -0.6]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.14}
            color="#141210"
            fontWeight={900}
            anchorX="left"
          >
            {doc.label}
          </Text>
          <Text
            position={[-0.95, 0.185, -0.42]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.10}
            color="#D97706"
            fontWeight={800}
            anchorX="left"
          >
            VERIFIED FILE: {doc.code}
          </Text>
        </group>
      ) : (
        /* ================= STACKED CERTIFICATE FILE WITH SEAL & QR CHIP ================= */
        <group>
          {/* Bottom dossier binder */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[2.15, 0.10, 1.6]} />
            <meshStandardMaterial color="#24201C" roughness={0.5} />
          </mesh>
          {/* Bright white student certificate paper */}
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[2.05, 0.05, 1.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          {/* Digital QR / Hash microchip scanner tag */}
          <mesh position={[-0.68, 0.15, -0.48]}>
            <boxGeometry args={[0.34, 0.03, 0.34]} />
            <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={1.8} />
          </mesh>
          {/* Simulated text lines */}
          {[-0.15, 0.02, 0.2, 0.38, 0.55].map((z, lineIdx) => (
            <mesh key={lineIdx} position={[-0.05, 0.14, z]}>
              <boxGeometry args={[1.7, 0.008, 0.05]} />
              <meshStandardMaterial color="#443E38" roughness={0.9} />
            </mesh>
          ))}
          {/* Student Dossier / Green approval stamp ring */}
          <mesh position={[0.65, 0.15, 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.24, 32]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <Text
            position={[-0.25, 0.15, -0.48]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.13}
            color="#141210"
            fontWeight={900}
            anchorX="left"
          >
            {doc.label}
          </Text>
          <Text
            position={[0.65, 0.15, -0.6]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.10}
            color={doc.color}
            fontWeight={800}
            anchorX="center"
          >
            ★ {doc.tag}
          </Text>
        </group>
      )}
    </group>
  );
}

export default function Factory(){
  const pk=useRef<THREE.Group[]>([]);
  useFrame(()=>{
    pk.current.forEach((m,k)=>{
      if(!m)return;
      const z=-((progress.value*GAP*7+k*4)%(GAP*7+8))+6;
      m.position.z=z;
    });
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.01,-48]}>
        <planeGeometry args={[80,200]}/>
        <meshStandardMaterial color="#141210" roughness={0.85} metalness={0.15}/>
      </mesh>
      {/* Conveyor Belt track */}
      <mesh position={[0,0.15,-48]}>
        <boxGeometry args={[2.2,0.3,200]}/>
        <meshStandardMaterial color="#262320" roughness={0.4} metalness={0.5}/>
      </mesh>
      {/* Conveyor center rubber belt */}
      <mesh position={[0,0.31,-48]}>
        <boxGeometry args={[1.7,0.02,200]}/>
        <meshStandardMaterial color="#181512" roughness={0.9}/>
      </mesh>
      {/* Neon guide rails */}
      <mesh position={[-1.15,0.32,-48]}>
        <boxGeometry args={[0.06,0.06,200]}/>
        <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={2}/>
      </mesh>
      <mesh position={[1.15,0.32,-48]}>
        <boxGeometry args={[0.06,0.06,200]}/>
        <meshStandardMaterial color="#FF9933" emissive="#FF9933" emissiveIntensity={2}/>
      </mesh>

      {/* Assembly stations */}
      {Array.from({length:8},(_,i)=><Station key={i} i={i}/>)}

      {/* College Document & Dossier Files riding on the conveyor */}
      {Array.from({length:14},(_,k)=>(
        <CollegeDocumentPacket
          key={k}
          index={k}
          groupRef={(el) => {
            if (el) pk.current[k] = el;
          }}
        />
      ))}
    </group>
  );
}
