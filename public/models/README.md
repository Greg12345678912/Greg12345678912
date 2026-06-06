# Le Blueboy — 3D Model Slots

Drop Blender exports here. The site auto-detects each file and swaps
the procedural geometry for your real model with zero code changes.

## Naming convention

| Scene            | File name                    |
|------------------|------------------------------|
| Bloody Mangue    | bloody-mangue.glb            |
| Nuage Violet     | nuage-violet.glb             |
| Affogato         | affogato.glb                 |
| Mangonada        | mangonada-scene.glb          |
| Isla Violette    | isla-violette-scene.glb      |
| Opening hero     | opening.glb                  |

## Blender export settings

- Format: glTF 2.0 (.glb)
- Include: Geometry, Materials, Textures, Armatures (if animated)
- Transform: Y Forward, Z Up
- Scale: 1 Blender unit = 1 Three.js unit (~1m)
  → Model should be roughly 3–4 units tall for the scene camera
- Compress textures: KTX2 + Basis Universal (reduces size by ~70%)

## Material workflow

Models keep their Blender PBR materials. The loader additionally
bumps `envMapIntensity` to 1.8 so they catch the scene lighting
without any code edits.

For best results: use Principled BSDF in Blender. The metallic /
roughness / emissive channels map directly to Three.js.

## Animation

If the .glb contains animations (e.g. a sauce pour or a cherry drop),
the first AnimationClip is played automatically on model mount.
