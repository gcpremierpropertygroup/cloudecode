# Admin Invoice Tool — Design Document

**Date:** 2026-02-26
**Approach:** B — Branded invoice page on site + Stripe Checkout for payment

## Overview

A tool in the admin dashboard to create invoices, send payment links via email, and let recipients pay through a branded invoice page on the site using Stripe Checkout.

## Data Model

Invoice stored in Redis at `invoice:{id}`:

```typescript
interface Invoice {
  id: string;                // "inv_" + nanoid
  status: "pending" | "paid" | "expired";
  recipientName: string;
  recipientEmail: string;
  description: string;       // Selected from presets or custom
  lineItems: { description: string; amount: number }[];
  total: number;             // Sum of line items
  currency: "usd";
  propertyId?: string;       // Optional link to a property
  notes?: string;            // Optional notes shown on invoice
  createdAt: string;         // ISO date
  paidAt?: string;           // Set when payment completes
  stripeSessionId?: string;  // Set after checkout.session.completed
}
```

Redis keys:
- `invoice:{id}` — invoice object
- `invoices:index` — sorted set (score = createdAt timestamp, member = id)

## Description Presets

The description field is a dropdown with presets + a blank custom option:

**Property & Repairs:**
- Property Repair
- Maintenance Service
- Plumbing Service
- Electrical Work
- HVAC Service
- Lawn Care / Landscaping
- Appliance Repair / Replacement
- Painting / Touch-Up

**Guest Charges:**
- Cleaning Fee
- Deep Cleaning Fee
- Early Check-in Fee
- Late Check-out Fee
- Damage Charge
- Key Replacement
- Lost Item Fee
- Pet Fee
- Extra Guest Fee

**Management & Services:**
- Property Management Fee
- Consultation Fee
- Property Inspection
- Furniture / Supplies
- Security Deposit

**Other:**
- Custom (blank text input)

## Admin UI

New "Invoices" tab in admin sidebar under the Bookings nav group.

### Create Invoice Form
- Recipient name + email fields
- Description dropdown (presets + custom blank)
- Dynamic line items: add/remove rows, each with description + amount
- Auto-calculated total
- Optional: property dropdown, notes textarea
- "Create & Send" button — creates invoice + sends email + shows copyable link
- "Create Only" button — creates invoice + shows copyable link (no email)

### Invoice List
- Table: date, recipient, description, total, status badge (pending/paid)
- Click row to view details + copy link
- Resend email button per row

## API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/admin/invoices` | Admin token | Create invoice (optionally send email) |
| GET | `/api/admin/invoices` | Admin token | List all invoices |
| GET | `/api/invoices/[id]` | Public | Get invoice details for payment page |
| POST | `/api/invoices/[id]/checkout` | Public | Create Stripe checkout session |

## Public Invoice Page — `/invoice/[id]`

Branded page matching the dark theme:
- G|C logo at top
- Invoice details: recipient, date, description
- Line items table with amounts
- Total
- Status badge (pending / paid)
- "Pay Now" button (if pending) — creates Stripe checkout, redirects
- After payment — redirects to `/invoice/[id]?paid=true` showing confirmation

## Email

Sent via Resend:
- Subject: "Invoice from G|C Premier Property Group"
- Branded HTML email with invoice summary (description, line items, total)
- "View & Pay" button linking to `/invoice/[id]`

## Stripe Webhook

Extend existing `checkout.session.completed` handler:
- Check for `metadata.type === "invoice"` and `metadata.invoiceId`
- Update invoice status to "paid", set `paidAt` and `stripeSessionId`

## Tech Stack (existing)

- **Stripe** — checkout sessions + webhooks
- **Upstash Redis** — invoice storage
- **Resend** — email delivery
- **Next.js App Router** — pages + API routes
