import { Resend } from "resend";
import { logEmail } from "@/lib/email/logging";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — emails will be logged only");
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "contactus@gcpremierproperties.com";

/** Wrap email body HTML in a responsive document with mobile media queries */
function wrapEmail(bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>
@media only screen and (max-width:620px){
  .email-wrap{padding:0!important}
  .email-inner{border-radius:0!important}
  .email-pad{padding-left:20px!important;padding-right:20px!important}
  .email-margin{margin-left:20px!important;margin-right:20px!important}
  .email-logo{padding:32px 24px 0!important}
  .email-heading{padding-left:24px!important;padding-right:24px!important}
}
</style></head><body style="margin:0;padding:20px;background:#060911;-webkit-text-size-adjust:none" class="email-wrap">${bodyHtml}</body></html>`;
}

// ─── Contact Form ───────────────────────────────────────────────
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();

  // Email to owner
  const ownerHtml = `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Subject</td><td style="padding:8px;border-bottom:1px solid #eee">${data.subject || "No subject"}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px;white-space:pre-wrap">${data.message}</td></tr>
    </table>
  `;

  // Confirmation email to guest
  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="text-align:center;padding:24px 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Message Received</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">We'll be in touch shortly, ${data.name}.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Thank you for reaching out! We've received your message and will get back to you within <strong style="color:${GOLD}">24 hours</strong>.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Your Message</p>
        </div>
        <div style="padding:18px 24px">
          <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB};white-space:pre-wrap">${data.message}</p>
        </div>
      </div>
      <div class="email-margin" style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">In the meantime</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">Browse our <a href="https://gcpremierproperties.com/properties" style="color:${GOLD};text-decoration:none;font-weight:600">available properties</a> or check out our <a href="https://gcpremierproperties.com/blog" style="color:${GOLD};text-decoration:none;font-weight:600">blog</a> for local travel tips.</p>
      </div>
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Need to reach us?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Contact email (not sent):", data);
    return { success: true };
  }

  const [ownerResult, guestResult] = await Promise.all([
    resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.email,
      subject: `Contact Form: ${data.subject || data.name}`,
      html: ownerHtml,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `We received your message — G|C Premier Property Group`,
      html: wrapEmail(guestHtml),
    }),
  ]);

  // Log both emails
  await Promise.all([
    logEmail({ type: "contact-owner", to: NOTIFY_EMAIL, subject: `Contact Form: ${data.subject || data.name}`, status: "sent", recipientName: data.name, context: data.subject || "Contact form", html: ownerHtml }),
    logEmail({ type: "contact-confirmation", to: data.email, subject: "We received your message", status: "sent", recipientName: data.name, html: wrapEmail(guestHtml) }),
  ]);

  return { ownerResult, guestResult };
}

// ─── Assessment Form ────────────────────────────────────────────
export async function sendAssessmentEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: string;
  bathrooms: string;
  furnished: string;
  onAirbnb: string;
  notes: string;
}) {
  const resend = getResend();

  const html = `
    <h2>New Property Assessment Request</h2>
    <h3 style="color:#5CBF6E">Contact Information</h3>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.firstName} ${data.lastName}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.phone || "Not provided"}</td></tr>
    </table>
    <h3 style="color:#5CBF6E;margin-top:20px">Property Details</h3>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Address</td><td style="padding:8px;border-bottom:1px solid #eee">${data.address}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">City, State, Zip</td><td style="padding:8px;border-bottom:1px solid #eee">${data.city}, ${data.state} ${data.zip}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Bedrooms</td><td style="padding:8px;border-bottom:1px solid #eee">${data.bedrooms}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Bathrooms</td><td style="padding:8px;border-bottom:1px solid #eee">${data.bathrooms}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Furnished</td><td style="padding:8px;border-bottom:1px solid #eee">${data.furnished}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">On Airbnb/VRBO</td><td style="padding:8px;border-bottom:1px solid #eee">${data.onAirbnb}</td></tr>
    </table>
    ${data.notes ? `<h3 style="color:#5CBF6E;margin-top:20px">Additional Notes</h3><p style="white-space:pre-wrap">${data.notes}</p>` : ""}
  `;

  // Confirmation email to guest
  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="text-align:center;padding:24px 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Assessment Request Received</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">Thank you for your interest, ${data.firstName}.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We've received your property assessment request and our team will review your details within <strong style="color:${GOLD}">48 hours</strong>.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Property Submitted</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
              <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Address</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:${WHITE}">${data.address}</p>
              <p style="margin:4px 0 0;font-size:14px;color:${SUB}">${data.city}, ${data.state} ${data.zip}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="50%">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Bedrooms</p>
                  <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.bedrooms}</p>
                </td>
                <td width="50%">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Bathrooms</p>
                  <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.bathrooms}</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>
      <div class="email-margin" style="margin:0 40px 36px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">What Happens Next</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="28" style="vertical-align:top;padding-top:2px"><p style="margin:0;font-size:14px;font-weight:700;color:${GOLD}">1</p></td><td><p style="margin:0;font-size:14px;color:${SUB}">Our team reviews your property details</p></td></tr></table></td></tr>
          <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="28" style="vertical-align:top;padding-top:2px"><p style="margin:0;font-size:14px;font-weight:700;color:${GOLD}">2</p></td><td><p style="margin:0;font-size:14px;color:${SUB}">We'll reach out to schedule a walkthrough if needed</p></td></tr></table></td></tr>
          <tr><td style="padding:14px 24px"><table width="100%"><tr><td width="28" style="vertical-align:top;padding-top:2px"><p style="margin:0;font-size:14px;font-weight:700;color:${GOLD}">3</p></td><td><p style="margin:0;font-size:14px;color:${SUB}">You'll receive a personalized revenue estimate</p></td></tr></table></td></tr>
        </table>
      </div>
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Have questions in the meantime?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Assessment email (not sent):", data);
    return { success: true };
  }

  const [ownerResult, guestResult] = await Promise.all([
    resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.email,
      subject: `Property Assessment: ${data.firstName} ${data.lastName} — ${data.address}`,
      html,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: NOTIFY_EMAIL,
      subject: `We received your property assessment request — G|C Premier Property Group`,
      html: wrapEmail(guestHtml),
    }),
  ]);

  // Log both emails
  await Promise.all([
    logEmail({ type: "assessment-owner", to: NOTIFY_EMAIL, subject: `Property Assessment: ${data.firstName} ${data.lastName}`, status: "sent", recipientName: `${data.firstName} ${data.lastName}`, context: data.address, html }),
    logEmail({ type: "assessment-confirmation", to: data.email, subject: "Assessment request received", status: "sent", recipientName: `${data.firstName} ${data.lastName}`, context: data.address, html: wrapEmail(guestHtml) }),
  ]);

  return { ownerResult, guestResult };
}

// ─── Booking Confirmation ───────────────────────────────────────
export async function sendBookingConfirmation(data: {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  total: string;
}) {
  const resend = getResend();

  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <!-- Gold top bar -->
      <div style="height:3px;background:${GOLD}"></div>

      <!-- Logo -->
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>

      <!-- Heading -->
      <div style="text-align:center;padding:0 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Booking Confirmed</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">Your reservation is all set, ${data.guestName}.</p>
      </div>

      <!-- Personal message -->
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Thank you for choosing to stay with us. We are truly excited to host you and are committed to making your experience at <strong style="color:${GOLD}">${data.propertyTitle}</strong> comfortable and memorable.</p>
      </div>

      <!-- Reservation card -->
      <div class="email-margin" style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Reservation Details</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
              <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Property</p>
              <p style="margin:0;font-size:17px;font-weight:600;color:${WHITE}">${data.propertyTitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="50%" style="vertical-align:top">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in</p>
                  <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkIn}</p>
                </td>
                <td width="50%" style="vertical-align:top">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out</p>
                  <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkOut}</p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
              <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Guests</p>
              <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.guests} guest${Number(data.guests) > 1 ? "s" : ""}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Total Paid</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:28px;font-weight:700;color:${GOLD}">$${data.total}</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>

      <!-- What happens next -->
      <div class="email-margin" style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">What happens next?</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">We'll send you detailed check-in instructions closer to your arrival date with everything you need &mdash; door code, WiFi, parking, and more.</p>
      </div>

      <!-- Gold divider -->
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>

      <!-- Footer -->
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions about your stay?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  // Email to owner
  const ownerHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:28px 36px;border-bottom:1px solid ${RULE}">
        <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:${GOLD};font-weight:700">New Booking</p>
        <h2 style="margin:0;font-size:20px;font-weight:600;color:${WHITE};font-family:Georgia,'Times New Roman',serif">${data.propertyTitle}</h2>
      </div>
      <div style="padding:20px 36px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};color:${DIM};font-size:13px;width:90px">Guest</td>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};font-size:14px;font-weight:600;color:${WHITE}">${data.guestName}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};color:${DIM};font-size:13px">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};font-size:14px;color:${WHITE}"><a href="mailto:${data.guestEmail}" style="color:${GOLD};text-decoration:none">${data.guestEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};color:${DIM};font-size:13px">Check-in</td>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};font-size:14px;font-weight:600;color:${WHITE}">${data.checkIn}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};color:${DIM};font-size:13px">Check-out</td>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};font-size:14px;font-weight:600;color:${WHITE}">${data.checkOut}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};color:${DIM};font-size:13px">Guests</td>
            <td style="padding:10px 0;border-bottom:1px solid ${RULE};font-size:14px;font-weight:600;color:${WHITE}">${data.guests}</td>
          </tr>
          <tr>
            <td style="padding:14px 0 0;color:${DIM};font-size:13px">Total</td>
            <td style="padding:14px 0 0;font-size:22px;font-weight:700;color:${GOLD}">$${data.total}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Booking confirmation (not sent):", data);
    return { success: true };
  }

  // Send both emails
  const [guestResult, ownerResult] = await Promise.all([
    resend.emails.send({
      from: FROM_EMAIL,
      to: data.guestEmail,
      subject: `Booking Confirmed — ${data.propertyTitle}`,
      html: wrapEmail(guestHtml),
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.guestEmail,
      subject: `New Booking: ${data.guestName} — ${data.propertyTitle}`,
      html: ownerHtml,
    }),
  ]);

  // Log both emails
  await Promise.all([
    logEmail({ type: "booking-confirmation-guest", to: data.guestEmail, subject: `Booking Confirmed — ${data.propertyTitle}`, status: "sent", recipientName: data.guestName, context: `${data.propertyTitle} | ${data.checkIn} → ${data.checkOut}`, html: wrapEmail(guestHtml) }),
    logEmail({ type: "booking-confirmation-owner", to: NOTIFY_EMAIL, subject: `New Booking: ${data.guestName}`, status: "sent", recipientName: data.guestName, context: `${data.propertyTitle} | $${data.total}`, html: ownerHtml }),
  ]);

  return { guestResult, ownerResult };
}

// ─── Check-in Reminder ─────────────────────────────────────────
export async function sendCheckInReminderEmail(data: {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  wifiName: string;
  wifiPassword: string;
  doorCode: string;
  parkingInfo: string;
  houseRules: string;
  specialNotes: string;
}) {
  const resend = getResend();

  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const detailRows = [
    data.doorCode && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Door Code</p><p style="margin:0;font-size:22px;font-weight:700;color:${GOLD};letter-spacing:2px">${data.doorCode}</p></td></tr>`,
    data.wifiName && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Network</p><p style="margin:0;font-size:15px;font-weight:600;color:${WHITE}">${data.wifiName}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Password</p><p style="margin:0;font-size:15px;font-weight:600;color:${WHITE}">${data.wifiPassword}</p></td></tr></table></td></tr>`,
    data.checkInTime && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.checkInTime}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.checkOutTime}</p></td></tr></table></td></tr>`,
    data.parkingInfo && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Parking</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.parkingInfo}</p></td></tr>`,
  ].filter(Boolean).join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="text-align:center;padding:24px 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Your Stay is Coming Up!</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">Everything you need for your arrival, ${data.guestName}.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We're excited to welcome you to <strong style="color:${GOLD}">${data.propertyTitle}</strong>! Below you'll find your door code, WiFi details, and everything else you need for a seamless check-in.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Stay Details</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkIn}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkOut}</p></td></tr></table></td></tr>
        </table>
      </div>
      ${detailRows ? `
      <div class="email-margin" style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Access &amp; Info</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${detailRows}
        </table>
      </div>
      ` : ""}
      ${data.houseRules ? `
      <div class="email-margin" style="margin:0 40px 24px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">House Rules</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB};white-space:pre-wrap">${data.houseRules}</p>
      </div>
      ` : ""}
      ${data.specialNotes ? `
      <div class="email-margin" style="margin:0 40px 24px;padding:22px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">Special Notes</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);white-space:pre-wrap">${data.specialNotes}</p>
      </div>
      ` : ""}
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions about your stay?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Check-in reminder (not sent):", { guest: data.guestEmail, property: data.propertyTitle });
    return { success: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.guestEmail,
    replyTo: NOTIFY_EMAIL,
    subject: `Check-in Details — ${data.propertyTitle}`,
    html: wrapEmail(html),
  });

  await logEmail({ type: "check-in-reminder", to: data.guestEmail, subject: `Check-in Details — ${data.propertyTitle}`, status: "sent", recipientName: data.guestName, context: `${data.propertyTitle} | ${data.checkIn}`, html: wrapEmail(html) });

  return { success: true, result };
}

// ─── Review Request ────────────────────────────────────────────
export async function sendReviewRequestEmail(data: {
  guestName: string;
  guestEmail: string;
  propertyTitle: string;
  checkOut: string;
}) {
  const resend = getResend();

  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="text-align:center;padding:24px 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">How Was Your Stay?</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">We'd love to hear about your experience, ${data.guestName}.</p>
      </div>
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We hope you had a wonderful time at <strong style="color:${GOLD}">${data.propertyTitle}</strong>! Your feedback means the world to us and helps future guests find the perfect stay.</p>
      </div>
      <div style="text-align:center;margin:0 40px 28px">
        <a href="https://www.google.com/search?q=G%7CC+Premier+Property+Group+Jackson+MS+reviews" style="display:inline-block;background:#5CBF6E;color:#fff;text-decoration:none;padding:16px 44px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">
          Leave a Review
        </a>
        <p style="margin:14px 0 0;font-size:13px;color:${DIM}">It only takes a minute and we truly appreciate it!</p>
      </div>
      <div class="email-margin" style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">Had an issue during your stay? Reply to this email and we'll make it right.</p>
      </div>
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  if (!resend) {
    console.log("Review request (not sent):", { guest: data.guestEmail, property: data.propertyTitle });
    return { success: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: data.guestEmail,
    replyTo: NOTIFY_EMAIL,
    subject: `How was your stay at ${data.propertyTitle}?`,
    html: wrapEmail(html),
  });

  await logEmail({ type: "review-request", to: data.guestEmail, subject: `How was your stay at ${data.propertyTitle}?`, status: "sent", recipientName: data.guestName, context: data.propertyTitle, html: wrapEmail(html) });

  return { success: true, result };
}

// ─── Invoice ─────────────────────────────────────────────────
export async function sendInvoiceEmail(data: {
  recipientName: string;
  recipientEmail: string;
  description: string;
  lineItems: { description: string; quantity: number; unitPrice: number; amount: number }[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  processingFeeRate?: number;
  processingFeeAmount?: number;
  total: number;
  splitPayment?: boolean;
  depositPercentage?: number;
  depositAmount?: number;
  balanceAmount?: number;
  invoiceUrl: string;
}) {
  const resend = getResend();

  const GOLD = "#D4A853";
  const GOLD_DIM = "rgba(212,168,83,0.15)";
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const lineItemRows = data.lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:14px 24px;border-bottom:1px solid ${RULE}">
            <p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${item.description}</p>
            <p style="margin:4px 0 0;font-size:12px;color:${DIM}">${item.quantity} × $${item.unitPrice.toFixed(2)}</p>
          </td>
          <td style="padding:14px 24px;border-bottom:1px solid ${RULE};text-align:right;white-space:nowrap">
            <p style="margin:0;font-size:15px;font-weight:600;color:${WHITE}">$${item.amount.toFixed(2)}</p>
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <!-- Gold top bar -->
      <div style="height:3px;background:${GOLD}"></div>

      <!-- Logo -->
      <div style="padding:44px 48px 0;text-align:center" class="email-logo">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>

      <!-- Heading -->
      <div style="text-align:center;padding:0 48px 28px" class="email-heading">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Invoice</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">${data.description}</p>
      </div>

      <!-- Personal message -->
      <div class="email-margin" style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Hi <strong style="color:${GOLD}">${data.recipientName}</strong>, please find your invoice details below. Click the button to view and complete your payment securely through Stripe.</p>
      </div>

      <!-- Line items card -->
      <div class="email-margin" style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Invoice Details</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${lineItemRows}
          ${(data.taxRate ?? 0) > 0 ? `
          <tr>
            <td style="padding:14px 24px 0">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:13px;color:${SUB}">Subtotal</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:14px;color:${WHITE}">$${data.subtotal.toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 0">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:13px;color:${SUB}">Tax (${data.taxRate}%)</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:14px;color:${WHITE}">$${(data.taxAmount ?? 0).toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
          ${(data.processingFeeRate ?? 0) > 0 ? `
          ${(data.taxRate ?? 0) === 0 ? `
          <tr>
            <td style="padding:14px 24px 0">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:13px;color:${SUB}">Subtotal</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:14px;color:${WHITE}">$${data.subtotal.toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 24px 0">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:13px;color:${SUB}">Processing Fee (${data.processingFeeRate}%)</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:14px;color:${WHITE}">$${(data.processingFeeAmount ?? 0).toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:20px 24px">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Total Due</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:28px;font-weight:700;color:${GOLD}">$${data.total.toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>

      ${data.splitPayment && (data.depositAmount ?? 0) > 0 ? `
      <!-- Payment Schedule -->
      <div class="email-margin" style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Payment Schedule</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:14px 24px;border-bottom:1px solid ${RULE}">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:14px;font-weight:600;color:${GOLD}">Deposit (${data.depositPercentage}%)</p>
                  <p style="margin:4px 0 0;font-size:12px;color:${DIM}">Due now</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:18px;font-weight:700;color:${GOLD}">$${(data.depositAmount ?? 0).toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 24px">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:14px;font-weight:500;color:${SUB}">Balance (${100 - (data.depositPercentage ?? 0)}%)</p>
                  <p style="margin:4px 0 0;font-size:12px;color:${DIM}">Due upon completion</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:16px;font-weight:600;color:${SUB}">$${(data.balanceAmount ?? 0).toFixed(2)}</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align:center;margin:0 40px 36px">
        <a href="${data.invoiceUrl}" style="display:inline-block;background:${GOLD};color:#000;text-decoration:none;padding:16px 44px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">
          ${data.splitPayment ? 'View &amp; Pay Deposit' : 'View &amp; Pay'}
        </a>
        <p style="margin:14px 0 0;font-size:13px;color:${DIM}">Secure payment powered by Stripe</p>
      </div>

      <!-- Gold divider -->
      <div class="email-margin" style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>

      <!-- Footer -->
      <div class="email-pad" style="padding:28px 40px 44px;text-align:center">
        <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions about this invoice?</p>
        <p style="margin:0 0 20px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
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
    html: wrapEmail(html),
  });

  await logEmail({ type: "invoice", to: data.recipientEmail, subject: `Invoice — $${data.total.toFixed(2)}`, status: "sent", recipientName: data.recipientName, context: data.description, html: wrapEmail(html) });

  return { success: true, result };
}
