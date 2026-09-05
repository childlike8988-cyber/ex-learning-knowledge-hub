# E.X Creator Universe Asset Map

## Usage boundary

The paths below are semantic mappings for design and implementation planning.
Every listed file remains **reference-only**. `Production Usage` describes a
future role, not permission to import the reference file into the application.

## Mapped assets

| Asset | Visual role | Suggested Galaxy | Layer | Production usage | Future production asset | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `1A/星際知識探索導航樞紐.png` | Wide labelled constellation / overview study | Universe overview with Knowledge emphasis | core / overview | Reference composition only | Yes, after labels and hierarchy are rebuilt | The visible labels belong to the earlier learning-station direction; do not reuse as the final Creator Universe hero verbatim. |
| `1A/金藍星軌導航核心.png` | Symmetrical luminous navigation core | E.X Creator Universe core | core | Reference for central portal geometry | Yes | Good anchor for the world layer, not a destination card. |
| `1A/未來地球通訊樞紐.png` | Large open orbital ring with satellites | Shared navigation / Future Galaxy | back / orbit | Reference for outer framing and orbit lines | Yes | Keep as a framing motif or ring layer; avoid making it a second competing hero. |
| `1A/金藍星系玻璃軌道球.png` | Glass galaxy with metallic orbit rings | Create or Knowledge secondary galaxy | mid | Reference for a focused galaxy island | Yes | Suitable for a depth-mid sphere; interaction should move it in Z, not only scale it. |
| `1A/金藍星塵軌道圓環.png` | Connected globe with orbiting product symbols | Language Galaxy / cross-product network | mid / core | Reference for network and cross-world relationship | Yes | Existing package calls this `glow`; visual reading supports a meaningful network node as well. |
| `1A/透明宇宙電影光圈球體.png` | Camera/aperture inside a cinematic glass sphere | Create Galaxy | core / mid | Reference for Auto Editing, AI Video, Creative Tools | Yes | Use as a media-production visual anchor; keep camera symbolism restrained. |
| `1A/透明背景的宇宙知識之球.png` | Open book, knowledge graph, orbital ring | Knowledge Galaxy | front / core | Reference for AI Learning Station and Classroom | Yes | Strongest learning symbol; can be a front-depth focal object. |
| `1A/透明背景上的科幻宇宙觀測球.png` | Observatory sphere, axes, signal ring | Insight Galaxy | back / mid | Reference for Market Radar and Research | Yes | Keep interpretation neutral; the image is a visual metaphor, not data. |
| `EX_CREATOR_UNIVERSE_PACKAGE/knowledge_galaxy_base.png` | Package alias for wide Knowledge overview | Knowledge Galaxy | core / overview | Reference-only alias | Same source derivative as above | Exact duplicate of `1A/星際知識探索導航樞紐.png`. |
| `EX_CREATOR_UNIVERSE_PACKAGE/knowledge_galaxy_depth_back.png` | Package alias for observatory depth | Insight / ambient depth | back | Reference-only depth study | Same source derivative as above | Exact duplicate of `1A/透明背景上的科幻宇宙觀測球.png`. |
| `EX_CREATOR_UNIVERSE_PACKAGE/knowledge_galaxy_depth_front.png` | Package alias for knowledge sphere | Knowledge Galaxy | front | Reference-only foreground study | Same source derivative as above | Exact duplicate of `1A/透明背景的宇宙知識之球.png`. |
| `EX_CREATOR_UNIVERSE_PACKAGE/knowledge_galaxy_depth_mid.png` | Package alias for glass galaxy | Secondary galaxy island | mid | Reference-only middle layer | Same source derivative as above | Exact duplicate of `1A/金藍星系玻璃軌道球.png`. |
| `EX_CREATOR_UNIVERSE_PACKAGE/knowledge_galaxy_glow.png` | Package alias for orbital ring | Shared orbit / ambient energy | effect / back | Reference-only glow/orbit study | Same source derivative as above | Exact duplicate of `1A/未來地球通訊樞紐.png`; the name is semantic, not a new glow render. |
| `motion-reference/ex_creator_universe_multi_axis_motion_reference_v01.mov` | Primary motion / spatial interaction reference | E.X Creator Universe (all galaxies) | behavior / N/A | Reference-only motion study | No | Defines pointer focus transfer, X/Y/Z depth, Pitch/Yaw/subtle Roll, inertia, parallax, and cinematic travel feeling. Never embed as background video or runtime dependency. |

## Layering rules

1. `back` layers establish atmosphere and scale; they move the least.
2. `mid` layers carry galaxy identity and receive moderate parallax.
3. `front` layers create depth and occlusion but must never cover navigation or
   readable labels.
4. `core` remains the visual anchor and has the smallest, slowest idle drift.
5. `effect` layers are optional enhancement; the scene must remain legible when
   they are disabled.

## Semantic guardrails

- A reference visual does not establish a product fact, product availability,
  or route. Those come from typed navigation data.
- A visual labelled “Coming Soon” or an unlabeled orb must not be presented as
  a live product without a matching route and status.
- The earlier learning-focused overview is a useful study, but the production
  information hierarchy is now World → Galaxy → Destination.
