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
| R1-B09 | Curator key light | 1 | Soft warm fill `#fff4e0` I .5 at (0, 10.5, 6.5); no shadow casting; keeps specimen flanks readable | *keyLight* |

### R1.C — The Display: centerpiece tank
| ID | Piece | Qty | Spec / position | Code |
|---|---|---|---|---|
| R1-C01 | Glass shell | 1 | Cylinder R 3.15, H 8.6, physical transmission 0.90, open-ended | *glass* |
| R1-C02 | Water volume | 1 | Cylinder R 3.02, H 8.08, tinted transmission 0.78 | *water* |
| R1-C03 | Trim ring | 2 | Torus R 3.21, tube 0.12, tank top & bottom | *ring loop* |
| R1-C04 | Plinth | 1 | Cylinder R 3.67, H 0.55, graphite `#353638` | *plinth* |
| R1-C05 | Dune bed | 1 | Sculpted displaced sand disc (3-wave ridges), moonlit `#cbb894` | *dunes* |
| R1-C06 | God-ray beams | 3 | Nested additive cones from the core, gradient alpha, slow rotation | *beams* |
| R1-C07 | Moonstone core | 1 | Faceted icosahedron R 0.34, amber emissive pulse, rotates + bobs | *moonstone* |
| R1-C08 | Central light | 1 | **Shadow-casting PointLight** `#ffd99a`, cubemap 512²/1024², far 15.8 — the instrument of the exhibit | *centralLight* |
| R1-C09 | Plankton sparkle + bubbles | 160 + 80 | Additive drift points (plankton) + rising wobble columns (bubbles) | *plankton, bubbles* |
| R1-C10 | Exhibit plaque | 1 | "THE EXHIBIT OF SHADOWS — SILO AQUARIUM MUSEUM · GALLERY ONE", on plinth south face (+Z) | *plaque* |
| R1-C11 | Water surface study | 1 | Physical-transmission disc at waterline; IOR 1.333, low roughness, clearcoat | *surface* |
| R1-C12 | Animated caustic study | 1 | Procedural additive pattern projected on substrate; slow offset + rotation | *caustics* |
| R1-C13 | Hero aquarium key rig | 2 | Cool non-shadow SpotLights shaping the hero specimen inside the tank | *keyA, keyB* |

### R1.D — Habitat (inside the display)
| ID | Piece | Qty | Spec | Code |
|---|---|---|---|---|
| R1-D01 | Stem plant + leaves | 6 + density slider (17 @ default 58%) | Stem R 0.025–0.055, H 0.8–2.5, 5 leaves each, 4 greens; rebuilt on slider change | *buildHabitat* |
| R1-D02 | Rock | 7 | Icosahedron detail 1, size 0.14–0.32 | *buildHabitat* |
| R1.D03 | Fish troupe (livestock) | 6–28 prey (16 default) + 0–3 sharks | GLB species — prey: clownfish 60% / butterfly fish 40%; predator: shark — SkeletonUtils clones from `assets/fish/`; AnimationMixer swim clips beat-linked to velocity; boids + phototaxis + vortex + hard fish↔fish collision | *speciesCatalog, createFish, updateFish, updateAll* |
| R1.D06 | Predator — shark (needs-driven) | 0–3 | Patrols mid-tank when fed; hunts nearest prey below 45% energy; chomp (+18 energy) at contact; starves to a weak drift at 0; never casts-hog, full shark minds its own business | *updatePredator, ecosystem.js* |
| R1-D04 | Food pellets | 12 per feeding | Spheres R 0.035, sink to substrate, removed after 28 s | *feedExhibit, updateFood* |
| R1-D07 | Hero clownfish quality study | 0 | RETIRED from the main tank in v9 — the study lives on as a photo-booth specimen (photo-booth.html) | *createHeroFishSpecimen* |

