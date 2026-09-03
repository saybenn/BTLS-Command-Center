# BTLS UI Tokens

> **Repository location:** `context/ui-tokens.md`  
> **Visual baseline:** Approved BTLS Command Center dark dashboard concept  
> **Default theme:** Dark  
> **Supported alternate theme:** Light  
> **Applies to:** Command Center, Revenue Operations, Robin, Website Intelligence, Smart Blog Studio, Content Intelligence, and shared Work Management
>
> This document defines the visual constants used throughout BTLS. Components must use these semantic tokens rather than hardcoded colors, arbitrary spacing, or raw Tailwind color utilities. The BTLS theme is the fallback for every property; approved property branding may override only the controlled brand-token layer defined below.

---

## 1. Design Direction

The BTLS interface should feel:

- Professional
- Calm
- Modern
- Operational
- Information-rich without feeling crowded
- Premium without decorative excess
- Trustworthy enough for business and revenue data
- Familiar to developers and operators
- Clear enough for clients who are not analytics experts

The approved visual direction uses:

- Deep navy application backgrounds
- Slightly lighter navy surfaces
- Blue-violet primary actions
- Crisp white primary text
- Cool muted secondary text
- Thin low-contrast borders
- Restrained shadows
- Green for positive business outcomes
- Amber for warnings and pending attention
- Red for destructive or failed states
- Purple as a limited secondary intelligence accent

### Theme behavior

- Dark mode is the product default.
- Light mode is supported by the same semantic tokens.
- The BTLS blue-violet scheme is the safe default for every property.
- A property may apply a validated client-brand accent family.
- Client branding changes semantic token values, not component structure.
- Components must never contain theme-specific or client-specific hex values.
- Theme switching changes token values, not component structure.
- Do not design a separate light-mode or client-specific interface.

---

## 2. Token Usage Rules

Use semantic project tokens:

```tsx
<div className="bg-surface text-text-primary border border-border">
  ...
</div>
```

Never use hardcoded colors:

```tsx
// Incorrect
<div className="bg-[#111936] text-[#F8FAFF]" />
```

Never use raw Tailwind palette utilities in product components:

```tsx
// Incorrect
<div className="bg-indigo-600 text-slate-300 border-slate-700" />
```

Limited exception:

- Temporary prototypes may use raw values only before they enter the shared codebase.
- Approved data-visualization libraries may require resolved CSS variables at their configuration boundary.
- Every permanent component must resolve colors from these tokens.

---

## 2.1 Client Property Branding

BTLS supports controlled property-level branding without creating separate stylesheets, deployments, or component variants for each client.

The objective is:

```text
One shared interface
+ one semantic token system
+ optional property brand overrides
= a recognizable client dashboard without design fragmentation
```

### What client branding may change

A property may override:

- Primary accent
- Primary hover color
- Primary active color
- Soft accent background
- Muted accent background
- Accent foreground
- Accent focus ring
- Focus border
- Selection tint
- Primary chart series
- Property logo
- Property wordmark where supplied
- Favicon or small brand mark where supported

These overrides affect components already using semantic tokens such as:

- Primary buttons
- Active navigation
- Selected tabs
- Links
- Focus indicators
- Primary progress indicators
- Main chart series
- Accent badges

### What client branding may not change

Property branding must not override:

- Main application backgrounds
- Card and table surfaces
- Primary or muted text
- Borders outside the approved focus token
- Success, warning, danger, or informational colors
- Robin's intelligence-purple identity
- Lead and ticket status meaning
- Typography
- Spacing
- Radius
- Shadows
- Component layout
- Accessibility requirements

This prevents a client's brand color from changing the meaning of errors, success states, Robin actions, or workflow status.

### Storage decision

Color tokens are structured configuration and belong in PostgreSQL, not Supabase Storage.

Use a property-scoped record conceptually similar to:

```ts
interface PropertyBrandTheme {
  propertyId: string;
  mode: "BTLS_DEFAULT" | "CLIENT_BRAND";
  sourcePrimaryColor: string | null;
  lightTokens: PropertyBrandTokenSet | null;
  darkTokens: PropertyBrandTokenSet | null;
  logoMediaAssetId: string | null;
  wordmarkMediaAssetId: string | null;
  version: number;
  updatedById: string;
  updatedAt: Date;
}

interface PropertyBrandTokenSet {
  accent: string;
  accentHover: string;
  accentActive: string;
  accentSoft: string;
  accentMuted: string;
  accentForeground: string;
  accentRing: string;
  borderFocus: string;
  focusRing: string;
  selection: string;
  chartPrimary: string;
}
```

The exact Prisma model is defined during the property-branding implementation phase.

Use Supabase Storage only for brand files such as:

- Logo
- Wordmark
- Favicon
- Approved client mark

The database stores the `MediaAsset` relationship and validated theme configuration.

### Branding setup flow

```text
Authorized user enters or selects a primary brand color
→ server validates the input
→ application generates light and dark accent families
→ contrast and state checks run
→ user previews both themes
→ validated tokens are stored
→ property layout applies the overrides
```

