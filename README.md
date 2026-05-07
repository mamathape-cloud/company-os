# CompanyOS

CompanyOS is a full-stack company management platform built with Next.js 14, MongoDB, and MUI.

## Local Setup

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env.local`
3. Fill required values in `.env.local` (`MONGODB_URI`, `JWT_SECRET`, and others).
4. Start development server:
   - `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Use the keys defined in `.env.example`:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Vercel Deployment

1. Push code to your Git provider.
2. Import repository into Vercel.
3. Configure all environment variables in Vercel project settings.
4. Ensure MongoDB Atlas network access allows Vercel serverless functions (`0.0.0.0/0` or scoped safe ranges).
5. Deploy from `main` branch for production; use preview deployments for feature branches.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
