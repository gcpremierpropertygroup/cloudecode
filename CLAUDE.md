# CLAUDE.md — GC Premier Property Group Booking Site

## Project Overview

Full-stack booking and property management platform for G|C Premier Property Group, a short-term rental company in Jackson, Mississippi. Guests book properties directly; admins manage pricing, bookings, invoices, contracts, and email automation through a dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4, PostCSS
- **Payments:** Stripe (credit cards) + Venmo/Zelle QR codes
- **Email:** Resend
- **Database/Cache:** Upstash Redis (key-value storage for all persistent data)
- **Property Management:** Guesty API integration
- **Dynamic Pricing:** PriceLabs API
- **PDF Generation:** @react-pdf/renderer
- **Deployment:** Vercel (with cron jobs)
- **i18n:** English/Spanish via React Context

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript rules)
```

There are no automated tests configured. Validation is done via `npm run build` and `npm run lint`.

## Project Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    admin/                # Admin dashboard pages
    api/                  # API routes (see API section below)
    booking/              # Booking flow pages
    properties/           # Property listing/detail pages
    assessment/           # Property assessment pages
    blog/                 # Blog with dynamic routing
    contract/             # Contract pages
    invoice/              # Invoice pages
    management/           # Property management pages
    reviews/              # Reviews section
    layout.tsx            # Root layout (fonts, metadata, providers)
    page.tsx              # Homepage
    sitemap.ts            # SEO sitemap generation
    globals.css           # Global Tailwind styles
  components/
    admin/                # Admin UI (Discounts, Pricing, Analytics, etc.)
    layout/               # Navigation, Footer, ConditionalLayout
    home/                 # Homepage sections (Hero, About, CTA, Contact)
    properties/           # Property listing components
    property-detail/      # Property detail view components
    seo/                  # JSON-LD schema components
    ui/                   # Reusable components (Button, Logo, SectionTitle)
  i18n/                   # Language context + en.json/es.json translations
  lib/
    admin/                # Auth, config, pricing logic
    blog/                 # Blog content utilities
    contracts/            # Contract template utilities
    email/                # Email logging and scheduling
    guesty/               # Guesty API client and service
    ical/                 # iCal/calendar integration
    kv/                   # Upstash Redis client
    pdf/                  # PDF generation
    pricelabs/            # PriceLabs API integration
    promo/                # Promo code/discount logic
    stripe/               # Stripe payment client
    utils/                # Shared utilities (pricing, slugs, classnames, dates)
    constants.ts          # App-wide constants (pricing, discounts, invoice presets)
    email.ts              # Email template library (HTML templates)
  types/
    booking.ts            # Booking, pricing, calendar types
    promo.ts              # Promotional code types
    property.ts           # Property definition types
public/
  images/                 # Product photos, logos, assets
```

## API Routes

**Admin routes** (`/api/admin/*`) — Protected by Bearer token auth (`ADMIN_PASSWORD` env var). Use `isAuthorized()` from `/lib/admin/auth.ts`.

Key admin endpoints: bookings, stats, emails, email-preview, invoices, contracts, blog, pricing-rules, base-prices, prices, cleaning-fees, discounts, property-settings, checkin-instructions, competitors, backup.

**Guest-facing routes:**
- `POST /api/booking/calculate` — Price calculation
- `POST /api/booking/create-session` — Stripe checkout session
- `POST /api/booking/webhook` — Stripe payment webhook
- `GET /api/properties/:id/calendar` — Availability calendar
- `POST /api/contact` — Contact form submission

**Cron:** `GET /api/cron/emails` — Daily email scheduling (runs 9 AM UTC via Vercel cron)

## Key Architecture Patterns

### Data Storage
All persistent data lives in Upstash Redis using generic `getConfig`/`setConfig` functions. Bookings use sorted sets with date-based indexing for range queries.

### Authorization
Admin routes use Bearer token validation via `isAuthorized()` in `src/lib/admin/auth.ts`. A single `ADMIN_PASSWORD` env var controls access.

### Pricing
`computePriceBreakdown()` in `src/lib/utils/pricing.ts` handles all price calculations — base rates from Guesty calendar, custom discounts with date ranges, promo codes, service fees (10% default), and cleaning fees.

### Email
Templates are defined as HTML strings in `src/lib/email.ts`. Emails are sent via Resend, logged to Redis, and can be scheduled via cron. Types include: booking confirmation, check-in reminders, review requests, invoice notifications.

### i18n
Client-side React Context (`src/i18n/LanguageContext.tsx`) with JSON translation files. Language preference persists in localStorage. Falls back to English.

### Services
External API integrations follow a service layer pattern:
- `GuestyService` (class-based) — property listings, calendar, pricing
- PriceLabs module — dynamic pricing adjustments
- `getStripeClient()` — Stripe singleton
- Resend — email delivery

## Naming Conventions

- **Components:** PascalCase files and exports (e.g., `BookingsSection.tsx`)
- **Utilities/services:** camelCase files and functions (e.g., `pricing.ts`, `computePriceBreakdown`)
- **Types:** PascalCase interfaces in `/src/types/` (e.g., `StoredBooking`, `PriceBreakdown`)
- **Constants:** UPPER_SNAKE_CASE in `src/lib/constants.ts`
- **Route handlers:** Exported named functions (`GET`, `POST`) in `route.ts` files
- **Path alias:** Use `@/*` which maps to `./src/*`

## Environment Variables

Required for the application to function:

```
ADMIN_PASSWORD        # Bearer token for admin API auth
STRIPE_SECRET_KEY     # Stripe API key
NEXT_PUBLIC_BASE_URL  # Base URL (default: https://www.gcpremierproperties.com)
RESEND_API_KEY        # Resend email service key
RESEND_FROM_EMAIL     # Sender email address
NOTIFY_EMAIL          # Admin notification email
KV_REST_API_URL       # Upstash Redis REST API URL
KV_REST_API_TOKEN     # Upstash Redis REST API token
GUESTY_API_KEY        # Guesty property management API key
PRICELABS_API_KEY     # PriceLabs dynamic pricing API key
```

## Code Style Guidelines

- TypeScript strict mode is enforced — no `any` types without justification
- Use Tailwind CSS utility classes for styling; avoid inline styles or CSS modules
- Components are organized by feature domain under `src/components/`
- Use `cn()` from `src/lib/utils/cn.ts` (clsx + tailwind-merge) for conditional class merging
- Date handling uses `date-fns` — do not use raw `Date` methods for formatting/manipulation
- All API routes return typed JSON responses
- Image sources must be allowlisted in `next.config.ts` remote patterns (Guesty, Cloudinary, Muscache)

## Deployment

- **Platform:** Vercel
- **Cron jobs:** Defined in `vercel.json` — email scheduling at 9 AM UTC
- **Image optimization:** AVIF and WebP formats enabled
- **Remote image patterns:** Configured in `next.config.ts` for Guesty, Cloudinary, Muscache CDNs
