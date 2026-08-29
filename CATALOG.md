# CATALOG — The Exhibit of Shadows · Silo Aquarium Museum

Itemized inventory of every room, every piece, and every display.
Mirrors the objects in `index.html` (IDs in *italics* are code identifiers). Update this file whenever the exhibit changes — append to the Changelog at the bottom.

Status legend: **BUILT** (in scene) · **PARTIAL** (footprint exists, not finished) · **PLANNED** (future room)

---

## R1 — Gallery One · "The Exhibit of Shadows" (rotunda) — BUILT

The main hall: a cylinder R 10.8 m × H 12.8 m with the centerpiece tank at its heart. Everything below is inside this room.

### R1.A — Architecture
| ID | Piece | Qty | Spec / position | Code |
|---|---|---|---|---|
| R1-A01 | Perimeter wall | 1 | Cylinder R 10.8, H 12.8, open top/bottom, backside-shaded, warm stone `#a09a8c`; primary shadow receiver | *wall* |
| R1-A02 | Floor disc | 1 | Circle R 10.8, dark stone `#413c35`; shadow receiver | *floor* |
| R1-A03 | Ceiling disc | 1 | Circle R 10.8 at y 12.8, `#8d887d`; shadow receiver | *ceiling* |
| R1-A04 | Structural ribs | 16 | Box 0.23 × 10.50 × 0.32, against wall at y≈5.9, every 22.5° | *rib loop* |
| R1-A05 | Balcony ring | 1 | Torus R 10.18, tube 0.19, at y 8.75 (see R2) | *balcony* |

### R1.B — Furnishings & fixtures
| ID | Piece | Qty | Spec / position | Code |
|---|---|---|---|---|
| R1-B01 | Viewing bench | 12 | Seat 1.65 × 0.16 × 0.50 on 2 legs, seat y 0.50, ring R 9.62, every 30° | *bench loop* |
| R1-B02 | Gallery lamp | 8 | PointLight `#ffd9aa`, I 0.55, range 4.5, ring R 10.0, y 7.5 (dim to 0.07 in shadow play) | *lamps[]* |
| R1-B03 | Ambient hemisphere light | 1 | Sky `#dbe3df` / ground `#252727`, slider-controlled | *galleryAmbient* |
| R1-B04 | Shadow sail (display surface D1–D8) | 8 | Sheer cloth plane 2.55 × 5.50, cream `#e9e2d0`, center y 4.55; top rod 2.75 + suspension wire; ring R 8.55, every 45°, tilted −0.10 toward core; primary fish-shadow catchers | *sails* |
| R1-B08 | Stagehand console booth | 1 | Podium + glowing screen + accent strip; in the sail gap at 45° facing the tank through open hall; interact R 2.6 m | *consoleGroup* |

### R1.C — The Display: centerpiece tank
| ID | Piece | Qty | Spec / position | Code |
|---|---|---|---|---|
| R1-C01 | Glass shell | 1 | Cylinder R 3.15, H 8.6, physical transmission 0.90, open-ended | *glass* |
| R1-C02 | Water volume | 1 | Cylinder R 3.02, H 8.08, tinted transmission 0.78 | *water* |
| R1-C03 | Trim ring | 2 | Torus R 3.21, tube 0.12, tank top & bottom | *ring loop* |
| R1-C04 | Plinth | 1 | Cylinder R 3.67, H 0.55, graphite `#353638` | *plinth* |
| R1-C05 | Substrate bed | 1 | Cylinder R 2.93, H 0.22, sand `#655f50` | *substrate* |
| R1-C06 | Light column (beam) | 1 | Additive cylinder R 0.48, gradient alpha, core of the exhibit | *lightColumn* |
| R1-C07 | Core orb | 1 | Sphere R 0.32, emissive `#ffbd59` (breathes during shadow play) | *orb* |
| R1-C08 | Central light | 1 | **Shadow-casting PointLight** `#ffd99a`, cubemap 512²/1024², far 15.8 — the instrument of the exhibit | *centralLight* |
| R1-C09 | Dust motes | 280 | Additive points R 0.032, spiral drift inside water volume | *motes* |
| R1-C10 | Exhibit plaque | 1 | "THE EXHIBIT OF SHADOWS — SILO AQUARIUM MUSEUM · GALLERY ONE", on plinth south face (+Z) | *plaque* |

### R1.D — Habitat (inside the display)
| ID | Piece | Qty | Spec | Code |
|---|---|---|---|---|
| R1-D01 | Stem plant + leaves | 6 + density slider (17 @ default 58%) | Stem R 0.025–0.055, H 0.8–2.5, 5 leaves each, 4 greens; rebuilt on slider change | *buildHabitat* |
| R1-D02 | Rock | 7 | Icosahedron detail 1, size 0.14–0.32 | *buildHabitat* |
| R1-D03 | Minnow (livestock) | 6–28 (16 default) | Procedural body 28 rings × 14 sides + tail/dorsal fins, size ×0.70–1.07; states: cruise / explore / feed; boids + phototaxis + vortex forces | *minnowMesh, createFish, updateFish* |
| R1-D04 | Food pellets | 12 per feeding | Spheres R 0.035, sink to substrate, removed after 28 s | *feedExhibit, updateFood* |

