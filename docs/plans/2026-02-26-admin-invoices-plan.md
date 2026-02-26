# Admin Invoice Tool — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an invoice creation tool to the admin dashboard that generates branded payment pages and sends email notifications via Stripe + Resend.

**Architecture:** New "Invoices" tab in admin sidebar. Invoices stored in Upstash Redis. Public `/invoice/[id]` page shows branded invoice details with "Pay Now" button that creates a Stripe Checkout Session. Existing webhook extended to mark invoices as paid.

**Tech Stack:** Next.js App Router, Stripe Checkout Sessions, Upstash Redis, Resend, Tailwind CSS, Lucide icons.

---

### Task 1: Invoice Type Definition

**Files:**
- Modify: `src/types/booking.ts` (append to end of file)

**Step 1: Add the Invoice type**

Add to the end of `src/types/booking.ts`:

```typescript
export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  status: "pending" | "paid" | "expired";
  recipientName: string;
  recipientEmail: string;
  description: string;
  lineItems: InvoiceLineItem[];
  total: number;
  currency: string;
  propertyId?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  stripeSessionId?: string;
}
```

**Step 2: Commit**

```bash
git add src/types/booking.ts
git commit -m "feat: add Invoice type definition"
```

---

### Task 2: Invoice Description Presets

**Files:**
- Modify: `src/lib/constants.ts` (append to end of file)

**Step 1: Add preset descriptions**

Add to the end of `src/lib/constants.ts`:

```typescript
export const INVOICE_DESCRIPTION_PRESETS = [
  {
    group: "Property & Repairs",
    options: [
      "Property Repair",
      "Maintenance Service",
      "Plumbing Service",
      "Electrical Work",
      "HVAC Service",
      "Lawn Care / Landscaping",
      "Appliance Repair / Replacement",
      "Painting / Touch-Up",
    ],
  },
  {
    group: "Guest Charges",
    options: [
      "Cleaning Fee",
      "Deep Cleaning Fee",
      "Early Check-in Fee",
      "Late Check-out Fee",
      "Damage Charge",
      "Key Replacement",
      "Lost Item Fee",
      "Pet Fee",
      "Extra Guest Fee",
    ],
  },
  {
    group: "Management & Services",
    options: [
      "Property Management Fee",
      "Consultation Fee",
      "Property Inspection",
      "Furniture / Supplies",
      "Security Deposit",
    ],
  },
];
```

**Step 2: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add invoice description presets"
```

---

### Task 3: Admin Invoice API — Create & List

**Files:**
- Create: `src/app/api/admin/invoices/route.ts`

**Step 1: Create the API route**

This route handles:
- `POST` — create a new invoice, store in Redis, optionally send email
- `GET` — list all invoices

```typescript
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import { getRedisClient } from "@/lib/kv/client";
import { sendInvoiceEmail } from "@/lib/email";
import type { Invoice } from "@/types/booking";

function generateInvoiceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "inv_";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipientName, recipientEmail, description, lineItems, propertyId, notes, sendEmail } = body;

    if (!recipientName || !recipientEmail || !description || !lineItems?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const total = lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const id = generateInvoiceId();

    const invoice: Invoice = {
      id,
      status: "pending",
      recipientName,
      recipientEmail,
      description,
      lineItems,
      total,
      currency: "usd",
      propertyId: propertyId || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    // Save to Redis
    await setConfig(`invoice:${id}`, invoice);
    const redis = getRedisClient();
    await redis.zadd("invoices:index", {
      score: Date.now(),
      member: id,
    });

    // Build the invoice URL
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const invoiceUrl = `${baseUrl}/invoice/${id}`;

    // Optionally send email
    if (sendEmail) {
      try {
        await sendInvoiceEmail({
          recipientName,
          recipientEmail,
          description,
          lineItems,
          total,
          invoiceUrl,
        });
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
        // Don't fail the creation — invoice is still saved
      }
    }

    return NextResponse.json({ invoice, invoiceUrl });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedisClient();
    const invoiceIds = await redis.zrange("invoices:index", 0, -1, { rev: true });

    const invoices: Invoice[] = [];
    await Promise.all(
      invoiceIds.map(async (id) => {
        const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);
        if (invoice) invoices.push(invoice);
      })
    );

    // Sort newest first
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to load invoices:", error);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/invoices/route.ts
git commit -m "feat: add admin invoices API (create + list)"
```

---

### Task 4: Invoice Email Function

**Files:**
- Modify: `src/lib/email.ts` (append new function)

**Step 1: Add the sendInvoiceEmail function**

Append to `src/lib/email.ts`, following the same patterns as `sendBookingConfirmation`:

```typescript
// ─── Invoice ─────────────────────────────────────────────────
export async function sendInvoiceEmail(data: {
  recipientName: string;
  recipientEmail: string;
  description: string;
  lineItems: { description: string; amount: number }[];
  total: number;
  invoiceUrl: string;
}) {
  const resend = getResend();

  const lineItemRows = data.lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:rgba(255,255,255,0.7)">${item.description}</td>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;text-align:right;font-weight:600">$${item.amount.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const BRAND = "#D4A853";
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0D1117;color:#ffffff">
      <!-- Header -->
      <div style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0 0 16px;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35)">G|C Premier Property Group</p>
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff">Invoice</h1>
        <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.4)">${data.description}</p>
      </div>

      <!-- Line items -->
      <div style="padding:32px 40px">
        <p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${lineItemRows}
          <tr>
            <td style="padding:16px;font-size:14px;font-weight:700;color:#fff">Total</td>
            <td style="padding:16px;font-size:22px;font-weight:700;color:${BRAND};text-align:right">$${data.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="padding:0 40px 40px;text-align:center">
        <a href="${data.invoiceUrl}" style="display:inline-block;background:${BRAND};color:#000;text-decoration:none;padding:14px 40px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">
          View &amp; Pay
        </a>
      </div>

      <!-- Footer -->
      <div style="padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.35)">Questions?</p>
        <p style="margin:0;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${BRAND};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.15);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${BRAND};text-decoration:none">(601) 966-8308</a>
        </p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Invoice email (not sent):", { recipient: data.recipientEmail, total: data.total });
    return { success: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    replyTo: NOTIFY_EMAIL,
    subject: `Invoice from G|C Premier Property Group — $${data.total.toFixed(2)}`,
    html,
  });

  return { success: true, result };
}
```

**Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add invoice email function"
```

