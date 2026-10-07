# Watchless

Watchless helps you get the point of a YouTube video without sitting through all of it.

You paste a YouTube URL while signed in. The API accepts the request right away and hands the work to a background job, so you’re not waiting on a long HTTP request while audio downloads or speech recognition runs.

That job pulls the video’s audio, converts it for transcription, and sends it through speech-to-text. The resulting transcript is passed to an LLM, which returns a short summary plus structured extras (key points, topics, suggested tags, sentiment). Everything is stored against your account so you can open it again later.

Because transcription and analysis are expensive, Stripe-backed plans limit how many videos and how many minutes of audio you can process.

## What it does

### Accounts and email
- Register and log in with email and password; sessions use JWT access tokens
- Email verification on signup (token link), with a resend-verification flow
- Welcome email after a successful verify
- Transactional mail goes out through Resend (HTML templates in the API)
- Authenticated profile endpoint for the current user

### Video library
- Look up YouTube metadata (title, duration, author, thumbnail) before processing
- Start a transcription job from a URL and poll job status by id
- List your videos and open a single video with its transcript and analysis
- Optional download-audio endpoint for inspecting the extracted media path

### Transcription and analysis
- Audio download and conversion (FFmpeg), then speech-to-text via Google Cloud
- LLM analysis (Gemini) into summary, key points, topics, tags, and sentiment
- Work runs on a Bull queue backed by Redis so the API stays responsive
- Music-heavy content can be short-circuited when detected
- Usage is incremented against the user’s plan after a job is accepted

### Subscriptions and billing
- Catalog of plans (Basic / Premium / Pro) with video and minutes limits
- Stripe Checkout to subscribe; webhooks keep local subscription state in sync
- View current subscription, cancel at period end
- Route-level tier checks and pre-job limit checks so unpaid or over-limit users are blocked

### Local ops
- Docker Compose for Postgres and Redis
- TypeORM migrations and an idempotent plan seed
- Bull Board UI to inspect queued, active, and failed jobs in development

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

Defaults (unless you change them):

- API: `http://localhost:8080`
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

## API surface (high level)

- `GET /health` — health check
- `/auth` — register, login, verify email, current user
- `/videos` — video info, download audio, transcription jobs, job status, user library
- `/subscriptions` — plans, checkout, current subscription, cancel
- `POST /api/subscriptions/webhook` — Stripe webhooks (raw body; registered before JSON parsing)

Protected routes expect `Authorization: Bearer <token>`.
