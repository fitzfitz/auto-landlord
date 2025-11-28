import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Email not sent.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: "AutoLandlord <donotreply@fitzgeral.my.id>",
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
