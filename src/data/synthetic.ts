// Deterministic synthetic data generator for the AICTE VerifyAI prototype.
// 40 colleges/applications, 3 planted fraud rings, 5 planted reality-gap cases.
// No real personal or institutional data. Mulberry32 keeps every run identical.

import {
  fnv1a64,
  perturbHash,
  hammingDistance,
  connectedComponents,
  detectCommunities,
  LSH_BANDS,
} from "@/lib/fingerprint";
import { fieldRowY } from "@/data/doc-layout";
import type {
  AppCategory,
  AppDoc,
  Application,
  ChecklistItem,
  College,
  Constellation,
  ConstellationEdge,
  DocType,
  EvidenceBox,
  Fingerprint,
  RealityCase,
  TrustScore,
  VerificationStatus,
} from "@/data/types";
import { DOC_TYPE_LABEL } from "@/data/types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0xa17ce);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const rint = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

// ---------------------------------------------------------------------------
// Colleges
// ---------------------------------------------------------------------------

const CITIES: { city: string; state: string; lat: number; lng: number }[] = [
  { city: "Pune", state: "Maharashtra", lat: 18.52, lng: 73.86 },
  { city: "Nagpur", state: "Maharashtra", lat: 21.15, lng: 79.09 },
  { city: "Nashik", state: "Maharashtra", lat: 19.99, lng: 73.79 },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.72, lng: 75.86 },
  { city: "Bhopal", state: "Madhya Pradesh", lat: 23.26, lng: 77.41 },
  { city: "Jaipur", state: "Rajasthan", lat: 26.91, lng: 75.79 },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.85, lng: 80.95 },
  { city: "Hyderabad", state: "Telangana", lat: 17.38, lng: 78.49 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.02, lng: 76.96 },
  { city: "Bengaluru", state: "Karnataka", lat: 12.97, lng: 77.59 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.03, lng: 72.58 },
  { city: "Patna", state: "Bihar", lat: 25.59, lng: 85.14 },
];

const NAME_A = ["Sanmati", "Vidya", "Bharat", "Saraswati", "Ganga", "Nalanda", "Trupti", "Ashoka", "Surya", "Kaveri", "Vindhya", "Pragati", "Sahyadri", "Ujjwal", "Maitri", "Chetana", "Gokul", "Anand", "Rajdhani", "Silver"];
const NAME_B = ["Institute of Technology & Management", "College of Engineering & Research", "Institute of Engineering & Science", "Group of Institutions", "Technical Campus", "College of Polytechnic & Technology", "Institute of Professional Studies", "Engineering College"];
const PROGRAMS = ["B.Tech Computer Engineering", "B.Tech Mechanical Engineering", "B.Tech Civil Engineering", "MBA", "MCA", "Diploma in Engineering", "B.Pharm", "B.Arch"];

export const colleges: College[] = Array.from({ length: 40 }, (_, i) => {
  const c = CITIES[i % CITIES.length];
  const lat = c.lat + (rng() - 0.5) * 0.5;
  const lng = c.lng + (rng() - 0.5) * 0.5;
  return {
    id: `C${String(i + 1).padStart(2, "0")}`,
    name: `${NAME_A[i % NAME_A.length]} ${pick(NAME_B)}`,
    code: `1-${1000 + i * 7}`,
    city: c.city,
    state: c.state,
    district: `${c.city} ${["North", "South", "Rural", "Urban"][i % 4]}`,
    lat,
    lng,
    established: rint(1998, 2019),
    type: pick(["Private", "Private", "Private", "Government Aided"] as const),
  };
});

// ---------------------------------------------------------------------------
// Planted fingerprints & rings
// ---------------------------------------------------------------------------

// Ring A — reuse of one sub-registrar notary seal across four institutions.
const RING_A = ["C06", "C12", "C20", "C28"];
// Ring B — one site photograph submitted by three campuses in different cities.
const RING_B = ["C04", "C23", "C36"];
// Ring C — one authorised signatory + identical correspondence address across three institutions.
const RING_C = ["C09", "C18", "C32"];
// Benign pair — shared consultancy office address (co-working).
const PAIR_ADDRESS = ["C10", "C25"];

