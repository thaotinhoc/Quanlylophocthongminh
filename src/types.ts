export type Gender = "Nam" | "Nữ";

export interface Classroom {
  id: string;
  name: string;
  studentCount: number;
  teacherName: string;
  schoolYear: string;
  totalLessons: number;
  averageScore: number;
  createdAt: string;
}

export interface Student {
  id: string;
  avatar?: string;
  avatarColor?: string;
  name: string;
  studentCode: string;
  classId: string;
  className: string;
  gender: Gender;
  birthday: string;
  notes: string;
  currentScore: number;
  subjectScores?: Record<string, number>; // Điểm tách biệt theo môn học
  speechCount: number;
  attendanceCount: number;
  goodScoresCount: number;
  rank: string; // Dynamic ranking grade: A, B, C, D, etc., or class position
  isAbsent?: boolean;
  status?: "active" | "transferred"; // "active" (Đang học) or "transferred" (Chuyển trường)
  transferredFromClass?: string; // Tên lớp cũ nếu học sinh vừa được chuyển lớp
  termScores?: {
    midTerm1?: number;
    endTerm1?: number;
    midTerm2?: number;
    endTerm2?: number;
  };
}

export type ActionType =
  | "attendance" // Điểm danh
  | "speech"     // Phát biểu
  | "correct_answer" // Trả lời đúng
  | "homework"   // Làm bài đầy đủ
  | "reward"     // Thưởng thêm
  | "deduction"  // Trừ điểm
  | "absent"     // Nghỉ học
  | "no_homework"; // Không làm bài

export interface GradeHistory {
  id: string;
  timestamp: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  points: number;
  type: ActionType;
  reason: string;
  subject?: string; // Tên môn học
}

export interface StudyLink {
  id: string;
  classId?: string;
  imageUrl?: string;
  title: string;
  url: string;
  description: string;
  subject: string; // Tin học / Công nghệ / Khác
  gradeGroup: string; // Khối 6, Khối 7, ...
  topic: string; // Chủ đề bài học
  tags: string[]; // Mảng từ khóa
  color: string; // Hex or tailwind color code for cards
  isFavorite: boolean;
  clicks: number;
  createdAt: string;
}

export interface LearningGame {
  id: string;
  type: "Quizizz" | "Kahoot" | "Blooket" | "Wordwall" | "Scratch" | "Khác";
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  targetClasses: string[]; // List of classIds applied
  createdAt: string;
}

export interface ExamQuestion {
  question: string;
  options: string[];
  answer: string; // index or text
  explanation: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: "Tin học" | "Công nghệ" | "Khác";
  grade: string;
  duration: number; // minutes
  difficulty: "Dễ" | "Trung bình" | "Khó";
  questions: ExamQuestion[];
  createdAt: string;
  isAIGenerated: boolean;
}

export interface TeacherProfile {
  name: string;
  subject: string;
  school: string;
  avatarUrl?: string;
  email?: string;
}

// Stats interface for charts and visualizations
export interface ClassStats {
  classId: string;
  className: string;
  averageScore: number;
  studentCount: number;
  totalPointsGiven: number;
  totalDeductionsGiven: number;
}

export interface DatePointStats {
  date: string; // YYYY-MM-DD
  positive: number;
  negative: number;
}
