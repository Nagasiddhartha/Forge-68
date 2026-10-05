# FORGE design and implementation spec: Enamel and brass

Handoff document for the coding agent (Antigravity). It covers the product intent, the visual system, every page, every component, the animation spec, the copy, the honesty rules, the backend contract, and the build order.

**Reference prototype:** `forge-premium-directions.html`, Direction 1 ("Enamel and brass"). Match its look and motion. This spec extends it into a full product.

**Read first.** Three rules override everything else in this document:

1. **Honest before beautiful.** The UI must never claim something the backend cannot prove (section 3).
2. **Build against the real backend.** Inspect the existing FastAPI routes and Next.js code and adapt. Where this spec names a field or endpoint that does not exist, add it as listed in section 12 rather than hard-coding the value in the UI.
3. **No external requests at runtime.** FORGE is a sovereign product. No Google Fonts CDN, no analytics, no remote images, no third-party scripts. Fonts are bundled locally (section 6).

---

## 1. Product in one paragraph

FORGE is a sovereign industrial AI control plane. It lets a high-security industrial organisation use local AI workers over its private knowledge while keeping intelligence, data, tool execution, verification, policy, and audit inside its own boundary. Its central idea is that **intelligence is separated from authority**: the AI reasons and proposes, but policy decides what it may access and do, evidence supports the answer, independent code (not the AI) verifies it, a human decides what happens next, and everything is audited.

The demo is a synthetic refinery centred on Reactor R-204, with four scenarios:

| # | Scenario | Expected verdict | Instrument shown |
|---|---|---|---|
| 1 | R-204 investigation (flagship) | Verified against available evidence | Pressure dial plus parameter strip |
| 2 | Pressure variance (gauge image, 33.0 bar vs 31.2 bar baseline, +1.8 bar) | Review required | Pressure dial |
| 3 | Unauthorised critical operation (`calibrate_pressure_relief_valve`) | Action blocked | Gate instrument |
| 4 | Prompt injection in a maintenance bulletin | Quarantined | Seal instrument |

The product must make a first-time judge understand within 30 seconds: **what it is, why it matters, why it is different.**

---

## 2. Design thesis

**Enamel and brass.** The look of a precision instrument made by a serious maker: deep green enamel, brushed brass, ivory engraving, a watch-face dial. It should feel like something an engineer would be proud to have on the control-room desk, and something a procurement committee would trust with a budget.

Principles:

- **One hero instrument per screen.** The dial (or gate, or seal) is the most memorable thing. Everything around it is quiet and disciplined.
- **Colour means state.** Brass is for what needs attention, sage is verified, pale blue is "blocked as designed", coral is a real failure. Nothing is coloured for decoration.
- **Answer first, proof one click away.** The verdict and finding are at the top. Evidence, checks, policy, and trace sit below it, progressively disclosed.
- **Hairlines, not boxes.** Lists are separated by hairline rules. Avoid a grid of identical rounded cards.
- **Motion answers state.** One orchestrated moment per view. Everything else moves only in response to an action or a real system event.
- **Calm.** No glow, no neon, no scanlines, no particles, no constant movement.

Things to avoid: cyan or neon accents, all-caps monospace labels, glowing borders, numbered subsystem cards, pill badges on every element, gradient washes as decoration, any "cyberpunk" or terminal cosplay.

---

## 3. Honesty rules (hard requirements)

These are acceptance criteria, not suggestions. Every status in the UI must come from live backend state.

### 3.1 Runtime capabilities drive every status

Create `GET /api/runtime/capabilities` (section 12). The UI reads it once per session and on a refresh action. It returns what is actually true: installed models, whether each is live or a fixture, harness mode on or off, and which checks ran.

### 3.2 Forbidden or conditional strings

| Claim | Allowed only when | Otherwise show |
|---|---|---|
| "Live local inference" | Reasoning model is installed, reachable, and the current run used it | "Demo harness" (scripted plan) |
| Any mention of `qwen2.5-vl:7b` as active | `vision.installed && vision.mode === "live"` | "Vision: demo fixture, advisory" |
| "Qwen3 8B plan" on a trace row | The plan was produced by the model | "Scripted plan (demo harness)" |
| "Air-gapped", "air-gap level 4" | Never, unless physically verified and configured as such | "Local only" |
| "0 bytes transmitted", "egress 0" | A real outbound-byte counter exists | "No outside AI services configured" |
| "Cloud SDKs: 0 loaded" | Computed from a real dependency or import scan at startup | Omit |
| "Immutable", "tamper-evident" | The audit log is persisted and hash-chained, and the chain verifies | "Audit log" |
| "Cryptographic provenance" or SHA-256 shown | The hash exists for that document or evidence item | Show "Not hashed" or hide |
| "Evidence grounded" | `evidence.length > 0` | Hide the badge |
| "Calculated" or "Calculation" | `calculations.length > 0` | Hide |
| Verification check "Passed" | The check had something to evaluate | "Not applicable" |
| Security test results "10 of 10 passed" | Results come from an actual run, shown with its timestamp | "Not run yet" and a Run button |

### 3.3 Never contradict across pages

One source of truth per fact: embedding model name, event totals, document hashes, model names. If two pages can show the same fact, they must read the same field. (The previous build showed two different embedding models and two different event counts.)

### 3.4 The claim ladder (used on the Boundary page)

Every sovereignty or security claim is labelled with how we know it:

- **Declared:** configured at startup (for example: only a loopback inference endpoint, no cloud provider configured).
- **Tested:** proven by an adversarial test that was run, with its timestamp.
- **Observed:** measured at runtime (installed models, dependency scan, a real counter).

### 3.5 Remove from the UI