Do not allow users to enter every token independently in the MVP.

The user provides one primary brand color. The application generates and validates the full family.

An optional secondary client color may be stored for future use, but it must not automatically replace the Robin intelligence color or semantic status colors.

### Validation requirements

Before a property theme is saved:

- Input must be a valid supported color value.
- Normal text and control foregrounds must meet WCAG AA contrast.
- Primary buttons must remain readable.
- Hover and active states must remain distinguishable.
- Focus rings must remain visible against both surfaces and backgrounds.
- Soft accent backgrounds must preserve readable foreground contrast.
- The dark and light token sets must both pass validation.
- Colors too close to danger, warning, or success meanings may be adjusted for interface use.
- A failed validation returns a clear explanation and keeps the BTLS fallback active.

Never trust browser-generated token values without server validation.

### Runtime application

Load branding with the authorized property layout and scope it to the property shell.

Define property override variables separately from the standard tokens:

```css
[data-property-brand] {
  --accent: var(--brand-light-accent, #5c63f2);
  --accent-hover: var(--brand-light-accent-hover, #4f56e5);
  --accent-active: var(--brand-light-accent-active, #444bd3);
  --accent-soft: var(--brand-light-accent-soft, #e9eaff);
  --accent-muted: var(--brand-light-accent-muted, #cfd2ff);
  --accent-foreground: var(--brand-light-accent-foreground, #ffffff);
  --accent-ring: var(--brand-light-accent-ring, rgba(92, 99, 242, 0.32));
  --border-focus: var(--brand-light-border-focus, #6067f2);
  --focus-ring: var(--brand-light-focus-ring, #6870ff);
  --selection: var(--brand-light-selection, rgba(92, 99, 242, 0.2));
  --chart-1: var(--brand-light-chart-primary, #5c63f2);
}

.dark [data-property-brand] {
  --accent: var(--brand-dark-accent, #6269ff);
  --accent-hover: var(--brand-dark-accent-hover, #747aff);
  --accent-active: var(--brand-dark-accent-active, #5057e8);
  --accent-soft: var(--brand-dark-accent-soft, #232d68);
  --accent-muted: var(--brand-dark-accent-muted, #343e84);
  --accent-foreground: var(--brand-dark-accent-foreground, #ffffff);
  --accent-ring: var(--brand-dark-accent-ring, rgba(111, 119, 255, 0.4));
  --border-focus: var(--brand-dark-border-focus, #7279ff);
  --focus-ring: var(--brand-dark-focus-ring, #7b82ff);
  --selection: var(--brand-dark-selection, rgba(98, 105, 255, 0.3));
  --chart-1: var(--brand-dark-chart-primary, #6269ff);
}
```

The server-rendered property shell supplies only validated variables:

```tsx
<div
  data-property-brand
  style={
    {
      "--brand-light-accent": theme.light.accent,
      "--brand-light-accent-hover": theme.light.accentHover,
      "--brand-light-accent-active": theme.light.accentActive,
      "--brand-light-accent-soft": theme.light.accentSoft,
      "--brand-light-accent-muted": theme.light.accentMuted,
      "--brand-light-accent-foreground": theme.light.accentForeground,
      "--brand-light-accent-ring": theme.light.accentRing,
      "--brand-light-border-focus": theme.light.borderFocus,
      "--brand-light-focus-ring": theme.light.focusRing,
      "--brand-light-selection": theme.light.selection,
      "--brand-light-chart-primary": theme.light.chartPrimary,

      "--brand-dark-accent": theme.dark.accent,
      "--brand-dark-accent-hover": theme.dark.accentHover,
      "--brand-dark-accent-active": theme.dark.accentActive,
      "--brand-dark-accent-soft": theme.dark.accentSoft,
      "--brand-dark-accent-muted": theme.dark.accentMuted,
      "--brand-dark-accent-foreground": theme.dark.accentForeground,
      "--brand-dark-accent-ring": theme.dark.accentRing,
      "--brand-dark-border-focus": theme.dark.borderFocus,
      "--brand-dark-focus-ring": theme.dark.focusRing,
      "--brand-dark-selection": theme.dark.selection,
      "--brand-dark-chart-primary": theme.dark.chartPrimary,
    } as React.CSSProperties
  }
>
  {children}
</div>
```

Do not fetch or calculate branding independently inside individual components.

### Cross-property screens

BTLS-wide administrative screens may display many properties at once.

Use the default BTLS theme for the overall cross-property interface.

Client branding may appear there only through restrained identifiers such as:

- Logo
- Small brand-color marker
- Property avatar
- Property badge

Do not recolor the entire interface as users scan across multiple properties.

### Fallback behavior

The BTLS default tokens remain valid at all times.

Use the default theme when:

- No client branding exists
- Branding is disabled
- Stored configuration is incomplete
- Validation fails
- A property is suspended
- Theme loading fails

Property branding must never prevent a dashboard from rendering.

---

# 3. Tailwind CSS v4 Token Definition

Use semantic CSS custom properties for themes and map them into Tailwind through `@theme inline`.

