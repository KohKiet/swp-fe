// Mock data for testing when backend API is down
export const mockCourseData = {
  id: "mock-course-id",
  title: "Mock Course Title",
  description: "This is a mock course for testing purposes",
  imageUrl: "https://via.placeholder.com/400x200",
  duration: 120,
  level: "Beginner",
  category: "Technology",
  instructor: "Mock Instructor",
  chapters: [
    {
      id: "chapter-1",
      title: "Chapter 1: Introduction",
      description: "Introduction to the course",
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1: Getting Started",
          description: "Learn the basics",
          duration: 15,
          type: "video",
        },
        {
          id: "lesson-2",
          title: "Lesson 2: Basic Concepts",
          description: "Understanding basic concepts",
          duration: 20,
          type: "text",
        },
      ],
    },
    {
      id: "chapter-2",
      title: "Chapter 2: Advanced Topics",
      description: "Advanced concepts and techniques",
      lessons: [
        {
          id: "lesson-3",
          title: "Lesson 3: Advanced Techniques",
          description: "Master advanced techniques",
          duration: 25,
          type: "video",
        },
      ],
    },
  ],
};

export const mockProgressData = {
  success: true,
  data: {
    courses: [
      {
        courseId: "mock-course-id",
        completionPercentage: 0,
        isCompleted: false,
        lastAccessed: new Date().toISOString(),
      },
    ],
  },
};

export const mockQuizData = {
  id: "mock-quiz-id",
  title: "Mock Quiz",
  description: "A mock quiz for testing",
  timeLimitMinutes: 30,
  passingScore: 70,
  questions: [
    {
      id: "question-1",
      content: "What is the capital of France?",
      answers: [
        { id: "answer-1", answerText: "London", isCorrect: false },
        { id: "answer-2", answerText: "Paris", isCorrect: true },
        { id: "answer-3", answerText: "Berlin", isCorrect: false },
        { id: "answer-4", answerText: "Madrid", isCorrect: false },
      ],
    },
  ],
};
