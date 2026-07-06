"use client";

import React from "react";
import { BookOpen, Sparkles, RefreshCw, Trash2 } from "lucide-react";

interface NavbarProps {
  mode: "study" | "quiz";
  setMode: (mode: "study" | "quiz") => void;
  hasCards: boolean;
  onClear: () => void;
}

export default function Navbar({ mode, setMode, hasCards, onClear }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Section: Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-rose-400 rounded-2xl text-white shadow-md shadow-indigo-200 dark:shadow-none animate-pulse">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-rose-400">
                AI Flashcard & Quiz
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Mode Switcher & Clear Button */}
        {hasCards && (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mode Switcher */}
            <div className="p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl flex border border-slate-200/40 dark:border-slate-700/50">
              <button
                onClick={() => setMode("study")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  mode === "study"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30 dark:border-slate-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                Học Flashcard
              </button>
              <button
                onClick={() => setMode("quiz")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  mode === "quiz"
                    ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/30 dark:border-slate-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                }`}
              >
                Làm Quiz
              </button>
            </div>

            {/* Clear/Reset Button */}
            <button
              onClick={onClear}
              title="Xóa danh sách từ hiện tại"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
