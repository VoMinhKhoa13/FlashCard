"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookOpen, FolderOpen, Plus, Trash2, Check, ChevronDown, Layers } from "lucide-react";
import { Lesson } from "@/data/mockCards";

interface NavbarProps {
  mode: "study" | "practice" | "quiz";
  setMode: (mode: "study" | "practice" | "quiz") => void;
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasLessons = lessons.length > 0;
  const activeLesson = lessons.find((l) => l.id === activeLessonId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            
            {/* Custom Lesson Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/60 shadow-sm cursor-pointer transition-all duration-200"
              >
                <FolderOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] sm:max-w-[200px] truncate">
                  {activeLesson?.name || "Chọn bài học..."}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Custom Popup Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 dark:bg-[#0b101d]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Danh sách bài học ({lessons.length})</span>
                    <Layers className="w-3 h-3 text-indigo-400" />
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    {lessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            setActiveLessonId(lesson.id);
                            setIsUploading(false);
                            setIsOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                            isActive
                              ? "bg-indigo-600/20 text-indigo-300 font-bold"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <FolderOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                            <span className="truncate">{lesson.name}</span>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  onClick={() => setMode("practice")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                    mode === "practice"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-indigo-350"
                  }`}
                >
                  Luyện Viết
                </button>
                <button
                  onClick={() => setMode("quiz")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                    mode === "quiz"
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-455 shadow-sm"
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
