# SS2Cal

SS2Cal makes use of multimodal LLMs to transform a screenshot (or any image!) into an ICS file, which can then be imported into digital calendars.

The design is usable but not good on mobile resolutions. This is best used in a recent desktop browser.

[View developer manual](#developer-manual)

# Developer Manual

### Installation

This project uses OpenAI (via Azure), Supabase, Vercel, Typed.js and ical.js

1. Install with `npm i`

2. Create a Supabase project and get your API endpoint, Anon and Superuser keys

3. Create an OpenAI Azure project and get your API endpoint and key

4. Replace API keys
  - Supabase endpoint and anon key in `src/main.ts`
  - Supabase endpoint and admin key in lines 9 and 10 in `supabase/functions/share_cal/index.ts`
  - Supabase endpoint and admin key in lines 9 and 10 in `supabase/functions/download_cal/index.ts`
  - OpenAI endpoint and key in `supabase/functions/gen_calendar/index.ts`

5. Create a Vercel project and link the repo (the default settings should work)

6. Deploy Supabase with `supabase deploy functions --no-verify-jwt`

7. Run this SQL code to initialize Supabase

```sql
CREATE TABLE calendar_files (
  id uuid not null default uuid_generate_v4(),
  context text not null,
  created_at timestamp with time zone not null default now()
);

alter table calendar_files enable row level security;
```

### Useful Commands

`npm run dev` - run a live debug version of the frontend

### API Endpoints

- `/gen_calendar` accepts a Base64-encoded image and returns a string of an iCal file
- `/share_cal` accepts a iCal string and inserts it into the database which returns the ID of the row
- `/download_cal` gets the ID of the row from the URL and returns a download of the iCal string as a file