### R1.E — Systems (interactive)
| ID | System | Notes | Code |
|---|---|---|---|
| R1-E01 | Visitor avatar | Torso, head, 2 legs, camera prop; ring corridor R 3.97–10.12 | *player* |
| R1-E02 | Camera modes | First-person / third-person | *setMode, updateCamera* |
| R1-E03 | Mouse-look | Pointer-lock on click, ESC frees; touch drag fallback | *lockLook* |
| R1-E04 | Movement | WASD + joystick + hold buttons, speed slider | *updatePlayer* |
| R1-E05 | Shadow play | Dims gallery (B02→0.07, B03→×0.18), core breathing, +30 schooling, vortex swirl | *setShadowPlay* |
| R1-E06 | Feeding | Spawns D04, fish switch to feed state | *feedExhibit* |
| R1-E07 | Stagehand console (controls) | 17 declared controls in 5 groups (Exhibit / Impossible things / Shadow hall / Ecosystem / Visitor); approach booth + E (desktop) / tap (touch); movement frozen while open | *consolePanel* |
| R1-E08 | Radiant visitors | PLANNED (Phase 5): 2–3 wanderers reusing the player rig + steering | — |
| R1-E09 | Room manifest (plugin load order) | Rooms mount through ctx services; demo-room line proves the one-line add | *roomManifest* |
| R1-E10 | Shadow discipline pass | Every non-transparent mesh casts; glass/water/beam/sheer sails and userData.noCast exempt | *applyShadowCasting* |
| R1-E11 | Declarative control registry | Controls are data (`defineControl`); console DOM generated; audit-verified surface | *defineControl* |
| R1-E12 | Gravity system (magic) | −100…200% — pellet sink rate + fish buoyancy force | *updateFish/updateFood* |
| R1-E13 | Hall time (magic) | 10…300% world-time scale; visitor stays real-time (ADR-009) | *frame()* |
| R1-E14 | Bioluminescence (magic) | 0–100% fish-body emissive glow `#7fd4c1` — pairs with Shadow play | *setGlow* |
| R1.E15 | Minnow scale (magic) | 30–250% live troupe resize; bounds clamping absorbs giants | *setScale* |
| R1-E16 | Ecosystem: needs + hatchery | Shark energy drain (Hunger rate slider), hunt/rest/starve states, chomp +18; Hatchery slider restocks prey at the plant bed (0 = off) | *ecosystem.js* |

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
| D-MAIN | R1 centerpiece | R1-C01…C13 + habitat R1-D01…04/R1-D06 + livestock | R1-C08 central light + R1-C13 hero keys |
| D1–D8 | R1 sails | Radial fish/visitor silhouettes | R1-C08 |
| D-WALL | R1 perimeter wall | Wide radial silhouettes, ribs cut shadow stripes | R1-C08 + B02 |
| D-FLOOR / D-CEIL | R1 floor & ceiling | fan/radial shadows | R1-C08 |

## Source map (v7 — code layout)

| Catalog section | File |
|---|---|
| R1.A architecture (A01–A05) | `src/rooms/r1/architecture.js` |
| R1.B furnishings (B01–B04) | `src/rooms/r1/fixtures.js` |
| R1.B08 console booth | `src/rooms/r1/booth.js` |
| R1.C display (C01–C10) | `src/rooms/r1/display.js` |
| R1.C11–C13 + R1.D06 hero quality study | `src/rooms/r1/heroFish.js` |
| R1.D01–D02 habitat | `src/rooms/r1/habitat.js` |
| R1.D03 fish troupe | `src/rooms/r1/troupe.js` + `speciesCatalog.js` |igin/main
| R1.D04 food | `src/rooms/r1/food.js` |
| R1.D06 predator + R1-E16 ecosystem | `src/rooms/r1/ecosystem.js` |
| R1.E systems (E05–E15) | `src/rooms/r1/systems.js` |
| Room assembly (mount) | `src/rooms/r1/index.js` |
| R1 geometry constants | `src/rooms/r1/constants.js` |
| Core services (state/world/controls/player/input/console/assets/shadows) | `src/core/*.js` |
| Manifest + loop + HUD | `src/main.js` |