Add the following structure to `src/app/globals.css`.

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  color-scheme: light;

  /* Page backgrounds */
  --background: #f4f6fb;
  --background-subtle: #eef1f8;
  --sidebar: #ffffff;
  --sidebar-elevated: #f7f8fc;

  /* Surfaces */
  --surface: #ffffff;
  --surface-raised: #ffffff;
  --surface-secondary: #f7f8fc;
  --surface-tertiary: #eef1f8;
  --surface-interactive: #f2f4fa;
  --surface-hover: #e9edf7;
  --surface-selected: #e8ebff;
  --surface-overlay: rgba(17, 24, 39, 0.56);

  /* Borders */
  --border: #dfe4ef;
  --border-strong: #cbd3e3;
  --border-subtle: #e9edf5;
  --border-focus: #6067f2;

  /* Text */
  --text-primary: #11172b;
  --text-secondary: #4f5c78;
  --text-muted: #7b879f;
  --text-disabled: #a8b0c2;
  --text-inverse: #f8faff;

  /* Primary blue-violet */
  --accent: #5c63f2;
  --accent-hover: #4f56e5;
  --accent-active: #444bd3;
  --accent-soft: #e9eaff;
  --accent-muted: #cfd2ff;
  --accent-foreground: #ffffff;
  --accent-ring: rgba(92, 99, 242, 0.32);

  /* Secondary intelligence purple */
  --intelligence: #8b5cf6;
  --intelligence-hover: #7c4fea;
  --intelligence-soft: #f0eaff;
  --intelligence-foreground: #5d2fc0;

  /* Status */
  --success: #12a873;
  --success-hover: #0d9163;
  --success-soft: #dcf7ec;
  --success-foreground: #087654;

  --info: #3478f6;
  --info-hover: #2867dd;
  --info-soft: #e1ecff;
  --info-foreground: #1d55b5;

  --warning: #e79a15;
  --warning-hover: #cc8210;
  --warning-soft: #fff0ce;
  --warning-foreground: #875404;

  --danger: #e6495f;
  --danger-hover: #ce394e;
  --danger-soft: #ffe3e8;
  --danger-foreground: #a5253b;

  /* Data visualization */
  --chart-1: #5c63f2;
  --chart-2: #3f8cff;
  --chart-3: #20c997;
  --chart-4: #9b5de5;
  --chart-5: #f6ae2d;
  --chart-6: #ef5da8;
  --chart-grid: #dfe4ef;
  --chart-axis: #74809a;
  --chart-reference: #9aa5ba;

  /* Focus, selection, and code */
  --focus-ring: #6870ff;
  --selection: rgba(92, 99, 242, 0.2);
  --code-background: #edf0f7;

  /* Shadows */
  --shadow-color: 24 33 58;
}

.dark {
  color-scheme: dark;

  /* Page backgrounds */
  --background: #080f22;
  --background-subtle: #0b1329;
  --sidebar: #0a1126;
  --sidebar-elevated: #101a34;

  /* Surfaces */
  --surface: #111a35;
  --surface-raised: #151f3e;
  --surface-secondary: #192443;
  --surface-tertiary: #202b4c;
  --surface-interactive: #1b2648;
  --surface-hover: #243055;
  --surface-selected: #242d68;
  --surface-overlay: rgba(2, 6, 23, 0.76);

  /* Borders */
  --border: #27345d;
  --border-strong: #35436f;
  --border-subtle: #1d294c;
  --border-focus: #7279ff;

  /* Text */
  --text-primary: #f7f8ff;
  --text-secondary: #b9c2df;
  --text-muted: #8490b4;
  --text-disabled: #5e698a;
  --text-inverse: #0a1022;

  /* Primary blue-violet */
  --accent: #6269ff;
  --accent-hover: #747aff;
  --accent-active: #5057e8;
  --accent-soft: #232d68;
  --accent-muted: #343e84;
  --accent-foreground: #ffffff;
  --accent-ring: rgba(111, 119, 255, 0.4);

  /* Secondary intelligence purple */
  --intelligence: #9b72ff;
  --intelligence-hover: #ab8aff;
  --intelligence-soft: #30245d;
  --intelligence-foreground: #d9c8ff;

  /* Status */
  --success: #2ed6a1;
  --success-hover: #45e2b2;
  --success-soft: #123f39;
  --success-foreground: #6ff0c5;

  --info: #4a8dff;
  --info-hover: #67a0ff;
  --info-soft: #172f5c;
  --info-foreground: #91baff;

  --warning: #f6aa2c;
  --warning-hover: #ffbb4b;
  --warning-soft: #4a3616;
  --warning-foreground: #ffd17d;

  --danger: #f04f67;
  --danger-hover: #ff6a80;
  --danger-soft: #4a202d;
  --danger-foreground: #ff9aac;

  /* Data visualization */
  --chart-1: #6269ff;
  --chart-2: #4a8dff;
  --chart-3: #2ed6a1;
  --chart-4: #a06cff;
  --chart-5: #f6aa2c;
  --chart-6: #f36aa8;
  --chart-grid: #263355;
  --chart-axis: #8d99bb;
  --chart-reference: #5f6a8e;

  /* Focus, selection, and code */
  --focus-ring: #7b82ff;
  --selection: rgba(98, 105, 255, 0.3);
  --code-background: #0c142b;

  /* Shadows */
  --shadow-color: 0 0 0;
}

