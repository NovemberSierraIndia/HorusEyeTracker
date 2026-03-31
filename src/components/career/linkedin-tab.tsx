"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLinkedInPosts, saveLinkedInPosts } from "@/lib/career-storage";
import { Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";

const SUGGESTED_TOPICS = [
  "EV transition in motorsport",
  "AI-driven predictive maintenance in F1",
  "Digital twins in automotive manufacturing",
  "Why motorsport is the ultimate innovation lab",
  "The future of fan engagement in racing",
  "Data strategy for automotive OEMs",
  "Luxury brands and digital transformation",
  "What F1 taught me about leadership",
];

export function LinkedInTab() {
  const [posts, setPosts] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPosts(getLinkedInPosts());
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
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
      if (data.error) {
        setError(data.error);
      } else if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
        saveLinkedInPosts(data.posts);
      } else {
        setError("No posts were generated. Try again.");
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    }
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

      {/* Suggested topics */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-text-muted" />
          <span className="text-xs text-text-muted">Suggested topics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                topic === t
                  ? "bg-brg text-white border-brg"
                  : "bg-cream-light border-border text-text-secondary hover:border-brg hover:text-brg"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
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
          ) : posts.length > 0 ? (
            <>
              <RefreshCw size={16} className="mr-2" />
              Re-generate Posts
            </>
          ) : (
            "Generate Posts"
          )}
        </Button>
        {error && (
          <span className="text-xs text-racing-red">{error}</span>
        )}
      </div>

      {posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div
              key={i}
              className="bg-cream-light border border-border rounded-card p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-brg uppercase tracking-wide">
                  Post {i + 1}
                </span>
                <button
                  onClick={() => copyPost(i)}
                  className="text-text-muted hover:text-brg transition-colors flex items-center gap-1"
                >
                  {copied === i ? (
                    <span className="text-xs text-brg font-medium">Copied!</span>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="text-xs">Copy</span>
                    </>
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