---

### Task 5: Public Invoice API — Get & Checkout

**Files:**
- Create: `src/app/api/invoices/[id]/route.ts`
- Create: `src/app/api/invoices/[id]/checkout/route.ts`

**Step 1: Create the public get-invoice endpoint**

`src/app/api/invoices/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Failed to get invoice:", error);
    return NextResponse.json({ error: "Failed to get invoice" }, { status: 500 });
  }
}
```

**Step 2: Create the checkout endpoint**

`src/app/api/invoices/[id]/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/admin/config";
import { getStripeClient } from "@/lib/stripe/client";
import type { Invoice } from "@/types/booking";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: invoice.recipientEmail,
      line_items: invoice.lineItems.map((item) => ({
        price_data: {
          currency: invoice.currency,
          product_data: { name: item.description },
          unit_amount: Math.round(item.amount * 100),
        },
        quantity: 1,
      })),
      metadata: {
        type: "invoice",
        invoiceId: invoice.id,
        recipientName: invoice.recipientName,
        recipientEmail: invoice.recipientEmail,
        description: invoice.description,
        total: String(invoice.total),
      },
      success_url: `${baseUrl}/invoice/${id}?paid=true`,
      cancel_url: `${baseUrl}/invoice/${id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Invoice checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/invoices
git commit -m "feat: add public invoice API (get + checkout)"
```

---

### Task 6: Extend Stripe Webhook for Invoice Payments

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts`

**Step 1: Add invoice handling to the webhook**

Inside the existing `switch (event.type)` block, extend the `checkout.session.completed` case. After the existing booking handling code (before the `break;`), add an invoice check:

```typescript
        // ─── Invoice payment ──────────────────────────────────────
        if (meta?.type === "invoice" && meta?.invoiceId) {
          try {
            const invoice = await getConfig<Invoice | null>(`invoice:${meta.invoiceId}`, null);
            if (invoice && invoice.status !== "paid") {
              invoice.status = "paid";
              invoice.paidAt = new Date().toISOString();
              invoice.stripeSessionId = session.id;
              await setConfig(`invoice:${meta.invoiceId}`, invoice);
              console.log(`Invoice ${meta.invoiceId} marked as paid`);
            }
          } catch (invoiceError) {
            console.error("Failed to update invoice:", invoiceError);
          }
        }
```

Also add the import at the top of the file:

```typescript
import type { Invoice } from "@/types/booking";
```

**Step 2: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat: handle invoice payments in Stripe webhook"
```

---

### Task 7: Public Invoice Page

**Files:**
- Create: `src/app/invoice/[id]/page.tsx`
- Create: `src/app/invoice/[id]/InvoicePageClient.tsx`

**Step 1: Create the server page component**

`src/app/invoice/[id]/page.tsx`:

```typescript
import type { Metadata } from "next";
import { getConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";
import InvoicePageClient from "./InvoicePageClient";

export const metadata: Metadata = {
  title: "Invoice | G|C Premier Property Group",
};

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const { paid } = await searchParams;
  const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

  return <InvoicePageClient invoice={invoice} justPaid={paid === "true"} />;
}
```

**Step 2: Create the client component**

`src/app/invoice/[id]/InvoicePageClient.tsx`:

This is a branded page matching the dark theme with:
- G|C logo
- Invoice details (recipient, date, description)
- Line items table with amounts
- Total
- Status badge
- "Pay Now" button (pending) or "Paid" confirmation (paid)
- Loading state while redirecting to Stripe

The component follows the same Tailwind styling patterns as the rest of the site (dark backgrounds `bg-[#111827]`, gold accents, Playfair Display font for headings, etc.).

The "Pay Now" button calls `POST /api/invoices/[id]/checkout` and redirects to the returned Stripe URL via `window.location.href`.

If `justPaid` is true, show a success state with a checkmark icon and "Payment Received" message.

If invoice is null, show a "Invoice not found" message.

**Step 3: Commit**

```bash
git add src/app/invoice
git commit -m "feat: add public branded invoice page"
```

---

### Task 8: Admin Invoices Component

**Files:**
- Create: `src/components/admin/InvoicesSection.tsx`

**Step 1: Create the admin component**

This component has two views toggled by state:

**Create view (default):**
- Form fields: recipientName, recipientEmail (text inputs)
- Description: `<select>` dropdown with grouped `<optgroup>` presets from `INVOICE_DESCRIPTION_PRESETS` constant, plus a "Custom" option that reveals a text input
- Line items: dynamic list of `{ description, amount }` rows with add/remove buttons
- Auto-calculated total displayed
- Optional: propertyId dropdown (hardcoded property list from constants), notes textarea
- Two buttons: "Create & Send Email" (sendEmail=true) and "Create Only" (sendEmail=false)
- After creation: show success message with copyable invoice URL (click-to-copy)

**List view:**
- Table with columns: date, recipient, description, total, status badge
- Each row has a "Copy Link" button and a "Resend Email" option
- Status badges: gold/pending, green/paid

Follows the exact same Tailwind patterns as `BookingsSection.tsx`:
- `bg-[#1F2937] border border-white/10 rounded-lg` for cards/tables
- `text-gold` for active states
- Same table header styles with `text-xs font-bold tracking-[2px] uppercase text-white/40`
- Same button styles

**Step 2: Commit**

```bash
git add src/components/admin/InvoicesSection.tsx
git commit -m "feat: add admin invoices section component"
```

---

### Task 9: Wire Invoices Tab into Admin Dashboard

**Files:**
- Modify: `src/app/admin/page.tsx`

**Step 1: Add the import and tab**

1. Add import at top:
```typescript
import InvoicesSection from "@/components/admin/InvoicesSection";
import { Receipt } from "lucide-react";
```

2. Add `"invoices"` to the `TabId` union type.

3. Add to the "Bookings" nav group items array (after "bookings"):
```typescript
{ id: "invoices", label: "Invoices", icon: Receipt },
```

4. Add the tab content render in the main content area (after the bookings conditional):
```typescript
{activeTab === "invoices" && <InvoicesSection token={token} />}
```

**Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: wire invoices tab into admin dashboard"
```

---

### Task 10: Admin Resend Email Endpoint

**Files:**
- Create: `src/app/api/admin/invoices/resend/route.ts`

**Step 1: Create the resend endpoint**

This endpoint re-sends the invoice email for an existing invoice:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig } from "@/lib/admin/config";
import { sendInvoiceEmail } from "@/lib/email";
import type { Invoice } from "@/types/booking";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { invoiceId } = await request.json();
    const invoice = await getConfig<Invoice | null>(`invoice:${invoiceId}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const invoiceUrl = `${baseUrl}/invoice/${invoice.id}`;

    await sendInvoiceEmail({
      recipientName: invoice.recipientName,
      recipientEmail: invoice.recipientEmail,
      description: invoice.description,
      lineItems: invoice.lineItems,
      total: invoice.total,
      invoiceUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resend invoice email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/invoices/resend/route.ts
git commit -m "feat: add invoice email resend endpoint"
```

---

### Task 11: End-to-End Smoke Test

**Step 1: Start the dev server**

```bash
npm run dev
```

**Step 2: Test the admin flow**

1. Go to `/admin`, log in
2. Navigate to Invoices tab
3. Create an invoice with line items
4. Verify the copyable URL appears
5. Visit the invoice URL in a new tab
6. Verify the branded invoice page loads with correct details
7. Click "Pay Now" — verify it redirects to Stripe checkout

**Step 3: Test the list view**

1. Go back to admin Invoices tab
2. Switch to list view
3. Verify the invoice appears with "pending" status
4. Test "Copy Link" and "Resend Email" buttons

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete admin invoice tool with branded payment page"
```