@theme inline {
  /* Typography */
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);

  /* Page backgrounds */
  --color-background: var(--background);
  --color-background-subtle: var(--background-subtle);
  --color-sidebar: var(--sidebar);
  --color-sidebar-elevated: var(--sidebar-elevated);

  /* Surfaces */
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-tertiary: var(--surface-tertiary);
  --color-surface-interactive: var(--surface-interactive);
  --color-surface-hover: var(--surface-hover);
  --color-surface-selected: var(--surface-selected);
  --color-surface-overlay: var(--surface-overlay);

  /* Borders */
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-border-subtle: var(--border-subtle);
  --color-border-focus: var(--border-focus);

  /* Text */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-disabled: var(--text-disabled);
  --color-text-inverse: var(--text-inverse);

  /* Primary accent */
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-active: var(--accent-active);
  --color-accent-soft: var(--accent-soft);
  --color-accent-muted: var(--accent-muted);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent-ring: var(--accent-ring);

  /* Intelligence accent */
  --color-intelligence: var(--intelligence);
  --color-intelligence-hover: var(--intelligence-hover);
  --color-intelligence-soft: var(--intelligence-soft);
  --color-intelligence-foreground: var(--intelligence-foreground);

  /* Status */
  --color-success: var(--success);
  --color-success-hover: var(--success-hover);
  --color-success-soft: var(--success-soft);
  --color-success-foreground: var(--success-foreground);

  --color-info: var(--info);
  --color-info-hover: var(--info-hover);
  --color-info-soft: var(--info-soft);
  --color-info-foreground: var(--info-foreground);

  --color-warning: var(--warning);
  --color-warning-hover: var(--warning-hover);
  --color-warning-soft: var(--warning-soft);
  --color-warning-foreground: var(--warning-foreground);

  --color-danger: var(--danger);
  --color-danger-hover: var(--danger-hover);
  --color-danger-soft: var(--danger-soft);
  --color-danger-foreground: var(--danger-foreground);

  /* Charts */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-chart-grid: var(--chart-grid);
  --color-chart-axis: var(--chart-axis);
  --color-chart-reference: var(--chart-reference);

  /* Utility */
  --color-focus-ring: var(--focus-ring);
  --color-selection: var(--selection);
  --color-code-background: var(--code-background);

  /* Radius */
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgb(var(--shadow-color) / 0.12);
  --shadow-sm:
    0 1px 3px rgb(var(--shadow-color) / 0.14),
    0 1px 2px rgb(var(--shadow-color) / 0.08);
  --shadow-md:
    0 8px 24px rgb(var(--shadow-color) / 0.16),
    0 2px 8px rgb(var(--shadow-color) / 0.08);
  --shadow-lg:
    0 18px 48px rgb(var(--shadow-color) / 0.22),
    0 4px 12px rgb(var(--shadow-color) / 0.1);
}

html {
  background: var(--background);
}

body {
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--font-inter), sans-serif;
}

::selection {
  background: var(--selection);
}
```

### Default theme initialization

Until a stored user preference exists, render the root document with the `dark` class.

```tsx
<html lang="en" className="dark">
```

When theme settings are implemented:

- `dark` remains the default.
- `light` removes the `dark` class.
- `system` follows the operating-system preference.
- Persist the user's choice.
- Prevent a light-to-dark flash during initial rendering.

---

# 4. Core Color Roles

## Page and navigation

| Element | Token |
|---|---|
| Main application background | `bg-background` |
| Subtle background division | `bg-background-subtle` |
| Sidebar | `bg-sidebar` |
| Elevated sidebar control | `bg-sidebar-elevated` |
| Standard card | `bg-surface` |
| Elevated card or modal | `bg-surface-raised` |
| Nested panel | `bg-surface-secondary` |
| Quiet grouped region | `bg-surface-tertiary` |
| Hoverable row | `bg-surface-interactive` |
| Hover state | `bg-surface-hover` |
| Selected row or navigation item | `bg-surface-selected` |
| Modal backdrop | `bg-surface-overlay` |

## Borders

| Use | Token |
|---|---|
| Standard card and input border | `border-border` |
| Emphasized divider | `border-border-strong` |
| Quiet internal divider | `border-border-subtle` |
| Focused control | `border-border-focus` |

## Text

| Use | Token |
|---|---|
| Headings and high-priority values | `text-text-primary` |
| Normal supporting text | `text-text-secondary` |
| Timestamps, hints, and placeholders | `text-text-muted` |
| Disabled text | `text-text-disabled` |
| Text on bright filled controls | `text-text-inverse` or `text-accent-foreground` |

## Primary accent

The default primary accent is BTLS blue-violet.

When validated property branding is enabled, these same semantic accent tokens resolve to the client's generated brand family. Components must never assume that the accent is purple or blue.

Use it for:

- Primary actions
- Active navigation
- Focus rings
- Selected tabs
- Main chart series
- Important links
- Active progress indicators

Do not use it for:

- Every icon
- Every heading
- Decorative backgrounds across large areas
- Generic status meaning

## Intelligence accent

The intelligence purple is reserved for:

- Robin
- AI-generated assistance
- Intelligence-specific highlights
- Suggested next steps
- Draft recommendations awaiting operator review

It must not be used as a generic second primary color.

## Status colors

| Meaning | Main | Soft background | Foreground |
|---|---|---|---|
| Success, completed, healthy, positive trend | `success` | `success-soft` | `success-foreground` |
| Informational or neutral system state | `info` | `info-soft` | `info-foreground` |
| Warning, pending, needs attention | `warning` | `warning-soft` | `warning-foreground` |
| Error, destructive, failed, negative trend | `danger` | `danger-soft` | `danger-foreground` |

Status colors must not be the sole method of communicating meaning. Pair color with text, iconography, position, or pattern.

---

# 5. Typography

## Font families

### Interface font

Use **Inter** through `next/font/google`.

Inter was selected because it is:

- Familiar in professional software
- Highly readable at dashboard sizes
- Clear for numerals and tables
- Appropriate for dense operational interfaces
- Easy for new developers to work with

```ts
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

