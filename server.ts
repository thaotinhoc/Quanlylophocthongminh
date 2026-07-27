import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI
const getAIClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in environment variables. AI features will fallback gracefully.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// --- API ROUTES FIRST ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    aiEnabled: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// 2. Generate Exam Paper with Gemini (Smart computer science exam generator)
app.post("/api/gemini/generate-exam", async (req, res) => {
  const { title, subject, grade, topic, duration, difficulty, count = 5 } = req.body;
  
  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({ 
      error: "AI service is currently unavailable. Please configure GEMINI_API_KEY." 
    });
  }

  try {
    const prompt = `Bạn là một trợ lý AI chuyên thiết kế đề thi và học liệu Tin học & Công nghệ cho giáo viên Việt Nam.
Hãy tạo một bộ đề trắc nghiệm có tiêu đề "${title || 'Kiểm tra nhanh'}", môn học "${subject}", khối lớp "${grade}", chủ đề "${topic}", thời gian ${duration} phút, độ khó "${difficulty}".
Bộ đề gồm chính xác ${count} câu hỏi trắc nghiệm, mỗi câu hỏi gồm có:
- Câu hỏi (question)
- 4 đáp án lựa chọn (options)
- Đáp án đúng (answer) - Trả về chuỗi khớp hoàn toàn với một trong các lựa chọn.
- Giải thích chi tiết lựa chọn đúng (explanation).

Hãy viết các câu hỏi thật cụ thể, thực tế, đúng chương trình GDPT mới nhất của Bộ Giáo dục & Đào tạo Việt Nam bộ môn Tin học hoặc Công nghệ.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một giáo viên chuyên gia bộ môn Tin học và Công nghệ cấp THCS/THPT. Bạn luôn trả về kết quả dưới định dạng JSON chính xác khớp với schema được yêu cầu.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["questions"],
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "Danh sách các câu hỏi trắc nghiệm",
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "answer", "explanation"],
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "Nội dung câu hỏi trắc nghiệm.",
                  },
                  options: {
                    type: Type.ARRAY,
                    description: "Mảng gồm chính xác 4 đáp án lựa chọn dưới dạng chuỗi.",
                    items: {
                      type: Type.STRING
                    }
                  },
                  answer: {
                    type: Type.STRING,
                    description: "Đáp án đúng chính xác, phải là một trong bốn chuỗi trong mảng options.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Giải thích ngắn gọn lý do chọn đáp án này và kiến thức liên quan.",
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Không nhận được dữ liệu phản hồi từ AI model.");
    }

    const examData = JSON.parse(resultText.trim());
    res.json({
      id: "ai_exam_" + Date.now(),
      title: title || `${subject} - ${topic}`,
      subject,
      grade,
      duration: Number(duration) || 15,
      difficulty,
      questions: examData.questions,
      createdAt: new Date().toISOString(),
      isAIGenerated: true
    });

  } catch (error: any) {
    console.error("Lỗi khi tạo đề thi với Gemini:", error);
    res.status(500).json({ 
      error: "Không thể tạo đề kiểm tra bằng AI. Chi tiết: " + (error.message || error) 
    });
  }
});

// 3. Analyze Class Performance & Generate Smart Recommendations (AI Coaching)
app.post("/api/gemini/analyze-class", async (req, res) => {
  const { className, students, averageScore, recentGradesHistory } = req.body;

  const ai = getAIClient();
  if (!ai) {
    return res.status(503).json({ 
      error: "AI service is currently unavailable. Please configure GEMINI_API_KEY." 
    });
  }

  try {
    const studentProfiles = (students || []).map((s: any) => ({
      name: s.name,
      score: s.currentScore,
      speeches: s.speechCount,
      attendance: s.attendanceCount,
      goodGrades: s.goodScoresCount,
      notes: s.notes
    }));

    const prompt = `Phân tích tình hình học tập của lớp "${className}" môn Tin học & Công nghệ.
Thông tin tổng quan:
- Sĩ số: ${studentProfiles.length} học sinh.
- Điểm trung bình hiện tại: ${averageScore}.
- Lịch sử chấm điểm và hoạt động gần đây của lớp: ${JSON.stringify(recentGradesHistory || [])}
- Danh sách học sinh tiêu biểu: ${JSON.stringify(studentProfiles)}

Dựa trên dữ liệu thực tế này, hãy thực hiện các phân tích:
1. Nhận xét tổng quan về học lực và tinh thần học tập của lớp.
2. Tuyên dương tối đa 3 học sinh xuất sắc nhất (đóng góp phát biểu nhiều, điểm cao).
3. Đề xuất kế hoạch hỗ trợ cho các học sinh đang gặp khó khăn (điểm thấp, ít phát biểu hoặc có ghi chú cần chú ý).
4. Gợi ý cụ thể 3 hoạt động giảng dạy, chủ đề, trò chơi học tập công nghệ (như Scratch, Code.org, Quizizz, Kahoot) phù hợp để khuấy động không khí lớp và giúp các em tiến bộ hơn.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một chuyên gia cố vấn giáo dục Tin học và Công nghệ, có phong cách chia sẻ đầy truyền cảm hứng, thân thiện, chuyên nghiệp giống giáo viên Bùi Thanh Thảo. Hãy trả về nhận xét bằng tiếng Việt dưới dạng định dạng cấu trúc JSON sạch sẽ.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "topStudents", "strugglingStudentsPlan", "recommendedActivities"],
          properties: {
            summary: {
              type: Type.STRING,
              description: "Đánh giá và nhận xét chung nhất về lớp học một cách tích cực, mang tính xây dựng.",
            },
            topStudents: {
              type: Type.ARRAY,
              description: "Danh sách tuyên dương các học sinh xuất sắc cùng lý do cụ thể.",
              items: {
                type: Type.OBJECT,
                required: ["name", "achievement", "motivation"],
                properties: {
                  name: { type: Type.STRING },
                  achievement: { type: Type.STRING, description: "Thành tích đạt được (ví dụ: phát biểu 10 lần, điểm 9.5...)" },
                  motivation: { type: Type.STRING, description: "Lời khen ngợi động viên từ cô Thảo." }
                }
              }
            },
            strugglingStudentsPlan: {
              type: Type.ARRAY,
              description: "Danh sách kế hoạch hỗ trợ nhóm học sinh cần cải thiện.",
              items: {
                type: Type.OBJECT,
                required: ["name", "issue", "actionPlan"],
                properties: {
                  name: { type: Type.STRING },
                  issue: { type: Type.STRING, description: "Vấn đề học sinh đang gặp phải." },
                  actionPlan: { type: Type.STRING, description: "Kế hoạch hành động cụ thể cô Thảo sẽ giúp em." }
                }
              }
            },
            recommendedActivities: {
              type: Type.ARRAY,
              description: "Đề xuất 3 hoạt động hoặc công cụ học tập phù hợp.",
              items: {
                type: Type.OBJECT,
                required: ["tool", "activityName", "description", "benefit"],
                properties: {
                  tool: { type: Type.STRING, description: "Tên công cụ (ví dụ: Scratch, Kahoot, Blooket...)" },
                  activityName: { type: Type.STRING, description: "Tên hoạt động đề xuất." },
                  description: { type: Type.STRING, description: "Cách tổ chức hoạt động ngắn gọn." },
                  benefit: { type: Type.STRING, description: "Lợi ích mang lại cho lớp học." }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Không nhận được kết quả phân tích từ AI.");
    }

    res.json(JSON.parse(resultText.trim()));

  } catch (error: any) {
    console.error("Lỗi khi phân tích lớp học bằng Gemini:", error);
    res.status(500).json({ 
      error: "Không thể phân tích lớp học bằng AI. Chi tiết: " + (error.message || error) 
    });
  }
});

// --- VITE MIDDLEWARE OR STATIC SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
