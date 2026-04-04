# Deployment Guide

## Hosting: Vercel

This project is designed to deploy on [Vercel](https://vercel.com).

### First-Time Setup

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Vercel auto-detects Next.js — no framework settings needed
4. Add all environment variables (see below)
5. Deploy

### Environment Variables

Set these in **Vercel Dashboard > Project Settings > Environment Variables**.

#### Required

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g. `https://jartides.ca`) | Your domain |

#### Payments

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) | Stripe Dashboard > API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) | Stripe Dashboard > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) | Stripe Dashboard > Webhooks |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID | PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | PayPal Developer Dashboard |

#### Shipping

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `SHIPPO_API_TOKEN` | Shippo API token | Shippo Dashboard > API |

#### Email

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `RESEND_API_KEY` | Resend API key | Resend Dashboard > API Keys |
| `RESEND_DOMAIN` | Sending domain (e.g. `jartides.ca`) | Resend Dashboard > Domains |

#### Rate Limiting

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Upstash Console |

#### Monitoring & Analytics

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID (`G-...`) | GA4 Admin > Data Streams |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | Sentry Project Settings |

### Webhooks

After deploying, set up webhooks pointing to your production URL:

| Service | Webhook URL | Events |
|---------|------------|--------|
| **Stripe** | `https://www.jartides.ca/api/webhooks/stripe` | `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded` |
| **Shippo** | `https://www.jartides.ca/api/webhooks/shippo` | Track status updates |
| **Resend** | `https://www.jartides.ca/api/webhooks/resend` | `email.bounced`, `email.complained`, `email.delivered` |

### Custom Domain

1. Vercel Dashboard > Project Settings > Domains
2. Add `jartides.ca`
3. Update DNS records as instructed by Vercel (typically an A record or CNAME)
4. Vercel provisions SSL automatically

### Deployment Workflow

- **Production**: Every push to `main` triggers a production deployment
- **Preview**: Every PR gets a preview deployment with a unique URL
- **CI checks**: GitHub Actions runs lint, build, and E2E tests before merge (see `.github/workflows/ci.yml`)

## Pre-Launch Checklist

- [ ] All environment variables set in Vercel (use **production** keys, not test keys)
- [ ] Stripe webhook configured with production URL and correct events
- [ ] Shippo webhook configured with production URL
- [ ] `NEXT_PUBLIC_SITE_URL` set to `https://jartides.ca`
- [ ] Supabase PITR backups enabled (see `BACKUP-STRATEGY.md`)
- [ ] DNS configured and SSL verified
- [ ] Resend domain verified and DNS records (SPF, DKIM) set up
- [ ] Test a full purchase flow end-to-end on the production URL
- [ ] Verify age gate, cookie consent, and all policy pages render
- [ ] Check Sentry is receiving errors (trigger a test error)
- [ ] Check Google Analytics is tracking (visit site, check real-time report)
