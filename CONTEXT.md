# Context

## Domain Terms

- `wealth snapshot`: the user's current zakatable assets and liabilities used to determine nisab status and zakat due amount.
- `zakatable categories`: the asset and liability types the app includes in the wealth snapshot by default.
- `nisab benchmark`: the threshold reference used to determine whether zakat is due; gold is the default benchmark, with silver as a selectable alternative.
- `madhab`: the user's chosen school of Islamic jurisprudence that governs how the app calculates zakat rules.
- `multi-madhab support`: the app allows the user to select among multiple madhabs for zakat calculation rules.
- `zakat date rule`: the app's hawl and reset behavior must follow the user's selected madhab.
- `calculation scope`: the first release may use a standard zakat percentage baseline, with room to expand into category-specific rules later.
- `full fiqh handling`: the app should model madhab-specific zakat rules as fully as practical, rather than using a simplified universal rule set.
- `wealth classes`: the app should support cash, gold and silver, trade inventory, receivables, and debts/liabilities in the initial model.
- `profile`: a separate zakat tracking record for a person or household member that can be managed by an authenticated user.
- `profile owner`: the authenticated user who owns a profile and controls delegated access to it.
- `delegated manager`: an authenticated user who is allowed to maintain one or more profiles owned by someone else.
- `profile access grant`: a custom app permission that allows a delegated manager to edit a profile without owning it.
- `balance update reminder`: a notification that prompts the user to refresh the wealth snapshot.
- `zakat due reminder`: a notification that alerts the user when zakat is due or approaching due.
- `reminder cadence`: user-configurable intervals controlling how often balance update reminders are sent.
- `due reminder lifecycle`: the app sends a reminder before the due date, on the due date, and optionally follows up until the user marks the zakat as paid.
- `timezone-aware reminders`: notifications should respect the user's local timezone and quiet hours.
- `paid state`: the user’s confirmation that a zakat obligation has been settled for the current cycle.
- `permission model`: delegated access should be implemented as custom app permissions in the product domain.
- `reminder job`: an explicit unit of reminder work that can be processed by cron today and a queue later.
