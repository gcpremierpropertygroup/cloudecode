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

    const GOLD = "#D4A853";
    const GOLD_DIM = "rgba(212,168,83,0.15)";
    const GOLD_BORDER = "rgba(212,168,83,0.25)";
    const BG = "#0B0F1A";
    const CARD = "#111827";
    const WHITE = "#FFFFFF";
    const SUB = "rgba(255,255,255,0.5)";
    const DIM = "rgba(255,255,255,0.3)";
    const RULE = "rgba(255,255,255,0.08)";
    const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo.png";

    if (emailType === "booking-confirmation") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
          <div style="height:3px;background:${GOLD}"></div>
          <div style="padding:44px 48px 0;text-align:center">
            <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
          </div>
          <div style="padding:24px 0;text-align:center">
            <span style="color:${GOLD};font-size:18px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
          </div>
          <div style="text-align:center;padding:0 48px 28px">
            <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Booking Confirmed</h1>
            <p style="margin:0;font-size:14px;color:${SUB}">Your reservation is all set, Jane.</p>
          </div>
          <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
            <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">Thank you for choosing to stay with us. We are truly excited to host you and are committed to making your experience at <strong style="color:${GOLD}">${propertyTitle}</strong> comfortable and memorable.</p>
          </div>
          <div style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
            <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
              <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Reservation Details</p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Property</p>
                  <p style="margin:0;font-size:17px;font-weight:600;color:${WHITE}">${propertyTitle}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td width="50%" style="vertical-align:top">
                      <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in</p>
                      <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${checkIn}</p>
                    </td>
                    <td width="50%" style="vertical-align:top">
                      <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out</p>
                      <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${checkOut}</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid ${RULE}">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Guests</p>
                  <p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">2 guests</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:middle">
                      <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Total Paid</p>
                    </td>
                    <td style="text-align:right;vertical-align:middle">
                      <p style="margin:0;font-size:28px;font-weight:700;color:${GOLD}">$450.00</p>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </div>
          <div style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">What happens next?</p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">We'll send you detailed check-in instructions closer to your arrival date with everything you need &mdash; door code, WiFi, parking, and more.</p>
          </div>
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
      html: `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#060911">${html}</body></html>`,
    });
  } catch (error) {
    console.error("Failed to generate preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
