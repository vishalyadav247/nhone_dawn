# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Shopify Online Store 2.0 theme for the NH ONE store. It is built on **Dawn 15.2.0** (`config/settings_schema.json`). Nothing gets built or bundled, and there's no package.json, linter config or test suite. The Liquid, JSON, CSS and JS files are served as they are.

The repo is connected to the store through Shopify's GitHub integration. Commits titled "Update from Shopify for theme nhone_dawn/main" are edits made in the theme editor and synced back to git. As a result, `config/settings_data.json`, `templates/*.json` and `sections/*-group.json` can change on the store side. Pull before you edit them, and keep merge conflicts in those files to a minimum.

## Commands (Shopify CLI)

```bash
shopify theme dev --store <store>            # local preview with hot reload
shopify theme check                          # Liquid/JSON lint (Theme Check)
shopify theme check --path sections/foo.liquid
shopify theme push --unpublished             # push to a new unpublished theme for review
```

Don't push to the live theme unless you're asked to.

## Architecture

**Dawn base plus NH layers.** Most of the files in `sections/`, `snippets/` and `assets/` are stock Dawn. NH-specific work is added in these ways:
- **`assets/style.css`** (~5k lines) loads *after* `base.css` and the Owl CSS in `layout/theme.liquid`. It overrides Dawn without editing Dawn's CSS. It's split into banner-commented blocks, each naming the section or snippet it styles (for example `/* Car carousel (sections/car-carousel.liquid) */`). New NH styling goes in the matching block, or in a new one.
- **Brand tokens.** At the top of `style.css`, the `:root` block defines `--nh-*` variables as fallbacks. The theme editor's "Brand" settings group (`nh_brand_color`, `nh_btn_*`, …) emits an overriding `:root` block in `layout/theme.liquid` (around line 495). Brand colors should be changed in settings, not by hardcoding values. `--nh-card-gap` is the single gap value for every card grid and carousel, and it also overrides Dawn's `--grid-*-spacing`.
- **Custom sections and snippets.** Examples are `car-carousel`, `top-category-section`, `info-features`, `blog-categories`, `custom-blog-slider`, `faq` and `seo-text`, plus the `nh-*` article snippets. The custom collection templates `collection.car-brand.json` and `collection.car-model.json` support browsing by vehicle.
- **`assets/main.js`** is global NH JS, loaded last. In non-preview mode it blocks right-click, image drag and devtools shortcuts. It also defines `window.nhWhenVisible(el, init)`, which lazily starts carousels once the page has loaded and the element is near the viewport.

**Carousels** use jQuery 3.6 and OwlCarousel 2.3.4 from CDNs, both `defer`red in `theme.liquid`. Most carousels are set up in `assets/main.js`, and a few in their own section's inline script (`custom-blog-slider`, `info-features`, `home-page-tabbber`, `tabber-top-selling-product`). Any carousel code has to wait for jQuery and Owl to load. New carousels should start through `nhWhenVisible`. Some older ones still start right away, for example `#sub-collections`, `.pdp-featured-collection` and `tabber-top-selling-product`. Each carousel also needs a static pre-init layout in `style.css` ("Carousel pre-init layout") so nothing shifts before Owl takes over. Slider arrows share one definition ("Slider arrow buttons" in `style.css`).

**Third-party integrations, wired in `layout/theme.liquid`:**
- **GoKwik checkout** (`snippets/gokwik*.liquid`), configured by the "Gokwik" settings group (`goEnable`, `envType` production/sandbox, `mid`, …). It replaces the Dawn checkout and buy-now buttons.
- **Snapmint**, a script of about 1 MB that loads deliberately late. Read the comments around it before changing how it loads.
- Google Tag Manager, and WishlistHero (`snippets/wishlisthero-*`, `wlh-icon-*`).

**Pincode / fitment checker** (`snippets/pincode-checker.liquid` and `assets/pincode-checker.js`, the `<pincode-checker>` custom element). Fitment centres come from the `fitment_centre` **metaobject** and are inlined as JSON (`[data-fitment-centres]`). The last pincode entered is saved in localStorage under `nhone-fitment-pincode`.

**Custom JS components** follow Dawn's pattern: each one is a custom element guarded by `customElements.get(...)`, and they talk to each other through `pubsub.js`.

## Notes

- Files with backup-style names (`sections/WISHLIST_HERO_BKP_*`, `assets/style.css.bak`) are old copies. Don't edit them.
- `.claude/` is gitignored. `style.css` refers to a brand palette at `.claude/resources/design_theme.jpeg`, but that file isn't in this checkout.
