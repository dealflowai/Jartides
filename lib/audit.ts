import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "product.create"
  | "product.update"
  | "product.delete"
  | "product.duplicate"
  | "product.bulk_update"
  | "order.status_change"
  | "order.note_add"
  | "order.note_update"
  | "order.note_delete"
  | "order.cleanup"
  | "inventory.update"
  | "coa.create"
  | "coa.update"
  | "coa.delete"
  | "settings.update"
  | "upload.file"
  | "back_in_stock.notify";

interface AuditEntry {
  admin_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Write an audit log entry. Fire-and-forget — never throws.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      admin_id: entry.admin_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      details: entry.details ?? null,
    });
  } catch (err) {
    // Audit logging should never break the request
    console.error("Failed to write audit log:", err);
  }
}
