# RedlineGT — Nextgen

Phase 1 experimental engine foundation. The original root index.html remains untouched. No deployment is configured.

## Goals
- Browser-first WebGL 2 rendering, scalable to low-end Chromebooks; desktop packaging later.
- Original simcade vehicle dynamics, fixed simulation steps and independently scalable graphics.
- Full-world redesign in later phases; single-player first.
- Original sharp, realistic vehicle geometry inspired by automotive design classes, not replicas of specific production vehicles. No third-party logos.
- Zero-cost development; no paid services or assets.

## Run locally
Serve this directory with a static HTTP server, then open index.html. The prototype uses native ES modules and WebGL 2. No installation of packages or external network requests is required. The existing game is available at ../classic.html.

## Scope
The initial prototype is a technical test surface, not the redesigned world or finished vehicle art. Performance and driving behavior require browser and hardware validation. The rendering and physics modules are deliberately independent so they can be replaced or expanded.

## Release constraints
No deployment, release, purchase, or merge to main is authorized. Review third-party licenses and the original game's embedded media before commercial distribution.
