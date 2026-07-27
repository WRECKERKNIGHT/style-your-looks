"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: { id: string; label: string; icon: string; description: string }[];
}

interface StylePreferences {
  bodyType?: string;
  lifestyle?: string;
  preferredFit?: string;
  colorComfort?: string;
  budget?: string;
  wardrobeGoal?: string;
  patternPreference?: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "bodyType",
    category: "BODY",
    question: "How would you describe your build?",
    options: [
      { id: "lean", label: "Lean & Tall", icon: "\u{1F4CF}", description: "Slim frame, longer proportions" },
      { id: "athletic", label: "Athletic", icon: "\u{1F4AA}", description: "Broad shoulders, defined muscles" },
      { id: "stocky", label: "Stocky & Compact", icon: "\u{1F9F1}", description: "Solid, wider midsection" },
      { id: "curvy", label: "Curvy", icon: "\u{1F30A}", description: "Balanced curves, defined waist" },
    ],
  },
  {
    id: "lifestyle",
    category: "LIFESTYLE",
    question: "What does your typical week look like?",
    options: [
      { id: "office", label: "Office & Meetings", icon: "\u{1F4BC}", description: "Professional settings daily" },
      { id: "creative", label: "Creative & Casual", icon: "\u{1F3A8}", description: "Flexible dress code, self-expression" },
      { id: "active", label: "Active & On-the-Go", icon: "\u{1F3C3}", description: "Moving around, practical needs" },
      { id: "mixed", label: "Mixed & Varied", icon: "\u{1F3AD}", description: "Different settings every day" },
    ],
  },
  {
    id: "preferredFit",
    category: "FIT",
    question: "What fit feels most comfortable?",
    options: [
      { id: "slim", label: "Slim & Tailored", icon: "\u2702\uFE0F", description: "Close to the body, structured" },
      { id: "regular", label: "Regular & Relaxed", icon: "\u{1F455}", description: "Classic fit, room to move" },
      { id: "oversized", label: "Oversized & Flowy", icon: "\u{1F32C}\uFE0F", description: "Loose, relaxed silhouette" },
      { id: "varied", label: "Depends on Piece", icon: "\u{1F504}", description: "Mix of fits depending on garment" },
    ],
  },
  {
    id: "colorComfort",
    category: "COLOR",
    question: "How do you feel about bold colors?",
    options: [
      { id: "neutral", label: "Love Neutrals", icon: "\u{1F90D}", description: "Black, white, grey, navy, tan" },
      { id: "earth", label: "Earth Tones", icon: "\u{1F342}", description: "Browns, greens, rusts, olives" },
      { id: "jewel", label: "Jewel Tones", icon: "\u{1F48E}", description: "Rich blues, burgundies, emeralds" },
      { id: "adventurous", label: "Color-Adventurous", icon: "\u{1F308}", description: "Happy to try anything bold" },
    ],
  },
  {
    id: "budget",
    category: "INVESTMENT",
    question: "How do you approach clothing purchases?",
    options: [
      { id: "invest", label: "Invest in Quality", icon: "\u{1F3F7}\uFE0F", description: "Fewer, better pieces that last" },
      { id: "mix", label: "High-Low Mix", icon: "\u2696\uFE0F", description: "Investment pieces + affordable basics" },
      { id: "value", label: "Value-Focused", icon: "\u{1F4B0}", description: "Good style doesn't require high prices" },
      { id: "trend", label: "Trend-Driven", icon: "\u{1F4C8}", description: "Stay current, rotate often" },
    ],
  },
  {
    id: "wardrobeGoal",
    category: "GOAL",
    question: "What's your primary wardrobe goal?",
    options: [
      { id: "sharp", label: "Look Sharp Daily", icon: "\u2728", description: "Put-together with minimal effort" },
      { id: "standout", label: "Stand Out", icon: "\u{1F31F}", description: "Memorable, conversation-starting outfits" },
      { id: "versatile", label: "Maximum Versatility", icon: "\u{1F504}", description: "Few pieces, many combinations" },
      { id: "timeless", label: "Timeless Elegance", icon: "\u{1F3A9}", description: "Classic style that never dates" },
    ],
  },
  {
    id: "patternPreference",
    category: "DETAILS",
    question: "What about patterns and textures?",
    options: [
      { id: "solid", label: "Mostly Solids", icon: "\u{1F7EB}", description: "Clean, unpatterned fabrics" },
      { id: "subtle", label: "Subtle Patterns", icon: "\u{1F50D}", description: "Herringbone, subtle stripes, textures" },
      { id: "statement", label: "Statement Patterns", icon: "\u{1F3AF}", description: "Bold prints, geometric, floral" },
      { id: "mixed", label: "Pattern Mixing", icon: "\u{1F9E9}", description: "Confident combining different patterns" },
    ],
  },
];

