# Jay Jaym Live

Premium Fashion Live Shopping Experience.

## Project Purpose
Jay Jaym Live is an interactive live shopping platform designed to bridge the gap between high-end fashion and real-time customer engagement. It features LiveKit streaming, chat, Shopify integration, and social media simulcasting.

## Deployment Instructions (Vercel)

1. **Clone repo from GitHub:**
   ```bash
   git clone <your-repo-url>
   cd jay-jaym-live
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   Copy `.env.example` to `.env.local` and fill in the required values.
   ```bash
   cp .env.example .env.local
   ```
   *Note: In Vercel, add these variables via the Project Settings > Environment Variables dashboard.*

4. **Deploy to Vercel:**
   Push your code to your GitHub repository connected to Vercel. Vercel will automatically detect the `nextjs` framework and run `npm run build`.

5. **Configure domain:**
   Set up your custom domain in the Vercel project settings.

## Environment Variables
- `NEXT_PUBLIC_*`: Variables prefixed with this are exposed to the browser.
- All other variables are **server-only** and must never be exposed to the client.

## Future Self-Hosted LiveKit Server
While the application currently supports LiveKit Cloud, it is architected to support a self-hosted LiveKit server on Ubuntu/IONOS.

The server will run on Ubuntu using Docker.
1. Provision an Ubuntu server.
2. Install Docker and Docker Compose.
3. Use the provided configuration template in `/server/livekit-config.yaml`.
4. Update `LIVEKIT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` in your environment configuration to point to your new server's domain.
