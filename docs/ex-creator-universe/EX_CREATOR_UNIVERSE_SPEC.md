# E.X Creator Universe — Visual and Architecture Specification

Status: **Phase 0 locked baseline**
Scope: reference review, world model, interaction contract, and future
implementation architecture. No homepage rewrite or WebGL implementation is
included in this phase.

## 1. Product positioning

**E.X Creator Universe** is the top-level universe entrance for
`excreatorstudio.com`. It is not an AI Learning Station microsite and not a
collection of app shortcuts.

The experience should communicate:

> 「我進入了一個 E.X 的世界。」

The hierarchy is:

```text
E.X Creator Universe
└─ Galaxy / Product World
   └─ Feature / Planet / Module
```

Public navigation remains usable HTML navigation. Spatial presentation adds
orientation and continuity; it does not replace the destination route.

## 2. World architecture

```text
E.X Creator Universe (world / core)
├─ Create Galaxy
│  ├─ Auto Editing
│  ├─ AI Video
│  └─ Creative Tools
├─ Knowledge Galaxy
│  ├─ AI Learning Station
│  ├─ Knowledge Hub
│  ├─ Classroom
│  ├─ AI TA
│  ├─ Skill Tree
│  └─ Practice Lab
├─ Language Galaxy
│  ├─ English
│  ├─ Japanese
│  └─ Future Language Tools
├─ Insight Galaxy
│  ├─ Market Radar
│  ├─ Research
│  └─ Data
├─ Other / Partner Worlds
│  ├─ Personal Brand
│  ├─ Realty
│  └─ Galaxy Tools
└─ Future Galaxy
```

### Information architecture decision

- **Primary galaxies:** Create, Knowledge, Language, and Insight. They are the
  four durable product worlds and should be the only major selectable islands
  in the first composition.
- **Core:** E.X Creator Universe / Main is the home portal, not another galaxy
  competing with the four primary worlds.
- **Secondary nodes:** Auto Editing, AI Video, Creative Tools, English,
  Japanese, Market Radar, Research, and Data are satellites or destinations.
- **Planets/modules:** AI Learning Station, Classroom, AI TA, Skill Tree,
  Practice Lab, and individual product features sit below a galaxy.
- **Other:** Personal Brand, Realty, and future partner tools should be
  represented as a restrained secondary cluster or directory, not equal-sized
  hero planets on day one.

This keeps the first screen about World → Galaxy → Destination rather than
showing twenty unrelated icons.

## 3. Visual language

The locked direction is refined, professional, modern, premium, mysterious,
restrained, cinematic, and technological.

| Dimension | Direction |
| --- | --- |
| Foundation | Deep navy / near black with a quiet vignette |
| Accents | Champagne gold, subtle cool blue, restrained violet |
| Materials | Glass, optical lens, fine metallic orbit lines |
| Light | Volumetric glow, small star points, controlled bloom |
| Depth | Cinematic depth of field, layered parallax, occasional soft occlusion |
| Typography | Editorial hierarchy with clean, high-contrast labels |
| Emotional target | Luxury Technology · Editorial Space · Modern Observatory |

Avoid game UI, RPG or skill-tree framing, rainbow neon, dense HUD chrome,
cartoon styling, esports motifs, and “space lobby” affordances.

## 4. Interaction model

The scene uses a spatial island model rather than a hover scale effect.

- `X` is horizontal travel across the universe.
- `Y` is vertical travel and camera response.
- `Z` is depth toward or away from the viewer.
- `Pitch` is subtle rotation around the horizontal axis.
- `Yaw` is subtle rotation around the vertical axis.
- `Roll` is optional and very small; it is never a default spinning effect.

On pointer movement across a galaxy:

1. The target galaxy becomes the focus candidate.
2. Its visual island moves slightly toward the camera on `Z`.
3. Other galaxies recede and reduce contrast.
4. The universe receives a small pointer-proportional `Pitch`/`Yaw` response.
5. Front, middle, and back layers produce different parallax amplitudes.
6. The previous focus eases back with inertia rather than snapping.
7. Depth-of-field and glow change subtly; readability always wins.

