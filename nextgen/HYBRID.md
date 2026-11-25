# Hybrid preview — integration pass 1

Open nextgen/ (not the repository root). It loads the unchanged original game in a same-origin iframe and applies checked source anchors before the legacy game initializes. This restores the original full map, missions, pursuits, traffic, menus and other systems rather than using the limited engineering test range. The test range remains at prototype.html. Preview saves use distinct redline-hybrid-* keys.

Changes: original parametric curved player-car body shells for coupe, sports, muscle, hatch, sedan, SUV and pickup; variable body width and arch contours, swept glass, sculpted nose/tail, detailed wheel spokes, lights and trim; day/night reflection maps; asphalt aggregate texture; lower default quality on constrained hardware; reduced shadow/MSAA cost; adaptive-resolution thresholds based on actual frame time; grip budget and cornering energy scrub. Original collision, AI and suspension behavior remains. No brand assets or external paid assets added.

This is an incremental hybrid integration, NOT modern Three.js or Rapier migration. The legacy r128 engine and its existing CDN dependencies are intentionally retained for compatibility. New code is modular; migration to modern Three.js and Rapier needs real browser tests. All other original game dependencies/media retain their original licensing status, which is not commercially cleared. No new dependencies.

Validation: transformation anchors checked against the exact original blob, generated inline JS parsed, upgrade JS parsed, tire-limit and energy-scrub checks passed. Full browser execution and visual benchmarking not performed; environment has no access to legacy CDN scripts. Expected visuals and FPS are not certified. The newly modeled cars are procedural meshes, not licensed professional GLB models. Existing road layout and buildings remain; full world redesign is not completed. Compare original and preview on identical settings and report the HUD FPS and frame resolution. Low settings should be tried first on Chromebooks.

No release, deployment, or main branch edits performed.
