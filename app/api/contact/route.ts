import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  category: z.string().min(1, "Category is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, category, message } = parsed.data;

    // Log the contact submission (in production, send via Resend/SendGrid)
    console.log("Contact form submission:", {
      name,
      email,
      category,
      message,
      submittedAt: new Date().toISOString(),
    });

    // TODO: Send email notification via Resend or SendGrid
    // await resend.emails.send({
    //   from: 'noreply@jartides.com',
    //   to: 'support@jartides.com',
    //   subject: `Contact Form: ${category}`,
    //   text: `From: ${name} (${email})\n\n${message}`,
    // });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
