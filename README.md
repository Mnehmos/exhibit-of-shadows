# The Exhibit of Shadows

**Live exhibit:** https://mnehmos.github.io/exhibit-of-shadows/

**Specimen photo booth:** https://mnehmos.github.io/exhibit-of-shadows/photo-booth.html

An online aquarium: a walkable, museum-scale cylindrical tank lit by a single shadow-casting light at its core — fish, plants, and visitors projected as silhouettes onto hanging sails and the hall walls. Bend its physics from the stagehand console: gravity, hall time, bioluminescence, minnow scale.

Standalone three.js (MIT, loaded from CDN at runtime) — no build step, no dependencies on your machine beyond a browser.

Inventory: **CATALOG.md**. Asset research: **ASSETS.md**. Build plan: **ORCHESTRATION.md**. Decision log: **DECISIONS.md**. Orientation check: `node tools/audit.mjs`.

## Run

Because the app imports Three.js as an ES module from jsDelivr, serve this folder with any static HTTP server.

Examples:

### Python
```bash
python -m http.server 8000
```

Then open:
http://localhost:8000

### Node
```bash
npx serve .
```

## Controls

- Desktop: click the scene to capture the mouse and look around (ESC releases it), WASD to walk.
- Mobile: left joystick to move, drag the scene to look.
- Switch between first-person and third-person modes.
- **Shadow play** dims the gallery, makes the core breathe, and winds the school into a vortex.
- Feed the exhibit to make fish rush toward falling food.
- Sliders control fish activity, schooling, light pull (phototaxis), plant density, central light, shadow softness, gallery light, and walk speed.

## Specimen photo booth

`photo-booth.html` isolates all 11 bundled GLB fish on one controlled studio stage. It automatically centers, horizontally aligns, and normalizes every model for comparison; plays its default animation; provides side, three-quarter, and front views; supports drag/zoom and turntable inspection; and can save the current frame as a PNG.

Run `npm run capture:specimens` while the local server is on port 8137 to generate a side-profile image for every manifest entry. The same capture sweep runs in GitHub Actions after each deployment.

## Notes

- Three.js is loaded at runtime from jsDelivr.
- Shadows use a real shadow-casting PointLight, so the fish silhouettes radiate around the hall in all directions.
