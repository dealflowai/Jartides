import { requireAdminPage } from "@/lib/admin";
import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  ShieldAlert,
  FileText,
  Search,
  Send,
  Database,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Compliance | Jartides Admin",
};

function Checkbox({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 py-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3] shrink-0"
        readOnly
      />
      <span className="text-sm text-gray-700">{children}</span>
    </label>
  );
}

function SectionCard({
  step,
  title,
  timing,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  timing: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a6de3] text-sm font-bold text-white">
          {step}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{timing}</p>
        </div>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default async function CompliancePage() {
  await requireAdminPage();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Data Request Handling Procedure
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Internal reference only. Do not share publicly.
        </p>
      </div>

      {/* Step 1 */}
      <SectionCard
        step={1}
        title="Identify the Request Type"
        timing="Day 0"
        icon={Search}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Request Type</th>
                <th className="px-4 py-3 font-medium">What They Want</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  Access Request
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Copy of all data you hold on them
                </td>
                <td className="px-4 py-3 text-gray-600">
                  30 days (PIPEDA/GDPR), 45 days (CCPA)
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  Deletion Request
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Erase their personal data
                </td>
                <td className="px-4 py-3 text-gray-600">
                  30 days (GDPR), 45 days (CCPA)
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  Correction Request
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Fix inaccurate data
                </td>
                <td className="px-4 py-3 text-gray-600">30 days</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  Data Portability
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Data in machine-readable format (JSON/CSV)
                </td>
                <td className="px-4 py-3 text-gray-600">30 days (GDPR)</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  Opt-Out / Withdraw Consent
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Stop processing or unsubscribe
                </td>
                <td className="px-4 py-3 text-gray-600">Immediately</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Step 2 */}
      <SectionCard
        step={2}
        title="Verify Identity"
        timing="Days 0-3"
        icon={ShieldAlert}
      >
        {/* Warning banner */}
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">
            Never release data without confirming who is asking. A bad actor
            could impersonate a customer.
          </p>
        </div>

        <div className="space-y-1">
          <Checkbox>
            Reply to customer acknowledging receipt and stating the deadline
          </Checkbox>
          <Checkbox>
            Ask them to confirm from the same email address used on their
            account, OR
          </Checkbox>
          <Checkbox>
            Request 2 pieces of identifying info: order number + shipping
            address, or name + last 4 of payment method
          </Checkbox>
          <Checkbox>
            If identity cannot be verified, inform them and explain why (do NOT
            ignore the request)
          </Checkbox>
        </div>
      </SectionCard>

      {/* Step 3 */}
      <SectionCard
        step={3}
        title="Locate All Data"
        timing="Days 3-10"
        icon={Database}
      >
        <div className="space-y-1">
          <Checkbox>
            <strong>Website database (Supabase):</strong> account info, order
            history, addresses, preferences
          </Checkbox>
          <Checkbox>
            <strong>Payment processor (Stripe or whichever processor):</strong>{" "}
            transaction records, payment method metadata
          </Checkbox>
          <Checkbox>
            <strong>Email (inbox + sent):</strong> any support threads, order
            communications with this customer
          </Checkbox>
          <Checkbox>
            <strong>Shipping provider (Canada Post / FedEx / DHL portal):</strong>{" "}
            shipment records, tracking, address data
          </Checkbox>
          <Checkbox>
            <strong>Analytics tool:</strong> check if identifiable data is stored
            (usually anonymized)
          </Checkbox>
          <Checkbox>
            <strong>Any spreadsheets or local files:</strong> exported CSVs,
            manual order logs, notes
          </Checkbox>
        </div>
      </SectionCard>

      {/* Step 4 */}
      <SectionCard
        step={4}
        title="Execute the Request"
        timing="Days 10-25"
        icon={FileText}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a6de3]">
              Access
            </h3>
            <p className="text-sm text-gray-700">
              Compile all data into a single PDF or CSV. Include account details,
              order history, communications, any third-party data held. Send
              securely to the customer&apos;s verified email.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a6de3]">
              Deletion
            </h3>
            <p className="text-sm text-gray-700">
              Delete from database. Contact payment processor to delete (or
              confirm retention obligations). Delete from email/files.{" "}
              <strong>
                KEEP transaction records required by CRA (7 years)
              </strong>{" "}
              and note the legal basis for retention.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a6de3]">
              Correction
            </h3>
            <p className="text-sm text-gray-700">
              Update the data in all systems. Confirm the correction to the
              customer.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a6de3]">
              Portability
            </h3>
            <p className="text-sm text-gray-700">
              Export data as JSON or CSV. Send to verified email.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Step 5 */}
      <SectionCard
        step={5}
        title="Respond and Log"
        timing="Before Deadline"
        icon={Send}
      >
        <div className="space-y-1">
          <Checkbox>
            Send customer a clear written response confirming what was done
          </Checkbox>
          <Checkbox>
            If deletion: list what was deleted AND what was retained (with legal
            reason)
          </Checkbox>
          <Checkbox>
            If you need more time: notify customer BEFORE the deadline with
            reason and new expected date
          </Checkbox>
          <Checkbox>
            Log everything: date received, date completed, request type, what
            action was taken (keep log for 5 years)
          </Checkbox>
        </div>
      </SectionCard>

      {/* Bottom reference cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Card 1 - Data You Must Keep */}
        <div className="rounded-xl border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 border-b border-red-200 px-5 py-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">
              Data You Must Keep (Even If Deletion Requested)
            </h3>
          </div>
          <ul className="space-y-2 px-5 py-4 text-sm text-red-900">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>Transaction records:</strong> 7 years (CRA requirement)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>Export/customs records:</strong> 5-7 years
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>Consent records:</strong> 5 years
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>Active fraud investigation records</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>Data subject to ongoing legal proceedings</span>
            </li>
          </ul>
        </div>

        {/* Card 2 - Deadlines That Matter */}
        <div className="rounded-xl border-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 border-b border-red-200 px-5 py-3">
            <Clock className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">
              Deadlines That Matter
            </h3>
          </div>
          <ul className="space-y-2 px-5 py-4 text-sm text-red-900">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>PIPEDA/GDPR access/deletion:</strong> 30 days
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>CCPA access/deletion:</strong> 45 days (+ 45 day
                extension)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>GDPR breach notification:</strong> 72 hours
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>Acknowledge receipt:</strong> within 3 business days
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                <strong>If you need an extension:</strong> notify BEFORE deadline
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer note */}
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-center">
        <p className="text-sm font-medium text-gray-700">
          Check{" "}
          <span className="font-semibold text-[#0b3d7a]">
            jartidesofficial@gmail.com
          </span>{" "}
          at minimum every 48 hours. A missed deadline is a violation.
        </p>
      </div>
    </div>
  );
}
