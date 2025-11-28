import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const propertyId = formData.get("propertyId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const message = formData.get("message") as string | null;

    if (!propertyId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create application
    await prisma.application.create({
      data: {
        propertyId,
        name,
        email,
        phone,
        message,
        status: "NEW",
      },
    });

    // Fetch landlord email
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { landlord: true },
    });

    if (property?.landlord?.email) {
      const { sendEmail } = await import("@/lib/email");
      const { generateEmailHtml } = await import("@/lib/email-template");

      await sendEmail({
        to: property.landlord.email,
        subject: `New Application for ${property.address}`,
        html: generateEmailHtml(
          "New Rental Application",
          `
            <h2 style="margin-top: 0;">New Rental Application Received</h2>
            <p>Great news! You have received a new application for your property at <strong>${
              property.address
            }</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin-top: 0; margin-bottom: 12px;">Applicant Details</h3>
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${
                phone || "N/A"
              }</p>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 4px 0;"><strong>Message from Applicant:</strong></p>
                <p style="margin: 0; font-style: italic; color: #4b5563;">"${
                  message || "No message provided."
                }"</p>
              </div>
            </div>

            <p>You can review the full application, run background checks (if enabled), and approve or reject this applicant directly from your dashboard.</p>
            
            <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/dashboard/applications" class="button" style="color: #ffffff;">Review Application</a>
            </div>
          `
        ),
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/listings/application-submitted`, request.url)
    );
  } catch (error) {
    console.error("Application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