const fps: Fingerprint[] = [];

function addFp(fp: Omit<Fingerprint, "id">): Fingerprint {
  const full = { ...fp, id: `FP-${fps.length + 1}` };
  fps.push(full);
  return full;
}

// Ring A fingerprints: near-identical notary seal + stamp (hamming 2..6)
const ringAHashes = RING_A.map((_, i) => perturbHash(fnv1a64("notary-seal:subregistrar:MH-PUN-52"), 2 + i, 101 + i));
RING_A.forEach((cid, i) => {
  const notary = addFp({
    kind: "notary",
    label: "Notarial seal — Sub-Registrar, Pune-52",
    hash: ringAHashes[i],
    meta: JSON.stringify({ issuer: "Sub-Registrar (Pune-52)", docIssuer: "Registrar Office", shape: "circle", hue: 8, serial: `MH/PN-52/${8100 + i}` }),
    collegeIds: RING_A,
    ringId: "R1",
  });
  const stamp = addFp({
    kind: "stamp",
    label: "Institution round stamp",
    hash: perturbHash(fnv1a64(`stamp:ringA:${cid}`), 3, 200 + i),
    meta: JSON.stringify({ issuer: "Institute stamp", docIssuer: "Institution", shape: "round", hue: 210, serial: cid }),
    collegeIds: [cid],
    ringId: "R1",
  });
  fingerprintByCollege.set(cid, [...(fingerprintByCollege.get(cid) ?? []), notary.id, stamp.id]);
});
const ringANotaryShared = fps.filter((f) => f.ringId === "R1" && f.kind === "notary");

// Ring B fingerprints: identical photo hash (distance 0)
RING_B.forEach((cid) => {
  const photo = addFp({
    kind: "photo",
    label: "Campus front-elevation photograph",
    hash: fnv1a64("photo:elevation:v3:shared"),
    meta: JSON.stringify({ issuer: "Site photograph", docIssuer: "Photographer: Pixel Studio", note: "Identical file across submissions" }),
    collegeIds: RING_B,
    ringId: "R2",
  });
  fingerprintByCollege.set(cid, [...(fingerprintByCollege.get(cid) ?? []), photo.id]);
});

// Ring C fingerprints: signatory + address
RING_C.forEach((cid, i) => {
  const sig = addFp({
    kind: "signatory",
    label: "Authorised signatory — Adv. R. Malhotra",
    hash: fnv1a64(`signatory:malhotra:${i === 0 ? "base" : "base"}`),
    meta: JSON.stringify({ issuer: "Signatory: Adv. R. Malhotra, Advocate", docIssuer: "Notary", note: "Same signatory across institutions" }),
    collegeIds: RING_C,
    ringId: "R3",
  });
  const addr = addFp({
    kind: "address",
    label: "Correspondence address — Office 14, Pearl Business Centre",
    hash: fnv1a64("addr:pearl-business-centre-14"),
    meta: JSON.stringify({ issuer: "Address block", docIssuer: "Institution", note: "Identical correspondence address" }),
    collegeIds: RING_C,
    ringId: "R3",
  });
  fingerprintByCollege.set(cid, [...(fingerprintByCollege.get(cid) ?? []), sig.id, addr.id]);
});

// Benign pair: shared co-working address
PAIR_ADDRESS.forEach((cid) => {
  const addr = addFp({
    kind: "address",
    label: "Correspondence address — Suite 7A, Orion Coworks",
    hash: fnv1a64("addr:orion-coworks-7a"),
    meta: JSON.stringify({ issuer: "Address block", docIssuer: "Institution", note: "Shared co-working office address" }),
    collegeIds: PAIR_ADDRESS,
  });
  fingerprintByCollege.set(cid, [...(fingerprintByCollege.get(cid) ?? []), addr.id]);
});

