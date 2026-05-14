---
name: FinCredit Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e1'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf4'
  surface-container-high: '#e9e7ef'
  surface-container-highest: '#e3e1e9'
  on-surface: '#1a1b21'
  on-surface-variant: '#444651'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f7'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#faf8ff'
  on-background: '#1a1b21'
  surface-variant: '#e3e1e9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
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
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system is built to convey institutional stability and modern efficiency. It targets financial professionals and credit managers who require high-density information presented with absolute clarity. 

The aesthetic follows a **Modern Corporate** direction, utilizing a disciplined grid, generous whitespace to reduce cognitive load during complex data entry, and a clear visual hierarchy. It avoids decorative flourishes, favoring functional minimalism that emphasizes accuracy and growth. The interface should feel like a high-end tool—reliable, responsive, and authoritative.

## Colors
The palette is anchored by **Institutional Navy Blue**, used for primary navigation and critical actions to establish a foundation of trust. **Emerald Green** serves as the primary accent, specifically reserved for positive growth indicators, "Paid" statuses, and successful transaction confirmations.

Backgrounds utilize a cool Neutral Gray palette to differentiate between the canvas and interactive surfaces. Semantic colors follow industry standards but are calibrated for high legibility against white backgrounds to ensure financial alerts are immediately recognizable.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy contexts and its neutral, professional tone. A strict typographic scale ensures that financial figures are prioritized. 

For tabular data and currency values, the system permits the use of a secondary monospace font (**JetBrains Mono**) to ensure numerical alignment and readability in dense spreadsheets. Use `label-caps` for table headers and section titles to create clear visual separation.

## Layout & Spacing
The layout employs a **12-column fluid grid** for desktop, transitioning to a single-column stack for mobile. Spacing follows a strictly enforced 4px base unit to maintain mathematical harmony.

- **Desktop:** 24px margins, 24px gutters. Use a fixed side-navigation (280px) to anchor the dashboard experience.
- **Tablet:** 16px margins, 16px gutters. Side-navigation collapses to an icon-rail.
- **Mobile:** 16px margins. Focus on card-based vertical stacking for loan summaries.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Ambient Shadows**. 
1. **Level 0 (Background):** Neutral Gray (#F8FAFC) - The canvas.
2. **Level 1 (Cards/Surfaces):** Pure White (#FFFFFF) - Contains content. Uses a subtle 1px border (#E2E8F0) and a soft, diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.1)).
3. **Level 2 (Modals/Popovers):** Pure White with a more pronounced shadow to indicate focus and interaction priority.

Avoid heavy gradients; depth should feel natural and light, mimicking paper layers in a well-organized file.

## Shapes
The design system adopts a **Rounded** shape language. A standard radius of **8px** is applied to buttons, input fields, and small components, while larger containers like dashboard cards use **12px**. This softening of corners balances the institutional nature of the Navy Blue, making the software feel modern and accessible rather than rigid and dated.

## Components
- **Financial Cards:** Must include a header for the client name/ID, a primary "Current Balance" figure, and a progress bar utilizing the secondary color (#10B981) to show loan repayment percentage.
- **Data Tables:** High-density rows (48px height) with light gray dividers. Columns containing currency must be right-aligned.
- **Status Badges:** Rounded-pill shape with subtle background tints.
    - *Active:* Light Green background, Dark Green text.
    - *Mora (Overdue):* Light Red background, Dark Red text.
    - *Paid:* Emerald Green background, White text.
- **Action Buttons:** 
    - *Primary:* Solid Navy Blue (#1E3A8A) with white text for "Record Payment" or "New Sale."
    - *Secondary:* Outlined Navy Blue for "Export" or "View Details."
- **Input Fields:** 1px border with a 4px focus ring in Navy Blue. Placeholder text should be muted (#64748B).
- **Progress Bars:** 8px height, rounded ends. The background "track" should be a very light gray (#F1F5F9).