### Monospace font

Use **Geist Mono** or another approved legible monospace font for:

- IDs
- code
- raw event names
- integration identifiers
- developer-only diagnostics

Do not use monospace for ordinary metrics or table values.

## Type scale

| Token / role | Size | Line height | Weight | Typical use |
|---|---:|---:|---:|---|
| Display | 36px | 44px | 700 | Rare major product or onboarding heading |
| Page heading | 30px | 38px | 700 | Main page title |
| Section heading | 20px | 28px | 650 | Major dashboard region |
| Card heading | 16px | 24px | 600 | Card and panel titles |
| Body large | 16px | 26px | 400 | Important explanations |
| Body | 14px | 22px | 400 | Standard interface copy |
| Label | 13px | 18px | 500 | Form labels and table labels |
| Caption | 12px | 18px | 400 | Hints, metadata, timestamps |
| Eyebrow | 11px | 16px | 600 | Navigation group labels |
| KPI large | 32px | 38px | 700 | Primary card metric |
| KPI medium | 24px | 30px | 700 | Secondary metric |

### Tailwind examples

```tsx
<h1 className="text-[30px] leading-[38px] font-bold text-text-primary">
  Property Overview
</h1>

<p className="text-sm leading-[22px] text-text-secondary">
  Unified insights for stronger revenue and growth.
</p>
```

### Typography rules

- Use sentence case for headings and controls.
- Use title case only for proper product names.
- Avoid full uppercase except navigation eyebrows and very short labels.
- Do not reduce standard body text below 14px.
- Use tabular numbers for aligned financial and metric columns.
- Keep major numeric values visually stronger than their labels.
- Avoid more than three font weights on a single screen.

---

# 6. Spacing

Use a 4px base spacing system.

| Token / utility | Value | Common use |
|---|---:|---|
| `1` | 4px | Tight icon/text adjustment |
| `2` | 8px | Inline gaps and badges |
| `3` | 12px | Compact control gaps |
| `4` | 16px | Standard internal spacing |
| `5` | 20px | Medium card spacing |
| `6` | 24px | Default card padding and section gap |
| `8` | 32px | Large section separation |
| `10` | 40px | Page-level separation |
| `12` | 48px | Large composition spacing |
| `16` | 64px | Rare major layout spacing |

### Spacing rules

- Standard card padding: `p-6`
- Compact card padding: `p-4`
- Main dashboard grid gap: `gap-4` or `gap-5`
- Major section gap: `gap-6`
- Page side padding:
  - Mobile: `px-4`
  - Tablet: `px-6`
  - Desktop: `px-8`
- Top-level dashboard content should not use more than 32px padding per side on normal desktop widths.
- Avoid one-off values unless a real layout constraint requires them.

---

# 7. Radius

The interface should feel softly rounded, not bubbly.

| Token | Value | Use |
|---|---:|---|
| `rounded-xs` | 4px | Tiny internal elements |
| `rounded-sm` | 6px | Badges and compact controls |
| `rounded-md` | 8px | Inputs and buttons |
| `rounded-lg` | 12px | Small cards and menus |
| `rounded-xl` | 16px | Standard dashboard cards |
| `rounded-2xl` | 20px | Large feature panels and modals |
| `rounded-full` | Full | Avatars, status pills, icon circles |

### Radius rules

- Standard cards use `rounded-xl`.
- Nested panels use `rounded-lg`.
- Inputs and buttons use `rounded-md`.
- Avoid mixing more than three radius sizes in one component.
- Do not make large tables look like isolated bubbles row by row.

---

# 8. Borders and Dividers

The dark design depends on restrained borders rather than heavy shadows.

### Standard card