function fingerprintByCollegeRef() {
  return fingerprintByCollege;
}
// (declared before use above — hoisted map)
var fingerprintByCollege = new Map<string, string[]>();
void fingerprintByCollegeRef;

// Per-college ordinary fingerprints (unique stamps, pdf metadata)
colleges.forEach((c) => {
  const existing = fingerprintByCollege.get(c.id) ?? [];
  const stamp = addFp({
    kind: "stamp",
    label: `Institution stamp — ${c.name}`,
    hash: fnv1a64(`stamp:${c.id}:${c.name}`),
    meta: JSON.stringify({ issuer: c.name, docIssuer: "Institution", shape: "round", hue: (parseInt(c.id.slice(1), 10) * 47) % 360, serial: c.code }),
    collegeIds: [c.id],
  });
  const pdfMeta = addFp({
    kind: "pdf_meta",
    label: "PDF producer metadata",
    hash: fnv1a64(`pdf:${c.id}:producer`),
    meta: JSON.stringify({ producer: pick(["DocuScan 4.2", "ScanMaster Pro", "GovPDF 1.1"]), created: `2024-0${rint(1, 9)}-${rint(10, 28)}` }),
    collegeIds: [c.id],
  });
  fingerprintByCollege.set(c.id, [...existing, stamp.id, pdfMeta.id]);
});

export const fingerprints = fps;

// ---------------------------------------------------------------------------
// Document generation
// ---------------------------------------------------------------------------

const ISSUERS: Record<DocType, string> = {
  affidavit: "Civil Court / Notary",
  noc: "State Government (Higher & Technical Education)",
  accreditation: pick(["NBA", "NAAC"]) as string,
  lease: "Sub-Registrar of Assurances",
  land_record: "Revenue Department (7/12 Extract)",
  building_sanction: "Municipal Corporation",
  faculty_list: "Institution (HR)",
  financial_statement: "Chartered Accountant",
  site_photo: "Photographer / Inspection Cell",
};

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface DocSpec {
  type: DocType;
  college: College;
  appIndex: number;
  ringId?: string;
  forceStatus?: VerificationStatus;
  fieldOverrides?: Record<string, string>;
}

function fieldIndex(type: DocType, label: string): number {
  const order: DocType[] = ["affidavit", "noc", "accreditation", "lease", "land_record", "building_sanction", "faculty_list", "financial_statement", "site_photo"];
  return Math.max(0, order.indexOf(type)) % 6;
}

function makeEvidence(e: Omit<EvidenceBox, "id">): EvidenceBox {
  return { ...e, id: `EV-${rint(100000, 999999)}` };
}

