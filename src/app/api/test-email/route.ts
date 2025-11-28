import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "RESEND_API_KEY is missing in .env",
      },
      { status: 500 }
    );
  }

  // Get email from query param or default to a placeholder
  // In a real app, we'd get the user's email, but for testing we can just check the API response
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json(
      {
        status: "error",
        message:
          'Missing "to" query parameter. Usage: /api/test-email?to=your@email.com',
      },
      { status: 400 }
    );
  }

  const result = await sendEmail({
    to,
    subject: "AutoLandlord Test Email",
    html: "<h1>It Works!</h1><p>This is a test email from your AutoLandlord application.</p>",
  });

  if (result.success) {
    return NextResponse.json({
      status: "success",
      message: "Email sent successfully",
      data: result.data,
    });
  } else {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to send email",
        error: result.error,
      },
      { status: 500 }
    );
  }
}
