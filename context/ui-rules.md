# BTLS UI Rules

> **Repository location:** `context/ui-rules.md`  
> **Companion files:** `context/ui-tokens.md`, `context/ui-registry.md`, `context/architecture.md`, and `context/code-standards.md`  
> **Default theme:** Dark  
> **Purpose:** Define how BTLS interfaces are composed and how shared tokens are applied.
>
> `ui-tokens.md` defines the available visual values. This file defines when and how to use them.

---

## 1. Source of Truth

Use these sources in order:

1. Approved BTLS product behavior
2. `context/ui-rules.md`
3. `context/ui-tokens.md`
4. `context/ui-registry.md`
5. Existing approved shared components
6. Feature-specific mockups
7. General UI conventions

When a visual mockup conflicts with accessibility, product behavior, or these rules, follow the safer and clearer implementation.

Do not create a new visual pattern merely because a mockup contains one isolated example.

---

## 2. Overall Product Character

BTLS should feel like a professional operating system for service businesses.

The interface should be:

- Calm
- Clear
- Operational
- Evidence-focused
- Dense enough for real work
- Easy to scan
- Familiar to business software users
- Understandable without analytics or SEO expertise

The interface should not feel:

- Experimental
- Game-like
- Futuristic for its own sake
- Overdecorated
- Filled with charts without purpose
- Like a generic AI demo
- Like a full enterprise project-management suite

Dark mode is the default. Light mode uses the same layout and components.

---

## 3. Font

Always load **Inter** through `next/font/google` in the root layout.

```ts
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
```

Apply the font variable to the root document.

```tsx
<html lang="en" className={`${inter.variable} dark`}>
```

Rules:

- Do not use browser system fonts as the primary interface font.
- Do not load multiple body fonts.
- Use the approved monospace font only for IDs, code, events, and developer diagnostics.
- Use tabular numerals for currency, percentages, dates, and metric columns.
- Do not use decorative fonts in product screens.

---

## 4. Theme

### Default

Dark mode is the default product theme.

### Supported modes

- Dark
- Light
- System

### Theme rules

- Use semantic tokens only.
- Do not hardcode dark or light colors inside components.
- Theme changes must not alter layout or information hierarchy.
- Avoid a theme flash during initial load.
- Persist the user’s preference.
- New components must be checked in both dark and light themes.
- Charts must use the approved chart tokens in both modes.

---

## 5. Application Layout

### Desktop shell

```text
Persistent sidebar
+ top bar
+ property-scoped main content
```

Default measurements:

- Sidebar width: `232px`
- Top bar height: `72px`
- Main content padding: `32px` desktop
- Main section gap: `24px`
- Card grid gap: `16px` or `20px`

### Page width

Dashboard and table views may use the full available content width.

Editor and long-form configuration views should use a readable constrained width where appropriate.

Recommended limits:

- Dashboard: no fixed max-width
- Forms and settings: `960px–1120px`
- Long-form article editor: readable text column inside a wider workspace
- Dialog content: no wider than needed for the task

### Main page structure

Every feature page should follow:

```text
Page header
→ optional summary or actions
→ primary work area
→ supporting information
```

Do not place unrelated cards before the page’s primary task.

### Page header

A page header should contain:

- Page title
- One short explanation when needed
- Primary action
- Secondary controls such as period or filter

Do not place multiple equally prominent primary actions in the header.

---

## 6. Navigation

### Sidebar order

Use this primary order:

1. Overview
2. Revenue Operations
3. Robin
4. Website Intelligence
5. Smart Blog Studio
6. Content Intelligence
7. Search Operations
8. Work Management
9. Settings

Administrative items appear in a separate lower group:

- Properties
- Users and Permissions
- Integrations
- Audit Log

### Active navigation

Active item:

- `bg-surface-selected`
- `text-text-primary`
- medium weight
- visible icon
- optional slim accent indicator

Inactive item:

- transparent background
- `text-text-secondary`
- hover uses `bg-surface-hover`
- hover text uses `text-text-primary`

### Navigation rules

- Use labels with icons.
- Do not use icon-only primary navigation.
- Keep navigation names stable across properties.
- Property switching belongs near the top of the shell.
- Do not show navigation items the user cannot access.
- Hiding navigation does not replace server authorization.
- Group labels use muted eyebrow text.
- Avoid more than two visible nesting levels.

