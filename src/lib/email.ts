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
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "contactus@gcpremierpropertygroup.com";

// ─── Contact Form ───────────────────────────────────────────────
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();

  const html = `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Subject</td><td style="padding:8px;border-bottom:1px solid #eee">${data.subject || "No subject"}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px;white-space:pre-wrap">${data.message}</td></tr>
    </table>
  `;

  if (!resend) {
    console.log("Contact email (not sent):", data);
    return { success: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    replyTo: data.email,
    subject: `Contact Form: ${data.subject || data.name}`,
    html,
  });

  return result;
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

  if (!resend) {
    console.log("Assessment email (not sent):", data);
    return { success: true };
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFY_EMAIL,
    replyTo: data.email,
    subject: `Property Assessment: ${data.firstName} ${data.lastName} — ${data.address}`,
    html,
  });

  return result;
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
  const guestHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">Booking Confirmed!</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p>Hi ${data.guestName},</p>
        <p>Thank you for your reservation! Here are your booking details:</p>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Property</td><td style="padding:12px;border-bottom:1px solid #eee">${data.propertyTitle}</td></tr>
          <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-in</td><td style="padding:12px;border-bottom:1px solid #eee">${data.checkIn}</td></tr>
          <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-out</td><td style="padding:12px;border-bottom:1px solid #eee">${data.checkOut}</td></tr>
          <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Guests</td><td style="padding:12px;border-bottom:1px solid #eee">${data.guests}</td></tr>
          <tr><td style="padding:12px;font-weight:bold;color:#333">Total Paid</td><td style="padding:12px;font-weight:bold;color:#5CBF6E;font-size:18px">$${data.total}</td></tr>
        </table>
        <p>We'll send you check-in instructions closer to your arrival date.</p>
        <p style="color:#999;margin-top:30px;font-size:12px">If you have any questions, contact us at contactus@gcpremierpropertygroup.com or call (601) 966-8308.</p>
      </div>
    </div>
  `;

  // Email to owner
  const ownerHtml = `
    <h2>New Booking Received!</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Guest</td><td style="padding:8px;border-bottom:1px solid #eee">${data.guestName} (${data.guestEmail})</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Property</td><td style="padding:8px;border-bottom:1px solid #eee">${data.propertyTitle}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Check-in</td><td style="padding:8px;border-bottom:1px solid #eee">${data.checkIn}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Check-out</td><td style="padding:8px;border-bottom:1px solid #eee">${data.checkOut}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Guests</td><td style="padding:8px;border-bottom:1px solid #eee">${data.guests}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;font-weight:bold;color:#5CBF6E">$${data.total}</td></tr>
    </table>
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
