"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, BarChart3, ArrowRight } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface QuizQuestion {
  id: number;
  text: string;
  options: { value: string; label: string; desc: string }[];
}

const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    text: "How would you describe your current wardrobe?",
    options: [
      { value: "minimal", label: "Curated Minimalist", desc: "Few pieces, each intentional" },
      { value: "eclectic", label: "Eclectic Mix", desc: "Variety of styles and eras" },
      { value: "classic", label: "Classic Foundation", desc: "Timeless staples" },
      { value: "trendy", label: "Trend Forward", desc: "Current fashion driven" },
    ],
  },
  {
    id: 2,
    text: "What's your ideal silhouette?",
    options: [
      { value: "tailored", label: "Tailored & Structured", desc: "Sharp lines, defined shapes" },
      { value: "flowing", label: "Flowing & Soft", desc: "Draped, relaxed, comfortable" },
      { value: "balanced", label: "Balanced Proportions", desc: "Equal volume top and bottom" },
      { value: "statement", label: "Statement Focus", desc: "One bold piece per outfit" },
    ],
  },
  {
    id: 3,
    text: "Which color palette draws you?",
    options: [
      { value: "neutral", label: "Neutrals & Earth", desc: "Beige, taupe, olive, brown" },
      { value: "mono", label: "Monochromatic", desc: "Single hue in varied tones" },
      { value: "jewel", label: "Jewel Tones", desc: "Sapphire, emerald, amethyst" },
      { value: "pastel", label: "Soft Pastels", desc: "Muted pinks, lavenders, blues" },
    ],
  },
  {
    id: 4,
    text: "How do you accessorize?",
    options: [
      { value: "minimal", label: "Barely There", desc: "One ring, no necklace" },
      { value: "signature", label: "Signature Piece", desc: "One statement accessory" },
      { value: "layered", label: "Layered & Mixed", desc: "Stacked rings, layered chains" },
      { value: "bold", label: "Bold & Oversized", desc: "Chunky jewelry, big bags" },
    ],
  },
  {
    id: 5,
    text: "What's your shopping philosophy?",
    options: [
      { value: "investment", label: "Investment Buyer", desc: "Expensive, long-lasting pieces" },
      { value: "thrifty", label: "Thrifty Curator", desc: "Vintage and second-hand gems" },
      { value: "trend", label: "Trend Chaser", desc: "Fast fashion, seasonal updates" },
      { value: "capsule", label: "Capsule Planner", desc: "Minimal purchases, maximum utility" },
    ],
  },
];

const RESULTS: Record<string, { title: string; desc: string; icon: string }> = {
  minimal: { title: "THE MINIMALIST", desc: "You value quality over quantity. Your style is clean, intentional, and effortlessly sophisticated. You understand that true style comes from restraint and impeccable curation.", icon: "○" },
  eclectic: { title: "THE ECLECTIC", desc: "You're a creative mixer who draws from every era and influence. Your style tells a story — each piece has a past and a purpose. You're not afraid to break rules.", icon: "✦" },
  classic: { title: "THE CLASSIC", desc: "Timeless elegance defines you. You invest in pieces that transcend seasons and trends. Your style is polished, reliable, and always appropriate.", icon: "◆" },
  trendy: { title: "THE TREND SETTER", desc: "You're ahead of the curve, always first to spot emerging styles. Fashion is your playground and you use it to express your dynamic personality.", icon: "★" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function StyleQuizPage() {
  const { addToast } = useToast();
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const startQuiz = () => setStep("quiz");

  const selectOption = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    if (currentQuestion < QUIZ_DATA.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const vals = Object.values({ ...answers, [currentQuestion]: value });
      const counts: Record<string, number> = {};
      vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      const topResult = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(topResult);
      setStep("result");
      addToast("Quiz complete!", "success");
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const resetQuiz = () => {
    setStep("intro");
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const progress = Object.keys(answers).length / QUIZ_DATA.length;

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // STYLE QUIZ</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Sparkles className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            STYLE <span className="text-gradient-aurum">QUIZ.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Discover your personal style archetype.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div key="intro" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
            className="glass-card p-8 text-center space-y-6 max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-[var(--accent-aurum)] mx-auto" />
            <h2 className="type-display text-[var(--text-primary)]">FIND YOUR STYLE</h2>
            <p className="text-[var(--text-muted)] type-body">Answer 5 quick questions and we'll identify your personal style archetype.</p>
            <button onClick={startQuiz} className="btn-nexus">START QUIZ</button>
          </motion.div>
        )}

        {step === "quiz" && (
          <motion.div key="quiz" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                <span>QUESTION {currentQuestion + 1} OF {QUIZ_DATA.length}</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1 bg-[var(--bg-tertiary)] overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                <h3 className="type-display text-[var(--text-primary)] text-lg mb-6">{QUIZ_DATA[currentQuestion].text}</h3>
                <div className="space-y-3">
                  {QUIZ_DATA[currentQuestion].options.map(opt => (
                    <button key={opt.value} onClick={() => selectOption(opt.value)}
                      className="w-full text-left p-4 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus hover:border-[var(--accent-aurum)]/40 transition-all group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="type-body text-[var(--text-primary)]">{opt.label}</p>
                          <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--border-primary)] group-hover:border-[var(--accent-aurum)] flex items-center justify-center">
                          {answers[currentQuestion] === opt.value && (
                            <div className="w-3 h-3 rounded-full bg-[var(--accent-aurum)]" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-6">
              <button onClick={prevQuestion} disabled={currentQuestion === 0}
                className="btn-outline disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
              <button onClick={resetQuiz} className="btn-outline">
                <RotateCcw className="w-4 h-4" /> RESET
              </button>
            </div>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div key="result" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -10 }}
            className="glass-card p-8 text-center max-w-lg mx-auto space-y-6">
            <span className="text-4xl">{RESULTS[result].icon}</span>
            <h2 className="type-display text-[var(--text-primary)]">{RESULTS[result].title}</h2>
            <p className="text-[var(--text-muted)] type-body">{RESULTS[result].desc}</p>
            <div className="flex justify-center gap-3">
              <button onClick={resetQuiz} className="btn-outline">
                <RotateCcw className="w-4 h-4" /> RETRY
              </button>
              <Link href="/dashboard/recommendations" className="btn-nexus">
                RECOMMENDATIONS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
