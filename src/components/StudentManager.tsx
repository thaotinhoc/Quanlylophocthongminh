import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Student, Gender } from "../types";
import { 
  UserPlus, Search, Edit3, Trash2, Import, FileSpreadsheet, Download,
  AlertTriangle, Filter, Check, X, User, Info, ArrowRightLeft,
  UserCheck, Camera, Sparkles, Users, RefreshCw, LayoutGrid, List, Plus, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";

// Avatar preset illustrations for students without custom photos
const CUTE_AVATARS = [
  { bg: "bg-amber-100 text-amber-700", emoji: "🐱", name: "Mèo con" },
  { bg: "bg-pink-100 text-pink-700", emoji: "🦊", name: "Cáo đỏ" },
  { bg: "bg-indigo-100 text-indigo-700", emoji: "🐻", name: "Gấu xinh" },
  { bg: "bg-emerald-100 text-emerald-700", emoji: "🐰", name: "Thỏ ngọc" },
  { bg: "bg-blue-100 text-blue-700", emoji: "🐼", name: "Gấu trúc" },
  { bg: "bg-purple-100 text-purple-700", emoji: "🦁", name: "Sư tử" },
  { bg: "bg-[#eaf2fe] text-[#3a82f6]", emoji: "🐶", name: "Cún nhỏ" }
];

export default function StudentManager() {
  const { 
    students, classrooms, addStudent, updateStudent, deleteStudent, 
    importStudents, selectedClassId, setSelectedClassId 
  } = useApp();

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "transferred" | "transferred_class">("all");
  const [filterMissingPhoto, setFilterMissingPhoto] = useState<boolean>(false);
  
  // Quick Add Form on Left Panel
  const [quickName, setQuickName] = useState("");
  const [quickClassId, setQuickClassId] = useState<string>("");

  // Modals
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [addTab, setAddTab] = useState<"single" | "batch">("single");
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState(false);
  const [importTargetClassId, setImportTargetClassId] = useState<string>("");
  const [avatarModalStudent, setAvatarModalStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [transferConfirmId, setTransferConfirmId] = useState<string | null>(null);

  // Single Add Form State
  const [name, setName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [classId, setClassId] = useState("");
  const [gender, setGender] = useState<Gender>("Nam");
  const [birthday, setBirthday] = useState("");
  const [notes, setNotes] = useState("");

  // Batch Add Form State
  const [batchNamesText, setBatchNamesText] = useState("");

  // Import states
  const [importedData, setImportedData] = useState<Student[]>([]);
  const [duplicateWarningCount, setDuplicateWarningCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Active target class
  const activeClassId = selectedClassId || classrooms[0]?.id || "";
  const activeClass = classrooms.find(c => c.id === activeClassId);

  // Quick add from left panel
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const targetClassId = quickClassId || activeClassId;
    const targetClassObj = classrooms.find(c => c.id === targetClassId);
    const classStudents = students.filter(s => s.classId === targetClassId);
    const code = "HS" + (classStudents.length + 1).toString().padStart(2, '0');
    
    // Auto detect gender based on name hints if any
    const lower = quickName.toLowerCase();
    const parsedGender: Gender = (lower.includes("thị") || lower.includes("nhi") || lower.includes("trang") || lower.includes("mai") || lower.includes("vy") || lower.includes("linh") || lower.includes("hương") || lower.includes("hoa")) ? "Nữ" : "Nam";

    const newStudent: Student = {
      id: "std_" + Date.now(),
      name: quickName.trim(),
      studentCode: code,
      classId: targetClassId,
      className: targetClassObj ? targetClassObj.name : "Lớp học",
      gender: parsedGender,
      birthday: "2013-01-01",
      notes: "",
      currentScore: 0,
      speechCount: 0,
      attendanceCount: 0,
      goodScoresCount: 0,
      rank: "B",
      status: "active"
    };

    addStudent(newStudent);
    setQuickName("");
  };

  // Open single student add modal
  const handleOpenAdd = () => {
    setName("");
    const classStudents = students.filter(s => s.classId === activeClassId);
    setStudentCode("HS" + (classStudents.length + 1).toString().padStart(2, '0'));
    setClassId(activeClassId);
    setGender("Nam");
    setBirthday("2013-01-01");
    setNotes("");
    setBatchNamesText("");
    setAddTab("single");
    setIsOpenAddModal(true);
  };

  const handleOpenEdit = (s: Student) => {
    setSelectedStudent(s);
    setName(s.name);
    setStudentCode(s.studentCode);
    setClassId(s.classId);
    setGender(s.gender);
    setBirthday(s.birthday || "2013-01-01");
    setNotes(s.notes || "");
    setIsOpenEditModal(true);
  };

  // Add single student from modal
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentCode.trim() || !classId) return;

    if (students.some(s => s.studentCode === studentCode && s.classId === classId)) {
      alert(`Mã học sinh "${studentCode}" đã tồn tại trong lớp!`);
      return;
    }

    const targetClass = classrooms.find(c => c.id === classId);
    const newStudent: Student = {
      id: "std_" + Date.now(),
      name: name.trim(),
      studentCode: studentCode.trim(),
      classId,
      className: targetClass ? targetClass.name : "Lớp học",
      gender,
      birthday,
      notes: notes.trim(),
      currentScore: 0,
      speechCount: 0,
      attendanceCount: 0,
      goodScoresCount: 0,
      rank: "B",
      status: "active"
    };

    addStudent(newStudent);
    setIsOpenAddModal(false);
  };

  // Add batch students
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNamesText.trim() || !classId) return;

    const lines = batchNamesText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const targetClass = classrooms.find(c => c.id === classId);
    const existingClassStudents = students.filter(s => s.classId === classId);
    let startIdx = existingClassStudents.length + 1;

    const newStudents: Student[] = lines.map((line, idx) => {
      let parsedName = line;
      let parsedGender: Gender = "Nam";

      if (line.toLowerCase().includes("nữ") || line.toLowerCase().includes("nu")) {
        parsedGender = "Nữ";
      }

      parsedName = parsedName
        .replace(/[\(\-–]\s*(nam|nữ|nu)\s*[\)]?/gi, "")
        .replace(/\b(nam|nữ|nu)\b/gi, "")
        .trim() || `Học sinh ${idx + 1}`;

      const code = "HS" + (startIdx + idx).toString().padStart(2, '0');

      return {
        id: `std_batch_${Date.now()}_${idx}`,
        name: parsedName,
        studentCode: code,
        classId,
        className: targetClass ? targetClass.name : "Lớp học",
        gender: parsedGender,
        birthday: "2013-01-01",
        notes: "",
        currentScore: 0,
        speechCount: 0,
        attendanceCount: 0,
        goodScoresCount: 0,
        rank: "B",
        status: "active"
      };
    });

    importStudents(newStudents);
    setIsOpenAddModal(false);
    alert(`Đã thêm thành công ${newStudents.length} học sinh mới vào ${targetClass?.name || 'lớp'}!`);
  };

  // Edit student
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !name.trim() || !classId) return;

    const targetClass = classrooms.find(c => c.id === classId);
    const updated: Student = {
      ...selectedStudent,
      name: name.trim(),
      studentCode: studentCode.trim(),
      classId,
      className: targetClass ? targetClass.name : "Lớp học",
      gender,
      birthday,
      notes: notes.trim()
    };

    updateStudent(updated);
    setIsOpenEditModal(false);
  };

  // Transfer student to another class
  const handleTransferClass = (student: Student, targetClassId: string) => {
    const targetClass = classrooms.find(c => c.id === targetClassId);
    if (!targetClass) return;

    const oldClassName = student.className || classrooms.find(c => c.id === student.classId)?.name || "";

    const updated: Student = {
      ...student,
      classId: targetClass.id,
      className: targetClass.name,
      transferredFromClass: oldClassName || undefined,
      status: "active"
    };

    updateStudent(updated);
    setTransferConfirmId(null);
  };

  // Delete student permanently
  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    setDeleteConfirmId(null);
  };

  // Toggle student status (active vs transferred)
  const handleToggleTransfer = (student: Student) => {
    const newStatus = student.status === "transferred" ? "active" : "transferred";
    updateStudent({
      ...student,
      status: newStatus
    });
    setTransferConfirmId(null);
  };

  // Upload student avatar
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && avatarModalStudent) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateStudent({
          ...avatarModalStudent,
          avatar: result
        });
        setAvatarModalStudent(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Set preset avatar
  const handleSetPresetAvatar = (emoji: string) => {
    if (!avatarModalStudent) return;
    updateStudent({
      ...avatarModalStudent,
      avatar: emoji
    });
    setAvatarModalStudent(null);
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      ["DANH SÁCH HỌC SINH LỚP 5A1"],
      ["Năm học: 2025 - 2026"],
      ["GVCN: Bùi Thanh Thảo", "", "", "", "TSHS: 38", "Nữ: 15"],
      ["STT", "HỌ TÊN", "GIỚI TÍNH", "GIỮA HK I", "CUỐI HK I", "GIỮA HK II", "CUỐI HK II", "GHI CHÚ"],
      [1, "Nguyễn Anh Phước", "Nam", 9, 10, 9, 10, "Lập trình tốt"],
      [2, "Nguyễn Linh Nhi", "Nữ", 10, 10, 10, 10, "Chăm chỉ"],
      [3, "Nguyễn Quỳnh Trang", "Nữ", 8, 9, 9, 9, "Ngoan"],
      [4, "Đoàn Hồng Khánh", "Nam", 9, 9, 10, 10, "Hăng hái phát biểu"],
      [5, "Trần Hoàng Nam", "Nam", 8, 8, 9, 9, "Cần chú ý bài tập"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 6 }, { wch: 26 }, { wch: 12 }, { wch: 12 }, 
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Danh_Sach_HS");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh_Lop.xlsx");
  };

  // Helper to normalize strings for robust keyword matching
  const normalizeHeaderStr = (str: any): string => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();
  };

  // Excel Upload Parsing
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) return;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rowsAOA: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        processImportedRowsAOA(rowsAOA);
      } catch (err) {
        console.error("Lỗi đọc file Excel:", err);
        alert("Không thể đọc file Excel này. Vui lòng kiểm tra định dạng tệp!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processImportedRowsAOA = (rowsAOA: any[][]) => {
    if (!rowsAOA || rowsAOA.length === 0) {
      alert("Tệp Excel rỗng hoặc không đúng định dạng!");
      return;
    }

    let headerRowIdx = -1;
    let nameColIdx = -1;
    let hoColIdx = -1;
    let tenColIdx = -1;
    let genderColIdx = -1;
    let codeColIdx = -1;
    let notesColIdx = -1;

    // Scan top 25 rows for header row
    for (let i = 0; i < Math.min(rowsAOA.length, 25); i++) {
      const row = rowsAOA[i];
      if (!Array.isArray(row)) continue;

      let foundName = -1;
      let foundHo = -1;
      let foundTen = -1;
      let foundGender = -1;
      let foundCode = -1;
      let foundNotes = -1;

      for (let j = 0; j < row.length; j++) {
        const rawCell = String(row[j] || "").trim();
        const normCell = normalizeHeaderStr(rawCell);
        if (!normCell) continue;

        // Combined Full Name column
        if (
          normCell === "ho ten" ||
          normCell === "ho va ten" ||
          normCell === "ho va ten hoc sinh" ||
          normCell === "ho ten hoc sinh" ||
          normCell === "ten hoc sinh" ||
          normCell === "danh sach hoc sinh" ||
          normCell.includes("ho va ten") ||
          normCell.includes("ho ten")
        ) {
          foundName = j;
        }
        // Separate Ho / Ho Dem column
        else if (
          (normCell === "ho" || normCell === "ho va dem" || normCell === "ho dem" || normCell.includes("ho dem")) &&
          !normCell.includes("ten")
        ) {
          foundHo = j;
        }
        // Separate Ten column
        else if (
          (normCell === "ten" || normCell === "ten hs") &&
          !normCell.includes("ho")
        ) {
          foundTen = j;
        }

        // Gender column
        if (
          normCell.includes("gioi tinh") ||
          normCell.includes("phai") ||
          normCell.includes("nam/nu") ||
          normCell === "gender"
        ) {
          foundGender = j;
        }

        // Code / STT column
        if (
          normCell === "stt" ||
          normCell.includes("ma hs") ||
          normCell.includes("ma hoc sinh") ||
          normCell.includes("so thu tu") ||
          normCell === "code" ||
          normCell === "ma"
        ) {
          foundCode = j;
        }

        // Notes column
        if (
          normCell.includes("ghi chu") ||
          normCell.includes("nhan xet") ||
          normCell.includes("note")
        ) {
          foundNotes = j;
        }
      }

      if (foundName !== -1 || (foundHo !== -1 && foundTen !== -1)) {
        headerRowIdx = i;
        nameColIdx = foundName;
        hoColIdx = foundHo;
        tenColIdx = foundTen;
        genderColIdx = foundGender;
        codeColIdx = foundCode;
        notesColIdx = foundNotes;
        break;
      }
    }

    const targetClassId = importTargetClassId || activeClassId || classrooms[0]?.id || "";
    const targetClassObj = classrooms.find(c => c.id === targetClassId);

    const formatted: Student[] = [];
    let dupCount = 0;

    if (headerRowIdx !== -1) {
      for (let r = headerRowIdx + 1; r < rowsAOA.length; r++) {
        const row = rowsAOA[r];
        if (!Array.isArray(row)) continue;

        let rawName = "";
        if (nameColIdx !== -1) {
          rawName = String(row[nameColIdx] || "").trim();
        } else if (hoColIdx !== -1 && tenColIdx !== -1) {
          const hoVal = String(row[hoColIdx] || "").trim();
          const tenVal = String(row[tenColIdx] || "").trim();
          rawName = `${hoVal} ${tenVal}`.trim();
        }

        const normName = normalizeHeaderStr(rawName);
        if (
          !rawName ||
          rawName.length < 2 ||
          normName.includes("tong so") ||
          normName.includes("lop") ||
          normName.includes("truong") ||
          normName.includes("stt") ||
          normName.includes("ho va ten") ||
          normName.includes("nam hoc")
        ) {
          continue;
        }

        // Gender detection
        const rawGenderVal = genderColIdx !== -1 ? String(row[genderColIdx] || "") : "";
        let rawGender: Gender = "Nam";
        const normGender = normalizeHeaderStr(rawGenderVal);
        if (normGender) {
          rawGender = normGender.includes("nu") || normGender.includes("female") ? "Nữ" : "Nam";
        } else {
          // Auto infer from Vietnamese middle/first name if missing
          const lowerName = rawName.toLowerCase();
          if (
            lowerName.includes("thị") ||
            lowerName.includes("nhi") ||
            lowerName.includes("trang") ||
            lowerName.includes("chi") ||
            lowerName.includes("hà") ||
            lowerName.includes("phương") ||
            lowerName.includes("linh") ||
            lowerName.includes("như") ||
            lowerName.includes("ngọc") ||
            lowerName.includes("mai") ||
            lowerName.includes("yến") ||
            lowerName.includes("quỳnh") ||
            lowerName.includes("châu") ||
            lowerName.includes("khánh") ||
            lowerName.includes("vy") ||
            lowerName.includes("my") ||
            lowerName.includes("thảo") ||
            lowerName.includes("hương")
          ) {
            rawGender = "Nữ";
          }
        }

        let rawCode = codeColIdx !== -1 ? String(row[codeColIdx] || "").trim() : "";
        if (!rawCode || rawCode === "undefined" || !isNaN(Number(rawCode))) {
          const numCode = !isNaN(Number(rawCode)) && Number(rawCode) > 0 ? Number(rawCode) : (formatted.length + 1);
          rawCode = "HS" + numCode.toString().padStart(2, '0');
        }

        const rawNotes = notesColIdx !== -1 ? String(row[notesColIdx] || "").trim() : "";

        if (students.some(s => s.studentCode === rawCode && s.classId === targetClassId)) {
          dupCount++;
        }

        formatted.push({
          id: `std_imp_${Date.now()}_${r}_${Math.random().toString(36).substring(2,6)}`,
          name: rawName, // Full complete name preserved
          studentCode: rawCode,
          classId: targetClassId,
          className: targetClassObj ? targetClassObj.name : "Lớp học",
          gender: rawGender,
          birthday: "2013-01-01",
          notes: rawNotes,
          currentScore: 0,
          speechCount: 0,
          attendanceCount: 0,
          goodScoresCount: 0,
          rank: "B",
          status: "active"
        });
      }
    } else {
      // Fallback: If no header row was detected, scan rows for full name cell
      rowsAOA.forEach((rowA, idx) => {
        if (!Array.isArray(rowA)) return;
        // Find cell containing a full name (2+ words, not numbers/headers)
        let foundFullCell = "";
        for (let c = 0; c < rowA.length; c++) {
          const val = String(rowA[c] || "").trim();
          const normVal = normalizeHeaderStr(val);
          if (
            val.length >= 2 &&
            val.split(/\s+/).length >= 2 &&
            !normVal.includes("danh sach") &&
            !normVal.includes("lop") &&
            !normVal.includes("truong") &&
            !normVal.includes("nam hoc") &&
            !normVal.includes("stt") &&
            !normVal.includes("ho va ten")
          ) {
            foundFullCell = val;
            break;
          }
        }

        if (!foundFullCell) return;

        formatted.push({
          id: `std_imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2,6)}`,
          name: foundFullCell, // Full name without slicing!
          studentCode: "HS" + (formatted.length + 1).toString().padStart(2, '0'),
          classId: targetClassId,
          className: targetClassObj ? targetClassObj.name : "Lớp học",
          gender: normalizeHeaderStr(rowA.join(" ")).includes("nu") ? "Nữ" : "Nam",
          birthday: "2013-01-01",
          notes: "",
          currentScore: 0,
          speechCount: 0,
          attendanceCount: 0,
          goodScoresCount: 0,
          rank: "B",
          status: "active"
        });
      });
    }

    setImportedData(formatted);
    setDuplicateWarningCount(dupCount);
  };

  const handleConfirmImport = () => {
    if (importedData.length === 0) return;
    const targetClassId = importTargetClassId || activeClassId || classrooms[0]?.id || "";
    const targetClassObj = classrooms.find(c => c.id === targetClassId);

    importStudents(importedData);
    setIsOpenImportModal(false);
    setImportedData([]);
    alert(`Thành công! Đã nhập thêm ${importedData.length} học sinh vào Lớp ${targetClassObj?.name || ''}.`);
  };

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Students filtering
  const classStudents = students.filter(s => selectedClassId ? s.classId === selectedClassId : true);
  const activeStudents = classStudents.filter(s => (s.status || "active") === "active");
  const activeCount = activeStudents.length;
  
  // Missing custom photos count
  const missingPhotoStudents = activeStudents.filter(s => !s.avatar || s.avatar.length <= 4);
  const missingPhotoCount = missingPhotoStudents.length;

  const filteredStudents = classStudents.filter(s => {
    const status = s.status || "active";
    if (filterStatus === "active" && status !== "active") return false;
    if (filterStatus === "transferred" && status !== "transferred") return false;
    if (filterStatus === "transferred_class" && !s.transferredFromClass) return false;
    if (filterGender !== "all" && s.gender !== filterGender) return false;
    if (filterMissingPhoto && (s.avatar && s.avatar.length > 4)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-8 font-sans select-none">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A72] dark:text-white tracking-tight">
            Danh sách Học sinh
          </h1>
          <p className="text-[#8c88cf] dark:text-slate-400 text-xs mt-0.5 font-semibold">
            Thêm và quản lý học sinh trong lớp
          </p>
        </div>

        {/* Right side selector dropdown + view mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter Dropdown matching screenshot */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2D2A72] dark:text-slate-300">Đang chọn lớp:</span>
            <div className="relative">
              <select
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(e.target.value || null)}
                className="bg-[#eef5fe] dark:bg-slate-800 text-[#2D2A72] dark:text-indigo-300 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-[#d2dfa8]/0 focus:border-[#554ce4] outline-none cursor-pointer pr-8 min-w-[120px] appearance-none"
              >
                <option value="">Tất cả các lớp</option>
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#554ce4] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* View mode toggle button */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? "bg-white dark:bg-slate-900 text-[#554ce4] shadow-xs font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Chế độ thẻ"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" 
                  ? "bg-white dark:bg-slate-900 text-[#554ce4] shadow-xs font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Chế độ bảng chi tiết"
            >
              <List size={17} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpenImportModal(true)}
              className="flex items-center gap-1.5 bg-[#EEF2FC] dark:bg-indigo-950/40 hover:bg-indigo-100 text-[#2D2A72] dark:text-indigo-300 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <Import size={15} />
              Nhập Excel
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl transition-all text-xs font-bold"
              title="Tải mẫu Excel chuẩn"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout matched directly from screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Panel: Quick Add Widgets (4 Cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Thêm 1 học sinh (Styled exactly like image) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Mint Green Header Header */}
            <div className="bg-[#e6f7f2] dark:bg-emerald-950/40 px-5 py-4 flex items-center gap-2.5 border-b border-[#d1f0e6] dark:border-emerald-900/50">
              <div className="w-8 h-8 rounded-full bg-[#5dbca9] text-white flex items-center justify-center font-black">
                <UserPlus size={18} />
              </div>
              <h2 className="font-extrabold text-[#2a8b77] dark:text-emerald-300 text-base">
                Thêm 1 học sinh
              </h2>
            </div>

            {/* Input & Action */}
            <form onSubmit={handleQuickAdd} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-[#2a8b77] dark:text-emerald-300 mb-1">
                  Chọn lớp cho HS:
                </label>
                <select
                  value={quickClassId || activeClassId}
                  onChange={(e) => setQuickClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-[#5dbca9]/40 rounded-2xl outline-none text-slate-800 dark:text-white font-bold text-xs"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Nhập họ và tên..."
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-[#5dbca9]/40 focus:border-[#5dbca9] rounded-2xl outline-none text-slate-800 dark:text-white font-semibold text-sm transition-all"
              />

              <button
                type="submit"
                disabled={!quickName.trim()}
                className="w-full py-3 bg-[#5dbca9] hover:bg-[#4ea896] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={18} className="stroke-[3]" />
                Thêm ngay
              </button>
            </form>
          </div>

          {/* Card 2: Thêm nhiều học sinh + (Styled exactly like image) */}
          <button
            onClick={() => {
              setAddTab("batch");
              setBatchNamesText("");
              setClassId(activeClassId);
              setIsOpenAddModal(true);
            }}
            className="w-full bg-[#eaf2fe] dark:bg-indigo-950/40 hover:bg-[#dbe9fe] dark:hover:bg-indigo-950/70 border border-[#cbe0fe] dark:border-indigo-800 p-4 rounded-3xl flex items-center justify-between transition-all group shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#3a82f6] text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileSpreadsheet size={19} />
              </div>
              <span className="font-extrabold text-[#2563eb] dark:text-indigo-300 text-sm">
                Thêm nhiều học sinh
              </span>
            </div>
            <span className="text-[#2563eb] dark:text-indigo-300 font-black text-xl group-hover:scale-125 transition-transform">
              +
            </span>
          </button>

          {/* Quick Search & Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã HS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#554ce4] outline-none text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang học</option>
                <option value="transferred">Chuyển trường</option>
                <option value="transferred_class">Chuyển lớp</option>
              </select>

              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="all">Giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Class Roster & Avatars (8 Cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Sĩ số Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-xl md:text-2xl font-black text-[#2D2A72] dark:text-white flex flex-wrap items-center gap-2">
              <span>{selectedClassId ? `Sĩ số lớp ${activeClass?.name || ''}:` : "Tổng học sinh toàn trường:"}</span>
              <span className="text-[#554ce4] dark:text-indigo-400 font-black text-2xl md:text-3xl">
                {selectedClassId ? activeCount : students.filter(s => (s.status || "active") === "active").length}
              </span>
              <span>học sinh</span>
              {!selectedClassId && (
                <span className="text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-[#554ce4] dark:text-indigo-300 px-2.5 py-1 rounded-xl">
                  ({classrooms.length} lớp học)
                </span>
              )}
            </div>

            {/* Filter Missing Photos Yellow Chip Badge matched directly from image */}
            <button
              onClick={() => setFilterMissingPhoto(!filterMissingPhoto)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
                filterMissingPhoto
                  ? "bg-amber-500 text-white border-amber-600 shadow-md"
                  : "bg-[#fef9c3] hover:bg-[#fef08a] text-[#a16207] border-[#fef08a]"
              }`}
            >
              <AlertTriangle size={15} className="fill-[#f59e0b] text-white stroke-[2]" />
              <span>{filterMissingPhoto ? "Đang lọc HS thiếu ảnh" : `Lọc ${missingPhotoCount} HS thiếu ảnh`}</span>
            </button>
          </div>

          {/* Yellow/Amber Notification Banner matched directly from image */}
          <div className="bg-[#fffbeb] dark:bg-amber-950/20 border border-[#fef08a] dark:border-amber-900/50 p-4 md:p-5 rounded-3xl text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-extrabold text-sm md:text-base text-[#b45309] dark:text-amber-300">
              <div className="w-5 h-5 rounded-full bg-[#f59e0b] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                i
              </div>
              <span>Nhắc nhở cập nhật ảnh đại diện</span>
            </div>
            <p className="text-xs md:text-sm text-[#854d0e] dark:text-amber-300/90 leading-relaxed font-medium pl-7">
              Lớp hiện có <strong className="font-extrabold text-[#b45309]">{missingPhotoCount}</strong> học sinh chưa có ảnh. Hãy bấm vào biểu tượng hình tròn bên cạnh tên các em để tải ảnh lên, giúp việc chấm điểm dễ dàng và sinh động hơn nhé!
            </p>
          </div>

          {/* Main Grid View of Students matched directly from image */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-3.5">
              {filteredStudents.map((student) => {
                const isTransferred = student.status === "transferred";
                const hasCustomAvatar = student.avatar && student.avatar.length > 4;
                const avatarPreset = CUTE_AVATARS[Math.abs(student.name.charCodeAt(0) || 0) % CUTE_AVATARS.length];

                return (
                  <div
                    key={student.id}
                    className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 relative group ${
                      isTransferred ? "opacity-60 bg-slate-50 dark:bg-slate-800/40" : ""
                    }`}
                  >
                    {/* Left: Avatar & Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar Circle with red dot or avatar upload button */}
                      <button
                        onClick={() => setAvatarModalStudent(student)}
                        className="relative shrink-0 group/avatar focus:outline-none"
                        title="Bấm để tải ảnh hoặc chọn avatar"
                      >
                        {hasCustomAvatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full ${avatarPreset.bg} flex items-center justify-center font-black text-2xl shadow-inner relative`}>
                            {student.avatar && student.avatar.length <= 4 ? student.avatar : avatarPreset.emoji}
                          </div>
                        )}

                        {/* Small Red Dot Badge on top right indicating missing custom avatar */}
                        {!hasCustomAvatar && (
                          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#ef4444] ring-2 ring-white rounded-full" />
                        )}

                        {/* Camera Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white">
                          <Camera size={16} />
                        </div>
                      </button>

                      {/* Student Name */}
                      <div className="min-w-0 flex-1">
                        <div className={`font-black text-slate-800 dark:text-slate-100 text-sm leading-snug break-words ${
                          isTransferred ? "line-through text-slate-400" : ""
                        }`}>
                          {student.name}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{student.studentCode}</span>
                          <span>•</span>
                          <span className={student.gender === "Nữ" ? "text-pink-500" : "text-blue-500"}>
                            {student.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 text-slate-400 hover:text-[#554ce4] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="Sửa thông tin"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => setTransferConfirmId(student.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                        title="Chuyển lớp sang lớp khác trong trường"
                      >
                        <ArrowRightLeft size={15} />
                      </button>

                      {isTransferred ? (
                        <button
                          onClick={() => handleToggleTransfer(student)}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                          title="Khôi phục trạng thái Đang học"
                        >
                          Trở lại
                        </button>
                      ) : (
                        <button
                          onClick={() => setTransferConfirmId(student.id)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl transition-colors"
                          title="Báo học sinh chuyển trường"
                        >
                          <LogOut size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteConfirmId(student.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                        title="Xoá học sinh"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
                  <User size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy học sinh nào</p>
                  <p className="text-xs text-slate-400 mt-1">Thử đổi tìm kiếm hoặc chuyển chế độ xem</p>
                </div>
              )}
            </div>
          ) : (
            /* Table View Mode */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3.5 px-4">STT / Họ và tên</th>
                      <th className="py-3.5 px-4">Mã HS</th>
                      <th className="py-3.5 px-4">Lớp</th>
                      <th className="py-3.5 px-4">Giới tính</th>
                      <th className="py-3.5 px-4 text-center">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                    {filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-slate-400">{idx + 1}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{s.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">{s.studentCode}</td>
                        <td className="py-3 px-4 text-xs font-extrabold text-[#554ce4]">
                          {s.className || classrooms.find(c => c.id === s.classId)?.name || "Lớp"}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold">{s.gender}</td>
                        <td className="py-3 px-4 text-center">
                          {s.status === "transferred" ? (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Chuyển trường</span>
                          ) : s.transferredFromClass ? (
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full" title={`Chuyển từ lớp ${s.transferredFromClass}`}>
                              Chuyển lớp ({s.transferredFromClass})
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Đang học</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => setTransferConfirmId(s.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Chuyển lớp sang lớp khác trong trường"
                            >
                              <ArrowRightLeft size={15} />
                            </button>
                            {s.status === "transferred" ? (
                              <button
                                onClick={() => handleToggleTransfer(s)}
                                className="px-2 py-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                                title="Khôi phục trạng thái Đang học"
                              >
                                Trở lại
                              </button>
                            ) : (
                              <button
                                onClick={() => setTransferConfirmId(s.id)}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Báo học sinh chuyển trường"
                              >
                                <LogOut size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirmId(s.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Xoá học sinh"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 font-bold">
                          Không tìm thấy học sinh nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-center"
          >
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#2D2A72] dark:text-white">Xoá học sinh</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                Bạn có chắc chắn muốn xoá học sinh{" "}
                <span className="text-rose-600 font-extrabold">
                  {students.find(s => s.id === deleteConfirmId)?.name}
                </span>{" "}
                khỏi hệ thống? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteStudent(deleteConfirmId)}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-md transition-all"
              >
                Xoá vĩnh viễn
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Move / Transfer Class Modal */}
      {transferConfirmId && (() => {
        const studentToTransfer = students.find(s => s.id === transferConfirmId);
        if (!studentToTransfer) return null;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-[#554ce4] flex items-center justify-center font-bold">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2D2A72] dark:text-white">Chuyển lớp / Chuyển trường</h3>
                    <p className="text-xs font-extrabold text-[#554ce4] dark:text-indigo-300">{studentToTransfer.name}</p>
                  </div>
                </div>
                <button onClick={() => setTransferConfirmId(null)} className="p-1.5 text-slate-400 rounded-xl hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">Lớp hiện tại:</div>
                <div className="font-extrabold text-sm text-[#2D2A72] dark:text-white">
                  {studentToTransfer.className || classrooms.find(c => c.id === studentToTransfer.classId)?.name || "Chưa xếp lớp"}
                </div>
              </div>

              {/* Option A: Transfer to another class */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  1. Chuyển sang lớp khác trong trường:
                </label>
                <div className="flex gap-2">
                  <select
                    defaultValue={studentToTransfer.classId}
                    id="transferTargetSelect"
                    className="flex-1 bg-white dark:bg-slate-800 border-2 border-indigo-200 dark:border-slate-700 text-[#2D2A72] dark:text-white font-extrabold text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#554ce4] cursor-pointer"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id} disabled={c.id === studentToTransfer.classId}>
                        Lớp {c.name} {c.id === studentToTransfer.classId ? "(Hiện tại)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const selectEl = document.getElementById("transferTargetSelect") as HTMLSelectElement;
                      if (selectEl && selectEl.value) {
                        handleTransferClass(studentToTransfer, selectEl.value);
                      }
                    }}
                    className="px-4 py-2.5 bg-[#554ce4] hover:bg-[#453cd3] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Chuyển lớp
                  </button>
                </div>
              </div>

              {/* Option B: Transfer out of school */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-purple-900 dark:text-purple-200">
                      2. Báo học sinh chuyển trường
                    </div>
                    <div className="text-[11px] font-medium text-purple-700/80 dark:text-purple-300">
                      Tự động giảm 1 sĩ số học sinh trong lớp
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleTransfer(studentToTransfer)}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all shrink-0"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setTransferConfirmId(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition-all text-xs"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Avatar Upload / Selection Modal */}
      {avatarModalStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#2D2A72] dark:text-white">Ảnh đại diện học sinh</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{avatarModalStudent.name}</p>
              </div>
              <button onClick={() => setAvatarModalStudent(null)} className="p-1.5 text-slate-400 rounded-xl hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* Upload image button */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-slate-700 text-center space-y-3">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Tải ảnh chụp thật từ máy tính:</p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 bg-[#554ce4] hover:bg-[#453cd3] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
              >
                Chọn tệp ảnh...
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Cute preset emoji avatars */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Hoặc chọn linh vật dễ thương:</p>
              <div className="grid grid-cols-4 gap-2">
                {CUTE_AVATARS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSetPresetAvatar(item.emoji)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-2xl text-2xl transition-all flex flex-col items-center gap-1"
                  >
                    <span>{item.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Modal (Single or Batch) */}
      {isOpenAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#2D2A72] dark:text-white">Thêm học sinh mới</h2>
              <button onClick={() => setIsOpenAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setAddTab("single")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                  addTab === "single" ? "bg-white text-[#2D2A72] shadow-sm" : "text-slate-500"
                }`}
              >
                Thêm 1 học sinh
              </button>
              <button
                type="button"
                onClick={() => setAddTab("batch")}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
                  addTab === "batch" ? "bg-[#554ce4] text-white shadow-sm" : "text-slate-500"
                }`}
              >
                Thêm nhiều học sinh
              </button>
            </div>

            {addTab === "single" ? (
              <form onSubmit={handleAddSingle} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Lớp học tiếp nhận</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                    required
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Họ và tên học sinh</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Anh Phước..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl outline-none font-semibold text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mã HS</label>
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl outline-none font-mono font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsOpenAddModal(false)} className="flex-1 py-3 text-slate-500 font-bold">
                    Hủy bỏ
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-[#554ce4] text-white font-extrabold rounded-2xl shadow-md">
                    Thêm ngay
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddBatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Dán danh sách tên học sinh</label>
                  <textarea
                    placeholder={`Nguyễn Anh Phước - Nam\nNguyễn Linh Nhi - Nữ\nĐoàn Hồng Khánh`}
                    value={batchNamesText}
                    onChange={(e) => setBatchNamesText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-2xl outline-none text-sm font-mono"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsOpenAddModal(false)} className="flex-1 py-3 text-slate-500 font-bold">
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-[#554ce4] text-white font-extrabold rounded-2xl shadow-md">
                    Thêm danh sách
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {isOpenEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-[#2D2A72] dark:text-white">Cập nhật thông tin học sinh</h2>
              <button onClick={() => setIsOpenEditModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-extrabold text-sm text-[#2D2A72] dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mã HS</label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono font-bold text-sm text-[#2D2A72] dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lớp học (Chuyển lớp)</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-extrabold text-sm text-[#2D2A72] dark:text-white cursor-pointer"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-extrabold text-sm text-[#2D2A72] dark:text-white cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-sm text-[#2D2A72] dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenEditModal(false)}
                  className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-2xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#554ce4] hover:bg-[#453cd3] text-white font-extrabold rounded-2xl shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Excel Import Modal */}
      {isOpenImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl w-full max-w-xl space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-[#554ce4]" size={22} />
                <h2 className="text-xl font-black text-[#2D2A72] dark:text-white">Nhập danh sách từ Excel</h2>
              </div>
              <button onClick={() => { setIsOpenImportModal(false); setImportedData([]); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={18} />
              </button>
            </div>
            
            {/* Target Class Selection */}
            <div>
              <label className="block text-xs font-extrabold text-[#2a8b77] dark:text-emerald-300 mb-1.5">
                Chọn lớp học để nhập danh sách học sinh:
              </label>
              <select
                value={importTargetClassId || activeClassId}
                onChange={(e) => {
                  setImportTargetClassId(e.target.value);
                  setImportedData([]); // reset parsed preview if target class changed
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[#5dbca9]/40 rounded-2xl font-extrabold text-sm text-[#2D2A72] dark:text-white outline-none cursor-pointer"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>Lớp {c.name} (Sĩ số hiện tại: {students.filter(s => s.classId === c.id && (s.status || "active") === "active").length} học sinh)</option>
                ))}
              </select>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all p-7 rounded-3xl text-center cursor-pointer space-y-2"
            >
              <FileSpreadsheet size={36} className="mx-auto text-[#554ce4]" />
              <p className="font-extrabold text-sm text-[#2D2A72] dark:text-white">Kéo thả file Excel (.xlsx, .xls) vào đây hoặc bấm chọn tệp</p>
              <p className="text-xs text-slate-400 font-semibold">Tự động thêm dữ liệu vào lớp, giữ nguyên học sinh các lớp khác.</p>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".xlsx, .xls, .csv" className="hidden" />
            </div>

            {/* Preview Table of Imported Students */}
            {importedData.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    ✓ Đã đọc được {importedData.length} học sinh từ file Excel
                  </p>
                  <span className="text-[11px] font-bold text-slate-400">
                    Lớp nhận: Lớp {classrooms.find(c => c.id === (importTargetClassId || activeClassId))?.name}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold sticky top-0">
                      <tr>
                        <th className="p-2 text-center w-10">STT</th>
                        <th className="p-2">Mã HS</th>
                        <th className="p-2">Họ và Tên</th>
                        <th className="p-2 text-center">Giới tính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {importedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-mono text-slate-500 font-bold">{item.studentCode}</td>
                          <td className="p-2 font-black text-slate-800 dark:text-white">{item.name}</td>
                          <td className="p-2 text-center text-slate-600 dark:text-slate-300 font-bold">{item.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setImportedData([]); }}
                    className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="flex-1 py-3 bg-[#554ce4] hover:bg-[#453cd3] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    Lưu {importedData.length} học sinh vào hệ thống
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
