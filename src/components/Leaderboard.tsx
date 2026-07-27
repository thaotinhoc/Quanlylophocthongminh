import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Student, GradeHistory } from "../types";
import { Trophy, AlertCircle, ChevronDown, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";

// Cute Avatar Presets matching other components
const CUTE_AVATARS = [
  { bg: "bg-amber-100 text-amber-700", emoji: "🐱" },
  { bg: "bg-pink-100 text-pink-700", emoji: "🦊" },
  { bg: "bg-indigo-100 text-indigo-700", emoji: "🐻" },
  { bg: "bg-emerald-100 text-emerald-700", emoji: "🐰" },
  { bg: "bg-blue-100 text-blue-700", emoji: "🐼" },
  { bg: "bg-purple-100 text-purple-700", emoji: "🦁" },
  { bg: "bg-[#eaf2fe] text-[#3a82f6]", emoji: "🐶" }
];

export default function Leaderboard() {
  const { students, classrooms, selectedClassId, setSelectedClassId, gradeHistory } = useApp();

  // Filter States requested by user & screenshot
  const [topLimit, setTopLimit] = useState<string>("all"); // "all", "1", "3", "5"
  const [sortOrder, setSortOrder] = useState<"highest" | "lowest">("highest"); // "highest", "lowest"
  const [timeframe, setTimeframe] = useState<string>("all"); // "all", "today", "week", "month", "year"

  const activeClassId = selectedClassId || classrooms[0]?.id || "";

  // Helper function to calculate score for a student based on timeframe
  const calculateStudentScore = (student: Student): number => {
    if (timeframe === "all") {
      // If timeframe is all, sum grade history points or fallback to student.currentScore
      const logs = gradeHistory.filter(h => h.studentId === student.id);
      if (logs.length > 0) {
        return logs.reduce((sum, log) => sum + log.points, 0);
      }
      return student.currentScore || 0;
    }

    const now = new Date();
    const logs = gradeHistory.filter(h => {
      if (h.studentId !== student.id) return false;
      const logDate = new Date(h.timestamp);

      if (timeframe === "today") {
        return logDate.toDateString() === now.toDateString();
      }
      if (timeframe === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= oneWeekAgo;
      }
      if (timeframe === "month") {
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      }
      if (timeframe === "year") {
        return logDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    return logs.reduce((sum, log) => sum + log.points, 0);
  };

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter(s => activeClassId ? s.classId === activeClassId : true);
  }, [students, activeClassId]);

  // Calculate scores and build enriched list
  const enrichedStudents = useMemo(() => {
    return classStudents.map(student => ({
      ...student,
      periodScore: calculateStudentScore(student)
    }));
  }, [classStudents, gradeHistory, timeframe]);

  // Outstanding student (highest score student)
  const topStudent = useMemo(() => {
    if (enrichedStudents.length === 0) return null;
    const sorted = [...enrichedStudents].sort((a, b) => b.periodScore - a.periodScore);
    return sorted[0];
  }, [enrichedStudents]);

  // Reminder student (lowest score student)
  const lowestStudent = useMemo(() => {
    if (enrichedStudents.length === 0) return null;
    const sorted = [...enrichedStudents].sort((a, b) => a.periodScore - b.periodScore);
    // Only highlight if they have a negative score or are at the bottom
    return sorted[0];
  }, [enrichedStudents]);

  // Sorted and limited list for the detailed scoreboard table
  const displayedStudents = useMemo(() => {
    let sorted = [...enrichedStudents];

    if (sortOrder === "highest") {
      sorted.sort((a, b) => b.periodScore - a.periodScore);
    } else {
      sorted.sort((a, b) => a.periodScore - b.periodScore);
    }

    if (topLimit === "1") return sorted.slice(0, 1);
    if (topLimit === "3") return sorted.slice(0, 3);
    if (topLimit === "5") return sorted.slice(0, 5);

    return sorted;
  }, [enrichedStudents, sortOrder, topLimit]);

  return (
    <div className="space-y-6 pb-12 font-sans select-none">

      {/* Top Header Filter Card (Matched exactly from screenshot) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-2xl shrink-0 shadow-sm">
            🏆
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white tracking-tight">
              Bảng xếp hạng
            </h1>
            <p className="text-[#8c88cf] dark:text-slate-400 text-xs md:text-sm mt-0.5 font-bold">
              Vinh danh học sinh xuất sắc và theo dõi nề nếp.
            </p>
          </div>
        </div>

        {/* Right: 4 Dropdown Filters (Top, Sắp xếp, Thời gian, Đang chọn lớp) */}
        <div className="flex flex-col items-end gap-3">
          
          {/* Row 1: Top, Sắp xếp, Thời gian */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Top Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Top:</span>
              <div className="relative">
                <select
                  value={topLimit}
                  onChange={(e) => setTopLimit(e.target.value)}
                  className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs px-3.5 py-2 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none cursor-pointer pr-8 appearance-none min-w-[90px]"
                >
                  <option value="all">Tất cả</option>
                  <option value="1">Top 1</option>
                  <option value="3">Top 3</option>
                  <option value="5">Top 5</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "highest" | "lowest")}
                  className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs px-3.5 py-2 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none cursor-pointer pr-8 appearance-none min-w-[130px]"
                >
                  <option value="highest">Cao điểm nhất</option>
                  <option value="lowest">Thấp điểm nhất</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Timeframe Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Thời gian:</span>
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs px-3.5 py-2 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none cursor-pointer pr-8 appearance-none min-w-[110px]"
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Đang chọn lớp Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Đang chọn lớp:</span>
            <div className="relative">
              <select
                value={activeClassId}
                onChange={(e) => setSelectedClassId(e.target.value || null)}
                className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs px-4 py-2 rounded-2xl border border-transparent focus:border-[#554ce4] outline-none cursor-pointer pr-8 appearance-none min-w-[130px]"
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

      </div>

      {/* Top Highlight Banner Cards (2 Cards: Học sinh nổi bật | Cần nhắc nhở) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Left: Học sinh nổi bật */}
        <div className="bg-[#fffdf0] dark:bg-amber-950/20 border border-[#fef08a] dark:border-amber-900/40 p-5 rounded-[28px] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none text-amber-500 font-black text-8xl">
            👑
          </div>

          <div className="flex items-center gap-2 text-[#854d0e] dark:text-amber-300 font-black text-base md:text-lg mb-3.5 z-10">
            <span className="text-xl">🏆</span>
            <span>Học sinh nổi bật</span>
          </div>

          {topStudent ? (
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-[#fef08a]/80 dark:border-amber-900/40 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#f59e0b] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  1
                </div>
                <span className="font-extrabold text-[#2D2A72] dark:text-white text-sm md:text-base truncate">
                  {topStudent.name}
                </span>
              </div>
              <span className={`font-mono font-extrabold text-base md:text-lg shrink-0 ml-2 ${
                topStudent.periodScore > 0 
                  ? "text-[#16a34a] dark:text-emerald-400" 
                  : topStudent.periodScore < 0 
                  ? "text-[#e11d48] dark:text-rose-400" 
                  : "text-slate-500"
              }`}>
                {topStudent.periodScore > 0 ? `+${topStudent.periodScore}` : topStudent.periodScore}
              </span>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl text-center text-xs font-bold text-slate-400 italic">
              Chưa có dữ liệu học sinh
            </div>
          )}
        </div>

        {/* Right: Cần nhắc nhở */}
        <div className="bg-[#fff1f2] dark:bg-rose-950/20 border border-[#fecdd3] dark:border-rose-900/40 p-5 rounded-[28px] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-2 -top-2 opacity-10 pointer-events-none text-rose-500 font-black text-8xl">
            ⏰
          </div>

          <div className="flex items-center gap-2 text-[#9f1239] dark:text-rose-300 font-black text-base md:text-lg mb-3.5 z-10">
            <span className="text-xl">❗</span>
            <span>Cần nhắc nhở</span>
          </div>

          {lowestStudent ? (
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-[#fecdd3]/80 dark:border-rose-900/40 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#ffe4e6] dark:bg-rose-950/60 text-[#e11d48] font-black text-sm flex items-center justify-center shrink-0 border border-[#fecdd3]">
                  <User size={18} />
                </div>
                <span className="font-extrabold text-[#2D2A72] dark:text-white text-sm md:text-base truncate">
                  {lowestStudent.name}
                </span>
              </div>
              <span className={`font-mono font-extrabold text-base md:text-lg shrink-0 ml-2 ${
                lowestStudent.periodScore < 0 
                  ? "text-[#e11d48] dark:text-rose-400" 
                  : lowestStudent.periodScore > 0 
                  ? "text-[#16a34a] dark:text-emerald-400" 
                  : "text-slate-500"
              }`}>
                {lowestStudent.periodScore > 0 ? `+${lowestStudent.periodScore}` : lowestStudent.periodScore}
              </span>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-2xl text-center text-xs font-bold text-slate-400 italic">
              Chưa có dữ liệu học sinh
            </div>
          )}
        </div>

      </div>

      {/* Detailed Scoreboard Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-6 shadow-sm space-y-5">
        
        <h2 className="text-lg font-black text-[#2D2A72] dark:text-white tracking-tight">
          Bảng điểm chi tiết
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {displayedStudents.map((student, index) => {
            const hasCustomAvatar = student.avatar && student.avatar.length > 4;
            const avatarPreset = CUTE_AVATARS[Math.abs(student.name.charCodeAt(0) || 0) % CUTE_AVATARS.length];
            const score = student.periodScore;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-2xl transition-all"
              >
                {/* Left: Rank # & Student Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  
                  {/* Rank number badge */}
                  <span className="font-extrabold text-slate-400 dark:text-slate-500 text-sm md:text-base w-8 text-center shrink-0">
                    #{index + 1}
                  </span>

                  {/* Avatar */}
                  {hasCustomAvatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-indigo-50 dark:ring-slate-800"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full ${avatarPreset.bg} flex items-center justify-center font-black text-xl shrink-0 shadow-inner`}>
                      {student.avatar && student.avatar.length <= 4 ? student.avatar : avatarPreset.emoji}
                    </div>
                  )}

                  {/* Name and Status Pill */}
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#2D2A72] dark:text-slate-100 text-sm md:text-base truncate">
                      {student.name}
                    </h3>
                    <div className="mt-0.5">
                      <span className="bg-[#f1f5f9] dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block">
                        {score >= 0 ? "Đang tiến bộ" : "Cần cố gắng"}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Right: Score */}
                <div className="shrink-0 font-mono font-black text-base md:text-lg">
                  {score > 0 ? (
                    <span className="text-[#10b981] dark:text-emerald-400">+{score}</span>
                  ) : score < 0 ? (
                    <span className="text-[#ef4444] dark:text-rose-400">{score}</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">0</span>
                  )}
                </div>

              </motion.div>
            );
          })}

          {displayedStudents.length === 0 && (
            <div className="py-12 text-center text-slate-400 font-bold text-sm">
              Không tìm thấy học sinh nào trong lớp này.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
