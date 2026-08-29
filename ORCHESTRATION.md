# ORCHESTRATION — The Exhibit of Shadows · Silo Aquarium Museum

The build plan: how work is sequenced, which workstream owns which catalog IDs, and the rules every change follows. Companion docs: **CATALOG.md** (what exists), **ASSETS.md** (what we build with), this file (in what order, and how).

---

## 1. File map

| File | Role |
|---|---|
| `index.html` | The entire exhibit — single-file module, loads three@0.180.0 from jsDelivr |
| `CATALOG.md` | Itemized inventory (rooms R#, pieces, displays D#); every scene change appends to its Changelog |
| `ASSETS.md` | Vetted open-source asset sources + licenses + integration notes |
| `ORCHESTRATION.md` | This file — sequencing, workstreams, conventions |
| `DECISIONS.md` | ADR log — why the engine is shaped this way (engine/render split, plugin contract, shadow discipline) |
| `tools/audit.mjs` | Orientation tool — verifies code ↔ CATALOG ↔ ORCHESTRATION drift + syntax; run every session |
| `README.md` | Run instructions + controls |
| `ATTRIBUTION.md` | *(created when first non-CC0 asset lands)* credit list |

## 2. Current state (v5)

Built: Gallery One complete (R1.A–E) with the in-sim stagehand console and magic systems (E12–E15). **Phase 0 done; ADR-010 adopted** — code lives in a modular file tree (`src/main.js` + `src/core/*` + `src/rooms/r1/*`), three.js pinned via importmap. **Phase 1 ◐** loader wired, awaiting asset pack. Public: https://github.com/Mnehmos/exhibit-of-shadows · https://mnehmos.github.io/exhibit-of-shadows/

## 3. Workstreams

| WS | Scope | Catalog IDs | Status |
|---|---|---|---|
| **WS-A · Architecture** | Rooms, shells, walkable geometry | R1.A, R2.*, R3.P01 | R1 done, R2 next |
| **WS-B · Livestock & behavior** | Fish, boids, phototaxis, feeding, new species AI | R1.D | v2 done, extends with R4/R5 |
| **WS-C · Asset pipeline** | GLB loading, HDRI environment, materials, attribution | feeds A/B/D | not started |
| **WS-D · Displays & lighting** | Shadow instruments, caustics, sails, per-room light rigs | R1.B/C, D-registry | v2 done, caustics pending |
| **WS-E · Systems & UX** | Controls, HUD, collision, perf, mobile | R1.E | v2 done, collision pending |
| **WS-F · Docs** | Catalog changelog, attribution, README sync | all | continuous |
| **WS-G · Content & exploration** | Clutter storytelling, POIs, radiant visitors — "show, don't tell" | R1-B05…B07, R1-C11, R1-D05, R1-E08 | planned (Phase 5) |

## 4. Phases (dependency order)

> **Architecture note (Creation Engine rule):** R1 in `index.html` is the **master file**. R2–R5 are plugins that layer on top of it — never the other way around. `roomManifest` is our load order (plugins.txt): a list of room modules, each exposing `mount(ctx)/unmount(ctx)`, talking only through `ctx` services (scene, assets, lights, time, player). Today rooms are in-file objects in the manifest; from Phase 7 they become literal self-contained folders loaded with dynamic `import()`. "Add Coral Court" must always mean *drop in a folder + one manifest line*, never *edit R1*.

### Phase 0 — Room plugin architecture (WS-A) — ✅ DONE (v3)
1. Introduce `roomManifest` (load-order array) + room module skeleton; R1's current build blocks register through it
2. Room modules own only their own groups (hall / aquarium / sails…); manifest owns lifecycle
3. **Done when:** R1 renders exactly as v2 with zero behavior in R1 reading another room's internals, and adding a no-op `demo-room` to the manifest takes one line.

### Phase 1 — Asset pipeline foundation (WS-C) — ✅ DONE (v5.2: importmap + loader + 11 Quaternius CC0 GLBs + preview specimen renders/casts shadows; ATTRIBUTION.md live)
1. Add `GLTFLoader` (+ `DRACOLoader` passthrough) via jsDelivr `three/addons/...`
2. Download Quaternius **Animated Fish Pack** GLBs (poly.pizza) → `assets/fish/`
3. Asset loader helper: cache, normalize scale to meters, enable `castShadow` on meshes; exposed to rooms as a `ctx` service
4. Start `ATTRIBUTION.md` (CC0 = still note source for good practice)
- **Done when:** one GLB fish renders in the tank, shadow lands on sails, no console errors.

### Phase 2 — Livestock upgrade (WS-B) — ✅ DONE (v6)
1. Replace procedural minnow body with GLB fish; keep boids/phototaxis/vortex `updateFish` driving position/heading
2. Drive swim clip via `AnimationMixer`, beat rate tied to velocity (replaces tail-phase math)
3. 2–3 species with size/speed offsets; slider maps to total count across species
- **Done when:** mixed school swims the annulus, feeds, orbits in shadow play; ≥ current perf at 28 fish. *(evidence: evidence/captures/phase2/)*

### Phase 2.5 — Center-tank ecosystem (WS-B) — ✅ DONE (v7)
Custom centerpiece ecosystem: prey/predator roles on species; shark needs (patrol → hunt <45% → chomp +18 → starve-drift at 0; *a full shark minds its own business*); Hatchery restock slider (0 = off) respawns prey at the plant bed with grow-in; Ecosystem console group (sharks / hunger rate / hatchery); hunt capture scenario.
- **Done when:** hunt scenario shows sharks chasing with energy draining and the hatchery holding the prey population at target — verified via evidence captures.

### Phase 3 — Lighting, Environment & materials (WS-C + D)
1. Poly Haven HDRI as `scene.environment` (glass/fish reflections)
2. PBR floor/wall/plinth textures (Poly Haven or ambientCG CC0)
3. Caustics: animated OGART caustic frames as low-intensity projected light-map on substrate + plinth
- **Done when:** hall reads photographic; 60 fps maintained on integrated GPU.

### Phase 4 — Balcony: verticality as payoff (WS-A + E)
1. Walkway deck ring + railing (R2-P02, R2-P03); second player elevation mode (stairs or teleport)
2. Upper downlights onto sails
3. **Collision pass**: sails (R1-B04) + balcony railing get soft radial/angular push-out
- **Done when:** the balcony is the *reward* — visitor climbs, sees the shadow gallery from above through the sail gaps, descends somewhere new; no clipping through fabric.

### Phase 5 — Populate: clutter, POIs, radiant visitors (WS-G) — *show, don't tell*
1. **Storytelling clutter** (static meshes, no code beyond placement): maintenance cart with tools half-stowed (R1-B05), curator's clipboard mid-note on a bench (R1-B06), water-stained donor plaque (R1-B07)
2. **POIs that reward the second lap**: hidden curator's plaque low on the plinth's back face (R1-C11), 1-in-N rare fish skin in the school (R1-D05) — nothing on any slider or HUD
3. **Radiant visitors**: 2–3 wanderers reusing the player rig + a steering loop we already wrote for fish — pause at a sail, glance at the tank, move on (R1-E08)
- **Done when:** a first-time visitor finds none of it, a second lap finds all of it, and the museum feels like it has staff and history.

### Phase 6 — Entrance vestibule (WS-A)
R3.P01–P03: portal opening, desk, directory board (reuse plaque canvas tech). Entry spawn point moves here.

### Phase 7 — Coral Court (WS-A + B + C) — *first literal folder plugin*
`r7-coral-court/` self-contained room via dynamic `import()` + one manifest line; Quaternius species + Sketchfab CC0 corals; own point-light rig (smaller shadow cubemap, e.g. 256²).

### Phase 8 — Jellyfish Chamber (WS-A + B + D) — *second folder plugin*
Near-black room, drifting bell meshes with additive glow, single uplight; purest shadow room. Reuses vortex force inverted (slow radial breathing).

## 5. Conventions (every change)

1. **Modular file tree (ADR-010, supersedes the single-file rule)**: `index.html` is a shell; `src/main.js` is the composition root; `src/core/` holds services; each room owns `src/rooms/<room>/`. The importmap in index.html is the single three.js version pin. Per-item granularity is labeled blocks inside part files; one-file-per-item remains the Phase 7 option.
2. **Catalog discipline**: new/changed scene objects → update CATALOG row (next free ID in the room's series) + append Changelog line. No scene change without a catalog line.
3. **IDs**: rooms `R#`, pieces `R#-<section><nn>` (A arch, B fixtures, C display, D habitat, E systems, P planned), displays `D#`.
4. **Verification before "done"**: extract `<script type="module">` → `node --check` passes; server `python -m http.server 8137` serves the update; manual pass on desktop (mouse-look + WASD + shadow play) and at least one narrow-window check (joystick layout).
5. **Perf guardrails**: shadow map ≥512² for D-MAIN; ≤ 400 draw calls; CPU vertex deformation stays off GLB fish (use morph/animation instead); motes stay ≤ 300.
6. **Licensing**: only CC0/CC-BY assets; anything CC-BY gets an ATTRIBUTION.md row the same session it lands; no Shadertoy/NC content.
7. **Theme test**: every addition must serve "one light, many shadows" — if it doesn't interact with the central light or a shadow surface, justify it or cut it.

## 6. Session loop

1. Pick the highest unfinished phase (and workstream) from §4.
2. Implement in `index.html` per §5.
3. Verify (§5.4).
4. **Orient**: `node tools/audit.mjs` must pass — it recomputes code ↔ CATALOG ↔ ORCHESTRATION alignment. For visual claims, screenshot the served exhibit instead of trusting prose.
5. Update CATALOG.md (rows + Changelog) and, if new assets were introduced, ASSETS.md/ATTRIBUTION.md.
6. Bump the CATALOG changelog version; summarize what changed and what phase is next.
