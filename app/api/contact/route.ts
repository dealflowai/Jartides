import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";
import { CONTACT_EMAIL } from "@/lib/constants";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const ContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  category: z.string().min(1, "Category is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const rateLimited = await rateLimit(request, { limit: 3, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Invalid request";
      return NextResponse.json(
        { error: firstError, details: fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, category, message } = parsed.data;
    const name = escapeHtml(`${firstName} ${lastName}`);
    const safeEmail = escapeHtml(email);
    const safeCategory = escapeHtml(category);
    const safeMessage = escapeHtml(message);

    // Send email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Jartides Contact <noreply@${process.env.RESEND_DOMAIN || "jartides.ca"}>`,
          to: [CONTACT_EMAIL],
          reply_to: email,
          subject: `[${safeCategory}] Contact from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Category:</strong> ${safeCategory}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${safeMessage.replace(/\n/g, "<br />")}</p>
          `,
        }),
      });

      if (!res.ok) {
        logger.error("Failed to send contact email", { error: await res.text() });
      }
    } else {
      logger.warn("Contact form submitted but no email provider configured", { name, email, category });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Contact form error", { error: String(err) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
