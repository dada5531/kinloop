# KinLoop Illustration System — Style Guide

This document describes the hand-drawn illustration system used throughout KinLoop. Every illustration is a React component that renders inline SVG, keeping the bundle tree-shakeable and the visuals resolution-independent.

---

## Design Philosophy

KinLoop's illustrations follow a **"crayon on craft paper"** aesthetic — warm, imperfect, and approachable. They reinforce the idea that parenting is a creative, human endeavor rather than a clinical one. Each illustration uses a limited palette, rounded strokes, and deliberate wobble to feel hand-made without looking sloppy.

---

## Color Palette

All illustration fills are drawn from the quadrant accent system defined in `globals.css`. The palette uses OKLCH values for perceptual uniformity.

| Token | OKLCH Value | Hex Approx. | Usage |
|---|---|---|---|
| `--scheduler` | `oklch(0.65 0.15 55)` | `#C47A3A` | Scheduler quadrant fills, envelope motifs |
| `--development` | `oklch(0.65 0.12 155)` | `#4A9E6B` | Development quadrant fills, sprout/milestone motifs |
| `--play` | `oklch(0.72 0.14 85)` | `#B8A040` | Play Lab quadrant fills, crane/activity motifs |
| `--coach` | `oklch(0.62 0.12 25)` | `#B06050` | Coach quadrant fills, book/heart motifs |

Secondary fills use the `-muted` variants at 40–60% opacity for backgrounds and washes. Achievement micro-illustrations use category-specific fills (sage-green for milestones, butter-yellow for activities, rose for tips).

---

## Stroke & Shape Rules

All illustrations share these constants:

| Property | Value | Notes |
|---|---|---|
| Stroke width | 1.5–2px | Consistent across all sizes |
| Stroke color | `currentColor` | Inherits from parent `text-*` class |
| Line cap | `round` | Soft, crayon-like endpoints |
| Line join | `round` | No sharp corners |
| Corner radius | 2–4px on rectangles | Mimics rounded crayon strokes |
| Fill opacity | 0.15–0.25 for accents | Translucent washes, never solid |

Shapes intentionally avoid perfect geometry. Circles are slightly elliptical, lines have subtle curves, and repeated elements (rays, leaves, dots) vary in size by 5–10%.

---

## Component Architecture

Every illustration is a standalone `.tsx` file in `src/components/illustrations/` and is re-exported from the barrel `index.ts`.

```
src/components/illustrations/
├── index.ts                    # Barrel exports
├── QuadrantTransition.tsx      # Framer Motion wrapper (shared)
├── AchievementMicro.tsx        # Achievement overlay (shared)
├── SchedulerEmpty.tsx           # Empty states
├── DevelopmentEmpty.tsx
├── PlayLabEmpty.tsx
├── CoachEmpty.tsx
├── MorningMug.tsx              # Time-of-day motifs
├── AfternoonSun.tsx
├── EveningMoon.tsx
├── MilestoneAchieved.tsx       # Achievement micro-illos
├── ActivityScheduled.tsx
├── TipSaved.tsx
├── EmailSent.tsx
├── SchedulerTransition.tsx     # Quadrant transition motifs
├── DevelopmentTransition.tsx
├── PlayLabTransition.tsx
├── CoachTransition.tsx
├── SensoryIcon.tsx             # Activity category icons
├── MotorIcon.tsx
├── CognitiveIcon.tsx
├── CreativeIcon.tsx
├── SleepIcon.tsx               # Coach tip category icons
├── BehaviorIcon.tsx
├── NutritionIcon.tsx
├── DevelopmentTipIcon.tsx
├── SafetyIcon.tsx
├── MilestoneCognitive.tsx      # Milestone category icons
├── MilestoneMotor.tsx
├── MilestoneLanguage.tsx
├── MilestoneSocial.tsx
├── LeafSprig.tsx               # Ambient accents
├── DriftingCrane.tsx
├── BalloonSprig.tsx
└── CrayonSun.tsx
```

### Props Interface

All illustration components accept a consistent props interface:

```tsx
interface IllustrationProps {
  size?: number;       // Width & height in px (default varies by category)
  className?: string;  // Tailwind classes for color, opacity, positioning
}
```

The `size` prop controls the SVG `width` and `height` attributes. The `className` prop is applied to the root `<svg>` element, allowing color inheritance via `text-*` classes and positioning via `absolute`, `relative`, etc.

---

## Animation System

### QuadrantTransition (Page Entrance)

The `QuadrantTransition` wrapper plays an 800ms 3-phase sequence on page mount:

| Phase | Duration | Effect |
|---|---|---|
| 1 — Appear | 0–300ms | Illustration fades in, scales 0.8 to 1.0 |
| 2 — Hold | 300–700ms | Sub-animation plays (tilt, sway, drift) |
| 3 — Crossfade | 700–800ms | Overlay fades out, content fades in simultaneously |

Each quadrant page passes its own transition illustration and accent colors:

```tsx
<QuadrantTransition
  illustration={<SchedulerTransition className="h-full w-full" />}
  bgClass="bg-scheduler-muted/80"
  accentClass="ring-scheduler/30"
  play={showTransition}
  onComplete={() => setShowTransition(false)}
>
  {/* Page content */}
</QuadrantTransition>
```

### AchievementMicro (Success Overlay)

The `AchievementMicro` component displays a brief celebration when a key action succeeds:

| Property | Value |
|---|---|
| Animation | Spring scale 0 to 1 (stiffness 260, damping 20) |
| Duration | 1800ms total, auto-dismisses |
| Position | Fixed center of viewport |
| Background | Semi-transparent backdrop blur |

```tsx
<AchievementMicro
  illustration={<MilestoneAchieved size={64} />}
  show={showAchievement}
  onDismiss={() => setShowAchievement(false)}
  label="Milestone achieved!"
  position="center"
/>
```

### CSS Microinteractions

Defined in `globals.css`:

| Class | Effect | Duration |
|---|---|---|
| `.btn-press` | Scale 0.98 on `:active` | 100ms |
| `.animate-tab-crossfade` | Opacity 0 to 1 + translateY(4px) to 0 | 250ms ease-out |
| `.animate-stagger-item` | Opacity 0 to 1 + translateY(6px) to 0 | 300ms, staggered via `--stagger-index` |

### Reduced Motion

All Framer Motion animations check `useReducedMotion()`. When `prefers-reduced-motion: reduce` is active:

- QuadrantTransition: 400ms simple fade-in, 200ms fade-out, no scale or sub-animation
- AchievementMicro: instant appear, no spring
- CSS animations: `@media (prefers-reduced-motion: reduce)` should be added to disable transforms

---

## Sizing Guidelines

| Context | Recommended Size | Examples |
|---|---|---|
| Empty states | 120–160px | SchedulerEmpty, DevelopmentEmpty |
| Transition motifs | Fill container (`h-full w-full`) | SchedulerTransition, CoachTransition |
| Achievement micros | 64px | MilestoneAchieved, ActivityScheduled |
| Card header icons | 24px in 40px container | SensoryIcon, MotorIcon |
| Category badges | 14px inline | SensoryIcon in CategoryBadge |
| Milestone ring icons | 12px | MilestoneCognitive in progress ring |
| Tip card header icons | 16px | SleepIcon, BehaviorIcon |
| Time-of-day motifs | 48px | MorningMug, AfternoonSun |
| Ambient accents | 32–48px at 20–25% opacity | LeafSprig, DriftingCrane |

---

## Adding New Illustrations

1. Create a new `.tsx` file in `src/components/illustrations/`.
2. Export a default function component accepting `{ size?, className? }`.
3. Use `<svg>` with `viewBox`, `width={size}`, `height={size}`, `fill="none"`, `stroke="currentColor"`.
4. Apply `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
5. Use fills from the quadrant palette at 15–25% opacity.
6. Add the export to `index.ts`.
7. Wire the component into the appropriate page or shared wrapper.

---

## Wiring Reference

| Illustration | Wired In | Trigger |
|---|---|---|
| SchedulerEmpty | Scheduler page | No events |
| DevelopmentEmpty | Development page | No child data |
| PlayLabEmpty | Play Lab page | No activities |
| CoachEmpty | Coach page | No conversations |
| SchedulerTransition | Scheduler page | Page mount |
| DevelopmentTransition | Development page | Page mount |
| PlayLabTransition | Play Lab page | Page mount |
| CoachTransition | Coach page | Page mount |
| MilestoneAchieved | Development page | Milestone toggled to "hit" |
| ActivityScheduled | Scheduler + Play Lab | Event approved / activity scheduled |
| TipSaved | Coach page | Tip bookmarked |
| MorningMug | Dashboard | Before 12:00 |
| AfternoonSun | Dashboard | 12:00–17:00 |
| EveningMoon | Dashboard | After 17:00 |
| SensoryIcon | Play Lab | Category = sensory |
| MotorIcon | Play Lab | Category = motor/movement |
| CognitiveIcon | Play Lab | Category = cognitive/stem |
| CreativeIcon | Play Lab | Category = creative/art |
| SleepIcon | Coach | Tip category includes "sleep" |
| BehaviorIcon | Coach | Tip category includes "behavior" |
| NutritionIcon | Coach | Tip category includes "nutrition" |
| DevelopmentTipIcon | Coach | Tip category includes "development" |
| SafetyIcon | Coach | Tip category includes "safety" |
| MilestoneCognitive | Development | Category = cognitive |
| MilestoneMotor | Development | Category = motor |
| MilestoneLanguage | Development | Category = language |
| MilestoneSocial | Development | Category = social |
| LeafSprig | Welcome Screen | Ambient accent (top-left) |
| DriftingCrane | Welcome Screen | Ambient accent (bottom-right) |
| BalloonSprig | Landing page | Ambient accent (lower-right) |