function buildDoc(spec: DocSpec, fpIds: string[]): AppDoc {
  const { type, college, forceStatus } = spec;
  const status: VerificationStatus = forceStatus ?? pick(["verified", "verified", "verified", "pending", "manual_review"] as VerificationStatus[]);
  const issued = new Date(Date.UTC(2024, rint(0, 11), rint(1, 28)));
  const expiresOn =
    type === "noc" || type === "accreditation"
      ? fmtDate(new Date(issued.getTime() + rint(120, 640) * 86400000))
      : undefined;
  const docId = `D-${college.id}-${type}`;
  const fields: { label: string; value: string }[] = [
    { label: "Institution", value: college.name },
    { label: "AICTE Code", value: college.code },
    { label: "Issued By", value: ISSUERS[type] },
    { label: "Issued On", value: fmtDate(issued) },
    ...(expiresOn ? [{ label: "Valid Until", value: expiresOn }] : []),
    { label: "Document No.", value: `${type.toUpperCase().slice(0, 3)}/${2024}/${rint(1000, 9999)}` },
    { label: "Reference App", value: `EoA/${college.code}/2025` },
  ];

  // Verification notes
  const notes: Record<VerificationStatus, string> = {
    verified: "Issuer API confirmed record. QR checksum matches.",
    mismatch: "Field value differs from issuer registry response.",
    expired: "Validity ended before the application submission date.",
    pending: "Issuer endpoint did not respond; re-query scheduled.",
    source_unavailable: "Issuer registry unreachable for this document class.",
    manual_review: "Issuer offers no electronic verification; manual check queued.",
  };

  // Planted evidence boxes aligned to the canonical document layout.
  const evidence: EvidenceBox[] = [];
  if (status === "mismatch") {
    evidence.push(makeEvidence({
      x: 40,
      y: fieldRowY(0) - 20,
      w: 560,
      h: 30,
      reason: `Institution name differs from registry record for code ${college.code}`,
      severity: "high",
    }));
  }
  if (status === "expired" && expiresOn) {
    evidence.push(makeEvidence({
      x: 280,
      y: fieldRowY(4) - 20,
      w: 320,
      h: 30,
      reason: `Valid until ${expiresOn} — lapsed before submission`,
      severity: "high",
    }));
  }
  if (spec.ringId === "R1") {
    evidence.push(makeEvidence({
      x: 426, y: 548, w: 154, h: 154,
      reason: "Notarial seal matches filings from other institutions (see Constellation)",
      severity: "high",
      fingerprintId: fpIds.find((f) => fingerprints.find((x) => x.id === f)?.kind === "notary"),
    }));
  }
  if (spec.ringId === "R2") {
    evidence.push(makeEvidence({
      x: 54, y: 128, w: 252, h: 312,
      reason: "Photograph byte-identical to submissions from other campuses",
      severity: "high",
      fingerprintId: fpIds.find((f) => fingerprints.find((x) => x.id === f)?.kind === "photo"),
    }));
  }
  if (spec.ringId === "R3" && (type === "affidavit" || type === "lease")) {
    evidence.push(makeEvidence({
      x: 348, y: 688, w: 210, h: 44,
      reason: "Same authorised signatory appears on filings of other institutions",
      severity: "medium",
      fingerprintId: fpIds.find((f) => fingerprints.find((x) => x.id === f)?.kind === "signatory"),
    }));
  }
  if (status === "pending" || status === "source_unavailable" || status === "manual_review") {
    evidence.push(makeEvidence({
      x: 54, y: 612, w: 92, h: 92,
      reason: status === "pending" ? "Issuer QR not yet resolved — re-query scheduled" : "No electronic verification source",
      severity: "low",
    }));
  }

  return {
    id: docId,
    type,
    fileName: `${type}_${college.code}.pdf`,
    issuer: ISSUERS[type],
    issuedOn: fmtDate(issued),
    expiresOn,
    ocrConfidence: Number((96 + rng() * 3.8).toFixed(1)),
    classification: DOC_TYPE_LABEL[type],
    verification: status,
    verificationNote: notes[status],
    fields,
    evidence,
    fingerprintIds: fpIds,
  };
}

// ---------------------------------------------------------------------------
// Reality-gap cases
// ---------------------------------------------------------------------------

const GAP_COLLEGES = ["C03", "C15", "C27", "C34", "C39"];

function polygonFor(center: { lat: number; lng: number }, targetAreaSqft: number, seed: number, jitter: number): [number, number][] {
  const r = mulberry32(seed);
  const SQFT_PER_DEG_LAT = 364000;
  const latR = Math.sqrt(targetAreaSqft / Math.PI) / SQFT_PER_DEG_LAT;
  const lngR = latR / Math.cos((center.lat * Math.PI) / 180);
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const w = 1 + (r() - 0.5) * jitter;
    pts.push([center.lat + Math.sin(a) * latR * w, center.lng + Math.cos(a) * lngR * w]);
  }
  return pts;
}

function shoelaceAreaSqft(pts: [number, number][]): number {
  let a = 0;
  const SQFT_PER_DEG_LAT = 364000;
  for (let i = 0; i < pts.length; i++) {
    const [lat1, lng1] = pts[i];
    const [lat2, lng2] = pts[(i + 1) % pts.length];
    a += (lng2 * Math.cos((pts[0][0] * Math.PI) / 180) - lng1 * Math.cos((pts[0][0] * Math.PI) / 180)) * (lat2 - lat1);
  }
  return Math.abs(a) * SQFT_PER_DEG_LAT * 0.5;
}

