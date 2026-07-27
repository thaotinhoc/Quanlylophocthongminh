import React from "react";
import { useApp } from "../context/AppContext";
import { 
  GraduationCap, Users, Star, Trophy, Link as LinkIcon, Activity, FileSpreadsheet, 
  Sun, Moon
} from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function Sidebar({ isDarkMode, setIsDarkMode }: SidebarProps) {
  const { activeTab, setActiveTab, students } = useApp();

  const menuItems = [
    { id: "classroom", label: "Lớp học", icon: Users },
    { 
      id: "students", 
      label: "Học sinh", 
      icon: GraduationCap, 
      badge: students.length 
    },
    { id: "grader", label: "Chấm điểm", icon: Star },
    { id: "game", label: "Xếp hạng", icon: Trophy },
    { id: "links", label: "Liên kết", icon: LinkIcon },
    { id: "stats", label: "Thống kê", icon: Activity },
    { id: "history", label: "Xuất dữ liệu", icon: FileSpreadsheet }
  ];

  return (
    <div className="h-full min-h-screen flex flex-col justify-between p-0 bg-[#211d58] text-white transition-all duration-300 relative overflow-y-auto w-56 select-none shrink-0">
      <div className="space-y-4 pt-4 pb-2">
        {/* Brand logo */}
        <div className="px-4 flex items-center gap-2.5">
          {/* Yellow/Orange rounded square with white filled star */}
          <div className="w-8 h-8 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <Star size={17} className="fill-white text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-[14px] tracking-tight text-white block truncate leading-tight">
              Quản lý lớp học
            </span>
            <span className="text-amber-300 font-extrabold text-[10px] tracking-wider block mt-0.5 uppercase">
              THÂN YÊU
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-b border-[#2e2970]/80 mx-2" />

        {/* Vertical Menu Items Section */}
        <nav className="space-y-1 px-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-bold transition-all relative group ${
                  isActive 
                    ? "bg-[#3e378c] text-white shadow-xs" 
                    : "text-[#a3a1f7]/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Icon rendering */}
                  {item.id === "students" ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isActive 
                        ? "bg-[#10b981] text-white shadow-xs" 
                        : "bg-[#2a246d] text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white"
                    }`}>
                      <Icon size={15} className="stroke-[2.2]" />
                    </div>
                  ) : (
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? "text-white" 
                        : "text-[#a3a1f7]/70 group-hover:text-white"
                    }`}>
                      <Icon size={17} className="stroke-[2]" />
                    </div>
                  )}

                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {/* Badge count if present */}
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                    isActive 
                      ? "bg-[#ef4444] text-white" 
                      : "bg-[#ef4444]/80 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Light / Dark theme */}
      <div className="p-3 border-t border-[#2e2970]/80 space-y-2.5 bg-[#1a1747]">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#a3a1f7] hover:bg-white/5 hover:text-white transition-all"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-300" />}
            <span>{isDarkMode ? "Giao diện Sáng" : "Giao diện Tối"}</span>
          </div>
          <div className="w-7 h-3.5 bg-white/10 rounded-full relative p-0.5 transition-all">
            <div className={`w-2.5 h-2.5 bg-[#38bdf8] rounded-full transition-transform duration-300 transform ${
              isDarkMode ? "translate-x-3" : ""
            }`} />
          </div>
        </button>

        <div className="pt-1">
          <div className="bg-[#15123d] p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <img 
              src="/author.jpg" 
              alt="Tác giả Cô giáo Bùi Thanh Thảo"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/80 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-extrabold text-amber-300 uppercase tracking-wider truncate">
                Tác giả (Bản quyền)
              </div>
              <div className="text-[11px] font-black text-white truncate">
                Bùi Thanh Thảo
              </div>
              <div className="text-[9px] text-indigo-300 truncate font-medium">
                TH Khắc Niệm
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 text-[9px] text-[#a3a1f7]/60 flex items-center justify-between font-mono pt-0.5">
          <span>v1.5.0 Premium</span>
          <span>© Bùi Thanh Thảo</span>
        </div>
      </div>
    </div>
  );
}
