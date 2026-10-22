# AICTE Insight

Build a hackathon-ready prototype called "AICTE VerifyAI" for the AICTE problem statement: an AI-powered platform that validates Extension of Approval (EoA) applications and supports officers with decision-support only (never final decisions).

TECH STACK
- Frontend: React + Vite + TypeScript + Tailwind, dark premium UI, D3 or Three.js for graphs, Leaflet/MapLibre for maps
- Backend: Lovable Cloud / Edge Functions with TypeScript
- Charts: Recharts

CORE MODULES
1. Application intake and validation
   - Upload documents (affidavit, NOC, accreditation, lease, etc.)
   - OCR + document classification + field extraction
   - Checklist per application category, flagging missing/expired/inconsistent items
   - Verification status: verified, mismatch, expired, pending, source unavailable, manual review (mock issuer API/QR verification)
2. Trust Score (0-100) per application with a "why" breakdown
3. Evidence-highlighted flags: bounding box on the exact spot in the document with a one-line reason
4. FLAGSHIP 1, Fraud Constellation
   - Fingerprint every document: stamp/seal perceptual hash, signatory, PDF metadata, photo hashes, IDs, addresses
   - Fast Hamming-distance matching (popcount), LSH index for near-duplicates, graph clustering (connected components + Louvain)
   - UI: interactive glowing graph of colleges linked by shared elements. Click a node to see the matching stamp side by side. Generate a Ring Report
   - Wording: "Potential link, needs human verification". Never say "fraud" as a conclusion
5. FLAGSHIP 2, Reality Twin ("Claimed vs Reality")
   - Photo EXIF GPS and timestamp check, sun-angle/shadow plausibility check
   - Claimed built-up area vs satellite/OSM footprint (polygon area/overlap)
   - Floor plan room-area math vs AICTE-style norms (configurable)
   - Reality Gap Score per college with split map view (claimed vs satellite)
   - Output: inspection priority list, "discrepancy for inspection", not accusation
6. Officer Copilot: chat grounded in application data with citations, plus auto-drafted deficiency letter
7. Human-in-the-loop panel: approve / override / request evidence, with full audit trail
8. Dashboard: validation status, pending actions, alerts, role-based views (officer, admin, college)

DATA
- Generate 40 synthetic colleges/applications with realistic documents
- Plant 3 fraud rings (shared stamp/photo/notary) and 5 Reality Gap cases so the live demo always works
- No real personal data

DEMO FLOW
Open flagged application -> Trust Score breakdown -> evidence boxes on document -> Constellation graph reveals ring -> Reality Twin map shows gap -> Copilot drafts deficiency letter -> officer decision logged.

EXTRAS
- Benchmark page: comparison matching time on 1M fingerprints
- Role-based access, audit log, explainable flags with evidence
- Safeguard banner: "AI output is decision support. Final decisions rest with competent AICTE authority."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/60e6ad48-b00d-42b2-90c5-dd59e5dd500c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