function pointInPoly(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function overlapPct(a: [number, number][], b: [number, number][]): number {
  const lats = [...a, ...b].map((p) => p[0]);
  const lngs = [...a, ...b].map((p) => p[1]);
  const latMin = Math.min(...lats), latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
  let hit = 0, total = 0;
  const N = 60;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const lat = latMin + ((latMax - latMin) * i) / N;
      const lng = lngMin + ((lngMax - lngMin) * j) / N;
      const inA = pointInPoly(lat, lng, a);
      const inB = pointInPoly(lat, lng, b);
      if (inA || inB) total++;
      if (inA && inB) hit++;
    }
  }
  return total === 0 ? 0 : Math.round((hit / total) * 100);
}

interface GapSpec {
  collegeId: string;
  claimed: number;
  satellite: number;
  floors: number;
  exifPlausibility: "consistent" | "implausible" | "inconclusive";
  exifNote: string;
  roomDeficit: number; // 0..1 fraction of rooms below norm
  note: string;
}

const GAP_SPECS: GapSpec[] = [
  { collegeId: "C03", claimed: 41200, satellite: 19800, floors: 3, exifPlausibility: "implausible", exifNote: "Shadow direction 64° off the solar azimuth for the stated capture time (14:32 IST)", roomDeficit: 0.55, note: "Claimed built-up area is roughly twice the observed footprint; lab block not visible on imagery." },
  { collegeId: "C15", claimed: 26500, satellite: 22400, floors: 2, exifPlausibility: "consistent", exifNote: "Shadow geometry consistent with 11:05 IST capture", roomDeficit: 0.25, note: "Moderate shortfall in workshop and library areas against norms." },
  { collegeId: "C27", claimed: 52300, satellite: 46000, floors: 4, exifPlausibility: "inconclusive", exifNote: "Overcast capture; shadow plausibility could not be scored", roomDeficit: 0.35, note: "Third-floor teaching block claimed on a floor where imagery suggests terrace only." },
  { collegeId: "C34", claimed: 18900, satellite: 12400, floors: 2, exifPlausibility: "implausible", exifNote: "EXIF GPS of photo lies 3.1 km from the claimed site", roomDeficit: 0.45, note: "Site photo geotag does not match claimed coordinates; area shortfall above 30%." },
  { collegeId: "C39", claimed: 30800, satellite: 28600, floors: 3, exifPlausibility: "consistent", exifNote: "EXIF and shadow geometry consistent", roomDeficit: 0.1, note: "Minor deviations; within tolerance for inspection prioritisation." },
];

const ROOM_NAMES = ["Classroom 1", "Classroom 2", "Tutorial Room", "Drawing Hall", "Computer Lab", "Physics Lab", "Chemistry Lab", "Workshop", "Library", "Office & Faculty Room"];
const ROOM_NORMS = [720, 720, 600, 860, 900, 800, 800, 1100, 900, 500];

function gapScoreOf(g: GapSpec, overlap: number): number {
  const areaDev = Math.min(1, Math.abs(g.claimed - g.satellite) / g.claimed);
  const s = areaDev * 55 + g.roomDeficit * 30 + (g.exifPlausibility === "implausible" ? 15 : g.exifPlausibility === "inconclusive" ? 7 : 0);
  return Math.max(5, Math.min(100, Math.round(s)));
}

function roomsFor(g: GapSpec) {
  return ROOM_NAMES.map((name, i) => {
    const deficitHit = i / ROOM_NAMES.length < g.roomDeficit;
    const norm = ROOM_NORMS[i];
    const claimed = deficitHit ? Math.round(norm * (0.55 + (i % 3) * 0.08)) : norm + rint(0, 60);
    return { name, claimedSqft: claimed, normSqft: norm };
  });
}