Milestone labels (M2, M4, M6, "Milestone 9 and 11"), `AGENTS.md` references, file system paths, the FPS meter and the Next.js dev badge (production build for the demo), raw event IDs in primary views, "Auditing..." placeholders that never resolve, the "Active in-memory chunks" panel, six repeated "Ingest / re-index" buttons.

---

## 4. Information architecture

Five top-level destinations, replacing seven:

| Nav | Purpose | Replaces |
|---|---|---|
| **Missions** (landing) | Start a mission, review results: answer, evidence, checks, policy, trace | Overview, AI Workspace, Evidence, Verification |
| **Library** | Private documents, search, classification, indexing | Knowledge |
| **Governance** | Personas and clearance, policy rules, security tests | Policy cards and the security matrix from Sovereignty |
| **Audit** | Mission-level history, integrity, export | Audit |
| **Boundary** | The trust center: declared, tested, observed | Sovereignty |

Evidence and verification are **parts of a mission**, not destinations. Cross-mission history lives in Audit.

Routes (adapt to the existing router): `/missions`, `/missions/[id]`, `/library`, `/governance`, `/audit`, `/boundary`.

---

## 5. Terminology

| Old | New | Notes |
|---|---|---|
| Sovereign Control Plane | FORGE, with the tagline "Industrial AI that proposes. You decide." | Say what it does |
| Knowledge Fabric | Library | |
| Evidence Registry | Evidence (inside a mission) | |
| Verification Engine | Independent checks | Subline: "Checked by code, not by the AI" |
| Policy Gateway | Policy | "Authority" is acceptable in headings |
| Immutable Audit | Audit log | "Tamper-evident" only once chained |
| Air-gapped sovereign | Local only | |
| Sovereignty Enclosure | Boundary | |
| Bounded Observer | Advisory vision | |
| Deterministic Evaluation | Checked by code | |
| Classification | Clearance | Document "Internal"; user "Clearance: Confidential" |
| Provenance | Source trail | |
| Parameter Variance | Deviation from baseline | |
| Default-deny | Default-deny | Keep. It communicates the architecture |
| Persona / Role dropdowns | Demo persona | Label it as a demo control |

Tool names: show a friendly name first and the raw identifier in detail. Example: "Calibrate pressure relief valve" with `calibrate_pressure_relief_valve` in the expanded view.

Voice: plain, specific, sentence case. Active voice. No "successfully", no "please", no exclamation marks on system copy. Buttons are verbs: "Escalate to engineering", "Run mission", "Export case file".

---

## 6. Visual system

### 6.1 Colour tokens

Define as CSS custom properties on `:root`. This product ships one theme (dark enamel). Structure the tokens so a second theme could be added later.

**Surfaces**

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#0A211D` | Page canvas, deepest |
| `--bg-1` | `#0E2B26` | Main panels, hero base |
| `--bg-2` | `#12332D` | Raised panels, popovers |
| `--bg-3` | `#174039` | Hover, selected rows |
| `--face` | `#0A231E` | Dial face |
| `--bezel-ring` | `#1F5247` | Dial inner ring |

Page background: `radial-gradient(120% 90% at 72% 42%, #1B4339, #0E2B26 58%, #0A211D)`, applied once to a fixed, static layer (never animated, never re-painted on scroll).

**Lines**

| Token | Hex | Use |
|---|---|---|
| `--line` | `#23463D` | Hairlines, dividers |
| `--line-strong` | `#2D5249` | Dial track, input borders |

**Text**

| Token | Hex | Contrast on `--bg-1` | Use |
|---|---|---|---|
| `--ink` | `#EFE9DA` | about 12:1 | Primary text, headlines |
| `--ink-2` | `#B9C6BF` | about 8:1 | Body, descriptions |
| `--ink-3` | `#9FB1A9` | about 6.3:1 | Captions, labels (minimum for text) |
| `--ink-faint` | `#6F8A80` | below 4.5:1 | Decorative only, never text |

**Brand and state**

| Token | Hex | Use |
|---|---|---|
| `--brass` | `#C8A15A` | Primary action, review required, needle, bezel |
| `--brass-hover` | `#D4AE68` | Brass hover |
| `--on-brass` | `#10241F` | Text on brass fills |
| `--sage` | `#9CC3A8` | Verified, passed, progress |
| `--pewter` | `#8DB4D6` | Action blocked, quarantined (safe outcomes, with lock or shield icon) |
| `--coral` | `#D9694E` | Fills for trip zone and genuine failure |
| `--coral-text` | `#E58A70` | Coral used as text (meets contrast) |
| `--mist` | `#9FB1A9` | Insufficient evidence, not applicable |

Rules: colour is never the only signal. Every state has an icon and a word. Red or coral is reserved for genuine failures and the trip zone, never for "denied by policy" (that is a safe outcome and uses pewter).

### 6.2 Typography

Bundle all fonts locally with `next/font` (self-hosted at build time) or from `/public/fonts`. No runtime Google requests.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display and numerals | **Cormorant Garamond** | 500, 600 | Headlines, dial numerals, big figures. Enable lining figures: `font-variant-numeric: lining-nums tabular-nums` (the default figures are old-style, which looks wrong for measurements). Never set below 20px. |
| UI and body | **Hanken Grotesk** | 400, 500 | All interface text, tables, forms. `font-variant-numeric: tabular-nums` on numbers. |
| Identifiers | **IBM Plex Mono** | 400 | Only for hashes, event IDs, raw tool names. 13px minimum. |

Scale:

| Style | Family | Size and line height | Use |
|---|---|---|---|
| display-xl | Cormorant 500 | `clamp(34px, 4.6vw, 56px)` / 1.04 | Mission headline |
| display-l | Cormorant 500 | 40 / 1.1 | Page titles |
| display-m | Cormorant 500 | 30 / 1.15 | Section headings, big figures (36 on facts) |
| title | Hanken 500 | 20 / 28 | Panel titles |
| body | Hanken 400 | 16 / 26 | Reading text, max 64ch |
| small | Hanken 400 | 14 / 22 | Secondary text, nav |
| caption | Hanken 400 | 13 / 18 | Labels. Smallest allowed size |

