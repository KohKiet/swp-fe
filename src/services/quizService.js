import { API_CONFIG } from "./apiConfig";

/**
 * Quiz Service - Quản lý các API liên quan đến quiz
 */
class QuizService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method để thực hiện authenticated request
  async authenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Lấy quiz của course (từ tất cả lessons trong course)
   * @param {string} courseId - ID của khóa học
   * @returns {Promise} Response chứa danh sách quiz
   */
  async getCourseQuiz(courseId) {
    try {
      // Lấy danh sách chapters của course
      const chaptersResponse = await fetch(
        `${
          this.baseURL
        }${API_CONFIG.ENDPOINTS.CHAPTER_BY_COURSE.replace(
          "{courseId}",
          courseId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
        }
      );

      if (!chaptersResponse.ok) {
        throw new Error("Failed to fetch chapters");
      }

      const chaptersData = await chaptersResponse.json();
      if (!chaptersData.success || !chaptersData.data) {
        throw new Error("No chapters found");
      }

      const chapters = chaptersData.data;
      let allQuizzes = [];

      // Lấy quiz từ tất cả lessons trong tất cả chapters
      for (const chapter of chapters) {
        // Lấy lessons của chapter
        const lessonsResponse = await fetch(
          `${
            this.baseURL
          }${API_CONFIG.ENDPOINTS.LESSON_BY_CHAPTER.replace(
            "{chapterId}",
            chapter.id
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "accessToken"
              )}`,
            },
          }
        );

        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          if (lessonsData.success && lessonsData.data) {
            const lessons = lessonsData.data;

            // Lấy quiz cho mỗi lesson
            for (const lesson of lessons) {
              try {
                const quizResponse = await fetch(
                  `${
                    this.baseURL
                  }${API_CONFIG.ENDPOINTS.QUIZ_BY_LESSON.replace(
                    "{lessonId}",
                    lesson.id
                  )}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  }
                );

                if (quizResponse.ok) {
                  const quizData = await quizResponse.json();
                  if (
                    quizData.success &&
                    quizData.data &&
                    quizData.data.length > 0
                  ) {
                    // Chỉ lấy quiz đầu tiên vì mỗi lesson chỉ có 1 quiz (isFinalQuiz = true)
                    const quiz = quizData.data[0];
                    quiz.lessonId = lesson.id;
                    quiz.lessonTitle = lesson.title;
                    quiz.chapterTitle = chapter.title;
                    allQuizzes.push(quiz);
                  }
                }
              } catch (quizError) {
                console.warn(
                  `No quiz found for lesson ${lesson.id}:`,
                  quizError
                );
              }
            }
          }
        }
      }

      return {
        success: true,
        data: allQuizzes,
        message: `Found ${allQuizzes.length} quiz(zes) in course`,
      };
    } catch (error) {
      console.error("Error fetching course quiz:", error);
      throw error;
    }
  }

  /**
   * Bắt đầu quiz session
   * @param {string} quizId - ID của quiz
   * @returns {Promise} Response chứa sessionId
   */
  async startQuizSession(quizId) {
    const endpoint = API_CONFIG.ENDPOINTS.QUIZ_START_SESSION.replace(
      "{quizId}",
      quizId
    );
    return this.authenticatedRequest(endpoint);
  }

  /**
   * Lấy câu hỏi của quiz
   * @param {string} quizId - ID của quiz
   * @returns {Promise} Response chứa danh sách câu hỏi
   */
  async getQuizQuestions(quizId) {
    const endpoint = API_CONFIG.ENDPOINTS.QUESTION_BY_QUIZ.replace(
      "{quizId}",
      quizId
    );
    return this.authenticatedRequest(endpoint);
  }

  /**
   * Nộp kết quả quiz với sessionId
   * @param {string} quizId - ID của quiz
   * @param {Array} userAnswers - Mảng câu trả lời của user
   * @param {number} timeSpent - Thời gian làm bài (phút)
   * @param {string} sessionId - ID của session quiz
   * @returns {Promise} Response chứa kết quả quiz
   */
  async submitQuiz(quizId, userAnswers, timeSpent, sessionId = null) {
    try {
      // Nếu không có sessionId, bắt đầu quiz session để lấy sessionId
      let actualSessionId = sessionId;
      if (!actualSessionId) {
        const sessionResponse = await this.startQuizSession(quizId);
        if (!sessionResponse.success) {
          throw new Error("Failed to start quiz session");
        }
        actualSessionId = sessionResponse.data.sessionId;
      }

      // Submit quiz với sessionId
      const submitData = {
        quizId,
        sessionId: actualSessionId,
        userAnswers,
        timeSpentMinutes: timeSpent,
        notes: "Quiz submission",
      };

      return this.authenticatedRequest(
        API_CONFIG.ENDPOINTS.QUIZ_RESULT_SUBMIT,
        {
          method: "POST",
          body: JSON.stringify(submitData),
        }
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  }

  /**
   * Lấy kết quả quiz của user
   * @param {string} quizId - ID của quiz
   * @returns {Promise} Response chứa kết quả quiz
   */
  async getQuizResults(quizId) {
    const endpoint =
      API_CONFIG.ENDPOINTS.QUIZ_RESULT_BY_USER_QUIZ.replace(
        "{quizId}",
        quizId
      );
    return this.authenticatedRequest(endpoint);
  }

  /**
   * Lấy thông tin chi tiết quiz
   * @param {string} quizId - ID của quiz
   * @returns {Promise} Response chứa thông tin quiz
   */
  async getQuizById(quizId) {
    const endpoint = API_CONFIG.ENDPOINTS.QUIZ_BY_ID.replace(
      "{quizId}",
      quizId
    );
    return this.authenticatedRequest(endpoint);
  }
}

// Export instance
const quizService = new QuizService();
export default quizService;

// Export các function riêng lẻ để dễ sử dụng
export const {
  getCourseQuiz,
  startQuizSession,
  getQuizQuestions,
  submitQuiz,
  getQuizResults,
  getQuizById,
} = quizService;
