# STATUS — The Exhibit of Shadows

Live state. Update at the end of every session.

**Version:** v9 — THE MOON DUNE · **Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 2.5 ✅ ecosystem · Phase 3 ◐ (caustics landed; HDRI/textures open) · Phases 4–8 open**
**Run:** `python -m http.server 8137` in this folder → http://localhost:8137
**Deploy:** public repo + GitHub Pages — https://mnehmos.github.io/exhibit-of-shadows/ (branch `main`, path `/`; Pages rebuilds on every push)
**Check:** `node tools/audit.mjs` → AUDIT PASS required before closing a session.
**Vision evidence:** `npm run capture` → PNGs land in `evidence/captures/` with a JSON manifest.

## Playtest guide (5 minutes)

1. Walk (WASD / click scene for mouse-look). **HUD must show `16 fish`** — GLB prey + the 88-strong moon minnow bait ball circling the moonstone.
2. Visit the stagehand console booth — glowing podium in the sail gap right of the entrance view — press **E**.
3. Console groups: **Exhibit** (prey fish, activity, schooling, light pull, plants, moon minnows), **Impossible things** (gravity, hall time, bioluminescence, minnow scale), **Shadow hall** (central light, shadow softness, gallery light), **Ecosystem** (sharks, hunger rate, hatchery), **Visitor** (walk speed).
4. Try: Gravity −100% (the ball drifts up), Hall time 20% (slow-mo silhouettes), Bioluminescence 100% + Shadow play (glowing bait ball in a black hall), Sharks 2 + Hunger 300% (the hunt).
5. HUD must read `assets: ready · 11 models` and `sharks 1` on a fresh load.

## Phase board

| Phase | State |
|---|---|
| 0 plugin architecture | ✅ v3 |
| 1 asset pipeline | ✅ v5.2 |
| 2 livestock upgrade | ✅ v6 |
| 2.5 ecosystem | ✅ v7/v9 — shark needs + hatchery |
| 3 environment/materials | ◐ caustics + dunes + environment landed; HDRI + PBR hall textures open |
| 4 balcony + collision | open |
| 5 populate/POIs | open |
| 6 vestibule | open |
| 7 coral court (folder plugin) | open |
| 8 jellyfish chamber | open |