### Mobile navigation

Use a drawer.

The drawer must include:

- Current property
- Primary navigation
- Administrative navigation when authorized
- Theme control
- Account controls

---

## 7. Property Context

The active property must always be clear.

Show:

- Property name
- Optional logo or initials
- Domain or supporting identifier when helpful
- Property switcher for authorized users

Rules:

- Do not show records from multiple properties inside a property-scoped page.
- Cross-property views must be clearly labeled as BTLS-wide.
- Never rely only on URL text to communicate the active property.
- Property changes should update the visible context immediately.
- Destructive actions must repeat the property name in confirmation text when ambiguity is possible.

---

## 8. Cards

Cards group related information.

Standard card:

```text
background:    bg-surface
border:        1px solid border-border
border-radius: rounded-xl
padding:       24px
shadow:        none or shadow-xs
```

### Card rules

- Use cards for meaningful groups, not every sentence or metric.
- Cards on the same row should align when they represent comparable information.
- Use nested surfaces sparingly.
- Do not add gradients to normal card backgrounds.
- Do not use saturated status-colored card backgrounds.
- Use badges, borders, icons, and narrow status accents instead.
- A card should have one main purpose.
- Avoid placing more than one dense table inside a card.
- Do not create deep card-inside-card stacks.
- Prefer a section with dividers over repeated nested cards.

### Card header

Use:

- Clear title
- Optional supporting sentence
- Optional action aligned right

Do not overload card headers with filters, actions, badges, and explanations simultaneously.

---

## 9. Typography Hierarchy

Use the approved type scale consistently.

### Page title

- 30px
- 700 weight
- `text-text-primary`
- one line when practical

### Section heading

- 20px
- 650 or 600 weight
- `text-text-primary`

### Card title

- 16px
- 600 weight
- `text-text-primary`

### Body text

- 14px
- 400 weight
- `text-text-secondary`
- 22px line height

### Labels

- 13px
- 500 weight
- `text-text-secondary`

### Muted text

- 12px
- 400 weight
- `text-text-muted`

### Rules

- Use sentence case.
- Avoid all caps except short group labels.
- Do not create a new type size for one component.
- Keep descriptions brief.
- Use bold selectively for values and decisions.
- Do not bold entire paragraphs.
- Major metrics should be larger than labels but not larger than the page title.

---

## 10. Buttons

### Primary button

Use for the main action on the current page or workflow.

Examples:

- Create lead
- Publish article
- Confirm Finding
- Create ticket
- Approve Robin action

Rules:

- One primary button per local decision area.
- Use `bg-accent`.
- Do not use a gradient.
- Do not use primary styling for routine table row actions.

### Secondary button

Use for important alternatives.

Examples:

- Save draft
- Preview
- Export
- Test connection

### Ghost button

Use for low-priority actions.

Examples:

- Cancel
- View details
- Open menu
- Clear filters

### Destructive button

Use only for destructive actions.

Examples:

- Delete property
- Disconnect integration
- Permanently remove file

### Button rules

- Default height: 40px
- Small row action: 32px
- Large form action: 44px
- Buttons use clear verbs.
- Avoid vague labels such as “Submit,” “Proceed,” or “Do It.”
- Show a loading state during mutations.
- Disable duplicate submission.
- Preserve button width during loading when possible.
- Icon-only buttons require an accessible name and tooltip.
- Do not place destructive actions beside primary actions without separation.

---

## 11. Badges and Status

Badges are compact labels, not buttons.

Use pill shape by default.

Badge content should be:

- Status
- Priority
- Confidence
- Category
- Mode
- Small count

Rules:

- Use concise labels.
- Do not place full sentences inside badges.
- Pair color with readable text.
- Do not use more than three badges in a compact card header.
- Avoid stacking multiple semantic statuses that contradict each other.
- A badge must not be the only place critical status is communicated.

---

## 12. Forms

### Standard form layout

Use:

```text
Section title
→ brief instruction when needed
→ labeled fields
→ field help or error
→ actions
```

### Field rules

