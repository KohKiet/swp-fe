// Course Type Enum - Updated to match new architecture
export const CourseTypeEnum = {
  BASIC_AWARENESS: 1,
  PREVENTION: 2,
  INTERVENTION: 3,
  RECOVERY_SUPPORT: 4,
  PROFESSIONAL_TRAINING: 5,
  FAMILY_EDUCATION: 6,
};

export const CourseTypeLabels = {
  [CourseTypeEnum.BASIC_AWARENESS]: "Basic Awareness",
  [CourseTypeEnum.PREVENTION]: "Prevention",
  [CourseTypeEnum.INTERVENTION]: "Intervention",
  [CourseTypeEnum.RECOVERY_SUPPORT]: "Recovery Support",
  [CourseTypeEnum.PROFESSIONAL_TRAINING]: "Professional Training",
  [CourseTypeEnum.FAMILY_EDUCATION]: "Family Education",
};

// Age Group Enum - Updated to match new architecture (Teenagers 15-21, Adults 22-70)
export const AgeGroupEnum = {
  TEENAGERS: 1, // 15-21 years
  ADULTS: 2, // 22-70 years
};

export const AgeGroupLabels = {
  [AgeGroupEnum.TEENAGERS]: "Teenagers (15-21)",
  [AgeGroupEnum.ADULTS]: "Adults (22-70)",
};

// Enrollment Status Enum
export const EnrollmentStatusEnum = {
  ENROLLED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  DROPPED: 4,
  SUSPENDED: 5,
};

export const EnrollmentStatusLabels = {
  [EnrollmentStatusEnum.ENROLLED]: "Enrolled",
  [EnrollmentStatusEnum.IN_PROGRESS]: "In Progress",
  [EnrollmentStatusEnum.COMPLETED]: "Completed",
  [EnrollmentStatusEnum.DROPPED]: "Dropped",
  [EnrollmentStatusEnum.SUSPENDED]: "Suspended",
};

// Quiz Question Types
export const QuestionTypeEnum = {
  MULTIPLE_CHOICE: 1,
  TRUE_FALSE: 2,
  SINGLE_SELECT: 3,
};

export const QuestionTypeLabels = {
  [QuestionTypeEnum.MULTIPLE_CHOICE]: "Multiple Choice",
  [QuestionTypeEnum.TRUE_FALSE]: "True/False",
  [QuestionTypeEnum.SINGLE_SELECT]: "Single Select",
};

// API Response Interface (JavaScript Style)
export const createApiResponse = (
  success,
  data = null,
  message = ""
) => ({
  success,
  message,
  data,
});

// Course Model Factory - Updated with new fields
export const createCourse = ({
  courseId = "",
  title = "",
  description = "",
  imageUrl = "",
  courseType = CourseTypeEnum.BASIC_AWARENESS,
  ageGroup = AgeGroupEnum.ADULTS,
  authorId = "",
  categoryId = "",
  isPublished = false,
  estimatedDuration = 0,
  createdAt = new Date(),
  updatedAt = null,
  publishedAt = null,
  viewCount = 0,
  isFeatured = false,
  author = null,
  authorName = "",
  category = null,
  chapters = [],
  courseEnrollments = [],
  courseSubstances = [],
  completionRequirements = {
    minimumTimeMinutes: 30,
    minimumScore: 70,
    allLessonsRequired: true,
    allQuizzesRequired: true,
  },
} = {}) => ({
  courseId,
  title,
  description,
  imageUrl,
  courseType,
  ageGroup,
  authorId,
  categoryId,
  isPublished,
  estimatedDuration,
  createdAt,
  updatedAt,
  publishedAt,
  viewCount,
  isFeatured,
  author,
  authorName,
  category,
  chapters,
  courseEnrollments,
  courseSubstances,
  completionRequirements,
});

// Chapter Model Factory
export const createChapter = ({
  chapterId = "",
  courseId = "",
  title = "",
  description = "",
  chapterOrder = 1,
  lessons = [],
  isCompleted = false,
} = {}) => ({
  chapterId,
  courseId,
  title,
  description,
  chapterOrder,
  lessons,
  isCompleted,
});

// Lesson Model Factory - Enhanced with completion tracking
export const createLesson = ({
  lessonId = "",
  chapterId = "",
  title = "",
  description = "",
  content = "",
  videoUrl = "",
  lessonOrder = 1,
  isCompleted = false,
  timeSpentMinutes = 0,
  viewCount = 0,
  media = [],
  quizzes = [],
  notes = "",
} = {}) => ({
  lessonId,
  chapterId,
  title,
  description,
  content,
  videoUrl,
  lessonOrder,
  isCompleted,
  timeSpentMinutes,
  viewCount,
  media,
  quizzes,
  notes,
});

// Quiz Model Factory - Enhanced with new requirements
export const createQuiz = ({
  quizId = "",
  lessonId = "",
  title = "",
  description = "",
  timeLimitMinutes = 30,
  passingScore = 70,
  maxAttempts = 3,
  questions = [],
  attempts = 0,
  bestScore = 0,
  isCompleted = false,
} = {}) => ({
  quizId,
  lessonId,
  title,
  description,
  timeLimitMinutes,
  passingScore,
  maxAttempts,
  questions,
  attempts,
  bestScore,
  isCompleted,
});

// Question Model Factory
export const createQuestion = ({
  questionId = "",
  quizId = "",
  questionText = "",
  questionOrder = 1,
  questionType = QuestionTypeEnum.MULTIPLE_CHOICE,
  answers = [],
  correctAnswerId = "",
  explanation = "",
} = {}) => ({
  questionId,
  quizId,
  questionText,
  questionOrder,
  questionType,
  answers,
  correctAnswerId,
  explanation,
});

