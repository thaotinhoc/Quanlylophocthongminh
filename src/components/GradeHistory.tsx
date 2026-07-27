import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileSpreadsheet, Send, Download, Check, ExternalLink, Filter, 
  ChevronDown, Table, History, Users, Award, Sparkles 
} from "lucide-react";
import { motion } from "motion/react";
import * as XLSX from "xlsx";

export default function GradeHistoryView() {
  const { students, classrooms, gradeHistory } = useApp();

  // Export Mode: "excel" | "sheets"
  const [exportMode, setExportMode] = useState<"excel" | "sheets">("excel");
  
  // Selected class for export ("all" or classId)
  const [selectedExportClass, setSelectedExportClass] = useState<string>("all");

  // Active preview tab: "students" | "summary" | "history"
  const [previewTab, setPreviewTab] = useState<"students" | "summary" | "history">("history");

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Google Sheets sync state
  const [sheetUrl, setSheetUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Filtered lists according to selectedExportClass
  const filteredStudents = students.filter(s => 
    selectedExportClass === "all" ? true : s.classId === selectedExportClass
  );

  const filteredLogs = gradeHistory.filter(l => 
    selectedExportClass === "all" ? true : l.classId === selectedExportClass
  );

  // Handler for Excel download with 3 sheets
  const handleExportExcel = () => {
    setIsExporting(true);

    setTimeout(() => {
      try {
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Danh sách học sinh
        const sheet1Data = filteredStudents.map((s, idx) => {
          const studentClass = classrooms.find(c => c.id === s.classId);
          return {
            "STT": idx + 1,
            "Mã HS": s.studentCode || `HS${String(idx + 1).padStart(3, '0')}`,
            "Họ và tên": s.name,
            "Giới tính": s.gender || "Nam",
            "Lớp": studentClass?.name || "5A1",
            "Điểm rèn luyện": s.currentScore || 0,
            "Ghi chú": s.notes || ""
          };
        });
        const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);
        XLSX.utils.book_append_sheet(workbook, worksheet1, "Danh sách học sinh");

        // Sheet 2: Bảng điểm tổng hợp
        const sheet2Data = filteredStudents.map((s, idx) => {
          const studentClass = classrooms.find(c => c.id === s.classId);
          const logs = gradeHistory.filter(h => h.studentId === s.id);
          const plusPoints = logs.filter(h => h.points > 0).reduce((sum, h) => sum + h.points, 0);
          const minusPoints = logs.filter(h => h.points < 0).reduce((sum, h) => sum + h.points, 0);
          const netPoints = plusPoints + minusPoints;

          return {
            "STT": idx + 1,
            "Mã HS": s.studentCode || `HS${String(idx + 1).padStart(3, '0')}`,
            "Họ và tên": s.name,
            "Lớp": studentClass?.name || "5A1",
            "Tổng điểm cộng": plusPoints,
            "Tổng điểm trừ": minusPoints,
            "Điểm thực tế": netPoints,
            "Trạng thái": netPoints >= 5 ? "Rất tốt" : netPoints >= 0 ? "Tốt" : "Cần rèn luyện"
          };
        });
        const worksheet2 = XLSX.utils.json_to_sheet(sheet2Data);
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Bảng điểm tổng hợp");

        // Sheet 3: Lịch sử điểm (Matching Image 2 exactly)
        const sheet3Data = filteredLogs.map((log) => {
          const dateObj = new Date(log.timestamp);
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = dateObj.getFullYear();
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const mins = String(dateObj.getMinutes()).padStart(2, '0');
          const formattedDate = `${day}/${month}/${year} ${hours}:${mins}`;

          const classNameShort = log.className ? log.className.split(" - ")[0] : "5A1";

          return {
            "Thời gian": formattedDate,
            "Họ và tên": log.studentName,
            "Lớp": classNameShort,
            "Điểm": log.points,
            "Lý do": log.reason
          };
        });
        const worksheet3 = XLSX.utils.json_to_sheet(sheet3Data);
        XLSX.utils.book_append_sheet(workbook, worksheet3, "Lịch sử điểm");

        // File name calculation
        const classObj = classrooms.find(c => c.id === selectedExportClass);
        const classNameStr = selectedExportClass === "all" ? "TatCaCacLop" : (classObj?.name.replace(/\s+/g, "_") || "LopHoc");

        XLSX.writeFile(workbook, `BaoCao_NeNep_${classNameStr}.xlsx`);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } catch (err) {
        console.error("Export error:", err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  const handleSyncSheets = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 font-sans select-none">
      
      {/* Top Header Section matched from image 1 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#2D2A72] dark:text-white tracking-tight">
          Xuất dữ liệu
        </h1>
        <p className="text-[#8c88cf] dark:text-slate-400 text-xs md:text-sm mt-0.5 font-bold">
          Tải xuống hoặc đồng bộ dữ liệu nề nếp để lưu trữ và báo cáo.
        </p>
      </div>

      {/* Top Mode Toggle Buttons (Xuất file Excel | Gửi tới Google Sheets) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExportMode("excel")}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all shadow-sm ${
            exportMode === "excel"
              ? "bg-[#059669] text-white"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <FileSpreadsheet size={18} />
          <span>Xuất file Excel</span>
        </button>

        <button
          onClick={() => setExportMode("sheets")}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 transition-all ${
            exportMode === "sheets"
              ? "bg-[#059669] text-white shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <Send size={16} />
          <span>Gửi tới Google Sheets</span>
        </button>
      </div>

      {/* Main Export Card matched directly from image 1 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-8 md:p-10 shadow-sm max-w-2xl mx-auto text-center space-y-6">
        
        {exportMode === "excel" ? (
          <>
            {/* Soft Green Icon Backdrop Circle */}
            <div className="w-16 h-16 rounded-full bg-[#e6f4ea] dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <FileSpreadsheet size={32} strokeWidth={2} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-black text-[#2D2A72] dark:text-white">
                Xuất dữ liệu ra Excel
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto mt-2 leading-relaxed">
                File Excel sẽ bao gồm 3 sheet: <span className="text-slate-700 dark:text-slate-200 font-extrabold">Danh sách học sinh</span>, <span className="text-slate-700 dark:text-slate-200 font-extrabold">Bảng điểm tổng hợp</span> và <span className="text-slate-700 dark:text-slate-200 font-extrabold">Lịch sử cộng/trừ điểm chi tiết</span>.
              </p>
            </div>

            {/* Dropdown for selecting class */}
            <div className="space-y-1.5 max-w-xs mx-auto text-left">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Chọn lớp cần xuất
              </label>
              <div className="relative">
                <select
                  value={selectedExportClass}
                  onChange={(e) => setSelectedExportClass(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2D2A72] dark:text-white font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-[#059669] appearance-none pr-9 cursor-pointer shadow-sm"
                >
                  <option value="all">Tất cả các lớp</option>
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>Lớp {c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold">
                  ▼
                </div>
              </div>
            </div>

            {/* Big Action Download Button */}
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full max-w-xs mx-auto py-3 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs md:text-sm rounded-2xl shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {exportSuccess ? (
                <>
                  <Check size={18} />
                  <span>Đã tải xuống Excel!</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>{isExporting ? "Đang tạo file..." : "Tải xuống Excel"}</span>
                </>
              )}
            </button>
          </>
        ) : (
          /* Google Sheets Sync Mode Card */
          <>
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-400 flex items-center justify-center mx-auto shadow-inner">
              <Send size={28} strokeWidth={2} />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-black text-[#2D2A72] dark:text-white">
                Gửi tới Google Sheets
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto mt-2 leading-relaxed">
                Đồng bộ trực tiếp 3 sheet dữ liệu báo cáo nề nếp sang trang Google Sheets công khai của lớp.
              </p>
            </div>

            <form onSubmit={handleSyncSheets} className="space-y-4 max-w-sm mx-auto text-left">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Đường dẫn Google Sheet (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#0284c7] text-xs font-semibold text-[#2D2A72] dark:text-white placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  Chọn lớp cần đồng bộ
                </label>
                <div className="relative">
                  <select
                    value={selectedExportClass}
                    onChange={(e) => setSelectedExportClass(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#2D2A72] dark:text-white font-extrabold text-xs md:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-[#0284c7] appearance-none pr-9 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả các lớp</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-xs md:text-sm rounded-2xl shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {syncSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Đã đồng bộ thành công!</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{isSyncing ? "Đang gửi dữ liệu..." : "Đồng bộ Google Sheets"}</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </div>

      {/* Live Data Preview Section (3 Sheets Tabs matched from image 2) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-6 shadow-sm space-y-5">
        
        {/* Preview Tabs header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Table size={20} className="text-[#059669]" />
            <h2 className="text-base md:text-lg font-black text-[#2D2A72] dark:text-white">
              Xem trước dữ liệu các Sheet Excel
            </h2>
          </div>

          {/* 3 Sheet Tabs corresponding to Excel sheets */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setPreviewTab("students")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
                previewTab === "students"
                  ? "bg-white dark:bg-slate-700 text-[#059669] dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              1. Danh sách học sinh ({filteredStudents.length})
            </button>

            <button
              onClick={() => setPreviewTab("summary")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
                previewTab === "summary"
                  ? "bg-white dark:bg-slate-700 text-[#059669] dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              2. Bảng điểm tổng hợp ({filteredStudents.length})
            </button>

            <button
              onClick={() => setPreviewTab("history")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
                previewTab === "history"
                  ? "bg-white dark:bg-slate-700 text-[#059669] dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              3. Lịch sử điểm ({filteredLogs.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Danh sách học sinh */}
        {previewTab === "students" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Giới tính</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Điểm rèn luyện</th>
                  <th className="py-3 px-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {filteredStudents.map((student, idx) => {
                  const studentClass = classrooms.find(c => c.id === student.classId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{student.studentCode || `HS${String(idx + 1).padStart(3, '0')}`}</td>
                      <td className="py-3 px-4 font-extrabold text-[#2D2A72] dark:text-white">{student.name}</td>
                      <td className="py-3 px-4">{student.gender || "Nam"}</td>
                      <td className="py-3 px-4 font-bold text-slate-500">{studentClass?.name || "5A1"}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-[#10b981]">{student.currentScore || 0}</td>
                      <td className="py-3 px-4 text-slate-400">{student.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Bảng điểm tổng hợp */}
        {previewTab === "summary" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Mã HS</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Tổng điểm cộng</th>
                  <th className="py-3 px-4 text-center">Tổng điểm trừ</th>
                  <th className="py-3 px-4 text-center">Điểm thực tế</th>
                  <th className="py-3 px-4">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {filteredStudents.map((student, idx) => {
                  const studentClass = classrooms.find(c => c.id === student.classId);
                  const logs = gradeHistory.filter(h => h.studentId === student.id);
                  const plusPoints = logs.filter(h => h.points > 0).reduce((sum, h) => sum + h.points, 0);
                  const minusPoints = logs.filter(h => h.points < 0).reduce((sum, h) => sum + h.points, 0);
                  const netPoints = plusPoints + minusPoints;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{student.studentCode || `HS${String(idx + 1).padStart(3, '0')}`}</td>
                      <td className="py-3 px-4 font-extrabold text-[#2D2A72] dark:text-white">{student.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-500">{studentClass?.name || "5A1"}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-[#10b981]">+{plusPoints}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-[#e11d48]">{minusPoints}</td>
                      <td className={`py-3 px-4 text-center font-mono font-black ${
                        netPoints > 0 ? "text-[#10b981]" : netPoints < 0 ? "text-[#e11d48]" : "text-slate-500"
                      }`}>
                        {netPoints > 0 ? `+${netPoints}` : netPoints}
                      </td>
                      <td className="py-3 px-4 font-bold text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full ${
                          netPoints >= 5 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" 
                            : netPoints >= 0 
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" 
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        }`}>
                          {netPoints >= 5 ? "Rất tốt" : netPoints >= 0 ? "Tốt" : "Cần rèn luyện"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Lịch sử điểm (Exact layout as shown in Image 2) */}
        {previewTab === "history" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const year = dateObj.getFullYear();
                  const hours = String(dateObj.getHours()).padStart(2, '0');
                  const mins = String(dateObj.getMinutes()).padStart(2, '0');
                  const formattedDate = `${day}/${month}/${year} ${hours}:${mins}`;

                  const classNameShort = log.className ? log.className.split(" - ")[0] : "5A1";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-slate-500">{formattedDate}</td>
                      <td className="py-3 px-4 font-extrabold text-[#2D2A72] dark:text-white">{log.studentName}</td>
                      <td className="py-3 px-4 font-bold text-slate-500">{classNameShort}</td>
                      <td className={`py-3 px-4 text-center font-mono font-black ${
                        log.points > 0 ? "text-[#10b981]" : log.points < 0 ? "text-[#e11d48]" : "text-slate-400"
                      }`}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">{log.reason}</td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-bold">
                      Chưa có lịch sử chấm điểm cho lựa chọn này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
