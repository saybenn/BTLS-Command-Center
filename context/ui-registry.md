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
| Action focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` |
| Card pattern | `rounded-xl border border-border bg-surface p-6 shadow-xs` |
| Secondary text | `text-text-secondary` |
| Input pattern | `h-10 rounded-md border border-border bg-surface-interactive px-3 text-sm text-text-primary` |

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

---

### Semantic Token Foundation

File: `src/app/globals.css`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | `bg-background`, `bg-background-subtle`, `bg-sidebar` |
| Border | `border-border`, `border-border-subtle`, `border-border-strong`, `border-border-focus` |
| Border radius | Defined by the consuming component; no new radius rule |
| Text — primary | `text-text-primary` and `text-text-inverse` |
| Text — secondary | `text-text-secondary`, `text-text-muted`, and `text-text-disabled` |
| Spacing | Defined by the consuming component; preserve the 4px spacing system |
| Hover state | Use paired semantic utilities such as `bg-surface-hover`, `bg-accent-hover`, and `bg-danger-hover` |
| Shadow | Use documented Tailwind shadow utilities; no component-specific shadow rule established |
| Accent usage | `bg-accent text-accent-foreground`; intelligence and status token families remain separate |

**Pattern notes:** Every foundation component must use the complete semantic token families mapped in this file. Dark and light themes change the variable values behind the same utility names; components never branch on theme or hardcode colors. Property-brand overrides remain deferred to the authorized property layout and may change only the approved accent family.

---

### Theme Control

File: `src/components/theme/theme-control.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | `bg-surface` for the trigger; `bg-surface-raised` for the option menu |
| Border | `border border-border` for the trigger; `border border-border-strong` for the option menu |
| Border radius | `rounded-md` for the trigger and options; `rounded-lg` for the option menu |
| Text — primary | `text-text-primary text-sm font-medium` for the selected value |
| Text — secondary | `text-text-secondary text-sm font-medium` for the visible label; `text-text-muted` for supporting icons |
| Spacing | `gap-2` for the label group; `px-3` trigger padding; `p-1` menu padding |
| Hover state | `hover:bg-surface-hover`; option highlights use `data-[highlighted]:bg-surface-hover` |
| Shadow | `shadow-sm` on the option menu only |
| Accent usage | `text-accent` on the selected-item indicator only |

**Pattern notes:** Use this compact, visibly labelled control wherever users select dark, light, or system appearance. It must be rendered inside `ThemeProvider`, retain the Radix Select keyboard behavior, and use the standard ring-based focus treatment. Do not duplicate theme preference logic in consuming layouts or navigation components.

---

### Button

File: `src/components/ui/button.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Primary `bg-accent`; secondary `bg-surface`; danger `bg-danger-soft` |
| Border | Secondary `border border-border`; danger `border border-danger` |
| Border radius | `rounded-md` |
| Text — primary | `text-accent-foreground` for primary; `text-text-primary` for secondary |
| Text — secondary | `text-text-secondary` for ghost actions |
| Spacing | `gap-2`; default `px-4`; compact `px-3` |
| Hover state | `hover:bg-accent-hover`, `hover:bg-surface-hover`, or the paired danger treatment |
| Shadow | none |
| Accent usage | Primary action only; loading indicator inherits the action foreground |

**Pattern notes:** Use explicit `variant`, `size`, `loading`, and `disabled` props. Loading disables the action and exposes `aria-busy`; do not recreate button styles in feature code.

---

### Form Controls

Files: `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/components/forms/label.tsx`, `src/components/forms/field.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | `bg-surface-interactive` |
| Border | `border border-border`; invalid controls use `aria-[invalid=true]:border-danger` |
| Border radius | `rounded-md` |
| Text — primary | `text-text-primary text-sm` |
| Text — secondary | Labels `text-text-secondary`; hints `text-text-muted`; errors `text-danger-foreground` |
| Spacing | Input `px-3`; textarea `px-3 py-2`; field composition `gap-2` |
| Hover state | none |
| Shadow | none |
| Accent usage | `focus:ring-accent-ring` only |

**Pattern notes:** Inputs are 40px tall; textareas preserve the same inset treatment. Use `Field` with `Label` to link visible labels, optional help text, and errors with `aria-describedby`; never use placeholder text as the label.

---

### Select

