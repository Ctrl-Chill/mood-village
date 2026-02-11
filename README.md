This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Events Tab Backend Setup (Supabase)

The Events tab is wired to `/api/events` and `/api/events/[eventId]/rsvp` with:
- Supabase mode when env vars are available
- In-memory fallback mode when Supabase is not configured

1. Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional for server-side privileged writes:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Run SQL setup in Supabase SQL editor:
- `supabase/profile_auth_schema.sql` (profile/auth + lantern tables/policies)
- `supabase/events_schema.sql`
- Optional standalone lantern script: `supabase/lantern_schema.sql`

3. Start app:

```bash
npm run dev
```

If Supabase is configured, the Events page will show `Live DB`; otherwise it shows `Memory fallback`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
