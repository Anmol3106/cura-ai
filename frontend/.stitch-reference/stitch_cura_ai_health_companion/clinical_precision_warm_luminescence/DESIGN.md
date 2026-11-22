---
name: Clinical Precision & Warm Luminescence
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#554244'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#877273'
  outline-variant: '#dac0c2'
  surface-tint: '#9b4050'
  primary: '#37000e'
  on-primary: '#ffffff'
  primary-container: '#580c1f'
  on-primary-container: '#db7382'
  inverse-primary: '#ffb2ba'
  secondary: '#b02a3e'
  on-secondary: '#ffffff'
  secondary-container: '#ff6473'
  on-secondary-container: '#680019'
  tertiary: '#360016'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c002a'
  on-tertiary-container: '#e76891'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dc'
  primary-fixed-dim: '#ffb2ba'
  on-primary-fixed: '#400011'
  on-primary-fixed-variant: '#7d2939'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b5'
  on-secondary-fixed: '#40000c'
  on-secondary-fixed-variant: '#8f0c28'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c5'
  on-tertiary-fixed: '#3f001a'
  on-tertiary-fixed-variant: '#861a45'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4.25rem
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.875rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: '0'
  body-sm:
    fontFamily: Manrope
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: '0'
  label-lg:
    fontFamily: Manrope
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Manrope
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The brand personality merges clinical authority with empathetic, bespoke intelligence. It caters to discerning patients, health-conscious leaders, and forward-thinking clinicians who demand both absolute data privacy and effortless clarity. The interface must evoke calm reassurance, uncompromised safety, and cutting-edge analytical power—eschewing cold hospital blues in favor of an opulent, grounding palette anchored by deep burgundy and pristine chalk neutrals.

The visual style is rooted in **Modern Minimalist Humanism** accented by **Refined Glassmorphism**. Layouts breathe with generous negative space, crisp hairline boundaries, and translucent floating panels that convey weightless precision. Every surface feels meticulously engineered yet deeply human, delivering an authoritative medical companion experience that feels more like an attentive private physician than an algorithmic tool.

## Colors

The palette establishes an immediate sense of trust and refinement:
- **Primary Burgundy (`#580C1F`)**: Represents foundational clinical rigor, gravity, and premium craftsmanship. Used for primary interactive triggers, focal branding, and key affirmative states.
- **Secondary Crimson (`#9E1B32`)**: Infuses dynamic vitality and precision attention. Deployed for subtle state indicators, secondary active tags, and telemetry highlights.
- **Tertiary Deep Rose (`#831843`)**: Provides soft accentuation, tonal badge backgrounds, and warm ambient backdrops when diluted.
- **Neutral Charcoal (`#27272A`) & Muted Slate (`#71717A`)**: Deliver high-contrast, fatigue-free reading across diagnostic reports and dialogue streams.
- **Surface Foundations (`#FFFFFF`, `#FBFBFA`, `#F5F5F4`)**: Warm porcelain and chalk surfaces ensure the interface remains bright, organic, and clean without feeling sterile.

## Typography

The typography relies entirely on **Manrope**, leveraging its geometric purity, open counterforms, and clinical legibility. Large display titles command attention with tight negative tracking, giving telemetry metrics and primary hero headings a modern architectural presence. 

Body text utilizes balanced line heights (1.5x to 1.55x) to maintain effortless parsing across complex medical logs, diagnostic breakdowns, and conversational AI streams. Labels, status tags, and regulatory indicators (HIPAA markers, encryption states) use medium-to-bold weights with slight letter spacing expansion to ensure high-visibility utility even at diminutive scales.

## Layout & Spacing

This design system employs a **12-column responsive fluid grid** anchored by a maximum desktop container width of `1280px` for conversational dashboards and `1440px` for data-heavy analytic matrices. 

- **Desktop (1024px+)**: 12 columns with `1.5rem` gutters and `2rem` outer page margins. Sectional content separates cleanly with `space-xl` gaps to prevent visual fatigue and reinforce medical tranquility.
- **Tablet (768px - 1023px)**: 8 columns with `1.25rem` gutters and `1.5rem` margins. Side panels fold into overlay drawers or stacked horizontal groupings.
- **Mobile (< 768px)**: 4 columns with `1rem` gutters and `1rem` outer margins. Micro-metrics transition from multi-column tiles to vertically stacked horizontal cards.

