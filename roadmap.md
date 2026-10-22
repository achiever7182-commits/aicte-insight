# AICTE VerifyAI — build roadmap

Hackathon prototype: AI-powered decision-support platform for EoA application validation.

## Tasks
- [x] Enable Lovable Cloud, install d3-force / leaflet / recharts / AI SDK + AI Elements
- [ ] Design system: dark premium tokens in src/styles.css, root shell + nav + safeguard banner
- [ ] Synthetic data engine: 40 colleges, 3 planted fraud rings, 5 reality-gap cases (src/data)
- [ ] Constellation engine: 64-bit fingerprints, popcount Hamming, LSH banding, clustering (src/lib/fingerprint.ts)
- [ ] Document renderer: SVG scan-look docs with evidence bounding boxes + stamp compare
- [ ] Route: / dashboard (stats, charts, pending actions, alerts)
- [ ] Route: /applications/$id (trust score breakdown, checklist, docs + evidence boxes)
- [ ] Route: /constellation (interactive graph, stamp side-by-side, ring report)
- [ ] Route: /reality-twin (EXIF/sun checks, floor-plan math, split map, priority list)
- [ ] Route: /copilot (grounded AI chat + citations + deficiency letter draft)
- [ ] Route: /benchmark (1M fingerprint matching benchmark with live timings)
- [ ] Route: /audit (audit log + human-in-the-loop panel)
- [ ] Copilot server function (Lovable AI, grounded, streaming server-side)
- [ ] audit_log table migration + client write/read
- [ ] Tests for trust score / hamming / rules, typecheck, build, Playwright verification
