# Watchless AI

Spend less time watching. Watchless turns any YouTube video into a transcript and a clear summary you can keep.

## How it works

When a signed-in user pastes a YouTube URL, the API accepts the request immediately and queues a background job so the client isn’t held on a long HTTP request while audio is downloaded and transcribed, then analyzed by AI.

That job pulls the video’s audio, converts it for transcription, and sends it through speech-to-text. The resulting transcript is passed to an LLM, which returns a short summary plus structured extras (key points, topics, suggested tags, sentiment). Everything is stored against your account so you can open it again later.

Because transcription and analysis are expensive, Stripe-backed plans limit how many videos and how many minutes of audio you can process.

## Features

Routes are under `/api`. Protected routes expect `Authorization: Bearer <token>`.

### Accounts and email

- `POST /auth/register` — create an account; sends a verification email
- `POST /auth/login` — sign in; returns a JWT
- `GET /auth/verify-email` — verify email via token query param
- `POST /auth/resend-verification` — resend the verification email
- `GET /auth/me` — current user profile
- Welcome email after a successful verify (Resend + HTML templates)

### Video library

- `GET /videos` — list the user’s videos
- `GET /videos/:id` — video detail with transcript and analysis
- `POST /videos/get-video-info` — YouTube metadata (title, duration, author, thumbnail)
- `POST /videos/download-audio` — extract audio for inspection
- `GET /videos/jobs/running` — running jobs for the user

### Transcription and AI analysis

- `POST /videos/transcribe-video` — enqueue transcription (requires Basic plan)
- `GET /videos/transcribe-video/:jobId/status` — poll job status
- Audio download/conversion (FFmpeg), speech-to-text (Google Cloud), then Gemini summary (key points, topics, tags, sentiment)
- Work runs on Bull + Redis so the API stays responsive; usage increments after a job is accepted
- Music-heavy content can be short-circuited when detected
- Blocks transcription requests when the user has no plan or has hit their video/minutes limit

### Stripe Subscriptions and billing

- `GET /subscriptions/subscription-plans` — public plan catalog (Basic / Premium / Pro)
- `GET /subscriptions/user-subscription` — current subscription
- `POST /subscriptions/create-checkout-session` — start Stripe Checkout
- `POST /subscriptions/cancel-subscription` — cancel at period end
- `POST /subscriptions/webhook` — Stripe webhooks (raw body, before JSON parsing)

### Health

- `GET /health` — health check

### Local ops

- Bull Board for queue inspection in development (`BULL_ADMIN_PORT`, `/admin/queues`)
- Docker Compose for Postgres and Redis; TypeORM migrations; idempotent plan seed

## Stack

| Area             | Choice                                     |
| ---------------- | ------------------------------------------ |
| Runtime          | Node.js, TypeScript                        |
| API              | Express                                    |
| Data             | PostgreSQL, TypeORM                        |
| Jobs             | Bull, Redis                                |
| Auth             | JWT, bcrypt                                |
| Email            | Resend                                     |
| Media            | youtube-dl-exec, FFmpeg                    |
| Speech / storage | Google Cloud Speech-to-Text, Cloud Storage |
| Summaries        | Google Gemini                              |
| Billing          | Stripe                                     |
| Local infra      | Docker Compose (Postgres, Redis)           |

## Prerequisites

- Node.js and npm
- Docker (for Postgres and Redis)
- FFmpeg available on the machine (or via the project’s FFmpeg installer dependency)
- Accounts / credentials as needed: Resend, Google Cloud (Storage + Speech), Gemini API key, Stripe

Speech and Storage need a GCP project with those APIs enabled and Application Default Credentials (or a service account). Stripe checkout needs real price IDs in env (`STRIPE_PRICE_*`) and webhook signing configured for local or deployed testing.

## Getting started

From the repo root:

```bash
npm install
npm run db:up
```

Then set up the API:

```bash
cd server
cp .env.example .env
# fill in .env
npm install
npm run migration:run
npm run dev
```

Defaults (unless you change them in `.env`):

- API: `http://localhost:8080` (set `PORT`; Zod default is `3000` if unset)
- Bull Board: `http://localhost:8081/admin/queues`

Subscription plans are seeded on API boot (idempotent upsert by plan name). You can also run:

```bash
cd server
npm run seed:subscription-plans
```

## Environment

Copy `server/.env.example` to `server/.env`. Required groups:

- App: `NODE_ENV`, `PORT`, `LOG_LEVEL`, `FRONTEND_URL`
- Database: `DB_*`
- Auth: `JWT_SECRET`, `JWT_EXPIRES_IN`
- Email: `RESEND_API_KEY`, `RESEND_EMAIL_SENDER`
- Google: `GOOGLE_API_KEY`, `GOOGLE_AI_MODEL`, optional `GOOGLE_APPLICATION_CREDENTIALS`, plus `GCS_*`
- Redis / Bull: `REDIS_HOST`, `REDIS_PORT`, `BULL_ADMIN_PORT`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_PRO`

## Useful scripts

**Root**

| Script            | Purpose                       |
| ----------------- | ----------------------------- |
| `npm run db:up`   | Start Postgres and Redis      |
| `npm run db:down` | Stop containers               |
| `npm run db:logs` | Tail database logs            |
| `npm run format`  | Format the repo with Prettier |

**Server** (`cd server`)

| Script                                 | Purpose                                  |
| -------------------------------------- | ---------------------------------------- |
| `npm run dev`                          | Start API in watch mode                  |
| `npm run build`                        | Compile TypeScript                       |
| `npm run start`                        | Run compiled output                      |
| `npm run migration:run`                | Apply migrations                         |
| `npm run migration:generate -- <path>` | Generate a migration from entity changes |
| `npm run seed:subscription-plans`      | Seed / update catalog plans              |
