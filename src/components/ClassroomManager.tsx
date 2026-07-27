import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Classroom } from "../types";
import { Plus, Search, Edit3, Trash2, Calendar, Users, GraduationCap, ArrowUpDown, ChevronRight, School } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ClassroomManager() {
  const { students, classrooms, addClassroom, updateClassroom, deleteClassroom, setSelectedClassId, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "students" | "score">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Inline adding state modeled from 1.png
  const [newClassName, setNewClassName] = useState("");

  // Modal states for editing
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for edit modal
  const [name, setName] = useState("");
  const [teacherName, setTeacherName] = useState("Bùi Thanh Thảo");
  const [schoolYear, setSchoolYear] = useState("2025-2026");
  const [totalLessons, setTotalLessons] = useState(18);

  const handleOpenEdit = (c: Classroom, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(c);
    setName(c.name);
    setTeacherName(c.teacherName);
    setSchoolYear(c.schoolYear);
    setTotalLessons(c.totalLessons);
    setIsOpenEditModal(true);
  };

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: Classroom = {
      id: "class_" + Date.now(),
      name: newClassName.trim(),
      studentCount: 0,
      teacherName: "Bùi Thanh Thảo",
      schoolYear: "2025-2026",
      totalLessons: 18,
      averageScore: 0,
      createdAt: new Date().toISOString()
    };

    addClassroom(newClass);
    setNewClassName("");
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !name.trim()) return;

    const updated: Classroom = {
      ...selectedClass,
      name,
      teacherName,
      schoolYear,
      totalLessons
    };

    updateClassroom(updated);
    setIsOpenEditModal(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteClassroom(id);
    setDeleteConfirmId(null);
  };

  // Filter & Sort
  const filteredClassrooms = classrooms.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.schoolYear.includes(searchQuery)
  );

  const sortedClassrooms = [...filteredClassrooms].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "students") {
      comparison = a.studentCount - b.studentCount;
    } else if (sortBy === "score") {
      comparison = a.averageScore - b.averageScore;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const toggleSort = (type: "name" | "students" | "score") => {
    if (sortBy === type) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  const handleSelectClass = (id: string) => {
    setSelectedClassId(id);
    setActiveTab("students"); // Move to students view
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header section */}
      <div className="flex items-center gap-3 mt-1">
        <div className="w-10 h-10 rounded-xl bg-[#EEF2FC] dark:bg-slate-800 flex items-center justify-center text-[#2D2A72] dark:text-[#8399f6] shrink-0 shadow-xs">
          <School size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2D2A72] dark:text-white tracking-tight leading-tight">
            Quản lý lớp học thân yêu
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
            Thêm và quản lý danh sách các lớp bạn đang dạy.
          </p>
        </div>
      </div>

      {/* Class creation inline card */}
      <div className="bg-[#F4F7FE] dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-[#E4ECFA] dark:border-slate-800 shadow-xs max-w-3xl">
        <form onSubmit={handleInlineAdd} className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Nhập tên lớp (VD: 5A1, 5A2...)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-[#2D2A72] dark:text-white placeholder-slate-400 rounded-xl border border-[#D2DFFA] dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#8399f6] transition-all text-xs font-semibold shadow-xs"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#8399f6] hover:bg-[#6c84ec] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 shrink-0 text-xs"
          >
            <Plus size={15} className="stroke-[3]" />
            Thêm lớp
          </button>
        </form>
      </div>

      {/* Classroom list area */}
      {classrooms.length > 0 ? (
        <div className="space-y-6">
          {/* Controls bar: Search & Sort */}
          <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm lớp học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
              />
            </div>
            
            {/* Sort Controls */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => toggleSort("name")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  sortBy === "name" 
                    ? "bg-[#EEF2FC] text-[#2D2A72] dark:bg-indigo-950/40 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Tên lớp
                <ArrowUpDown size={12} />
              </button>
              <button
                onClick={() => toggleSort("students")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  sortBy === "students" 
                    ? "bg-[#EEF2FC] text-[#2D2A72] dark:bg-indigo-950/40 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Số học sinh
                <ArrowUpDown size={12} />
              </button>
              <button
                onClick={() => toggleSort("score")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  sortBy === "score" 
                    ? "bg-[#EEF2FC] text-[#2D2A72] dark:bg-indigo-950/40 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Điểm trung bình
                <ArrowUpDown size={12} />
              </button>
            </div>
          </div>

          {/* Grid of classrooms */}
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedClassrooms.map((c) => {
                const activeCount = students.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
                return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleSelectClass(c.id)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 border border-[#EEF2FC] dark:border-slate-800 hover:border-[#8399f6] dark:hover:border-indigo-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Decorative top strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8399f6]" />
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#2D2A72] dark:text-slate-100 group-hover:text-[#8399f6] dark:group-hover:text-indigo-400 transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          Năm học: {c.schoolYear}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEdit(c, e)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit3 size={16} />
                        </button>
                        {deleteConfirmId === c.id ? (
                          <div className="flex items-center bg-rose-50 dark:bg-rose-950/20 p-1 rounded-xl">
                            <button
                              onClick={(e) => handleDelete(c.id, e)}
                              className="px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                            >
                              Xóa?
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(c.id);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                            title="Xóa lớp"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Class stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                        <div className="p-2 bg-[#EEF2FC] dark:bg-indigo-950/30 text-[#2D2A72] dark:text-indigo-400 rounded-xl">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Học sinh</div>
                          <div className="text-sm font-bold">{activeCount} em</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                        <div className="p-2 bg-[#EEF2FC] dark:bg-indigo-950/30 text-[#2D2A72] dark:text-indigo-400 rounded-xl">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Số buổi</div>
                          <div className="text-sm font-bold">{c.totalLessons} buổi</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar of card */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} className="text-[#8399f6]" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ĐTB Lớp: <strong className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.averageScore || "Chưa có"}</strong>
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#8399f6] dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Mở Dashboard
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ); })}

              {sortedClassrooms.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                  <GraduationCap size={48} className="stroke-1 mb-3 text-slate-300" />
                  <p className="text-sm">Không tìm thấy lớp học nào khớp với tìm kiếm.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state modeled exactly from 1.png */
        <div className="border-dashed border-2 border-[#D2DFFA] dark:border-slate-800 bg-white/40 dark:bg-slate-900/10 rounded-[28px] py-20 px-6 text-center flex flex-col items-center justify-center gap-4 max-w-4xl">
          <div className="text-slate-300 dark:text-slate-700">
            <School size={80} className="stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-bold text-[#2D2A72] dark:text-white">
            Chưa có lớp học nào
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md font-medium">
            Vui lòng thêm lớp học đầu tiên của bạn ở phía trên.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {isOpenEditModal && selectedClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-2xl font-bold text-[#2D2A72] dark:text-white mb-4">Sửa thông tin lớp</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tên lớp học</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-[#8399f6] outline-none text-slate-800 dark:text-white font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Giáo viên</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-[#8399f6] outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Năm học</label>
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-[#8399f6] outline-none text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Số buổi học dự kiến</label>
                <input
                  type="number"
                  value={totalLessons}
                  onChange={(e) => setTotalLessons(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-[#8399f6] outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpenEditModal(false)}
                  className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#8399f6] text-white font-semibold rounded-xl hover:bg-[#6c84ec] transition-all shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
