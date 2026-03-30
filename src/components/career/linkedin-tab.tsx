"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLinkedInPosts, saveLinkedInPosts } from "@/lib/career-storage";
import { Copy, Loader2 } from "lucide-react";

export function LinkedInTab() {
  const [posts, setPosts] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    setPosts(getLinkedInPosts());
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || undefined }),
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        saveLinkedInPosts(data.posts);
      }
    } catch {}
    setLoading(false);
  };

  const copyPost = (index: number) => {
    navigator.clipboard.writeText(posts[index]);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-cream-light border border-border rounded-card p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Context:</span>{" "}
          Automotive digital transformation | Master&apos;s student at LUISS |
          Targeting senior roles in performance automotive
        </p>
      </div>

      <div className="flex gap-3">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional: specific topic or angle..."
          className="bg-cream-light border-border"
        />
        <Button
          onClick={generate}
          disabled={loading}
          className="bg-racing-red hover:bg-racing-red/90 text-white whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Posts"
          )}
        </Button>
      </div>

      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div
              key={i}
              className="bg-cream-light border border-border rounded-card p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-brg uppercase">
                  Post {i + 1}
                </span>
                <button
                  onClick={() => copyPost(i)}
                  className="text-text-muted hover:text-brg transition-colors"
                >
                  {copied === i ? (
                    <span className="text-xs text-brg">Copied!</span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {post}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
