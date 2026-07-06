"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import FlashcardViewer from "@/components/FlashcardViewer";
import QuizViewer from "@/components/QuizViewer";
import { Card } from "@/data/mockCards";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedCards = localStorage.getItem("ai_flashcards");
        const cachedMode = localStorage.getItem("ai_flashcards_mode");
        
        if (cachedCards) {
          setCards(JSON.parse(cachedCards));
        }
        if (cachedMode === "study" || cachedMode === "quiz") {
          setMode(cachedMode);
        }
      } catch (err) {
        console.error("Lỗi khi đọc localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save state to localStorage whenever cards or mode changes (after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("ai_flashcards", JSON.stringify(cards));
        localStorage.setItem("ai_flashcards_mode", mode);
      } catch (err) {
        console.error("Lỗi khi ghi localStorage:", err);
      }
    }
  }, [cards, mode, isLoaded]);

  const handleCardsLoaded = (newCards: Card[]) => {
    setCards(newCards);
    setMode("study"); // Reset to study mode when new cards are loaded
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách từ vựng hiện tại?")) {
      setCards([]);
      setMode("study");
      if (typeof window !== "undefined") {
        localStorage.removeItem("ai_flashcards");
      }
    }
  };

  // Prevent flash or layout shifts during initial client hydration loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasCards = cards.length > 0;

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50/50 dark:bg-[#090d16] transition-colors duration-300">
      
      {/* Premium ambient light background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        mode={mode}
        setMode={setMode}
        hasCards={hasCards}
        onClear={handleClear}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-12 sm:py-16 relative z-10">
        {!hasCards ? (
          <UploadZone
            onCardsLoaded={handleCardsLoaded}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <div className="w-full transition-all duration-500 ease-in-out">
            {mode === "study" ? (
              <FlashcardViewer cards={cards} />
            ) : (
              <QuizViewer cards={cards} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium select-none z-10">
        © 2026 AI Flashcard & Quiz. All rights reserved.
      </footer>
    </div>
  );
}
