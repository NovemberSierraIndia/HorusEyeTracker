"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLinkedInPosts, saveLinkedInPosts } from "@/lib/career-storage";
import { Copy, Loader2, RefreshCw } from "lucide-react";

export function LinkedInTab() {
  const [posts, setPosts] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
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
        body: JSON.stringify({
          topic: topic || undefined,
          tone,
          audience: audience || undefined,
        }),
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
    <div className="space-y-4">
      <div className="bg-cream-light border border-border rounded-card p-4">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">Your profile:</span>{" "}
          Automotive digital transformation | Master&apos;s student at LUISS |
          Targeting senior roles in performance automotive &amp; motorsport
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Topic / Angle</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. EV transition in motorsport"
            className="mt-1 bg-cream-light border-border"
          />
        </div>
        <div>
          <Label className="text-xs">Tone</Label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-1 block w-full bg-cream-light border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="professional">Professional</option>
            <option value="thought-leadership">Thought Leadership</option>
            <option value="storytelling">Storytelling</option>
            <option value="bold">Bold / Provocative</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Target Audience</Label>
          <Input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. F1 engineers, recruiters"
            className="mt-1 bg-cream-light border-border"
          />
        </div>
      </div>

      <div className="flex gap-2">
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
          ) : posts.length > 0 ? (
            <>
              <RefreshCw size={16} className="mr-2" />
              Re-generate Posts
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