const STORAGE_KEY = "aurastyle_preferences";

function getSavedPreferences(): StylePreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePreferences(prefs: StylePreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function StyleQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<StylePreferences>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = getSavedPreferences();
    if (Object.keys(saved).length > 0) {
      setAnswers(saved);
    }
  }, []);

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      savePreferences(answers);
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setAnswers({});
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="space-y-8">
        <div>
          <span className="section-number">EST. MMXXIV // STYLE QUIZ</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <ClipboardList className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              STYLE <span className="text-gradient-gold">COMPLETE.</span>
            </h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream p-10 border border-tan vintage-border rounded-sm text-center"
        >
          <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber/20">
            <Check className="w-8 h-8 text-amber" />
          </div>
          <h2 className="text-2xl font-display font-bold text-espresso mb-3">PREFERENCES SAVED</h2>
          <p className="text-coffee font-body max-w-md mx-auto mb-8">
            Your style preferences have been saved. They will help personalize outfit recommendations and future features.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {QUESTIONS.map((q) => {
              const answer = answers[q.id as keyof StylePreferences];
              const option = q.options.find((o) => o.id === answer);
              return (
                <div key={q.id} className="bg-parchment p-4 border border-tan rounded-sm">
                  <span className="text-[0.6rem] font-mono text-coffee tracking-widest uppercase block mb-1">{q.category}</span>
                  <p className="text-sm font-display font-bold text-espresso">{option?.icon} {option?.label || "\u2014"}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetake}
              className="px-6 py-3 bg-parchment text-espresso font-body text-sm font-bold tracking-wider border border-tan rounded-sm hover:bg-tan/20 transition-colors"
            >
              RETAKE QUIZ
            </button>
            <button
              onClick={() => window.location.href = "/dashboard/recommendations"}
              className="px-6 py-3 bg-amber text-cream font-body text-sm font-bold tracking-wider rounded-sm hover:bg-amber/90 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              SEE RECOMMENDATIONS
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // STYLE QUIZ</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <ClipboardList className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            STYLE <span className="text-gradient-gold">QUIZ.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Answer a few questions to help us personalize your style recommendations.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-cream p-6 border border-tan vintage-border rounded-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-body text-coffee tracking-wider uppercase">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs font-mono text-amber">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-parchment rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex gap-1.5 mt-3">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-amber" : "bg-tan/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-cream p-10 border border-tan vintage-border rounded-sm"
        >
          <span className="text-xs font-mono text-amber tracking-widest uppercase mb-2 block">
            {question.category}
          </span>
          <h2 className="text-2xl font-display font-bold text-espresso mb-8">
            {question.question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map((option) => {
              const isSelected = answers[question.id as keyof StylePreferences] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(question.id, option.id)}
                  className={`p-5 text-left rounded-sm border transition-all duration-300 ${
                    isSelected
                      ? "bg-amber/10 border-amber shadow-gold"
                      : "bg-parchment border-tan hover:border-amber/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`text-sm font-display font-bold tracking-wider ${isSelected ? "text-amber" : "text-espresso"}`}>
                      {option.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber ml-auto" />}
                  </div>
                  <p className="text-xs text-coffee font-body ml-11">{option.description}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-5 py-3 bg-parchment text-espresso font-body text-sm font-bold tracking-wider border border-tan rounded-sm hover:bg-tan/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[question.id as keyof StylePreferences]}
          className="flex items-center gap-2 px-6 py-3 bg-amber text-cream font-body text-sm font-bold tracking-wider rounded-sm hover:bg-amber/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {currentStep === QUESTIONS.length - 1 ? "SAVE" : "NEXT"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
