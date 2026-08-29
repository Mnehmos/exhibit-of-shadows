# KNOWN ISSUES — The Exhibit of Shadows

Tracked, unfixed, and unashamed. Each issue names its phase. Move to CATALOG Changelog when fixed.

| # | Issue | Phase | Notes |
|---|---|---|---|
| K-1 | Shadow sails have no collision — visitor walks through fabric | 4 | Soft angular push-out planned with balcony work |
| K-2 | Canvas is fixed 16:9 — portrait phones letterbox | — | Accepted; joystick layout compensates |
| K-3 | Caustics not implemented — tank floor is static-lit | 3 | OGART caustic sequences chosen in ASSETS.md |
| K-4 | GLB fish swap-in not implemented — loader detects packs but procedural minnows always render | 2 | `loadFishPack()` resolves; Phase 2 replaces troupe |
| K-5 | No runtime error capture in normal play — console errors only visible with devtools | — | Consider onerror → HUD badge |
| K-6 | Splice tooling hazard: PowerShell 5.1 `Get-Content -Raw` mangled UTF-8 (mojibake) — repaired in v4; future splices must use `-Encoding UTF8` or Node | — | Process note, not user-facing |
| K-7 | `demo-room` no-op is mounted in production manifest | — | Intentional smoke test (ADR-003 proof); remove if it ever costs anything |
| K-8 | Headless browser unavailable in this environment (Playwright browser build mismatch) — visual playtest is manual until fixed | — | Fix: `npx playwright@<mcp-version> install chromium`, or point MCP at system Chrome |