```text
background: bg-surface
border: 1px solid var(--border)
radius: rounded-xl
```

### Nested section

```text
background: bg-surface-secondary
border: 1px solid var(--border-subtle)
radius: rounded-lg
```

### Rules

- Use one-pixel borders.
- Use `border-border` for outer containers.
- Use `border-border-subtle` inside cards.
- Use `border-border-strong` only for meaningful separation.
- Do not stack a border, strong shadow, and contrasting background unless the element is a modal.
- Divider lines should be quiet and never dominate a data table.

---

# 9. Shadows

Dark mode should use minimal shadows because contrast comes mainly from surfaces and borders.

| Token | Use |
|---|---|
| `shadow-xs` | Tiny floating element |
| `shadow-sm` | Dropdown or compact popover |
| `shadow-md` | Modal, command palette, raised panel |
| `shadow-lg` | Rare major overlay |

### Shadow rules

- Standard dashboard cards generally use no shadow or `shadow-xs`.
- Menus and popovers may use `shadow-sm`.
- Modals use `shadow-md`.
- Avoid colored glow effects.
- The Robin panel may use a very restrained accent edge or gradient, not a large neon glow.
- Light mode may rely slightly more on shadows than dark mode, but border tokens remain present.

---

# 10. Component Tokens

## Application shell

### Sidebar

```text
width desktop:       232px
background:          bg-sidebar
border-right:        border-border-subtle
section label:       text-text-muted
default nav text:    text-text-secondary
active background:   bg-surface-selected
active text:         text-text-primary
active indicator:    bg-accent
```

### Top bar

```text
height:              72px
background:          bg-background
border-bottom:       border-border-subtle
horizontal padding:  32px desktop
```

### Main content

```text
max width:           none for dashboard views
horizontal padding:  32px desktop
vertical padding:    28px desktop
background:          bg-background
```

## Cards

### Standard dashboard card

```tsx
className="
  rounded-xl
  border border-border
  bg-surface
  p-6
"
```

### Elevated card

```tsx
className="
  rounded-xl
  border border-border-strong
  bg-surface-raised
  p-6
  shadow-sm
"
```

### Interactive card

```tsx
className="
  rounded-xl
  border border-border
  bg-surface
  p-5
  transition-colors
  hover:bg-surface-interactive
  hover:border-border-strong
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-focus-ring
"
```

## Buttons

### Primary

```tsx
className="
  h-10
  rounded-md
  bg-accent
  px-4
  text-sm font-medium
  text-accent-foreground
  transition-colors
  hover:bg-accent-hover
  active:bg-accent-active
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-focus-ring
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
  disabled:cursor-not-allowed
  disabled:opacity-50
"
```

### Secondary

```tsx
className="
  h-10
  rounded-md
  border border-border
  bg-surface
  px-4
  text-sm font-medium
  text-text-primary
  hover:bg-surface-hover
  hover:border-border-strong
"
```

### Ghost

```tsx
className="
  h-9
  rounded-md
  px-3
  text-sm font-medium
  text-text-secondary
  hover:bg-surface-hover
  hover:text-text-primary
"
```

### Destructive

```tsx
className="
  h-10
  rounded-md
  bg-danger
  px-4
  text-sm font-medium
  text-white
  hover:bg-danger-hover
"
```

### Button sizing

| Size | Height | Horizontal padding | Use |
|---|---:|---:|---|
| Small | 32px | 12px | Compact row action |
| Default | 40px | 16px | Standard action |
| Large | 44px | 20px | High-emphasis form action |
| Icon small | 32px | — | Compact icon |
| Icon default | 40px | — | Standard icon |

## Inputs

```tsx
className="
  h-10
  w-full
  rounded-md
  border border-border
  bg-surface-interactive
  px-3
  text-sm
  text-text-primary
  placeholder:text-text-muted
  focus:border-border-focus
  focus:outline-none
  focus:ring-2
  focus:ring-accent-ring
  disabled:cursor-not-allowed
  disabled:text-text-disabled
"
```

Input rules:

- Inputs must look slightly inset against cards.
- Labels use `text-text-secondary`.
- Help text uses `text-text-muted`.
- Error text uses `text-danger-foreground`.
- Error state uses `border-danger`.
- Do not rely on placeholder text as a label.

## Search and command input

```text
height:              40px
background:          bg-surface-interactive
border:              border-border
radius:              rounded-lg
icon:                text-text-muted
shortcut badge:      bg-surface-tertiary
```

## Badges

```tsx
className="
  inline-flex
  items-center
  rounded-full
  px-2.5 py-1
  text-xs font-medium
"
```

| Badge | Background | Text |
|---|---|---|
| Neutral | `bg-surface-tertiary` | `text-text-secondary` |
| Accent | `bg-accent-soft` | `text-accent` |
| Intelligence | `bg-intelligence-soft` | `text-intelligence-foreground` |
| Success | `bg-success-soft` | `text-success-foreground` |
| Info | `bg-info-soft` | `text-info-foreground` |
| Warning | `bg-warning-soft` | `text-warning-foreground` |
| Danger | `bg-danger-soft` | `text-danger-foreground` |

