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

**Pattern notes:** The desktop sidebar is exactly `w-[232px]` and the top bar exactly `h-[72px]`. Keep the context-defined primary navigation order and a separate Administration group. Below the large breakpoint, use the labelled dialog-backed drawer rather than icon-only primary navigation; it includes property, navigation, theme, and account display. Feature 05 supplies server-authorized property context and a switcher slot; render only server-resolved active properties in that slot.

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
### Authentication Surface

Files: `src/components/auth/auth-page-layout.tsx`, `src/components/auth/auth-form.tsx`
Last updated: 2026-08-08

| Property | Class |
|---|---|
| Background | `bg-background` page; `bg-surface` form card |
| Border | `border border-border` through Card; semantic Alert borders only for feedback |
| Border radius | `rounded-xl` brand mark and Card; shared `rounded-md` inputs and actions |
| Text ??? primary | `text-text-primary`; form title `text-base font-semibold` |
| Text ??? secondary | `text-text-secondary text-sm leading-6`; navigation links use `text-accent` |
| Spacing | Page `px-4 py-10`; Card `p-6`; form `gap-4` |
| Hover state | Links `hover:underline`; Buttons retain their shared hover and focus behavior |
| Shadow | Existing Card `shadow-xs`; brand mark `shadow-sm` |
| Accent usage | Brand mark and primary submit action only; status uses semantic Alert variants |

**Pattern notes:** Authentication pages use one narrow, responsive card with labelled shared fields and an in-form live feedback region. Never use authentication success, warning, or error text as the sole visible state; pair it with the matching shared Alert. The server enforces validation and access rules, while the client form exposes pending and field-error states.

### Administrative Property Directory and Onboarding

Files: `src/components/properties/admin-property-directory.tsx`, `src/components/properties/property-onboarding-form.tsx`
Last updated: 2026-08-16

| Property | Class |
|---|---|
| Background | Directory filter `bg-surface`; onboarding uses the shared Card `bg-surface` |
| Border | `border border-border`; directory table uses the shared TableShell border |
| Border radius | Filter panel and Card `rounded-xl`; inputs/actions `rounded-md`; statuses `rounded-full` |
| Text — primary | Property and account names `text-text-primary font-medium`; form title uses shared CardTitle |
| Text — secondary | Filter labels `text-text-secondary text-sm font-medium`; domain/supporting copy `text-text-muted text-xs` |
| Spacing | Directory `gap-6`; filter panel `p-4 gap-3`; onboarding uses Card `p-6` with form `gap-4` |
| Hover state | Table rows `hover:bg-surface-hover`; pagination links use secondary-action hover and focus treatment |
| Shadow | `shadow-xs` on filter panel and shared Card; TableShell has none |
| Accent usage | Primary create action only; property status uses semantic success/warning Badge variants |

**Pattern notes:** Administrative directories pair a server-submitted search/filter surface with the native shared TableShell, labelled status badges, and the shared EmptyState. The adjacent onboarding card always uses labelled Fields, field-level errors, a loading-disabled primary action, and an in-card Alert for success or recoverable error. Keep authorization copy generic; do not reveal unauthorized property details in an error or empty state.
### Authorized Property Navigation

Files: `src/components/properties/property-switcher.tsx`, `src/components/layout/property-overview-shell.tsx`, `src/app/select-property/page.tsx`
Last updated: 2026-08-16

| Property | Class |
|---|---|
| Background | Switcher trigger `bg-surface-interactive`; selection cards use shared `bg-surface`; shell uses `bg-background` |
| Border | Switcher `border border-border`; selection cards use shared Card border |
| Border radius | Switcher `rounded-md`; selection cards `rounded-xl` |
| Text — primary | Current property and card titles use `text-text-primary` with shared medium/semibold hierarchy |
| Text — secondary | Account and domain details use `text-text-secondary` and `text-text-muted` |
| Spacing | Selection page `px-4 py-8` with `gap-4`; top-bar switcher uses the shared Select inset |
| Hover state | Selection cards `hover:border-border-strong hover:bg-surface-hover`; switcher preserves shared Select focus/hover behavior |
| Shadow | Selection cards use shared Card `shadow-xs`; switcher menu uses shared Select `shadow-sm` |
| Accent usage | None; selection state is conveyed by the Select value and readable labels |

**Pattern notes:** Property selection and switching may render only server-resolved, active authorized properties. Hide the switcher for one property. Keep the switcher in the responsive top bar and preserve the AppShell drawer on mobile; never use the current route ID to add or infer an option.
### Property User Administration

