import React, { createContext, useContext, useState, useEffect } from "react";
import authorImg from "../assets/author.jpg";
import { Classroom, Student, StudyLink, LearningGame, GradeHistory, ExamPaper, TeacherProfile } from "../types";
import { saveToStorage, loadFromStorage } from "../lib/idbStorage";
import { 
  initialClassrooms, 
  initialStudents, 
  initialStudyLinks, 
  initialLearningGames, 
  initialGradeHistory, 
  initialExamPapers 
} from "../data/mockData";
import { isFirebaseEnabled, db, auth } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

interface AppContextType {
  classrooms: Classroom[];
  students: Student[];
  studyLinks: StudyLink[];
  learningGames: LearningGame[];
  gradeHistory: GradeHistory[];
  examPapers: ExamPaper[];
  teacherProfile: TeacherProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  
  // PIN & Auth State
  isLoggedIn: boolean;
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
  
  // Operations
  addClassroom: (classroom: Classroom) => void;
  updateClassroom: (classroom: Classroom) => void;
  deleteClassroom: (id: string) => void;
  
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Student[]) => void;
  
  // Subjects
  subjects: string[];
  addSubject: (name: string) => void;
  deleteSubject: (name: string) => void;

  addGradeHistory: (log: GradeHistory) => void;
  deleteGradeHistory: (id: string) => void;
  undoGradeAction: (logId: string) => void;
  resetStudentScore: (studentId: string, subject?: string) => void;
  resetClassScores: (classId: string, subject?: string) => void;
  setExactStudentScore: (studentId: string, newScore: number, reason?: string, subject?: string) => void;
  
  addStudyLink: (link: StudyLink) => void;
  updateStudyLink: (link: StudyLink) => void;
  deleteStudyLink: (id: string) => void;
  clickStudyLink: (id: string) => void;
  
  addLearningGame: (game: LearningGame) => void;
  updateLearningGame: (game: LearningGame) => void;
  deleteLearningGame: (id: string) => void;
  
  addExamPaper: (exam: ExamPaper) => void;
  deleteExamPaper: (id: string) => void;
  
  updateTeacherProfile: (profile: TeacherProfile) => void;
  user: any;
  loading: boolean;
  syncWithFirebase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("classroom");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  // States initialized with fallback values from initial data or localStorage
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const local = localStorage.getItem("cl_classrooms");
    return local ? JSON.parse(local) : initialClassrooms;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem("cl_students");
    return local ? JSON.parse(local) : initialStudents;
  });

  const [studyLinks, setStudyLinks] = useState<StudyLink[]>(() => {
    const local = localStorage.getItem("cl_study_links");
    return local ? JSON.parse(local) : initialStudyLinks;
  });

  const [learningGames, setLearningGames] = useState<LearningGame[]>(() => {
    const local = localStorage.getItem("cl_learning_games");
    return local ? JSON.parse(local) : initialLearningGames;
  });

  const [gradeHistory, setGradeHistory] = useState<GradeHistory[]>(() => {
    const local = localStorage.getItem("cl_grade_history");
    return local ? JSON.parse(local) : initialGradeHistory;
  });

  const DEFAULT_SUBJECTS = ["Tin học", "Công nghệ"];

  const [subjects, setSubjects] = useState<string[]>(() => {
    const local = localStorage.getItem("cl_subjects");
    if (local) {
      try {
        const parsed: string[] = JSON.parse(local);
        const filtered = parsed.filter(s => !["Toán học", "Ngữ văn", "Tiếng Anh", "Toán"].includes(s));
        return filtered.length > 0 ? filtered : DEFAULT_SUBJECTS;
      } catch {
        return DEFAULT_SUBJECTS;
      }
    }
    return DEFAULT_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem("cl_subjects", JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    setSubjects(prev => [...prev, trimmed]);
  };

  const deleteSubject = (name: string) => {
    if (subjects.length <= 1) return;
    setSubjects(prev => prev.filter(s => s !== name));
  };

  const [examPapers, setExamPapers] = useState<ExamPaper[]>(() => {
    const local = localStorage.getItem("cl_exam_papers");
    return local ? JSON.parse(local) : initialExamPapers;
  });

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    const local = localStorage.getItem("cl_teacher_profile");
    if (local) {
      const parsed = JSON.parse(local);
      return {
        ...parsed,
        name: "Bùi Thanh Thảo",
        school: "Trường TIỂU HỌC KHẮC NIỆM",
        avatarUrl: parsed.avatarUrl || authorImg
      };
    }
    return {
      name: "Bùi Thanh Thảo",
      subject: "Tin học & Công nghệ",
      school: "Trường TIỂU HỌC KHẮC NIỆM",
      avatarUrl: authorImg
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const local = localStorage.getItem("cl_is_logged_in");
    return local !== null ? local === "true" : false; // Default to Guest mode (Read-only)
  });

  const loginWithPin = (pin: string): boolean => {
    if (pin === "Thanhthao220883@") {
      setIsLoggedIn(true);
      localStorage.setItem("cl_is_logged_in", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("cl_is_logged_in", "false");
  };

  // Asynchronously hydrate from IndexedDB on initial mount if available
  useEffect(() => {
    loadFromStorage<Student[]>("cl_students", []).then(storedStudents => {
      if (storedStudents && Array.isArray(storedStudents) && storedStudents.length > 0) {
        setStudents(storedStudents);
      }
    }).catch(err => console.warn("Hydrate students from IndexedDB warning:", err));
  }, []);

  // Keep IndexedDB + localStorage updated with local states
  useEffect(() => {
    saveToStorage("cl_classrooms", classrooms);
  }, [classrooms]);

  useEffect(() => {
    saveToStorage("cl_students", students);
    // Keep classrooms studentCount strictly synced with active student count
    setClassrooms(prevClassrooms => {
      let changed = false;
      const next = prevClassrooms.map(c => {
        const count = students.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
        if (c.studentCount !== count) {
          changed = true;
          return { ...c, studentCount: count };
        }
        return c;
      });
      return changed ? next : prevClassrooms;
    });
  }, [students]);

  useEffect(() => {
    saveToStorage("cl_study_links", studyLinks);
  }, [studyLinks]);

  useEffect(() => {
    saveToStorage("cl_learning_games", learningGames);
  }, [learningGames]);

  useEffect(() => {
    saveToStorage("cl_grade_history", gradeHistory);
  }, [gradeHistory]);

  useEffect(() => {
    saveToStorage("cl_exam_papers", examPapers);
  }, [examPapers]);

  useEffect(() => {
    saveToStorage("cl_teacher_profile", teacherProfile);
  }, [teacherProfile]);

  const syncWithFirebase = async (silent: boolean = false) => {
    if (!isFirebaseEnabled || !db) {
      if (!silent) alert("Firebase chưa được bật hoặc chưa kết nối!");
      return;
    }
    try {
      const targetClassrooms = classrooms.length > 0 ? classrooms : initialClassrooms;
      const targetStudents = students.length > 0 ? students : initialStudents;
      const targetLinks = studyLinks.length > 0 ? studyLinks : initialStudyLinks;
      const targetGames = learningGames.length > 0 ? learningGames : initialLearningGames;
      const targetHistory = gradeHistory.length > 0 ? gradeHistory : initialGradeHistory;
      const targetExams = examPapers.length > 0 ? examPapers : initialExamPapers;

      for (const classroom of targetClassrooms) {
        await setDoc(doc(db, "classrooms", classroom.id), classroom);
      }
      for (const student of targetStudents) {
        await setDoc(doc(db, "students", student.id), student);
      }
      for (const link of targetLinks) {
        await setDoc(doc(db, "study_links", link.id), link);
      }
      for (const game of targetGames) {
        await setDoc(doc(db, "learning_games", game.id), game);
      }
      for (const hist of targetHistory) {
        await setDoc(doc(db, "grade_history", hist.id), hist);
      }
      for (const exam of targetExams) {
        await setDoc(doc(db, "exam_papers", exam.id), exam);
      }
      if (!silent) {
        alert("Đồng bộ dữ liệu thành công lên Firebase Firestore (quanlylophocthongminh)!");
      } else {
        console.log("Đã khởi tạo tự động dữ liệu ban đầu lên Firebase Firestore!");
      }
    } catch (e) {
      console.error("Firebase Sync Error: ", e);
      if (!silent) alert("Lỗi đồng bộ Firebase: " + e);
    }
  };

  // Firebase integration adapter
  useEffect(() => {
    setLoading(true);
    if (isFirebaseEnabled && db) {
      // Auto sign-in anonymously if auth exists and no current user
      if (auth && !auth.currentUser) {
        signInAnonymously(auth).catch((err) => {
          console.log("Firebase anonymous auth info:", err);
        });
      }

      const unsubscribeAuth = auth ? onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      }) : () => {};

      // Flag to check if initial seed attempt was made for empty DB
      let hasAttemptedSeed = false;

      // Realtime listener for classrooms
      const unsubClassrooms = onSnapshot(collection(db, "classrooms"), (snap) => {
        const data: Classroom[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) {
          setClassrooms(data);
        } else if (!hasAttemptedSeed) {
          hasAttemptedSeed = true;
          // Firestore is completely empty, push current data automatically
          syncWithFirebase(true);
        }
      }, (err) => console.error("Firestore Classrooms listener err:", err));

      // Realtime listener for students
      const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
        const data: Student[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) setStudents(data);
      }, (err) => console.error("Firestore Students listener err:", err));

      // Realtime listener for studyLinks
      const unsubLinks = onSnapshot(collection(db, "study_links"), (snap) => {
        const data: StudyLink[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) setStudyLinks(data);
      }, (err) => console.error("Firestore Links listener err:", err));

      // Realtime listener for learningGames
      const unsubGames = onSnapshot(collection(db, "learning_games"), (snap) => {
        const data: LearningGame[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) setLearningGames(data);
      }, (err) => console.error("Firestore Games listener err:", err));

      // Realtime listener for gradeHistory
      const unsubHistory = onSnapshot(collection(db, "grade_history"), (snap) => {
        const data: GradeHistory[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) setGradeHistory(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }, (err) => console.error("Firestore History listener err:", err));

      // Realtime listener for examPapers
      const unsubExams = onSnapshot(collection(db, "exam_papers"), (snap) => {
        const data: ExamPaper[] = [];
        snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as any));
        if (data.length > 0) setExamPapers(data);
      }, (err) => console.error("Firestore Exams listener err:", err));

      setLoading(false);

      return () => {
        unsubscribeAuth();
        unsubClassrooms();
        unsubStudents();
        unsubLinks();
        unsubGames();
        unsubHistory();
        unsubExams();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const checkPermission = (): boolean => {
    if (!isLoggedIn) {
      alert("🔒 Chế độ KHÁCH chỉ được phép XEM!\n\nBạn không có quyền nhập, thêm, sửa hoặc xóa dữ liệu. Vui lòng bấm 'Đăng nhập PIN' ở góc trên màn hình để mở khóa quyền Quản trị viên.");
      return false;
    }
    return true;
  };

  // State Mutators
  const addClassroom = async (classroom: Classroom) => {
    if (!checkPermission()) return;
    setClassrooms(prev => [classroom, ...prev]);
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "classrooms", classroom.id), classroom);
    }
  };

  const updateClassroom = async (classroom: Classroom) => {
    if (!checkPermission()) return;
    setClassrooms(prev => prev.map(c => c.id === classroom.id ? classroom : c));
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "classrooms", classroom.id), classroom);
    }
  };

  const deleteClassroom = async (id: string) => {
    if (!checkPermission()) return;
    setClassrooms(prev => prev.filter(c => c.id !== id));
    setStudents(prev => prev.filter(s => s.classId !== id)); // Cascade delete students
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "classrooms", id));
    }
  };

  const addStudent = async (student: Student) => {
    if (!checkPermission()) return;
    setStudents(prev => {
      const updated = [...prev, student];
      setClassrooms(prevClassrooms =>
        prevClassrooms.map(c => {
          const activeCount = updated.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
          return { ...c, studentCount: activeCount };
        })
      );
      return updated;
    });
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "students", student.id), student);
    }
  };

  const updateStudent = async (student: Student) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === student.id ? student : s);
      setClassrooms(prevClassrooms =>
        prevClassrooms.map(c => {
          const activeCount = updated.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
          return { ...c, studentCount: activeCount };
        })
      );
      saveToStorage("cl_students", updated);
      return updated;
    });

    if (isFirebaseEnabled && db && isLoggedIn) {
      await setDoc(doc(db, "students", student.id), student);
    }
  };

  const deleteStudent = async (id: string) => {
    if (!checkPermission()) return;
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== id);
      setClassrooms(prevClassrooms =>
        prevClassrooms.map(c => {
          const activeCount = updated.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
          return { ...c, studentCount: activeCount };
        })
      );
      return updated;
    });
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "students", id));
    }
  };

  const importStudents = async (newStudents: Student[]) => {
    if (!checkPermission()) return;

    setStudents(prev => {
      // Deduplicate ONLY within the SAME classId by id or matching studentCode+name
      const filteredPrev = prev.filter(p => 
        !newStudents.some(n => n.classId === p.classId && (n.id === p.id || (n.studentCode && n.studentCode === p.studentCode && n.name.trim() === p.name.trim())))
      );
      const updatedList = [...filteredPrev, ...newStudents];

      // Automatically recalculate studentCount for all classrooms based on active students
      setClassrooms(prevClassrooms => 
        prevClassrooms.map(c => {
          const activeCount = updatedList.filter(s => s.classId === c.id && (s.status || "active") === "active").length;
          return { ...c, studentCount: activeCount };
        })
      );

      return updatedList;
    });

    if (isFirebaseEnabled && db) {
      for (const student of newStudents) {
        await setDoc(doc(db, "students", student.id), student);
      }
    }
  };

  const addGradeHistory = async (log: GradeHistory) => {
    if (!checkPermission()) return;
    setGradeHistory(prev => [log, ...prev]);
    
    const subj = log.subject || "Tin học";

    // update student stats dynamically
    setStudents(prev => prev.map(s => {
      if (s.id === log.studentId) {
        const prevSubjScores = s.subjectScores || {};
        const existingSubjScore = prevSubjScores[subj] !== undefined ? prevSubjScores[subj] : (subj === "Tin học" ? s.currentScore : 0);
        const newSubjScore = Number((Math.max(0, existingSubjScore + log.points)).toFixed(1));
        const newTotalScore = Number((Math.max(0, s.currentScore + log.points)).toFixed(1));
        
        let speechAdd = 0;
        let attendanceAdd = 0;
        let goodScoreAdd = 0;
        
        if (log.type === "speech") speechAdd = 1;
        if (log.type === "attendance") attendanceAdd = 1;
        if (log.type === "correct_answer") speechAdd = 1;
        if (log.points >= 8 || log.type === "reward") goodScoreAdd = 1;

        // Dynamic ranking update based on score
        let newRank = "B";
        if (newTotalScore >= 9.0) newRank = "A";
        else if (newTotalScore >= 8.0) newRank = "B";
        else if (newTotalScore >= 6.5) newRank = "C";
        else newRank = "D";

        return {
          ...s,
          currentScore: newTotalScore,
          subjectScores: {
            ...prevSubjScores,
            [subj]: newSubjScore
          },
          speechCount: s.speechCount + speechAdd,
          attendanceCount: s.attendanceCount + attendanceAdd,
          goodScoresCount: s.goodScoresCount + goodScoreAdd,
          rank: newRank
        };
      }
      return s;
    }));

    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "grade_history", log.id), log);
      const updatedS = students.find(s => s.id === log.studentId);
      if (updatedS) {
        const prevSubjScores = updatedS.subjectScores || {};
        const existingSubjScore = prevSubjScores[subj] !== undefined ? prevSubjScores[subj] : (subj === "Tin học" ? updatedS.currentScore : 0);
        const newSubjScore = Number((Math.max(0, existingSubjScore + log.points)).toFixed(1));
        const newTotalScore = Number((Math.max(0, updatedS.currentScore + log.points)).toFixed(1));
        await setDoc(doc(db, "students", updatedS.id), {
          ...updatedS,
          currentScore: newTotalScore,
          subjectScores: {
            ...prevSubjScores,
            [subj]: newSubjScore
          }
        });
      }
    }
  };

  const deleteGradeHistory = async (id: string) => {
    if (!checkPermission()) return;
    const log = gradeHistory.find(h => h.id === id);
    if (!log) return;
    
    const subj = log.subject || "Tin học";

    // reverse student score
    setStudents(prev => prev.map(s => {
      if (s.id === log.studentId) {
        const prevSubjScores = s.subjectScores || {};
        const existingSubjScore = prevSubjScores[subj] ?? (subj === "Tin học" ? s.currentScore : 0);
        const revertedSubjScore = Number((Math.max(0, existingSubjScore - log.points)).toFixed(1));
        const revertedTotalScore = Number((Math.max(0, s.currentScore - log.points)).toFixed(1));

        return {
          ...s,
          currentScore: revertedTotalScore,
          subjectScores: {
            ...prevSubjScores,
            [subj]: revertedSubjScore
          },
          speechCount: s.speechCount - (log.type === "speech" || log.type === "correct_answer" ? 1 : 0),
          attendanceCount: s.attendanceCount - (log.type === "attendance" ? 1 : 0),
          goodScoresCount: s.goodScoresCount - (log.points >= 8 || log.type === "reward" ? 1 : 0)
        };
      }
      return s;
    }));

    setGradeHistory(prev => prev.filter(h => h.id !== id));
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "grade_history", id));
    }
  };

  const undoGradeAction = (logId: string) => {
    deleteGradeHistory(logId);
  };

  const resetStudentScore = async (studentId: string, subject?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        if (subject) {
          const prevSubjScores = s.subjectScores || {};
          const subjScore = prevSubjScores[subject] ?? 0;
          const newTotal = Math.max(0, Number((s.currentScore - subjScore).toFixed(1)));
          const newSubjScores = { ...prevSubjScores, [subject]: 0 };
          return {
            ...s,
            currentScore: newTotal,
            subjectScores: newSubjScores
          };
        }
        return {
          ...s,
          currentScore: 0,
          subjectScores: {},
          speechCount: 0,
          attendanceCount: 0,
          goodScoresCount: 0,
          rank: "C"
        };
      }
      return s;
    }));

    setGradeHistory(prev => prev.filter(h => {
      if (h.studentId !== studentId) return true;
      if (subject) {
        return h.subject !== subject;
      }
      return false;
    }));

    if (isFirebaseEnabled && db) {
      try {
        const studentRef = doc(db, "students", studentId);
        const targetStudent = students.find(s => s.id === studentId);
        if (targetStudent) {
          if (subject) {
            const prevSubjScores = targetStudent.subjectScores || {};
            const subjScore = prevSubjScores[subject] ?? 0;
            const newTotal = Math.max(0, Number((targetStudent.currentScore - subjScore).toFixed(1)));
            const newSubjScores = { ...prevSubjScores, [subject]: 0 };
            await updateDoc(studentRef, {
              currentScore: newTotal,
              subjectScores: newSubjScores
            });
          } else {
            await updateDoc(studentRef, {
              currentScore: 0,
              subjectScores: {},
              speechCount: 0,
              attendanceCount: 0,
              goodScoresCount: 0,
              rank: "C"
            });
          }
        }

        const q = query(collection(db, "grade_history"), where("studentId", "==", studentId));
        const querySnap = await getDocs(q);
        querySnap.forEach(async (d) => {
          const data = d.data();
          if (!subject || data.subject === subject) {
            await deleteDoc(doc(db, "grade_history", d.id));
          }
        });
      } catch (e) {
        console.error("Error resetting student score in Firebase:", e);
      }
    }
  };

  const resetClassScores = async (classId: string, subject?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.classId === classId) {
        if (subject) {
          const prevSubjScores = s.subjectScores || {};
          const subjScore = prevSubjScores[subject] ?? 0;
          const newTotal = Math.max(0, Number((s.currentScore - subjScore).toFixed(1)));
          const newSubjScores = { ...prevSubjScores, [subject]: 0 };
          return {
            ...s,
            currentScore: newTotal,
            subjectScores: newSubjScores
          };
        }
        return {
          ...s,
          currentScore: 0,
          subjectScores: {},
          speechCount: 0,
          attendanceCount: 0,
          goodScoresCount: 0,
          rank: "C"
        };
      }
      return s;
    }));

    setGradeHistory(prev => prev.filter(h => {
      if (h.classId !== classId) return true;
      if (subject) {
        return h.subject !== subject;
      }
      return false;
    }));

    if (isFirebaseEnabled && db) {
      try {
        const classStuds = students.filter(s => s.classId === classId);
        for (const s of classStuds) {
          const studentRef = doc(db, "students", s.id);
          if (subject) {
            const prevSubjScores = s.subjectScores || {};
            const subjScore = prevSubjScores[subject] ?? 0;
            const newTotal = Math.max(0, Number((s.currentScore - subjScore).toFixed(1)));
            const newSubjScores = { ...prevSubjScores, [subject]: 0 };
            await updateDoc(studentRef, {
              currentScore: newTotal,
              subjectScores: newSubjScores
            });
          } else {
            await updateDoc(studentRef, {
              currentScore: 0,
              subjectScores: {},
              speechCount: 0,
              attendanceCount: 0,
              goodScoresCount: 0,
              rank: "C"
            });
          }
        }

        const q = query(collection(db, "grade_history"), where("classId", "==", classId));
        const querySnap = await getDocs(q);
        querySnap.forEach(async (d) => {
          const data = d.data();
          if (!subject || data.subject === subject) {
            await deleteDoc(doc(db, "grade_history", d.id));
          }
        });
      } catch (e) {
        console.error("Error resetting class scores in Firebase:", e);
      }
    }
  };

  const setExactStudentScore = async (studentId: string, newScore: number, reasonText: string = "Sửa/Đặt lại điểm trực tiếp", subject?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const targetVal = Math.max(0, Number(newScore.toFixed(1)));
    const activeSubj = subject || "Tin học";
    const currentSubjScore = student.subjectScores?.[activeSubj] ?? (activeSubj === "Tin học" ? student.currentScore : 0);
    const diff = targetVal - currentSubjScore;

    const newLog: GradeHistory = {
      id: "hist_" + Date.now(),
      timestamp: new Date().toISOString(),
      teacherName: "Bùi Thanh Thảo",
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      className: student.className,
      points: Number(diff.toFixed(1)),
      type: diff >= 0 ? "reward" : "deduction",
      reason: `${reasonText} (${targetVal}đ)`,
      subject: activeSubj
    };

    addGradeHistory(newLog);
  };

  const addStudyLink = async (link: StudyLink) => {
    if (!checkPermission()) return;
    setStudyLinks(prev => [link, ...prev]);
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "study_links", link.id), link);
    }
  };

  const updateStudyLink = async (link: StudyLink) => {
    if (!checkPermission()) return;
    setStudyLinks(prev => prev.map(l => l.id === link.id ? link : l));
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "study_links", link.id), link);
    }
  };

  const deleteStudyLink = async (id: string) => {
    if (!checkPermission()) return;
    setStudyLinks(prev => prev.filter(l => l.id !== id));
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "study_links", id));
    }
  };

  const clickStudyLink = async (id: string) => {
    setStudyLinks(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, clicks: l.clicks + 1 };
        if (isFirebaseEnabled && db) {
          setDoc(doc(db, "study_links", id), updated);
        }
        return updated;
      }
      return l;
    }));
  };

  const addLearningGame = async (game: LearningGame) => {
    if (!checkPermission()) return;
    setLearningGames(prev => [game, ...prev]);
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "learning_games", game.id), game);
    }
  };

  const updateLearningGame = async (game: LearningGame) => {
    if (!checkPermission()) return;
    setLearningGames(prev => prev.map(g => g.id === game.id ? game : g));
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "learning_games", game.id), game);
    }
  };

  const deleteLearningGame = async (id: string) => {
    if (!checkPermission()) return;
    setLearningGames(prev => prev.filter(g => g.id !== id));
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "learning_games", id));
    }
  };

  const addExamPaper = async (exam: ExamPaper) => {
    if (!checkPermission()) return;
    setExamPapers(prev => [exam, ...prev]);
    if (isFirebaseEnabled && db) {
      await setDoc(doc(db, "exam_papers", exam.id), exam);
    }
  };

  const deleteExamPaper = async (id: string) => {
    if (!checkPermission()) return;
    setExamPapers(prev => prev.filter(e => e.id !== id));
    if (isFirebaseEnabled && db) {
      await deleteDoc(doc(db, "exam_papers", id));
    }
  };

  const updateTeacherProfile = (profile: TeacherProfile) => {
    if (!checkPermission()) return;
    setTeacherProfile(profile);
  };

  // Recalculate average score for classrooms based on students
  useEffect(() => {
    if (classrooms.length > 0 && students.length > 0) {
      const updatedClasses = classrooms.map(c => {
        const classStudents = students.filter(s => s.classId === c.id);
        if (classStudents.length === 0) return c;
        const total = classStudents.reduce((sum, s) => sum + s.currentScore, 0);
        const avg = Number((total / classStudents.length).toFixed(1));
        if (avg !== c.averageScore || classStudents.length !== c.studentCount) {
          return { ...c, averageScore: avg, studentCount: classStudents.length };
        }
        return c;
      });
      // Check if actually changed to avoid loop
      const changed = JSON.stringify(updatedClasses) !== JSON.stringify(classrooms);
      if (changed) {
        setClassrooms(updatedClasses);
      }
    }
  }, [students]);

  return (
    <AppContext.Provider value={{
      classrooms,
      students,
      studyLinks,
      learningGames,
      gradeHistory,
      examPapers,
      teacherProfile,
      activeTab,
      setActiveTab,
      selectedClassId,
      setSelectedClassId,
      isLoggedIn,
      loginWithPin,
      logout,
      subjects,
      addSubject,
      deleteSubject,
      addClassroom,
      updateClassroom,
      deleteClassroom,
      addStudent,
      updateStudent,
      deleteStudent,
      importStudents,
      addGradeHistory,
      deleteGradeHistory,
      undoGradeAction,
      resetStudentScore,
      resetClassScores,
      setExactStudentScore,
      addStudyLink,
      updateStudyLink,
      deleteStudyLink,
      clickStudyLink,
      addLearningGame,
      updateLearningGame,
      deleteLearningGame,
      addExamPaper,
      deleteExamPaper,
      updateTeacherProfile,
      user,
      loading,
      syncWithFirebase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
