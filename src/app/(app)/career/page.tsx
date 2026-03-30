"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInTab } from "@/components/career/linkedin-tab";
import { CertificatesTab } from "@/components/career/certificates-tab";
import { OutreachTab } from "@/components/career/outreach-tab";

export default function CareerPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">
        Career Engine
      </h1>
      <Tabs defaultValue="linkedin">
        <TabsList className="bg-cream border border-border">
          <TabsTrigger
            value="linkedin"
            className="data-[state=active]:bg-brg-light data-[state=active]:text-brg"
          >
            LinkedIn Posts
          </TabsTrigger>
          <TabsTrigger
            value="certificates"
            className="data-[state=active]:bg-brg-light data-[state=active]:text-brg"
          >
            Certificate Recommendations
          </TabsTrigger>
          <TabsTrigger
            value="outreach"
            className="data-[state=active]:bg-brg-light data-[state=active]:text-brg"
          >
            Outreach Prep
          </TabsTrigger>
        </TabsList>
        <TabsContent value="linkedin" className="mt-6">
          <LinkedInTab />
        </TabsContent>
        <TabsContent value="certificates" className="mt-6">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="outreach" className="mt-6">
          <OutreachTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
