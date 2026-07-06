"use client";

import React, { useState } from "react";
import { Check, X, Award, RotateCcw, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/data/mockCards";

interface QuizViewerProps {
  cards: Card[];
}

export default function QuizViewer({ cards }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = cards[currentIndex];

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;

    setSelectedOptionIndex(index);
    setHasAnswered(true);

    if (index === currentCard.quiz.answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setHasAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / cards.length) * 100);
    let title = "Học lại chút nào! 💪";
    let desc = "Hãy luyện tập thêm bằng flashcard để nhớ từ lâu hơn nhé.";
    
    if (percentage === 100) {
      title = "Xuất sắc! 🎉 Tuyệt đối 100%!";
      desc = "Bạn đã ghi nhớ toàn bộ từ vựng một cách hoàn hảo.";
    } else if (percentage >= 70) {
      title = "Làm tốt lắm! 🌟";
      desc = "Hầu hết các từ vựng bạn đều nắm được rất tốt.";
    }

    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-indigo-500 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none animate-bounce">
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
            <span className="block text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {score} / {cards.length}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Đúng
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
          className="w-full py-3 rounded-2xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Làm lại Quiz
        </button>
      </div>
    );
  }

  if (!currentCard) return null;

  const quiz = currentCard.quiz;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 px-4">
      {/* Header Info */}
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        <span>Câu hỏi: {currentIndex + 1} / {cards.length}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 border border-rose-100/40">
          Từ: {currentCard.word} ({currentCard.pos})
        </span>
      </div>

      {/* Quiz Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-200/40 dark:border-slate-800/40">
        {/* Question Text */}
        <div className="flex gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl h-fit">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-snug">
            {quiz.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {quiz.options.map((option, index) => {
            const isCorrectOption = index === quiz.answerIndex;
            const isSelectedOption = index === selectedOptionIndex;

            let optionStyle = "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300";
            let IconComponent = null;

            if (hasAnswered) {
              if (isCorrectOption) {
                // Correct option (Always green when answered)
                optionStyle = "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-semibold";
                IconComponent = <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
              } else if (isSelectedOption) {
                // User selected incorrect option (red)
                optionStyle = "bg-rose-50/80 dark:bg-rose-950/20 border-rose-400 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 font-semibold";
                IconComponent = <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
              } else {
                // Other unselected, incorrect options (dimmed)
                optionStyle = "border-slate-200 dark:border-slate-850 opacity-40 text-slate-400 dark:text-slate-600 cursor-not-allowed";
              }
            }

            return (
              <button
                key={index}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(index)}
                className={`w-full text-left p-4 rounded-2xl border text-sm flex items-center justify-between transition-all duration-300 ${
                  !hasAnswered ? "cursor-pointer active:scale-[0.99]" : ""
                } ${optionStyle}`}
              >
                <span className="pr-4">{option}</span>
                {IconComponent}
              </button>
            );
          })}
        </div>

        {/* Footer Next Button */}
        {hasAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400 text-white shadow-md shadow-indigo-150 dark:shadow-none hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
          >
            {currentIndex === cards.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
