import * as THREE from 'three';
export type Scene={id:number;key:string;range:[number,number];title:string;line:string};
// Scroll ranges (0..1) per scene. Edit here to retime the film.
export const SCENES:Scene[]=[
{id:0,key:'hero',range:[0,.14],title:'Every document. Verified before it reaches a desk.',line:'AICTE VerifyAI validates Extension of Approval applications.'},
{id:1,key:'submit',range:[.14,.28],title:'College submits application',line:'Affidavit, NOC, lease and accreditation arrive in one tray.'},
{id:2,key:'read',range:[.28,.42],title:'AI reads and classifies every page',line:'OCR extracts fields into structured data.'},
{id:3,key:'validate',range:[.42,.56],title:'Checked against rules and records',line:'Each item resolves to verified, missing or expired.'},
{id:4,key:'verify',range:[.56,.68],title:'Confirmed with the original issuer',line:'Portal, QR and digital-signature checks.'},
{id:5,key:'constellation',range:[.68,.8],title:'Fraud Constellation: hidden links across institutions',line:'C++ core matches millions of fingerprints in milliseconds.'},
{id:6,key:'reality',range:[.8,.91],title:'Reality Twin: claimed vs real',line:'Claimed campus footprint against detected buildings.'},
{id:7,key:'decision',range:[.91,1],title:'Humans decide. AI assists.',line:'Approve, request evidence, or override.'}];
// Camera positions per scene (index matches SCENES).
// Elevated, balanced overview so the conveyor, files, and robots fit naturally into the screen without clipping.
export const PATH=new THREE.CatmullRomCurve3(
  [0,1,2,3,4,5,6,7].map(i=>new THREE.Vector3(i%2?-6.0:6.0, 4.8-(i===5?-2.0:0), 7.5-14*i)),false,'catmullrom',.5);
export const sceneAt=(p:number)=>SCENES.find(s=>p>=s.range[0]&&p<=s.range[1])??SCENES[7];
export const local=(p:number,s:Scene)=>Math.min(1,Math.max(0,(p-s.range[0])/(s.range[1]-s.range[0])));
