import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Student, ActionType, GradeHistory } from "../types";
import { 
  Star, Search, AlertTriangle, PlusCircle, MinusCircle, Clock, Check, 
  Trash2, User, Info, ChevronDown, Sparkles, RotateCcw, Edit2, Sliders,
  BookOpen, Plus, X, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

// Cute Avatar Presets matching StudentManager
const CUTE_AVATARS = [
  { bg: "bg-amber-100 text-amber-700", emoji: "🐱" },
  { bg: "bg-pink-100 text-pink-700", emoji: "🦊" },
  { bg: "bg-indigo-100 text-indigo-700", emoji: "🐻" },
  { bg: "bg-emerald-100 text-emerald-700", emoji: "🐰" },
  { bg: "bg-blue-100 text-blue-700", emoji: "🐼" },
  { bg: "bg-purple-100 text-purple-700", emoji: "🦁" },
  { bg: "bg-[#eaf2fe] text-[#3a82f6]", emoji: "🐶" }
];

export default function FastGrader() {
  const { 
    students, classrooms, selectedClassId, setSelectedClassId, 
    addGradeHistory, deleteGradeHistory, gradeHistory,
    resetStudentScore, resetClassScores, setExactStudentScore,
    subjects, addSubject, deleteSubject
  } = useApp();

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Subject selection state
  const [selectedSubject, setSelectedSubject] = useState<string>(() => subjects[0] || "Tin học");
  const [showAddSubjectModal, setShowAddSubjectModal] = useState<boolean>(false);
  const [newSubjectInput, setNewSubjectInput] = useState<string>("");

  // Custom add/minus score form state
  const [customAddPoints, setCustomAddPoints] = useState<number>(1);
  const [customAddReason, setCustomAddReason] = useState<string>("");

  const [customMinusPoints, setCustomMinusPoints] = useState<number>(1);
  const [customMinusReason, setCustomMinusReason] = useState<string>("");

  // Direct exact score override state
  const [exactScoreInput, setExactScoreInput] = useState<number | "">("");
  const [exactScoreReason, setExactScoreReason] = useState<string>("");
  const [showScoreEditPanel, setShowScoreEditPanel] = useState<boolean>(false);

  const activeClassId = selectedClassId || classrooms[0]?.id || "";
  const activeClass = classrooms.find(c => c.id === activeClassId);

  // Filter students in current class
  const classStudents = students.filter(s => selectedClassId ? s.classId === selectedClassId : (s.classId === activeClassId));
  
  // Missing custom photos count
  const missingPhotoCount = classStudents.filter(s => (s.status || "active") === "active" && (!s.avatar || s.avatar.length <= 4)).length;

  // Filter by search query
  const filteredStudents = classStudents.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q);
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#7c3aed", "#4f46e5", "#3b82f6", "#10b981", "#f59e0b"]
    });
  };

  // Helper to log grade action with subject
  const handleGrade = (student: Student, points: number, type: ActionType, reasonText: string) => {
    const newLog: GradeHistory = {
      id: "hist_" + Date.now(),
      timestamp: new Date().toISOString(),
      teacherName: "Bùi Thanh Thảo",
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      className: student.className,
      points,
      type,
      reason: reasonText,
      subject: selectedSubject
    };

    addGradeHistory(newLog);

    if (points > 0) {
      triggerConfetti();
    }
  };

  // Handle custom add submission
  const handleCustomAddSubmit = (student: Student, e: React.FormEvent) => {
    e.preventDefault();
    const pts = Math.abs(Number(customAddPoints)) || 1;
    const reason = customAddReason.trim() || "Thưởng điểm cộng";
    handleGrade(student, pts, "reward", reason);
    setCustomAddReason("");
  };

  // Handle custom minus submission
  const handleCustomMinusSubmit = (student: Student, e: React.FormEvent) => {
    e.preventDefault();
    const pts = -Math.abs(Number(customMinusPoints) || 1);
    const reason = customMinusReason.trim() || "Trừ điểm nề nếp";
    handleGrade(student, pts, "deduction", reason);
    setCustomMinusReason("");
  };

  // Today's history for active student
  const todayDateStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5 pb-12 font-sans select-none">
      
      {/* Top Header Card matched directly from screenshot with Subject Selection row */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* LINE 1: Title & Subject Selector Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-2xl shrink-0 shadow-sm">
              ⭐
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white tracking-tight">
                Chấm điểm Nề nếp
              </h1>
              <p className="text-[#8c88cf] dark:text-slate-400 text-xs md:text-sm mt-0.5 font-bold">
                Đánh giá nhanh thái độ học tập trong tiết học.
              </p>
            </div>
          </div>

          {/* Right: Subject Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-[#f8fafc] dark:bg-slate-800/60 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 px-2 text-xs font-black text-[#2D2A72] dark:text-slate-300">
              <BookOpen size={15} className="text-[#554ce4]" />
              <span>Chọn môn học:</span>
            </div>

            {/* Subject Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {subjects.map((subj) => {
                const isActive = subj === selectedSubject;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#554ce4] text-white shadow-md shadow-indigo-200 dark:shadow-none font-extrabold scale-105"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{subj}</span>
                    {isActive && <Check size={12} className="stroke-[3]" />}
                  </button>
                );
              })}

              {/* Add Subject Button */}
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Thêm môn học mới"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Thêm môn</span>
              </button>
            </div>
          </div>

        </div>

        {/* LINE 2: Search, Class Selector & Restart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search box */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Tìm học sinh:</span>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-white placeholder-slate-400 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none text-xs font-semibold w-40 md:w-48 transition-all"
                />
              </div>
            </div>

            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Đang chọn lớp:</span>
              <div className="relative">
                <select
                  value={selectedClassId || activeClassId}
                  onChange={(e) => setSelectedClassId(e.target.value || null)}
                  className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs md:text-sm px-4 py-2 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none cursor-pointer pr-9 appearance-none min-w-[130px]"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Right: Active subject indicator & Restart Class Scores Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
              <BookOpen size={13} className="text-[#554ce4]" />
              <span>Môn đang chọn: <strong className="text-[#554ce4] dark:text-indigo-400">{selectedSubject}</strong></span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetClassScores(activeClassId, selectedSubject);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-extrabold text-xs rounded-2xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
              title={`Restart điểm môn ${selectedSubject} của toàn bộ học sinh lớp này về 0`}
            >
              <RotateCcw size={13} />
              <span>Restart điểm lớp ({selectedSubject})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Yellow / Amber Notification Tip Banner matched directly from screenshot */}
      <div className="bg-[#fffbeb] dark:bg-amber-950/20 border border-[#fef08a] dark:border-amber-900/50 p-4 rounded-3xl flex items-center gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-[#fef08a] dark:bg-amber-900/50 text-[#b45309] dark:text-amber-300 flex items-center justify-center shrink-0 font-bold">
          🧑
        </div>
        <p className="text-xs md:text-sm text-[#854d0e] dark:text-amber-200 leading-relaxed font-medium">
          <strong className="font-extrabold text-[#b45309] dark:text-amber-300">Mẹo nhỏ: Cập nhật ảnh đại diện</strong>
          <br className="hidden sm:inline" /> Lớp hiện có <strong className="font-extrabold text-[#b45309]">{missingPhotoCount}</strong> học sinh chưa có ảnh. Hãy sang mục <strong className="font-extrabold text-[#b45309]">Học sinh</strong> để tải ảnh lên, giúp việc chấm điểm sinh động và dễ nhận diện hơn nhé!
        </p>
      </div>

      {/* Main Student Cards Grid (Matched 3-column layout from screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {filteredStudents.map((student) => {
          const isSelected = student.id === activeStudentId;
          const hasCustomAvatar = student.avatar && student.avatar.length > 4;
          const avatarPreset = CUTE_AVATARS[Math.abs(student.name.charCodeAt(0) || 0) % CUTE_AVATARS.length];

          // Score display text and styling for selected subject vs total
          const subjectScore = student.subjectScores?.[selectedSubject] !== undefined 
            ? student.subjectScores[selectedSubject] 
            : (selectedSubject === "Tin học" ? (student.currentScore || 0) : 0);
          const totalScore = student.currentScore || 0;

          let scoreText = subjectScore > 0 ? `+${subjectScore} đ` : `${subjectScore} đ`;
          let scoreColorClass = subjectScore > 0 ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : subjectScore < 0 ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-slate-600 dark:text-slate-400 font-extrabold";

          // Student's today grade history entries
          const studentLogs = gradeHistory.filter(h => h.studentId === student.id && h.timestamp.startsWith(todayDateStr));

          return (
            <motion.div
              key={student.id}
              layout
              onClick={() => {
                if (!isSelected) setActiveStudentId(student.id);
              }}
              className={`transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? "bg-white dark:bg-slate-900 border-2 border-[#8399f6] dark:border-indigo-500 rounded-3xl p-5 shadow-xl ring-4 ring-indigo-100 dark:ring-indigo-950/50 space-y-4 col-span-1" 
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 flex items-center justify-between gap-3 min-h-[76px]"
              }`}
            >
              {/* UNSELECTED CARD LAYOUT */}
              {!isSelected ? (
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    {hasCustomAvatar ? (
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-indigo-100"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${avatarPreset.bg} flex items-center justify-center font-black text-2xl shrink-0 shadow-inner`}>
                        {student.avatar && student.avatar.length <= 4 ? student.avatar : avatarPreset.emoji}
                      </div>
                    )}

                    {/* Name & Progress badge */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[#2D2A72] dark:text-slate-100 text-sm leading-snug break-words">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-[#f1f5f9] dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {selectedSubject}
                        </span>
                        <span className={`text-xs font-mono ${scoreColorClass}`}>
                          {scoreText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Restart 0đ button on unselected card */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetStudentScore(student.id, selectedSubject);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/50 rounded-xl transition-all shrink-0 flex items-center gap-1 text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-rose-200 cursor-pointer active:scale-95"
                    title={`Restart điểm môn ${selectedSubject} về 0`}
                  >
                    <RotateCcw size={13} />
                    <span className="hidden sm:inline">Restart 0đ</span>
                  </button>
                </div>
              ) : (
                /* SELECTED / EXPANDED CARD LAYOUT MATCHED EXACTLY FROM IMAGE */
                <div className="space-y-4 cursor-default">
                  
                  {/* Card Header: Avatar, Name, Status Badge, Restart & Close buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasCustomAvatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${avatarPreset.bg} flex items-center justify-center font-black text-2xl shrink-0 shadow-inner`}>
                          {student.avatar && student.avatar.length <= 4 ? student.avatar : avatarPreset.emoji}
                        </div>
                      )}

                      <div>
                        <h3 className="font-extrabold text-[#2D2A72] dark:text-white text-base">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="bg-indigo-50 dark:bg-indigo-950/50 text-[#554ce4] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                            Môn {selectedSubject}
                          </span>
                          <span className={`text-xs font-mono ${scoreColorClass}`}>
                            {scoreText}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            (Tổng: {totalScore}đ)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetStudentScore(student.id, selectedSubject);
                        }}
                        className="flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                        title={`Restart điểm môn ${selectedSubject} của học sinh này về 0`}
                      >
                        <RotateCcw size={12} />
                        <span>Restart 0đ</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStudentId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 bg-slate-100 dark:bg-slate-800 rounded-full"
                        title="Đóng bảng chấm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Preset Buttons (Row 1: +1, +2, +3 | Row 2: -1, -2, -3) */}
                  <div className="space-y-2">
                    {/* Positive Row (+1, +2, +3) */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, 1, "speech", "Phát biểu ý kiến trong giờ học");
                        }}
                        className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#bbf7d0]"
                      >
                        <span className="font-black text-base leading-none">+1</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Phát biểu...</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, 2, "homework", "Làm bài tập tốt");
                        }}
                        className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#bbf7d0]"
                      >
                        <span className="font-black text-base leading-none">+2</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Làm bài tốt</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, 3, "reward", "Thành tích xuất sắc");
                        }}
                        className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#bbf7d0]"
                      >
                        <span className="font-black text-base leading-none">+3</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Xuất sắc</span>
                      </button>
                    </div>

                    {/* Negative Row (-1, -2, -3) */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, -1, "deduction", "Nói chuyện riêng trong giờ");
                        }}
                        className="bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#be123c] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#fecdd3]"
                      >
                        <span className="font-black text-base leading-none">-1</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Nói chuyện</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, -2, "no_homework", "Không làm bài tập");
                        }}
                        className="bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#be123c] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#fecdd3]"
                      >
                        <span className="font-black text-base leading-none">-2</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Không làm...</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGrade(student, -3, "deduction", "Mất trật tự trong giờ học");
                        }}
                        className="bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#be123c] p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm border border-[#fecdd3]"
                      >
                        <span className="font-black text-base leading-none">-3</span>
                        <span className="text-[10px] font-extrabold mt-1 tracking-tight uppercase">Mất trật tự</span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Points Input (2 Columns: Điểm cộng khác | Điểm trừ khác) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    
                    {/* Left: Điểm cộng khác */}
                    <form 
                      onSubmit={(e) => handleCustomAddSubmit(student, e)} 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#f0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-900/50 p-3 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#166534] dark:text-emerald-400 uppercase tracking-tight">
                        <PlusCircle size={14} className="text-[#16a34a]" />
                        <span>Điểm cộng khác</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[#16a34a] font-black text-sm">+</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={customAddPoints}
                          onChange={(e) => setCustomAddPoints(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-800 text-[#166534] dark:text-emerald-300 font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-[#bbf7d0] outline-none text-center"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Lý do cộng..."
                        value={customAddReason}
                        onChange={(e) => setCustomAddReason(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-xs px-2.5 py-1.5 rounded-xl border border-[#bbf7d0] outline-none font-medium"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#34d399] hover:bg-[#10b981] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        Lưu điểm cộng
                      </button>
                    </form>

                    {/* Right: Điểm trừ khác */}
                    <form 
                      onSubmit={(e) => handleCustomMinusSubmit(student, e)} 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#fff1f2] dark:bg-rose-950/30 border border-[#fecdd3] dark:border-rose-900/50 p-3 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#9f1239] dark:text-rose-400 uppercase tracking-tight">
                        <MinusCircle size={14} className="text-[#e11d48]" />
                        <span>Điểm trừ khác</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[#e11d48] font-black text-sm">-</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={customMinusPoints}
                          onChange={(e) => setCustomMinusPoints(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-800 text-[#9f1239] dark:text-rose-300 font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-[#fecdd3] outline-none text-center"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Lý do trừ..."
                        value={customMinusReason}
                        onChange={(e) => setCustomMinusReason(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-xs px-2.5 py-1.5 rounded-xl border border-[#fecdd3] outline-none font-medium"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#f87171] hover:bg-[#ef4444] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        Lưu điểm trừ
                      </button>
                    </form>

                  </div>

                  {/* Direct Exact Score Correction & Reset Panel (Dành cho giáo viên khi chấm nhầm hoặc cần sửa điểm) */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#f0f4ff] dark:bg-indigo-950/40 border border-[#c7d2fe] dark:border-indigo-900/60 p-3 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#3730a3] dark:text-indigo-300">
                      <div className="flex items-center gap-1.5 uppercase tracking-tight">
                        <Sliders size={14} className="text-[#4f46e5]" />
                        <span>Sửa / Nhập điểm trực tiếp (khi chấm nhầm)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetStudentScore(student.id, selectedSubject);
                        }}
                        className="flex items-center gap-1 text-[10px] bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-all font-bold cursor-pointer active:scale-95"
                        title={`Restart điểm môn ${selectedSubject} về 0`}
                      >
                        <RotateCcw size={11} />
                        <span>Restart 0đ</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <input
                          type="number"
                          step="0.5"
                          placeholder={`Số điểm`}
                          value={exactScoreInput}
                          onChange={(e) => setExactScoreInput(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-800 text-indigo-950 dark:text-white placeholder-slate-400 font-black text-xs px-2.5 py-1.5 rounded-xl border border-[#c7d2fe] dark:border-indigo-800 outline-none text-center"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Lý do sửa điểm (vd: Chấm nhầm, Đặt lại điểm)..."
                        value={exactScoreReason}
                        onChange={(e) => setExactScoreReason(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-xs px-2.5 py-1.5 rounded-xl border border-[#c7d2fe] dark:border-indigo-800 outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (exactScoreInput === "" || isNaN(Number(exactScoreInput))) return;
                          setExactStudentScore(student.id, Number(exactScoreInput), exactScoreReason.trim() || "Sửa điểm trực tiếp", selectedSubject);
                          setExactScoreInput("");
                          setExactScoreReason("");
                        }}
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 shadow-xs active:scale-95 transition-all"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>

                  {/* LỊCH SỬ HÔM NAY Section */}
                  <div className="bg-[#f8fafc] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#2D2A72] dark:text-slate-300 uppercase tracking-tight">
                      <Clock size={13} className="text-[#554ce4]" />
                      <span>Lịch sử hôm nay ({selectedSubject})</span>
                    </div>

                    {studentLogs.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {studentLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`font-mono font-black ${log.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {log.points > 0 ? `+${log.points}` : log.points}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                                {log.reason} {log.subject ? `(${log.subject})` : ''}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGradeHistory(log.id);
                              }}
                              className="text-slate-400 hover:text-rose-500 p-0.5 shrink-0"
                              title="Xoá lượt chấm"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-slate-400 italic font-medium">
                        Chưa có ghi nhận nào
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
            <User size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy học sinh nào</p>
            <p className="text-xs text-slate-400 mt-1">Thử chọn lớp khác hoặc kiểm tra lại tên tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Modal Add Subject */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-[#2D2A72] dark:text-white font-black text-lg">
                  <BookOpen className="text-[#554ce4]" size={20} />
                  <h3>Thêm Môn Học Mới</h3>
                </div>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = newSubjectInput.trim();
                  if (trimmed) {
                    addSubject(trimmed);
                    setSelectedSubject(trimmed);
                    setNewSubjectInput("");
                    setShowAddSubjectModal(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tên môn học (Ví dụ: Tin học, Công nghệ, Âm nhạc, Mỹ thuật...):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên môn học..."
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-[#554ce4] outline-none"
                    autoFocus
                  />
                </div>

                {/* List of current subjects with option to delete */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Danh sách môn học hiện có:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {subjects.map((subj) => (
                      <div
                        key={subj}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <span>{subj}</span>
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteSubject(subj);
                              if (selectedSubject === subj) {
                                const remaining = subjects.filter(s => s !== subj);
                                if (remaining.length > 0) setSelectedSubject(remaining[0]);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xoá môn học này"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddSubjectModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold text-white bg-[#554ce4] hover:bg-[#4338ca] rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    Thêm & Chọn môn
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
