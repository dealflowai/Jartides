import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "@/components/layout/ContactForm";
import { Mail, MapPin, Clock, Package } from "lucide-react";
import {
  CONTACT_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_HOURS,
} from "@/lib/constants";

export const metadata = {
  title: "Contact Us | Jartides",
  description: "We're here to help with any questions about our research peptides.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="CONTACT US"
        description="We're here to help with any questions."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* LEFT — Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              Get in Touch
            </h2>
            <p className="mt-2 text-sm text-gray-600 font-[family-name:var(--font-body)]">
              Have a question about an order, a product, or anything else?
              We&apos;d love to hear from you.
            </p>

            <div className="mt-8 space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b3d7a]/10">
                  <Mail className="h-5 w-5 text-[#0b3d7a]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 font-[family-name:var(--font-body)]">
                    Email
                  </h3>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm text-[#1a6de3] hover:underline font-[family-name:var(--font-body)]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b3d7a]/10">
                  <MapPin className="h-5 w-5 text-[#0b3d7a]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 font-[family-name:var(--font-body)]">
                    Location
                  </h3>
                  <p className="text-sm text-gray-600 font-[family-name:var(--font-body)]">
                    {BUSINESS_ADDRESS}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b3d7a]/10">
                  <Clock className="h-5 w-5 text-[#0b3d7a]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 font-[family-name:var(--font-body)]">
                    Business Hours
                  </h3>
                  <p className="text-sm text-gray-600 font-[family-name:var(--font-body)]">
                    {BUSINESS_HOURS}
                  </p>
                </div>
              </div>
            </div>

            {/* Wholesale */}
            <div className="mt-10 rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-[#0b3d7a]" />
                <h3 className="text-sm font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
                  Wholesale Inquiries
                </h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 font-[family-name:var(--font-body)]">
                For bulk or wholesale inquiries, email us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-[#1a6de3] hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="rounded-xl border border-[#dde2ea] bg-white p-6 shadow-sm lg:p-8">
            <h2 className="mb-6 text-xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
