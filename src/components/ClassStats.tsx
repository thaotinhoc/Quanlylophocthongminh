import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Activity, TrendingUp, TrendingDown, Calendar, FileSpreadsheet, FileDown, 
  Sparkles, Loader2, BookOpen, Award, CheckCircle2, ListFilter
} from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: any;
  }
}

// Custom color palette for reasons in Pie Chart matching the screenshot
const REASON_COLORS: { [key: string]: string } = {
  "Nói chuyện riêng trong giờ": "#e11d48", // Crimson red
  "Nói chuyện": "#e11d48",
  "Không làm bài tập": "#fb7185", // Light rose/coral
  "Không làm bài": "#fb7185",
  "Mất trật tự trong giờ học": "#be123c", // Dark red
  "Mất trật tự": "#be123c",
  "Trừ điểm nề nếp": "#f43f5e",
  "Phát biểu ý kiến trong giờ học": "#34d399", // Mint green
  "Phát biểu tốt": "#34d399",
  "Làm bài tập tốt": "#10b981", // Emerald green
  "Làm bài tốt": "#10b981",
  "Thành tích xuất sắc": "#059669", // Dark emerald
  "Xuất sắc": "#059669",
  "Thưởng điểm cộng": "#10b981"
};

// Fallback color palette
const FALLBACK_COLORS = [
  "#10b981", "#fb7185", "#e11d48", "#34d399", "#be123c", 
  "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4"
];

