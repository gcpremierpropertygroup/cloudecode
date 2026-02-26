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

  // Email to guest
  const BRAND = "#0EA5E9";
  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0D1117;color:#ffffff">
      <!-- Header -->
      <div style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0 0 24px;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35)">G|C Premier Property Group</p>
        <div style="width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:rgba(14,165,233,0.12);line-height:56px;text-align:center">
          <span style="font-size:28px;color:${BRAND}">&#10003;</span>
        </div>
        <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff">Booking Confirmed</h1>
        <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.4)">Your reservation is all set, ${data.guestName}.</p>
      </div>

      <!-- Booking details -->
      <div style="padding:32px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Property</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${data.propertyTitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="50%" style="vertical-align:top">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Check-in</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${data.checkIn}</p>
                </td>
                <td width="50%" style="vertical-align:top">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Check-out</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${data.checkOut}</p>
                </td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Guests</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${data.guests} guest${Number(data.guests) > 1 ? "s" : ""}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0 0">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle">
                  <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Total Paid</p>
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <p style="margin:0;font-size:26px;font-weight:700;color:${BRAND}">$${data.total}</p>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Next steps -->
      <div style="margin:0 40px;padding:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${BRAND}">What happens next?</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.5)">We'll send you detailed check-in instructions and property access info closer to your arrival date.</p>
      </div>

      <!-- Footer -->
      <div style="padding:32px 40px;text-align:center">
        <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.35)">Questions about your stay?</p>
        <p style="margin:0 0 24px;font-size:13px">
          <a href="mailto:contactus@gcpremierproperties.com" style="color:${BRAND};text-decoration:none">contactus@gcpremierproperties.com</a>
          <span style="color:rgba(255,255,255,0.15);margin:0 8px">|</span>
          <a href="tel:+16019668308" style="color:${BRAND};text-decoration:none">(601) 966-8308</a>
        </p>
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
      </div>
    </div>
  `;

  // Email to owner
  const ownerHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0D1117;color:#ffffff">
      <div style="padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">New Booking</p>
        <h2 style="margin:0;font-size:22px;font-weight:700;color:#ffffff">${data.propertyTitle}</h2>
      </div>
      <div style="padding:24px 40px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:13px;width:100px">Guest</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:600;color:#fff">${data.guestName}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:13px">Email</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff"><a href="mailto:${data.guestEmail}" style="color:${BRAND};text-decoration:none">${data.guestEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:13px">Check-in</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:600;color:#fff">${data.checkIn}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:13px">Check-out</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:600;color:#fff">${data.checkOut}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:13px">Guests</td>
            <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;font-weight:600;color:#fff">${data.guests}</td>
          </tr>
          <tr>
            <td style="padding:16px 0 0;color:rgba(255,255,255,0.4);font-size:13px">Total</td>
            <td style="padding:16px 0 0;font-size:22px;font-weight:700;color:${BRAND}">$${data.total}</td>
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

  const detailRows = [
    data.doorCode && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Door Code</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace;font-size:18px;letter-spacing:2px">${data.doorCode}</td></tr>`,
    data.wifiName && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Network</td><td style="padding:12px;border-bottom:1px solid #eee">${data.wifiName}</td></tr>`,
    data.wifiPassword && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Password</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace">${data.wifiPassword}</td></tr>`,
    data.checkInTime && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-in Time</td><td style="padding:12px;border-bottom:1px solid #eee">${data.checkInTime}</td></tr>`,
    data.checkOutTime && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-out Time</td><td style="padding:12px;border-bottom:1px solid #eee">${data.checkOutTime}</td></tr>`,
    data.parkingInfo && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Parking</td><td style="padding:12px;border-bottom:1px solid #eee">${data.parkingInfo}</td></tr>`,
  ].filter(Boolean).join("");

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">Your Stay is Coming Up!</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="color:#333">Hi ${data.guestName},</p>
        <p style="color:#333">We're excited to welcome you to <strong>${data.propertyTitle}</strong>! Here's everything you need for your stay.</p>

        <div style="background:#f0fdf4;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
          <p style="margin:0;font-weight:bold;color:#333">Stay Details</p>
          <p style="margin:8px 0 0;color:#555">Check-in: <strong>${data.checkIn}</strong></p>
          <p style="margin:4px 0 0;color:#555">Check-out: <strong>${data.checkOut}</strong></p>
        </div>

        ${detailRows ? `
        <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">Access &amp; Info</h3>
        <table style="border-collapse:collapse;width:100%;margin:0 0 20px">
          ${detailRows}
        </table>
        ` : ""}

        ${data.houseRules ? `
        <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">House Rules</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:4px">
          <p style="margin:0;color:#555;white-space:pre-wrap">${data.houseRules}</p>
        </div>
        ` : ""}

        ${data.specialNotes ? `
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:20px 0">
          <p style="margin:0;font-weight:bold;color:#333">Special Notes</p>
          <p style="margin:8px 0 0;color:#555;white-space:pre-wrap">${data.specialNotes}</p>
        </div>
        ` : ""}

        <p style="color:#333;margin-top:24px">If you have any questions before your arrival, don't hesitate to reach out!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
        <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
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

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">How Was Your Stay?</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="color:#333">Hi ${data.guestName},</p>
        <p style="color:#333">We hope you had a wonderful time at <strong>${data.propertyTitle}</strong>! Your feedback means the world to us and helps future guests find the perfect stay.</p>

        <div style="text-align:center;margin:30px 0">
          <a href="https://www.google.com/search?q=G%7CC+Premier+Property+Group+Jackson+MS+reviews" style="display:inline-block;background:#5CBF6E;color:#fff;text-decoration:none;padding:14px 32px;font-weight:bold;font-size:16px;border-radius:4px">
            Leave a Review
          </a>
        </div>

        <p style="color:#555;text-align:center;font-size:14px">It only takes a minute and we truly appreciate it!</p>

        <div style="background:#f9f9f9;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
          <p style="margin:0;color:#555">Had an issue during your stay? Reply to this email and we'll make it right.</p>
        </div>

        <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
        <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
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
