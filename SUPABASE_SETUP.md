# Shared Reviews Setup

This makes reviews visible on every device instead of only on the device that submitted them.

## 1. Create the Supabase project

1. Go to https://supabase.com and create a new project.
2. Open the project dashboard.
3. Go to **Project Settings > API**.
4. Keep this page open. You will need:
   - **Project URL**
   - **anon public key**

## 2. Create the reviews table

In Supabase, open **SQL Editor**, create a new query, paste this, then click **Run**.

```sql
create table if not exists public.reviews (
  id text primary key,
  name text not null check (char_length(name) between 1 and 80),
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 1 and 2000),
  photo_url text,
  photo_name text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
on public.reviews
for select
to anon
using (true);

drop policy if exists "Anyone can add reviews" on public.reviews;
create policy "Anyone can add reviews"
on public.reviews
for insert
to anon
with check (
  char_length(name) between 1 and 80
  and rating between 1 and 5
  and char_length(review_text) between 1 and 2000
);
```

## 3. Create the review photo storage bucket

Still in **SQL Editor**, run this second query.

```sql
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can read review photos" on storage.objects;
create policy "Anyone can read review photos"
on storage.objects
for select
to anon
using (bucket_id = 'review-photos');

drop policy if exists "Anyone can upload review photos" on storage.objects;
create policy "Anyone can upload review photos"
on storage.objects
for insert
to anon
with check (bucket_id = 'review-photos');
```

Do not add a public delete policy. Live reviews should be removed inside your Supabase dashboard, otherwise anyone could inspect the website code and copy the delete request.

## 4. Add your keys to the site

Open `assets/js/config.js` and fill in this section:

```js
supabase: {
  url: "PASTE_YOUR_PROJECT_URL_HERE",
  anonKey: "PASTE_YOUR_ANON_PUBLIC_KEY_HERE",
  reviewsTable: "reviews",
  reviewPhotosBucket: "review-photos"
},
```

Use the **Project URL** and **anon public key** from **Project Settings > API**.

## 5. Test it

1. Open `reviews.html`.
2. Submit a review without a photo.
3. Refresh the page.
4. Open Supabase **Table Editor > reviews** and check the review is there.
5. Submit another review with a photo.
6. Check Supabase **Storage > review-photos** and confirm the image uploaded.
7. Open the site on another device. The same reviews should appear there too.

## Removing a live review

For live Supabase reviews:

1. Open Supabase.
2. Go to **Table Editor > reviews**.
3. Find the review row.
4. Delete that row.
5. If the review had a photo, go to **Storage > review-photos** and delete the matching folder.

The hidden `1234` review manager is still useful for old local test reviews, but live published reviews should be managed in Supabase.