- Every field has a visible label.
- Placeholder text is an example, not a label.
- Required state is clear.
- Help text explains non-obvious requirements.
- Errors appear near the field.
- Server errors preserve entered values where safe.
- Related fields should be grouped.
- Long forms should use logical sections.
- Use two columns only when fields are naturally paired.
- Mobile forms use one column.
- Do not create a wizard for a short form.
- Use a wizard only when steps have distinct decisions or dependencies.

### Input behavior

- Standard input height: 40px
- Text areas grow appropriately.
- Search inputs include a clear action when useful.
- Select controls should not contain hundreds of unsearchable items.
- Use searchable comboboxes for properties, pages, services, and users.
- Date and time controls must respect the property time zone.
- Currency inputs display dollars while storing integer cents.
- Phone inputs normalize to E.164.

### Save behavior

Use one of these patterns consistently:

- Explicit save button
- Safe autosave with visible state
- Immediate small mutation

Do not mix invisible autosave and explicit save in the same section without clear labels.

---

## 13. Tables

Tables are used for operational lists.

Examples:

- Leads
- Properties
- Findings
- Tickets
- Content assets
- Integrations

### Table appearance

- No alternating row colors
- Quiet row dividers
- Header uses `bg-surface-secondary`
- Header text uses `text-text-muted`
- Row hover uses `bg-surface-hover`
- Selected row uses `bg-surface-selected`

### Header rules

- Sentence case
- 12–13px
- 500 weight
- Clear sortable indicator
- Numeric columns align right

### Row rules

- 44–56px height
- Primary cell uses `text-text-primary`
- Supporting information uses `text-text-muted`
- Status uses badge plus text
- Row actions are aligned right
- Clicking the row may open details only when controls inside the row remain independently usable

### Data behavior

- Use server-side pagination for large collections.
- Filters must represent real operator needs.
- Preserve useful filter state in the URL.
- Avoid loading all records for client-side filtering.
- Show active filters clearly.
- Provide an easy way to clear filters.
- Provide a result count.
- Empty search results differ from a truly empty system.

### Responsive tables

On mobile:

- Convert to prioritized list cards when practical.
- Preserve the most important fields.
- Avoid forcing users to horizontally scroll for routine workflows.
- Horizontal scrolling is allowed for genuine comparison tables.

---

## 14. Filters and Search

Filters should help answer a clear question.

### Rules

- Default filters should produce a useful working view.
- Do not expose every database field as a filter.
- Use a compact filter bar.
- Put advanced filters in a popover or drawer.
- Show active filter count.
- Use clear labels such as “Status,” “Assignee,” and “Date range.”
- Date ranges must display the selected comparison period.
- Search should state what it searches.
- Debounce remote search.
- Do not trigger full page refreshes for ordinary filter changes.

---

## 15. Dashboard Composition

Dashboard pages should prioritize attention and action.

Recommended order:

```text
Current state
→ urgent items
→ trends
→ supporting detail
```

### KPI cards

Use no more than four to six primary KPIs in one row.

Each KPI must show:

- Metric name
- Current value
- Comparison or status
- Comparison period

Rules:

- Do not place every available metric on the overview.
- Do not use KPI cards for static labels.
- Positive and negative direction must reflect business meaning.
- A reduced response time may be positive.
- A reduced conversion rate is negative.
- Metric definitions must remain stable.

### Overview pages

The property overview should answer:

- What requires attention?
- What improved?
- What is waiting?
- What should happen next?

It should not duplicate every report from every studio.

---

## 16. Charts

Charts must answer a real question.

### Use charts for

- Change over time
- Comparison
- Distribution
- Progress against a baseline

### Do not use charts for

- One simple value
- Decorative dashboard fill
- Data better shown as a ranked list
- Tiny samples
- Unclear or mixed units

### Rules

- Use approved chart tokens.
- Primary series is solid.
- Previous period or baseline is dashed.
- Show period and units.
- Include an accessible textual summary.
- Tooltips must use semantic surfaces.
- Do not use 3D charts.
- Avoid pie charts when a ranked bar or list is clearer.
- Do not show more than six categorical colors.
- Never use red and green as the only distinction.
- Empty and insufficient-data states replace misleading charts.
- Charts must not imply precision beyond the data.

---

## 17. Finding Cards

