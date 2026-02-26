import { Resend } from "resend";

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
  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">Message Received</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="color:#333">Hi ${data.name},</p>
        <p style="color:#333">Thank you for reaching out! We've received your message and will get back to you within 24 hours.</p>
        <div style="background:#f9f9f9;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
          <p style="margin:0 0 4px;font-weight:bold;color:#333">Your message:</p>
          <p style="margin:0;color:#555;white-space:pre-wrap">${data.message}</p>
        </div>
        <p style="color:#333">In the meantime, feel free to browse our <a href="https://gcpremierproperties.com/properties" style="color:#5CBF6E;text-decoration:none;font-weight:bold">available properties</a> or check out our <a href="https://gcpremierproperties.com/blog" style="color:#5CBF6E;text-decoration:none;font-weight:bold">blog</a> for local travel tips.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
        <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
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
      html: guestHtml,
    }),
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
  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">Assessment Request Received</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="color:#333">Hi ${data.firstName},</p>
        <p style="color:#333">Thank you for your interest in our property management services! We've received your assessment request and our team will review your property details within 48 hours.</p>
        <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">What happens next?</h3>
        <ol style="color:#333;padding-left:20px;line-height:1.8">
          <li>Our team reviews your property details</li>
          <li>We'll reach out to schedule a walkthrough if needed</li>
          <li>You'll receive a personalized revenue estimate</li>
        </ol>
        <div style="background:#f9f9f9;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
          <p style="margin:0 0 4px;font-weight:bold;color:#333">Property submitted:</p>
          <p style="margin:0;color:#555">${data.address}, ${data.city}, ${data.state} ${data.zip}</p>
          <p style="margin:4px 0 0;color:#555">${data.bedrooms} bed${data.bedrooms !== "1" ? "s" : ""} | ${data.bathrooms} bath${data.bathrooms !== "1" ? "s" : ""}</p>
        </div>
        <p style="color:#333">Have questions in the meantime? Reply to this email or call us at <strong>(601) 966-8308</strong>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
        <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
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
      html: guestHtml,
    }),
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
      <div style="padding:44px 48px 0;text-align:center">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>

      <!-- Gold ornament -->
      <div style="padding:24px 0;text-align:center">
        <span style="color:${GOLD};font-size:18px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
      </div>

      <!-- Heading -->
      <div style="text-align:center;padding:0 48px 28px">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Booking Confirmed</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">Your reservation is all set, ${data.guestName}.</p>
      </div>

      <!-- Personal message -->
      <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Thank you for choosing to stay with us. We are truly excited to host you and are committed to making your experience at <strong style="color:${GOLD}">${data.propertyTitle}</strong> comfortable and memorable.</p>
      </div>

      <!-- Reservation card -->
      <div style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
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
      <div style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">What happens next?</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">We'll send you detailed check-in instructions closer to your arrival date with everything you need &mdash; door code, WiFi, parking, and more.</p>
      </div>

      <!-- Gold divider -->
      <div style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>

      <!-- Footer -->
      <div style="padding:28px 40px 44px;text-align:center">
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
      html: guestHtml,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: data.guestEmail,
      subject: `New Booking: ${data.guestName} — ${data.propertyTitle}`,
      html: ownerHtml,
    }),
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
    data.doorCode && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Door Code</p><p style="margin:0;font-size:20px;font-weight:700;color:${WHITE};font-family:monospace;letter-spacing:3px">${data.doorCode}</p></td></tr>`,
    data.wifiName && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Network</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.wifiName}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Password</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE};font-family:monospace">${data.wifiPassword}</p></td></tr></table></td></tr>`,
    data.checkInTime && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.checkInTime}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.checkOutTime}</p></td></tr></table></td></tr>`,
    data.parkingInfo && `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Parking</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${data.parkingInfo}</p></td></tr>`,
  ].filter(Boolean).join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
      <div style="height:3px;background:${GOLD}"></div>
      <div style="padding:44px 48px 0;text-align:center">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="padding:24px 0;text-align:center">
        <span style="color:${GOLD};font-size:18px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
      </div>
      <div style="text-align:center;padding:0 48px 28px">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Your Stay is Coming Up!</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">Everything you need for your arrival, ${data.guestName}.</p>
      </div>
      <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We're excited to welcome you to <strong style="color:${GOLD}">${data.propertyTitle}</strong>! Below you'll find your door code, WiFi details, and everything else you need for a seamless check-in.</p>
      </div>
      <div style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Stay Details</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkIn}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${data.checkOut}</p></td></tr></table></td></tr>
        </table>
      </div>
      ${detailRows ? `
      <div style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Access &amp; Info</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${detailRows}
        </table>
      </div>
      ` : ""}
      ${data.houseRules ? `
      <div style="margin:0 40px 24px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">House Rules</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB};white-space:pre-wrap">${data.houseRules}</p>
      </div>
      ` : ""}
      ${data.specialNotes ? `
      <div style="margin:0 40px 24px;padding:22px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:10px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">Special Notes</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);white-space:pre-wrap">${data.specialNotes}</p>
      </div>
      ` : ""}
      <div style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div style="padding:28px 40px 44px;text-align:center">
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
    html,
  });

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
      <div style="padding:44px 48px 0;text-align:center">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>
      <div style="padding:24px 0;text-align:center">
        <span style="color:${GOLD};font-size:18px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
      </div>
      <div style="text-align:center;padding:0 48px 28px">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">How Was Your Stay?</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">We'd love to hear about your experience, ${data.guestName}.</p>
      </div>
      <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We hope you had a wonderful time at <strong style="color:${GOLD}">${data.propertyTitle}</strong>! Your feedback means the world to us and helps future guests find the perfect stay.</p>
      </div>
      <div style="text-align:center;margin:0 40px 28px">
        <a href="https://www.google.com/search?q=G%7CC+Premier+Property+Group+Jackson+MS+reviews" style="display:inline-block;background:#5CBF6E;color:#fff;text-decoration:none;padding:16px 44px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">
          Leave a Review
        </a>
        <p style="margin:14px 0 0;font-size:13px;color:${DIM}">It only takes a minute and we truly appreciate it!</p>
      </div>
      <div style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
        <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">Had an issue during your stay? Reply to this email and we'll make it right.</p>
      </div>
      <div style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>
      <div style="padding:28px 40px 44px;text-align:center">
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
    html,
  });

  return { success: true, result };
}

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
      <div style="padding:44px 48px 0;text-align:center">
        <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
      </div>

      <!-- Gold ornament -->
      <div style="padding:24px 0;text-align:center">
        <span style="color:${GOLD};font-size:18px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
      </div>

      <!-- Heading -->
      <div style="text-align:center;padding:0 48px 28px">
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Invoice</h1>
        <p style="margin:0;font-size:14px;color:${SUB}">${data.description}</p>
      </div>

      <!-- Personal message -->
      <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Hi <strong style="color:${GOLD}">${data.recipientName}</strong>, please find your invoice details below. Click the button to view and complete your payment securely through Stripe.</p>
      </div>

      <!-- Line items card -->
      <div style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
        <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
          <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Invoice Details</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          ${lineItemRows}
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

      <!-- CTA -->
      <div style="text-align:center;margin:0 40px 36px">
        <a href="${data.invoiceUrl}" style="display:inline-block;background:${GOLD};color:#000;text-decoration:none;padding:16px 44px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">
          View &amp; Pay
        </a>
        <p style="margin:14px 0 0;font-size:13px;color:${DIM}">Secure payment powered by Stripe</p>
      </div>

      <!-- Gold divider -->
      <div style="margin:0 40px;text-align:center">
        <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
      </div>

      <!-- Footer -->
      <div style="padding:28px 40px 44px;text-align:center">
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
    html,
  });

  return { success: true, result };
}
