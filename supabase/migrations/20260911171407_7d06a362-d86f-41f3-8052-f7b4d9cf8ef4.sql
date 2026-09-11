CREATE TYPE public.product_type AS ENUM ('GAME_ACCOUNT','GAME_CARD','GIFT_CARD','DIGITAL_PRODUCT');
CREATE TYPE public.stock_status AS ENUM ('IN_STOCK','LOW_STOCK','OUT_OF_STOCK','PREORDER');

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'gamepad-2',
  image_key text NOT NULL DEFAULT 'generic',
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  product_type public.product_type NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  currency text NOT NULL DEFAULT 'USD',
  platform text,
  game text,
  region text,
  delivery_method text NOT NULL DEFAULT 'Instant digital delivery',
  stock_status public.stock_status NOT NULL DEFAULT 'IN_STOCK',
  image_key text NOT NULL DEFAULT 'generic',
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  redemption_instructions text,
  terms text,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_type_idx ON public.products(product_type);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active categories are publicly viewable" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (name, slug, description, icon, image_key, sort_order, seo_title, seo_description) VALUES
('Game Accounts','game-accounts','Transferable game accounts with verified progress, where resale is permitted by the publisher.','user-round','account',1,'Game Accounts — Verified Digital Gaming Accounts','Browse transferable game accounts with verified progress and clear platform and region details.'),
('Game Cards','game-cards','Platform wallet top-ups and game cards delivered digitally.','credit-card','playstation',2,'Game Cards — Wallet Top-Ups & Platform Credit','Top up your platform wallet with digital game cards for PlayStation, Xbox, Nintendo and Steam.'),
('Gift Cards','gift-cards','Digital gift cards for the major gaming platforms and stores.','gift','giftcard',3,'Gift Cards — Digital Gaming Gift Cards','Send digital gaming gift cards with instant delivery and clear region information.'),
('Digital Products','digital-products','Subscriptions, currency packs and other digital gaming essentials.','package','digital',4,'Digital Products — Subscriptions & Currency Packs','Shop digital gaming subscriptions, currency packs and other approved digital products.');