Spacing maintains strict proportional rhythm: tight micro-spacing (`space-xs` and `space-sm`) binds paired indicators such as icons and labels, while expansive macro-spacing (`space-lg` and `space-xl`) isolates independent clinical modules.

## Elevation & Depth

Visual hierarchy relies on structural translucency, surface layering, and diffused micro-shadows rather than aggressive drop shadows:

- **Surface 0 (Base Canvas)**: Warm porcelain `#FBFBFA` creating an organic, glare-free foundation.
- **Surface 1 (Panels & Cards)**: Pure white `#FFFFFF` paired with an ultra-thin border (`1px solid rgba(39, 39, 42, 0.08)`) and an ambient micro-shadow (`0 1px 3px rgba(88, 12, 31, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02)`).
- **Surface 2 (Floating Overlays & Menus)**: Semi-translucent pure white (`rgba(255, 255, 255, 0.88)`) with `12px` backdrop blur, a light burgundy-tinted hairline stroke (`1px solid rgba(88, 12, 31, 0.08)`), and soft depth (`0 8px 24px -4px rgba(88, 12, 31, 0.06)`).
- **Surface 3 (Modals & Critical Alerts)**: Elevated pure white surfaces resting above a soft veil (`rgba(39, 39, 42, 0.40)` with `4px` blur), framed by a distinct structural shadow (`0 20px 40px -8px rgba(88, 12, 31, 0.12)`).

## Shapes

The shape architecture balances technological precision with biological softness. Base interactive surfaces, cards, and input modules adopt `rounded-lg` (1rem / 16px) and `rounded-xl` (1.5rem / 24px) radiuses, eliminating sharp clinical hostility while avoiding overly toy-like curvatures. 

Status badges, biometric micro-indicators, conversation prompts, and primary action buttons utilize full pill shapes (`rounded-full`), establishing a clear gestural affordance that invites touch and interaction.

## Components

### Buttons
- **Primary CTA**: Solid deep burgundy (`#580C1F`) background with pure white text, pill-shaped (`rounded-full`), height of 44px (40px on mobile). On hover, shifts to `#4A0E17` with a subtle elevation glow (`0 4px 14px rgba(88, 12, 31, 0.25)`).
- **Secondary Button**: Crisp chalk surface with a delicate border (`1px solid rgba(88, 12, 31, 0.18)`), deep burgundy text, and a soft rose hover wash (`rgba(158, 27, 50, 0.04)`).
- **Ghost/Tertiary**: No border; slate text (`#3F3F46`) transitioning to burgundy (`#580C1F`) on hover with an ambient background tint.

### Chips & Badges
- **Status Pills**: Fully rounded capsules with a 24px height. Composed of an ultra-soft tinted background (`rgba(158, 27, 50, 0.06)`), an accent hairline outline (`rgba(158, 27, 50, 0.15)`), and secondary crimson text (`#9E1B32`).
- **Interactive Filter Chips**: White background, 1px neutral border, transitioning to a filled burgundy state upon selection with smooth 150ms transitions.

### Cards & Panels
- Constructed on pure white (`#FFFFFF`) with `rounded-xl` (24px) corners, framed by hairline strokes (`rgba(39, 39, 42, 0.06)`).
- Interior padding adheres to `space-lg` (24px). Header sections feature discrete contextual meta-tags or biometric timestamps.

### Input Fields & Controls
- **Text Inputs**: Clean 44px containers with warm white backgrounds (`#FAFAFA`), subtle inset hairline borders (`rgba(39, 39, 42, 0.12)`), and Charcoal text (`#27272A`). Focus states feature an ambient burgundy ring (`0 0 0 3px rgba(88, 12, 31, 0.10)`) and crisp burgundy border (`#580C1F`).
- **Checkboxes & Radios**: 20px rounded squares (checkbox) or circles (radio) with a 1.5px border. Checked state transitions smoothly into solid deep burgundy with an crisp interior white glyph.

### Medical & AI Trust Elements
- **Clinical Security Badges**: Dedicated micro-panels displaying HIPAA compliance, zero-data retention tokens, and clinical verification checkmarks with a refined lock glyph and muted subtext.
- **AI Synthesis Streams**: Conversational outputs are framed within translucent cards featuring a 2px left-hand border accent in refined crimson (`#9E1B32`), clearly demarcating generated health guidance from raw user inputs.