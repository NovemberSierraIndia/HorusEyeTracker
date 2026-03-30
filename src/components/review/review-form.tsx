"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { WeeklyReview, saveReview } from "@/lib/review-storage";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  weekKey: string;
  existingReview?: WeeklyReview;
  onSaved: (review: WeeklyReview) => void;
}

const questions = [
  { key: "win", label: "What was my single most important win this week?" },
  {
    key: "uncomfortable",
    label: "What uncomfortable action did I take — or avoid?",
  },
  {
    key: "careerForward",
    label: "Did I move my career forward in a concrete way? How?",
  },
  {
    key: "wastedTime",
    label: "What did I waste time on that I should eliminate?",
  },
  {
    key: "alignmentScore",
    label:
      "On a scale of 1–10, how aligned was my week with where I want to be in 3 years?",
    type: "slider" as const,
  },
  {
    key: "nextWeekAction",
    label: "What is the one non-negotiable action I will take next week?",
  },
  {
    key: "underratedResult",
    label: "What result am I not giving myself enough credit for?",
  },
];

export function ReviewForm({ weekKey, existingReview, onSaved }: ReviewFormProps) {
  const [answers, setAnswers] = useState({
    win: existingReview?.answers.win || "",
    uncomfortable: existingReview?.answers.uncomfortable || "",
    careerForward: existingReview?.answers.careerForward || "",
    wastedTime: existingReview?.answers.wastedTime || "",
    alignmentScore: existingReview?.answers.alignmentScore || 5,
    nextWeekAction: existingReview?.answers.nextWeekAction || "",
    underratedResult: existingReview?.answers.underratedResult || "",
  });
  const [saving, setSaving] = useState(false);

  const updateAnswer = (key: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    const review: WeeklyReview = {
      weekKey,
      answers,
      reflection: existingReview?.reflection,
      savedAt: new Date().toISOString(),
    };
    saveReview(review);
    onSaved(review);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div
          key={q.key}
          className="bg-cream-light border border-border rounded-card p-5"
        >
          <Label className="text-sm font-medium text-text-primary block mb-3">
            {q.label}
          </Label>
          {q.type === "slider" ? (
            <div className="space-y-3">
              <Slider
                value={[answers.alignmentScore]}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  updateAnswer("alignmentScore", v);
                }}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs font-mono text-text-muted">
                <span>1</span>
                <span className="text-lg font-medium text-brg">
                  {answers.alignmentScore}
                </span>
                <span>10</span>
              </div>
            </div>
          ) : (
            <Textarea
              value={answers[q.key as keyof typeof answers] as string}
              onChange={(e) => updateAnswer(q.key, e.target.value)}
              placeholder="Be honest with yourself..."
              className="bg-cream border-border min-h-[80px]"
            />
          )}
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-racing-red hover:bg-racing-red/90 text-white w-full sm:w-auto"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Review"
        )}
      </Button>
    </div>
  );
}
