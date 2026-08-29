# STATUS — The Exhibit of Shadows

Live state. Update at the end of every session.

**Version:** v5.2 · **Phase 0 ✅ · Phase 1 ✅ · Phase 2 next (GLB troupe swap + AnimationMixer)**
**Run:** `python -m http.server 8137` in this folder → http://localhost:8137
**Deploy:** public repo + GitHub Pages — https://mnehmos.github.io/exhibit-of-shadows/ (branch `main`, path `/`; Pages rebuilds on every push)
**Check:** `node tools/audit.mjs` → AUDIT PASS required before closing a session.

## Playtest guide (5 minutes)

1. Walk (WASD / click scene for mouse-look). **HUD must show `16 minnows` swimming** — if 0, that's a spawn bug, report it.
2. Visit the stagehand console booth — the glowing podium in the sail gap to the right of the entrance view — press **E**.
2. Console groups: **Exhibit** (minnows, activity, schooling, light pull, plants), **Impossible things** (gravity, hall time, bioluminescence, minnow scale), **Shadow hall** (central light, shadow softness, gallery light), **Visitor** (walk speed).
3. Try: Gravity −100% (pellets and fish float up), Hall time 20% (slow-motion silhouettes), Bioluminescence 100% + Shadow play (glowing spirits in a dark hall), Minnow scale 250% (leviathan minnows).
4. Feed exhibit → Shadow play → watch radial shadows whirl on sails and walls.
5. HUD should read `assets: ready · 11 models` — a GLB preview specimen (clownfish) orbits the core casting real shadows. The 16 procedural minnows still school alongside it (they get swapped in Phase 2).

## Phase board

| Phase | State |
|---|---|
| 0 plugin architecture | ✅ v3 |
| 1 asset pipeline | ✅ v5.2 — 11 Quaternius CC0 GLBs live, preview specimen renders |
| 2 livestock upgrade | open (unblocked — assets in `assets/fish/`) |
| 3 environment/materials | open |
| 4 balcony + collision | open |
| 5 populate/POIs | open |
| 6 vestibule | open |
| 7 coral court (folder plugin) | open |
| 8 jellyfish chamber | open |