INSERT INTO public.products (name, slug, category_id, product_type, short_description, description, price, sale_price, platform, game, region, delivery_method, stock_status, image_key, tags, rating, review_count, is_featured, is_bestseller, is_new, redemption_instructions, terms, seo_title, seo_description)
SELECT v.name, v.slug, c.id, v.product_type::public.product_type, v.short_description, v.description, v.price, v.sale_price, v.platform, v.game, v.region, v.delivery_method, v.stock_status::public.stock_status, v.image_key, v.tags, v.rating, v.review_count, v.is_featured, v.is_bestseller, v.is_new, v.redemption_instructions, v.terms, v.seo_title, v.seo_description
FROM (VALUES
('PlayStation Store Card $50','playstation-store-card-50','game-cards','GAME_CARD','PSN wallet top-up worth $50, delivered digitally.','Add $50 to your PlayStation Network wallet and spend it on games, add-ons, subscriptions and more. The code is delivered digitally after payment is confirmed.',50.00,47.50,'PlayStation',NULL,'US','Instant digital delivery','IN_STOCK','playstation',ARRAY['playstation','wallet','top-up'],4.8,412,true,true,false,'Sign in to your PlayStation account, open the Store, choose Redeem Codes and enter the 12-character code.','Region locked to US accounts. Codes cannot be exchanged for cash.','PlayStation Store Card $50 (US) — Instant Delivery','Buy a $50 PlayStation Store card for US accounts with fast digital delivery and secure checkout.'),
('Xbox Gift Card $25','xbox-gift-card-25','gift-cards','GIFT_CARD','$25 of Xbox store credit for games and subscriptions.','Use $25 of Xbox credit towards games, add-ons and subscriptions across Xbox consoles and Windows.',25.00,NULL,'Xbox',NULL,'US','Instant digital delivery','IN_STOCK','xbox',ARRAY['xbox','gift card'],4.7,268,true,true,false,'Go to xbox.com/redeemcode, sign in and enter the 25-character code.','Region locked to US accounts. Non-refundable once redeemed.','Xbox Gift Card $25 (US) — Digital Code','Buy a $25 Xbox digital gift card for US accounts with instant delivery.'),
('Nintendo eShop Card $35','nintendo-eshop-card-35','game-cards','GAME_CARD','$35 of Nintendo eShop credit for Switch games.','Top up your Nintendo Account with $35 of eShop credit for Switch games, DLC and Nintendo Switch Online.',35.00,33.00,'Nintendo',NULL,'US','Instant digital delivery','IN_STOCK','nintendo',ARRAY['nintendo','switch','eshop'],4.6,151,true,false,true,'Open the eShop on your Switch, select Enter Code and type the 16-character code.','Region locked to US Nintendo Accounts.','Nintendo eShop Card $35 (US) — Digital Code','Buy a $35 Nintendo eShop card for US accounts with fast digital delivery.'),
('Steam Wallet Code $20','steam-wallet-code-20','game-cards','GAME_CARD','$20 of Steam wallet credit, delivered digitally.','Add $20 to your Steam wallet and use it for games, in-game items and software on Steam.',20.00,NULL,'Steam',NULL,'Global','Instant digital delivery','IN_STOCK','steam',ARRAY['steam','pc','wallet'],4.9,689,true,true,false,'Open Steam, go to Games then Redeem a Steam Wallet Code and enter the code.','Wallet credit cannot be transferred between accounts.','Steam Wallet Code $20 — Instant Digital Delivery','Buy a $20 Steam wallet code with instant digital delivery and secure checkout.'),
('Steam Wallet Code $50','steam-wallet-code-50','game-cards','GAME_CARD','$50 of Steam wallet credit for PC gaming.','Add $50 to your Steam wallet for games, DLC and in-game purchases.',50.00,48.00,'Steam',NULL,'Global','Instant digital delivery','LOW_STOCK','steam',ARRAY['steam','pc','wallet'],4.8,317,false,true,false,'Open Steam, go to Games then Redeem a Steam Wallet Code and enter the code.','Wallet credit cannot be transferred between accounts.','Steam Wallet Code $50 — Instant Digital Delivery','Buy a $50 Steam wallet code with fast digital delivery.'),
('PlayStation Plus 12 Months','playstation-plus-12-months','digital-products','DIGITAL_PRODUCT','A full year of PlayStation Plus membership.','Twelve months of PlayStation Plus with online multiplayer, monthly games and cloud storage.',79.99,69.99,'PlayStation',NULL,'US','Instant digital delivery','IN_STOCK','playstation',ARRAY['subscription','playstation plus'],4.7,224,true,true,false,'Redeem the code in the PlayStation Store under Redeem Codes.','Region locked to US accounts. Cannot be stacked with some promotional memberships.','PlayStation Plus 12 Months (US) — Digital Membership','Buy a 12-month PlayStation Plus membership code for US accounts.'),
('Xbox Game Pass Ultimate 3 Months','xbox-game-pass-ultimate-3-months','digital-products','DIGITAL_PRODUCT','Three months of Game Pass Ultimate across console and PC.','Three months of Xbox Game Pass Ultimate with hundreds of games, online multiplayer and cloud gaming.',49.99,44.99,'Xbox',NULL,'US','Instant digital delivery','IN_STOCK','xbox',ARRAY['subscription','game pass'],4.8,398,true,true,true,'Redeem at xbox.com/redeemcode while signed in to your account.','Not valid for accounts with an active converted subscription.','Xbox Game Pass Ultimate 3 Months — Digital Code','Buy a 3-month Xbox Game Pass Ultimate code with fast digital delivery.'),
('Nintendo Switch Online Family 12 Months','nintendo-switch-online-family','digital-products','DIGITAL_PRODUCT','A year of Switch Online for up to eight accounts.','Twelve months of Nintendo Switch Online Family membership, covering up to eight Nintendo Accounts.',34.99,NULL,'Nintendo',NULL,'US','Instant digital delivery','IN_STOCK','nintendo',ARRAY['subscription','nintendo'],4.5,96,false,false,true,'Redeem the code through the eShop on your Switch or your Nintendo Account page.','Region locked to US Nintendo Accounts.','Nintendo Switch Online Family 12 Months — Digital Code','Buy a 12-month Nintendo Switch Online Family membership code.'),
('Level 200 MMO Account — EU','mmo-account-level-200-eu','game-accounts','GAME_ACCOUNT','High-level MMO account with rare mounts and full storage.','A transferable MMO account on EU servers with a level 200 main character, several rare mounts and a well-stocked inventory. Credentials are only shared after payment is confirmed.',189.00,169.00,'PC','Aetheria Online','EU','Manual delivery within 24 hours','LOW_STOCK','account',ARRAY['mmo','high level','eu'],4.4,58,true,false,false,NULL,'Sold only where publisher terms permit account transfer. Change the password and recovery details immediately after transfer.','Level 200 MMO Account (EU) — Verified Transfer','Buy a verified level 200 MMO account on EU servers with clear transfer details.'),
('Competitive FPS Account — Ranked Ready','fps-account-ranked-ready','game-accounts','GAME_ACCOUNT','Ranked-eligible FPS account with a large skin collection.','A ranked-ready competitive FPS account with completed placement requirements and an extensive cosmetic collection. No sensitive account details are shown before purchase.',129.00,NULL,'PC','Vector Strike','NA','Manual delivery within 24 hours','IN_STOCK','account',ARRAY['fps','ranked','skins'],4.3,41,false,false,true,NULL,'Sold only where publisher terms permit account transfer. Rank and cosmetics are as described at time of listing.','Competitive FPS Account (NA) — Ranked Ready','Buy a ranked-ready competitive FPS account with a verified cosmetic collection.'),
('Starter RPG Account — Fresh Progress','rpg-account-starter','game-accounts','GAME_ACCOUNT','Early-progress RPG account for a quick start.','An early-progress RPG account with the tutorial completed and starter resources banked, ideal for jumping straight into the main story.',39.00,34.00,'PC','Ember Chronicles','Global','Manual delivery within 24 hours','IN_STOCK','account',ARRAY['rpg','starter'],4.1,27,false,false,false,NULL,'Sold only where publisher terms permit account transfer.','Starter RPG Account — Fresh Progress','Buy an early-progress RPG account with starter resources and fast manual delivery.'),
('Roblox Gift Card $25','roblox-gift-card-25','gift-cards','GIFT_CARD','$25 gift card for Robux and premium.','A $25 Roblox digital gift card for Robux, Premium or avatar items.',25.00,NULL,'Roblox',NULL,'US','Instant digital delivery','IN_STOCK','giftcard',ARRAY['roblox','gift card'],4.6,204,false,true,false,'Redeem at roblox.com/redeem while signed in.','Region locked to US accounts.','Roblox Gift Card $25 — Digital Code','Buy a $25 Roblox digital gift card with instant delivery.'),
('Google Play Gift Card $50','google-play-gift-card-50','gift-cards','GIFT_CARD','$50 for mobile games and in-app purchases.','A $50 Google Play digital gift card for mobile games, in-app purchases and apps.',50.00,48.50,'Android',NULL,'US','Instant digital delivery','IN_STOCK','giftcard',ARRAY['mobile','gift card'],4.5,173,false,false,false,'Open the Google Play Store, tap Payments and subscriptions, then Redeem code.','Region locked to US accounts.','Google Play Gift Card $50 — Digital Code','Buy a $50 Google Play digital gift card with fast delivery.'),
('Apple Gift Card $25','apple-gift-card-25','gift-cards','GIFT_CARD','$25 for App Store games and subscriptions.','A $25 Apple digital gift card for App Store games, Arcade and subscriptions.',25.00,NULL,'iOS',NULL,'US','Instant digital delivery','OUT_OF_STOCK','giftcard',ARRAY['mobile','gift card','apple'],4.4,88,false,false,false,'Redeem in the App Store under your account, or at apple.com/redeem.','Region locked to US accounts.','Apple Gift Card $25 — Digital Code','Buy a $25 Apple digital gift card for App Store games and subscriptions.'),
('Battle Royale Currency Pack — 5000','battle-royale-currency-5000','digital-products','DIGITAL_PRODUCT','5000 in-game currency for skins and battle passes.','A 5000-unit in-game currency pack for battle passes, skins and emotes, delivered as a digital code.',39.99,36.99,'Multi-platform','Storm Arena','Global','Instant digital delivery','IN_STOCK','digital',ARRAY['currency','battle royale'],4.6,312,false,true,false,'Redeem the code in the in-game store under Redeem Code.','Currency is tied to the redeeming account and cannot be transferred.','Battle Royale Currency Pack 5000 — Digital Code','Buy a 5000 in-game currency pack with instant digital delivery.'),
('PlayStation Store Card $100','playstation-store-card-100','game-cards','GAME_CARD','PSN wallet top-up worth $100.','Add $100 to your PlayStation Network wallet for games, add-ons and subscriptions.',100.00,96.00,'PlayStation',NULL,'US','Instant digital delivery','IN_STOCK','playstation',ARRAY['playstation','wallet','top-up'],4.8,142,false,false,true,'Sign in to your PlayStation account, open the Store, choose Redeem Codes and enter the code.','Region locked to US accounts.','PlayStation Store Card $100 (US) — Digital Code','Buy a $100 PlayStation Store card for US accounts with fast digital delivery.')
) AS v(name, slug, category_slug, product_type, short_description, description, price, sale_price, platform, game, region, delivery_method, stock_status, image_key, tags, rating, review_count, is_featured, is_bestseller, is_new, redemption_instructions, terms, seo_title, seo_description)
JOIN public.categories c ON c.slug = v.category_slug;