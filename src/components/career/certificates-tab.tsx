"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Certificate,
  getCertificates,
  saveCertificates,
  toggleCertDone,
} from "@/lib/career-storage";
import { Loader2, ExternalLink, Check, RefreshCw } from "lucide-react";

export function CertificatesTab() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCerts(getCertificates());
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/certificates", { method: "POST" });
      const data = await res.json();
      if (data.certificates) {
        const withDone = data.certificates.map((c: any) => ({
          ...c,
          done: false,
        }));
        setCerts(withDone);
        saveCertificates(withDone);
      }
    } catch {}
    setLoading(false);
  };

  const handleToggle = (index: number) => {
    setCerts(toggleCertDone(index));
  };

  const completedCount = certs.filter((c) => c.done).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={generate}
          disabled={loading}
          className="bg-racing-red hover:bg-racing-red/90 text-white"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generating...
            </>
          ) : certs.length > 0 ? (
            <>
              <RefreshCw size={16} className="mr-2" />
              Re-generate
            </>
          ) : (
            "Generate Recommendations"
          )}
        </Button>
        {certs.length > 0 && (
          <span className="text-xs text-text-muted">
            {completedCount}/{certs.length} completed
          </span>
        )}
      </div>

      {certs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert, i) => (
            <div
              key={i}
              className={`bg-cream-light border border-border rounded-card p-5 transition-opacity ${
                cert.done ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className={`text-sm font-medium text-text-primary ${
                      cert.done ? "line-through" : ""
                    }`}
                  >
                    {cert.name}
                  </h3>
                  <p className="text-xs text-brg mt-1">{cert.platform}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {cert.duration}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(i)}
                  className={`p-1.5 rounded-full border ${
                    cert.done
                      ? "bg-brg border-brg text-white"
                      : "border-border text-text-muted hover:border-brg"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-3">{cert.relevance}</p>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brg hover:text-brg-hover mt-2"
                >
                  View course <ExternalLink size={10} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
