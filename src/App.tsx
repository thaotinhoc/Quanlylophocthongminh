import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import authorImg from "./assets/author.jpg";
import Sidebar from "./components/Sidebar";
import HomeDashboard from "./components/HomeDashboard";
import ClassroomManager from "./components/ClassroomManager";
import StudentManager from "./components/StudentManager";
import FastGrader from "./components/FastGrader";
import GradeHistoryView from "./components/GradeHistory";
import LinkWarehouse from "./components/LinkWarehouse";
import ClassStats from "./components/ClassStats";
import Leaderboard from "./components/Leaderboard";
import AIGame from "./components/AIGame";
import EditProfileModal from "./components/EditProfileModal";

import { 
  Sun, Moon, Menu, X, Sparkles, GraduationCap, Users, Award, 
  Clock, Globe, Trophy, Play, Home, Star, Link as LinkIcon, Activity, FileSpreadsheet, 
  LogIn, LogOut, KeyRound, Lock, Eye, EyeOff, ShieldCheck, User, CheckCircle2, School, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { activeTab, setActiveTab, isLoggedIn, loginWithPin, logout, teacherProfile } = useApp();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize Dark / Light modes on document class list
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    if (!pinInput.trim()) {
      setPinError("Vui lòng nhập mã PIN bảo mật!");
      return;
    }

    const success = loginWithPin(pinInput.trim());
    if (success) {
      setIsLoginModalOpen(false);
      setPinInput("");
      setToastMessage("Đăng nhập thành công! Quyền: Quản trị viên (Toàn quyền)");
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setPinError("Mã PIN không đúng! Vui lòng nhập lại (Thanhthao220883@).");
    }
  };

  const handleLogoutClick = () => {
    logout();
    setToastMessage("Đã chuyển sang chế độ Khách (Chỉ xem).");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "classroom":
        return <ClassroomManager />;
      case "students":
        return <StudentManager />;
      case "grader":
        return <FastGrader />;
      case "history":
        return <GradeHistoryView />;
      case "links":
        return <LinkWarehouse />;
      case "stats":
        return <ClassStats />;
      case "game":
        return <Leaderboard />;
      default:
        return <ClassroomManager />;
    }
  };

  const menuItems = [
    { id: "classroom", label: "Lớp học", icon: Users },
    { id: "students", label: "Học sinh", icon: GraduationCap },
    { id: "grader", label: "Chấm điểm", icon: Star },
    { id: "game", label: "Xếp hạng", icon: Trophy },
    { id: "links", label: "Liên kết", icon: LinkIcon },
    { id: "stats", label: "Thống kê", icon: Activity },
    { id: "history", label: "Xuất dữ liệu", icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex transition-colors duration-300 relative">
      
      {/* Toast notification popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-[#1e1b4b] text-white px-4 py-3 rounded-2xl shadow-xl border border-indigo-500/30 flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar: Desktop fixed side panel */}
      <aside className="hidden md:block w-64 bg-[#211d58] border-r border-[#2d2870] shrink-0 sticky top-0 h-screen">
        <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - Clean, compact & balanced top bar */}
        <header className="hidden md:flex h-13 bg-white dark:bg-[#0f1524] border-b border-slate-200/80 dark:border-slate-800 px-5 items-center justify-between sticky top-0 z-40">
          
          {/* Left: School Name & System Title */}
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                TRƯỜNG TIỂU HỌC KHẮC NIỆM
              </span>
              <span className="font-black text-xs text-[#2D2A72] dark:text-indigo-200 tracking-tight uppercase">
                QUẢN LÝ LỚP HỌC THÂN YÊU
              </span>
            </div>
          </div>

          {/* Right: Theme, Role Badge & Login/Logout Button */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              title="Đổi giao diện Sáng / Tối"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Role & Status Pill Bar */}
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/80 text-[11px] font-bold">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span>
                Vai trò: <strong className="font-extrabold">{isLoggedIn ? "Quản trị viên" : "Khách (Chỉ xem)"}</strong>
              </span>

              {/* Login / Logout Button inside pill */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogoutClick}
                  className="ml-1 flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full transition-all border border-rose-200/80 dark:border-rose-900/60"
                  title="Đăng xuất khỏi quyền Quản trị"
                >
                  <LogOut size={11} />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPinError("");
                    setPinInput("");
                    setIsLoginModalOpen(true);
                  }}
                  className="ml-1 flex items-center gap-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 rounded-full transition-all shadow-xs"
                  title="Nhập mã PIN để đăng nhập Quản trị viên"
                >
                  <KeyRound size={11} />
                  <span>Đăng nhập PIN</span>
                </button>
              )}
            </div>

          </div>
        </header>

        {/* Responsive Mobile Header */}
        <header className="md:hidden bg-[#211d58] border-b border-[#2d2870] px-3.5 py-2 flex items-center justify-between sticky top-0 z-40 text-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#f59e0b] rounded-lg flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <Star size={15} className="fill-white text-white" />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-extrabold text-[10px] tracking-wider text-amber-300 uppercase">
                TRƯỜNG TH KHẮC NIỆM
              </span>
              <span className="font-extrabold text-xs tracking-tight text-white">
                Quản lý lớp học thân yêu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile menu list drawer panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#211d58] border-b border-[#2d2870] z-30 overflow-hidden"
            >
              <div className="p-3 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[14px] font-bold transition-all ${
                        isActive 
                          ? "bg-[#3e378c] text-white shadow-sm" 
                          : "text-[#a3a1f7]/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.id === "students" ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? "bg-[#10b981] text-white" : "bg-[#2a246d] text-[#10b981]"
                          }`}>
                            <Icon size={18} />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                            isActive ? "text-white" : "text-[#a3a1f7]"
                          }`}>
                            <Icon size={18} />
                          </div>
                        )}
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic tabs window content */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nhỏ gọn, tinh tế, cân đối với trang web */}
          <footer className="mt-10 border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 sm:px-6 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Thông tin Tác giả & Ảnh đại diện nhỏ gọn */}
              <div 
                onClick={() => setIsEditProfileOpen(true)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800/60 p-1.5 rounded-2xl transition-all"
                title="Bấm để đổi ảnh đại diện tác giả"
              >
                <div className="relative shrink-0">
                  <img 
                    src={teacherProfile?.avatarUrl || authorImg} 
                    alt="Tác giả Cô giáo Bùi Thanh Thảo"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 shadow-sm group-hover:ring-indigo-500/60 transition-all"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = authorImg;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full ring-1 ring-white">
                    <Camera size={9} />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>Tác giả: Cô giáo {teacherProfile?.name || "Bùi Thanh Thảo"}</span>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded-full border border-indigo-200 dark:border-indigo-800">Đổi ảnh</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Phần mềm Quản lý lớp học thân yêu
                  </div>
                </div>
              </div>

              {/* Bản quyền rút gọn */}
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center sm:text-right">
                © {new Date().getFullYear()} Bản quyền thuộc về tác giả Bùi Thanh Thảo
              </div>

            </div>
          </footer>
        </main>
      </div>

      {/* Login Modal with PIN Code Verification */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#151c2e] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative"
            >
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Author Header */}
              <div className="text-center space-y-3 mb-6">
                <div 
                  className="relative inline-block cursor-pointer group"
                  onClick={() => setIsEditProfileOpen(true)}
                  title="Bấm để đổi ảnh đại diện"
                >
                  <img 
                    src={teacherProfile?.avatarUrl || authorImg} 
                    alt="Tác giả Cô giáo Bùi Thanh Thảo" 
                    className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-indigo-500/40 shadow-lg group-hover:brightness-90 transition-all"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = authorImg;
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full border-2 border-white dark:border-[#151c2e]">
                    <ShieldCheck size={14} />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    BẢN QUYỀN TÁC GIẢ
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Cô giáo {teacherProfile?.name || "Bùi Thanh Thảo"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {teacherProfile?.school || "Trường Tiểu Học Khắc Niệm - TP. Bắc Ninh"}
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nhập mã PIN xác thực Quản trị viên:
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Nhập mã PIN bảo mật..."
                      autoFocus
                      className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <KeyRound size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
                    <span>Yêu cầu mã PIN bảo mật do tác giả thiết lập.</span>
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300">
                    {pinError}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} />
                    <span>Đăng nhập</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