The pointer controller must clamp motion, use a dead zone near center, and
respect reduced-motion settings. Keyboard focus and touch selection use the
same focus state without requiring pointer hover.

## 4.1 Primary motion reference (Phase 0B)

`assets/references/ex-creator-universe/motion-reference/ex_creator_universe_multi_axis_motion_reference_v01.mov`
is the locked **Primary Motion / Spatial Interaction Reference** for this
Universe. It is a reference for spatial navigation, multi-axis focus behavior,
galaxy depth transitions, pointer-driven dynamic islands, inertia, parallax,
and camera response. It is not a background video, a runtime animation, or a
production dependency.

The reference is interpreted as motion language, not copied frame by frame.
The existing visual asset map and this specification are the implementation
contract; the MOV remains untouched in the reference directory.

### Motion principles extracted

| Event | Required motion language |
| --- | --- |
| Fast pointer sweep across galaxies | Focus candidate follows the pointer in sequence; focus transfer remains readable and does not flicker. |
| Target galaxy | Move forward on `Z`, increase perceived scale/depth and clarity, and strengthen glow only enough to establish priority. |
| Non-target galaxies | Recede on `Z`, reduce scale/contrast slightly, soften depth cue, and retain spatial presence. |
| Universe container | Pointer X/Y produces small parent `Yaw`/`Pitch`; `Roll` is extremely weak and never causes dizziness. |
| Return to a previous galaxy | Preserve a small amount of inertia and natural rebound/easing instead of snapping to rest. |
| Overall feel | X, Y, Z, Pitch, Yaw, and subtle Roll work together as a spatial island, not as `hover → scale(1.1)`. |

### Motion priority

1. Depth / Z-axis
2. Pointer parallax
3. Galaxy focus transfer
4. Pitch / Yaw
5. Inertia
6. Subtle Roll
7. Particle secondary response

Particles must never compete with the galaxy’s silhouette, label, or active
state.

## 5. Motion states: Idle, Focus, Travel

### Idle

Idle is quiet and observable:

- very slow orbital drift;
- breathing glow at low amplitude;
- tiny, sparse particles;
- small depth drift between layers;
- restrained galaxy rotation;
- extremely slow camera drift.

No violent continuous rotation, fast particle storms, constant zoom, flashing,
or game-like reward animation. Cinematic shock is reserved for a deliberate
focus or enter transition.

### Focus

When a galaxy is focused:

- the target moves forward on `Z`;
- surrounding nodes recede and spacing may compress/re-space subtly;
- target clarity and glow increase within a restrained range;
- non-target depth and contrast reduce without disappearing;
- the previous focus eases back with spring-like inertia.

Focus must be reversible, keyboard reachable, and independent of an image or
video asset being present.

### Travel

When entering a destination:

- the selected galaxy expands its depth cue;
- the camera approaches along a controlled path;
- the surrounding environment fades or shifts near the visual climax;
- route navigation occurs at a deterministic handoff point.

Travel is optional in Phase 1 and must collapse to an immediate route change in
Reduced Motion or on transition failure.

## 6. Focus and enter transition

Focus is a reversible state, not a route change. The recommended state model is:

```text
idle → focus-candidate → focused → leaving-focus
                         └──────→ transitioning → destination
```

Selecting a galaxy should preserve visual continuity:

1. Lock the selected node and announce its name to assistive technology.
2. Increase its `Z` prominence and reduce competing layer contrast.
3. Guide the camera/orbit toward the selected galaxy.
4. Use the selected galaxy’s visual motif as the destination handoff.
5. Navigate to the existing route after the transition has a deterministic end
   point.
6. On failure or reduced-motion mode, navigate immediately with no blocked
   loading state.

The transition is presentation only; it must not infer permissions, product
availability, or data state.

## 7. Asset strategy

`docs/ex-creator-universe/asset-map.md` is the semantic source for the current
reference set. Reference files remain outside runtime imports.

Future production assets should be:

- reviewed derivatives with explicit provenance;
- optimized per device tier and served from a production asset directory;
- separated into scene background, core, galaxy, orbit, depth, and effect
  layers;
- replaceable without changing navigation or domain data;
- available in a static fallback composition.

The wide Knowledge overview should not be copied as the final Universe hero;
its earlier AI-learning labels conflict with the new top-level world model.

## 8. Performance modes

Progressive enhancement is mandatory.

| Mode | Rendering | Motion | Use |
| --- | --- | --- | --- |
| Desktop Full Spatial | DOM/CSS 3D, layered assets, optional measured shader/particle layer | Full clamped pointer parallax and focus transition | Capable desktop devices |
| Mobile Safe | DOM/CSS composition, fewer layers, no required WebGL | Tap focus, short transition, minimal drift | Phones and narrow viewports |
| Reduced Motion | Static or opacity-only layers | No camera travel, no continuous motion | `prefers-reduced-motion: reduce` |
| Low GPU | Fewer images, no shader/canvas enhancement | Small transforms only | Memory-constrained or detected weak GPU |

The HTML destination list remains present in every mode. WebGL is an optional
enhancement and never the only navigation surface.

### Motion budget

- Desktop Full Spatial targets 60 fps.
- Mid-range devices may run at 30–60 fps with reduced layer count.
- Mobile prioritizes stable frame pacing over visual completeness.
- Pointer movement is sampled through one `requestAnimationFrame` loop.
- Avoid layout thrashing, per-particle React components, large blur stacks, and
  continuously animated DOM shadows.
- Particle count, blur, and depth layers are reduced or disabled before text or
  navigation is compromised.

## 9. Accessibility

- Use semantic headings, navigation, links, and buttons.
- Give each galaxy a descriptive label and a visible focus state.
- Make keyboard order follow the same World → Galaxy → Destination hierarchy.
- Provide a text/list alternative to the spatial scene.
- Do not communicate status with color alone.
- Avoid motion-triggered focus loss and respect reduced-motion preferences.
- Keep contrast and hit targets suitable for touch.
- Ensure transition failures still leave a usable destination link.

## 10. Desktop and mobile composition

### Desktop

The core sits slightly behind the content plane. Four primary galaxies occupy
an asymmetric orbit with enough negative space for labels. A small utility
navigation and the accessible list remain anchored outside the scene. The
pointer response should be visible but never make text wobble.

### Mobile

Use a vertical observatory/list composition rather than shrinking the desktop
orbit. Keep the core and one or two featured galaxies in the first viewport,
then expose the remaining galaxies as stacked, touch-friendly destinations.
Touch selection replaces hover. The scene may scroll, but it must not require a
wide canvas or introduce horizontal overflow.

## 11. Technical architecture proposal

### Recommended baseline

Start with React/DOM plus CSS 3D transforms and a small pointer controller.
Use `requestAnimationFrame` only for a single coalesced scene update, and keep
all navigation data in a typed static model. Use one motion system; do not add
several animation libraries for overlapping responsibilities.

### Capability assessment

| Technique | Suitable role | Decision |
| --- | --- | --- |
| CSS 3D | Layered parallax, perspective, depth, focus transforms, safe fallback | Required for Phase 1 |
| Framer Motion | Optional route/focus orchestration if already justified by project dependencies | Evaluate later; do not add only for Phase 0 |
| Three.js / React Three Fiber | Real camera, many independent 3D objects, depth-buffer occlusion | Optional progressive enhancement after measurement |
| GSAP | Timeline-heavy cinematic transition | Avoid adding a second motion engine; reconsider only if CSS/native motion is insufficient |
| WebGL shader | Volumetric nebula, custom bloom, high-density particles | Not required for the first useful prototype |
| Canvas particles | Sparse ambient particles at low cost | Optional and disable in Safe/Reduced modes |

### Proposed component boundaries

```text
UniverseScene
├─ UniverseCamera
├─ GalaxyOrbit
├─ GalaxyNode
│  ├─ GalaxyVisual
│  ├─ GalaxyDepthLayer
│  └─ GalaxyLabel
├─ UniversePointerController
├─ UniverseMotionEngine
├─ UniverseTransitionController
└─ UniverseSafeMode
```

