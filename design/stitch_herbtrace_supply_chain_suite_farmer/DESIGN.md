---
name: HerbTrace
colors:
  surface: '#0c160e'
  surface-dim: '#0c160e'
  surface-bright: '#323c32'
  surface-container-lowest: '#071009'
  surface-container-low: '#141e16'
  surface-container: '#18221a'
  surface-container-high: '#222c24'
  surface-container-highest: '#2d372e'
  on-surface: '#dae6d8'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#dae6d8'
  inverse-on-surface: '#29332a'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e479'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff88'
  on-primary-container: '#007139'
  inverse-primary: '#006d37'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#fffaf7'
  on-tertiary: '#3d2f00'
  tertiary-container: '#ffdb79'
  on-tertiary-container: '#795f01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff99'
  primary-fixed-dim: '#00e479'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffe08d'
  tertiary-fixed-dim: '#e5c364'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#0c160e'
  on-background: '#dae6d8'
  surface-variant: '#2d372e'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  technical-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  technical-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system embodies "Digital Nature"—a fusion of organic origin and cryptographic precision. It is designed for a premium B2B supply chain audience that values transparency, sustainability, and technological edge. 

The aesthetic sits at the intersection of high-end startup minimalism and bio-technical utility. It utilizes a deep, immersive dark mode to suggest the richness of forest soil, contrasted against high-visibility "bioluminescent" accents that signify verification and data integrity. The overall atmosphere should feel premium, secure, and sophisticated, mirroring the precision of a laboratory with the soul of an apothecary.

## Colors
This design system utilizes a high-contrast dark palette to maximize legibility and emphasize technical precision.

- **Deep Forest Dark (#0D1F0F):** The foundational canvas. It provides a more organic, softer alternative to pure black.
- **Bioluminescent Green (#00FF88):** Used exclusively for high-priority actions, "Verified" status markers, and successful blockchain confirmations.
- **Turmeric Amber (#F59E0B):** Reserved for cautionary states, risk assessments in the supply chain, and pending status.
- **Surface & Border:** Surfaces utilize a muted green-tinted dark shade (#1A2E1C). Borders should be applied at low opacities (10-20%) to create subtle separation without breaking the dark immersion.

## Typography
The typography strategy differentiates between "Human" storytelling and "Machine" data.

- **Sora** is used for brand-facing elements and headlines. Its geometric but open nature feels modern and approachable.
- **Inter** provides high readability for long-form data, descriptions, and logistical details.
- **JetBrains Mono** is strictly reserved for technical strings—batch IDs, wallet addresses, and timestamps. This reinforces the "Traceability" aspect of the platform.

All headlines should favor a tighter letter-spacing for a more "designed" and professional feel.

## Layout & Spacing
The layout follows a 12-column fluid grid for desktop and a 4-column grid for mobile. Despite the high-density data requirements of supply chain management, the design system mandates "breathable" layouts.

- **Rhythm:** An 8px-based spatial system ensures consistency.
- **Data Density:** Use "md" (24px) padding for standard cards and "sm" (16px) for data-heavy tables.
- **Safe Areas:** On desktop, use a max-width container of 1440px to maintain focus, centered with fluid margins.
- **Reflow:** On mobile devices, complex horizontal data tables should transition into vertical "Summary Cards" to maintain legibility.

## Elevation & Depth
This design system employs **Glassmorphism** to create a sense of layering and transparency, mimicking the clarity of a clean supply chain.

- **Base Layer:** The Deep Forest Dark background.
- **Surface Layer:** Use `#1A2E1C` at 60% opacity with a `16px` backdrop-blur. 
- **Borders:** Instead of shadows, use 1px solid borders using the primary green or surface color at very low opacity (10-15%). This creates a "etched" look.
- **Floating Elements:** Only high-level modals should use a soft, diffused shadow (Blur: 40px, Spread: -10px, Color: #000000 at 50% opacity) to lift them above the glass layers.

## Shapes
Shapes are "Soft-Technical." We avoid the aggressive roundness of consumer apps and the harsh sharpness of legacy enterprise software.

- **Components:** Buttons and input fields use a standard 0.5rem (8px) radius.
- **Containers:** Large dashboard cards and sections use 1rem (16px) or 1.5rem (24px) for a more architectural feel.
- **Icons:** Use linear, 2px stroke icons with slightly rounded terminals to match the font geometry of Sora.

## Components
- **Buttons:** Primary buttons are solid Bioluminescent Green with black text for maximum contrast. Secondary buttons are ghost-style with subtle glass backgrounds and 1px borders.
- **Traceability Chips:** Small, rounded-pill indicators using JetBrains Mono for status (e.g., "VERIFIED" or "IN-TRANSIT"). They should use low-opacity versions of the green or amber colors as backgrounds.
- **Data Cards:** Utilize the glassmorphic style. Headers of cards should be separated by a thin 10% opacity line.
- **Input Fields:** Darker than the surface layer, with a Bioluminescent Green 2px border highlight on focus. Labels should use Inter (Semi-bold) in Sage/Muted Green.
- **Blockchain Hashes:** Always rendered in JetBrains Mono. Use a "Click to Copy" pattern with a subtle green hover state.
- **Motifs:** Integrate subtle SVG leaf venation patterns or hexagonal grid overlays at 2-5% opacity in the background of major sections to reinforce the herb/tech hybrid identity.