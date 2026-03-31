"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Certificate,
  getCertificates,
  saveCertificates,
  toggleCertDone,
} from "@/lib/career-storage";
import { Loader2, ExternalLink, Check, RefreshCw, Clock, BookOpen } from "lucide-react";

export function CertificatesTab() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCerts(getCertificates());
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/certificates", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.certificates && data.certificates.length > 0) {
        const withDone = data.certificates.map((c: Record<string, unknown>) => ({
          ...c,
          done: false,
        }));
        setCerts(withDone);
        saveCertificates(withDone);
      } else {
        setError("No recommendations generated. Try again.");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    }
    setLoading(false);
  };

  const handleToggle = (index: number) => {
    setCerts(toggleCertDone(index));
  };

  const completedCount = certs.filter((c) => c.done).length;

  return (
    <div className="space-y-4">
      <div className="bg-cream-light border border-border rounded-card p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Focus:</span>{" "}
          Quick courses (1–2 hours) that build practical skills for automotive digital transformation, motorsport, and leadership roles.
        </p>
      </div>

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
        {error && (
          <span className="text-xs text-racing-red">{error}</span>
        )}
      </div>

      {certs.length > 0 && (
        <div className="space-y-3">
          {certs.map((cert, i) => (
            <div
              key={i}
              className={`bg-cream-light border border-border rounded-card p-5 transition-opacity ${
                cert.done ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-semibold text-text-primary ${
                        cert.done ? "line-through" : ""
                      }`}
                    >
                      {cert.name}
                    </h3>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brg hover:text-brg-hover shrink-0"
                      >
                        Open <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-brg font-medium">
                      <BookOpen size={11} />
                      {cert.platform}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted font-mono">
                      <Clock size={11} />
                      {cert.duration}
                    </span>
                  </div>
                  <div className="mt-3 pl-3 border-l-2 border-brg/30">
                    <p className="text-xs font-medium text-brg mb-0.5">Why this matters</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{cert.relevance}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(i)}
                  className={`p-2 rounded-full border shrink-0 transition-colors ${
                    cert.done
                      ? "bg-brg border-brg text-white"
                      : "border-border text-text-muted hover:border-brg hover:text-brg"
                  }`}
                  title={cert.done ? "Mark as incomplete" : "Mark as done"}
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
