import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import authorImg from "../assets/author.jpg";
import { processAndCompressImage } from "../lib/imageUtils";
import { X, Camera, Upload, RotateCcw, Check, Sparkles, User, School, BookOpen, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { teacherProfile, updateTeacherProfile, isLoggedIn } = useApp();

  const [previewAvatar, setPreviewAvatar] = useState<string>(teacherProfile?.avatarUrl || authorImg);
  const [name, setName] = useState(teacherProfile?.name || "Bùi Thanh Thảo");
  const [school, setSchool] = useState(teacherProfile?.school || "Trường TIỂU HỌC KHẮC NIỆM");
  const [subject, setSubject] = useState(teacherProfile?.subject || "Tin học & Công nghệ");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const compressedDataUrl = await processAndCompressImage(file, 400, 400, 0.88);
      setPreviewAvatar(compressedDataUrl);
      setIsSavedSuccess(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Lỗi khi xử lý hình ảnh.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleResetToDefault = () => {
    setPreviewAvatar(authorImg);
    setIsSavedSuccess(false);
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      alert("🔒 Vui lòng đăng nhập PIN Quản trị viên ở góc trên màn hình trước khi cập nhật dữ liệu tác giả!");
      return;
    }

    updateTeacherProfile({
      name,
      school,
      subject,
      avatarUrl: previewAvatar
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-[#151c2e] text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative"
        >
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Đóng"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              Quản lý hồ sơ & Tác giả
            </div>
            <h2 className="text-xl font-black">Cập nhật Ảnh Đại Diện & Thông Tin</h2>
            <p className="text-xs text-indigo-100/80 font-medium mt-0.5">
              Tải ảnh mới từ máy tính để thay thế ảnh tác giả hiển thị trên toàn bộ ứng dụng.
            </p>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Avatar Upload Area */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                title="Bấm để tải ảnh mới lên"
              >
                <div className="relative">
                  <img
                    src={previewAvatar}
                    alt="Ảnh tác giả"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-indigo-500/40 shadow-xl transition-all duration-300 group-hover:brightness-90"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = authorImg;
                    }}
                  />
                  {/* Camera overlay */}
                  <div className="absolute inset-0 rounded-full bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">
                    <Camera size={26} className="mb-1 text-amber-300" />
                    <span>Đổi ảnh mới</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-[#151c2e] transition-transform active:scale-95"
                  title="Chọn ảnh từ thiết bị"
                >
                  <Camera size={16} />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5 transition-all"
                >
                  <Upload size={14} />
                  {isProcessing ? "Đang xử lý ảnh..." : "Chọn ảnh từ máy tính"}
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  title="Đặt lại ảnh tác giả mặc định gốc"
                >
                  <RotateCcw size={13} />
                  Khôi phục ảnh gốc
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <AlertCircle size={14} />
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <User size={14} className="text-indigo-500" />
                  Tên Tác giả / Giáo viên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên giáo viên..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <School size={14} className="text-indigo-500" />
                  Đơn vị công tác (Trường)
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Nhập tên trường..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-500" />
                  Môn học phụ trách
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Nhập môn giảng dạy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              {isSavedSuccess ? (
                <>
                  <Check size={16} className="text-emerald-300" />
                  Đã lưu thành công!
                </>
              ) : (
                <>
                  <Check size={16} />
                  Lưu & Cập nhật ảnh mới
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
