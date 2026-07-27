import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ActionType, GradeHistory } from "../types";
import { 
  Sparkles, Play, RotateCw, Trophy, AlertCircle, HelpCircle, 
  Check, X, UserCheck, RefreshCw, Volume2, Loader2, Award, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  points: number;
}

export default function AIGame() {
  const { students, classrooms, selectedClassId, setSelectedClassId, addGradeHistory } = useApp();
  
  // Quiz Generator Settings
  const [topic, setTopic] = useState("Lập trình Scratch và Khối lệnh");
  const [difficulty, setDifficulty] = useState("Trung bình");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Game Play States
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      questionText: "Khối lệnh nào trong Scratch dùng để lặp lại một hành động vô hạn lần?",
      options: ["Lặp lại 10 lần", "Lặp lại cho đến khi", "Liên tục (forever)", "Nếu không thì"],
      correctAnswer: 2,
      points: 5
    },
    {
      id: 2,
      questionText: "Trong Scratch, giá trị mặc định của tọa độ tâm sân khấu là bao nhiêu?",
      options: ["x: 0, y: 0", "x: 100, y: 100", "x: -240, y: 240", "x: 180, y: -180"],
      correctAnswer: 0,
      points: 5
    }
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"lobby" | "playing" | "summary">("lobby");

  // Lucky Wheel / Student Picker states
  const [chosenStudent, setChosenStudent] = useState<any | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const activeClassId = selectedClassId || classrooms[0]?.id || "";
  const classStudents = students.filter(s => s.classId === activeClassId);

  // Trigger server-side AI quiz generation
  const generateAIQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount
        })
      });

      if (!response.ok) throw new Error("AI exam generation failed");
      const data = await response.json();
      if (data.exam && data.exam.questions) {
        const formatted = data.exam.questions.map((q: any, index: number) => ({
          id: index + 1,
          questionText: q.questionText || q.text || "Câu hỏi trống?",
          options: q.options || ["A", "B", "C", "D"],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
          points: q.points || 5
        }));
        setQuestions(formatted);
        setCurrentQuestionIndex(0);
        setGameState("playing");
        setScore(0);
        setChosenStudent(null);
        setIsAnswerRevealed(false);
        setSelectedOptionIdx(null);
      }
    } catch (err) {
      console.error(err);
      alert("Không tạo được câu hỏi AI. Bạn hãy thử lại hoặc chơi bằng bộ câu hỏi mẫu mặc định nhé!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Pick lucky student
  const spinLuckyStudent = () => {
    if (classStudents.length === 0) {
      alert("Lớp học này hiện không có học sinh để chọn!");
      return;
    }
    setIsSpinning(true);
    setChosenStudent(null);

    // Simulate wheel spinning
    let counter = 0;
    const interval = setInterval(() => {
      const randomStd = classStudents[Math.floor(Math.random() * classStudents.length)];
      setChosenStudent(randomStd);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        // Spin finished
        confetti({
          particleCount: 30,
          spread: 30,
          origin: { y: 0.6 }
        });
      }
    }, 120);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    setSelectedOptionIdx(idx);
  };

  const handleRevealAnswer = () => {
    if (selectedOptionIdx === null) return;
    setIsAnswerRevealed(true);
    
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOptionIdx === currentQ.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + currentQ.points);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Automatically award positive points to lucky chosen student if selected
      if (chosenStudent) {
        const newLog: GradeHistory = {
          id: "hist_game_" + Date.now(),
          timestamp: new Date().toISOString(),
          teacherName: "Bùi Thanh Thảo",
          studentId: chosenStudent.id,
          studentName: chosenStudent.name,
          classId: chosenStudent.classId,
          className: chosenStudent.className,
          points: currentQ.points,
          type: "correct_answer",
          reason: `Trả lời đúng Câu hỏi Trò chơi AI: "${currentQ.questionText.substring(0, 30)}..."`
        };
        addGradeHistory(newLog);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIdx(null);
    setIsAnswerRevealed(false);
    setChosenStudent(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState("summary");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          Đấu trường trí tuệ AI
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống câu hỏi trắc nghiệm tạo tự động bằng AI, đi kèm vòng quay học sinh may mắn trả lời bài học thực tế cực kỳ sôi động.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left: AI Question Generator panel */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 text-base">
                <Sparkles size={18} className="text-indigo-500" />
                Cấu hình trò chơi AI
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Chủ đề bài học cần kiểm tra</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: Scratch nâng cao, Excel cơ bản..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mức độ khó</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    >
                      <option value="Dễ">Dễ</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Kháo/Khó">Khó</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Số lượng câu hỏi</label>
                    <input
                      type="number"
                      min={3}
                      max={15}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lớp học tham gia</label>
                  <select
                    value={activeClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white text-sm font-semibold"
                  >
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setGameState("playing")}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} />
                    Chơi câu hỏi mẫu
                  </button>
                  <button
                    onClick={generateAIQuiz}
                    disabled={isGenerating || !topic.trim()}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        AI đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Tạo câu hỏi AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Intro / Rules panel */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between min-h-[360px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 w-fit">
                  🎮 Luật chơi Đấu trường AI
                </span>
                <h2 className="text-3xl font-black tracking-tight">Khuấy động không khí lớp học tin học!</h2>
                
                <div className="space-y-2.5 text-slate-300 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">1.</span>
                    <span>Tự động tạo bộ đề thi trắc nghiệm siêu hay bám sát mọi bài học bằng AI Gemini.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">2.</span>
                    <span>Sử dụng <strong>vòng quay ngẫu nhiên</strong> để chọn ra học sinh may mắn trả lời câu hỏi trình chiếu trên tivi.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">3.</span>
                    <span>If học sinh trả lời chính xác, hệ thống tự động cộng trực tiếp {difficulty === "Dễ" ? "3" : difficulty === "Khó" ? "10" : "5"}đ rèn luyện vào hồ sơ các em!</span>
                  </p>
                </div>
              </div>

              <div className="pt-6 text-xs text-slate-400">
                Hãy chuẩn bị máy chiếu, kích hoạt chế độ toàn màn hình để học sinh cùng theo dõi nhé.
              </div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left: Interactive Quiz interface */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Progress bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-xs text-slate-400 font-bold">Điểm số hiện tại: {score}đ</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-xl leading-relaxed">
                  {questions[currentQuestionIndex].questionText}
                </h3>
              </div>

              {/* Option choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  const isCorrect = questions[currentQuestionIndex].correctAnswer === idx;
                  
                  let optionStyle = "bg-slate-50 hover:bg-slate-100 border-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-800 dark:text-slate-200";
                  if (isSelected && !isAnswerRevealed) {
                    optionStyle = "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none";
                  } else if (isAnswerRevealed) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none";
                    } else if (isSelected) {
                      optionStyle = "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerRevealed}
                      className={`p-5 rounded-xl border font-bold text-left text-sm flex items-center justify-between transition-all ${optionStyle}`}
                    >
                      <span>
                        <span className="opacity-50 mr-2">{["A.", "B.", "C.", "D."][idx]}</span>
                        {opt}
                      </span>
                      {isAnswerRevealed && isCorrect && <Check size={18} />}
                      {isAnswerRevealed && isSelected && !isCorrect && <X size={18} />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Action controller buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/60 justify-end">
                {!isAnswerRevealed ? (
                  <button
                    onClick={handleRevealAnswer}
                    disabled={selectedOptionIdx === null}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md disabled:opacity-40 text-xs flex items-center gap-1.5"
                  >
                    <UserCheck size={14} />
                    Xác nhận & Kiểm tra
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all shadow-md text-xs flex items-center gap-1.5"
                  >
                    {currentQuestionIndex + 1 < questions.length ? "Câu tiếp theo" : "Xem tổng kết"}
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Lucky Wheel random student picker */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="border-b border-slate-50 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                    <RotateCw size={16} className="text-indigo-500" />
                    Vòng quay may mắn
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Quay ngẫu nhiên học sinh trong lớp để lên tivi giải đố.</p>
                </div>

                {/* Spin Visual Box */}
                <div className="h-44 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <AnimatePresence mode="wait">
                    {chosenStudent ? (
                      <motion.div
                        key={chosenStudent.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="text-center space-y-2 px-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                          {chosenStudent.name.split(" ").pop()?.substring(0, 1)}
                        </div>
                        <h4 className="font-black text-slate-800 dark:text-white text-lg">
                          {chosenStudent.name}
                        </h4>
                        <p className="text-xs font-mono text-slate-400">Mã: {chosenStudent.studentCode}</p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-slate-400 space-y-1">
                        <HelpCircle size={32} className="mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-500">Chưa chọn học sinh</p>
                        <p className="text-[10px]">Ấn nút QUAY bên dưới để chọn ngẫu nhiên!</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Spin action buttons */}
              <button
                onClick={spinLuckyStudent}
                disabled={isSpinning || isAnswerRevealed}
                className="mt-4 w-full py-3.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 font-extrabold rounded-xl transition-all transform active:scale-95 text-xs flex items-center justify-center gap-1.5 border border-indigo-100 dark:border-indigo-900"
              >
                {isSpinning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Đang quay ngẫu nhiên...
                  </>
                ) : (
                  <>
                    <RotateCw size={14} />
                    Bắt đầu QUAY HỌC SINH
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trophy size={44} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Trò chơi hoàn thành!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                Cảm ơn tất cả các em học sinh đã nỗ lực trả lời câu hỏi và rèn luyện kiến thức Tin học hôm nay.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl grid grid-cols-2 gap-4 max-w-sm mx-auto font-mono">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng điểm cộng</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">+{score} điểm</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Câu trả lời đúng</div>
                <div className="text-2xl font-black text-emerald-500">
                  {questions.length} / {questions.length}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGameState("lobby")}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
              >
                Cấu hình trò chơi mới
              </button>
              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setGameState("playing");
                  setChosenStudent(null);
                  setSelectedOptionIdx(null);
                  setIsAnswerRevealed(false);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl hover:opacity-95 transition-all shadow-md text-xs"
              >
                Chơi lại bộ đề này
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