## Tables

```text
container:           bg-surface
outer border:        border-border
header background:   bg-surface-secondary
header text:         text-text-muted
row text:            text-text-secondary
primary cell text:   text-text-primary
row divider:         border-border-subtle
row hover:           bg-surface-hover
selected row:        bg-surface-selected
```

Table rules:

- Headers use sentence case.
- Numeric columns align right.
- Row action menus align right.
- Use tabular numbers for metrics and currency.
- Keep row height between 44px and 56px.
- Do not use vertical grid lines unless a specialized comparison table requires them.
- Avoid excessive status color across entire rows.

## Tabs

```text
container:           bg-surface-secondary
active background:   bg-surface-raised
active text:         text-text-primary
inactive text:       text-text-muted
active indicator:    accent
radius:              rounded-lg
```

## Dialogs and sheets

```text
backdrop:            bg-surface-overlay
surface:             bg-surface-raised
border:              border-border-strong
radius:              rounded-2xl
shadow:              shadow-md
```

## Tooltips and popovers

```text
surface:             bg-surface-raised
border:              border-border-strong
text:                text-text-secondary
radius:              rounded-lg
shadow:              shadow-sm
```

## Toasts and alerts

Use status tokens and an icon.

Do not fill the entire alert with a saturated color. Prefer:

```text
soft status background
status foreground icon
primary text in text-primary
supporting text in text-secondary
```

---

# 11. Product-Specific Tokens

## KPI cards

```text
label:               text-text-secondary, 13px, 500
value:               text-text-primary, 28–32px, 700
positive trend:      text-success
negative trend:      text-danger
comparison:          text-text-muted, 12px
icon container:      bg-accent-soft
icon:                text-accent
```

KPI cards should show:

1. What is being measured
2. Current value
3. Direction or comparison
4. Comparison period

Do not show unexplained numbers.

## Finding cards

```text
surface:             bg-surface
border:              border-border
classification bar:  semantic status or accent
title:               text-text-primary
meaning:             text-text-secondary
evidence panel:      bg-surface-secondary
confidence badge:    neutral, info, warning, or success treatment
priority badge:      semantic treatment
work package action: primary or secondary button
```

Finding classifications:

| Classification | Token emphasis |
|---|---|
| Protect | `success` |
| Leverage | `success` |
| Expand | `accent` |
| Optimize | `info` |
| Repair | `warning` |
| Investigate | `intelligence` |
| Monitor | neutral |
| Measure | `info` |
| Critical failure | `danger` |

## Robin surfaces

Robin uses the intelligence accent sparingly.

```text
icon:                text-intelligence
icon background:     bg-intelligence-soft
panel border:        border-border-strong
suggested action:    bg-surface-secondary
approved action:     success treatment
approval required:   warning treatment
failed action:       danger treatment
```

Do not turn every Robin surface into a purple gradient. The product should remain operational, not futuristic decoration.

## Revenue status mapping

Revenue uses the existing semantic status treatments; it does not receive a
feature-specific color family.

