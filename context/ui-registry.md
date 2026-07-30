# BTLS UI Registry

> **Repository location:** `context/ui-registry.md`  
> **Purpose:** Approved visual patterns for consistent BTLS interface work  
> **Update rule:** Add or update an entry after every approved reusable UI component

---

## Baseline — Established 2026-07-29

This baseline was established through the first `/imprint` audit.

| Property | Correct class or rule |
|---|---|
| Primary surface | `bg-background text-text-primary` semantic tokens |
| Compact system status | `bg-surface-raised border border-border text-text-secondary` |
| Action control radius | `rounded-md` |
| Compact status radius | `rounded-full` |
| Action focus | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring` |
| Card pattern | `rounded-xl border border-border bg-surface p-6 shadow-xs` |
| Secondary text | `text-text-secondary` |
| Input pattern | Not established; defer until the first approved form control |

Do not use raw Tailwind palette colors or hardcoded color values in product components. Future shared components must use semantic tokens from `context/ui-tokens.md`.

---

### Environment Indicator

File: `src/components/feedback/environment-indicator.tsx`  
Last updated: 2026-07-29

| Property | Class |
|---|---|
| Background | `bg-surface-raised` |
| Border | `border border-border` |
| Border radius | `rounded-full` |
| Text — primary | `text-text-secondary text-xs font-semibold uppercase tracking-wide` |
| Text — secondary | none |
| Spacing | `px-3 py-1` |
| Hover state | none |
| Shadow | `shadow-xs` |
| Accent usage | none |

**Pattern notes:** Reserved for compact, non-production system-status information. It is fixed outside the normal application flow and does not define a general-purpose badge pattern.

---

### System Status

File: `src/components/feedback/system-status.tsx`  
Last updated: 2026-07-29

| Property | Class |
|---|---|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Text — primary | `text-text-primary text-lg font-semibold` |
| Text — secondary | `text-text-secondary text-sm font-medium leading-6` |
| Spacing | `p-6`, with `gap-3` for the icon and label group |
| Hover state | none |
| Shadow | `shadow-xs` |
| Accent usage | `bg-success-soft text-success-foreground` on the status icon only |

**Pattern notes:** Use for a concise, factual system state. Keep the surface neutral; status color belongs on the supporting icon, not across the full card. Do not include dependency details, environment variables, or provider information in public status copy.

---

### Bootstrap Landing Surface

File: `src/app/page.tsx`  
Last updated: 2026-07-29

| Property | Class |
|---|---|
| Background | `bg-background` |
| Border | `border-b border-border` and `border-t border-border` for structural dividers |
| Border radius | `rounded-xl` for the brand mark; `rounded-full` for compact contextual labels |
| Text — primary | `text-text-primary` with `font-semibold tracking-tight` |
| Text — secondary | `text-text-secondary` and `text-text-muted` |
| Spacing | `px-6 py-6`; hero `py-16`; section `gap-10` |
| Hover state | none |
| Shadow | `shadow-sm` only on compact brand/context elements |
| Accent usage | `bg-accent text-accent-foreground`; `text-intelligence` for contextual emphasis |

**Pattern notes:** This is a responsive bootstrap surface, not a substitute for the authenticated application shell. It establishes semantic-token usage and restrained accent placement; future product pages should follow their own page-header and shell rules.

---

### Global Error Fallback

File: `src/app/global-error.tsx`  
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | `bg-background` |
| Border | `border border-border` |
| Border radius | `rounded-xl` for the fallback card; `rounded-md` for the retry action |
| Text â€” primary | `text-text-primary text-2xl font-semibold tracking-tight` |
| Text â€” secondary | `text-text-secondary text-sm leading-6` |
| Spacing | `p-6` card padding; `mt-3` body copy; `mt-6` retry action |
| Hover state | `hover:bg-accent-hover` on the retry action |
| Shadow | `shadow-xs` |
| Accent usage | `bg-accent text-accent-foreground` on the retry action only |

**Pattern notes:** This is a standalone last-resort fallback, not a normal error-state component. It must establish its own static dark, Inter, and semantic-token baseline because the root layout may be unavailable. Keep the action focused on safe recovery and do not expose diagnostic or sensitive details.