Finding Cards are central to Website Intelligence and Content Intelligence.

A Finding Card should show, in this order:

1. Finding name
2. Classification
3. Priority and confidence
4. What is happening
5. What it means
6. Evidence
7. Possible areas to investigate
8. Recommended Work Package
9. Operator action

### Finding rules

- “What is happening” must be factual.
- “What it means” must be plain English.
- Possible causes must be labeled as possible.
- Evidence should show only the metrics needed to understand the Finding.
- Raw metrics belong in drill-down.
- Do not place ten mini-charts in one card.
- Client-facing cards show only approved content.
- Internal operator notes remain separate.
- Insufficient Evidence must be visibly different from a negative Finding.
- Confidence does not substitute for explanation.
- Priority does not substitute for business impact.

### Finding action hierarchy

Primary:

- Confirm Finding
- Create ticket

Secondary:

- Edit explanation
- Defer
- Monitor

Low-priority:

- Dismiss
- View raw data

---

## 18. Work Management

Work Management is focused work execution, not a general project-management system.

### Ticket list

Show:

- Ticket title
- Property
- Originating Finding
- Assignee
- Priority
- Status
- Due date
- Measurement state

### Ticket detail

Show:

- Why the work exists
- Evidence
- Selected Work Package
- Task checklist
- Notes
- Attachments
- Actual intervention
- Expected result
- Measurement review

### Rules

- Keep the originating Finding visible.
- Do not separate a ticket from its evidence.
- Ticket completion and success are different states.
- “Completed” means work was done.
- “Improved” requires a Measurement Review.
- Avoid comments, dependencies, boards, and planning systems beyond the MVP need.
- Do not reproduce Jira or Asana.

---

## 19. Revenue Operations

Revenue Operations follows five binding interface principles:

```text
ACTION FIRST
CONTEXT SECOND
ADVANCED DETAIL ON DEMAND
ROBUST UNDERNEATH / SIMPLE IN FRONT
CALM ATTENTION
```

The durable domain may be detailed. The normal worker path must use defaults,
composition, and progressive disclosure so users are not forced to maintain the entire
entity graph.

### Revenue Operations home

The primary question is:

> **What should I do next?**

Recommended hierarchy:

1. priority NextRequiredActions;
2. material BusinessExceptions;
3. active assigned work;
4. concise Customer and operating context;
5. drill-down.

Do not make a KPI dashboard the primary operating screen. Summaries support decisions;
they do not displace the next useful action.

### Owner and director view

The primary question is:

> **What is not being handled?**

Group ordinary attention into understandable operating areas such as:

- Follow-up
- Scheduling
- Billing
- Collections
- Customer care
- Communication, delivery, and integration failures

Use danger styling only for genuine urgency or risk. Ordinary exceptions should use
neutral, informational, or soft-warning treatment plus a plain-language reason and next
action.

### Customer

Customer is the durable operating folder.

Recommended default order:

1. identity and primary Contact;
2. next required action;
3. open opportunities and work;
4. material AttentionFlags and BusinessExceptions;
5. active Estimate, Job, and Invoice summaries;
6. Customer/Contact communication;
7. history, notes, and files;
8. advanced locations, assets, and other detail.

Internal RevenueNote content must never look like a customer-facing Message.

### Lead

Lead is one commercial opportunity.

Show:

- requested service;
- source and attribution;
- owner;
- actual sales stage;
- next required action;
- related Appointment and Estimate;
- relevant communication and RevenueActivity;
- win or loss outcome.

Do not show Estimate delivery, Job progress, Invoice state, Payment state, follow-up,
stale, or overdue facts as Lead lifecycle stages.

### Estimate

Employee action flow:

```text
Draft
→ Issue
→ Send / Present
→ Accepted
```

An employee may record rejection. A salesperson controls revisions.

Customer-facing flow:

```text
View
→ Agreement
→ Sign and Accept
```

Do not expose customer edit, comment, revision-request, or public Reject controls.
Acceptance must identify the exact revision. Orthogonal facts may coexist quietly, for
example:

```text
Issued · Sent · Accepted · Job Scheduled
```

### Schedule

One visual schedule may combine Appointment and JobVisit, but each item must retain a
clear type label, meaning, and owning status. Do not collapse them into one domain merely
because they share a calendar.

