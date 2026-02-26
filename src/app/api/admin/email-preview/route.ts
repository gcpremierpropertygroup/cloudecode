import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getCheckInInstructions } from "@/lib/email/scheduling";

const PROPERTY_TITLES: Record<string, string> = {
  "prop-eastover-001": "The Eastover House",
  "prop-spacious-002": "Modern Retreat",
  "prop-pinelane-003": "Pine Lane",
};

function getNextFriday() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getNextSunday() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + 2);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailType, propertyId } = body;
    const propertyTitle = PROPERTY_TITLES[propertyId] || "The Eastover House";
    const checkIn = getNextFriday();
    const checkOut = getNextSunday();

    let html = "";

    const BRAND = "#0EA5E9";

    if (emailType === "booking-confirmation") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#0D1117;color:#ffffff">
          <div style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)">
            <p style="margin:0 0 24px;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35)">G|C Premier Property Group</p>
            <div style="width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:rgba(14,165,233,0.12);line-height:56px;text-align:center">
              <span style="font-size:28px;color:${BRAND}">&#10003;</span>
            </div>
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#ffffff">Booking Confirmed</h1>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.4)">Your reservation is all set, Jane.</p>
          </div>
          <div style="padding:32px 40px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Property</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${propertyTitle}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td width="50%" style="vertical-align:top">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Check-in</p>
                      <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${checkIn}</p>
                    </td>
                    <td width="50%" style="vertical-align:top">
                      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Check-out</p>
                      <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">${checkOut}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Guests</p>
                  <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff">2 guests</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 0 0">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:middle">
                      <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.3)">Total Paid</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle">
                      <p style="margin:0;font-size:26px;font-weight:700;color:${BRAND}">$450.00</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </div>
          <div style="margin:0 40px;padding:24px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${BRAND}">What happens next?</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.5)">We'll send you detailed check-in instructions and property access info closer to your arrival date.</p>
          </div>
          <div style="padding:32px 40px;text-align:center">
            <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.35)">Questions about your stay?</p>
            <p style="margin:0 0 24px;font-size:13px">
              <a href="mailto:contactus@gcpremierproperties.com" style="color:${BRAND};text-decoration:none">contactus@gcpremierproperties.com</a>
              <span style="color:rgba(255,255,255,0.15);margin:0 8px">|</span>
              <a href="tel:+16019668308" style="color:${BRAND};text-decoration:none">(601) 966-8308</a>
            </p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
          </div>
        </div>`;
    } else if (emailType === "check-in-reminder") {
      const instructions = propertyId
        ? await getCheckInInstructions(propertyId)
        : null;

      const detailRows = [
        (instructions?.doorCode || "1234") && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Door Code</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace;font-size:18px;letter-spacing:2px">${instructions?.doorCode || "1234"}</td></tr>`,
        `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Network</td><td style="padding:12px;border-bottom:1px solid #eee">${instructions?.wifiName || "GC-Guest"}</td></tr>`,
        `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Password</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace">${instructions?.wifiPassword || "welcome123"}</td></tr>`,
        `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-in Time</td><td style="padding:12px;border-bottom:1px solid #eee">${instructions?.checkInTime || "3:00 PM"}</td></tr>`,
        `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-out Time</td><td style="padding:12px;border-bottom:1px solid #eee">${instructions?.checkOutTime || "11:00 AM"}</td></tr>`,
        (instructions?.parkingInfo) && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Parking</td><td style="padding:12px;border-bottom:1px solid #eee">${instructions.parkingInfo}</td></tr>`,
      ].filter(Boolean).join("");

      html = `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
          <div style="background:#111;padding:30px;text-align:center">
            <h1 style="color:#5CBF6E;margin:0;font-size:24px">Your Stay is Coming Up!</h1>
            <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
          </div>
          <div style="padding:30px;background:#fff">
            <p style="color:#333">Hi Jane,</p>
            <p style="color:#333">We're excited to welcome you to <strong>${propertyTitle}</strong>! Here's everything you need for your stay.</p>
            <div style="background:#f0fdf4;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
              <p style="margin:0;font-weight:bold;color:#333">Stay Details</p>
              <p style="margin:8px 0 0;color:#555">Check-in: <strong>${checkIn}</strong></p>
              <p style="margin:4px 0 0;color:#555">Check-out: <strong>${checkOut}</strong></p>
            </div>
            <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">Access &amp; Info</h3>
            <table style="border-collapse:collapse;width:100%;margin:0 0 20px">${detailRows}</table>
            ${instructions?.houseRules ? `
            <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">House Rules</h3>
            <div style="background:#f9f9f9;padding:16px;border-radius:4px">
              <p style="margin:0;color:#555;white-space:pre-wrap">${instructions.houseRules}</p>
            </div>` : ""}
            ${instructions?.specialNotes ? `
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:20px 0">
              <p style="margin:0;font-weight:bold;color:#333">Special Notes</p>
              <p style="margin:8px 0 0;color:#555;white-space:pre-wrap">${instructions.specialNotes}</p>
            </div>` : ""}
            <p style="color:#333;margin-top:24px">If you have any questions before your arrival, don't hesitate to reach out!</p>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
            <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
          </div>
        </div>`;
    } else if (emailType === "review-request") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
          <div style="background:#111;padding:30px;text-align:center">
            <h1 style="color:#5CBF6E;margin:0;font-size:24px">How Was Your Stay?</h1>
            <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
          </div>
          <div style="padding:30px;background:#fff">
            <p style="color:#333">Hi Jane,</p>
            <p style="color:#333">We hope you had a wonderful time at <strong>${propertyTitle}</strong>! Your feedback means the world to us and helps future guests find the perfect stay.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="#" style="display:inline-block;background:#5CBF6E;color:#fff;text-decoration:none;padding:14px 32px;font-weight:bold;font-size:16px;border-radius:4px">
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
        </div>`;
    } else {
      return NextResponse.json({ error: "Invalid emailType" }, { status: 400 });
    }

    return NextResponse.json({
      html: `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#1a1a2e">${html}</body></html>`,
    });
  } catch (error) {
    console.error("Failed to generate preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
