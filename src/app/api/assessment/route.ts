import { NextRequest, NextResponse } from "next/server";
import { sendAssessmentEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      bedrooms,
      bathrooms,
      furnished,
      onAirbnb,
      notes,
    } = body;

    if (!firstName || !lastName || !email || !address || !city) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    await sendAssessmentEmail({
      firstName,
      lastName,
      email,
      phone: phone || "",
      address,
      city,
      state: state || "MS",
      zip: zip || "",
      bedrooms: bedrooms || "",
      bathrooms: bathrooms || "",
      furnished: furnished || "",
      onAirbnb: onAirbnb || "",
      notes: notes || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assessment form error:", error);
    return NextResponse.json(
      { error: "Failed to send assessment request" },
      { status: 500 }
    );
  }
}