### Job

Primary actions are business verbs:

```text
Start work
Work complete
Close
```

Do not use a generic status picker as the normal field workflow.

Show visits, tasks, notes, photos/files, ServiceAssets, ChangeOrders, and ServiceIssues
only when useful. They are not mandatory gates for simple work unless a later explicit
property policy requires them.

### Invoice

Primary summary:

```text
Total
Paid
Balance
Due
```

The authorized user records factual Payment input:

```text
amount
method
received date
optional note/reference
```

The interface derives and explains `UNPAID / PARTIALLY_PAID / PAID / OVERDUE`. Do not
ask the user to set those values manually. Issue, void, record Payment, and
reverse/correct Payment remain explicit consequential actions.

### Quick Capture

Always show:

- source text or transcript;
- confidence;
- source phrase where useful;
- before/current value;
- after/proposed value;
- proposed new records;
- missing or ambiguous information;
- resulting derived effects;
- selected proposals and Confirm.

Low-confidence proposals may be unselected by default. There is no auto-apply mode.
Consequential proposals route through the owning confirmation workflow instead of hiding
several legal, financial, or external effects behind one AI button.

### Time

Default field interaction:

```text
Clock In
→ current session / elapsed time
→ Clock Out
```

Personal history is secondary. Authorized team history, correction with reason, and
export are manager/detail surfaces rather than the default clock flow.

### Progressive disclosure

Use:

- collapsible sections;
- secondary tabs;
- drawers or sheets;
- contextual panels;
- “More details” controls;
- property defaults.

Do not force optional ServiceLocation, ServiceAsset, Appointment, JobVisit, JobTask,
notes, photos, files, ChangeOrder, or ServiceIssue into every simple flow.

### Revenue UI rules

- Human and Robin actions must be distinguishable.
- Conversation history is chronological and Customer/Contact scoped.
- RevenueActivity and internal notes remain visually distinct from customer Messages.
- BusinessException and AttentionFlag do not automatically mean red alert.
- Status meaning uses existing semantic tokens; do not create feature-specific Revenue colors.
- Sensitive revenue and financial controls require the correct capability.
- Loading, empty, error, disabled, and success states are required.
- Consequential actions clearly state the business effect before confirmation.

---
## 20. Robin

Robin should feel helpful and controlled.

### Robin surfaces

Use:

- Intelligence icon
- restrained purple accent
- clear mode badge
- clear approval state
- visible action history

### Rules

- Do not make Robin the visual center of every page.
- Do not use a chatbot bubble as the only way to control automation.
- Show what Robin plans to do before approval.
- Show what Robin actually did afterward.
- Display human handoff clearly.
- Failed actions must include a practical next step.
- Automatic mode must be visible.
- Property-specific capability settings must be understandable.
- Do not hide risky behavior behind friendly copy.
- Avoid animated robot decoration in operational interfaces.

### Approval cards

Show:

- Proposed action
- Customer context
- Message or field change
- Reason
- Relevant policy or workflow
- Approve
- Edit
- Reject
- Hand off

---

## 21. Smart Blog Studio

### Content inventory

Show:

- Title
- status
- topic cluster
- related service
- target query
- publication date
- last meaningful update
- performance status when available

### Strategy brief

Group fields into:

- Customer question
- Search target
- Business connection
- Content role
- Conversion path

Do not present a long undifferentiated list.

### Editor layout

Recommended desktop structure:

```text
Content editor
+ collapsible strategy/readiness sidebar
```

Rules:

- The writing area must remain calm.
- Do not surround the article with metrics while writing.
- Autosave state must be visible.
- Preview and publish are distinct actions.
- SEO checks explain the issue and suggested correction.
- Do not reduce readiness to one unexplained score.
- Internal links should be editable without leaving the article.
- Publish errors must preserve the draft.

---

## 22. Content Intelligence

Content Intelligence should answer whether content is doing its intended job.

### Article scorecard

Show:

- Discoverability
- Search capture
- Reader value
- Commercial connection
- Business contribution

Rules:

- Each label must show supporting evidence.
- Do not grade every dimension with arbitrary percentages.
- A content asset can succeed without direct leads.
- Assisted outcomes must be labeled as assisted.
- Missing attribution must reduce certainty, not erase useful evidence.
- Topic-cluster views should explain cluster contribution in plain language.
- Avoid recreating a general Funnel Mapper.

