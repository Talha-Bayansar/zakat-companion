# ADR 0001: Use Paraglide JS for localization

## Status

Accepted

## Context

The product is starting with three UI languages: English, Turkish, and Dutch. The app is a TanStack Start React application, so localization needs to work across SSR, client interactions, and future route content without creating a heavy runtime bundle.

## Decision

Use Paraglide JS as the localization system.

The initial locale set is:

- `en` as the base locale
- `tr` as the first additional locale
- `nl` as the second additional locale

Translation strings will live in `messages/{locale}.json` and be compiled into generated message helpers by Paraglide.

## Consequences

- Translations remain tree-shakable and type-safe.
- Locale-specific UI text can be added without introducing a runtime i18n library.
- The project now carries a small generation step during setup and build.
- Route-level locale handling can be added later without changing the translation source format.