const realityCases: RealityCase[] = GAP_SPECS.map((g, gi) => {
  const college = colleges.find((c) => c.id === g.collegeId)!;
  const claimedPoly = polygonFor({ lat: college.lat, lng: college.lng }, g.claimed / g.floors, 900 + gi, 0.15);
  const satPoly = polygonFor({ lat: college.lat + 0.0004, lng: college.lng + 0.0003 }, g.satellite / g.floors, 700 + gi, 0.85);
  const overlap = overlapPct(claimedPoly, satPoly);
  const deficitTotal = roomsFor(g).reduce((acc, r) => acc + Math.max(0, r.normSqft - r.claimedSqft), 0);
  return {
    collegeId: g.collegeId,
    applicationId: "",
    claimedBuiltUpSqft: g.claimed,
    satelliteFootprintSqft: Math.round(shoelaceAreaSqft(satPoly) * g.floors),
    overlapPct: overlap,
    claimCoordinates: { lat: college.lat, lng: college.lng },
    footprintPolygon: satPoly,
    floors: g.floors,
    rooms: roomsFor(g),
    photoExif: {
      fileName: `site_photo_${g.collegeId}.jpg`,
      gps: `${college.lat.toFixed(5)}, ${college.lng.toFixed(5)}`,
      capturedAt: `2025-0${rint(1, 9)}-${rint(10, 28)}T${String(rint(9, 15)).padStart(2, "0")}:${rint(10, 59)}:00+05:30`,
      camera: pick(["Canon EOS 1500D", "SM-G991B (phone)", "Redmi Note 12"]),
      expectedSunAzimuth: rint(120, 250),
      shadowDirectionObserved: 0,
      plausibility: g.exifPlausibility,
      plausibilityNote: g.exifNote,
    },
    gapScore: 0,
    note: g.note,
  };
});
realityCases.forEach((rc) => {
  const g = GAP_SPECS.find((x) => x.collegeId === rc.collegeId)!;
  rc.photoExif.shadowDirectionObserved = (rc.photoExif.expectedSunAzimuth + 180 + (g.exifPlausibility === "implausible" ? 64 : 2)) % 360;
  rc.gapScore = gapScoreOf(g, rc.overlapPct);
});
// expose claimed polygons for the map view
const claimedPolygons = new Map(GAP_SPECS.map((g, gi) => [g.collegeId, polygonFor(colleges.find((c) => c.id === g.collegeId)!, g.claimed / g.floors, 900 + gi, 0.15)]));

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export const applications: Application[] = colleges.map((college, i) => {
  const ringId = RING_A.includes(college.id) ? "R1" : RING_B.includes(college.id) ? "R2" : RING_C.includes(college.id) ? "R3" : undefined;
  const gapSpec = GAP_SPECS.find((g) => g.collegeId === college.id);
  const profile = ringId || gapSpec ? "major" : rng() < 0.22 ? "minor" : rng() < 0.55 ? "clean" : "clean";
  const category: AppCategory = pick(["New EoA", "Extension of EoA", "Renewal", "Additional Intake"] as AppCategory[]);

  const docPlan: { type: DocType; status?: VerificationStatus }[] = [
    { type: "affidavit", status: ringId === "R1" || ringId === "R3" ? "mismatch" : undefined },
    { type: "noc", status: profile === "major" && !ringId ? "expired" : rng() < 0.12 ? "expired" : undefined },
    { type: "land_record", status: profile === "major" ? "source_unavailable" : rng() < 0.15 ? "pending" : undefined },
    { type: "building_sanction" },
    { type: "lease", status: rng() < 0.2 ? "manual_review" : undefined },
    { type: "accreditation", status: rng() < 0.5 ? undefined : undefined },
    { type: "faculty_list" },
    { type: "financial_statement", status: rng() < 0.18 ? "pending" : undefined },
  ];
  if (ringId === "R2") docPlan.push({ type: "site_photo", status: "manual_review" });

  const fpIdsForCollege = fingerprintByCollege.get(college.id) ?? [];
  const docs = docPlan.map((d) =>
    buildDoc({ type: d.type, college, ringId, forceStatus: d.status }, fpIdsForCollege.filter((fid) => {
      const fp = fingerprints.find((f) => f.id === fid)!;
      return fp.kind === "stamp" || fp.kind === "pdf_meta" || (d.type === "affidavit" && (fp.kind === "notary" || fp.kind === "signatory")) || (d.type === "site_photo" && fp.kind === "photo") || (d.type === "lease" && fp.kind === "address");
    })),
  );

  // Checklist per category
  const checklist: ChecklistItem[] = docPlan.map((d, idx) => {
    const doc = docs[idx];
    const flagged = doc.verification !== "verified";
    return {
      id: `CK-${college.id}-${idx}`,
      label: DOC_TYPE_LABEL[d.type],
      required: idx < 6,
      status: doc ? (flagged ? "flagged" : "submitted") : "missing",
      docId: doc?.id,
      note: flagged ? doc.verificationNote : undefined,
    };
  });
  checklist.push(
    { id: `CK-${college.id}-sig`, label: "Authorised signatory declaration", required: true, status: ringId === "R3" ? "flagged" : "submitted", note: ringId === "R3" ? "Signatory shared with other filings" : undefined },
    { id: `CK-${college.id}-fee`, label: "Fee disclosure annexure", required: false, status: rng() < 0.15 ? "missing" : "submitted" },
  );

  // Trust score
  let docAuth = 100;
  let issuer = 100;
  for (const d of docs) {
    if (d.verification === "mismatch") { docAuth -= 22; issuer -= 18; }
    else if (d.verification === "expired") { docAuth -= 14; issuer -= 10; }
    else if (d.verification === "source_unavailable") { docAuth -= 12; issuer -= 20; }
    else if (d.verification === "pending") { docAuth -= 5; issuer -= 8; }
    else if (d.verification === "manual_review") { docAuth -= 4; issuer -= 4; }
  }
  const consistency = ringId === "R3" ? 45 : profile === "major" ? 65 : 100 - rint(0, 8);
  const plausibility = gapSpec
    ? (() => { const rc = realityCases.find((r) => r.collegeId === college.id)!; return Math.max(8, 100 - rc.gapScore); })()
    : rint(88, 100);
  const networkSignals = ringId
    ? 22
    : PAIR_ADDRESS.includes(college.id)
      ? 62
      : rint(85, 100);

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const factors = [
    { label: "Document authenticity", weight: 30, score: clamp(docAuth), note: `${docs.filter((d) => d.verification !== "verified").length} of ${docs.length} documents carry a verification flag` },
    { label: "Data consistency", weight: 20, score: clamp(consistency), note: consistency < 60 ? "Cross-field values conflict with issuer records" : "Extracted fields align across documents" },
    { label: "Issuer / registry verification", weight: 20, score: clamp(issuer), note: issuer < 60 ? "One or more issuer checks failed or unreachable" : "Issuer responses consistent" },
    { label: "Evidence plausibility", weight: 15, score: clamp(plausibility), note: gapSpec ? "Reality Twin discrepancy detected — see Reality Twin" : "Photographic and geo evidence plausible" },
    { label: "Network signals", weight: 15, score: clamp(networkSignals), note: ringId ? `Shared elements with other institutions — potential link, needs human verification` : PAIR_ADDRESS.includes(college.id) ? "Shared correspondence address with one other institution" : "No shared elements detected" },
  ];
  const total = clamp(factors.reduce((acc, f) => acc + (f.weight * f.score) / 100, 0));

  const flagSummary: string[] = [];
  for (const d of docs) {
    if (d.verification === "expired") flagSummary.push(`${DOC_TYPE_LABEL[d.type]} expired before submission`);
    if (d.verification === "mismatch") flagSummary.push(`${DOC_TYPE_LABEL[d.type]} — field mismatch vs registry`);
    if (d.verification === "source_unavailable") flagSummary.push(`${DOC_TYPE_LABEL[d.type]} — issuer source unavailable`);
    for (const ev of d.evidence) if (ev.fingerprintId) flagSummary.push(`${DOC_TYPE_LABEL[d.type]} — ${ev.reason}`);
  }
  if (gapSpec) flagSummary.push(`Reality Twin — claimed vs observed footprint discrepancy (gap score ${realityCases.find((r) => r.collegeId === college.id)!.gapScore})`);

  const stage: Application["stage"] = total < 55 ? "review" : ringId || gapSpec ? "validation" : pick(["validation", "decision", "review"] as const);
  const realityCase = realityCases.find((r) => r.collegeId === college.id);
  if (realityCase) realityCase.applicationId = `A${String(i + 1).padStart(3, "0")}`;

  return {
    id: `A${String(i + 1).padStart(3, "0")}`,
    collegeId: college.id,
    collegeName: college.name,
    collegeCode: college.code,
    city: college.city,
    state: college.state,
    category,
    program: PROGRAMS[i % PROGRAMS.length],
    intake: rint(60, 300),
    submittedAt: fmtDate(new Date(Date.UTC(2025, rint(5, 9), rint(1, 28)))),
    stage,
    docs,
    checklist,
    trust: {
      total,
      band: total >= 75 ? "high" : total >= 50 ? "medium" : "low",
      factors,
    },
    flagSummary,
    ringId,
    realityCase,
  };
});