File: `src/components/properties/property-user-administration.tsx`
Last updated: 2026-08-18

| Property | Class |
|---|---|
| Background | Shared Card `bg-surface`; individual grant controls `bg-surface-secondary`; native selects `bg-surface-interactive` |
| Border | Cards `border border-border`; grant controls use the same border; member rows use `border-b border-border` |
| Border radius | Cards `rounded-xl`; grant controls `rounded-lg`; selects and actions `rounded-md` |
| Text — primary | Member names and selected properties `text-text-primary`; titles use shared CardTitle |
| Text — secondary | Labels and table values `text-text-secondary`; email and help text `text-text-muted` |
| Spacing | Split layout `gap-6`; Card `p-6`; grant controls `p-3 gap-2`; form `gap-4` |
| Hover state | Shared Button interactions; native controls retain the standard visible semantic focus ring |
| Shadow | Shared Card `shadow-xs` |
| Accent usage | Primary save action and the native checkbox accent only; member state uses semantic success/warning Badge variants |

**Pattern notes:** Property-access administration pairs a horizontally scrollable, readable membership table with a narrow editing card. State the distinction between the account baseline role and an optional property override in visible copy. Keep all choices server-resolved; the client must not derive properties or permissions from the URL. Use the shared Alert and loading-disabled Button for mutation feedback, and a separate danger action for account-level access suspension.

### Pending Invitation Administration

File: `src/components/properties/property-invitation-administration.tsx`
Last updated: 2026-08-18

| Property | Class |
|---|---|
| Background | Shared Card `bg-surface`; invitation rows and intended-grant controls `bg-surface-secondary`; inputs `bg-surface-interactive` |
| Border | `border border-border` across Cards and invitation/grant controls |
| Border radius | Cards `rounded-xl`; invitation and grant controls `rounded-lg`; fields/actions `rounded-md`; status Badge `rounded-full` |
| Text — primary | Recipient email and selected property `text-text-primary font-medium`; Card titles use shared CardTitle |
| Text — secondary | Invitation detail and labels `text-text-secondary`; expiry/supporting copy `text-text-muted text-xs` |
| Spacing | Split layout `gap-6`; Card `p-6`; invitation rows `p-4`; grant controls `p-3`; form `gap-4` |
| Hover state | Shared Button hover/focus; the cancel action uses the shared danger variant |
| Shadow | Shared Card `shadow-xs` |
| Accent usage | Primary send action and checkbox accent only; invitation state uses semantic warning/success/neutral Badge variants |

**Pattern notes:** Pending invitations remain visibly distinct from active member access. Pair each pending recipient with an explicit status and expiry, and show cancellation only while pending. The invitation form must explain that intended grants activate only after verified identity acceptance; never render credentials, tokens, or provider state.

### Media Upload, Preview, and Selection

Files: `src/components/media/media-upload-control.tsx`, `src/components/media/media-file-card.tsx`, `src/components/media/media-picker.tsx`, `src/components/media/media-library.tsx`
Last updated: 2026-09-01

| Property | Class |
|---|---|
| Background | Preview cards `bg-surface-secondary`; image/file well `bg-surface-tertiary`; selection adds `bg-surface-selected` |
| Border | Cards `border border-border`; selected picker option adds `border-border-focus` |
| Border radius | Preview cards and picker option `rounded-lg`; media preview `rounded-md`; actions use shared `rounded-md` Button |
| Text — primary | File names and upload state `text-text-primary` with `text-sm font-medium` |
| Text — secondary | File metadata and helper copy `text-text-muted text-xs`; picker prompt `text-text-secondary text-sm` |
| Spacing | Upload sections `space-y-4`; card metadata `p-3 gap-3`; responsive action stack `gap-2` |
| Hover state | Shared Button treatment; picker options preserve standard visible focus ring rather than a hover-only state |
| Shadow | none |
| Accent usage | Progress fill uses `bg-accent`; selection uses focus border and semantic selected surface; errors/recovery use shared Alert variants |

**Pattern notes:** Media controls remain one-column and full-width on mobile, then return actions to intrinsic width at `sm`. Use browser-standard `capture="environment"` only as a progressive camera hint for image inputs. Preview URLs must already be authorized by the consuming workflow; never render Storage paths, upload tokens, or private delivery URLs in the card. Recovery returns an explicit `READY` or `RESELECT_FILE` outcome so the UI never implies a missing file was restored.