Letter-spacing: `-0.01em` on Cormorant headlines. The wordmark "FORGE" is Hanken 500, `letter-spacing: 0.2em`. Sentence case everywhere. Do not use all caps for labels.

### 6.3 Spacing, radius, elevation

- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64.
- Page width: max 1360px, centred. Page padding 48px desktop, 24px at or below 780px.
- Radius hierarchy (do not use one radius everywhere): hero frame 20px, panels 14px, inputs 10px, buttons and chips 999px, list rows 0 (hairline separated).
- Elevation: avoid drop shadows. Separate with tone (`--bg-1` to `--bg-2`) and hairlines. Popovers get `0 12px 32px rgba(0,0,0,.35)`.

### 6.4 Iconography

Line icons, 1.5px stroke, brass or `--ink-3`. Use a local icon set (for example Lucide, bundled, not from a CDN). Needed glyphs: lock, shield, document, calculator, camera, check, clock, download, search, chevron, alert, boundary ring.

### 6.5 Optional texture

A static, very low-opacity (3%) fine-grain overlay on the page background can add a material feel. It must be a single pre-rendered image or SVG data URI, never animated. Skip it if it affects performance.

---

## 7. The instrument system (the signature element)

Each mission shows one hero instrument, chosen by verdict:

| Verdict | Instrument | Notes |
|---|---|---|
| Verified or Review required, with a numeric parameter | **Dial** | Needle plus zones |
| Insufficient evidence | **Dial at rest** | Needle absent, face reads "No reading", dashed track |
| Action blocked | **Gate** | Brass bezel, three-stage arc (Request, Policy, Handler), the handler segment dark, a lock that closes |
| Quarantined | **Seal** | Brass bezel, document glyph with shield, caption "Treated as data" |

### 7.1 Dial geometry (match the prototype exactly)

SVG `viewBox="0 0 360 360"`, centre `(180,180)`. Scale spans **240 degrees**, from 7 o'clock (-120 degrees) to 5 o'clock (+120 degrees), clockwise from 12 o'clock.

Angle for a value `v`: `theta = -120 + (v - min) / (max - min) * 240` (degrees).
Point at radius `r`: `x = 180 + r*sin(theta)`, `y = 180 - r*cos(theta)`.

Scale window (computed from evidence, not hard-coded):
`min = floor(normal - 0.25*(trip - normal))`, `max = ceil(trip + 0.25*(trip - normal))`.
For R-204 that gives 30 to 36 (normal 31.2, alarm 33.5, trip 35.0), so each bar is 40 degrees and 33.0 sits at 0 degrees (needle straight up).

Layers, back to front:

1. Outer bezel: circle r=172, stroke `--brass` 2px, no fill.
2. Face: circle r=164, fill `--face`, stroke `--bezel-ring` 6px. Optional faint top-left crescent highlight (white at 5% opacity, static).
3. Track: arc r=128, stroke `--line-strong`, width 10, from min to max (large-arc flag 1).
4. Progress arc: r=128, stroke `--sage`, width 10, from min to current value. Use `pathLength="1"` for the draw animation.
5. Alarm zone: arc r=128, stroke `--brass`, width 10, from alarm to trip.
6. Trip zone: arc r=128, stroke `--coral`, width 10, from trip to max.
7. Normal marker: dot r=4, `--ink`, at r=128, angle of the normal value.
8. Ticks: 30 intervals across the scale. Minor ticks r 140 to 134, width 1. Major ticks (every 5th) r 142 to 128, width 1.8. Stroke `#8FA79D`.
9. Numerals: Cormorant 20px at r=104, lining figures, at each major tick (integer values), `--ink`.
10. Readout: Cormorant 40px, weight 500, centred at (180, 282), the current value with one decimal. Under it at y=304, Hanken 13px `--ink-3`: unit and tag (for example "bar, PI-204").
11. Needle (group, rotated about 180,180): path `M180 66 L187 188 L173 188 Z` fill `--brass`, hub circle r=10 `--brass`, inner circle r=3.5 `--face`.

Rotation of the needle in CSS: `transform: rotate(var(--rot))` where `--rot` is `theta` in degrees. The prototype animates from -120 degrees.

Accessibility: the SVG has `role="img"` and an `aria-label` built from data: "Pressure 33.0 bar, 1.8 bar above the normal 31.2, 0.5 bar below the high alarm 33.5." Provide the same facts as visible text beside it.

Size: 420px max width in the mission hero, 220px in compact contexts (Library empty state, landing idle).

### 7.2 Gate and seal

Same bezel and face as the dial for family resemblance. Gate: three short arcs for Request (sage, complete), Policy (pewter, decision made), Handler (`--line-strong`, never lit). A brass-outlined lock glyph at centre. Caption beneath: "Handler never ran". Seal: shield with a document glyph, caption "Treated as data. No tools ran."

---

## 8. Layout and pages

### 8.1 Application shell

**Top bar** (height 64px, sits on `--bg-0`, hairline below):
- Left: "FORGE" wordmark, then nav items (Missions, Library, Governance, Audit, Boundary). Active item has a 1px brass underline (4px offset) that slides between items (260ms ease-out).
- Right: **Boundary chip** ("Local only" with a sage dot, linking to Boundary) and the **Demo persona** control: "Persona: Engineer" and "Clearance: Confidential" in a popover. The popover is titled "Demo persona" and explains that this stands in for single sign-on.
- At 780px and below, the nav collapses to a menu button.

