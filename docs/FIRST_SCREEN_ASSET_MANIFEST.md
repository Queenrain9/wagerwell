# WAGERWELL — First-screen Asset Manifest

Status: **PLANNED ONLY**. No visual asset is generated in this phase.

The current first-screen code already references these filenames. Drop the finished files into `assets/first-screen/` and the browser will automatically display them over the CSS fallback artwork. Do not bake UI copy, LIVE badges, numbers, buttons, room names, roadmaps, or progress text into the images; those stay as HTML.

## A. Live casino imagery

| Filename | Target slot | Recommended source size | Composition / crop-safe requirements |
|---|---|---:|---|
| `hero_baccarat_main.webp` | Main baccarat hero | 1600×620 | Fictional live-baccarat studio. Dealer centered slightly right, green/black table in lower-right half, dark red/black luxury lighting, empty left 38% for HTML headline, no logos/text/cards with readable branding. Desktop 16:6 crop must work. |
| `room_baccarat_speed_a.webp` | TABLE 01 / Speed A | 640×360 | Fictional dealer at green baccarat table, red studio lighting, medium frontal camera, dealer torso fully inside safe center 60%. |
| `room_baccarat_royal.webp` | TABLE 02 / Royal | 640×360 | Same camera logic, deep blue studio, visibly different fictional dealer and background architecture. |
| `room_baccarat_vip.webp` | TABLE 03 / VIP | 640×360 | Purple/burgundy premium studio, darker wardrobe, gold accents, high-roller mood. |
| `room_baccarat_nocommission.webp` | TABLE 04 / No Commission | 640×360 | Warm amber/gold studio, green felt, different fictional dealer, slightly brighter table. |
| `room_baccarat_night.webp` | TABLE 05 / Night | 640×360 | Charcoal/black studio with cool edge light, late-night feel, different fictional dealer. |
| `room_baccarat_rapid.webp` | TABLE 06 / Rapid | 640×360 | Magenta/red rapid-table studio, punchier lighting, different fictional dealer. |

### Room-image consistency rules
- All dealers are fictional adults and must not resemble identifiable real people.
- Camera height and table geometry should stay consistent across all six room thumbnails so they read as one live-casino provider family.
- Each room must differ in dealer, lighting, background wall, and color theme; do **not** create six recolors of one image.
- Keep the bottom 20% relatively simple because the HTML room title and controls overlay nearby.
- No embedded room names, odds, casino logos, watermarks, UI chrome, or promotional copy.

## B. Benevolent ad background imagery

| Filename | Target slot | Recommended source size | Composition / crop-safe requirements |
|---|---|---:|---|
| `promo_shelter_winter.webp` | Shelter banner / left rail / ticker card | 900×420 | Blankets, shelter kennel cues, warm animal-care imagery. Dark red-black treatment; subject weighted right so left-side HTML remains legible. |
| `promo_meal_500.webp` | Meal support banner | 900×420 | Meal trays / packed lunches / serving counter, gold-red promotional lighting; no charity branding or readable labels. |
| `promo_library_books.webp` | Library banner | 900×420 | Books, shelves, cartons of new books; blue/navy promotional treatment. |
| `promo_ocean_cleanup.webp` | Ocean cleanup banner | 900×420 | Cleanup bags, shoreline, gloves/tools; cyan/navy promotional treatment. |

### Promotion-image rules
- They should look like **casino promo backgrounds first**, benevolent content second.
- Do not place warm NGO-style typography or logos inside the asset.
- HTML supplies labels such as 긴급 / HOT / 금일마감 / 진행률.
- Avoid faces if possible; objects and environments are more reusable across aspect ratios.

## C. Optional polish assets — not required for first replacement pass

| Filename | Purpose | Size |
|---|---|---:|
| `header_event_meal.webp` | Top-center rotating event-banner background | 1200×180 |
| `brand_emblem_wagerwell.svg` | Replace current CSS crown with finished emblem | vector |
| `support_badge_24h.webp` | Small 24H customer-service decorative badge | 320×180 |

## Folder structure

```
assets/
└── first-screen/
    ├── hero_baccarat_main.webp
    ├── room_baccarat_speed_a.webp
    ├── room_baccarat_royal.webp
    ├── room_baccarat_vip.webp
    ├── room_baccarat_nocommission.webp
    ├── room_baccarat_night.webp
    ├── room_baccarat_rapid.webp
    ├── promo_shelter_winter.webp
    ├── promo_meal_500.webp
    ├── promo_library_books.webp
    ├── promo_ocean_cleanup.webp
    ├── header_event_meal.webp            # optional
    ├── brand_emblem_wagerwell.svg        # optional
    └── support_badge_24h.webp            # optional
```

## Replacement order

1. Hero image.
2. Six live-room images.
3. Four promo backgrounds.
4. Optional header/emblem/support polish.

The first-screen layout should be reviewed again **after step 2**, before generating any additional art.