`UniverseScene` owns composition and accessible fallbacks. `GalaxyNode` owns
focus semantics, not product business logic. `UniversePointerController`
converts pointer/touch coordinates into clamped normalized X/Y values.
`UniverseMotionEngine` applies mode-specific transforms. The transition
controller coordinates route handoff without owning authentication or data
fetching.

### Motion concept mapping

| Reference concept | Future implementation boundary |
| --- | --- |
| Pointer tracking | Normalize browser pointer coordinates to bounded X/Y values. |
| Galaxy depth | CSS `transform: translate3d(...)` first; R3F/WebGL `z` only if later justified. |
| Pitch / Yaw | Rotate the parent `UniverseScene`/camera within small clamps. |
| Inertia | Spring or damped interpolation in `UniverseMotionEngine`; never a free-running spin. |
| Focus transfer | `activeGalaxy` state with enter/leave easing. |
| Depth blur | Restrained CSS/WebGL depth cue, disabled in Safe/Reduced modes. |
| Travel transition | `UniverseTransitionController` handoff to the existing route. |

### Data contract

Future typed navigation data should include at least:

```ts
type UniverseGalaxy = {
  id: string;
  group: "create" | "knowledge" | "language" | "insight" | "other";
  title: string;
  description: string;
  href: string;
  status: "available" | "coming-soon" | "hidden";
  visualKey: string;
};
```

The renderer consumes this contract; it must not infer routes from filenames or
reference image content.

## 12. Static export and SEO boundary

The Universe must work with the existing Next.js static export. The accessible
HTML links and metadata render without a server runtime. Motion is client-side
enhancement only and must not be required to discover a product.

The production route should retain normal page metadata, descriptive link
names, and a crawlable destination hierarchy. If a later interactive scene is
not suitable for indexing, the text navigation must still be indexable; do not
hide the complete product map behind a canvas.

## 13. Phase roadmap

### Phase 0 — Reference + Spec

Lock the world model, visual language, asset semantics, layering, safe modes,
and component/data boundaries. This document is the deliverable.

### Phase 1 — Static Universe Composition Prototype

Build a static DOM composition with:

- the central core;
- four primary galaxies;
- front / mid / back depth layers;
- orbit composition and labels;
- static 3D perspective;
- an accessible list and responsive fallback.

Do not begin WebGL shaders, cinematic travel, particle physics, or final mobile
motion in this phase.

### Phase 2 — Pointer X/Y/Z Parallax

Add clamped pointer response, layer-specific parallax, keyboard/touch-safe
focus, and reduced-motion coverage.

### Phase 3 — Galaxy Focus / Dynamic Island

Add focus state, contrast/depth changes, inertia, and semantic focus handling.

### Phase 4 — Multi-axis Pitch/Yaw/Inertia

Tune subtle Pitch/Yaw/Roll response and camera inertia using device-tier
performance budgets.

### Phase 5 — Enter-Galaxy Cinematic Transition

Connect the focus state to existing routes with deterministic travel continuity
and immediate reduced-motion fallback.

### Phase 6 — Mobile / Reduced Motion

Test the Safe and Reduced modes on narrow screens, weak GPUs, keyboard-only
navigation, and screen readers.

### Phase 7 — Production Integration

Replace approved derivatives, connect live route/status data, run visual,
accessibility, performance, and static-export acceptance, then consider
production rollout.

## 14. Phase 0 acceptance boundary

This phase is complete when:

- World positioning and four-primary-galaxy IA are locked.
- Reference assets are inventoried and duplicate relationships are recorded.
- X/Y/Z, Pitch/Yaw/Roll, idle, focus, and enter behavior are specified.
- CSS/DOM versus WebGL responsibilities are explicit.
- Mobile Safe, Reduced Motion, Low GPU, SEO, and static fallback rules exist.
- No reference image, production homepage, Market Radar, or AI Learning route
  was modified.
