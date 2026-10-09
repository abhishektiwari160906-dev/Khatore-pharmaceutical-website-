# Asset Manifest — sourced from live Magento (khatorepharma.com)

All files below are the **real, unmodified** assets from the live site —
downloaded, not regenerated, not AI-created, not recompressed.

Downloaded: 2026-09-19

## Brand

| Local file | Source URL |
|---|---|
| `brand/khatore-logo.png` | `https://www.khatorepharma.com/skin/frontend/ultimo/default/images/khatore-logo.png` |

## Products

| Local file | Product | Source URL |
|---|---|---|
| `products/01-kamalahar.png` | Kamalahar | `.../media/catalog/product/cache/1/small_image/295x295/.../1/_/1.png` |
| `products/02-k-mens.png` | K-Mens | `.../3/_/3.png` |
| `products/03-k-matic.png` | K-Matic | `.../2/_/2.png` |
| `products/04-k-cuff-syrup.png` | K-Cuff Syrup | `.../5/_/5.png` |
| `products/05-k-matic-oil.png` | K-Matic Oil | `.../4/_/4.png` |
| `products/06-kaptone.jpg` | Kaptone | `.../6/1/61hvmbzrstl._sx425_.jpg` |
| `products/07-k-morex-brain-tonic.jpg` | K-Morex Brain-Tonic | `.../5/1/51yuuzjgj3l._sx425_.jpg` |
| `products/08-k-matic-combo.png` | K-Matic Combo | `.../6/_/6.png` |

(Full source paths share the prefix
`https://www.khatorepharma.com/media/catalog/product/cache/1/small_image/295x295/9df78eab33525d08d6e5fb8d27136e95/`)

## Hero composition assets (added 2026-09-24)

| Local file | Source | Notes |
|---|---|---|
| `products/01-kamalahar-cutout.png` | Derived from `products/01-kamalahar.png` above | Background-knocked-out (white-point alpha threshold, no content added/altered) for the homepage hero's flanking product visual. |
| `products/raw-botanical-ingredients-cutout.png` | Client-supplied product photograph (K-Cuff Cough Syrup with Tulsi, flat-lay with tulsi leaf, black pepper, cardamom and bay leaf) | Cropped to the raw-ingredient portion only (bottle excluded) and background-knocked-out. Real Khatore ingredient photography, not stock imagery — used here for the "raw botanicals" side of the hero rather than a specific "Gota Masala" claim, which is not attested anywhere in the repo's verified product data. |

## Resolution upgrade (2026-10-09)

The 6 Magento-native products above were re-pulled at full native
resolution — Magento serves the ORIGINAL uploaded file at
`/media/catalog/product/<id-path>/<file>` (no cache/ resize segment in
the URL), publicly reachable the same as the cache-generated
thumbnails, just not linked from any page. Same real, unaltered
photography as before, just not downsized:

| Local file | Old (cache thumbnail) | New (original) |
|---|---|---|
| `products/01-kamalahar.png` | 650×650 | **1500×1500** |
| `products/02-k-mens.png` | 650×650 | **1500×1500** |
| `products/03-k-matic.png` | 650×650 | **1500×1500** |
| `products/04-k-cuff-syrup.png` | 650×650 | **1500×1500** |
| `products/05-k-matic-oil.png` | 650×650 | **1500×1500** |
| `products/08-k-matic-combo.png` | 650×650 | **1080×1080** |
| `products/01-kamalahar-cutout.png` | 295×295 (derived from the 650×650 source) | **1407×1198** (re-derived from the new 1500×1500 source, same white-point knockout method, no content added/altered) |

`products/06-kaptone.jpg` and `products/07-k-morex-brain-tonic.jpg` are
**not from Magento** — checked, these two have no Magento-native
listing; their source is Amazon product photography Khatore reuploaded
into Magento under a third-party filename
(`61hvmbzrstl._sx425_.jpg` / `51yuuzjgj3l._sx425_.jpg`). 425×425 is the
only resolution that filename exists at anywhere reachable — already
in use, genuinely the best available, not a limitation introduced by
this pass.

## Not included in this pass

- **Fonts** (DM Sans / DM Mono / Playfair Display) — currently loaded from
  Google Fonts CDN, not Magento. This isn't a "retiring Magento" dependency
  the way the logo/products are; self-hosting them is a performance
  optimization (Section 25) I'll do as part of the actual build, not this
  asset-migration pass.
- `/assets/science/` and `/assets/heritage/` directories from the suggested
  structure — no distinct image assets exist for these sections yet (the
  Science section currently uses generated visual language, not source
  photography; Heritage similarly has no separate imagery beyond the
  typographic treatment). Created only when real content exists for them.