---

## 22A. Search Operations

Search Operations is an exception-first fulfillment interface, not a generic SEO metrics dashboard.

### Property workspace

Prioritize:

1. Search Program status
2. Current fulfillment cycle
3. Needs Attention items
4. Awaiting approval
5. Active Search work
6. Coverage and ranking evidence
7. Technical/local audit health
8. Completed work and delivery proof
9. Measurement pending/results

### Portfolio workspace

The BTLS-only `/admin/search-operations` view prioritizes:

- Active programs
- Healthy
- Needs Attention
- Blocked
- Awaiting approval
- Failed integration/provider collection
- Failed audit
- Overdue cycle
- Failed optimization
- Provider budget pressure

### SearchTarget and coverage views

- Present the SearchTarget as the strategic unit.
- Keep service, geography, search intent, keyword cluster, and intended ranking page visible.
- Coverage states must show the evidence/reason behind `Missing`, `Weak`, `Covered`, `Strong`, `Declining`, `Cannibalized`, or `Insufficient data`.
- Do not reduce coverage to one unexplained SEO score.

### Organic and local rankings

- Organic rank history and Search Console average position must be labeled as different evidence sources.
- Rank maps use a geographic grid with clear point ranks, capture date, search term, center/radius, and partial/failed state.
- Always provide an accessible textual summary of rank-map change.
- Do not imply visibility where a provider run failed or returned incomplete data.

### Fulfillment and outcome labels

- `Fulfilled` means scoped work was completed or explicitly resolved.
- `Healthy` means no material operational exception.
- Neither label means rankings, leads, or revenue improved.
- Improvement requires Measurement Review evidence.

### Optimization actions

Every action clearly displays one execution class:

- `Auto — Guarded`
- `Approval required`
- `Human only`
- `Unsupported`

Rules:

- Never hide whether an action was automatic, approved, or manual.
- Show the proposed change/preview before approval where meaningful.
- Show the exact execution result afterward.
- Show rollback/reversal only when the adapter genuinely supports it.
- Strategic or dangerous changes never expose an automatic option.
- `BTLS managed`, `Supported external`, and `Manual external` site states must be visible so operators do not assume direct execution exists.

### Client-safe Search summaries

Show:

- What BTLS worked on
- What was fixed or published
- Visibility changes supported by data
- Business outcomes where attribution is defensible
- What is next

Hide:

- Internal hypotheses
- Dismissed Findings
- Provider economics
- Cross-client/fleet data
- Unapproved strategic notes

---

## 23. Settings

Settings pages should use a left-side local navigation or clear section tabs.

Recommended sections:

- Property
- Users and Permissions
- Integrations
- Robin
- Notifications
- Branding
- Storage or media where necessary

Rules:

- Separate operational settings from dangerous administration.
- Show connection state and last sync for integrations.
- Destructive actions belong in a clearly separated area.
- Save state must be clear.
- Do not show secrets after they are stored.
- Permission changes require confirmation and audit history.

---

## 24. Dialogs, Drawers, and Sheets

### Dialogs

Use dialogs for:

- Confirmation
- Small focused forms
- Review and approval
- Destructive actions

### Drawers or sheets

Use for:

- Mobile navigation
- Advanced filters
- Supporting detail that should not replace the main page
- Compact record editing

### Rules

- Do not place a complete complex workflow inside a small dialog.
- Do not stack dialogs.
- Closing a dirty form must warn the user.
- Focus must move into the dialog and return on close.
- Destructive confirmation names the affected record.
- Mobile dialogs may become full-screen sheets.

---

## 25. Empty States

Every list, chart, card, and section that can be empty requires an empty state.

A good empty state includes:

- What is missing
- Why it matters when useful
- One logical next action

Examples:

- No leads yet
- No Google connection
- No Findings detected
- No tickets assigned
- No published content
- Not enough data yet

### Empty-state rules

- Keep copy brief.
- Use a small icon.
- Do not use large decorative illustrations in operational screens.
- Do not celebrate missing business data.
- Distinguish:
  - Never configured
  - No records
  - No search results
  - No data for the selected period
  - Insufficient evidence
  - Failed loading

