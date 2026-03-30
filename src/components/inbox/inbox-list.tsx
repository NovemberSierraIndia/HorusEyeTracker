"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

interface EmailDetail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  isHtml: boolean;
}

export function InboxList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    fetch("/api/gmail/inbox")
      .then((r) => r.json())
      .then((d) => setEmails(d.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openEmail = async (id: string) => {
    setLoadingEmail(true);
    setPanelOpen(true);
    try {
      const res = await fetch(`/api/gmail/message/${id}`);
      const data = await res.json();
      setSelectedEmail(data);
    } catch {
      setSelectedEmail(null);
    } finally {
      setLoadingEmail(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const extractName = (from: string) => {
    const match = from.match(/^"?([^"<]+)"?\s*</);
    return match ? match[1].trim() : from.split("@")[0];
  };

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <h2 className="text-lg font-medium text-text-primary mb-4">Inbox</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-cream rounded-lg animate-pulse" />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <p className="text-text-muted text-sm">No emails found.</p>
      ) : (
        <div className="divide-y divide-border">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => openEmail(email.id)}
              className="w-full text-left py-3 px-2 hover:bg-cream transition-colors flex items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      email.isUnread
                        ? "font-semibold text-text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {extractName(email.from)}
                  </p>
                  <span className="font-mono text-xs text-text-muted whitespace-nowrap">
                    {formatDate(email.date)}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    email.isUnread ? "font-medium text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {email.subject || "(No subject)"}
                </p>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {email.snippet}
                </p>
              </div>
              {email.isUnread && (
                <span className="w-2 h-2 rounded-full bg-racing-red mt-2 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-cream-light overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-text-primary">
              {selectedEmail?.subject || "Loading..."}
            </SheetTitle>
          </SheetHeader>
          {loadingEmail ? (
            <div className="h-48 bg-cream rounded-lg animate-pulse mt-4" />
          ) : selectedEmail ? (
            <div className="mt-4 space-y-3">
              <div className="text-sm text-text-secondary">
                <p>
                  <span className="font-medium">From:</span> {selectedEmail.from}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(selectedEmail.date)}
                </p>
              </div>
              <div className="border-t border-border pt-3">
                {selectedEmail.isHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-text-primary"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-text-primary font-sans">
                    {selectedEmail.body}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <p className="text-text-muted mt-4">Could not load email.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
