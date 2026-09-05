# E.X Creator Universe Reference Inventory

## Scope

This inventory covers the reference package at:

`assets/references/ex-creator-universe/`

All files in this directory are **reference-only**. They are not production
assets, must not be imported by runtime code, and must not be renamed, moved,
converted, optimized in place, deleted, or overwritten.

## Package contents

| Set | Files | Role |
| --- | ---: | --- |
| `1A/` | 8 PNGs | Original visual references and compositional studies |
| `EX_CREATOR_UNIVERSE_PACKAGE/` | 5 PNGs + 1 Markdown spec | Semantic aliases and a proposed Knowledge Galaxy layer set |
| `motion-reference/` | 1 MOV | Primary motion and spatial-interaction reference |

All PNG files are 1254×1254 except the two wide overview files, which are
1672×941. The package spec is a design note, not an implementation contract.

## Duplicate audit

The package raster files were compared by SHA-256 against the `1A` set. Every
package raster is an exact binary duplicate of an existing `1A` file; there are
no additional pixels, alternate exports, or independent production versions.

| Package file | Source file in `1A/` | SHA-256 (prefix) | Result |
| --- | --- | --- | --- |
| `knowledge_galaxy_base.png` | `星際知識探索導航樞紐.png` | `800617CD...CE11C` | Exact duplicate |
| `knowledge_galaxy_depth_back.png` | `透明背景上的科幻宇宙觀測球.png` | `8C74049C...1B6B53` | Exact duplicate |
| `knowledge_galaxy_depth_front.png` | `透明背景的宇宙知識之球.png` | `93AA288D...A5195` | Exact duplicate |
| `knowledge_galaxy_depth_mid.png` | `金藍星系玻璃軌道球.png` | `C5158888...9971A5` | Exact duplicate |
| `knowledge_galaxy_glow.png` | `未來地球通訊樞紐.png` | `3C92F432...BE59FE` | Exact duplicate |

The source names and package names are therefore alternate semantic labels,
not version history. Keep both sets for design traceability; do not delete the
apparently redundant files.

## Motion reference

| Asset | Role | Usage | Production dependency | Integrity note |
| --- | --- | --- | --- | --- |
| `motion-reference/ex_creator_universe_multi_axis_motion_reference_v01.mov` | Primary Motion / Spatial Interaction Reference | Reference Only | **NO** | 51,150,669 bytes; SHA-256 `DFC65BE0790D6CE41497E5A186BF489BE2C5F3F4FFB4B0B3056EF1734857A6FB` |

The MOV is not a background video, runtime visual, or production animation
source. It informs motion principles only: pointer focus transfer, multi-axis
spatial behavior, dynamic-island depth, inertia, parallax, and the feeling of a
cinematic transition. It must remain in place and must not be renamed,
compressed, transcoded, embedded, or committed as a production dependency.

### Mapping discrepancy

The supplied `EX_CREATOR_UNIVERSE_VISUAL_SPEC.md` says that
`knowledge_galaxy_glow.png` maps to `1A/金藍星塵軌道圓環.png`. The binary
comparison contradicts that note: the package file is an exact duplicate of
`1A/未來地球通訊樞紐.png`. `金藍星塵軌道圓環.png` has a different hash and is
not represented by a package raster. Treat the hash-based mapping above as the
current source of truth and keep this discrepancy visible until the design
package is reviewed.

## Visual reading

- `星際知識探索導航樞紐.png` is a wide, labelled overview composition. It
  clearly demonstrates a Knowledge/learning-oriented constellation, but it is
  not the final top-level Creator Universe composition because its labels are
  specific to an earlier learning-station direction.
- `金藍星系玻璃軌道球.png` is a glass galaxy sphere with metallic orbital
  rings. It is a reusable visual grammar reference for a galaxy core or
  mid-depth island.
- `金藍星軌導航核心.png` is a symmetrical navigation core with a central
  luminous galaxy and surrounding nodes. It is a strong reference for the
  Universe core/navigation hub.
- `金藍星塵軌道圓環.png` is a globe-like network sphere with orbiting product
  symbols. It reads as a cross-world or Language/connection galaxy more than a
  generic glow layer when considered visually.
- `未來地球通訊樞紐.png` is a large open orbital ring with satellite spheres.
  It is useful as an outer orbit, framing, or navigation-ring study.
- `透明宇宙電影光圈球體.png` is a cinematic camera/aperture sphere. It is a
  natural Create Galaxy / media-production reference.
- `透明背景上的科幻宇宙觀測球.png` is an observation sphere with axis lines
  and a signal-like equatorial ring. It is a natural Insight/Observatory
  reference.
- `透明背景的宇宙知識之球.png` is a knowledge sphere with an open book and
  connected nodes. It is a natural Knowledge Galaxy reference.

## Custody and future use

The future production pipeline should create reviewed, optimized derivatives
under a production asset directory, with license/provenance and dimensions
recorded separately. A production component must never depend directly on
`assets/references/`. Reference changes must not silently change the site.
