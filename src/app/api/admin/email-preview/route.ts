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
    const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

    if (emailType === "booking-confirmation") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
          <div style="height:3px;background:${GOLD}"></div>
          <div style="padding:44px 48px 0;text-align:center">
            <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
          </div>
          <div style="text-align:center;padding:24px 48px 28px">
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
      const doorCode = instructions?.doorCode || "1234";
      const wifiName = instructions?.wifiName || "GC-Guest";
      const wifiPass = instructions?.wifiPassword || "welcome123";
      const ciTime = instructions?.checkInTime || "3:00 PM";
      const coTime = instructions?.checkOutTime || "11:00 AM";

      html = `
        <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
          <div style="height:3px;background:${GOLD}"></div>
          <div style="padding:44px 48px 0;text-align:center"><img src="${LOGO_URL}" alt="G|C" width="150" style="display:inline-block"/></div>
          <div style="text-align:center;padding:24px 48px 28px">
            <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">Your Stay is Coming Up!</h1>
            <p style="margin:0;font-size:14px;color:${SUB}">Everything you need for your arrival, Jane.</p>
          </div>
          <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
            <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We're excited to welcome you to <strong style="color:${GOLD}">${propertyTitle}</strong>! Below you'll find your door code, WiFi details, and everything else you need for a seamless check-in.</p>
          </div>
          <div style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
            <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Stay Details</p></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${checkIn}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out</p><p style="margin:0;font-size:16px;font-weight:500;color:${WHITE}">${checkOut}</p></td></tr></table></td></tr>
            </table>
          </div>
          <div style="margin:0 40px 24px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
            <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Access &amp; Info</p></div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
              <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Door Code</p><p style="margin:0;font-size:22px;font-weight:700;color:${GOLD};letter-spacing:2px">${doorCode}</p></td></tr>
              <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Network</p><p style="margin:0;font-size:15px;font-weight:600;color:${WHITE}">${wifiName}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">WiFi Password</p><p style="margin:0;font-size:15px;font-weight:600;color:${WHITE}">${wifiPass}</p></td></tr></table></td></tr>
              <tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><table width="100%"><tr><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-in Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${ciTime}</p></td><td width="50%"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Check-out Time</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${coTime}</p></td></tr></table></td></tr>
              ${instructions?.parkingInfo ? `<tr><td style="padding:14px 24px;border-bottom:1px solid ${RULE}"><p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:${DIM}">Parking</p><p style="margin:0;font-size:15px;font-weight:500;color:${WHITE}">${instructions.parkingInfo}</p></td></tr>` : ""}
            </table>
          </div>
          ${instructions?.houseRules ? `<div style="margin:0 40px 24px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px"><p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">House Rules</p><p style="margin:0;font-size:14px;line-height:1.7;color:${SUB};white-space:pre-wrap">${instructions.houseRules}</p></div>` : ""}
          ${instructions?.specialNotes ? `<div style="margin:0 40px 24px;padding:22px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:10px"><p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${GOLD};text-transform:uppercase;letter-spacing:1px">Special Notes</p><p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);white-space:pre-wrap">${instructions.specialNotes}</p></div>` : ""}
          <div style="margin:0 40px;text-align:center"><div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div></div>
          <div style="padding:28px 40px 44px;text-align:center">
            <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions about your stay?</p>
            <p style="margin:0 0 20px;font-size:13px"><a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a><span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span><a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
          </div>
        </div>`;
    } else if (emailType === "review-request") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
          <div style="height:3px;background:${GOLD}"></div>
          <div style="padding:44px 48px 0;text-align:center"><img src="${LOGO_URL}" alt="G|C" width="150" style="display:inline-block"/></div>
          <div style="text-align:center;padding:24px 48px 28px">
            <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">How Was Your Stay?</h1>
            <p style="margin:0;font-size:14px;color:${SUB}">We'd love to hear about your experience, Jane.</p>
          </div>
          <div style="margin:0 40px 32px;padding:24px 28px;background:${GOLD_DIM};border:1px solid ${GOLD_BORDER};border-radius:8px">
            <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.7)">We hope you had a wonderful time at <strong style="color:${GOLD}">${propertyTitle}</strong>! Your feedback means the world to us and helps future guests find the perfect stay.</p>
          </div>
          <div style="text-align:center;margin:0 40px 28px">
            <a href="#" style="display:inline-block;background:#5CBF6E;color:#fff;text-decoration:none;padding:16px 44px;font-weight:700;font-size:16px;border-radius:6px;letter-spacing:0.5px">Leave a Review</a>
            <p style="margin:14px 0 0;font-size:13px;color:${DIM}">It only takes a minute and we truly appreciate it!</p>
          </div>
          <div style="margin:0 40px 36px;padding:22px 28px;background:${CARD};border:1px solid ${RULE};border-radius:10px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:${SUB}">Had an issue during your stay? Reply to this email and we'll make it right.</p>
          </div>
          <div style="margin:0 40px;text-align:center"><div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div></div>
          <div style="padding:28px 40px 44px;text-align:center">
            <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Questions?</p>
            <p style="margin:0 0 20px;font-size:13px"><a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a><span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span><a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a></p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
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
