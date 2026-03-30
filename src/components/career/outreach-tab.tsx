"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, RefreshCw } from "lucide-react";

interface OutreachResult {
  subject: string;
  email: string;
  starters: string[];
}

export function OutreachTab() {
  const [target, setTarget] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const generate = async () => {
    if (!target.trim() || !context.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, context }),
      });
      const data = await res.json();
      if (!data.error) setResult(data);
    } catch {}
    setLoading(false);
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Who are you reaching out to?</Label>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Name, company, role..."
            className="mt-1 bg-cream-light border-border"
          />
        </div>
        <div>
          <Label>What&apos;s the context?</Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Cold outreach for internship, following up after LinkedIn connection..."
            className="mt-1 bg-cream-light border-border min-h-[80px]"
          />
        </div>
      </div>

      <Button
        onClick={generate}
        disabled={loading || !target.trim() || !context.trim()}
        className="bg-racing-red hover:bg-racing-red/90 text-white"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Generating...
          </>
        ) : result ? (
          <>
            <RefreshCw size={16} className="mr-2" />
            Re-generate
          </>
        ) : (
          "Generate Outreach"
        )}
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="bg-cream-light border border-border rounded-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-brg uppercase">
                Email Draft
              </span>
              <button
                onClick={() =>
                  copy(
                    `Subject: ${result.subject}\n\n${result.email}`,
                    "email"
                  )
                }
                className="text-text-muted hover:text-brg"
              >
                {copiedItem === "email" ? (
                  <span className="text-xs text-brg">Copied!</span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <p className="text-sm font-medium text-text-primary mb-2">
              Subject: {result.subject}
            </p>
            <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
              {result.email}
            </p>
          </div>

          <div className="bg-cream-light border border-border rounded-card p-5">
            <span className="text-xs font-medium text-brg uppercase mb-3 block">
              Conversation Starters
            </span>
            <div className="space-y-3">
              {result.starters.map((starter, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0"
                >
                  <p className="text-sm text-text-primary">{starter}</p>
                  <button
                    onClick={() => copy(starter, `starter-${i}`)}
                    className="text-text-muted hover:text-brg shrink-0"
                  >
                    {copiedItem === `starter-${i}` ? (
                      <span className="text-xs text-brg">Copied!</span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