### R1.E — Systems (interactive)
| ID | System | Notes | Code |
|---|---|---|---|
| R1-E01 | Visitor avatar | Torso, head, 2 legs, camera prop; ring corridor R 3.97–10.12 | *player* |
| R1-E02 | Camera modes | First-person / third-person | *setMode, updateCamera* |
| R1-E03 | Mouse-look | Pointer-lock on click, ESC frees; touch drag fallback | *lockLook* |
| R1-E04 | Movement | WASD + joystick + hold buttons, speed slider | *updatePlayer* |
| R1-E05 | Shadow play | Dims gallery (B02→0.07, B03→×0.18), core breathing, +30 schooling, vortex swirl | *setShadowPlay* |
| R1-E06 | Feeding | Spawns D04, fish switch to feed state | *feedExhibit* |
| R1-E07 | Stagehand console (controls) | All 9 sliders live only in the in-sim console; approach booth + E (desktop) / tap (touch); movement frozen while open | *consolePanel* |
| R1-E08 | Radiant visitors | PLANNED (Phase 5): 2–3 wanderers reusing the player rig + steering | — |
| R1-E09 | Room manifest (plugin load order) | Rooms mount through ctx services; demo-room line proves the one-line add | *roomManifest* |
| R1-E10 | Shadow discipline pass | Every non-transparent mesh casts; glass/water/beam/sheer sails and userData.noCast exempt | *applyShadowCasting* |
| R1-E11 | Declarative control registry | Controls are data (`defineControl`); console DOM generated; audit-verified surface | *defineControl* |
| R1-E12 | Gravity system (magic) | −100…200% — pellet sink rate + fish buoyancy force | *updateFish/updateFood* |
| R1-E13 | Hall time (magic) | 10…300% world-time scale; visitor stays real-time (ADR-009) | *frame()* |
| R1-E14 | Bioluminescence (magic) | 0–100% fish-body emissive glow `#7fd4c1` — pairs with Shadow play | *setGlow* |
| R1-E15 | Minnow scale (magic) | 30–250% live troupe resize; bounds clamping absorbs giants | *setScale* |

---

## R2 — Mezzanine Balcony — PARTIAL
| ID | Piece | Status | Notes |
|---|---|---|---|
| R2-P01 | Balcony ring (R1-A05) | BUILT | Visible torus at y 8.75 |
| R2-P02 | Balcony walkway & railing | PLANNED | Walkable ring deck, railing balusters |
| R2-P03 | Upper gallery lamps | PLANNED | Downlights onto the sails from above |

## R3 — Entrance Vestibule — PLANNED
| ID | Piece | Status | Notes |
|---|---|---|---|
| R3-P01 | Doorway / portal in wall | PLANNED | Arched opening, south rib bay |
| R3-P02 | Ticket desk | PLANNED | Quaternius Furniture Pack candidate |
| R3-P03 | donor wall / directory | PLANNED | Canvas-texture board (plaque tech reused) |

## R4 — Coral Court (side gallery) — PLANNED
Quaternius fish pack + Sketchfab CC0 corals; secondary tank, smaller point-light shadow display.

## R5 — Jellyfish Chamber (dark room) — PLANNED
Near-black room, drifting bell meshes, single upward light; the purest shadow room.

---

## Display registry (cross-reference)
| Display | Location | Content | Light source |
|---|---|---|---|
| D-MAIN | R1 centerpiece | R1-C01…C10 + habitat R1-D01…04 + livestock | R1-C08 central light |
| D1–D8 | R1 sails | Radial fish/visitor silhouettes | R1-C08 |
| D-WALL | R1 perimeter wall | Wide radial silhouettes, ribs cut shadow stripes | R1-C08 + B02 |
| D-FLOOR / D-CEIL | R1 floor & ceiling | fan/radial shadows | R1-C08 |

## Source map (v5 — code layout)

| Catalog section | File |
|---|---|
| R1.A architecture (A01–A05) | `src/rooms/r1/architecture.js` |
| R1.B furnishings (B01–B04) | `src/rooms/r1/fixtures.js` |
| R1.B08 console booth | `src/rooms/r1/booth.js` |
| R1.C display (C01–C10) | `src/rooms/r1/display.js` |
| R1.D01–D02 habitat | `src/rooms/r1/habitat.js` |
| R1.D03 minnows | `src/rooms/r1/minnow.js` |
| R1.D04 food | `src/rooms/r1/food.js` |
| R1.E systems (E05–E15) | `src/rooms/r1/systems.js` |
| Room assembly (mount) | `src/rooms/r1/index.js` |
| R1 geometry constants | `src/rooms/r1/constants.js` |
| Core services (state/world/controls/player/input/console/assets/shadows) | `src/core/*.js` |
| Manifest + loop + HUD | `src/main.js` |

## Changelog
- **v5 — modular file tree (ADR-010)**: `index.html` is now a shell; code split into `src/main.js`, `src/core/*` (9 services), `src/rooms/r1/*` (10 parts); audit walks the tree; hall time wired into the loop (E13 actually live); deployed Pages unchanged.
- **v4 — magic systems + declarative console**: control registry (E11) generates the stagehand console; added Impossible things — gravity E12, hall time E13, bioluminescence E14, minnow scale E15; Phase 1 asset pipeline wired (importmap + `loadFishPack`, inert until `assets/fish/manifest.json`); repo git-initialized; STATUS/KNOWN-ISSUES docs added.
- **v3 — plugin architecture + orientation tools**: Phase 0 landed — master core + `roomManifest` (`r1-gallery-one`, `demo-room`) with ctx contract (ADR-003); stagehand console booth relocated to the 45° sail gap facing the tank (ADR-005: sliders now in-sim only); shadow discipline pass E10, sail cloth now sheer (ADR-004); `tools/audit.mjs` added (ADR-006).
- **v2 — theme pass**: exhibit renamed; added R1-B04 sails, R1-C06 beam gradient, R1-C09 motes, R1-C10 plaque, R1-E05 shadow play, light-pull phototaxis; darkened A02/A03-adjacent palette.
- **v1 — original**: hall, tank, procedural minnows, sliders, first import.
