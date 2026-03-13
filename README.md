# Jay Jaym Live

A premium fashion live shopping experience built with Next.js, LiveKit, and Shopify.

## Features

- **Real-time Video & Audio**: Powered by LiveKit for ultra-low latency streaming.
- **Live Chat**: Real-time chat using LiveKit Data Channels.
- **Viewer Count**: Accurate participant tracking.
- **Shopify Integration**: Server-side only integration with Shopify Storefront API.
- **Premium UI**: Glassmorphism design, smooth animations, and mobile-first approach.
- **PWA Ready**: Configured for mobile web app installation.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React
- LiveKit
- Shopify Storefront API

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your credentials:
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_ACCESS_TOKEN`
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `NEXT_PUBLIC_LIVEKIT_URL`
4. Run the development server: `npm run dev`

## Architecture Rules Followed

- No Express Server
- No Socket.io Server
- No custom Node backend
- No secrets in the client
- All Shopify calls are server-side
- Realtime exclusively via LiveKit
- Fully Vercel compatible

## Host Login

- **Password**: `jayjaym2026`
