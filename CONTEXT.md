# Context

## Domain Terms

- `wealth snapshot`: the user's current zakatable assets and liabilities used to determine nisab status and zakat due amount.
- `wealth snapshot revision`: an edited wealth snapshot captured as a new record so history remains append-only.
- `wealth snapshot edit page`: the dedicated screen for cloning the current snapshot into a new revision.
- `wealth snapshot refresh`: the user-facing action for capturing a new revision of the current snapshot.
- `wealth snapshot edit flow`: the server-resolved path that updates the current snapshot by creating a new revision.
- `wealth snapshot explanation disclosure`: the collapsed explanation section on the current snapshot screen.
- `wealth snapshot explanation inputs line`: the compact line that shows the frozen inputs used for a snapshot explanation.
- `wealth snapshot refresh warning`: the note that saving a refresh creates a new revision instead of mutating the existing one.
- `wealth snapshot explanation title`: the user-facing heading for the current snapshot explanation disclosure.
- `wealth snapshot explanation sections`: the separate explanation blocks for nisab, hawl, due amount, and frozen inputs.
- `zakatable categories`: the asset and liability types the app includes in the wealth snapshot by default.
- `nisab benchmark`: the threshold reference used to determine whether zakat is due; gold is the default benchmark, with silver as a selectable alternative.
- `benchmark pricing cache`: the current EUR gold and silver price record fetched from Metals.dev and reused between refreshes.
- `benchmark freshness`: the neutral age label shown for the cached benchmark pricing record.
- `madhab`: the user's chosen school of Islamic jurisprudence that governs how the app calculates zakat rules.
- `multi-madhab support`: the app allows the user to select among multiple madhabs for zakat calculation rules.
- `zakat date rule`: the app's hawl and reset behavior must follow the user's selected madhab.
- `calculation scope`: the first release may use a standard zakat percentage baseline, with room to expand into category-specific rules later.
- `full fiqh handling`: the app should model madhab-specific zakat rules as fully as practical, rather than using a simplified universal rule set.
- `fiqh calculation context`: the frozen madhab and nisab benchmark codes captured with a snapshot so historical calculations can be reproduced later.
- `fiqh calculation result`: the derived snapshot summary stored at capture time so history does not change when profile preferences change later.
- `fiqh explanation inputs`: the calculation inputs captured with a snapshot revision so the explanation payload remains reproducible.
- `fiqh explanation payload`: the structured explanation data captured with a wealth snapshot revision so historical reasoning remains reproducible.
- `wealth classes`: the app should support cash, gold and silver, trade inventory, receivables, and debts/liabilities in the initial model.
- `profile`: a separate zakat tracking record for a person or household member that can be managed by an authenticated user.
- `profile owner`: the authenticated user who owns a profile and controls delegated access to it.
- `delegated manager`: an authenticated user who is allowed to maintain one or more profiles owned by someone else.
- `profile access grant`: a custom app permission that allows a delegated manager to edit a profile without owning it.
- `fiqh preferences`: the required profile-level madhab and nisab benchmark selections that govern zakat calculation for that profile.
- `active profile`: the persisted profile selection for an authenticated user, used as the default profile context across the app.
- `reminder preference`: the profile-level record that stores reminder cadence, timezone, quiet hours, and zakat follow-up behavior.
- `balance update reminder`: a notification that prompts the user to refresh the wealth snapshot.
- `zakat due reminder`: a notification that alerts the user when zakat is due or approaching due.
- `reminder cadence`: user-configurable intervals controlling how often balance update reminders are sent.
- `due reminder lifecycle`: the app sends a reminder before the due date, on the due date, and optionally follows up until the user marks the zakat as paid.
- `timezone-aware reminders`: notifications should respect the user's local timezone and quiet hours.
- `quiet hours window`: the local-time interval during which reminder delivery should be deferred.
- `paid state`: the user’s confirmation that a zakat obligation has been settled for the current cycle.
- `permission model`: delegated access should be implemented as custom app permissions in the product domain.
- `reminder job`: an explicit unit of reminder work that can be processed by cron today and a queue later.
- `zakat cycle`: the obligation instance created from a wealth snapshot, tracked separately from the snapshot so payment and reminder state can change without rewriting history.
- `cycle state`: the mutable status of a zakat cycle, such as open, due, paid, or followed up.
- `calculation version`: the rule-set version used when a snapshot is captured, so historical calculations remain reproducible.
- `push subscription`: the browser push subscription record attached to a profile and used for web push delivery.
- `notification subscription`: the stored browser push subscription record for a profile, including its lifecycle state.
- `notification delivery attempt`: one recorded push send attempt for a reminder job and subscription.
- `web push notification`: the browser notification sent from the Worker runtime for a reminder job.
- `notification delivery payload`: the structured reminder content sent to a push subscription.
- `unbounded collection`: any user-growable data set fetched asynchronously that should default to infinite scrolling because it may not stay small.
- `infinite scrolling list`: the default presentation for unbounded collections, including page-style overviews and searchable pickers backed by async data.
- `drizzle-friendly pagination`: page-based pagination built around Drizzle `orderBy`, `limit`, and `offset` queries, with the page size capped by the repository.
- `infinite-list contract`: async list endpoints should return `items`, `page`, `pageSize`, and `hasMore`, accept a caller-provided page size with a server cap, and reset on server-side search changes.

## Code Boundaries

- client files must never import server files or server code directly.
- the only exception is `server functions`, which client files may import only from the specific `.function.ts` module that defines them.
- client files must never import a `server` barrel file.
- server code inside a feature's `server/` folder stays inside that folder unless it is exposed by a direct `.function.ts` import.
- feature `server/index.ts` barrels are for server-internal organization only and must not be used as client-facing import surfaces.
