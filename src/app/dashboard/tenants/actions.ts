"use server";

import { getOrCreateUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function inviteTenant(formData: FormData) {
  const user = await getOrCreateUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const email = formData.get("email") as string;
  const propertyId = formData.get("propertyId") as string;
  const leaseStart = formData.get("leaseStart") as string;
  const leaseEnd = formData.get("leaseEnd") as string;
  const name = formData.get("name") as string;

  if (!email || !propertyId || !leaseStart || !leaseEnd) {
    throw new Error("Missing required fields");
  }

  // Verify property belongs to user
  const property = await prisma.property.findFirst({
    where: { id: propertyId, landlordId: user.id },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  // Check if user already exists with this email
  let tenantUser = await prisma.user.findUnique({
    where: { email },
  });

  // If user doesn't exist, create them as a tenant
  if (!tenantUser) {
    tenantUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        role: "TENANT",
      },
    });
  }

  // Create tenant record
  await prisma.tenant.create({
    data: {
      userId: tenantUser.id,
      propertyId,
      leaseStart: new Date(leaseStart),
      leaseEnd: new Date(leaseEnd),
    },
  });

  // Send invitation email
  const { sendEmail } = await import("@/lib/email");
  const { generateEmailHtml } = await import("@/lib/email-template");

  await sendEmail({
    to: email,
    subject: "You've been invited to rent a property",
    html: generateEmailHtml(
      "Welcome to AutoLandlord",
      `
        <h2 style="margin-top: 0;">You've been invited to join AutoLandlord!</h2>
        <p>Hello,</p>
        <p>You have been officially invited to rent the property located at <strong>${
          property.address
        }</strong>.</p>
        <p>AutoLandlord is your new home for managing your tenancy. Through our secure portal, you will be able to:</p>
        <ul>
          <li>View your lease details and documents</li>
          <li>Submit maintenance requests directly to your landlord</li>
          <li>View payment history and upcoming rent</li>
        </ul>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; margin-bottom: 12px;">Lease Details</h3>
          <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${
            property.address
          }</p>
          <p style="margin: 0 0 8px 0;"><strong>Lease Start:</strong> ${leaseStart}</p>
          <p style="margin: 0;"><strong>Lease End:</strong> ${leaseEnd}</p>
        </div>

        <p>To get started, please click the button below to access your tenant portal. You can create your account using this email address.</p>
        
        <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/sign-in" class="button" style="color: #ffffff;">Access Tenant Portal</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you have any questions, please contact your landlord directly.</p>
      `
    ),
  });

  // Update property status to OCCUPIED
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "OCCUPIED" },
  });

  revalidatePath("/dashboard/tenants");
  redirect("/dashboard/tenants");
}

export async function resendInvitation(tenantId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { user: true, property: true },
  });

  if (!tenant) throw new Error("Tenant not found");
  if (tenant.property.landlordId !== user.id) throw new Error("Unauthorized");

  const { sendEmail } = await import("@/lib/email");
  const { generateEmailHtml } = await import("@/lib/email-template");

  const result = await sendEmail({
    to: tenant.user.email,
    subject: "Invitation Reminder: Rent Property",
    html: generateEmailHtml(
      "Invitation Reminder",
      `
        <h2 style="margin-top: 0;">Reminder: You've been invited to join AutoLandlord!</h2>
        <p>Hello,</p>
        <p>This is a friendly reminder that you have been invited to rent the property located at <strong>${
          tenant.property.address
        }</strong>.</p>
        <p>We noticed you haven't set up your account yet. By joining AutoLandlord, you'll get access to:</p>
        <ul>
          <li>Digital lease signing and document storage</li>
          <li>Easy online rent payments</li>
          <li>Direct maintenance request tracking</li>
        </ul>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; margin-bottom: 12px;">Lease Details</h3>
          <p style="margin: 0 0 8px 0;"><strong>Property:</strong> ${
            tenant.property.address
          }</p>
          <p style="margin: 0 0 8px 0;"><strong>Lease Start:</strong> ${tenant.leaseStart.toLocaleDateString()}</p>
          <p style="margin: 0;"><strong>Lease End:</strong> ${tenant.leaseEnd.toLocaleDateString()}</p>
        </div>

        <p>Don't miss out on streamlining your rental experience. Click the button below to get started.</p>
        
        <div style="text-align: center; margin-top: 32px; margin-bottom: 32px;">
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/sign-in" class="button" style="color: #ffffff;">Access Tenant Portal</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you believe this email was sent in error, please ignore it.</p>
      `
    ),
  });

  if (!result.success) {
    throw new Error("Failed to send email: " + JSON.stringify(result.error));
  }

  return { success: true };
}