export default function ClassStats() {
  const { students, classrooms, selectedClassId, setSelectedClassId, gradeHistory, subjects } = useApp();

  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("month");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const activeClassId = selectedClassId || classrooms[0]?.id || "";
  const activeClass = classrooms.find(c => c.id === activeClassId);

  // Filter grade history by selected class & timeframe
  const rawClassLogs = useMemo(() => {
    const now = new Date();
    return gradeHistory.filter(log => {
      if (log.classId !== activeClassId) return false;
      const logDate = new Date(log.timestamp);

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
      return true;
    });
  }, [gradeHistory, activeClassId, timeframe]);

  // Apply Subject Filter if selected
  const classLogs = useMemo(() => {
    if (selectedSubject === "all") return rawClassLogs;
    return rawClassLogs.filter(log => (log.subject || "Tin học") === selectedSubject);
  }, [rawClassLogs, selectedSubject]);

  // Per-subject statistics summary for active class
  const subjectStatsList = useMemo(() => {
    const activeClassStudents = students.filter(s => s.classId === activeClassId && (s.status || "active") === "active");
    const studentCount = activeClassStudents.length || 1;

    return subjects.map(subj => {
      const logsForSubj = rawClassLogs.filter(l => (l.subject || "Tin học") === subj);
      const addPts = logsForSubj.filter(l => l.points > 0).reduce((sum, l) => sum + l.points, 0);
      const minusPts = logsForSubj.filter(l => l.points < 0).reduce((sum, l) => sum + l.points, 0);

      const totalSubjScore = activeClassStudents.reduce((sum, s) => {
        const score = (s.subjectScores && s.subjectScores[subj] !== undefined)
          ? s.subjectScores[subj]
          : (subj === "Tin học" ? s.currentScore : 0);
        return sum + score;
      }, 0);
      const avgScore = Number((totalSubjScore / studentCount).toFixed(1));

      let topStudent = "";
      let maxScore = -1;
      activeClassStudents.forEach(s => {
        const score = (s.subjectScores && s.subjectScores[subj] !== undefined)
          ? s.subjectScores[subj]
          : (subj === "Tin học" ? s.currentScore : 0);
        if (score > maxScore && score > 0) {
          maxScore = score;
          topStudent = s.name;
        }
      });

      return {
        subject: subj,
        logCount: logsForSubj.length,
        addPoints: addPts,
        minusPoints: minusPts,
        netPoints: addPts + minusPts,
        avgScore,
        topStudent: topStudent ? `${topStudent} (${maxScore}đ)` : "Chưa có"
      };
    });
  }, [subjects, rawClassLogs, students, activeClassId]);

  // Calculate 4 Summary Metrics
  const totalLogs = classLogs.length;

  const totalAddPoints = useMemo(() => {
    return classLogs
      .filter(l => l.points > 0)
      .reduce((sum, l) => sum + l.points, 0);
  }, [classLogs]);

  const totalMinusPoints = useMemo(() => {
    return classLogs
      .filter(l => l.points < 0)
      .reduce((sum, l) => sum + l.points, 0);
  }, [classLogs]);

  const totalNetPoints = totalAddPoints + totalMinusPoints;

  // Group data by date for Bar Chart (Biểu đồ điểm số theo ngày)
  const barChartData = useMemo(() => {
    if (classLogs.length === 0) return [];

    const dateMap: { [key: string]: { date: string; positive: number; negative: number; rawDate: Date } } = {};

    classLogs.forEach(log => {
      const dateObj = new Date(log.timestamp);
      // Format as DD/MM
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dateStr = `${day}/${month}`;

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, positive: 0, negative: 0, rawDate: dateObj };
      }

      if (log.points > 0) {
        dateMap[dateStr].positive += log.points;
      } else {
        dateMap[dateStr].negative += Math.abs(log.points);
      }
    });

    // Sort chronologically
    return Object.values(dateMap)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(item => ({
        date: item.date,
        "Điểm cộng": item.positive,
        "Điểm trừ": item.negative
      }));
  }, [classLogs]);

  // Group data by reason for Pie Chart (Lý do phổ biến)
  const pieChartData = useMemo(() => {
    if (classLogs.length === 0) return [];

    const reasonCountMap: { [key: string]: number } = {};

    classLogs.forEach(log => {
      const reason = log.reason || "Khác";
      reasonCountMap[reason] = (reasonCountMap[reason] || 0) + 1;
    });

    return Object.keys(reasonCountMap).map((reason, index) => {
      const color = REASON_COLORS[reason] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
      return {
        name: reason,
        value: reasonCountMap[reason],
        color
      };
    });
  }, [classLogs]);

  // Export functions
  const classStudents = students.filter(s => s.classId === activeClassId);

  const exportToExcel = () => {
    if (classStudents.length === 0) return;

    // Worksheet 1: Master Student List with Subject Scores
    const masterData = classStudents.map((s, idx) => {
      const row: any = {
        "STT": idx + 1,
        "Mã HS": s.studentCode,
        "Họ và Tên": s.name,
        "Giới Tính": s.gender,
        "Lớp": activeClass?.name || s.className,
      };

      // Add column for each subject
      subjects.forEach(subj => {
        const score = (s.subjectScores && s.subjectScores[subj] !== undefined)
          ? s.subjectScores[subj]
          : (subj === "Tin học" ? s.currentScore : 0);
        row[`Điểm ${subj}`] = score;
      });

      row["Tổng điểm rèn luyện"] = s.currentScore;
      row["Xếp loại"] = s.rank || "B";
      row["Ghi chú"] = s.notes || "";
      return row;
    });

    // Worksheet 2: Detailed History Logs
    const historyData = classLogs.map((log, idx) => ({
      "STT": idx + 1,
      "Thời gian": new Date(log.timestamp).toLocaleString("vi-VN"),
      "Mã/Họ tên HS": log.studentName,
      "Lớp": log.className,
      "Môn học": log.subject || "Tin học",
      "Điểm": log.points > 0 ? `+${log.points}` : log.points,
      "Lý do / Hành vi": log.reason,
      "Người đánh giá": log.teacherName || "Giáo viên"
    }));

    const workbook = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(masterData);
    const ws2 = XLSX.utils.json_to_sheet(historyData.length > 0 ? historyData : [{"Thông báo": "Chưa có lịch sử chấm điểm"}]);

    XLSX.utils.book_append_sheet(workbook, ws1, "Diem_Theo_Mon_Hoc");
    XLSX.utils.book_append_sheet(workbook, ws2, "Lich_Su_Danh_Gia");
    XLSX.writeFile(workbook, `ThongKe_Diem_Lop_${activeClass?.name.replace(/\s+/g, "_")}_${selectedSubject !== "all" ? selectedSubject : "TatCaMon"}.xlsx`);
  };

  const exportToPDF = () => {
    if (classStudents.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`BANG DIEM VA THONG KE LOP ${activeClass?.name}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Mon hoc: ${selectedSubject === "all" ? "Tat ca cac mon" : selectedSubject}`, 14, 25);
    doc.text(`Khung thoi gian: ${timeframe === "today" ? "Hom nay" : timeframe === "week" ? "Tuan nay" : "Thang nay"}`, 14, 31);
    doc.text(`Ngay xuat bao cao: ${new Date().toLocaleDateString("vi-VN")}`, 14, 37);

    // Headings
    const subjHeaders = subjects.map(s => `Diem ${s}`);
    const head = [["STT", "Ma HS", "Ho va Ten", "Gioi tinh", ...subjHeaders, "Tong diem"]];

    const tableRows = classStudents.map((s, idx) => {
      const subjScores = subjects.map(subj => {
        return (s.subjectScores && s.subjectScores[subj] !== undefined)
          ? s.subjectScores[subj]
          : (subj === "Tin học" ? s.currentScore : 0);
      });
      return [
        idx + 1,
        s.studentCode,
        s.name,
        s.gender,
        ...subjScores,
        s.currentScore
      ];
    });

    doc.autoTable({
      head,
      body: tableRows,
      startY: 43,
      theme: "striped",
      styles: { fontSize: 8 }
    });

    doc.save(`ThongKe_Diem_Lop_${activeClass?.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none">

      {/* Top Header Filter Card (Matched exactly from screenshot) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#554ce4] flex items-center justify-center shrink-0 shadow-sm">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white tracking-tight">
              Thống kê điểm số
            </h1>
            <p className="text-[#8c88cf] dark:text-slate-400 text-xs md:text-sm mt-0.5 font-bold">
              Phân tích tình hình học tập của lớp
            </p>
          </div>
        </div>

        {/* Right: Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Class Selector Dropdown Pill */}
          <div className="relative">
            <select
              value={activeClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
              }}
              className="bg-white dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs md:text-sm px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer pr-8 appearance-none shadow-sm min-w-[110px]"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Subject Filter Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs md:text-sm px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer pr-8 appearance-none shadow-sm min-w-[120px]"
            >
              <option value="all">Tất cả môn</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Timeframe Dropdown Highlighted Pill matching screenshot */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as "today" | "week" | "month")}
              className="bg-white dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs md:text-sm px-4 py-2 rounded-2xl border-2 border-[#554ce4] outline-none cursor-pointer pr-8 appearance-none shadow-sm min-w-[120px]"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-xs font-bold">
              ▼
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={exportToExcel}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Xuất Báo Cáo Excel"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
            </button>
            <button
              onClick={exportToPDF}
              className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Xuất Báo Cáo PDF"
            >
              <FileDown size={16} className="text-rose-500" />
            </button>
          </div>

        </div>

      </div>

      {/* Top 4 Summary Cards Grid (Matched exactly from screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: TỔNG LƯỢT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e7ff] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              TỔNG LƯỢT
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white mt-0.5">
              {totalLogs}
            </div>
          </div>
        </div>

        {/* Card 2: ĐIỂM CỘNG */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] dark:bg-emerald-950/60 text-[#16a34a] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              ĐIỂM CỘNG
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#10b981] dark:text-emerald-400 mt-0.5">
              +{totalAddPoints}
            </div>
          </div>
        </div>

        {/* Card 3: ĐIỂM TRỪ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffe4e6] dark:bg-rose-950/60 text-[#e11d48] dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown size={22} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              ĐIỂM TRỪ
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#e11d48] dark:text-rose-400 mt-0.5">
              {totalMinusPoints}
            </div>
          </div>
        </div>

        {/* Card 4: ĐIỂM THỰC */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[24px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              ĐIỂM THỰC
            </div>
            <div className={`text-2xl md:text-3xl font-black mt-0.5 ${
              totalNetPoints > 0 
                ? "text-[#10b981]" 
                : totalNetPoints < 0 
                ? "text-[#e11d48]" 
                : "text-slate-600 dark:text-slate-300"
            }`}>
              {totalNetPoints > 0 ? `+${totalNetPoints}` : totalNetPoints}
            </div>
          </div>
        </div>

      </div>

      {/* Main Bottom Section (2 Side-by-Side Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Chart Card: Biểu đồ điểm số theo ngày */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 min-h-[360px]">
          <div>
            <h2 className="text-lg font-extrabold text-[#2D2A72] dark:text-white tracking-tight">
              Biểu đồ điểm số theo ngày
            </h2>
          </div>

          {barChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" fontSize={12} stroke="#94a3b8" tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontWeight: 700
                    }} 
                  />
                  <Bar dataKey="Điểm cộng" fill="#10b981" radius={[6, 6, 0, 0]} barSize={22} />
                  <Bar dataKey="Điểm trừ" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>

              {/* Legend at bottom matched from screenshot */}
              <div className="flex items-center justify-center gap-6 pt-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#10b981] rounded-sm inline-block"></span>
                  <span className="text-slate-700 dark:text-slate-300">Điểm cộng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#f43f5e] rounded-sm inline-block"></span>
                  <span className="text-slate-700 dark:text-slate-300">Điểm trừ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-bold italic space-y-1">
              <span>Chưa có dữ liệu điểm số trong khoảng thời gian này</span>
              <span className="text-[11px] font-normal text-slate-400">Hãy sang mục "Chấm điểm" để đánh giá học sinh</span>
            </div>
          )}
        </div>

        {/* Right Chart Card: Lý do phổ biến */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 min-h-[360px]">
          <div>
            <h2 className="text-lg font-extrabold text-[#2D2A72] dark:text-white tracking-tight">
              Lý do phổ biến
            </h2>
          </div>

          {pieChartData.length > 0 ? (
            <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Pie Chart Donut */}
              <div className="w-full sm:w-1/2 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontWeight: 700 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list matched from screenshot */}
              <div className="w-full sm:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {pieChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span 
                      className="w-3 h-3 rounded-sm shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="truncate min-w-0 flex-1">{item.name}</span>
                    <span className="text-slate-400 text-[11px] font-mono shrink-0">({item.value})</span>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-bold italic space-y-1">
              <span>Chưa có lý do ghi nhận trong khoảng thời gian này</span>
              <span className="text-[11px] font-normal text-slate-400">Chọn khoảng thời gian khác hoặc chấm thêm lượt mới</span>
            </div>
          )}
        </div>

      </div>

      {/* Subject Breakdown Section */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-7 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#554ce4] flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#2D2A72] dark:text-white tracking-tight">
                Thống kê rèn luyện theo môn học
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Báo cáo chi tiết điểm số & lượt đánh giá của từng môn học trong {activeClass?.name || 'lớp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              <span>Xuất Excel theo môn</span>
            </button>
          </div>
        </div>

        {/* Subject Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStatsList.map((stat) => (
            <div 
              key={stat.subject}
              onClick={() => setSelectedSubject(selectedSubject === stat.subject ? "all" : stat.subject)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedSubject === stat.subject 
                  ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-[#554ce4] shadow-md ring-1 ring-[#554ce4]" 
                  : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-[#2D2A72] dark:text-white flex items-center gap-1.5">
                  <BookOpen size={16} className="text-[#554ce4]" />
                  {stat.subject}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                  {stat.logCount} lượt
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 text-center bg-white dark:bg-slate-800 rounded-xl p-2 border border-slate-100 dark:border-slate-700/60">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm +</div>
                  <div className="text-sm font-black text-emerald-600">+{stat.addPoints}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm -</div>
                  <div className="text-sm font-black text-rose-500">{stat.minusPoints}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">ĐTB lớp</div>
                  <div className="text-sm font-black text-[#554ce4]">{stat.avgScore}</div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-[11px]">
                  <Award size={13} className="text-amber-500" />
                  <span>Top học sinh:</span>
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[150px]">
                  {stat.topStudent}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown Table by Student & Subject */}
        <div className="pt-3">
          <h3 className="text-sm font-extrabold text-[#2D2A72] dark:text-white mb-3 flex items-center gap-1.5">
            <ListFilter size={16} className="text-[#554ce4]" />
            <span>Bảng tổng hợp điểm môn học của học sinh lớp {activeClass?.name}</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-[#2D2A72] dark:text-slate-200 font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="px-3.5 py-3 text-center w-12">STT</th>
                  <th className="px-3.5 py-3">Mã HS</th>
                  <th className="px-3.5 py-3">Họ và Tên</th>
                  <th className="px-3.5 py-3 text-center">Giới tính</th>
                  {subjects.map(subj => (
                    <th key={subj} className="px-3.5 py-3 text-center">{subj}</th>
                  ))}
                  <th className="px-3.5 py-3 text-center">Tổng rèn luyện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {classStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3.5 py-2.5 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3.5 py-2.5 font-bold font-mono text-slate-600 dark:text-slate-300">{s.studentCode}</td>
                    <td className="px-3.5 py-2.5 font-extrabold text-slate-800 dark:text-white">{s.name}</td>
                    <td className="px-3.5 py-2.5 text-center text-slate-500">{s.gender}</td>
                    {subjects.map(subj => {
                      const score = (s.subjectScores && s.subjectScores[subj] !== undefined)
                        ? s.subjectScores[subj]
                        : (subj === "Tin học" ? s.currentScore : 0);
                      return (
                        <td key={subj} className="px-3.5 py-2.5 text-center font-black text-indigo-600 dark:text-indigo-400">
                          {score}
                        </td>
                      );
                    })}
                    <td className="px-3.5 py-2.5 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {s.currentScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
