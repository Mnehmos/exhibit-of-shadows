# Asset Research — Silo Aquarium Museum

Open-source/free assets that fit this demo. Verified against the live sites Aug 2026.

## Licenses quick reference

- **CC0** — public domain. No attribution needed. Safest.
- **CC-BY** — free with attribution (credit in README/credits screen).
- Per-item licenses on OpenGameArt/Sketchfab — check each page before use.

## Fish & sea life (models)

| Asset | Source | License | Notes |
|---|---|---|---|
| **Animated Fish Pack** (7 species: shark, whale, dolphin, clownfish, manta…) | https://quaternius.com/packs/animatedfish.html | **CC0** | Animated + textured. FBX/OBJ/Blend — grab ready-made **GLB versions at https://poly.pizza** (hosts all Quaternius packs converted) |
| **Animated Cute Fish Pack** (clown, goldfish, lionfish, puffer, angler) | https://quaternius.com/packs/cutefish.html | **CC0** | Stylized mascot look; pairs with the current low-poly aesthetic |
| Fish (Animated), Esox Animated Fish, Hand-Painted Rigged Fish "Amemasu", Low Poly Angel Fish, Piranha, Whale lowpoly, Rainbow Trout | https://opengameart.org/art-search-advanced?keys=fish&field_art_type_tid%5B%5D=10 | per-item (many CC0/CC-BY) | Good for variety; check each page's license block |
| Downloadable CC0 fish/coral/invertebrates (jellyfish, ray, kelp…) | https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&q=fish&type=models | CC0 filter pre-applied | Best source for exotic species; watch poly counts |

**Integration:** `GLTFLoader` (already available from the same jsDelivr three@0.180.0 package: `three/addons/loaders/GLTFLoader.js`), then drive swim with `AnimationMixer` ("swim" clips exist in the Quaternius packs) and reuse the existing boids `updateFish` logic — replace the procedural minnow body with the loaded scene, keep the boundary/steering math.

## Water / ocean tech (three.js, MIT)

| Asset | Use |
|---|---|
| **Water.js** — https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Water.js (demo: `examples/webgl_shaders_ocean.html`) | Animated reflective ocean surface w/ sun specular + normal maps. For an outdoor/water-outside-the-glass variant |
| **Water2.js** — https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Water2.js (demos: `examples/webgl_water.html`, `webgl_water_flowmap.html`) | Flowing/animated water surface for the tank top or floor fountains |
| `examples/textures/waternormals.jpg` — https://github.com/mrdoob/three.js/blob/dev/examples/textures/waternormals.jpg | Normal map the above shaders expect |
| **Sky.js** — https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Sky.js | Physical sky/atmosphere dome if the hall gets windows |
| Water caustics textures — https://opengameart.org/content/caustic-textures , https://opengameart.org/content/caustics-with-color-split , https://opengameart.org/content/water-caustics-effect-small | Animated caustic frames to project on tank floor/walls (light-map or `SpotLight.map`-style trick). **Check license per page** |

For the tank itself, the current `MeshPhysicalMaterial` transmission glass is already the right three.js approach; Water2/caustics are additive upgrades, not replacements.

## Aquarium props (plants, rocks, equipment)

- **Quaternius Stylized Nature MegaKit / Ultimate Stylized Nature / Simple Nature** — CC0 plants, rocks, grass: https://quaternius.com/packs/stylizednaturemegakit.html , https://quaternius.com/packs/ultimatestylizednature.html , https://quaternius.com/packs/simplenature.html
- **Poly Haven Nature models** (CC0, photoreal driftwood/rocks/shells): https://polyhaven.com/models/nature
- Dedicated aquarium equipment (filters, piping, signage) barely exists in CC libraries (OGART aquarium 3D search: 0 results) → source from Sketchfab CC0 search above (`q=aquarium`) or model simple props procedurally like the current exhibit.

## Interior / museum hall

| Asset | Source | License | Notes |
|---|---|---|---|
| **Ultimate House Interior Pack** — 120+ models (doors, windows, kitchen, bath, shelves) | https://quaternius.com/packs/ultimatehomeinterior.html | **CC0** | FBX/OBJ/Blend; GLBs on poly.pizza |
| **Ultimate Furniture Pack / Furniture Pack** (chairs, tables, lights, couches, beds) | https://quaternius.com/packs/ultimatefurniture.html , https://quaternius.com/packs/furniture.html | **CC0** | Replace the procedural benches |
| **Downtown City MegaKit** (sidewalks, facades, interiors, props) | https://quaternius.com/packs/downtowncitymegakit.html | **CC0** | Lobby/entrance areas |
| **Poly Haven Furniture / Decor & Art / Architecture / Lighting** (e.g. `marble_bust_01`, `Chandelier_01`, `mid_century_lounge_chair`) | https://polyhaven.com/models/furniture , /decor-art , /architecture , /lighting | **CC0** | Museum-grade photoreal pieces — busts + chandeliers are exactly right for a gallery hall |

## Textures, HDRIs, skyboxes

- **Poly Haven textures** (CC0 PBR): marble/terrazzo floors, brushed metal, concrete — https://polyhaven.com/textures
- **ambientCG** (CC0 PBR): https://ambientcg.com/ — wood flooring, painted wall, metal plates
- **Poly Haven HDRIs** (CC0): interior daylight / museum lighting — https://polyhaven.com/hdris (use as `scene.environment` for realistic PBR reflections on glass + fish)
- **Kenney skyboxes / all Kenney packs** (CC0): https://kenney.nl/assets/category:Textures

## Audio (bonus)

- Kenney audio packs (CC0): https://kenney.nl/assets/category:Audio (impact/UI)
- Freesound filtered to CC0: https://freesound.org/search/?q=underwater+ambience&f=license:%22Creative+Commons+0%22 — hall reverb + tank bubbling
- OpenGameArt music (per-item license): https://opengameart.org/art-search-advanced?keys=ambient&field_art_type_tid%5B%5D=12

## Recommended first purchases (all free)

1. **Quaternius Animated Fish Pack** (CC0) → replace procedural minnows, keep boids code
2. **Poly Haven HDRI + marble/wood textures** (CC0) → instant material upgrade for hall + plinth
3. **Poly Haven marble bust + chandelier** (CC0) → museum dressing
4. **OGART caustic textures** → animated caustics on tank floor
5. **Quaternius Furniture Pack benches** → replace the box-and-cylinder benches

## Pipeline notes

- Quaternius ships FBX/OBJ/Blend; poly.pizza serves the same models as **GLB** — prefer that, or batch-convert in Blender (`glTF 2.0` exporter).
- Load via `three/addons/loaders/GLTFLoader.js` from the same jsDelivr CDN; enable `castShadow` on loaded meshes so the central PointLight keeps projecting silhouettes.
- Watch scale (packs are usually cm- or m-authored) — normalize to meters, the hall is R=10.8m.
- Keep an `ATTRIBUTION.md` listing anything not CC0.
