# Weekend Walla

A simple app to find weekend events across Indian cities. Built with Vite, React, TypeScript, Tailwind, and shadcn-ui.

## Getting Started

1. Install dependencies
   npm install

2. Copy the env template and fill in your own Supabase project values
   cp .env.example .env

3. Start the dev server
   npm run dev

4. Build for production
   npm run build

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings > API) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (Project Settings > API) |

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui
- Supabase (edge function for fetching events)

## Notes
- API keys (e.g., SerpAPI) should be configured in Supabase environment for the edge function.

