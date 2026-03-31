"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLinkedInPosts,
  saveLinkedInPosts,
  getPastPosts,
  addPastPost,
  removePastPost,
  getSmartTopics,
  saveSmartTopics,
} from "@/lib/career-storage";
import {
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react";

const STATIC_TOPICS = [
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

  // Past posts state
  const [pastPosts, setPastPosts] = useState<string[]>([]);
  const [newPastPost, setNewPastPost] = useState("");
  const [pastPostsOpen, setPastPostsOpen] = useState(false);

  // Smart topics state
  const [smartTopics, setSmartTopics] = useState<string[]>([]);
  const [suggestingTopics, setSuggestingTopics] = useState(false);

  useEffect(() => {
    setPosts(getLinkedInPosts());
    setPastPosts(getPastPosts());
    setSmartTopics(getSmartTopics());
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

  const handleAddPastPost = () => {
    if (!newPastPost.trim()) return;
    setPastPosts(addPastPost(newPastPost));
    setNewPastPost("");
  };

  const handleRemovePastPost = (index: number) => {
    setPastPosts(removePastPost(index));
  };

  const generateSmartTopics = async () => {
    if (pastPosts.length === 0) return;
    setSuggestingTopics(true);
    try {
      const res = await fetch("/api/ai/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pastPosts }),
      });
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        setSmartTopics(data.topics);
        saveSmartTopics(data.topics);
      }
    } catch {
      // silently fail
    }
    setSuggestingTopics(false);
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

      {/* Past Posts Section */}
      <div className="border border-border rounded-card overflow-hidden">
        <button
          onClick={() => setPastPostsOpen(!pastPostsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-cream-light hover:bg-cream-light/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-brg" />
            <span className="text-sm font-medium text-text-primary">
              My Past Posts
            </span>
            {pastPosts.length > 0 && (
              <span className="text-xs text-text-muted bg-cream border border-border rounded-full px-2 py-0.5">
                {pastPosts.length} saved
              </span>
            )}
          </div>
          {pastPostsOpen ? (
            <ChevronUp size={14} className="text-text-muted" />
          ) : (
            <ChevronDown size={14} className="text-text-muted" />
          )}
        </button>

        {pastPostsOpen && (
          <div className="p-4 border-t border-border space-y-3">
            <p className="text-xs text-text-muted">
              Paste your previous LinkedIn posts here. The AI will analyze your writing style and themes to suggest what to write next.
            </p>

            {/* Add new past post */}
            <div className="space-y-2">
              <textarea
                value={newPastPost}
                onChange={(e) => setNewPastPost(e.target.value)}
                placeholder="Paste a previous LinkedIn post here..."
                className="w-full bg-cream-light border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-1 focus:ring-brg"
              />
              <Button
                onClick={handleAddPastPost}
                disabled={!newPastPost.trim()}
                size="sm"
                className="bg-brg hover:bg-brg/90 text-white"
              >
                <Plus size={14} className="mr-1" />
                Save Post
              </Button>
            </div>

            {/* List of saved past posts */}
            {pastPosts.length > 0 && (
              <div className="space-y-2 pt-2">
                {pastPosts.map((post, i) => (
                  <div
                    key={i}
                    className="bg-cream border border-border rounded-lg p-3 relative group"
                  >
                    <button
                      onClick={() => handleRemovePastPost(i)}
                      className="absolute top-2 right-2 p-1 rounded-full text-text-muted hover:text-racing-red hover:bg-racing-red/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove post"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-xs text-text-secondary line-clamp-3 pr-6">
                      {post}
                    </p>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      Post {i + 1} · {post.split(/\s+/).length} words
                    </span>
                  </div>
                ))}

                {/* Generate smart suggestions button */}
                <Button
                  onClick={generateSmartTopics}
                  disabled={suggestingTopics}
                  size="sm"
                  variant="outline"
                  className="border-brg text-brg hover:bg-brg/10 mt-1"
                >
                  {suggestingTopics ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                      Analyzing your posts...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-1.5" />
                      {smartTopics.length > 0
                        ? "Refresh Smart Suggestions"
                        : "Get Smart Suggestions"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topic, Tone, Audience inputs */}
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

      {/* Smart suggestions (from past posts) */}
      {smartTopics.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Brain size={12} className="text-brg" />
            <span className="text-xs text-brg font-medium">
              Based on your past posts
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartTopics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  topic === t
                    ? "bg-brg text-white border-brg"
                    : "bg-brg/5 border-brg/30 text-brg hover:bg-brg/15 hover:border-brg"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Static topic suggestions */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-text-muted" />
          <span className="text-xs text-text-muted">Suggested topics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATIC_TOPICS.map((t) => (
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
        {error && <span className="text-xs text-racing-red">{error}</span>}
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
