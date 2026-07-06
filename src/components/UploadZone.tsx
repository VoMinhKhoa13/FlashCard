"use client";

import React, { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { Card, mockCards } from "@/data/mockCards";

interface UploadZoneProps {
  onCardsLoaded: (cards: Card[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function UploadZone({ onCardsLoaded, loading, setLoading }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng tải lên một tệp hình ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      try {
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Không thể phân tích hình ảnh.");
        }

        if (data.cards && data.cards.length > 0) {
          onCardsLoaded(data.cards);
        } else {
          throw new Error("Không thể trích xuất được từ vựng nào từ hình ảnh này.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi yêu cầu tới AI.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("Lỗi khi đọc file hình ảnh.");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const loadMockData = () => {
    setLoading(true);
    setErrorMsg(null);
    // Simulate short delay for premium feel loading state
    setTimeout(() => {
      onCardsLoaded(mockCards);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 flex items-start gap-3 backdrop-blur-sm shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-rose-800 dark:text-rose-300">Thông báo lỗi: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Main Dropzone Card */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[350px] ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10 scale-[1.01]"
            : "border-slate-300 dark:border-slate-700 hover:border-indigo-400/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
        } glass-card`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400 relative">
              <Loader2 className="w-12 h-12 animate-spin" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-rose-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Đang xử lý dữ liệu AI...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                AI đang quét hình ảnh, phân tích từ vựng TOEIC và sinh câu hỏi trắc nghiệm thông minh.
              </p>
            </div>
            {/* Visual Progress Simulator */}
            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full animate-[shimmer_1.5s_infinite] w-full" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
          </div>
        ) : (
          // Default State
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Tải ảnh sách từ vựng của bạn
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Kéo thả ảnh tại đây hoặc nhấp chuột để chọn ảnh. AI sẽ tự động trích xuất flashcard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={onButtonClick}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" /> Chọn ảnh...
              </button>
              
              <button
                type="button"
                onClick={loadMockData}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-rose-400" /> Dùng thử mẫu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