**Runtime footer** (36px, fixed, `--bg-0`, hairline above). Four items, each a label and a value drawn from `/api/runtime/capabilities`: Reasoning (model and live or demo harness), Vision (model or "demo fixture"), Policy ("default-deny"), Outside AI services ("none configured"). Clicking opens a "Runtime details" popover (endpoint, embedding model, preflight). This replaces the old badges.

### 8.2 Missions: landing (no mission selected)

- Hero (left): display-xl headline "Industrial AI that proposes. You decide." Body: "FORGE runs local AI over your private plant knowledge. Policy decides what it may do, evidence supports every answer, and independent checks verify it before it reaches you." Two actions: primary "Start a mission", secondary "Watch the demo" (starts presenter mode).
- Hero (right): the Dial at rest, its needle doing a single slow sweep from min to 33.0 on load, then holding. Caption beneath: "Reactor R-204, synthetic demo data".
- **Mission list** (hairline rows, not cards): four demo missions, each with a small instrument glyph, a title, one line, and the expected outcome in plain words. "R-204 investigation: Is the reactor operating within limits?", "Pressure variance: Does this gauge reading need review?", "Calibrate PRV-204: What happens when a role lacks authority?", "Untrusted bulletin: Can a document take control?" Row action: "Run".
- **Composer**: textarea (pre-filled by the selected mission), context chips (Asset R-204, Persona), "Attach gauge image" and the primary "Run mission" button. The old "Analyze image only" becomes a secondary option inside the attach menu.
- **This session** (only if there are runs): recent missions as hairline rows with state icon, title, relative time.

The old scenario launcher, console, and status chips are removed from the top of the page. "Reset demo" moves into presenter mode.

### 8.3 Mission view (`/missions/[id]`)

Vertical structure:

1. **Header.** Breadcrumb "Missions / title". Title in display-l. Meta row: Asset, Persona, Started (plain text, separated by spacing, not decorative chips). Actions: "Export case file" (secondary), overflow menu.
2. **Stage bar.** Seven segments: Ask, Understand, Consult, Authorize, Evidence, Verify, Answer. Each shows a label and one short result ("3 sources", "1 read allowed", "7 of 7 passed"). Sage when complete, brass for the final segment when the verdict needs a human, pewter when blocked. Skipped stages show "not needed", never a missing number.
3. **Hero** (two columns, `--bg-1` panel, 20px radius): left is the verdict pill, the headline (display-xl), the finding (body, with numbered source footnotes), action buttons, and the fact strip (three big figures with captions). Right is the hero instrument (section 7).
4. **Checks strip** under the hero, hairline above: seven small segments that fill in sequence and the text "7 of 7 independent checks passed". If any check is Not applicable, the count reads "5 of 5 applicable checks passed".
5. **Detail area** (two columns, desktop):
   - Left: **Evidence** (typed rows, section 9.2).
   - Right: **Independent checks** (seven rows, section 9.3) above **Policy** (decision cards, section 9.4).
6. **How FORGE got here** (full width, collapsed by default): the seven stages as an accordion, plus the **Authority lanes** diagram (section 9.6).
7. **Trace** (collapsed): raw lifecycle events for engineers. Phase numbers must be complete and consistent, with skipped phases shown as "not needed".

States of the mission view: Idle (composer only), Running (section 10.4), Complete (any verdict), Error (section 11).

### 8.4 Library

- Header: display-l "Library", body "Private documents FORGE can read. Each is checked against your clearance before anything is retrieved."
- Document list as a hairline table. Columns: Name, Type, Clearance (a quiet text label, not a coloured pill), Size, Fingerprint (first 8 characters of the SHA-256 in Plex Mono, or "Not hashed"), Status ("Indexed" with a count of passages, or "Not indexed"). No file paths.
- One primary action: "Index all documents". Per-row "Re-index" is a text button that appears on hover or focus.
- **Search panel:** a single query field with three suggested queries as quiet text links. Results are rows with the passage excerpt, the source name, and a relevance bar (thin sage line, width proportional to score). Clearance filtering is stated plainly: "Showing results up to Confidential."
- Document detail opens a right-hand drawer with the text, highlighted passages, and its hash.
- The adversarial bulletin is shown in the list with a quiet "Contains instructions" note once the quarantine check has run.

### 8.5 Governance

Three sections on one page, anchor-linked from a sticky sub-navigation:

1. **Who can do what.** A matrix of personas (Engineer, Inspector, AI operator, Admin, Security officer) against clearance level and the actions they may perform. Cells use words ("Can run", "Needs approval", "Blocked"), not colour alone.
2. **Policy rules.** One row per registered tool: friendly name, raw identifier (Plex Mono), risk level, who may run it, whether approval is required. A row for "Unregistered tools: blocked" states the default-deny rule.
3. **Security tests.** The ten adversarial tests as rows: test name, what was attempted, which control stopped it, result, and the audit event proving it. Header shows "Last run: [timestamp]" with a "Run tests" button. If the results are not from a live run, say "Results from the last recorded run". Never show "10 of 10 passed" without a timestamp.

### 8.6 Audit

- **Integrity strip** at the top: "Audit log verified: N events" if the chain exists and verifies; "Audit log not chain-verified" if not; a "Verify now" button runs it.
- **Filters:** All, Agent, Library, Tool, Policy, Checks (underlined text tabs, not button-pills).
- **Missions timeline.** Group events by mission. Each mission is a heading row (title, persona, time, verdict) that expands to story rows: "11:37 Engineer asked to calibrate PRV-204. Policy blocked it under rule GATEWAY_RULE. The handler did not run." Each story row has a "Raw event" disclosure with JSON and the event ID in Plex Mono.
- Actions: "Export case file" and "Export log (JSON)".
- Show the real total event count. If the list is capped at 100, say "Showing latest 100 of N".

### 8.7 Boundary (trust center)