// Answer Model Factory
export const createAnswer = ({
  answerId = "",
  questionId = "",
  answerText = "",
  isCorrect = false,
  answerOrder = 1,
} = {}) => ({
  answerId,
  questionId,
  answerText,
  isCorrect,
  answerOrder,
});

// Progress Model Factory - Enhanced for comprehensive tracking
export const createProgress = ({
  progressId = "",
  userId = "",
  courseId = "",
  chapterId = "",
  lessonId = "",
  percent = 0,
  isCompleted = false,
  timeSpentMinutes = 0,
  viewCount = 0,
  notes = "",
  completedAt = null,
  lastAccessedAt = new Date(),
} = {}) => ({
  progressId,
  userId,
  courseId,
  chapterId,
  lessonId,
  percent,
  isCompleted,
  timeSpentMinutes,
  viewCount,
  notes,
  completedAt,
  lastAccessedAt,
});

// Course Enrollment Model Factory - Enhanced with more status tracking
export const createCourseEnrollment = ({
  enrollmentId = "",
  userId = "",
  courseId = "",
  enrolledAt = new Date(),
  completedAt = null,
  status = EnrollmentStatusEnum.ENROLLED,
  progress = 0,
  timeSpentMinutes = 0,
  certificateIssued = false,
  certificateUrl = "",
} = {}) => ({
  enrollmentId,
  userId,
  courseId,
  enrolledAt,
  completedAt,
  status,
  progress,
  timeSpentMinutes,
  certificateIssued,
  certificateUrl,
});

// Quiz Result Model Factory
export const createQuizResult = ({
  resultId = "",
  quizId = "",
  userId = "",
  score = 0,
  totalQuestions = 0,
  correctAnswers = 0,
  timeSpentMinutes = 0,
  attempts = 1,
  passed = false,
  completedAt = new Date(),
  answers = [],
} = {}) => ({
  resultId,
  quizId,
  userId,
  score,
  totalQuestions,
  correctAnswers,
  timeSpentMinutes,
  attempts,
  passed,
  completedAt,
  answers,
});

// Form Data Helpers
export const createCourseFormData = ({
  Title = "",
  Description = "",
  CourseType = "BasicAwareness",
  AgeGroup = 2, // Adults by default
  CategoryId = "", // Add required CategoryId
  Image = null,
} = {}) => {
  const formData = new FormData();
  formData.append("Title", Title);
  if (Description) formData.append("Description", Description);
  formData.append("CourseType", CourseType);
  formData.append("AgeGroup", AgeGroup.toString());
  if (CategoryId) formData.append("CategoryId", CategoryId); // Add CategoryId to form data
  if (Image) formData.append("Image", Image);
  return formData;
};

export const createChapterData = ({
  CourseId = "",
  Title = "",
  Description = "",
  ChapterOrder = 1,
} = {}) => ({
  CourseId,
  Title,
  Description,
  ChapterOrder,
});

export const createLessonData = ({
  ChapterId = "",
  Title = "",
  Description = "",
  Content = "",
  VideoUrl = "",
  LessonOrder = 1,
  IsCompleted = false,
} = {}) => ({
  ChapterId,
  Title,
  Description,
  Content,
  VideoUrl,
  LessonOrder,
  IsCompleted,
});

export const createProgressData = ({
  UserId = "",
  CourseId = "",
  ChapterId = "",
  LessonId = "",
  Percent = 0,
  IsCompleted = false,
} = {}) => ({
  UserId,
  CourseId,
  ChapterId,
  LessonId,
  Percent,
  IsCompleted,
});

// Utility functions
export const getCourseTypeLabel = (type) =>
  CourseTypeLabels[type] || "Unknown";
export const getAgeGroupLabel = (ageGroup) =>
  AgeGroupLabels[ageGroup] || "Unknown";
export const getEnrollmentStatusLabel = (status) =>
  EnrollmentStatusLabels[status] || "Unknown";

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

export const calculateCourseProgress = (chapters) => {
  if (!chapters || chapters.length === 0) return 0;

  let totalLessons = 0;
  let completedLessons = 0;

  chapters.forEach((chapter) => {
    if (chapter.lessons) {
      totalLessons += chapter.lessons.length;
      completedLessons += chapter.lessons.filter(
        (lesson) => lesson.isCompleted
      ).length;
    }
  });

  return totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;
};

// Mapping functions for API responses
export const mapCourseTypeFromString = (courseTypeString) => {
  const mapping = {
    BasicAwareness: CourseTypeEnum.BASIC_AWARENESS,
    Prevention: CourseTypeEnum.PREVENTION,
    Intervention: CourseTypeEnum.INTERVENTION,
    RecoverySupport: CourseTypeEnum.RECOVERY_SUPPORT,
    ProfessionalTraining: CourseTypeEnum.PROFESSIONAL_TRAINING,
    FamilyEducation: CourseTypeEnum.FAMILY_EDUCATION,
  };
  return mapping[courseTypeString] || CourseTypeEnum.BASIC_AWARENESS;
};

export const mapAgeGroupFromString = (ageGroupString) => {
  const mapping = {
    Teenagers: AgeGroupEnum.TEENAGERS,
    Adults: AgeGroupEnum.ADULTS,
  };
  return mapping[ageGroupString] || AgeGroupEnum.ADULTS;
};
