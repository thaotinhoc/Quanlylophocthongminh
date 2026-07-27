import { Classroom, Student, StudyLink, LearningGame, GradeHistory, ExamPaper } from "../types";

export const initialClassrooms: Classroom[] = [
  {
    id: "class_5a1",
    name: "Lớp 5A1",
    studentCount: 37,
    teacherName: "Bùi Thanh Thảo",
    schoolYear: "2025-2026",
    totalLessons: 18,
    averageScore: 8.6,
    createdAt: "2025-09-01T08:00:00Z"
  },
  {
    id: "class_5a2",
    name: "Lớp 5A2",
    studentCount: 35,
    teacherName: "Bùi Thanh Thảo",
    schoolYear: "2025-2026",
    totalLessons: 18,
    averageScore: 8.2,
    createdAt: "2025-09-02T08:00:00Z"
  },
  {
    id: "class_5a3",
    name: "Lớp 5A3",
    studentCount: 32,
    teacherName: "Bùi Thanh Thảo",
    schoolYear: "2025-2026",
    totalLessons: 18,
    averageScore: 8.4,
    createdAt: "2025-09-03T08:00:00Z"
  },
  {
    id: "class_4a1",
    name: "Lớp 4A1",
    studentCount: 30,
    teacherName: "Bùi Thanh Thảo",
    schoolYear: "2025-2026",
    totalLessons: 16,
    averageScore: 8.0,
    createdAt: "2025-09-04T08:00:00Z"
  }
];

