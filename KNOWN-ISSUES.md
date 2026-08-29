# KNOWN ISSUES — The Exhibit of Shadows

Tracked, unfixed, and unashamed. Each issue names its phase. Move to CATALOG Changelog when fixed.

| # | Issue | Phase | Notes |
|---|---|---|---|
| K-1 | Shadow sails have no collision — visitor walks through fabric | 4 | Soft angular push-out planned with balcony work |
| K-2 | Canvas is fixed 16:9 — portrait phones letterbox | — | Accepted; joystick layout compensates |
| K-5 | No runtime error capture in normal play — console errors only visible with devtools | — | Consider onerror → HUD badge |
| K-6 | Splice tooling hazard: PowerShell 5.1 `Get-Content -Raw` mangled UTF-8 (mojibake) — repaired in v4; future splices must use `-Encoding UTF8` or Node | — | Process note, not user-facing |
| K-7 | `demo-room` no-op is mounted in production manifest | — | Intentional smoke test (ADR-003 proof); remove if it ever costs anything |
| K-9 | Hero clownfish is intentionally stylized and procedural | 3 | The tank and booth now share the graphic asset. Replace only if the art direction changes toward a licensed high-detail rig; water, lighting, caustic and capture pipelines are already reusable |
| K-10 | Static audit verifies import targets + named exports, but cannot catch used-but-unimported identifiers — a dropped `loadFishPack` import shipped live once | — | Next: add a real lint pass (eslint no-undef) to `tools/audit.mjs` |
