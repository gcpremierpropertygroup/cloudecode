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

    if (emailType === "booking-confirmation") {
      html = `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#111;padding:40px 30px;text-align:center">
            <h1 style="color:#5CBF6E;margin:0;font-size:26px;letter-spacing:1px">Booking Confirmed!</h1>
            <p style="color:#aaa;margin:8px 0 0;font-size:14px">G|C Premier Property Group</p>
          </div>
          <div style="padding:35px 30px;background:#fff">
            <p style="font-size:16px;line-height:1.6;margin:0 0 15px">Hey Jane,</p>
            <p style="font-size:16px;line-height:1.6;margin:0 0 15px">Thank you for booking with <strong>GC Premier Property Group</strong>! We are truly excited to host you and can't wait to make your stay a wonderful experience.</p>
            <p style="font-size:16px;line-height:1.6;margin:0 0 25px">Here are your reservation details:</p>
            <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:0 0 25px">
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#555;width:35%">Property</td><td style="padding:12px;border-bottom:1px solid #eee;font-size:15px">${propertyTitle}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#555">Check-in</td><td style="padding:12px;border-bottom:1px solid #eee;font-size:15px">${checkIn}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#555">Check-out</td><td style="padding:12px;border-bottom:1px solid #eee;font-size:15px">${checkOut}</td></tr>
                <tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#555">Guests</td><td style="padding:12px;border-bottom:1px solid #eee;font-size:15px">2</td></tr>
                <tr><td style="padding:12px;font-weight:bold;color:#555">Total Paid</td><td style="padding:12px;font-weight:bold;color:#5CBF6E;font-size:20px">$450.00</td></tr>
              </table>
            </div>
            <p style="font-size:16px;line-height:1.6;margin:0 0 15px">We'll send you detailed check-in instructions closer to your arrival date with everything you need to get settled in — door code, WiFi, parking, and more.</p>
            <p style="font-size:16px;line-height:1.6;margin:0 0 15px">In the meantime, don't hesitate to reach out if you have any questions. We're here to help!</p>
            <p style="font-size:16px;line-height:1.6;margin:25px 0 5px">Warm regards,</p>
            <p style="font-size:16px;line-height:1.6;margin:0 0 0"><strong>GC Premier Property Group</strong></p>
          </div>
          <div style="background:#f5f5f5;padding:20px 30px;text-align:center;border-top:1px solid #eee">
            <p style="color:#999;font-size:12px;margin:0">Questions? Text or call <strong>(504) 715-1203</strong> or email <strong>contactus@gcpremierproperties.com</strong></p>
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
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5">${html}</body></html>`,
    });
  } catch (error) {
    console.error("Failed to generate preview:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
