"use client";

import React, { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon, Sparkles, AlertCircle, FileText, Check, X, Plus, Trash2 } from "lucide-react";
import { Card, mockCards } from "@/data/mockCards";

interface UploadZoneProps {
  onLessonCreated: (name: string, cards: Card[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  hasExistingLessons: boolean;
  onCancel: () => void;
}

interface StagedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

export default function UploadZone({
  onLessonCreated,
  loading,
  setLoading,
  hasExistingLessons,
  onCancel,
}: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [tempCards, setTempCards] = useState<Card[] | null>(null);
  const [lessonName, setLessonName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaultName = (prefix: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${prefix} (${dateStr} - ${timeStr})`;
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Lỗi khi đọc file hình ảnh."));
      reader.readAsDataURL(file);
    });
  };

  const addFiles = async (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Một số tệp không phải hình ảnh hợp lệ và đã bị bỏ qua.");
        continue;
      }
      validFiles.push(file);
    }

    const newImages: StagedImage[] = [];
    for (const file of validFiles) {
      try {
        const base64 = await readFileAsBase64(file);
        newImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
          base64,
        });
      } catch {
        setErrorMsg("Lỗi khi đọc một hoặc nhiều file hình ảnh.");
      }
    }

    if (newImages.length > 0) {
      setStagedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setStagedImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const processAllImages = async () => {
    if (stagedImages.length === 0) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: stagedImages.map((img) => img.base64) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể phân tích hình ảnh.");
      }

      if (data.cards && data.cards.length > 0) {
        setTempCards(data.cards);
        setLessonName(getDefaultName("Bài học mới"));
        // Cleanup previews
        stagedImages.forEach((img) => URL.revokeObjectURL(img.preview));
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files);
      // Reset input so the same file(s) can be re-selected
      e.target.value = "";
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const loadMockData = () => {
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setTempCards(mockCards);
      setLessonName(getDefaultName("Bài học mẫu"));
      setLoading(false);
    }, 1200);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim() || !tempCards) return;
    onLessonCreated(lessonName.trim(), tempCards);
    setTempCards(null);
    setStagedImages([]);
    setLessonName("");
  };

  const handleResetAll = () => {
    stagedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setStagedImages([]);
    setTempCards(null);
    setErrorMsg(null);
  };

  // Determine which state to render
  const hasStagedImages = stagedImages.length > 0;
  const showDropzone = !tempCards && !hasStagedImages && !loading;
  const showStaging = !tempCards && hasStagedImages && !loading;

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

      {/* Hidden file input - supports multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />

      {/* Main Container */}
      <div
        onDragEnter={showDropzone || showStaging ? handleDrag : undefined}
        onDragOver={showDropzone || showStaging ? handleDrag : undefined}
        onDragLeave={showDropzone || showStaging ? handleDrag : undefined}
        onDrop={showDropzone || showStaging ? handleDrop : undefined}
        className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] glass-card ${
          tempCards
            ? "border-indigo-200 dark:border-slate-800"
            : isDragActive
            ? "border-indigo-500 border-dashed bg-indigo-50/30 dark:bg-indigo-950/10 scale-[1.01]"
            : hasStagedImages
            ? "border-slate-300 dark:border-slate-700"
            : "border-slate-300 border-dashed dark:border-slate-700 hover:border-indigo-400/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
        }`}
      >

        {loading ? (
          // 1. Loading State
          <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400 relative">
              <Loader2 className="w-12 h-12 animate-spin" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-rose-400 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Đang xử lý {stagedImages.length > 1 ? `${stagedImages.length} ảnh` : "dữ liệu"} bằng AI...
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                AI đang quét hình ảnh, phân tích từ vựng TOEIC và sinh câu hỏi trắc nghiệm thông minh.
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full animate-[shimmer_1.5s_infinite] w-full" style={{ backgroundSize: "200% 100%" }}></div>
            </div>
          </div>
        ) : tempCards ? (
          // 2. Custom Naming State (Post-Scan)
          <form onSubmit={handleSaveLesson} className="w-full max-w-md space-y-6 flex flex-col items-center">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5 text-center">
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
                Lưu bài học mới
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI đã trích xuất thành công <strong className="text-emerald-600 dark:text-emerald-400">{tempCards.length} từ vựng</strong> từ ảnh của bạn. Hãy đặt tên để dễ học lại sau này:
              </p>
            </div>

            <div className="w-full space-y-1 text-left">
              <label htmlFor="lessonName" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Tên bài học
              </label>
              <input
                id="lessonName"
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="Nhập tên bài học..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={handleResetAll}
                className="w-1/2 py-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" /> Chọn lại ảnh
              </button>
              
              <button
                type="submit"
                className="w-1/2 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400 text-white shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Lưu bài học
              </button>
            </div>
          </form>
        ) : hasStagedImages ? (
          // 3. Image Staging Area (thumbnails + confirm)
          <div className="w-full space-y-6 flex flex-col items-center">
            <div className="space-y-1 text-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Đã chọn {stagedImages.length} ảnh
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Thêm nhiều ảnh nếu bài học có nhiều trang, hoặc bấm xác nhận để AI bắt đầu trích xuất từ vựng.
              </p>
            </div>

            {/* Thumbnails Grid */}
            <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-3">
              {stagedImages.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  <img
                    src={img.preview}
                    alt="Staged"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-red-600/80"
                    title="Xóa ảnh"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add More Button (inside grid) */}
              <button
                type="button"
                onClick={onButtonClick}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full max-w-sm">
              <button
                type="button"
                onClick={handleResetAll}
                className="w-1/2 py-3 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Xóa tất cả
              </button>
              <button
                type="button"
                onClick={processAllImages}
                className="w-1/2 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-500 dark:to-indigo-400 text-white shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Tạo bài học
              </button>
            </div>
          </div>
        ) : (
          // 4. Default File Dropzone State
          <div className="flex flex-col items-center justify-center space-y-5">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Tải ảnh sách từ vựng mới
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Kéo thả một hoặc nhiều ảnh bài học tại đây. Hỗ trợ chọn nhiều trang cùng lúc.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs justify-center items-center">
              <button
                type="button"
                onClick={onButtonClick}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-50 dark:hover:bg-indigo-400/10 text-white dark:text-indigo-400 border border-transparent dark:border-indigo-900/40 shadow-md shadow-indigo-200 dark:shadow-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" /> Chọn ảnh...
              </button>
              
              <button
                type="button"
                onClick={loadMockData}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-rose-450" /> Dùng thử mẫu
              </button>
            </div>

            {hasExistingLessons && (
              <button
                type="button"
                onClick={onCancel}
                className="pt-2 text-xs font-bold text-indigo-550 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline cursor-pointer"
              >
                Quay lại học tiếp các bài hiện tại
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
