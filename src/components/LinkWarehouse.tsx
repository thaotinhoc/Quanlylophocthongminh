import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { StudyLink } from "../types";
import { 
  Link as LinkIcon, ExternalLink, Copy, QrCode, Trash2, Check, Sparkles 
} from "lucide-react";
import { motion } from "motion/react";

export default function LinkWarehouse() {
  const { studyLinks, addStudyLink, deleteStudyLink, classrooms, selectedClassId, setSelectedClassId } = useApp();

  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);
  const [activeQrTitle, setActiveQrTitle] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeClassId = selectedClassId || classrooms[0]?.id || "";
  const activeClass = classrooms.find(c => c.id === activeClassId);

  // Filter links for current class
  const classLinks = studyLinks.filter(l => l.classId ? l.classId === activeClassId : true);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const formattedUrl = newUrl.startsWith("http") ? newUrl.trim() : "https://" + newUrl.trim();

    const newLink: StudyLink = {
      id: "link_" + Date.now(),
      classId: activeClassId,
      title: newTitle.trim(),
      url: formattedUrl,
      description: "Đường dẫn bài tập / game học tập cho lớp " + (activeClass?.name || ""),
      subject: "Tin học",
      gradeGroup: activeClass?.name || "Lớp học",
      topic: "Tương tác",
      tags: ["Bài tập", "Game"],
      color: "#8382f6",
      isFavorite: false,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    addStudyLink(newLink);
    setNewTitle("");
    setNewUrl("");
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowQr = (l: StudyLink) => {
    setActiveQrUrl(l.url);
    setActiveQrTitle(l.title);
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      
      {/* Header with Title & Class Selector matched directly from image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white tracking-tight">
            Liên kết & Tài liệu
          </h1>
          <p className="text-[#8c88cf] dark:text-slate-400 text-xs md:text-sm mt-0.5 font-bold">
            Chia sẻ đường dẫn cho học sinh truy cập
          </p>
        </div>

        {/* Class Selector Dropdown Pill matching image */}
        <div className="relative shrink-0">
          <select
            value={activeClassId}
            onChange={(e) => setSelectedClassId(e.target.value || null)}
            className="bg-white dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs md:text-sm px-5 py-2 rounded-2xl border-2 border-[#554ce4] outline-none cursor-pointer pr-10 appearance-none shadow-sm min-w-[110px]"
          >
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs font-bold">
            ▼
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Form Card Left | Links Display Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: + Thêm liên kết mới Form Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-[#554ce4] font-black text-base md:text-lg">
            <span className="text-xl font-extrabold">+</span>
            <span>Thêm liên kết mới</span>
          </div>

          <form onSubmit={handleAddLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiêu đề
              </label>
              <input
                type="text"
                placeholder="VD: Bài tập về nhà tuần 1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#554ce4] text-xs md:text-sm font-semibold text-[#2D2A72] dark:text-white placeholder-slate-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Đường dẫn (URL)
              </label>
              <input
                type="text"
                placeholder="VD: https://docs.google.com/.."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#554ce4] text-xs md:text-sm font-semibold text-[#2D2A72] dark:text-white placeholder-slate-400 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#8382f6] hover:bg-[#6c6be6] text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              <span className="text-base font-black">+</span>
              <span>Thêm liên kết</span>
            </button>
          </form>
        </div>

        {/* Right Column: Links List or Empty State Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col justify-center">
          {classLinks.length === 0 ? (
            /* Empty state matched directly from image */
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
                <LinkIcon size={36} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600 rotate-45" />
              </div>
              <h3 className="text-lg font-extrabold text-[#2D2A72] dark:text-white">
                Chưa có liên kết nào
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Thêm liên kết đầu tiên cho lớp học này
              </p>
            </div>
          ) : (
            /* Populated links list for selected class */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-extrabold text-[#2D2A72] dark:text-white">
                  Danh sách liên kết ({classLinks.length})
                </h2>
                <span className="text-xs font-bold text-slate-400">Đang chọn lớp: {activeClass?.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classLinks.map((l) => (
                  <motion.div
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <h3 className="font-extrabold text-[#2D2A72] dark:text-white text-sm line-clamp-2">
                        {l.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono truncate mt-1">
                        {l.url}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => window.open(l.url, "_blank")}
                          className="px-2.5 py-1.5 bg-[#eef5fe] dark:bg-indigo-950/50 text-[#554ce4] dark:text-indigo-300 rounded-xl hover:bg-[#554ce4] hover:text-white transition-all font-extrabold flex items-center gap-1 text-[11px]"
                          title="Mở link trong tab mới"
                        >
                          <ExternalLink size={12} />
                          <span>Mở</span>
                        </button>
                        <button
                          onClick={() => handleCopyUrl(l.id, l.url)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all font-extrabold flex items-center gap-1 text-[11px]"
                          title="Sao chép link"
                        >
                          {copiedId === l.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedId === l.id ? "Đã chép" : "Copy"}</span>
                        </button>
                        <button
                          onClick={() => handleShowQr(l)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all font-extrabold flex items-center gap-1 text-[11px]"
                          title="Hiển thị QR code"
                        >
                          <QrCode size={12} />
                          <span>QR</span>
                        </button>
                      </div>

                      <button
                        onClick={() => deleteStudyLink(l.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Xoá"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* QR Code Modal for class display */}
      {activeQrUrl && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveQrUrl(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-[#2D2A72] dark:text-white text-lg truncate mb-1">
              Mã QR Quét bài tập
            </h3>
            <p className="text-xs font-bold text-slate-400 mb-4 truncate">{activeQrTitle}</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl inline-block mx-auto border border-slate-200 dark:border-slate-700 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeQrUrl)}`}
                alt="QR Code"
                className="w-52 h-52 rounded-xl mx-auto"
              />
            </div>

            <p className="text-xs text-slate-500 mt-4 font-semibold">
              Học sinh dùng thiết bị thông minh quét mã để làm bài tập.
            </p>

            <button
              onClick={() => setActiveQrUrl(null)}
              className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-extrabold rounded-2xl transition-all text-xs"
            >
              Đóng
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
