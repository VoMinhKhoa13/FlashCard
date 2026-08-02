"use client";

import React, { useState, useEffect } from "react";
import { Volume2, ChevronLeft, ChevronRight, HelpCircle, CornerDownRight, X, Check, BookMarked, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/data/mockCards";

interface FlashcardViewerProps {
  cards: Card[];
  unmasteredCardIds?: string[];
  onMarkUnmastered?: (cardId: string) => void;
  onMarkMastered?: (cardId: string) => void;
  isUnmasteredOnly?: boolean;
  onToggleUnmasteredOnly?: () => void;
  totalUnmasteredCount?: number;
}

export default function FlashcardViewer({
  cards,
  unmasteredCardIds = [],
  onMarkUnmastered,
  onMarkMastered,
  isUnmasteredOnly = false,
  onToggleUnmasteredOnly,
  totalUnmasteredCount,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Keep index within range if cards array length changes
  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      setCurrentIndex(cards.length - 1);
    }
  }, [cards.length, currentIndex]);

  const currentCard = cards[currentIndex];

  // Reset flip state when card changes
  const handlePrev = () => {
    setIsFlipped(false);
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
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards.length]);

  // Text-To-Speech function
  const speakWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
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

  const unmasteredCount = totalUnmasteredCount !== undefined ? totalUnmasteredCount : unmasteredCardIds.length;

  // Empty state when learning unmastered cards and user has mastered all of them
  if (isUnmasteredOnly && cards.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl animate-fade-in my-6 border border-emerald-500/30">
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-bounce">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Tuyệt vời! Đã thuộc hết từ 🎉
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Bạn đã luyện thuộc tất cả các từ trong danh sách &quot;Chưa thuộc&quot; của bài học này.
          </p>
        </div>
        {onToggleUnmasteredOnly && (
          <button
            type="button"
            onClick={onToggleUnmasteredOnly}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" /> Quay lại xem tất cả từ vựng
          </button>
        )}
      </div>
    );
  }

  if (!currentCard) return null;

  const isCurrentUnmastered = unmasteredCardIds.includes(currentCard.id);
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3.5 sm:gap-4 px-4">
      
      {/* Top Control Bar */}
      <div className="w-full flex justify-between items-center gap-3">
        {/* Oval Badge showing Unmastered Count */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/80 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-sm">
          <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-extrabold">
            {unmasteredCount}
          </span>
          <span>Từ chưa thuộc</span>
        </div>

        {/* Button "Học từ chưa thuộc" */}
        {onToggleUnmasteredOnly && (
          <button
            type="button"
            disabled={unmasteredCount === 0 && !isUnmasteredOnly}
            onClick={onToggleUnmasteredOnly}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isUnmasteredOnly
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : unmasteredCount > 0
                ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/40"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-transparent cursor-not-allowed opacity-60"
            }`}
            title={unmasteredCount === 0 && !isUnmasteredOnly ? "Không có từ chưa thuộc nào" : "Chỉ học các từ chưa thuộc"}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{isUnmasteredOnly ? "Đang học từ chưa thuộc" : "Học từ chưa thuộc"}</span>
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          <span>Thẻ từ vựng: <strong className="text-slate-800 dark:text-slate-200">{currentIndex + 1}</strong> / {cards.length} {isUnmasteredOnly ? "(Chế độ chưa thuộc)" : ""}</span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/20">
            Dùng ← → hoặc Phím Cách
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-400 rounded-full transition-all duration-300"
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
          <div className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl glass-card p-6 flex flex-col justify-between items-center text-center shadow-xl transition-all duration-300 border-2 ${
            isCurrentUnmastered
              ? "border-orange-500/60 dark:border-orange-500/50 shadow-orange-500/10 bg-gradient-to-b from-orange-950/10 to-transparent"
              : "border-slate-200/40 dark:border-slate-800/60 hover:shadow-indigo-500/10"
          }`}>
            
            {/* Front Header */}
            <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30">
                {currentCard.pos}
              </span>

              {/* UNMASTERED BADGE ON CARD (FRONT) */}
              {isCurrentUnmastered ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider bg-orange-500/20 border border-orange-500/60 text-orange-400 flex items-center gap-1.5 shadow-sm shadow-orange-500/20 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" /> Chưa thuộc
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Mặt trước
                </span>
              )}
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
          <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl glass-card p-6 flex flex-col justify-between shadow-xl transition-all duration-300 border-2 bg-gradient-to-tr from-rose-50/20 to-indigo-50/10 dark:from-slate-900/90 dark:to-indigo-950/20 ${
            isCurrentUnmastered
              ? "border-orange-500/60 dark:border-orange-500/50 shadow-orange-500/10"
              : "border-rose-100/30 dark:border-rose-900/20"
          }`}>
            
            {/* Back Header */}
            <div className="w-full flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100/30">
                Ý nghĩa
              </span>

              {/* UNMASTERED BADGE ON CARD (BACK) */}
              {isCurrentUnmastered ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider bg-orange-500/20 border border-orange-500/60 text-orange-400 flex items-center gap-1.5 shadow-sm shadow-orange-500/20 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" /> Chưa thuộc
                </span>
              ) : (
                <span>Mặt sau</span>
              )}
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

      {/* Transparent Glass Buttons with Colored Icons (Red X / Green Check) */}
      <div className="flex items-center justify-center gap-6 mt-3 sm:mt-4">
        
        {/* Button X (Chưa thuộc) */}
        <div className="relative group flex flex-col items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (currentCard) {
                onMarkUnmastered?.(currentCard.id);
                handleNext();
              }
            }}
            aria-label="Chưa thuộc"
            className={`w-13 h-13 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
              isCurrentUnmastered
                ? "bg-rose-500/20 dark:bg-rose-950/40 border-rose-500 text-rose-400 ring-2 ring-rose-500/30"
                : "bg-slate-900/60 dark:bg-slate-800/80 border-rose-500/40 text-rose-500 hover:bg-rose-500/20 dark:hover:bg-rose-950/40 hover:border-rose-500"
            }`}
          >
            <X className="w-6 h-6 stroke-[3] text-rose-500 dark:text-rose-400" />
          </button>
          
          {/* Floating Tooltip on Hover */}
          <span className="absolute -bottom-9 px-2.5 py-1 rounded-xl bg-slate-900/95 dark:bg-[#0c1220]/95 border border-rose-500/50 text-rose-400 text-[11px] font-extrabold opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl whitespace-nowrap z-30">
            Chưa thuộc
          </span>
        </div>

        {/* Button ✓ (Đã thuộc) */}
        <div className="relative group flex flex-col items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (currentCard) {
                onMarkMastered?.(currentCard.id);
                handleNext();
              }
            }}
            aria-label="Đã thuộc"
            className={`w-13 h-13 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
              !isCurrentUnmastered && unmasteredCardIds.length > 0
                ? "bg-emerald-500/20 dark:bg-emerald-950/40 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30"
                : "bg-slate-900/60 dark:bg-slate-800/80 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/20 dark:hover:bg-emerald-950/40 hover:border-emerald-500"
            }`}
          >
            <Check className="w-6 h-6 stroke-[3] text-emerald-500 dark:text-emerald-400" />
          </button>

          {/* Floating Tooltip on Hover */}
          <span className="absolute -bottom-9 px-2.5 py-1 rounded-xl bg-slate-900/95 dark:bg-[#0c1220]/95 border border-emerald-500/50 text-emerald-400 text-[11px] font-extrabold opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl whitespace-nowrap z-30">
            Đã thuộc
          </span>
        </div>

      </div>

      {/* Arrow Navigation Buttons */}
      <div className="flex items-center gap-6 mt-6 sm:mt-8">
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