- Header: display-l "Boundary", body "Everything FORGE does happens inside your boundary."
- **Boundary diagram** (hero): concentric brass rings in the enamel palette, echoing Direction 3 of the studies. Centre: "AI reasoning". Rings outward: Policy, Evidence, Independent checks, Your boundary. Outside the outer ring, labelled "Outside AI services", with short brass bars across the boundary marking closed routes. Animation (once, on load): rings draw in, a small brass point travels from the centre outward, and each ring lights sage as it is passed, with its result text fading in beneath its label. This only plays on this page and on the landing page's secondary section.
- **Declared, Tested, Observed** (three columns, hairline separated), each listing claims with their source and timestamp (section 3.4).
- **System details** (collapsed): inference endpoint, models installed, embedding model, preflight results.

---

## 9. Components

### 9.1 Verdict pill and states

A verdict pill (brass outline for Review required) sits above the headline. States:

| State | Meaning | Pill style | Icon | Headline pattern |
|---|---|---|---|---|
| Verified | Checks passed, no review trigger | Sage outline | check | "[Subject] is within normal limits." |
| Review required | Facts verified, human judgement needed | Brass outline | alert | "[Subject] is above its normal baseline and approaching alarm." |
| Insufficient evidence | Cannot conclude from the records | Mist outline, hatched edge | circle-dashed | "FORGE can't confirm this from the records it has." |
| Action blocked | Policy denied, handler never ran | Pewter outline | lock | "Your role can't run this operation." |
| Quarantined | Untrusted content isolated | Pewter outline | shield | "A document tried to give FORGE instructions." |
| Failed | A check failed or integrity broke | Coral outline | x-circle | "A check failed. Don't rely on this answer." |

Pill text matches the state name exactly.

### 9.2 Evidence rows

Hairline-separated rows, each with a type icon, title, one-line detail, and a trailing tag.

| Type | Icon | Detail | Tag |
|---|---|---|---|
| Document | document | Excerpt with the extracted value highlighted (brass underline), plus section reference | Clearance label |
| Tool result | wrench | Tool, parameters, result summary | "Read-only" |
| Visual observation | camera | Observation text, and whether it came from the live model or a fixture | "Advisory" (always), plus "Demo fixture" if applicable |
| Calculation | calculator | Formula with inputs, for example "33.0 - 31.2 = +1.8 bar" | "Exact" |

Footnote numbers in the finding link to rows. Hovering or focusing a footnote highlights its row (background `--bg-3`, 120ms). Conflicts show the two values stacked with their sources and the label "Sources disagree".

### 9.3 Independent checks

Seven rows with plain names mapped to the real backend checks:

| Plain name | Backend check |
|---|---|
| Sources traceable | Provenance |
| Nothing missing | Completeness |
| Actions authorised | Policy compliance |
| Within your clearance | Classification |
| Values consistent | Parameter consistency |
| Math recomputed | Calculation validation |
| Answer supported | Grounding support |

Each row: icon (check, minus for Not applicable, x for fail), name, one-line result, "Show details" disclosure. Header: "Checked by code, not by the AI". States: Passed (sage), Not applicable (mist, with the reason, for example "No calculations were needed"), Failed (coral), Insufficient evidence (mist). Never show "Passed" when there was nothing to evaluate.

### 9.4 Policy decision cards

A bordered panel (14px radius) with: requested action (friendly name), decision (Allowed read-only, Blocked), the rule that decided, the persona and clearance it was evaluated against, and a **proof line**: "The tool handler did not run. No command was sent to the plant sandbox." (shown only when the backend confirms the handler was not invoked). A blocked card uses the pewter lock. If supervisor approval is built, it shows "Request approval".

### 9.5 Fact strip

Three figures with Cormorant 36px numerals, 14px captions, separated by 1px vertical hairlines, no boxes. Content comes from the evidence (value, deviation, distance to alarm). If no numeric parameter exists, the strip shows evidence count, checks passed, and control actions taken ("0").

### 9.6 Authority lanes diagram

Shown inside "How FORGE got here". Five horizontal lanes, restyled in enamel: You (decide), AI (can only propose), Policy (grants authority), Sources and tools (read-only here), Independent checks (code, not the AI). Nodes are hairline-outlined rounded rectangles on lane bands; arrows are 1.2px `--ink-3`. The AI lane node border is `--ink-3` (no authority); the Policy lane node border is `--pewter`; the final "Reviews" node is brass. For blocked runs the arrow stops at the Policy lane and the Tools lane is empty. Draw-in animation 600ms per segment in order of the real events.

### 9.7 Other components

- **Button:** primary (brass fill, `--on-brass` text, 999px radius, 40px height, 20px padding), secondary (1px brass outline, brass text), text (ink-2, underline on hover). Hover: brightness up 4%, 120ms. Focus: 2px brass outline, 2px offset. Disabled is avoided; keep actions enabled and explain on use.
- **Chip:** quiet text with a 1px `--line-strong` outline. Only for context (Asset, Persona).
- **Source chip:** footnote number in a small circle (`--bg-3`) that links to its evidence row.
- **Skeleton:** `--bg-2` blocks with a very low-contrast shimmer (1.6s, transform only).
- **Empty state:** a headline naming the space, one line of body, one verb action. Example, Audit with no events: "No activity yet" / "Run a mission and every step will appear here." / "Start a mission".
- **Toast:** bottom-centre, 4s, `--bg-2`, brass left rule. Used for "Case file exported".
- **Drawer:** right side, 480px, slides in 240ms.
- **Popover:** `--bg-2`, 14px radius, popover shadow, appears 140ms with 6px translate.

---

## 10. Motion

### 10.1 Principles