---

## 26. Loading States

Use:

- Page skeletons for initial page load
- Row skeletons for tables
- Button loading indicators for mutations
- Inline loading state for isolated regions

Rules:

- Preserve layout during loading.
- Avoid full-screen spinners for ordinary dashboard navigation.
- Do not replace already visible data with a spinner during a small refresh.
- Keep stale data visible with a refresh indicator when safe.
- Long background operations show progress or status without blocking navigation.

---

## 27. Error States

User-facing errors must be plain and actionable.

Show:

- What failed
- Whether data was saved
- What the user can do next
- Support or retry action when relevant

Do not show:

- Stack traces
- Raw provider messages
- SQL errors
- Token failures
- Internal IDs without purpose

### Integration errors

Include:

- Provider
- last successful sync
- affected data
- reauthorize or retry action

### Form errors

- Field errors near fields
- General error at form top
- Preserve safe entered data

### Partial failure

When one dashboard source fails:

- Show available data
- Mark the failed section
- Do not fail the entire page

---

## 28. Notifications and Toasts

Use toast notifications for short-lived confirmation.

Examples:

- Lead updated
- Draft saved
- Ticket assigned
- Message sent

Use persistent alerts for:

- Failed integration
- Robin handoff
- Payment problem
- Tracking failure
- Required approval

Rules:

- Toasts disappear automatically only when the user does not need to act.
- Destructive failures remain visible.
- Avoid multiple simultaneous toast stacks.
- Do not use success toasts for autosave on every keystroke.
- Notifications must link to the relevant record when practical.

---

## 29. Copy and Labels

Use plain English.

Prefer:

- “Needs review”
- “Could not sync”
- “Not enough data yet”
- “Create work ticket”
- “Waiting for approval”
- “Lead has not been contacted”

Avoid:

- “Anomaly detected”
- “Execute remediation”
- “Data artifact”
- “Conversion vector”
- “AI has autonomously resolved”
- unexplained SEO abbreviations

Rules:

- Use established business terms consistently.
- Explain technical terms when client-facing.
- Button labels use verbs.
- Status labels describe state.
- Do not use playful copy for failures involving leads or revenue.
- Avoid “magic,” “genius,” or “superpower” language for Robin.

---

## 30. Icons

Use Lucide outline icons.

Rules:

- Keep stroke and size consistent.
- Pair icons with labels for primary actions.
- Use icons to aid scanning.
- Do not use icons decoratively in every metric cell.
- Use one icon per status or concept.
- Do not mix 3D illustrations with operational icons.
- Icon color follows semantic meaning.

---

## 31. Motion

Motion is functional and restrained.

Use motion for:

- Menu opening
- dialog entry
- expandable panels
- status transitions
- progress changes

Do not use:

- Looping decorative animation
- bouncing alerts
- animated metric counters by default
- large page transitions
- pulsing Robin panels

Respect reduced-motion preferences.

---

## 32. Responsive Behavior

### Desktop

- Persistent sidebar
- multi-column grids
- full tables
- supporting side panels

### Tablet

- Collapsible sidebar
- two-column grids
- reduced columns
- filters in popovers or drawers

### Mobile

- Drawer navigation
- one-column content
- compact headers
- prioritized information
- full-width primary action
- list-based records when tables become unusable

Rules:

- Do not shrink desktop layouts until text becomes unreadable.
- Reorder content by priority.
- Keep critical actions reachable.
- Avoid fixed widths that create overflow.
- Test dialogs, forms, tables, and editor workflows on mobile.
- Complex article editing may be view-limited on small screens if full editing is impractical, but the limitation must be explicit.

### Revenue Operations mobile web

- Revenue Operations web screens must be responsive and usable from a phone browser.
- Mobile web supports the current field workflow; native mobile remains a later validated direction.
- Field-critical actions must remain simple and touch friendly:
  - Call
  - Text
  - Quick Capture
  - Add note
  - Start work
  - Work complete
  - Upload photo
  - Record Payment when authorized
  - Clock in/out
