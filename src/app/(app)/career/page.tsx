import { LinkedInTab } from "@/components/career/linkedin-tab";
import { CertificatesTab } from "@/components/career/certificates-tab";
import { OutreachTab } from "@/components/career/outreach-tab";

export default function CareerPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">
        Career Engine
      </h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-brg rounded-full inline-block" />
            LinkedIn Posts
          </h2>
          <LinkedInTab />
        </section>
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-racing-red rounded-full inline-block" />
            Certificate Recommendations
          </h2>
          <CertificatesTab />
        </section>
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#1B3A5C] rounded-full inline-block" />
            Outreach Prep
          </h2>
          <OutreachTab />
        </section>
      </div>
    </div>
  );
}