1. **One orchestrated moment per view.** The mission view's moment is the instrument reveal. The Boundary page's is the ring sequence. Landing's is the idle sweep. Everything else is quiet.
2. **Motion answers state.** Animation shows that something happened or arrived. When timing is real (a live run), drive it from real events. When it is a replay, do not fake latency.
3. **Only cheap properties.** Animate `transform`, `opacity`, and SVG `stroke-dashoffset`. No animated blur, filters, box-shadow, or layout properties. `backdrop-filter` only on the top bar if at all.
4. **Respect reduced motion.** Under `prefers-reduced-motion: reduce`, all animation is disabled and every element renders in its final state.
5. **Final state is the default.** Elements are authored in their finished state and the animation runs from an initial state, so nothing is hidden if animation fails.

### 10.2 Easing and duration tokens

```css
--ease-out: cubic-bezier(.22, 1, .36, 1);
--ease-needle: cubic-bezier(.22, 1.15, .36, 1);   /* slight settle */
--ease-draw: cubic-bezier(.3, .7, .2, 1);
--dur-fast: 120ms;   /* hover */
--dur-base: 240ms;   /* drawers, popovers, tab underline */
--dur-slow: 600ms;   /* segment draw */
```

### 10.3 The instrument reveal (the signature sequence)

Starts when the hero enters the viewport (use an IntersectionObserver at 30% threshold). Timings are from the prototype:

| Element | From to | Duration | Delay | Easing |
|---|---|---|---|---|
| Sage progress arc | `stroke-dashoffset` 1 to 0 | 1.9s | 0.3s | `--ease-draw` |
| Needle | `rotate(-120deg)` to `rotate(var(--rot))` | 2.2s | 0.3s | `--ease-needle` |
| Readout figure | Count up from `min` to the value, in sync with the needle | 2.2s | 0.3s | same curve |
| Facts, finding text, actions | `opacity` 0 to 1 | 0.9s | 2.2s | ease-out |
| Check segments | Each fades in and scales from `scaleX(.2)`, one per check | 0.4s each | 2.3s plus 0.14s per segment | ease-out |

Total about 4.2 seconds. The headline and verdict pill are visible immediately, so the answer is readable while the needle moves. "Replay" is available in presenter mode.

For a live run, the same visual language is driven by events: the sage arc advances as evidence arrives, and the needle moves to the final value only when the calculation event lands.

### 10.4 Running state

- Stage bar segments fill in as backend events arrive. The active segment has a slow 1.6s opacity pulse (0.6 to 1).
- The dial face is visible with the needle resting at `min` and a dashed track. Caption "Reading the sources...".
- Evidence rows appear one at a time as events arrive: 8px upward fade, 240ms, stagger at most 60ms, cap the stagger at five items.

### 10.5 Policy decision moment

The policy card shows "Evaluating" for a minimum of 400ms (so it is perceivable), then resolves. Allowed: a sage check draws (stroke, 300ms). Blocked: the lock shackle animates closed (stroke, 500ms), the gate's Handler arc stays dark, and the card border changes to pewter in 150ms. No shaking, no flashing, no red.

### 10.6 Other motion

| Interaction | Motion |
|---|---|
| Page change | Crossfade 180ms |
| Nav underline | Slides to the new item, 260ms, ease-out |
| List row hover | Background to `--bg-3`, 120ms |
| Footnote hover | Evidence row highlights, 120ms |
| Disclosure ("Show details") | Height and opacity, 240ms |
| Drawer and popover | 240ms and 140ms as in section 9.7 |
| Boundary page | Ring draw-in (0.9s each, 0.15s apart), travelling point (2.6s), ring highlight at the moment the point passes, result text fade 0.5s |
| Verdict change | Pill text crossfade 150ms, colour 150ms |
| Boundary chip | A slow 3s opacity pulse on the sage dot, the only ambient motion in the product |

### 10.7 Do not

No parallax, no cursor-following effects, no particle backgrounds, no animated gradients, no glow, no looping decorative animation, no number tickers on the Audit page.

---

## 11. Copy deck

**Landing:** "Industrial AI that proposes. You decide." / "FORGE runs local AI over your private plant knowledge. Policy decides what it may do, evidence supports every answer, and independent checks verify it before it reaches you." / "Start a mission" / "Watch the demo"

**Stage bar labels:** Ask, Understand, Consult, Authorise, Evidence, Verify, Answer. (Choose one spelling, "Authorise" or "Authorize", and use it everywhere.)

**Review required (scenario 2):** headline "Pressure on R-204 is above its normal baseline and approaching alarm." Finding: "The gauge reads 33.0 bar against a normal operating pressure of 31.2 bar, a deviation of +1.8 bar. The high-pressure alarm is set at 33.5 bar. An engineer should review this before the next shift." Actions: "Escalate to engineering", "Acknowledge". Proof line: "FORGE took no control action."

**Verified (scenario 1):** "R-204 is operating within its documented limits." Subline "Verified against the evidence available."

**Insufficient evidence:** "FORGE can't confirm this from the records it has." Body: "Missing: [list from the verification result]." Action: "Add documents to the Library".

**Action blocked (scenario 3):** "Your role can't run this operation." Body: "FORGE asked to calibrate pressure relief valve PRV-204. Policy blocked it because the Engineer role has no authority for this tool. The handler never ran." Actions: "Request supervisor approval" (only if built), "View the rule".

**Quarantined (scenario 4):** "A document tried to give FORGE instructions." Body: "FORGE treated the maintenance bulletin as data. No tools ran and the instructions were not followed." Action: "View the quarantined text".

**Errors:** say what happened and what to do, one sentence, no "Error:" prefix. Example: "The reasoning model isn't responding. Check that Ollama is running, then try again."

**Empty states:** Library "Add your first document" / Audit "No activity yet" / Missions "This session has no missions yet".

**Footnote under the gauge image evidence:** "Gauge image: demo fixture, advisory only." (When the vision model is live, this reads "Read by [model], advisory only".)