File: `src/components/ui/select.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Trigger `bg-surface-interactive`; menu `bg-surface-raised` |
| Border | Trigger `border border-border`; menu `border border-border-strong` |
| Border radius | Trigger and items `rounded-md`; menu `rounded-lg` |
| Text — primary | Trigger `text-text-primary text-sm`; selected item `text-text-primary` |
| Text — secondary | Options and icon `text-text-secondary` / `text-text-muted` |
| Spacing | Trigger `px-3`; menu `p-1`; option `py-1.5 pr-8 pl-2` |
| Hover state | `hover:bg-surface-hover`; highlighted options use `data-[highlighted]:bg-surface-hover` |
| Shadow | `shadow-sm` on the menu only |
| Accent usage | `text-accent` on the selected-item indicator only |

**Pattern notes:** This is a styled Radix Select, not a replacement interaction model. Preserve its keyboard opening, arrow navigation, selection, and focus behavior.

---

### Dialog

File: `src/components/ui/dialog.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Overlay `bg-surface-overlay`; content `bg-surface-raised` |
| Border | Content `border border-border-strong` |
| Border radius | Content `rounded-2xl`; close action `rounded-md` |
| Text — primary | `text-text-primary` |
| Text — secondary | Close action `text-text-muted` |
| Spacing | Content `p-6 gap-4`; header `space-y-1.5` |
| Hover state | Close action `hover:bg-surface-hover hover:text-text-primary` |
| Shadow | `shadow-md` on content |
| Accent usage | none |

**Pattern notes:** Use for focused confirmation, review, or small forms. Retain Radix focus trapping and restoration; do not stack dialogs or place a full workflow inside one.

---

### Tabs

File: `src/components/ui/tabs.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | List `bg-surface-secondary`; active trigger `bg-surface-raised` |
| Border | none |
| Border radius | List `rounded-lg`; trigger `rounded-md` |
| Text — primary | Active trigger `text-text-primary` |
| Text — secondary | Inactive trigger `text-text-muted` |
| Spacing | List `p-1`; trigger `px-3` |
| Hover state | `hover:text-text-primary` |
| Shadow | `shadow-xs` on active trigger only |
| Accent usage | none |

**Pattern notes:** Use Radix Tabs for related sections of a workflow. The active surface and readable label—not color alone—identify the selected tab.

---

### Badge and Alert

Files: `src/components/ui/badge.tsx`, `src/components/ui/alert.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Semantic soft backgrounds such as `bg-info-soft`, `bg-success-soft`, and `bg-danger-soft` |
| Border | Badges none; alerts use the matching semantic border |
| Border radius | Badge `rounded-full`; alert `rounded-lg` |
| Text — primary | Alert title `text-text-primary text-sm font-semibold` |
| Text — secondary | Badge semantic foreground; alert description `text-text-secondary` |
| Spacing | Badge `px-2.5 py-1`; alert `p-4` |
| Hover state | none |
| Shadow | none |
| Accent usage | Accent badge only; status treatments retain their own semantic family |

**Pattern notes:** Pair every status treatment with readable text. Alerts are polite `status` messages by default; pass `assertive` only when interruption is necessary, which renders an `alert` role.

---

### Card

File: `src/components/ui/card.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | `bg-surface` |
| Border | `border border-border` |
| Border radius | `rounded-xl` |
| Text — primary | Title `text-text-primary text-base font-semibold` |
| Text — secondary | Description `text-text-secondary text-sm leading-6` |
| Spacing | Root `p-6`; content/footer `mt-6`; footer `gap-3` |
| Hover state | none; use an explicitly interactive component when a card must act as a control |
| Shadow | `shadow-xs` |
| Accent usage | none |

**Pattern notes:** The standard card is a neutral container. Status or accent color belongs to supporting elements, not the full card surface.

---

### Feedback States

Files: `src/components/feedback/empty-state.tsx`, `src/components/feedback/loading-state.tsx`, `src/components/feedback/error-state.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Empty and error containers `bg-surface`; skeletons `bg-surface-tertiary`; error message `bg-danger-soft` |
| Border | Empty `border border-dashed border-border`; error `border border-border`; message `border-danger` |
| Border radius | Containers `rounded-xl`; status icon `rounded-full`; skeletons and alert `rounded-md` / `rounded-lg` |
| Text — primary | `text-text-primary text-base font-semibold` |
| Text — secondary | `text-text-secondary text-sm leading-6` |
| Spacing | Containers `p-6`; empty-state icon to title `mt-4`; actions `mt-4` or `mt-5` |
| Hover state | None; recovery uses the shared Button interaction treatment |
| Shadow | none |
| Accent usage | State meaning is limited to the existing danger alert; neutral empty and loading surfaces do not imply status |

**Pattern notes:** Empty states explain what is absent and may offer one relevant action. Loading uses restrained semantic skeletons and a labelled `status`. Error states provide safe, actionable language and an optional recovery action; they must not expose internal failure details.

---

### Table Shell

File: `src/components/tables/table-shell.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Container `bg-surface`; header and footer `bg-surface-secondary` |
| Border | Container `border border-border`; body dividers `divide-y divide-border`; footer `border-t border-border` |
| Border radius | Container `rounded-xl` |
| Text — primary | Cells `text-text-primary text-sm` |
| Text — secondary | Headers `text-text-secondary text-xs font-semibold uppercase tracking-wide` |
| Spacing | Header and cells `px-4 py-3` |
| Hover state | Data rows `hover:bg-surface-hover` |
| Shadow | none |
| Accent usage | none |

**Pattern notes:** `TableShell` retains native `table`, `caption`, `thead`, `tbody`, and optional `tfoot` semantics. Its wrapper uses `overflow-x-auto`; individual dense tables may deliberately provide a minimum width and remain horizontally usable on narrow screens rather than being silently converted into cards. Use `alignment="end"` for numeric headers and cells.

---

### Page Header

File: `src/components/layout/page-header.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | none |
| Border | `border-b border-border` |
| Border radius | none |
| Text — primary | Title `text-text-primary text-2xl font-semibold tracking-tight sm:text-3xl` |
| Text — secondary | Description `text-text-secondary text-sm leading-6` |
| Spacing | `gap-4 pb-5`; description `mt-2`; actions `gap-3` |
| Hover state | none; actions use shared controls |
| Shadow | none |
| Accent usage | none |

