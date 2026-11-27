# Asset and dependency register

Phase 1 preview has no external assets, packages, CDNs, fonts or paid services. Geometry is generated from original source code; browser WebGL 2 and DOM APIs are used directly. The vehicle is a provisional generic coupe, not finished art. No trademark clearance is implied.

The legacy root game is unchanged. Its embedded media and external libraries have not been cleared for commercial distribution. Before migrating any legacy content, identify the source and verify commercial and redistribution terms. Future dependencies and assets must be recorded individually with version, license, source, attribution and redistribution requirements.

## Foundry Row
All source downloads below were retrieved on 2026-11-25. Poly Haven publishes these assets under CC0 1.0 (https://polyhaven.com/license). Redistribution and modification are permitted, with no required attribution. The local game loads the derived JPEGs from assets/foundry/.

| Asset and source | Source creators | Source version and local modification |
| --- | --- | --- |
| [Brick Wall 001](https://polyhaven.com/a/brick_wall_001) | Dimitrios Savva (photography), Rob Tuytel (processing) | 1K diffuse JPEG, resized and desaturated for brick.jpg and combined with original drawn window bays in upper-bays.jpg |
| [Asphalt 04](https://polyhaven.com/a/asphalt_04) | Sergej Majboroda (photography), Jenelle van Heerden (processing) | 1K diffuse JPEG, resized to 768 pixels and compressed as asphalt.jpg. The street-* set uses the 2K color, 1K OpenGL normal and 1K roughness maps |
| [Urban Street 03](https://polyhaven.com/a/urban_street_03) | Andreas Mischok | Tonemapped panorama reduced to 1024 by 512, compressed as street-light.jpg for daytime reflections |
| [Concrete Floor 02](https://polyhaven.com/a/concrete_floor_02) | Rob Tuytel | 1K diffuse JPEG reduced to 512 pixels for paving.jpg. The sidewalk-* set uses the 2K color, 1K OpenGL normal and 1K roughness maps |

Shopfront graphics, shop names and district geometry were authored for the Foundry Row preview.

## Playable vehicle models

Models by [vinish.dev](https://vinish.dev/free-3d-models/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Retrieved 2026-11-26. Playable source triangles were retained, materials batched, source colour maps and transparency retained, and paint, lighting and scale adapted for RedlineGT. Attribution, source links, change information and license must accompany redistribution.

| Source asset | Original GLB SHA-256 |
| --- | --- |
| [box-truck](https://vinish.dev/free-3d-models/trucks) | 02e958c15c97c72da935d0a0e798861b7526d99b34929ac72f08968c4d9e2597 |
| [boxy-off-roader](https://vinish.dev/free-3d-models/realistic-cars) | e05c64f1b8f131c1a1d88d55c506afc008bbd5378a8523123dc006c5812aba7e |
| [executive-sedan](https://vinish.dev/free-3d-models/realistic-cars) | ebee0b15f33ea53442b8f0b803cceacba636f935bdc89b78220f4d18671b408c |
| [flatbed-truck](https://vinish.dev/free-3d-models/trucks) | 6bba59c5be103c6ca6a90d3c9a9d96c12aa28b2e0c621c4bdbe9abf330515515 |
| [grand-tourer](https://vinish.dev/free-3d-models/realistic-cars) | 7998bce260ca45c5f0a5a9eea5ceb06c76c0f61399e1e2394c4dcaca0383c9c4 |
| [hot-hatchback](https://vinish.dev/free-3d-models/realistic-cars) | fab901c9018e8c95d7157cb88427a458e865028d5547f00065310147cc5366ab |
| [luxury-suv](https://vinish.dev/free-3d-models/realistic-cars) | 40990c9f7c06e5407d8f52186ec2a393322e339acfaf88cd8a50e382daa5f8b8 |
| [mid-engine-supercar](https://vinish.dev/free-3d-models/realistic-cars) | 153bb0ff391dbcd816acb2f22cec30e212f65fffd6477ed903a20783cfbc2e3a |
| [muscle-coupe](https://vinish.dev/free-3d-models/realistic-cars) | f3fc9864f2850c3cd62e9655f8529ce2a0641f1b863b9a9c1196dc4a9c9fc890 |
| [rear-engine-sports-coupe](https://vinish.dev/free-3d-models/realistic-cars) | ab2e27716de230bd603964772bba723e72a6b6c1aebe9d1bb87cedf9415f078e |
| [sport-sedan](https://vinish.dev/free-3d-models/realistic-cars) | f17f4ab1b646743e5593266262b447744ea82aaf096d8a24863b1010bab6d7bf |

## Landscape and road traffic

The daytime sky uses [Kloppenheim 06 (Pure Sky)](https://polyhaven.com/a/kloppenheim_06_puresky) by Greg Zaal and Jarod Guest (Poly Haven, CC0), tone-mapped and resized. Nearby traffic uses simplified exteriors adapted from the credited playable fleet and the following additional vinish.dev models, all [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Meshes, colours, materials and scale are adapted.

- [electric-fastback](https://vinish.dev/free-3d-models/realistic-cars) · original GLB SHA-256 d7dae8863d0b6fc4fd42a6201b19f86cb67f3e3497fbe385d602396941939929
- [luxury-limousine](https://vinish.dev/free-3d-models/realistic-cars) · original GLB SHA-256 24e1f842ff96a02e149367f7cc8776ef4d7e05d20f7ec94f6845887077effaab
- [retro-city-car](https://vinish.dev/free-3d-models/realistic-cars) · original GLB SHA-256 6f4f02a70a4460b4aefcc96e1a3d57f11b21c9a1278f70aece40046a727d4da4
- [tractor-unit](https://vinish.dev/free-3d-models/trucks) · original GLB SHA-256 e82ebd492f9d73fbd8488316f3c2a789d8537454a088fd61c532bf7c5eb7a36b
- [logging-truck](https://vinish.dev/free-3d-models/trucks) · original GLB SHA-256 b19e5387cab369a7ada011202bea7b1b390cfb1dc0bae9cca4ec3e4a6922aff1
- [tipper-truck](https://vinish.dev/free-3d-models/trucks) · original GLB SHA-256 284d020e47e09753b004cc70e4e3107508ed4e080505f9c0b870a607ef43d254

The forest uses photographic [conifers by rubberduck](https://opengameart.org/content/high-res-tree-textures) and [horse chestnut by Onsemeliot](https://opengameart.org/content/horse-chestnut-tree), cropped and resized, CC0. The tree-surfaces atlas uses crown and bark samples from these photographs on original volumetric tree meshes. The park lawn is a light-green color grade of Aerial Grass Rock. The sidewalk diffuse is graded to warm gray. Terrain and structures use resized Poly Haven CC0 scans: [Forest Ground 04](https://polyhaven.com/a/forest_ground_04), [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock), [Brown Mud Dry](https://polyhaven.com/a/brown_mud_dry), [Roof Tiles 14](https://polyhaven.com/a/roof_tiles_14), and [Wood Planks Dirt](https://polyhaven.com/a/wood_planks_dirt).

Office glass uses [Facade 001](https://ambientcg.com/view?id=Facade001) and [Facade 010](https://ambientcg.com/view?id=Facade010) by ambientCG (CC0).

Foundry Row market-frontage and upper-floor artwork was generated for RedlineGT. Awnings, window bays and café furniture were modeled for this block. Playable mesh positions are quantized to 1/4096 metre. Nearby traffic uses the complete textured vehicle model. The distant traffic mesh uses one shared position grid across materials.
