"use client";

import React from "react";
import { BookOpen, Sparkles, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Lesson } from "@/data/mockCards";

interface NavbarProps {
  mode: "study" | "quiz";
  setMode: (mode: "study" | "quiz") => void;
  lessons: Lesson[];
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  onDeleteLesson: (id: string) => void;
}

export default function Navbar({
  mode,
  setMode,
  lessons,
  activeLessonId,
  setActiveLessonId,
  isUploading,
  setIsUploading,
  onDeleteLesson,
}: NavbarProps) {
  const hasLessons = lessons.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-rose-400 rounded-xl text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-rose-450">
            AI Flashcard & Quiz
          </h1>
        </div>

        {/* Right Section: Selector, Mode Switcher & Actions */}
        {hasLessons && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-end">
            
            {/* Lesson Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/85 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-700/50">
              <FolderOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <select
                value={activeLessonId || ""}
                onChange={(e) => {
                  setActiveLessonId(e.target.value || null);
                  setIsUploading(false); // Return to study mode
                }}
                className="bg-transparent border-none focus:outline-none text-[11px] sm:text-xs font-bold text-slate-750 dark:text-slate-200 pr-1 cursor-pointer max-w-[100px] sm:max-w-[180px] truncate"
              >
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id} className="dark:bg-slate-850 dark:text-slate-200">
                    {lesson.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher (only shown when not actively uploading) */}
            {!isUploading && (
              <div className="p-0.5 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl flex border border-slate-200/30 dark:border-slate-700/30">
                <button
                  onClick={() => setMode("study")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                    mode === "study"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-300"
                  }`}
                >
                  Học từ
                </button>
                <button
                  onClick={() => setMode("quiz")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                    mode === "quiz"
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-450 shadow-sm"
                      : "text-slate-500 hover:text-rose-650 dark:text-slate-400 dark:hover:text-rose-350"
                  }`}
                >
                  Làm Quiz
                </button>
              </div>
            )}

            {/* Action Buttons: Add (Plus) and Delete (Trash) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsUploading(!isUploading)}
                title="Tải ảnh mới / Tạo bài học mới"
                className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isUploading
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/40"
                    : "text-slate-400 hover:text-indigo-550 dark:hover:text-indigo-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Plus className="w-4 h-4 sm:w-5 h-5" />
              </button>

              <button
                onClick={() => activeLessonId && onDeleteLesson(activeLessonId)}
                title="Xóa bài học hiện tại"
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 sm:w-5 h-5" />
              </button>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}