**Pattern notes:** Keep one primary-action slot and a separate secondary-controls slot. Actions stack vertically by default; the primary action is full width until the small-screen breakpoint and then returns to intrinsic width. The header aligns title and actions side by side at the medium breakpoint.

---

### Application Shell and Navigation

Files: `src/components/layout/app-shell.tsx`, `src/components/layout/application-sidebar.tsx`, `src/components/navigation/top-navigation.tsx`, `src/components/navigation/mobile-navigation.tsx`, `src/components/navigation/navigation-list.tsx`
Last updated: 2026-07-30

| Property | Class |
|---|---|
| Background | Shell `bg-background`; sidebar and drawer `bg-sidebar`; active navigation `bg-surface-selected` |
| Border | Sidebar `border-r border-border-subtle`; top bar `border-b border-border-subtle`; drawer regions use the same subtle divider |
| Border radius | Navigation items and compact controls `rounded-md`; property mark `rounded-lg`; avatars `rounded-full` |
| Text — primary | Active navigation, property, and account labels `text-text-primary text-sm font-medium` |
| Text — secondary | Inactive navigation `text-text-secondary`; group labels and supporting details `text-text-muted text-xs` |
| Spacing | Sidebar navigation `px-3 py-4`; nav item `min-h-10 px-3 gap-3`; desktop main `lg:px-8 lg:py-7` |
| Hover state | Inactive navigation `hover:bg-surface-hover hover:text-text-primary`; shared ring focus treatment |
| Shadow | none; the mobile drawer uses the existing Dialog shadow treatment |
| Accent usage | Active navigation uses `bg-accent` only for its slim left indicator; property mark uses `bg-accent-soft text-accent` |

**Pattern notes:** The desktop sidebar is exactly `w-[232px]` and the top bar exactly `h-[72px]`. Keep the context-defined primary navigation order and a separate Administration group. Below the large breakpoint, use the labelled dialog-backed drawer rather than icon-only primary navigation; it includes property, navigation, theme, and account display. Shell data remains presentation-only until Feature 05 supplies authorized items and property context.

### Development Status Summary

Files: `src/components/feedback/development-status-summary.tsx`, `src/app/development-status/loading.tsx`, `src/app/development-status/error.tsx`
Last updated: 2026-08-02

| Property | Class |
|---|---|
| Background | `bg-surface` |
| Border | `border border-border`; list rows use `border-t border-border` |
| Border radius | `rounded-xl` |
| Text — primary | `text-text-primary text-base font-semibold` for the heading; row labels use `text-sm font-medium` |
| Text — secondary | `text-text-secondary text-sm leading-6` |
| Spacing | Panel `p-6`; rows `py-4`; status content begins at `mt-6` |
| Hover state | None; the generic error recovery action uses the shared secondary Button |
| Shadow | `shadow-xs` |
| Accent usage | Semantic Badge variants communicate configuration and connection state; the panel remains neutral |

**Pattern notes:** Use this only on guarded non-production diagnostic pages. Display configuration state and generic reachability results, never URLs, keys, connection strings, provider identifiers, or raw failure messages. Loading uses the approved labelled skeleton; failed page rendering uses the approved generic ErrorState with a safe retry action.

### Development Status Summary

Files: `src/components/feedback/development-status-summary.tsx`, `src/app/development-status/loading.tsx`, `src/app/development-status/error.tsx`
Last updated: 2026-08-02

| Property | Class |
|---|---|
| Background | `bg-surface` |
| Border | `border border-border`; list rows use `border-t border-border` |
| Border radius | `rounded-xl` |
| Text — primary | `text-text-primary text-base font-semibold` for the heading; row labels use `text-sm font-medium` |
| Text — secondary | `text-text-secondary text-sm leading-6` |
| Spacing | Panel `p-6`; rows `py-4`; status content begins at `mt-6` |
| Hover state | None; the generic error recovery action uses the shared secondary Button |
| Shadow | `shadow-xs` |
| Accent usage | Semantic Badge variants communicate configuration and connection state; the panel remains neutral |

**Pattern notes:** Use this only on guarded non-production diagnostic pages. Display configuration state and generic reachability results, never URLs, keys, connection strings, provider identifiers, or raw failure messages. Loading uses the approved labelled skeleton; failed page rendering uses the approved generic ErrorState with a safe retry action.