---

## 12. Backend contract and required additions

Inspect existing endpoints first. Map existing fields where they exist; add only what is missing. Never fabricate values in the frontend.

### 12.1 `GET /api/runtime/capabilities` (new)

```json
{
  "mode": "demo_harness | live",
  "reasoning": { "model": "qwen3:8b", "installed": true, "reachable": true, "live_for_runs": false },
  "vision": { "model": "qwen2.5-vl:7b", "installed": false, "mode": "fixture | live" },
  "embedding": { "model": "<actual>", "kind": "local_model | deterministic_fallback" },
  "policy": { "default": "deny" },
  "outside_ai_services_configured": 0,
  "inference_endpoint_is_loopback": true,
  "dependency_scan": { "ran": true, "cloud_sdks_found": 0, "at": "<timestamp>" },
  "egress_counter": null,
  "audit": { "persisted": false, "hash_chained": false, "total_events": 0 },
  "security_tests": { "last_run_at": null, "total": 10, "passed": null }
}
```

`egress_counter: null` means the UI says "No outside AI services configured" instead of a byte count.

### 12.2 Mission result view-model

The frontend builds this from existing responses (or the backend adds it):

```json
{
  "id": "", "title": "", "persona": "", "clearance": "", "asset": "R-204", "started_at": "",
  "verdict": "VERIFIED | REVIEW_REQUIRED | INSUFFICIENT_EVIDENCE | ACTION_BLOCKED | QUARANTINED | FAILED",
  "headline": "", "finding": "",
  "parameter": { "name": "Pressure", "unit": "bar", "tag": "PI-204", "value": 33.0, "normal": 31.2, "alarm": 33.5, "trip": 35.0 },
  "evidence": [{ "id": "", "type": "document|tool|visual|calculation", "title": "", "detail": "", "source_ref": "", "clearance": "", "advisory": false, "fixture": false, "hash": null }],
  "checks": [{ "key": "provenance", "status": "passed|not_applicable|failed|insufficient", "detail": "" }],
  "policy": [{ "tool": "", "decision": "allow|deny", "rule": "", "handler_invoked": false }],
  "stages": [{ "key": "ask", "status": "done|skipped|active|pending", "summary": "" }],
  "plan_source": "model | scripted",
  "events": []
}
```

`parameter` is populated from the calculation and document evidence (normal, alarm, trip come from the SOP). If it is absent, no dial numerals are invented; the Dial at rest or a different instrument is used.

### 12.3 Additions required to make claims true

1. **Verdict states**: add `ACTION_BLOCKED`, `QUARANTINED` and `NOT_APPLICABLE` (per check) to the verification and agent response. A denied tool call must not produce "Insufficient evidence".
2. **Plan source**: record whether a plan came from the model or the scripted harness.
3. **Hash-chained, persisted audit log**: each event stores the hash of the previous event; add `GET /api/audit/verify` returning `{ ok, events, broken_at }`. Persist to local disk so it survives restarts.
4. **Document hashes** populated at ingestion and returned in the Library list.
5. **Single source for model names** (embedding, reasoning, vision) read from configuration and exposed in capabilities.
6. **Security test runner**: `POST /api/security/run` runs the ten tests and stores results with a timestamp.
7. **Case file export**: `GET /api/missions/{id}/export?format=md|pdf` containing question, answer, evidence, checks, policy decisions, trace, and hashes.
8. **Trace completeness**: emit every phase, with skipped ones marked, so numbering is consistent.

---

## 13. Presenter mode

A keyboard-driven demo aid (open from "Watch the demo" or the `P` key).

- A slim brass control bar at the bottom: step label, Back, Next, Replay, Exit. Keys: Right and Left arrows, `R` to replay the current animation, `Esc` to exit.
- Each step highlights one area (dimming the rest to 40% opacity) and shows one sentence of narration: "Here is an industrial question." / "FORGE retrieves private plant knowledge." / "The AI proposes a reasoning path." / "Policy checks what is allowed." / "Evidence is collected." / "The math is recomputed by code." / "Independent checks verify the result." / "The answer is grounded." / "Every action is auditable." / "And nothing left your boundary."
- Includes **Reset demo** and a switch between running the scripted harness and live reasoning (if capabilities allow).
- Narration text is in the UI only while presenter mode is on.

---

## 14. Accessibility and quality floor

- Text contrast at least 4.5:1 against its background; use `--ink-3` as the lowest text colour.
- Minimum text size 13px. Hit targets at least 40px high.
- Visible keyboard focus everywhere (2px brass outline, 2px offset). Logical tab order. Popovers and drawers trap focus and close on `Esc`.
- The dial has a text equivalent. Every status has an icon and a word.
- `prefers-reduced-motion` respected (section 10.1).
- Responsive: designed for 1440px desktop (the demo target); correct down to 390px. Two-column areas stack at 1024px; the hero stacks with the instrument above the headline at 780px; the stage bar becomes horizontally scrollable at 780px.
- Performance: the production build must run without the dev overlay. Keep the page smooth during the reveal; if the background gradient repaints, move it to a fixed layer.
- No third-party requests. Verify with the browser network panel: only same-origin traffic and the local inference endpoint through the backend.

---

## 15. Feature scope

**Must have before the hackathon**
1. `GET /api/runtime/capabilities` and every status derived from it.
2. Fix the contradictions (embedding model, event totals, SHA-256 values, trace numbering).
3. Persisted, hash-chained audit log with a verify action.
4. Verdict states `ACTION_BLOCKED`, `QUARANTINED`, and per-check `NOT_APPLICABLE`.
5. Case file export.
6. Presenter mode.
7. The shell, Missions, and Mission view in the Enamel and brass system, with the dial reveal.

