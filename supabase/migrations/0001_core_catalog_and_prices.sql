-- Core catalog and price observations.
--
-- Two ideas drive this schema:
--
--   1. Product identity is layered. A barcode identifies a *package* (Heinz
--      ketchup, 32 oz squeeze bottle), not a product concept (ketchup). Brand
--      and size comparison walks up to the concept and back down to siblings,
--      so the concept layer has to exist even though no barcode names it.
--
--   2. A price is an *observation*, not an attribute. Every row records who
--      saw what, where, when, and how. Scrapes, loyalty syncs, receipt OCR and
--      user submissions all land in the same table and are told apart by
--      `source`, never by living in separate tables.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------- catalog

create table brands (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

-- What a shopper means when they say "ketchup". Comparison happens here.
create table product_concepts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null,
  -- Every package of a concept must be sold in this dimension; you cannot
  -- rank $/g against $/ml, so the constraint belongs at the concept.
  dimension   text not null check (dimension in ('mass', 'volume', 'count')),
  created_at  timestamptz not null default now(),
  unique (name, category)
);

-- A specific sellable package. This is what a barcode resolves to.
create table packages (
  id            uuid primary key default uuid_generate_v4(),
  concept_id    uuid not null references product_concepts (id) on delete cascade,
  brand_id      uuid references brands (id) on delete set null,
  -- GTIN-14, zero-padded, so UPC-A/EAN-13/EAN-8 all share one key space.
  gtin          text unique check (gtin ~ '^[0-9]{14}$'),
  display_name  text not null,
  -- Total sellable amount in the package: a 6-pack of 12 floz cans is 72.
  size          numeric not null check (size > 0),
  unit          text not null check (unit in ('g','kg','oz','lb','ml','l','floz','gal','ct')),
  -- Set when the package is separable (a 6-pack); null for a single unit.
  pack_count    integer check (pack_count is null or pack_count > 0),
  -- Null until a moderator or scrape confirms a user-submitted package.
  verified_at   timestamptz,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index packages_concept_idx on packages (concept_id);
create index packages_brand_idx on packages (brand_id);

-- ----------------------------------------------------------------- stores

create table retailers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  -- Whether this retailer supports linking a loyalty account for member pricing.
  supports_loyalty boolean not null default false,
  created_at  timestamptz not null default now()
);

create table stores (
  id            uuid primary key default uuid_generate_v4(),
  retailer_id   uuid not null references retailers (id) on delete cascade,
  -- Retailer's own store number, for reconciling scrapes against a location.
  external_id   text,
  address       text not null,
  latitude      double precision not null check (latitude between -90 and 90),
  longitude     double precision not null check (longitude between -180 and 180),
  created_at    timestamptz not null default now(),
  unique (retailer_id, external_id)
);

create index stores_geo_idx on stores (latitude, longitude);

-- -------------------------------------------------------------- price obs

-- Ordered loosely by trust. Ranking prefers a fresher observation, but breaks
-- near-ties toward the more trustworthy source.
create type price_source as enum (
  'scrape',        -- pulled from the retailer
  'loyalty_sync',  -- pulled against a linked member account
  'receipt_ocr',   -- read off a photographed receipt
  'user_report'    -- typed in by a user
);

create table price_observations (
  id            uuid primary key default uuid_generate_v4(),
  package_id    uuid not null references packages (id) on delete cascade,
  store_id      uuid not null references stores (id) on delete cascade,
  -- Integer cents; never float. Currency is USD for now.
  price_cents   integer not null check (price_cents >= 0),
  -- Member pricing is a distinct observation of the same package and store,
  -- not a separate column, so both can be shown and compared side by side.
  is_member_price boolean not null default false,
  source        price_source not null,
  observed_at   timestamptz not null,
  reported_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index price_obs_lookup_idx
  on price_observations (package_id, store_id, observed_at desc);
create index price_obs_store_idx on price_observations (store_id, observed_at desc);

-- The current price per (package, store, member/public), which is what every
-- comparison reads. Kept as a view so ingestion stays append-only and the
-- observation history survives for trend and staleness display.
create view current_prices as
select distinct on (package_id, store_id, is_member_price)
  package_id,
  store_id,
  is_member_price,
  price_cents,
  source,
  observed_at
from price_observations
order by package_id, store_id, is_member_price, observed_at desc, source;

-- ------------------------------------------------------------------- rls
--
-- Catalog and prices are world-readable: comparison has to work before signup.
-- Writes require an account, and a user may only edit rows they created.

alter table brands enable row level security;
alter table product_concepts enable row level security;
alter table packages enable row level security;
alter table retailers enable row level security;
alter table stores enable row level security;
alter table price_observations enable row level security;

create policy "catalog is public" on brands for select using (true);
create policy "catalog is public" on product_concepts for select using (true);
create policy "catalog is public" on packages for select using (true);
create policy "catalog is public" on retailers for select using (true);
create policy "catalog is public" on stores for select using (true);
create policy "prices are public" on price_observations for select using (true);

create policy "signed-in users may add packages" on packages
  for insert to authenticated with check (auth.uid() = created_by);
create policy "authors may edit unverified packages" on packages
  for update to authenticated
  using (auth.uid() = created_by and verified_at is null)
  with check (auth.uid() = created_by);

create policy "signed-in users may report prices" on price_observations
  for insert to authenticated with check (auth.uid() = reported_by);
