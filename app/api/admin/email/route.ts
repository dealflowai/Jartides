import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { z } from "zod";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { to, subject, body } = parsed.data;

  // Convert plain text line breaks to HTML
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
          <td style="background:#0b3d7a;padding:16px 24px;text-align:center;">
            <img src="https://jartides.ca/images/logo.png" alt="Jartides" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px;border-radius:50%;background:#fff;padding:3px;" />
            <div style="display:inline-block;vertical-align:middle;text-align:left;">
              <h1 style="margin:0;color:#fff;font-size:18px;font-weight:800;letter-spacing:1.5px;">JARTIDES</h1>
              <p style="margin:1px 0 0;color:#93bbf5;font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Research Peptides</p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 24px;">
            <p style="margin:0;font-size:15px;line-height:1.8;color:#333;">
              ${bodyHtml}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 24px;background:#fafafa;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">
              Questions? Email us at
              <a href="mailto:jartidesofficial@gmail.com" style="color:#666;">jartidesofficial@gmail.com</a>.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#bbb;">&copy; Jartides. All rights reserved.</p>
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
    subject,
    html,
  });

  if (!result.success) {
    logger.error("Failed to send admin email", { to, subject, error: result.error });
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "settings.update",
    entity_type: "email",
    details: { to, subject },
  });

  logger.info("Admin email sent", { to, subject });
  return NextResponse.json({ success: true });
}
