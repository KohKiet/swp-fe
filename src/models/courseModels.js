// Course Type Enum
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

// Age Group Enum
export const AgeGroupEnum = {
  CHILDREN: 1,
  TEENAGERS: 2,
  YOUNG_ADULTS: 3,
  ADULTS: 4,
  ALL_AGES: 5,
};

export const AgeGroupLabels = {
  [AgeGroupEnum.CHILDREN]: "Children (6-12 years)",
  [AgeGroupEnum.TEENAGERS]: "Teenagers (13-17 years)",
  [AgeGroupEnum.YOUNG_ADULTS]: "Young Adults (18-25 years)",
  [AgeGroupEnum.ADULTS]: "Adults (26+ years)",
  [AgeGroupEnum.ALL_AGES]: "All Ages",
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

// Course Model Factory
export const createCourse = ({
  courseId = "",
  title = "",
  description = "",
  imageUrl = "",
  courseType = CourseTypeEnum.BASIC_AWARENESS,
  ageGroup = AgeGroupEnum.ALL_AGES,
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
  category = null,
  chapters = [],
  courseEnrollments = [],
  courseSubstances = [],
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
  category,
  chapters,
  courseEnrollments,
  courseSubstances,
});

// Chapter Model Factory
export const createChapter = ({
  chapterId = "",
  courseId = "",
  title = "",
  description = "",
  chapterOrder = 1,
  lessons = [],
} = {}) => ({
  chapterId,
  courseId,
  title,
  description,
  chapterOrder,
  lessons,
});

// Lesson Model Factory
export const createLesson = ({
  lessonId = "",
  chapterId = "",
  title = "",
  description = "",
  content = "",
  videoUrl = "",
  lessonOrder = 1,
  isCompleted = false,
  media = [],
  quizzes = [],
} = {}) => ({
  lessonId,
  chapterId,
  title,
  description,
  content,
  videoUrl,
  lessonOrder,
  isCompleted,
  media,
  quizzes,
});

// Progress Model Factory
export const createProgress = ({
  progressId = "",
  userId = "",
  courseId = "",
  chapterId = "",
  lessonId = "",
  percent = 0,
  isCompleted = false,
} = {}) => ({
  progressId,
  userId,
  courseId,
  chapterId,
  lessonId,
  percent,
  isCompleted,
});

// Course Enrollment Model Factory
export const createCourseEnrollment = ({
  enrollmentId = "",
  userId = "",
  courseId = "",
  enrollmentDate = new Date(),
  status = EnrollmentStatusEnum.ENROLLED,
  completionDate = null,
  progress = 0,
} = {}) => ({
  enrollmentId,
  userId,
  courseId,
  enrollmentDate,
  status,
  completionDate,
  progress,
});

// Form Data Helpers
export const createCourseFormData = ({
  Title = "",
  Description = "",
  CourseType = "BasicAwareness",
  AgeGroup = 5,
  Image = null,
} = {}) => {
  const formData = new FormData();
  formData.append("Title", Title);
  if (Description) formData.append("Description", Description);
  formData.append("CourseType", CourseType);
  formData.append("AgeGroup", AgeGroup.toString());
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
    Children: AgeGroupEnum.CHILDREN,
    Teenagers: AgeGroupEnum.TEENAGERS,
    YoungAdults: AgeGroupEnum.YOUNG_ADULTS,
    Adults: AgeGroupEnum.ADULTS,
    AllAges: AgeGroupEnum.ALL_AGES,
  };
  return mapping[ageGroupString] || AgeGroupEnum.ALL_AGES;
};
