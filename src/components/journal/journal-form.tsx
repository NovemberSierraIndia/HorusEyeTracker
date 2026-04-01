"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  JournalEntry,
  getTodayKey,
  getEntry,
  saveEntry,
} from "@/lib/journal-storage";
import { Save, ChevronLeft, ChevronRight, Check } from "lucide-react";

const MOOD_LABELS: { max: number; emoji: string; label: string }[] = [
  { max: 1, emoji: "😞", label: "Rough" },
  { max: 3, emoji: "😔", label: "Low" },
  { max: 5, emoji: "😐", label: "Okay" },
  { max: 7, emoji: "🙂", label: "Good" },
  { max: 9, emoji: "😊", label: "Great" },
  { max: 10, emoji: "🔥", label: "On Fire" },
];

function getMoodInfo(mood: number) {
  return MOOD_LABELS.find((m) => mood <= m.max) || MOOD_LABELS[MOOD_LABELS.length - 1];
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function JournalForm() {
  const [dateKey, setDateKey] = useState(getTodayKey());
  const [mood, setMood] = useState(5);
  const [doneGreat, setDoneGreat] = useState("");
  const [wins, setWins] = useState("");
  const [doneBetter, setDoneBetter] = useState("");
  const [gratefulFor, setGratefulFor] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const loadEntry = useCallback((key: string) => {
    const existing = getEntry(key);
    if (existing) {
      setMood(existing.mood);
      setDoneGreat(existing.doneGreat);
      setWins(existing.wins);
      setDoneBetter(existing.doneBetter);
      setGratefulFor(existing.gratefulFor);
      setHasExisting(true);
    } else {
      setMood(5);
      setDoneGreat("");
      setWins("");
      setDoneBetter("");
      setGratefulFor("");
      setHasExisting(false);
    }
    setSaved(false);
  }, []);

  useEffect(() => {
    loadEntry(dateKey);
  }, [dateKey, loadEntry]);

  const handleSave = () => {
    const entry: JournalEntry = {
      dateKey,
      mood,
      doneGreat,
      wins,
      doneBetter,
      gratefulFor,
      savedAt: new Date().toISOString(),
    };
    saveEntry(entry);
    setSaved(true);
    setHasExisting(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isToday = dateKey === getTodayKey();
  const isFuture = dateKey > getTodayKey();
  const moodInfo = getMoodInfo(mood);

  return (
    <div className="space-y-6">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDateKey(shiftDate(dateKey, -1))}
          className="p-2 rounded-lg border border-border hover:bg-cream-light transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">
            {formatDateLabel(dateKey)}
          </p>
          {isToday && (
            <span className="text-xs text-brg font-medium">Today</span>
          )}
          {hasExisting && !isToday && (
            <span className="text-xs text-text-muted">Saved entry</span>
          )}
        </div>
        <button
          onClick={() => setDateKey(shiftDate(dateKey, 1))}
          disabled={isToday || isFuture}
          className="p-2 rounded-lg border border-border hover:bg-cream-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isFuture ? (
        <div className="text-center py-12 text-text-muted text-sm">
          Can&apos;t journal for a future date.
        </div>
      ) : (
        <>
          {/* Mood slider */}
          <div className="bg-cream-light border border-border rounded-card p-5">
            <Label className="text-sm font-medium text-text-primary block mb-3">
              How did you feel today?
            </Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={10}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="flex-1 accent-brg h-2 cursor-pointer"
              />
              <div className="flex items-center gap-2 min-w-[100px] justify-end">
                <span className="text-2xl">{moodInfo.emoji}</span>
                <div className="text-right">
                  <span className="text-lg font-semibold text-text-primary">
                    {mood}
                  </span>
                  <span className="text-xs text-text-muted block">
                    {moodInfo.label}
                  </span>
                </div>
              </div>
            </div>
            {/* Mood scale indicators */}
            <div className="flex justify-between mt-2 px-1">
              {Array.from({ length: 11 }, (_, i) => (
                <span
                  key={i}
                  className={`text-[10px] ${
                    i === mood ? "text-brg font-bold" : "text-text-muted"
                  }`}
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Journal prompts */}
          <div className="space-y-4">
            <JournalTextarea
              label="What did I do great today?"
              placeholder="Describe what went well, what you're proud of..."
              value={doneGreat}
              onChange={setDoneGreat}
              accentColor="brg"
            />
            <JournalTextarea
              label="What are some wins (even small) I had today?"
              placeholder="List your wins — one per line..."
              value={wins}
              onChange={setWins}
              accentColor="racing-red"
            />
            <JournalTextarea
              label="What could I have done better?"
              placeholder="Be honest but kind to yourself..."
              value={doneBetter}
              onChange={setDoneBetter}
              accentColor="[#1B3A5C]"
            />
            <JournalTextarea
              label="What am I grateful for?"
              placeholder="People, moments, opportunities..."
              value={gratefulFor}
              onChange={setGratefulFor}
              accentColor="brg"
            />
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            className={`w-full transition-colors ${
              saved
                ? "bg-brg hover:bg-brg text-white"
                : "bg-racing-red hover:bg-racing-red/90 text-white"
            }`}
          >
            {saved ? (
              <>
                <Check size={16} className="mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {hasExisting ? "Update Entry" : "Save Entry"}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}

function JournalTextarea({
  label,
  placeholder,
  value,
  onChange,
  accentColor,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}) {
  return (
    <div className={`border-l-3 border-${accentColor} pl-4`}>
      <Label className="text-sm font-medium text-text-primary block mb-1.5">
        {label}
      </Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-cream-light border border-border rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-brg min-h-[80px]"
      />
    </div>
  );
}
