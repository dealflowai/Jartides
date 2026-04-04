import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET all messages (grouped by thread)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("inbox_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

const replySchema = z.object({
  threadId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  senderName: z.string().min(1),
});

// POST a reply
export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = replySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { threadId, to, subject, body, senderName } = parsed.data;
  const db = createAdminClient();

  // Send the email
  const bodyHtml = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#0b3d7a;padding:14px 24px;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;padding-right:12px;">
                <img src="https://www.jartides.ca/icon.png" alt="" width="42" height="42" style="display:block;border-radius:50%;" />
              </td>
              <td style="vertical-align:middle;">
                <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:1.5px;font-family:Arial,Helvetica,sans-serif;">JARTIDES</h1>
                <p style="margin:1px 0 0;color:#7fb3f0;font-size:8px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Research Peptides</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#999;">Re: ${subject}</p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#333;">${bodyHtml}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;background:#fafafa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              Questions? Email us at <a href="mailto:jartidesofficial@gmail.com" style="color:#666;">jartidesofficial@gmail.com</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const result = await sendEmail({
    to: [to],
    replyTo: "jartidesofficial@gmail.com",
    subject: `Re: ${subject}`,
    html,
  });

  if (!result.success) {
    logger.error("Failed to send inbox reply", { to, error: result.error });
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }

  // Save outbound reply to thread
  await db.from("inbox_messages").insert({
    thread_id: threadId,
    direction: "outbound",
    sender_name: "Jartides",
    sender_email: "noreply@jartides.ca",
    subject: `Re: ${subject}`,
    body,
    is_read: true,
  });

  // Mark all inbound messages in this thread as read
  await db
    .from("inbox_messages")
    .update({ is_read: true })
    .eq("thread_id", threadId)
    .eq("direction", "inbound");

  logger.info("Inbox reply sent", { to, threadId });
  return NextResponse.json({ success: true });
}

// PUT - mark message(s) as read
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await req.json();
  if (!threadId) {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  const db = createAdminClient();
  await db
    .from("inbox_messages")
    .update({ is_read: true })
    .eq("thread_id", threadId);

  return NextResponse.json({ success: true });
}

// DELETE a thread
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await req.json();
  if (!threadId) {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  const db = createAdminClient();
  await db.from("inbox_messages").delete().eq("thread_id", threadId);

  return NextResponse.json({ success: true });
}