**High value if time allows**
- Supervisor approval flow for scenario 3: blocked, then a Supervisor persona approves, then the handler runs in the sandbox with audit.
- A conflicting-documents scenario (two sources disagree on a trip pressure) to demonstrate conflict detection.
- Install and test `qwen2.5-vl:7b` (about 6 GB, so on an 8 GB GPU Ollama will swap models and you will see a load pause). If latency is bad, keep the fixture and label it clearly.
- A small P&ID context panel for scenario 2 (PI-204 and PRV-204 tags).

**Nice to have:** light theme, keyboard shortcuts, mission comparison.

**Do not build:** more agents, graph RAG, extra models, real single sign-on or user management, multi-tenant features, chat history sidebar, tool marketplace, live telemetry streaming, anything cloud-related, a settings page.

**Simplify or remove:** see section 3.5.

---

## 16. Implementation roadmap

Build in this order. Do the honesty work in Phase A alongside the foundation so a polished UI never sits on top of inaccurate claims.

### Phase A: Foundation and honesty
- **Objective:** tokens, fonts, base components; `capabilities` endpoint; strip dev overlays and milestone labels; fix cross-page contradictions.
- **Components:** global CSS tokens, Button, Chip, Skeleton, runtime store, runtime footer.
- **UX outcome:** every status on screen is derived from real state.
- **Visual outcome:** deep enamel canvas, Cormorant and Hanken loaded locally.
- **Risk:** low. **Priority:** critical.
- **Done when:** no string in the forbidden list (3.2) appears unless its condition is true; the network panel shows no external requests.

### Phase B: Navigation and shell
- **Objective:** five-item top bar, boundary chip, demo persona popover, runtime footer, new routes, remove old pages.
- **Components:** TopBar, NavUnderline, PersonaPopover, RuntimeFooter.
- **UX outcome:** clear journey with fewer destinations.
- **Visual outcome:** the brass nav underline slides; the shell matches the prototype.
- **Risk:** medium (routing changes). **Priority:** critical.

### Phase C: Missions and the instrument
- **Objective:** landing, composer, mission list, mission view with verdict, headline, fact strip, stage bar, and the Dial, Gate, and Seal instruments with the reveal animation.
- **Components:** Dial, GateInstrument, SealInstrument, VerdictPill, FactStrip, StageBar, CheckSegments, Composer.
- **UX outcome:** the answer is visible first; the verdict is unmistakable.
- **Visual outcome:** the signature watch-face reveal.
- **Risk:** medium (SVG maths and animation timing). **Priority:** critical.
- **Done when:** the dial matches the prototype for 33.0 / 31.2 / 33.5 / 35.0, the needle ends at 0 degrees, and reduced-motion shows the final state.

### Phase D: Evidence and verification
- **Objective:** typed evidence rows with footnote linking, seven check rows with Not applicable, policy cards, "How FORGE got here" with authority lanes, trace.
- **Components:** EvidenceRow (four types), CheckRow, PolicyCard, AuthorityLanes, Disclosure, Drawer.
- **UX outcome:** "Trust the evidence" made literal.
- **Visual outcome:** hairline lists in the enamel palette.
- **Risk:** medium. **Priority:** high.

### Phase E: Library, Governance, Audit, Boundary
- **Objective:** the four supporting pages; hash-chained audit and verify; document hashes; security test runner; Declared, Tested, Observed on Boundary with the ring diagram.
- **Components:** LibraryTable, SearchResults, GovernanceMatrix, PolicyRulesTable, SecurityTestsList, AuditTimeline, IntegrityStrip, BoundaryDiagram, ClaimTag.
- **UX outcome:** an honest trust center and a readable audit.
- **Visual outcome:** the ring sequence on Boundary.
- **Risk:** medium to high (backend additions). **Priority:** high.

### Phase F: Motion and polish
- **Objective:** running-state events, policy decision moment, disclosures, drawers, popovers, page crossfades, skeletons, reduced-motion pass, performance pass.
- **UX outcome:** the product feels deployed, not demo-ware.
- **Visual outcome:** every transition follows section 10.
- **Risk:** low. **Priority:** medium.

### Phase G: Final demo
- **Objective:** presenter mode, case file export, rehearsal of all four scenarios, a final label audit against the backend, production build.
- **Components:** PresenterBar, narration steps, export button.
- **UX outcome:** a reliable five-minute story.
- **Risk:** low. **Priority:** critical.
- **Done when:** the four scenarios each end in their expected verdict, with the right instrument, with no console errors and no external requests.

---

## 17. Judge experience (what the design must achieve)

- **30 seconds:** the landing headline and the dial. "AI that proposes, you decide." The footer shows local reasoning and no outside services.
- **2 minutes:** run scenario 2 (the dial sweeps to 33.0, "Review required", +1.8 bar, seven checks), then scenario 3 (the gate: blocked, "the handler never ran").
- **5 minutes:** open the evidence footnotes, the authority lanes, the Governance security tests, the Audit story with the chain verified, the exported case file, and the Boundary rings with Declared, Tested, Observed.

---

## 18. Acceptance checklist

- [ ] No external network requests at runtime (fonts, scripts, images all local).
- [ ] No string from the forbidden list appears without its condition met.
- [ ] Scenario 3 shows Action blocked (not Insufficient evidence) with the Gate instrument and a proof line backed by the backend.
- [ ] Scenario 4 shows Quarantined with the Seal instrument.
- [ ] Every check row can show Not applicable.
- [ ] The dial geometry matches section 7.1; the numerals use lining figures.
- [ ] The reveal sequence matches section 10.3; reduced motion shows final states.
- [ ] Embedding model, event totals, and hashes are consistent across all pages.
- [ ] Audit shows the real total and the verify action works.
- [ ] Text contrast and 13px minimum respected; keyboard focus visible.
- [ ] Production build; no dev overlay or FPS meter.
