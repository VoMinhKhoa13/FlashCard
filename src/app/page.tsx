"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";
import FlashcardViewer from "@/components/FlashcardViewer";
import PracticeViewer from "@/components/PracticeViewer";
import QuizViewer from "@/components/QuizViewer";
import { Card, Lesson } from "@/data/mockCards";

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"study" | "practice" | "quiz">("study");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on client mount (hydration safe)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedLessons = localStorage.getItem("ai_lessons");
        const cachedActiveId = localStorage.getItem("ai_lessons_active_id");
        const cachedMode = localStorage.getItem("ai_lessons_mode");
        
        if (cachedLessons) {
          const parsedLessons: Lesson[] = JSON.parse(cachedLessons);
          setLessons(parsedLessons);
          
          if (cachedActiveId && parsedLessons.some(l => l.id === cachedActiveId)) {
            setActiveLessonId(cachedActiveId);
          } else if (parsedLessons.length > 0) {
            setActiveLessonId(parsedLessons[0].id);
          }
        }
        if (cachedMode === "study" || cachedMode === "practice" || cachedMode === "quiz") {
          setMode(cachedMode);
        }
      } catch (err) {
        console.error("Lỗi khi đọc localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save state to localStorage when lessons, activeLessonId, or mode changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("ai_lessons", JSON.stringify(lessons));
        if (activeLessonId) {
          localStorage.setItem("ai_lessons_active_id", activeLessonId);
        } else {
          localStorage.removeItem("ai_lessons_active_id");
        }
        localStorage.setItem("ai_lessons_mode", mode);
      } catch (err) {
        console.error("Lỗi khi ghi localStorage:", err);
      }
    }
  }, [lessons, activeLessonId, mode, isLoaded]);

  const handleLessonCreated = (name: string, cards: Card[]) => {
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}`,
      name: name,
      createdAt: Date.now(),
      cards: cards,
    };
    
    setLessons((prev) => [...prev, newLesson]);
    setActiveLessonId(newLesson.id);
    setIsUploading(false);
    setMode("study"); // Default to flashcard view for the new lesson
  };

  const handleDeleteActiveLesson = (id: string) => {
    const lessonToDelete = lessons.find((l) => l.id === id);
    if (!lessonToDelete) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ bài học "${lessonToDelete.name}"?`)) {
      const updatedLessons = lessons.filter((l) => l.id !== id);
      setLessons(updatedLessons);
      
      if (updatedLessons.length > 0) {
        // Set active lesson to the most recent remaining lesson
        setActiveLessonId(updatedLessons[updatedLessons.length - 1].id);
      } else {
        setActiveLessonId(null);
        setIsUploading(false); // If no lessons left, default to upload screen
      }
      setMode("study");
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

  const activeLesson = lessons.find((l) => l.id === activeLessonId);
  const hasLessons = lessons.length > 0;
  const showUpload = !hasLessons || isUploading;

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50/50 dark:bg-[#090d16] transition-colors duration-300">
      
      {/* Ambient light background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar
        mode={mode}
        setMode={setMode}
        lessons={lessons}
        activeLessonId={activeLessonId}
        setActiveLessonId={setActiveLessonId}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onDeleteLesson={handleDeleteActiveLesson}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-12 sm:py-16 relative z-10">
        {showUpload ? (
          <UploadZone
            onLessonCreated={handleLessonCreated}
            loading={loading}
            setLoading={setLoading}
            hasExistingLessons={hasLessons}
            onCancel={() => setIsUploading(false)}
          />
        ) : (
          <div className="w-full transition-all duration-500 ease-in-out">
            {activeLesson && (
              mode === "study" ? (
                <FlashcardViewer key={`study-${activeLesson.id}`} cards={activeLesson.cards} />
              ) : mode === "practice" ? (
                <PracticeViewer key={`practice-${activeLesson.id}`} cards={activeLesson.cards} />
              ) : (
                <QuizViewer key={`quiz-${activeLesson.id}`} cards={activeLesson.cards} />
              )
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
