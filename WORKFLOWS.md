# VMUSF whole-site workflow blueprint

## Core rule
Every area of VMUSF must answer seven things for the user: **What am I doing? Why am I doing it? When should I do it? Where do I do it? Who is involved? What information do I need? What happens next?**

Every actionable area uses the same interaction shape:

1. Entry question in plain English.
2. One guided section at a time.
3. Choices before free-text wherever possible.
4. A visible **Why this step?** explanation.
5. Required information clearly identified.
6. Missing information can be recorded as unavailable with a reason, never silently skipped.
7. Repeatable events stay inside the same section, for example multiple calls or engineer visits.
8. Final control is **Close this section**, not a generic Next button.
9. Closing runs a gate check and only unlocks valid next sections.
10. **Save & come back later** is always available on longer journeys.

## Home / Start here
Purpose: route the person by goal rather than making them understand VMUSF's information architecture.

Entry choices: Fix a problem; check an outage; bill or price; renew/switch; build/continue a case; ask community; search knowledge; ask VMUSF Assist.

If an active case, engineer appointment, promised callback or monitoring checkpoint exists, show that before generic navigation.

Close action: **Start this journey**.

## First-time onboarding
Sections: why they came; current Virgin setup; optional equipment/package context; privacy choices; accessibility and sounds; review.

Every technical field has **Not sure**. Account number is not required for onboarding.

Close action: **Finish setup**.

## Guided Help
Sections: identify fault; establish scope; wider outage check; relevant diagnostics; safe fixes; verify outcome.

Required context varies by problem, e.g. service, device, Hub/TV model, Wi-Fi vs Ethernet, all devices vs one, error code, start time.

Each diagnostic shows **Why we're checking this**, exact instructions, expected outcomes, and what each result means.

Do not repeat completed tests. Do not use destructive resets as early defaults.

Close action: **Close troubleshooting section**. Exit either to monitoring/resolved or My Case/contact Virgin.

## Outages
Sections: broad area/service; compare community signal with official route; decide whether to monitor, diagnose locally, report signal or contact Virgin.

Never collect full public address and never call community clustering an official outage.

Close action: **Close outage check**.

## Community
Sections: search first; compose question; privacy review; discussion; confirm outcome.

Posting asks what happened, equipment/context and what has already been tried. Strip/warn about account numbers, full addresses, passwords and sensitive identifiers.

Replies support solved answer, Worked for me, bookmark and report. Community advice remains labelled separately from official guidance.

Close action: **Close discussion outcome**.

## Knowledge Centre
Sections: browse category; search; inspect source/trust/date; decide what to do with information.

Categories include broadband, Hubs, Wi-Fi/Pods, TV, landline/Digital Voice, accounts/email, billing/contracts, complaints, compensation, Ofcom/ADR, ICO/privacy, accessibility and security.

Every result shows authority, trust level, last checked date and original source.

Close action: **Close knowledge view**.

## VMUSF Assist
Sections: understand request; retrieve evidence; contradiction check; explain answer; record outcome.

Evidence priority: personal history; current official knowledge; regulatory knowledge; verified VMUSF; similar anonymised resolved cases; labelled community experience; current web research when needed.

The LLM explains. Evidence controls what can be claimed. Low confidence means more questions, not guessing.

Close action: **Close this Assist step**.

## Bills, prices and deal comparison
Sections: identify bill/price issue; capture numbers and services; compare like for like; choose action; record outcome.

Capture monthly amount, one-off fees, term, included services and effective date. Never rank solely by headline price.

Close action: **Close comparison**.

## Contracts, renewal, cancellation and switching
Sections: intent; current contract position; prepare contact/switch; record provider response; confirm outcome.

Choices: renew, negotiate, cancel, switch, changed mind. Current verified switching/cancellation rules drive the route.

Close action: **Close contract section**.

## My Case / Resolution Journey
The case is made of repeatable gated sections, not one linear form.

### Diagnosis section
Contains multiple tests/fixes and outcomes.
Required: clear problem definition, relevant tests and results.
Close: **Close diagnosis section**.

### Virgin support-contact section
Can contain any number of calls, chats, WhatsApp conversations, web forms and callbacks.
Each contact records timestamp, route, what happened, reference number or why unavailable, promises and next action.
Close: **Close support-contact section** only when the section gate is satisfied.

### Engineer / appointment section
Repeatable. Capture booking window, reference where supplied, attendance, findings, work done, replacement equipment and next action.
Close: **Close engineer section**.

### Monitoring section
Define what is being monitored, when monitoring started, what counts as recurrence and whether the fix remained stable.
Close: **Close monitoring section**.

### Formal complaint section
Locked until the current official Virgin process and case evidence say it is appropriate. Capture route, timestamp, complaint reference or explicit non-provision reason, response, requested resolution and promises.
Close: **Close complaint section**.

### External escalation section
Locked until current eligibility rules are met. Route by actual issue: ADR/CISAS, Ofcom information, ICO/privacy, etc. Capture authority, eligibility evidence, submission reference and outcome.
Close: **Close escalation section**.

### Resolution / close case
Confirm resolution, monitor where appropriate, archive locally, verify archive, then purge heavy server-side case data if configured. Anonymous outcome learning is opt-in and stripped of personal material.
Close: **Close case**.

## Call / Contact companion
Entry: How are you contacting Virgin?
Choices: Android mobile; iPhone; home phone; chat/messaging; online form; other.

Before contact show verified route, masked account details, existing references, a concise script and the exact questions this gateway needs answered.

Recording instructions are device-specific. Never claim a browser can automatically record a carrier call. If recording is supported, tell the user to inform Virgin they are recording for their own case notes. If not supported, use guided notes.

After contact ask whether they got through, call/chat dropped, authentication failed, etc. Then capture agent/department if known, reference or non-provision reason, outcome, promises, deadlines and appointments.

Uploaded transcript/recording is AI-extracted into candidate facts, then user-confirmed before becoming trusted case evidence.

Close action: **Close this contact**.

## Official Guidance / Rights
Sections: classify problem; identify relevant authority; explain current rule/process; apply to case if appropriate.

Keep Virgin Media, Ofcom, ADR/CISAS, ICO and community sources distinct. Always show source and date.

Close action: **Close guidance**.

## My VMUSF
Sections: current service snapshot; active/monitoring/local archived cases; profile; notifications; privacy/data; guided tour.

Old heavy closed-case data should not remain server-side after verified local archiving where purge is enabled.

## Notifications
Group by case action due, promised Virgin action, engineer appointment, community reply/solution and moderation.

Every notification explains why it matters and opens the exact workflow step needed.

Sound is optional and configurable.

## Accessibility
Sections: visual settings; motion; audio/sounds; preview/save.

Controls: dark mode, high contrast, text size, reduced motion, master sound, volume, notification/success/moderation sound categories and sound preview.

No essential meaning may depend on colour or sound alone.

## Moderation
Staff only. Sections: report queue; inspect context/history; choose proportionate action; record reason/audit outcome.

Close action: **Close moderation review**.

## Universal UI controls
Long workflows always provide:
- **Why this step?**
- **I need help with this step**
- **Save & come back later**
- **Close this section**

If a gate fails, do not show a technical validation error. Explain exactly what is missing and offer structured answers including **I don't know / they didn't tell me / not applicable** where legitimate.
