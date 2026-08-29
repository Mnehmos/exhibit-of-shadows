# DECISIONS — Silo Engine · The Exhibit of Shadows

Lightweight ADR log. Append-only: supersede, never edit.

**ADR-001 · three.js stays — it is the render backend, not the engine** (v3)
Context: we want engine-grade housekeeping (rooms, plugins, lifecycle, status, input). Tempting to build a custom engine and drop three.js.
Decision: build the Silo layer — core services + `roomManifest` + ctx contract — ON three.js r180, version-pinned. Only the core touches renderer/scene/camera; rooms receive everything through ctx (`ctx.THREE` included).
Consequences: radial point-light cubemap shadows, transmission glass, and ACES come free; a renderer swap (WebGPU, raw WebGL) stays possible because rooms never see three.js directly. Rejected: a custom WebGL engine (months of shadow/material reimplementation for zero visible gain) and bundler-first frameworks (weight we don't need).

**ADR-002 · single file until Phase 7**
Rooms live as in-file modules registered in `roomManifest`. Coral Court (Phase 7) becomes the first literal folder plugin via dynamic `import()`; only then do shared systems split into `js/`.

**ADR-003 · master-file / plugin contract**
The R1 block is the master exhibit file. Room plugins mount through ctx and never edit the core or each other. Load order is `roomManifest` (plugins.txt). Adding a room must stay a one-line act.

**ADR-004 · shadow discipline**
Every non-transparent mesh must block light — enforced by `applyShadowCasting()` after all rooms mount. Transparent materials (glass, water, beam, sheer sail cloth) and explicit `userData.noCast` marks are the only exemptions. The orb (light housing) and wall/floor/ceiling (receive-only architecture) are permanent exemptions.

**ADR-005 · diegetic controls**
All exhibit-tuning sliders live only inside the stagehand console (in-sim booth + overlay), usable by the guest from inside the hall. No page-level tuning panels; page buttons are quick actions only.

**ADR-006 · tool-checked documentation**
CATALOG.md and ORCHESTRATION.md are load-bearing, not prose: `tools/audit.mjs` verifies code ↔ catalog ↔ plan drift (and syntax) every session, and visual verification screenshots the served exhibit rather than trusting descriptions.

**ADR-007 · per-item file split deferred to Phase 7; triggers to supersede early** (v3)
Context: proposal to split Gallery One into ~30 per-catalog-item files now (1:1 catalog↔file mapping, `build()/update()/rebuild()` contract, `core/state.js`, per-file materials).
Decision: defer. The mapping benefit is already served by v3's section markers + CATALOG Code column + `tools/audit.mjs`; the split's real payoff (independent room folders, drop-in plugins) arrives exactly at Phase 7, where the proposal is adopted wholesale as the folder spec. Supersede ADR-002 early only if a trigger fires: script exceeds ~700 lines before Phase 7, two agents must edit concurrently, or a room needs runtime `import()` before Phase 7.
Consequences: one file a while longer; zero re-litigation — the split design is already written down and audit-checked.
