"use client";

import React, { useState, useEffect } from "react";
import { Volume2, ChevronLeft, ChevronRight, HelpCircle, CornerDownRight } from "lucide-react";
import { Card } from "@/data/mockCards";

interface FlashcardViewerProps {
  cards: Card[];
}

export default function FlashcardViewer({ cards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  // Reset flip state when card changes
  const handlePrev = () => {
    setIsFlipped(false);
    // Wait for flip transition to finish before changing data
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
    }, 150);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Enter") {
        // Toggle flip on space or enter
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards.length]);

  // Text-To-Speech function
  const speakWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation(); // Stop card from flipping when clicking the speaker button
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel previous speaking tasks
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";

      // Explicitly locate and force an English voice to prevent Vietnamese browser engine fallback
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = 
        voices.find((v) => v.lang === "en-US") ||
        voices.find((v) => v.lang.startsWith("en-")) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.rate = 0.85; // Slightly slower for clear learning
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentCard) return null;

  const progressPercent = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 px-4">
      {/* Progress Indicator */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          <span>Thẻ từ vựng: {currentIndex + 1} / {cards.length}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            Dùng ← → hoặc Phím Cách
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full aspect-[4/3] sm:aspect-[1.5/1] perspective-1000 cursor-pointer relative"
      >
        <div
          className={`w-full h-full duration-500 preserve-3d relative ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl glass-card p-6 flex flex-col justify-between items-center text-center shadow-lg hover:shadow-indigo-100/30 dark:hover:shadow-none transition-shadow duration-300">
            {/* Front Header */}
            <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                {currentCard.pos}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Mặt trước
              </span>
            </div>

            {/* Front Content */}
            <div className="flex flex-col items-center space-y-3 my-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-300 dark:to-indigo-400">
                {currentCard.word}
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="font-mono text-base text-slate-500 dark:text-slate-400">
                  {currentCard.ipa}
                </span>
                
                {/* Speaker TTS Button */}
                <button
                  type="button"
                  onClick={(e) => speakWord(e, currentCard.word)}
                  title="Nghe phát âm"
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 border border-slate-200/40 dark:border-slate-700/50 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Front Footer */}
            <p className="text-xs text-slate-400 dark:text-slate-500 animate-pulse font-medium">
              Nhấn vào thẻ để xem nghĩa dịch 👆
            </p>
          </div>

          {/* Card Back Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl glass-card p-6 flex flex-col justify-between shadow-lg bg-gradient-to-tr from-rose-50/20 to-indigo-50/10 dark:from-slate-900/90 dark:to-indigo-950/20 border-rose-100/30 dark:border-rose-900/20">
            {/* Back Header */}
            <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/30">
                Ý nghĩa
              </span>
              <span>Mặt sau</span>
            </div>

            {/* Back Content */}
            <div className="my-auto space-y-4 px-2">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 text-center">
                  {currentCard.meaning}
                </h3>
              </div>

              <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/30 dark:border-slate-700/40 space-y-2">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5" /> Ví dụ minh họa:
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    &quot;{currentCard.example}&quot;
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentCard.exampleVi}
                  </p>
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
              Nhấn vào thẻ để quay lại mặt trước
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-6 mt-2">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
          {currentIndex + 1} / {cards.length}
        </span>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:shadow-md cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
