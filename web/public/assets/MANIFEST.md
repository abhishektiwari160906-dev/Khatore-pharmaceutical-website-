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

## Known limitation — flagging, not hiding

These are Magento's **295×295 cache-generated thumbnails** — the only
product imagery reachable from the public site. This is genuinely real,
unaltered product photography, but 295×295 is low resolution for a
"premium" presentation at larger display sizes. I have no access to
Magento's admin media library (original full-resolution source files) —
that needs either admin/FTP access to Magento or the original photography
files supplied directly by Khatore. Per instruction, I have **not**
upscaled, AI-regenerated, or otherwise altered these to compensate —
using them as-is until real higher-resolution sources are available.

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
