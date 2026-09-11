# Phase 1 — Foundation, Catalog & Design System

Building the first slice of the gaming marketplace: the visual system, the site shell, and a working product catalog. Later phases add cart/checkout, digital delivery, accounts, blog, and admin.

## Design system

Dark premium tech aesthetic, subtle gaming feel — no neon overload.

- Tokens for background `#0A0A0B`, secondary `#111214`, card `#151619`, border `#25272B`, text `#F5F5F5` / `#9B9CA1`, accent `#7C5CFC`, success/warning/error, all as semantic tokens.
- Type scale (hero, section, product title, body, metadata, price), one display + one text font.
- Radius scale 8 / 12 / 16 / 20, consistent spacing steps, motion durations 120/200/320ms with reduced-motion respected.

## Site shell

- Announcement bar: "Fast digital delivery · Secure checkout · Customer support".
- Sticky header: logo, Shop, Game Accounts, Game Cards, Gift Cards, Blog, Support, plus search, wishlist, cart, account. Becomes translucent and slightly shorter on scroll.
- Separate mobile navigation: menu, logo, search, cart with a slide-in drawer.
- Footer with store, support, legal, and social columns.

## Pages in this phase

- **Home** — hero ("Your Next Game Starts Here."), trust indicators, featured products, categories, how it works, best sellers, offers, newsletter, FAQ.
- **Shop** — product grid with search, category/platform/region/price filters, sorting, pagination, loading skeletons and empty states.
- **Category pages** — Game Accounts, Game Cards, Gift Cards, Digital Products.
- **Product detail** — gallery, price, platform/region/delivery attributes, stock state, description, redemption/terms, related products. No credential-bearing fields anywhere in public data.

Cart, checkout, and account buttons will be present but clearly deferred to the next phase rather than faked.

## Data

Enable the built-in backend and create categories and products tables with demo rows so the catalog is real from the first load. Product records carry type (game account, game card, gift card, digital product), platform, region, delivery method, price/sale price, stock status, featured/bestseller/new flags, and SEO fields. Public reads only; nothing sensitive is exposed.

## Technical notes

- Tokens in `src/styles.css` via `@theme inline`; fonts loaded through the root route head.
- Routes: `/`, `/shop`, `/category/$slug`, `/product/$slug`, each with its own title, description, and social tags.
- Catalog reads through server functions + TanStack Query, prefetched in route loaders for SSR-friendly, indexable pages.
- Row-level security with read-only public policies and explicit grants on new tables; demo rows inserted in the migration.
- Product imagery generated as artwork assets rather than stock placeholders.

## Not in this phase

Payments, order states, digital inventory allocation and delivery, customer accounts and library, wishlist persistence, reviews, coupons, support tickets, blog, notifications, admin dashboard.