- Avoid hover-only controls.
- Avoid desktop-only dense tables for Customer, Lead, schedule, Job, and Invoice workflows.
- Customer and work detail should convert into a prioritized mobile layout.
- Touch controls should be comfortably sized.
- Smart Blog Studio and detailed Intelligence workflows may remain desktop-first.

---

## 33. Accessibility

Required:

- WCAG AA contrast
- visible focus
- keyboard operation
- correct labels
- semantic headings
- descriptive button names
- status text in addition to color
- accessible error messages
- reduced-motion support
- sufficient touch targets
- accessible charts or data summaries

Rules:

- Never remove focus indicators.
- Icon-only buttons require accessible names.
- Dialog focus must be trapped and returned.
- Table headers use correct semantics.
- Form errors must be associated with fields.
- Dynamic status changes should be announced when appropriate.
- Do not use placeholder-only forms.
- Do not use hover as the only way to reveal required information.

---

## 34. Tailwind v4

Tokens are defined in `globals.css` using `@theme inline`.

Rules:

- Do not create `tailwind.config.ts` for product colors.
- Do not use built-in palette classes such as:
  - `bg-blue-500`
  - `text-gray-400`
  - `border-slate-700`
- Use semantic tokens such as:
  - `bg-surface`
  - `text-text-secondary`
  - `border-border`
  - `bg-accent`
- New colors require a token in `ui-tokens.md`.
- One-off calculated layout values may use arbitrary dimensions only with a clear reason.

---

## 35. Do Nots

- Do not use raw Tailwind color palettes.
- Do not hardcode hex colors in components.
- Do not add gradients to ordinary cards.
- Do not make every section a card.
- Do not put every available metric on an overview.
- Do not use charts for decoration.
- Do not create a second component library.
- Do not invent new button variants inside feature code.
- Do not hide authorization behind UI state.
- Do not show raw errors.
- Do not use icon-only navigation for primary sections.
- Do not use tiny text to fit more data.
- Do not create excessive nested panels.
- Do not place status color across entire table rows.
- Do not treat Robin like an unrestricted chatbot.
- Do not display AI suggestions as approved facts.
- Do not let ticket completion imply success.
- Do not recreate campaign tracking or funnel mapping in the MVP.
- Do not build a project-management suite inside Work Management.
- Do not use separate layouts for dark and light modes.
- Do not sacrifice accessibility to match a mockup.
- Do not add a new reusable pattern without updating `ui-registry.md`.

---

## 36. Feature Review Checklist

Before a UI feature is complete, verify:

### Structure

- Is the primary task obvious?
- Is the active property clear?
- Is the page header correct?
- Is information ordered by importance?
- Are sections grouped logically?

### Tokens

- Are all colors semantic?
- Are spacing and radius consistent?
- Does it work in dark and light mode?
- Are chart tokens used correctly?

### Interaction

- Are loading, empty, error, and success states present?
- Are mutations protected from duplicate submission?
- Are destructive actions confirmed?
- Is unsaved work protected?
- Is keyboard interaction complete?

### Content

- Are labels plain English?
- Are statuses understandable?
- Are technical terms explained?
- Are metrics defined and contextualized?
- Are possible causes clearly labeled as possibilities?

### Responsive

- Does the page work on desktop?
- Does it remain useful on tablet?
- Is the mobile priority order correct?
- Are tables adapted appropriately?
- Are primary actions reachable?

### Accessibility

- Is focus visible?
- Are labels and names present?
- Is color supplemented by text?
- Is contrast acceptable?
- Are dynamic changes announced when needed?

### Product integrity

For Search Operations, verify that fulfillment status is not presented as SEO success, rank-map failures are not presented as ranking declines, and guarded/approval/manual execution state is explicit.

- Does the UI match the feature’s real authority?
- Is client-visible content properly approved?
- Does Robin’s mode remain visible?
- Does Work Management preserve Finding evidence?
- Does the page avoid showing data merely because it exists?

---

## 37. Final Rule

When choosing between two valid UI approaches, choose the one that:

1. Makes the user’s next action clearer
2. Uses an existing approved component
3. Shows less irrelevant information
4. Uses plain language
5. Preserves product truth
6. Works across dark and light themes
7. Remains usable on smaller screens
8. Is easier for a junior developer to understand and maintain

BTLS UI should help the user decide and act. It should not merely prove that the application has data.