## Changelog
- **v9 — THE MOON DUNE (center-tank redesign)**: authored tank replaces the generic cylinder — night-ocean gradient water shell, sculpted dune bed, animated caustic light-webs, faceted moonstone core in layered god-rays, bronze armillary trim, bubbles + plankton; moon minnows return as the centerpiece (88-strong bait ball, hard separation, flee, hatchery grow-in, moon-glow in Shadow play); hero clownfish retired to the photo booth; exposure .8, environment fill cut to 8%.
- **v8 — center-tank ecosystem (Phase 2.5)**: roles on species (prey/predator); shark needs — patrol when fed, hunt below 45% energy, chomp +18, starve-drift at 0 (user rule: *a full shark minds its own business*); Hatchery slider restocks prey at the plant bed with grow-in; Ecosystem console group (sharks/hunger/restock); hunt capture scenario; import-resolution audit caught 2 bad imports pre-deploy.
- **v7.3 — stylized procedural hero pass**: replaced the photoreal-leaning hero attempt with a shared graphic clownfish asset used by both the live tank and photo booth: custom axial silhouette, clean black/white/orange bands, satin materials, expressive eye highlights, readable mouth and softer fin motion; capped body geometry closes front and rear views.
- **v7.2 — complete specimen catalog**: reusable `src/photobooth/stage.js` now isolates all 13 project fish entriesâ€”11 GLB models plus the procedural hero clownfish and procedural minnow archiveâ€”with automatic centering, longest-axis alignment and common framing; dedicated `photo-booth.html` adds live animation where available, side/¾/front poses, drag/zoom, turntable and PNG export; `tools/capture-photo-booth.mjs` and visual-smoke CI render the complete catalog after each deployment.
- **v7.1 — specimen photo booth**: reusable `src/photobooth/stage.js` isolates all 11 GLB models with automatic centering, longest-axis alignment and common framing; dedicated `photo-booth.html` adds live animation, side/¾/front poses, drag/zoom, turntable and PNG export; `tools/capture-photo-booth.mjs` and visual-smoke CI render the full manifest after each deployment.
- **v7 — Phase 3 quality study started**: one repo-native hero clownfish now patrols the visitor-facing half of the big tank with dense deforming geometry, physical wet materials, micro-scale surface maps, layered fins and wet corneas; glass/water use physical transmission and attenuation; animated procedural surface/caustic cues and a two-light underwater key rig landed; exposure rebalanced; automated GitHub Actions visual-smoke captures verify the deployed WebGL result.
- **v6 — Phase 2 complete**: procedural minnows retired; GLB species troupe (`src/rooms/r1/troupe.js` + `speciesCatalog.js` + `artDirection.js`, Plant Forge pattern) — 3 species, AnimationMixer swim clips beat-linked to velocity, hard fish↔fish collision, phototaxis/vortex/gravity/glow/scale all live on GLB bodies; `window.__aquarium` capture API + `tools/capture-exhibit.mjs` runner (Playwright, SwiftShader) with scenario×view evidence matrix in `evidence/captures/`; curator key light B09; environment reflections dim during Shadow play.
- **v5.3 — specimen quality + lighting pass**: preview specimen normalized/centered, plays its swim clip via AnimationMixer, emissive material lift (no black-blob); PMREM `RoomEnvironment` reflections at 25% intensity; lamps rebalanced .45; curator key light added (B09); duplicate HUD assets status removed.
- **v5.2 — Phase 1 complete**: 11 Quaternius CC0 GLB fish downloaded into `assets/fish/` (D05-adjacent, see ATTRIBUTION.md); loader renders a preview specimen orbiting the core with real shadows; manifest is the drop-in point for more models; habitat import fix (K-list audit catch).
- **v5.1 — hotfix**: `syncFish()` restored to init (v5 split dropped it — troupe never spawned); `assets/fish/manifest.json` placeholder kills the console 404; playtest step 1 asserts the minnow count.
- **v5 — modular file tree (ADR-010)**: `index.html` is now a shell; code split into `src/main.js`, `src/core/*` (9 services), `src/rooms/r1/*` (10 parts); audit walks the tree; hall time wired into the loop (E13 actually live); deployed Pages unchanged.
- **v4 — magic systems + declarative console**: control registry (E11) generates the stagehand console; added Impossible things — gravity E12, hall time E13, bioluminescence E14, minnow scale E15; Phase 1 asset pipeline wired (importmap + `loadFishPack`, inert until `assets/fish/manifest.json`); repo git-initialized; STATUS/KNOWN-ISSUES docs added.
- **v3 — plugin architecture + orientation tools**: Phase 0 landed — master core + `roomManifest` (`r1-gallery-one`, `demo-room`) with ctx contract (ADR-003); stagehand console booth relocated to the 45° sail gap facing the tank (ADR-005: sliders now in-sim only); shadow discipline pass E10, sail cloth now sheer (ADR-004); `tools/audit.mjs` added (ADR-006).
- **v2 — theme pass**: exhibit renamed; added R1-B04 sails, R1-C06 beam gradient, R1-C09 motes, R1-C10 plaque, R1-E05 shadow play, light-pull phototaxis; darkened A02/A03-adjacent palette.
- **v1 — original**: hall, tank, procedural minnows, sliders, first import.
