// Core domain types for AICTE VerifyAI prototype.
// All data in the app is synthetic — no real personal or institutional data.

export type VerificationStatus =
  | "verified"
  | "mismatch"
  | "expired"
  | "pending"
  | "source_unavailable"
  | "manual_review";

export type DocType =
  | "affidavit"
  | "noc"
  | "accreditation"
  | "lease"
  | "land_record"
  | "building_sanction"
  | "faculty_list"
  | "financial_statement"
  | "site_photo";

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  affidavit: "Affidavit of Compliance",
  noc: "No Objection Certificate",
  accreditation: "Accreditation Certificate",
  lease: "Lease Deed / Ownership Proof",
  land_record: "Land Record Extract",
  building_sanction: "Building Sanction Plan",
  faculty_list: "Faculty & Staff List",
  financial_statement: "Financial Statement",
  site_photo: "Site Inspection Photograph",
};

export interface EvidenceBox {
  id: string;
  /** Virtual page coordinates on a 640x820 page */
  x: number;
  y: number;
  w: number;
  h: number;
  reason: string;
  severity: "high" | "medium" | "low";
  fingerprintId?: string;
}

export interface AppDocField {
  label: string;
  value: string;
}

export interface AppDoc {
  id: string;
  type: DocType;
  fileName: string;
  issuer: string;
  issuedOn: string;
  expiresOn?: string;
  ocrConfidence: number;
  classification: string;
  verification: VerificationStatus;
  verificationNote: string;
  fields: AppDocField[];
  evidence: EvidenceBox[];
  fingerprintIds: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  status: "submitted" | "missing" | "flagged";
  docId?: string;
  note?: string;
}

export interface TrustFactor {
  label: string;
  weight: number;
  score: number; // 0-100
  note: string;
}

export interface TrustScore {
  total: number;
  band: "high" | "medium" | "low";
  factors: TrustFactor[];
}

export type AppCategory =
  | "New EoA"
  | "Extension of EoA"
  | "Renewal"
  | "Additional Intake";

export interface Application {
  id: string;
  collegeId: string;
  collegeName: string;
  collegeCode: string;
  city: string;
  state: string;
  category: AppCategory;
  program: string;
  intake: number;
  submittedAt: string;
  stage: "intake" | "validation" | "review" | "decision";
  docs: AppDoc[];
  checklist: ChecklistItem[];
  trust: TrustScore;
  flagSummary: string[];
  ringId?: string;
  realityCase?: RealityCase;
}

export type FpKind = "stamp" | "notary" | "photo" | "signatory" | "address" | "pdf_meta";

export interface Fingerprint {
  id: string;
  kind: FpKind;
  label: string;
  /** 64-bit hash as 16-hex-digit string */
  hash: string;
  meta: string;
  collegeIds: string[];
  docIds: string[];
  ringId?: string;
}

export interface ConstellationEdge {
  a: string; // college id
  b: string; // college id
  fingerprintId: string;
  kind: FpKind;
  distance: number;
  ringId?: string;
}

export interface Constellation {
  fingerprints: Fingerprint[];
  edges: ConstellationEdge[];
  clusters: { id: string; collegeIds: string[]; ringId?: string; kinds: FpKind[] }[];
}

export interface RealityCase {
  collegeId: string;
  applicationId: string;
  claimedBuiltUpSqft: number;
  satelliteFootprintSqft: number;
  overlapPct: number;
  claimCoordinates: { lat: number; lng: number };
  footprintPolygon: [number, number][]; // [lat,lng]
  floors: number;
  rooms: { name: string; claimedSqft: number; normSqft: number }[];
  photoExif: {
    fileName: string;
    gps: string;
    capturedAt: string;
    camera: string;
    expectedSunAzimuth: number;
    shadowDirectionObserved: number;
    plausibility: "consistent" | "implausible" | "inconclusive";
    plausibilityNote: string;
  };
  gapScore: number;
  note: string;
}

export interface AuditEntry {
  id: string;
  created_at: string;
  actor: string;
  role: string;
  action: "approve" | "override" | "request_evidence" | "note";
  application_id: string;
  application_label: string;
  detail: Record<string, unknown>;
}