export const initialStudents: Student[] = [
  // Lớp 5A1 (37 Học sinh)
  { id: "std_5a1_01", name: "Nguyễn Anh Phước", studentCode: "HS5A101", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-02-10", notes: "Ngoan, lập trình Scratch tốt", currentScore: 9.5, speechCount: 12, attendanceCount: 18, goodScoresCount: 6, rank: "A" },
  { id: "std_5a1_02", name: "Nguyễn Linh Nhi", studentCode: "HS5A102", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-05-14", notes: "Chăm chỉ, làm slide đẹp", currentScore: 9.2, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_03", name: "Nguyễn Quỳnh Trang", studentCode: "HS5A103", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-08-20", notes: "Học giỏi đều các môn", currentScore: 8.8, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_04", name: "Đoàn Hồng Khánh", studentCode: "HS5A104", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-03-12", notes: "Hăng hái phát biểu", currentScore: 9.0, speechCount: 14, attendanceCount: 18, goodScoresCount: 7, rank: "A" },
  { id: "std_5a1_05", name: "Trần Hoàng Nam", studentCode: "HS5A105", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-11-05", notes: "Tích cực thực hành", currentScore: 8.5, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_06", name: "Lê Minh Đức", studentCode: "HS5A106", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-01-19", notes: "", currentScore: 8.0, speechCount: 6, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_07", name: "Phạm Vũ Bảo Anh", studentCode: "HS5A107", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-06-22", notes: "", currentScore: 8.7, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_08", name: "Hoàng Gia Hưng", studentCode: "HS5A108", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-04-17", notes: "", currentScore: 8.2, speechCount: 5, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_09", name: "Vũ Phương Linh", studentCode: "HS5A109", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-09-08", notes: "", currentScore: 9.1, speechCount: 11, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_10", name: "Đỗ Minh Trí", studentCode: "HS5A110", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-07-30", notes: "", currentScore: 8.4, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_11", name: "Bùi Ngọc Hà", studentCode: "HS5A111", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-12-14", notes: "", currentScore: 8.6, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "B" },
  { id: "std_5a1_12", name: "Đặng Thái Dương", studentCode: "HS5A112", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-02-28", notes: "", currentScore: 8.0, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_13", name: "Ngoài Khánh An", studentCode: "HS5A113", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-10-11", notes: "", currentScore: 8.9, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_14", name: "Trịnh Bảo Ngọc", studentCode: "HS5A114", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-03-25", notes: "", currentScore: 9.3, speechCount: 13, attendanceCount: 18, goodScoresCount: 6, rank: "A" },
  { id: "std_5a1_15", name: "Lý Văn Trường", studentCode: "HS5A115", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-08-03", notes: "", currentScore: 7.8, speechCount: 4, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_16", name: "Phùng Đức Anh", studentCode: "HS5A116", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-01-09", notes: "", currentScore: 8.1, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_17", name: "Dương Hoài Phương", studentCode: "HS5A117", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-04-02", notes: "", currentScore: 8.8, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_18", name: "Ngô Tuấn Kiệt", studentCode: "HS5A118", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-11-21", notes: "", currentScore: 8.3, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_19", name: "Chu Khánh Linh", studentCode: "HS5A119", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-07-16", notes: "", currentScore: 9.0, speechCount: 11, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_20", name: "Lâm Bảo Yến", studentCode: "HS5A120", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-09-29", notes: "", currentScore: 8.7, speechCount: 7, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_21", name: "Nguyễn Hoàng Long", studentCode: "HS5A121", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-05-04", notes: "", currentScore: 8.5, speechCount: 8, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_22", name: "Trần Thu Hà", studentCode: "HS5A122", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-02-18", notes: "", currentScore: 8.9, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_23", name: "Lê Việt Anh", studentCode: "HS5A123", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-08-12", notes: "", currentScore: 8.2, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_24", name: "Phạm Minh Triết", studentCode: "HS5A124", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-10-06", notes: "", currentScore: 8.4, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_25", name: "Vũ Thảo Nhi", studentCode: "HS5A125", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-03-31", notes: "", currentScore: 9.1, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_26", name: "Hoàn Anh Tuấn", studentCode: "HS5A126", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-06-15", notes: "", currentScore: 8.0, speechCount: 4, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_27", name: "Đào Cẩm Tú", studentCode: "HS5A127", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-12-01", notes: "", currentScore: 8.8, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_28", name: "Nguyễn Tấn Phát", studentCode: "HS5A128", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-04-23", notes: "", currentScore: 8.6, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_29", name: "Trương Bích Ngọc", studentCode: "HS5A129", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-07-07", notes: "", currentScore: 9.2, speechCount: 12, attendanceCount: 18, goodScoresCount: 6, rank: "A" },
  { id: "std_5a1_30", name: "Mai Đức Trọng", studentCode: "HS5A130", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-09-14", notes: "", currentScore: 8.1, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a1_31", name: "Đỗ Thùy Trang", studentCode: "HS5A131", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-01-27", notes: "", currentScore: 8.9, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_32", name: "Bùi Gia Huy", studentCode: "HS5A132", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-05-19", notes: "", currentScore: 8.3, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_33", name: "Đặng Khánh Vy", studentCode: "HS5A133", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-11-12", notes: "", currentScore: 9.0, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a1_34", name: "Nguyễn Hồng Quân", studentCode: "HS5A134", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-08-08", notes: "", currentScore: 8.4, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a1_35", name: "Trần Ngân Hà", studentCode: "HS5A135", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-03-03", notes: "", currentScore: 8.7, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a1_36", name: "Phạm Bảo Châu", studentCode: "HS5A136", classId: "class_5a1", className: "Lớp 5A1", gender: "Nữ", birthday: "2015-06-28", notes: "", currentScore: 9.3, speechCount: 13, attendanceCount: 18, goodScoresCount: 7, rank: "A" },
  { id: "std_5a1_37", name: "Nguyễn Đức Huy", studentCode: "HS5A137", classId: "class_5a1", className: "Lớp 5A1", gender: "Nam", birthday: "2015-10-15", notes: "", currentScore: 8.5, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },

  // Lớp 5A2 (35 Học sinh)
  { id: "std_5a2_01", name: "Bùi Minh Khôi", studentCode: "HS5A201", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-01-11", notes: "", currentScore: 8.5, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "B" },
  { id: "std_5a2_02", name: "Nguyễn Thảo My", studentCode: "HS5A202", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-04-18", notes: "", currentScore: 9.1, speechCount: 11, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a2_03", name: "Trần Gia Bảo", studentCode: "HS5A203", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-07-22", notes: "", currentScore: 8.0, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_04", name: "Lê Hoàng Yến", studentCode: "HS5A204", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-09-15", notes: "", currentScore: 8.8, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_05", name: "Phạm Quang Huy", studentCode: "HS5A205", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-02-04", notes: "", currentScore: 8.2, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_06", name: "Hoàng Thanh Hằng", studentCode: "HS5A206", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-06-12", notes: "", currentScore: 8.6, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "B" },
  { id: "std_5a2_07", name: "Vũ Quốc Anh", studentCode: "HS5A207", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-11-30", notes: "", currentScore: 8.4, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_08", name: "Đỗ Ngọc Mai", studentCode: "HS5A208", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-03-27", notes: "", currentScore: 9.0, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a2_09", name: "Đặng Anh Khoa", studentCode: "HS5A209", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-08-14", notes: "", currentScore: 7.9, speechCount: 4, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_10", name: "Nguyễn Phương Thảo", studentCode: "HS5A210", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-10-08", notes: "", currentScore: 8.9, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_11", name: "Trịnh Minh Đạt", studentCode: "HS5A211", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-05-23", notes: "", currentScore: 8.3, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_12", name: "Lâm Bảo Như", studentCode: "HS5A212", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-12-05", notes: "", currentScore: 8.7, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_13", name: "Phùng Khánh Linh", studentCode: "HS5A213", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-02-17", notes: "", currentScore: 9.2, speechCount: 12, attendanceCount: 18, goodScoresCount: 6, rank: "A" },
  { id: "std_5a2_14", name: "Ngô Hoàng Phúc", studentCode: "HS5A214", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-07-01", notes: "", currentScore: 8.1, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_15", name: "Dương Thu Hương", studentCode: "HS5A215", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-09-21", notes: "", currentScore: 8.5, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_16", name: "Chu Văn An", studentCode: "HS5A216", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-03-09", notes: "", currentScore: 8.2, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_17", name: "Lý Thanh Hà", studentCode: "HS5A217", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-06-04", notes: "", currentScore: 8.8, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_18", name: "Nguyễn Nhật Minh", studentCode: "HS5A218", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-11-19", notes: "", currentScore: 8.4, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_19", name: "Trần Khánh An", studentCode: "HS5A219", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-08-28", notes: "", currentScore: 9.0, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a2_20", name: "Lê Đức Minh", studentCode: "HS5A220", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-01-31", notes: "", currentScore: 8.0, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_21", name: "Phạm Như Ngọc", studentCode: "HS5A221", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-05-16", notes: "", currentScore: 8.6, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "B" },
  { id: "std_5a2_22", name: "Vũ Gia Khánh", studentCode: "HS5A222", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-10-25", notes: "", currentScore: 8.3, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_23", name: "Đào Phương Anh", studentCode: "HS5A223", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-04-07", notes: "", currentScore: 8.9, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_24", name: "Nguyễn Thành Nam", studentCode: "HS5A224", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-07-13", notes: "", currentScore: 8.2, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_25", name: "Trương Hoàng Long", studentCode: "HS5A225", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-09-02", notes: "", currentScore: 8.5, speechCount: 7, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_26", name: "Đỗ Yến Nhi", studentCode: "HS5A226", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-12-20", notes: "", currentScore: 9.1, speechCount: 11, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a2_27", name: "Bùi Tuấn Anh", studentCode: "HS5A227", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-03-15", notes: "", currentScore: 8.1, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_28", name: "Đặng Thu Thảo", studentCode: "HS5A228", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-06-09", notes: "", currentScore: 8.7, speechCount: 8, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_29", name: "Nguyễn Khôi Nguyên", studentCode: "HS5A229", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-08-01", notes: "", currentScore: 8.4, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_30", name: "Trần Bảo Lâm", studentCode: "HS5A230", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-11-14", notes: "", currentScore: 8.3, speechCount: 6, attendanceCount: 18, goodScoresCount: 3, rank: "B" },
  { id: "std_5a2_31", name: "Lê Quỳnh Anh", studentCode: "HS5A231", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-02-26", notes: "", currentScore: 9.0, speechCount: 10, attendanceCount: 18, goodScoresCount: 5, rank: "A" },
  { id: "std_5a2_32", name: "Phạm Việt Hoàng", studentCode: "HS5A232", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-05-08", notes: "", currentScore: 8.0, speechCount: 4, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_33", name: "Vũ Minh Châu", studentCode: "HS5A233", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-07-29", notes: "", currentScore: 8.8, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" },
  { id: "std_5a2_34", name: "Nguyễn Hoàng Bách", studentCode: "HS5A234", classId: "class_5a2", className: "Lớp 5A2", gender: "Nam", birthday: "2015-10-18", notes: "", currentScore: 8.2, speechCount: 5, attendanceCount: 18, goodScoresCount: 2, rank: "B" },
  { id: "std_5a2_35", name: "Hoàng Khánh Chi", studentCode: "HS5A235", classId: "class_5a2", className: "Lớp 5A2", gender: "Nữ", birthday: "2015-01-05", notes: "", currentScore: 8.9, speechCount: 9, attendanceCount: 18, goodScoresCount: 4, rank: "A" }
];

export const initialStudyLinks: StudyLink[] = [
  {
    id: "link_01",
    title: "Môi trường lập trình trực quan Scratch",
    url: "https://scratch.mit.edu",
    description: "Nền tảng học lập trình kéo thả trực quan sáng tạo, dễ dùng cho học sinh làm game và hoạt hình lớp 8.",
    subject: "Tin học",
    gradeGroup: "Khối 8",
    topic: "Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính",
    tags: ["Lập trình", "Kéo thả", "Scratch"],
    color: "#4d97ff",
    isFavorite: true,
    clicks: 145,
    createdAt: "2025-09-01T09:00:00Z"
  },
  {
    id: "link_02",
    title: "Luyện khoa học máy tính với Code.org",
    url: "https://code.org",
    description: "Nơi cung cấp bài học tư duy máy tính thông qua các trò chơi giải đố nổi tiếng Minecraft, Angry Birds.",
    subject: "Tin học",
    gradeGroup: "Khối 6",
    topic: "Khái niệm thuật toán và tư duy máy tính",
    tags: ["Tư duy thuật toán", "Game", "Lập trình"],
    color: "#00adbb",
    isFavorite: true,
    clicks: 120,
    createdAt: "2025-09-01T09:10:00Z"
  },
  {
    id: "link_03",
    title: "Quizizz - Tạo câu hỏi trắc nghiệm Tin học vui",
    url: "https://quizizz.com",
    description: "Công cụ ôn tập kiến thức mạng máy tính và bảo mật thông tin dưới dạng đua top trả lời cực phấn khích.",
    subject: "Tin học",
    gradeGroup: "Khối 6, 7, 8, 9",
    topic: "Trắc nghiệm ôn tập",
    tags: ["Trắc nghiệm", "Gamification", "Ôn tập"],
    color: "#8854d0",
    isFavorite: true,
    clicks: 210,
    createdAt: "2025-09-02T09:00:00Z"
  },
  {
    id: "link_04",
    title: "Canva Giáo dục - Thiết kế đồ họa và slide báo cáo",
    url: "https://canva.com",
    description: "Nền tảng thiết kế slide thuyết trình dự án công nghệ, làm infographic bài thuyết trình nhóm môn Công nghệ.",
    subject: "Công nghệ",
    gradeGroup: "Khối 7, 9",
    topic: "Trình bày báo cáo dự án",
    tags: ["Thiết kế", "Canva", "Đồ họa"],
    color: "#00c4cc",
    isFavorite: false,
    clicks: 85,
    createdAt: "2025-09-02T10:00:00Z"
  },
  {
    id: "link_05",
    title: "Blooket - Đua giải đố thú vị cho bài Công nghệ xanh",
    url: "https://blooket.com",
    description: "Hệ thống trò chơi câu hỏi về chủ đề năng lượng tái tạo, nông nghiệp công nghệ cao kích thích học tập.",
    subject: "Công nghệ",
    gradeGroup: "Khối 9",
    topic: "Chủ đề: Công nghệ xanh & phát triển bền vững",
    tags: ["Trò chơi", "Năng lượng xanh", "Blooket"],
    color: "#eb3b5a",
    isFavorite: true,
    clicks: 98,
    createdAt: "2025-09-03T09:00:00Z"
  }
];

export const initialLearningGames: LearningGame[] = [
  {
    id: "game_01",
    type: "Scratch",
    title: "Trò chơi mê cung thuật toán Scratch",
    description: "Học sinh lập trình điều khiển nhân vật vượt qua mê cung để tìm hiểu cấu trúc rẽ nhánh 'Nếu - Thì'.",
    url: "https://scratch.mit.edu/projects/editor/",
    targetClasses: ["class_8a3"],
    createdAt: "2025-09-10T08:00:00Z"
  },
  {
    id: "game_02",
    type: "Quizizz",
    title: "Đấu trường Phần cứng & Phần mềm máy tính",
    description: "Cuộc thi trắc nghiệm tốc độ phân biệt CPU, RAM, ROM, Hệ điều hành và Phần mềm ứng dụng.",
    url: "https://quizizz.com/admin/quiz/start-new",
    targetClasses: ["class_6a1", "class_8a3"],
    createdAt: "2025-09-11T08:00:00Z"
  },
  {
    id: "game_03",
    type: "Blooket",
    title: "Gold Quest - Vua Linh Kiện Điện Tử",
    description: "Trò chơi cướp vàng trả lời nhanh tên gọi, ký hiệu và vai trò của điện trở, tụ điện, transistor.",
    url: "https://www.blooket.com/play",
    targetClasses: ["class_7a2", "class_9a4"],
    createdAt: "2025-09-12T08:00:00Z"
  }
];

export const initialGradeHistory: GradeHistory[] = [
  {
    id: "hist_01",
    timestamp: "2026-07-06T08:30:00Z",
    teacherName: "Bùi Thanh Thảo",
    studentId: "std_8a3_01",
    studentName: "Nguyễn Minh Anh",
    classId: "class_8a3",
    className: "Lớp 8A3 - Scratch & Tin học",
    points: 10,
    type: "correct_answer",
    reason: "Trả lời xuất sắc câu hỏi về thuật toán sắp xếp nổi bọt"
  },
  {
    id: "hist_02",
    timestamp: "2026-07-06T08:35:00Z",
    teacherName: "Bùi Thanh Thảo",
    studentId: "std_8a3_03",
    studentName: "Lê Hoàng Nam",
    classId: "class_8a3",
    className: "Lớp 8A3 - Scratch & Tin học",
    points: 2,
    type: "speech",
    reason: "Phát biểu ý kiến xây dựng kịch bản làm phim hoạt hình Scratch"
  },
  {
    id: "hist_03",
    timestamp: "2026-07-06T08:40:00Z",
    teacherName: "Bùi Thanh Thảo",
    studentId: "std_8a3_05",
    studentName: "Vũ Hải Đăng",
    classId: "class_8a3",
    className: "Lớp 8A3 - Scratch & Tin học",
    points: -2,
    type: "no_homework",
    reason: "Không hoàn thành bài tập thực hành vẽ đa giác đều ở nhà"
  },
  {
    id: "hist_04",
    timestamp: "2026-07-06T09:10:00Z",
    teacherName: "Bùi Thanh Thảo",
    studentId: "std_6a1_01",
    studentName: "Hoàng Gia Bảo",
    classId: "class_6a1",
    className: "Lớp 6A1 - Tin học",
    points: 1,
    type: "attendance",
    reason: "Đi học đầy đủ và chuẩn bị bài tốt trước giờ lên lớp"
  }
];

export const initialExamPapers: ExamPaper[] = [
  {
    id: "exam_01",
    title: "Kiểm tra 15 phút - An toàn trên không gian mạng",
    subject: "Tin học",
    grade: "Khối 6",
    duration: 15,
    difficulty: "Trung bình",
    questions: [
      {
        question: "Hành động nào sau đây giúp bảo vệ tài khoản cá nhân trực tuyến an toàn nhất?",
        options: [
          "Đặt mật khẩu là số điện thoại của mình để dễ nhớ",
          "Sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số, ký tự đặc biệt và bật bảo mật 2 lớp",
          "Chia sẻ mật khẩu cho bạn thân đề phòng quên",
          "Dùng chung một mật khẩu cho tất cả tài khoản Facebook, Email, TikTok"
        ],
        answer: "Sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số, ký tự đặc biệt và bật bảo mật 2 lớp",
        explanation: "Mật khẩu mạnh và bảo mật 2 lớp ngăn chặn tin tặc tấn công tài khoản của bạn ngay cả khi họ biết mật khẩu."
      },
      {
        question: "Khi nhận được một tin nhắn từ người lạ gửi liên kết trúng thưởng điện thoại Iphone 14, em nên làm gì?",
        options: [
          "Click ngay vào liên kết để điền thông tin nhận thưởng",
          "Chia sẻ liên kết cho cả lớp cùng tham gia",
          "Không click vào, báo cáo tin nhắn rác hoặc chặn người gửi và hỏi ý kiến cha mẹ/thầy cô",
          "Nhắn tin hỏi người lạ xem có cần đóng phí gì không"
        ],
        answer: "Không click vào, báo cáo tin nhắn rác hoặc chặn người gửi và hỏi ý kiến cha mẹ/thầy cô",
        explanation: "Các liên kết trúng thưởng lạ thường là bẫy lừa đảo lấy cắp thông tin thẻ ngân hàng hoặc cài mã độc vào máy tính."
      }
    ],
    createdAt: "2026-07-01T08:00:00Z",
    isAIGenerated: false
  }
];
