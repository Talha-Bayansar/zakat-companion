# ADR 0004: Generate PWA install assets from one branded source image

## Status

Accepted

We decided to use `pwa-asset-generator` as the repeatable workflow for PWA icons and splash screens, with `public/app-icon.png` as the single brand source. The generated icon set, startup images, and head-tag metadata are checked into the repo so the standalone install experience stays consistent, while a script keeps the workflow reproducible when the brand art changes.

## Consequences

- PWA install surfaces stay aligned with the current brand without hand-maintaining dozens of image variants.
- The asset pipeline is deterministic and easy to regenerate from one command.
- The repo carries a larger checked-in asset set, but that is preferable to manual icon drift.
