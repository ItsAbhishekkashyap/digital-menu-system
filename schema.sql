/*
  =============================================================================
  🍔 RestroSaaS - Database Setup Script
  =============================================================================
  INSTRUCTIONS FOR THE BUYER:
  1. Go to your Supabase Dashboard -> SQL Editor.
  2. Paste this entire file into the editor.
  3. Click "Run" (bottom right).
  4. Success! Your database and storage are now ready.
  =============================================================================
*/

-- ============================================================================
-- STEP 1: CREATE TABLES
-- We create tables in specific order to handle relationships (Foreign Keys).
-- ============================================================================

-- 1. PROFILES
-- This table links directly to Supabase Auth (auth.users).
-- It holds user details like Full Name and Role.
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text default 'owner', -- Can be 'admin', 'owner', 'staff'
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.profiles is 'Public profile data for users.';


-- 2. RESTAURANTS
-- The main table. Each restaurant belongs to one Owner (Profile).
create table public.restaurants (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  subdomain text unique not null, -- The unique URL identifier (e.g., 'my-cafe')
  logo_url text,
  theme text default 'light',
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. MENU SECTIONS
-- Categories like "Starters", "Main Course", "Drinks".
create table public.menu_sections (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4. MENU ITEMS
-- The actual food items (Pizza, Burger, etc.) inside a section.
create table public.menu_items (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references public.menu_sections(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  is_featured boolean default false,
  is_visible boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 5. TAGS
-- Labels like "Spicy", "Vegan", "GF".
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  color text default '#000000',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 6. BADGES
-- Global badges like "Bestseller", "New Arrival", "Chef Special".
create table public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 7. MENU ITEM TAGS (Junction Table)
-- Connects Items <-> Tags (Many-to-Many relationship).
create table public.menu_item_tags (
  menu_item_id uuid references public.menu_items(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (menu_item_id, tag_id)
);


-- 8. ITEM BADGES (Junction Table)
-- Connects Items <-> Badges (Many-to-Many relationship).
create table public.item_badges (
  item_id uuid references public.menu_items(id) on delete cascade not null,
  badge_id uuid references public.badges(id) on delete cascade not null,
  primary key (item_id, badge_id)
);


-- ============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS)
-- This ensures users can't edit data that doesn't belong to them.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;
alter table public.tags enable row level security;
alter table public.badges enable row level security;
alter table public.menu_item_tags enable row level security;
alter table public.item_badges enable row level security;


-- ============================================================================
-- STEP 3: CREATE SECURITY POLICIES
-- Defining "Who can do What".
-- ============================================================================

-- -------- PROFILES --------
create policy "Allow individual access to own profile" 
on public.profiles for all 
using ( auth.uid() = id );


-- -------- RESTAURANTS --------
-- Owners can edit their own restaurant. Everyone can VIEW restaurants.
create policy "Allow access to own restaurant" 
on public.restaurants for all 
using ( auth.uid() = owner_id );

create policy "Allow restaurant insert" 
on public.restaurants for insert 
with check ( auth.uid() = owner_id );

create policy "Enable read access for all users" 
on public.restaurants for select 
using ( true );


-- -------- MENU SECTIONS --------
-- You can only edit sections if you own the restaurant.
create policy "Allow access to sections of own restaurant" 
on public.menu_sections for all 
using ( exists (
  select 1 from public.restaurants 
  where restaurants.id = menu_sections.restaurant_id 
  and restaurants.owner_id = auth.uid()
));

create policy "Enable insert for authenticated users only" 
on public.menu_sections for insert 
to authenticated 
with check ( true );

create policy "Enable read access for all users" 
on public.menu_sections for select 
using ( true );


-- -------- MENU ITEMS --------
-- You can only edit items if you own the restaurant they belong to.
create policy "Allow access to items of own restaurant" 
on public.menu_items for all 
using ( exists (
  select 1 from public.menu_sections 
  join public.restaurants on restaurants.id = menu_sections.restaurant_id 
  where menu_sections.id = menu_items.section_id 
  and restaurants.owner_id = auth.uid()
));

create policy "Enable read access for all users" 
on public.menu_items for select 
using ( true );


-- -------- TAGS --------
create policy "All authenticated users to manage tags" 
on public.tags for all 
to authenticated 
using ( true );

create policy "Enable read access for all users" 
on public.tags for select 
using ( true );


-- -------- BADGES --------
create policy "Enable read access for all users" 
on public.badges for select 
using ( true );


-- -------- MENU ITEM TAGS --------
create policy "Allow owners to delete item tags" 
on public.menu_item_tags for delete 
using ( true );

create policy "Allow owners to insert item tags" 
on public.menu_item_tags for insert 
with check ( true );

create policy "Allow owners to update item tags" 
on public.menu_item_tags for update 
using ( true );

create policy "Enable read access for all users" 
on public.menu_item_tags for select 
using ( true );


-- -------- ITEM BADGES --------
create policy "Allow badge edits on own items" 
on public.item_badges for all 
using ( true );

create policy "Enable read access for all users" 
on public.item_badges for select 
using ( true );


-- ============================================================================
-- STEP 4: STORAGE BUCKETS (File Uploads)
-- This creates the folders for images automatically.
-- ============================================================================

-- Create the bucket for Restaurant Logos
insert into storage.buckets (id, name, public) 
values ('restaurant-logos', 'restaurant-logos', true)
on conflict (id) do nothing; -- Prevents error if bucket already exists

-- Create the bucket for Food Images
insert into storage.buckets (id, name, public) 
values ('menu-item-images', 'menu-item-images', true)
on conflict (id) do nothing;


-- ============================================================================
-- STEP 5: STORAGE POLICIES
-- Allow public to SEE images, but only logged-in users to UPLOAD.
-- ============================================================================

-- Policies for 'restaurant-logos'
create policy "Public Access Logos" 
on storage.objects for select 
using ( bucket_id = 'restaurant-logos' );

create policy "Authenticated Upload Logos" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'restaurant-logos' );

-- Policies for 'menu-item-images'
create policy "Public Access Menu Items" 
on storage.objects for select 
using ( bucket_id = 'menu-item-images' );

create policy "Authenticated Upload Menu Items" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'menu-item-images' );

/* =============================================================================
  ✅ END OF SCRIPT
  If you see "Success" in the results, your backend is fully configured.
  =============================================================================
*/