Lead stages are limited to `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, and `LOST`.
Appointment, Estimate, Job, Invoice, Payment, next-action, and exception states retain
their owning domain meaning and must not be flattened into one Lead-status table.

The final contextual mapping belongs in shared UI components, not repeated feature code.

## Work tickets

| State | Treatment |
|---|---|
| Open | Info |
| Investigating | Intelligence |
| Planned | Accent |
| In Progress | Accent |
| Waiting for Approval | Warning |
| Blocked | Danger |
| Completed | Success |
| Measurement Pending | Info |
| Closed | Neutral |
| Reopened | Warning |

---

# 12. Charts and Data Visualization

Use the six chart tokens in order:

1. `chart-1` — Primary series
2. `chart-2` — Secondary comparison
3. `chart-3` — Positive or conversion series
4. `chart-4` — Intelligence or assisted series
5. `chart-5` — Warning or attention series
6. `chart-6` — Additional categorical series

### Chart rules

- Use no more series than the question requires.
- Use `chart-grid` for grid lines.
- Use `chart-axis` for labels.
- Use `chart-reference` for previous-period or reference lines.
- Use solid primary lines and dashed reference lines.
- Avoid gradients unless they improve area-chart legibility.
- Keep chart backgrounds transparent within the containing card.
- Tooltips use `bg-surface-raised`, `border-border-strong`, and `shadow-sm`.
- Always include a textual summary of important chart meaning.
- Do not rely on red and green alone.
- Avoid pie charts when comparison is easier in a ranked bar or list.
- Use charts to answer a question, not to decorate a dashboard.

### Positive and negative trends

- Green means improved business outcome only when the metric direction is genuinely positive.
- Red means degraded business outcome only when the metric direction is genuinely negative.
- A lower value is not automatically negative; lower response time may be positive.
- Trend logic belongs to the feature's metric definition, not the chart component.

---

# 13. Iconography

Use one consistent outline icon family, preferably **Lucide** through the shadcn/ui convention.

Rules:

- Standard icon size: 16px or 18px
- Navigation icon size: 18px
- Large feature icon size: 20px or 24px
- Stroke width should remain consistent
- Icons supplement labels rather than replace them
- Do not mix filled, outlined, 3D, and illustrated icon systems inside operational screens
- Product illustrations may appear in onboarding or empty states, not as ordinary table controls

---

# 14. Motion

Motion should be quick and functional.

| Motion | Duration | Easing |
|---|---:|---|
| Hover and color change | 120–160ms | ease-out |
| Dropdown/popover | 150–180ms | ease-out |
| Dialog/sheet | 180–220ms | ease-out |
| Page-level skeleton transition | 200ms | ease-in-out |
| Progress update | 250–400ms | ease-out |

Rules:

- Respect `prefers-reduced-motion`.
- Avoid bouncing, pulsing, or looping animations for ordinary data.
- Use animation to explain state change, not attract attention.
- Critical alerts should remain visible without continuous motion.

---

# 15. Responsive Layout

## Breakpoints

Use Tailwind defaults unless `ui-rules.md` establishes a project-specific need.

General layout behavior:

### Desktop

- Persistent left sidebar
- Full property selector
- Multi-column dashboard grids
- Full tables
- Right-side supporting panels where useful

### Tablet

- Collapsible sidebar
- Two-column dashboard grids
- Reduced table columns
- Filters move into drawers where needed

### Mobile

- Drawer navigation
- One-column cards
- Compact page headers
- Tables become prioritized lists or horizontally scroll only when necessary
- Primary action remains reachable
- Do not reproduce desktop density at narrow widths

### Dashboard grid

Use a 12-column conceptual layout on desktop.

Typical patterns:

- KPI card: 3 columns
- Main chart: 7 or 8 columns
- Supporting assistant/card: 4 or 5 columns
- Half-width panel: 6 columns
- Full-width table: 12 columns

---

# 16. Accessibility Requirements

Every token and component implementation must support:

- WCAG AA contrast for ordinary text
- Visible keyboard focus
- Keyboard-operable dialogs, menus, tabs, tables, and forms
- Labels for all form controls
- Text or icons in addition to status color
- Reduced-motion preference
- Sufficient touch targets
- Semantic heading hierarchy
- Screen-reader names for icon-only controls
- Error messages associated with their inputs
- Readable charts with summaries or accessible data alternatives

### Focus style

Use:

```tsx
className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-focus-ring
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
"
```

Never remove focus without replacing it.

---

# 17. Token Invariants

1. Dark mode is the default visual theme.
2. Light mode uses the same semantic token names.
3. The BTLS blue-violet family is the universal fallback accent.
4. Property branding may override only the approved brand-token family.
5. Property brand colors are stored as validated database configuration; brand files live in Supabase Storage.
6. Components never contain hardcoded hex colors.
7. Components never use raw Tailwind palette classes for product colors.
8. Components never assume the accent token is a specific hue.
9. Client branding never changes status-color meaning.
10. Intelligence purple is reserved for Robin and intelligence assistance.
11. Status colors communicate product meaning, not decoration.
12. Every status also has a text or icon cue.
13. Standard cards use `bg-surface`, `border-border`, and `rounded-xl`.
14. Nested surfaces use `bg-surface-secondary`.
15. Inputs use a visibly inset surface.
16. Dashboard borders remain thin and restrained.
17. Shadows are secondary to surface and border contrast.
18. Inter is the standard interface font.
19. Standard body text is at least 14px.
20. Major metrics use tabular numerals.
21. Spacing follows the 4px system.
22. Standard card padding is 24px.
23. Standard controls are 40px tall.
24. Charts use project chart tokens.
25. The primary chart series may follow the property accent; semantic chart meaning remains fixed.
26. Finding cards prioritize meaning and evidence over raw metric density.
27. Robin surfaces do not become client-colored or decorative neon panels.
28. Tables remain readable and do not use excessive grid lines.
29. Cross-property screens retain the BTLS default interface theme.
30. Invalid or missing property branding always falls back safely.
31. Responsive behavior simplifies information rather than merely shrinking it.
32. Accessibility requirements override client-brand preferences.

---

# 18. Developer Checklist

Before merging a UI implementation, confirm:

- Does it use semantic tokens?
- Does it work with the BTLS default accent?
- Does it work when the property accent is a different hue?
- Does it work in dark mode?
- Does it remain legible in light mode?
- Are text, focus, and status colors accessible?
- Does client branding leave Robin and semantic statuses unchanged?
- Does invalid or absent branding fall back cleanly?
- Are loading, empty, error, disabled, and success states included?
- Does the component use an existing shared primitive?
- Is spacing consistent with the 4px system?
- Is the radius appropriate for the component?
- Is the interface showing useful meaning rather than decorative data?
- Does it work with keyboard navigation?
- Does it remain usable on mobile?
- Has the component been added to `context/ui-registry.md` when reusable?
- Does any new visual rule need to be added to `context/ui-rules.md`?

When a design requires a new token, add it here before hardcoding the value in a component.
