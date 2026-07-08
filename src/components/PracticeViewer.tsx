"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, X, Volume2, RotateCcw, HelpCircle, ArrowRight, CornerDownRight, Keyboard, Award } from "lucide-react";
import { Card } from "@/data/mockCards";

interface PracticeViewerProps {
  cards: Card[];
}

export default function PracticeViewer({ cards }: PracticeViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentCard = cards[currentIndex];

  // Autofocus input field on card load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isFinished]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasChecked || !userAnswer.trim()) return;

    const cleanInput = userAnswer.toLowerCase().trim();
    const cleanCorrect = currentCard.word.toLowerCase().trim();
    const isAnswerRight = cleanInput === cleanCorrect;

    setIsCorrect(isAnswerRight);
    setHasChecked(true);

    if (isAnswerRight) {
      setScore((prev) => prev + 1);
      // Auto speak correct word for auditory reinforcement
      speakWord(currentCard.word);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setHasChecked(false);
      setIsCorrect(false);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleTryAgain = () => {
    setUserAnswer("");
    setHasChecked(false);
    setIsCorrect(false);
    // Autofocus input again
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setHasChecked(false);
    setIsCorrect(false);
    setShowAnswer(false);
    setScore(0);
    setIsFinished(false);
  };

  const speakWord = (word: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = 
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en-")) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / cards.length) * 100);
    let title = "Hoàn thành Luyện Viết! ✍️";
    let desc = "Luyện gõ giúp bạn ghi nhớ cách viết từ vựng cực kỳ sâu sắc.";
    
    if (percentage === 100) {
      title = "Tuyệt đỉnh chính tả! 🏆";
      desc = "Bạn đã viết chính xác 100% tất cả các từ vựng này!";
    } else if (percentage >= 70) {
      title = "Kết quả rất tốt! 👏";
      desc = "Bạn đã viết đúng hầu hết từ vựng khó của bài học.";
    }

    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-indigo-500 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg">
          <Award className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {desc}
          </p>
        </div>

        {/* Score Display */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/40 dark:border-slate-700/40 flex justify-around items-center">
          <div className="text-center">
            <span className="block text-3xl font-extrabold text-indigo-650 dark:text-indigo-400">
              {score} / {cards.length}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Đúng chính tả
            </span>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="block text-3xl font-extrabold text-rose-500 dark:text-rose-400">
              {percentage}%
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tỷ lệ
            </span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-100 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Luyện lại từ đầu
        </button>
      </div>
    );
  }

  if (!currentCard) return null;

  const showAnswerReveal = showAnswer || (hasChecked && isCorrect);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 px-4">
      {/* Header Info */}
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        <span>Từ vựng: {currentIndex + 1} / {cards.length}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 uppercase tracking-wider font-bold">
          Từ loại: {currentCard.pos}
        </span>
      </div>

      {/* Main card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-200/40 dark:border-slate-800/40">
        
        {/* Vietnamese Meaning Prompt */}
        <div className="space-y-2 text-center py-4">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-500 dark:text-indigo-455">
            Dịch nghĩa tiếng Việt:
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            {currentCard.meaning}
          </h3>
        </div>

        {/* Input Form */}
        <form onSubmit={hasChecked ? (e) => { e.preventDefault(); handleNext(); } : handleCheck} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={hasChecked}
              placeholder="Gõ từ tiếng Anh tương ứng..."
              className={`w-full px-4 py-3.5 rounded-2xl border text-base font-bold text-center focus:outline-none transition-all duration-300 disabled:opacity-100 ${
                hasChecked
                  ? isCorrect
                    ? "bg-emerald-50/55 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400"
                    : "bg-rose-50/55 dark:bg-rose-950/20 border-rose-400 dark:border-rose-800/50 text-rose-850 dark:text-rose-400"
                  : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              }`}
            />
            <div className="absolute right-3.5 top-3.5 text-slate-300 dark:text-slate-700 pointer-events-none">
              <Keyboard className="w-5 h-5" />
            </div>
          </div>

          {/* Action Button (Submit Check) */}
          {!hasChecked && (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                userAnswer.trim()
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-655 border border-slate-200/20 cursor-not-allowed"
              }`}
            >
              Kiểm tra đáp án
            </button>
          )}
        </form>

        {/* Feedback Area */}
        {hasChecked && (
          <div className="space-y-4 animate-fade-in">
            {/* Answer Feedback Banner */}
            {isCorrect ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-sm font-semibold justify-center">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Chính xác tuyệt vời! 🎉</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-200/30 dark:border-rose-900/40 text-rose-700 dark:text-rose-455 flex items-center gap-2 text-sm font-semibold justify-center">
                  <X className="w-5 h-5 text-rose-600 dark:text-rose-455" />
                  <span>Chưa đúng rồi! Thử lại nhé.</span>
                </div>
                {!showAnswerReveal && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="w-1/2 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/10 transition-all duration-200 cursor-pointer"
                    >
                      Thử viết lại
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAnswer(true)}
                      className="w-1/2 py-2.5 rounded-xl font-semibold text-xs bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30 transition-all duration-200 cursor-pointer"
                    >
                      Xem đáp án
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Answer Reveal Details */}
            {showAnswerReveal && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/40 space-y-4 animate-fade-in">
                {/* Word & IPA */}
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {currentCard.word}
                    </h4>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {currentCard.ipa}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakWord(currentCard.word)}
                    title="Nghe phát âm"
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-500 hover:text-indigo-650 border border-slate-200/40 dark:border-slate-800 shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 sm:w-5 h-5" />
                  </button>
                </div>

                {/* Example sentence */}
                <div className="border-t border-slate-200/40 dark:border-slate-700/40 pt-3 space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Ví dụ minh họa:
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-250 italic">
                      &quot;{currentCard.example}&quot;
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentCard.exampleVi}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button (Triggered after checking or revealing) */}
            {(isCorrect || showAnswer) && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
              >
                {currentIndex === cards.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
