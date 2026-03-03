# Zakat Companion — Product Spec

## Vision
Zakat Companion helps Muslims calculate zakat accurately, track nisab status over time, and receive the right reminders at the right time.

## Product Goals
- Make zakat calculation understandable for non-experts.
- Persist financial data so users only update what changed.
- Track nisab transitions over time (above/below).
- Compute when zakat becomes due based on configured fiqh rules.
- Provide proactive reminders: check-in, due soon, due now.

## User Types
- **Beginner**: needs clear explanations and guided flow.
- **Returning user**: wants prefilled values and quick updates.
- **Careful tracker**: wants history, timeline, and due-date confidence.

## Core Features

### 1) Onboarding & Preferences
- Language, currency, zakat school (standard/hanafi), reminder defaults.
- Optional beginner mode.

### 2) Calculator Wizard
- Compact multi-step wizard with guidance per field.
- Live result card always visible.
- Decimal-safe money math.

### 3) Persisted Financial Inputs
- Save financial values after edits.
- Reuse previous values in future sessions.
- “Clear saved values” action.

### 4) Assessment History
- Save snapshots with timestamp and breakdown.
- Show historical list and trend.

### 5) Reminder System
- Scheduled check-ins to update financial status.
- Due-date reminders (e.g., 30d/7d/1d/due-now).
- Deep-link users to relevant update step.

---

## Nisab Lifecycle Engine (Explicit Requirement)

This is the key feature you requested.

### Objective
Track user nisab state over time and determine when to start/reset zakat due timing.

### State Model
For every saved assessment, compute and store:
- `assessment_at` (timestamp)
- `net_zakatable_wealth`
- `nisab_value`
- `nisab_state` = `ABOVE` | `BELOW`
- `zakat_due_now` (computed amount)

Lifecycle fields (per user):
- `active_cycle_started_at` (nullable)
- `active_cycle_state` = `NONE` | `RUNNING`
- `active_cycle_rule_profile` (e.g. standard/hanafi profile key)
- `next_due_at` (nullable)

### Transition Rules (Baseline)
1. **BELOW → ABOVE**
   - Start cycle if no active cycle.
   - Set `active_cycle_started_at = assessment_at`.
   - Compute `next_due_at = started_at + 1 lunar year` (configurable profile).

2. **ABOVE → ABOVE**
   - Keep cycle running.
   - Recompute projections if needed.

3. **ABOVE → BELOW**
   - Mark interruption event.
   - Apply selected fiqh profile behavior:
     - **Reset mode**: clear cycle and wait for next ABOVE transition.
     - **Pause mode** (future option): pause timer with resume conditions.

4. **BELOW → BELOW**
   - No cycle running.

> Note: final interruption behavior should be profile-driven and reviewed with domain guidance before public release.

### Notification Logic
- **Check-in reminders**: prompt user to refresh values regularly (e.g. monthly).
- **Cycle reminders** (if cycle running):
  - due in 30 days
  - due in 7 days
  - due tomorrow
  - due today
- **State-change notifications** (optional):
  - “You moved above nisab; zakat cycle started.”
  - “You moved below nisab; cycle reset under your selected rule.”

---

## Data Model (MVP+)

### `financial_profiles`
- `id`, `user_id`
- latest editable fields (cash, gold, silver, investments, debts, etc.)
- `updated_at`

### `zakat_assessments`
- `id`, `user_id`
- full input snapshot
- computed outputs (assets/liabilities/net/nisab/due)
- `nisab_state`
- `assessment_at`

### `zakat_cycles`
- `id`, `user_id`
- `started_at`, `ended_at` (nullable)
- `status` (`running|ended`)
- `end_reason` (`fell_below_nisab|paid|manual|rule_change`)
- `rule_profile`
- `next_due_at`

### `zakat_events`
- `id`, `user_id`, `cycle_id`
- `event_type` (`state_above`, `state_below`, `cycle_start`, `cycle_end`, `due_reminder_sent`, `due_notified`)
- `event_at`, `meta_json`

---

## Phase Plan

### Phase 1 (Current direction)
- Wizard calculator
- Persisted values
- Assessment save/list

### Phase 2
- DB-backed assessments + cycles
- Nisab transition engine (baseline reset mode)
- Due-date projection + reminders

### Phase 3
- Advanced fiqh rule profiles (configurable interruption behavior)
- Better reports/export
- Deeper educational guidance

---

## Acceptance Criteria for Lifecycle Feature
- User receives periodic reminder to update finances.
- Every update stores an assessment with nisab state.
- App detects and logs above/below transitions.
- App starts cycle when entering ABOVE state.
- App computes and shows projected due date.
- App sends due-soon and due-now notifications.
- App handles ABOVE→BELOW transitions per selected rule profile.

---

## Notes
- App should include a disclaimer that it is a guidance tool and users should consult trusted scholars for edge cases.
- All money calculations must stay Decimal-based.
