# ADR 0003: Standardize UI patterns for forms, loading, empty states, and destructive actions

## Status

Accepted

## Context

The app is growing feature-by-feature, and repeated UI decisions are already showing up across authentication, settings, and scaffold pages. Without a shared convention, future features will drift into inconsistent loading states, ad hoc empty states, custom confirmation flows, and mismatched form implementations.

The team also wants translations to remain complete and consistent, including validation and error copy.

## Decision

Standardize the following UI rules across the application:

- Use TanStack Form with Zod validation for forms.
- Use shadcn-style field composition for form layout and error presentation.
- Translate all user-facing copy through the message catalog, including validation messages, error messages, loading labels, and empty-state text.
- Use `Spinner` for general loading states.
- Use `Skeleton` for layout-specific loading states.
- Use `Empty` for views that have no data yet.
- Avoid card-like containers as the default visual framing for new features.
- Use a reusable confirmation dialog for destructive actions such as sign-out and delete flows.

## Consequences

- Future features follow the same implementation style by default.
- Loading and empty states become visually consistent and semantically correct.
- Translations remain complete instead of being patched in later.
- Destructive actions share a common interaction pattern.
- Some screen-level decisions become less flexible, but the resulting consistency is preferable for this product.

## Notes

This ADR is intentionally narrow: it defines UI implementation conventions, not product-domain terminology.