export const realityCaseList = realityCases;

// ---------------------------------------------------------------------------
// Constellation graph (built with the real engine)
// ---------------------------------------------------------------------------

function buildConstellation(): Constellation {
  const shared = fingerprints.filter((f) => f.collegeIds.length > 1);
  const edges: ConstellationEdge[] = [];
  for (const fp of shared) {
    for (let i = 0; i < fp.collegeIds.length; i++) {
      for (let j = i + 1; j < fp.collegeIds.length; j++) {
        // Also match near-duplicate fingerprints of the same kind across colleges
        let distance = 0;
        if (fp.kind === "notary") {
          const other = ringANotaryShared.find((n) => n.collegeIds.includes(fp.collegeIds[j]));
          distance = other ? hammingDistance(fp.hash, other.hash) : 0;
        }
        edges.push({ a: fp.collegeIds[i], b: fp.collegeIds[j], fingerprintId: fp.id, kind: fp.kind, distance, ringId: fp.ringId });
      }
    }
  }
  const nodes = [...new Set(edges.flatMap((e) => [e.a, e.b]))];
  const comps = connectedComponents(nodes, edges).filter((c) => c.length > 1);
  const labels = detectCommunities(nodes, edges.map((e) => ({ a: e.a, b: e.b, weight: e.ringId ? 2 : 1 })));
  const clusters = comps.map((c) => {
    const ringId = c.map((id) => edges.find((e) => (e.a === id || e.b === id) && e.ringId)?.ringId).find(Boolean);
    const kinds = [...new Set(edges.filter((e) => c.includes(e.a) && c.includes(e.b)).map((e) => e.kind))];
    const label = labels.get(c[0])!;
    return { id: `CL-${label}`, collegeIds: c.sort(), ringId, kinds };
  });
  return { fingerprints: shared, edges, clusters };
}

export const constellation = buildConstellation();

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export const getApplication = (id: string) => applications.find((a) => a.id === id);
export const getCollege = (id: string) => colleges.find((c) => c.id === id);
export const getFingerprint = (id: string) => fingerprints.find((f) => f.id === id);
export const fingerprintsForApplication = (appId: string) => {
  const app = getApplication(appId);
  if (!app) return [];
  return app.docs.flatMap((d) => d.fingerprintIds).map((fid) => getFingerprint(fid)!).filter(Boolean);
};

export const DEMO_APP_ID = "A06"; // ring A application — opens the demo flow
export { LSH_BANDS };
