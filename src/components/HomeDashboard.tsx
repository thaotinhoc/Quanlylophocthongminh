import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, GraduationCap, Globe, Clock, Sparkles, Star, Award, 
  ChevronRight, BrainCircuit, Play, ArrowRight, CheckCircle2, Heart, Shield, Loader2
} from "lucide-react";
import { motion } from "motion/react";

export default function HomeDashboard() {
  const { students, classrooms, studyLinks, gradeHistory, setActiveTab, setSelectedClassId } = useApp();
  const [examTopic, setExamTopic] = useState("Lập trình trắc nghiệm Python");
  const [examDifficulty, setExamDifficulty] = useState("Trung bình");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState<any | null>(null);

  // Stats summaries
  const totalClasses = classrooms.length;
  const totalStudents = students.length;
  const totalLinks = studyLinks.length;
  const recentGrades = gradeHistory.slice(0, 4);

  // Quick action redirect helpers
  const handleQuickClass = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab("students");
  };

  const handleCreateDraftExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTopic.trim()) return;
    setIsGenerating(true);
    setAiDraft(null);

    try {
      const response = await fetch("/api/gemini/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: examTopic,
          difficulty: examDifficulty,
          questionCount: 3
        })
      });

      if (!response.ok) throw new Error("AI exam generation failed");
      const data = await response.json();
      if (data.exam) {
        setAiDraft(data.exam);
      }
    } catch (err) {
      console.error(err);
      setAiDraft({
        title: `Đề kiểm tra nháp: ${examTopic}`,
        questions: [
          { questionText: "Câu hỏi nháp mẫu 1 do lỗi kết nối API. Xin vui lòng thử lại sau.", options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], correctAnswer: 0 }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <div className="bg-indigo-600 text-white rounded-2xl p-6 lg:p-8 shadow-lg shadow-indigo-100 dark:shadow-none relative overflow-hidden">
        {/* Abstract Glow circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              src="/author.jpg" 
              alt="Cô giáo Bùi Thanh Thảo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 bg-white/20 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                <Sparkles size={11} />
                AI-Powered Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Chào ngày mới, cô Bùi Thanh Thảo!
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                Chào mừng cô đến với trợ lý giảng dạy Tin học & Công nghệ thông minh. Hôm nay cô muốn chấm điểm nhanh trên lớp hay thiết kế bài kiểm tra bằng AI?
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("grader")}
              className="px-5 py-3 bg-white text-indigo-700 font-extrabold rounded-xl hover:bg-indigo-50 transition-all text-xs flex items-center gap-1.5 shadow-sm transform active:scale-95"
            >
              <Award size={15} />
              Chấm điểm nhanh lớp học
            </button>
            <button
              onClick={() => setActiveTab("game")}
              className="px-5 py-3 bg-indigo-800 hover:bg-indigo-900 text-white font-extrabold rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-sm transform active:scale-95"
            >
              <Play size={15} />
              Bắt đầu Trò chơi kiểm tra
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid general stats summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card total classes */}
        <div 
          onClick={() => setActiveTab("classroom")}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <GraduationCap size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Xem hết
              <ChevronRight size={13} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{totalClasses} lớp</div>
            <div className="text-xs text-slate-400 mt-1">Đang trực tiếp quản lý giảng dạy</div>
          </div>
        </div>

        {/* Card total students */}
        <div 
          onClick={() => setActiveTab("students")}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Xem hết
              <ChevronRight size={13} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{totalStudents} học sinh</div>
            <div className="text-xs text-slate-400 mt-1">Hồ sơ điểm số được đồng bộ</div>
          </div>
        </div>

        {/* Card total links */}
        <div 
          onClick={() => setActiveTab("links")}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
              <Globe size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Xem hết
              <ChevronRight size={13} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{totalLinks} tài liệu</div>
            <div className="text-xs text-slate-400 mt-1">Kho liên kết bài giảng, QR Code</div>
          </div>
        </div>

        {/* Card total grades log */}
        <div 
          onClick={() => setActiveTab("history")}
          className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
              Xem hết
              <ChevronRight size={13} />
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4">{gradeHistory.length} rèn luyện</div>
            <div className="text-xs text-slate-400 mt-1">Sự kiện chấm điểm đã ghi nhận</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI Instant Question draft generator */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-lg">
              <BrainCircuit size={16} />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              Ý tưởng Đề thi & Trắc nghiệm AI nhanh
            </h3>
          </div>

          <form onSubmit={handleCreateDraftExam} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chủ đề bài học cần ra đề</label>
                <input
                  type="text"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  placeholder="Ví dụ: Scratch nâng cao, Canva..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mức độ khó</label>
                <select
                  value={examDifficulty}
                  onChange={(e) => setExamDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-xs font-semibold"
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !examTopic.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  AI Studio đang soạn thảo...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Bản nháp 3 câu hỏi bằng AI
                </>
              )}
            </button>
          </form>

          {/* Render draft result */}
          {aiDraft && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-4"
            >
              <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <CheckCircle2 size={14} />
                Bản nháp đề: {aiDraft.title || examTopic}
              </div>
              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                {aiDraft.questions?.slice(0, 3).map((q: any, qIdx: number) => (
                  <div key={qIdx} className="pt-2 first:pt-0 space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p className="font-bold">Câu {qIdx + 1}: {q.questionText}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div key={oIdx} className={q.correctAnswer === oIdx ? "text-emerald-600 font-bold" : ""}>
                          {["A", "B", "C", "D"][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Class quick navigation & Recent Activities logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Classroom quick links */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3.5">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Danh sách lớp dạy</h3>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {classrooms.map(c => (
                <div 
                  key={c.id}
                  onClick={() => handleQuickClass(c.id)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {c.name.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.studentCount} em • ĐTB: {c.averageScore || "Chưa có"}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent grade activities */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Hoạt động rèn luyện vừa qua</h3>
            <div className="space-y-3">
              {recentGrades.map((g) => (
                <div key={g.id} className="flex items-start gap-3 text-xs border-b border-slate-100 dark:border-slate-800/40 pb-2.5 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${g.points > 0 ? "bg-emerald-500" : g.points < 0 ? "bg-rose-500" : "bg-slate-400"}`} />
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {g.studentName} <span className="font-normal text-slate-400">được nhận</span> {g.points > 0 ? `+${g.points}` : g.points}đ
                    </p>
                    <p className="text-[10px] text-slate-400">{g.reason}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(g.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}

              {recentGrades.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Chưa ghi nhận sự kiện rèn luyện nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
