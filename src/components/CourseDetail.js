import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faBookOpen,
  faClock,
  faUsers,
  faEye,
  faChevronDown,
  faChevronRight,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faUser,
  faCalendar,
  faStar,
  faDownload,
  faFilePdf,
  faFileAudio,
  faFileVideo,
  faComments,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import courseService from "../services/courseService";
import {
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
  calculateCourseProgress,
} from "../models/courseModels";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
      checkEnrollmentStatus();
    }
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await courseService.getPublicCourseById(
        courseId
      );

      if (response.success && response.data) {
        setCourse(response.data);

        // Calculate progress if user is enrolled
        if (response.data.chapters) {
          const courseProgress = calculateCourseProgress(
            response.data.chapters
          );
          setProgress(courseProgress);
        }

        // Auto-expand first chapter
        if (
          response.data.chapters &&
          response.data.chapters.length > 0
        ) {
          setExpandedChapters(
            new Set([response.data.chapters[0].chapterId])
          );
        }
      } else {
        setError(response.message || "Course not found");
      }
    } catch (err) {
      console.error("Error loading course details:", err);
      setError(
        "Failed to load course details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if token is valid format
  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      // Basic JWT format check (should have 3 parts separated by dots)
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Try to decode the payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      // If we can't decode it, it's probably not a valid JWT
      return false;
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        // User is not logged in or token is invalid/expired
        setIsEnrolled(false);
        if (token && !isTokenValid(token)) {
          // Clean up invalid token
          localStorage.removeItem("accessToken");
        }
        return;
      }

      const response = await courseService.isEnrolled(courseId);
      // The API returns the enrollment status directly
      setIsEnrolled(response === true || response.data === true);
    } catch (err) {
      console.error("Error checking enrollment status:", err);
      // If there's an authentication error, assume user is not enrolled
      if (err.message && err.message.includes("401")) {
        setIsEnrolled(false);
        // Clear invalid token
        localStorage.removeItem("accessToken");
      }
    }
  };

  const handleEnrollment = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        // Clean up invalid token if it exists
        if (token && !isTokenValid(token)) {
          localStorage.removeItem("accessToken");
        }
        navigate("/login", {
          state: { returnUrl: `/education/courses/${courseId}` },
        });
        return;
      }

      setEnrollmentLoading(true);

      if (isEnrolled) {
        await courseService.dropFromCourse(courseId);
        setIsEnrolled(false);
      } else {
        await courseService.enrollInCourse(courseId);
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error("Error with enrollment:", err);

      // Handle authentication errors
      if (err.message && err.message.includes("401")) {
        // Token is invalid, redirect to login
        localStorage.removeItem("accessToken");
        navigate("/login", {
          state: { returnUrl: `/education/courses/${courseId}` },
        });
        return;
      }

      setError("Failed to update enrollment. Please try again.");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
  };

  const startLearning = () => {
    // Find the first lesson in the first chapter
    if (course.chapters && course.chapters.length > 0) {
      const firstChapter = course.chapters.sort(
        (a, b) => a.chapterOrder - b.chapterOrder
      )[0];

      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons.sort(
          (a, b) => a.lessonOrder - b.lessonOrder
        )[0];

        // Expand the first chapter
        setExpandedChapters(new Set([firstChapter.chapterId]));
        // Select the first lesson
        setCurrentLesson(firstLesson);
      }
    }
  };

  const getMediaIcon = (mediaType) => {
    switch (mediaType?.toLowerCase()) {
      case "video":
        return faFileVideo;
      case "audio":
        return faFileAudio;
      case "document":
      case "pdf":
        return faFilePdf;
      case "youtube":
        return faFileVideo;
      default:
        return faDownload;
    }
  };

  const shareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-error">
        <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
        <h2>Course Not Found</h2>
        <p>{error || "The requested course could not be found."}</p>
        <button
          onClick={() => navigate("/education")}
          className="btn btn-primary">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="course-detail">
      {/* Course Header */}
      <div className="course-header">
        <div className="course-hero">
          <div className="course-hero-content">
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>

            <div className="course-meta">
              <span className="course-type">
                {getCourseTypeLabel(course.courseType)}
              </span>
              <span className="course-age-group">
                <FontAwesomeIcon icon={faUsers} />
                {getAgeGroupLabel(course.ageGroup)}
              </span>
              <span className="course-duration">
                <FontAwesomeIcon icon={faClock} />
                {formatDuration(course.estimatedDuration)}
              </span>
              {course.viewCount > 0 && (
                <span className="course-views">
                  <FontAwesomeIcon icon={faEye} />
                  {course.viewCount} views
                </span>
              )}
            </div>

            <div className="course-actions">
              <button
                onClick={handleEnrollment}
                disabled={enrollmentLoading}
                className={`btn ${
                  isEnrolled ? "btn-secondary" : "btn-primary"
                } btn-large`}>
                {enrollmentLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : isEnrolled ? (
                  "Drop Course"
                ) : (
                  "Enroll Now"
                )}
              </button>

              <button onClick={shareUrl} className="btn btn-outline">
                <FontAwesomeIcon icon={faShare} />
                Share
              </button>
            </div>

            {isEnrolled && progress > 0 && (
              <div className="course-progress">
                <div className="progress-header">
                  <span>Your Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="course-hero-image">
            <img
              src={
                course.imageUrl ||
                `https://placehold.co/600x400/e8f5e9/2D7DD2?text=${encodeURIComponent(
                  course.title
                )}`
              }
              alt={course.title}
            />
            {course.isFeatured && (
              <div className="featured-badge">Featured Course</div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-content">
          {/* Course Sidebar */}
          <div className="course-sidebar">
            <div className="course-info-card">
              <h3>Course Information</h3>

              {course.author && (
                <div className="info-item">
                  <FontAwesomeIcon icon={faUser} />
                  <div>
                    <strong>Instructor</strong>
                    <p>
                      {course.author.firstName}{" "}
                      {course.author.lastName}
                    </p>
                  </div>
                </div>
              )}

              <div className="info-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <strong>Created</strong>
                  <p>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {course.publishedAt && (
                <div className="info-item">
                  <FontAwesomeIcon icon={faCalendar} />
                  <div>
                    <strong>Published</strong>
                    <p>
                      {new Date(
                        course.publishedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="info-item">
                <FontAwesomeIcon icon={faBookOpen} />
                <div>
                  <strong>Chapters</strong>
                  <p>{course.chapters?.length || 0}</p>
                </div>
              </div>

              <div className="info-item">
                <FontAwesomeIcon icon={faPlay} />
                <div>
                  <strong>Lessons</strong>
                  <p>
                    {course.chapters?.reduce(
                      (total, chapter) =>
                        total + (chapter.lessons?.length || 0),
                      0
                    ) || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="course-curriculum">
              <h3>Course Curriculum</h3>

              {isEnrolled &&
                course.chapters &&
                course.chapters.length > 0 && (
                  <p className="curriculum-note">
                    💡 Click on any lesson below to start learning
                  </p>
                )}

              {course.chapters && course.chapters.length > 0 ? (
                <div className="chapters-list">
                  {course.chapters
                    .sort((a, b) => a.chapterOrder - b.chapterOrder)
                    .map((chapter) => (
                      <div
                        key={chapter.chapterId}
                        className="chapter-item">
                        <div
                          className="chapter-header"
                          onClick={() =>
                            toggleChapter(chapter.chapterId)
                          }>
                          <FontAwesomeIcon
                            icon={
                              expandedChapters.has(chapter.chapterId)
                                ? faChevronDown
                                : faChevronRight
                            }
                          />
                          <span className="chapter-title">
                            {chapter.title}
                          </span>
                          <span className="chapter-lesson-count">
                            {chapter.lessons?.length || 0} lessons
                          </span>
                        </div>

                        {expandedChapters.has(chapter.chapterId) &&
                          chapter.lessons && (
                            <div className="lessons-list">
                              {chapter.lessons
                                .sort(
                                  (a, b) =>
                                    a.lessonOrder - b.lessonOrder
                                )
                                .map((lesson) => (
                                  <div
                                    key={lesson.lessonId}
                                    className={`lesson-item ${
                                      currentLesson?.lessonId ===
                                      lesson.lessonId
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      selectLesson(lesson)
                                    }>
                                    <FontAwesomeIcon
                                      icon={
                                        lesson.isCompleted
                                          ? faCheckCircle
                                          : faPlay
                                      }
                                      className={
                                        lesson.isCompleted
                                          ? "completed"
                                          : ""
                                      }
                                    />
                                    <span className="lesson-title">
                                      {lesson.title}
                                    </span>
                                    {lesson.videoUrl && (
                                      <FontAwesomeIcon
                                        icon={faPlay}
                                        className="media-icon"
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="no-content">
                  No curriculum available yet.
                </p>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="course-main">
            {currentLesson ? (
              <div className="lesson-content">
                <div className="lesson-header">
                  <h2>{currentLesson.title}</h2>
                  <button
                    onClick={() => setCurrentLesson(null)}
                    className="btn btn-secondary btn-small">
                    Back to Overview
                  </button>
                </div>

                {currentLesson.description && (
                  <p className="lesson-description">
                    {currentLesson.description}
                  </p>
                )}

                {currentLesson.videoUrl && (
                  <div className="lesson-video">
                    <video controls width="100%">
                      <source
                        src={currentLesson.videoUrl}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div className="lesson-text-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentLesson.content,
                    }}
                  />
                </div>

                {currentLesson.media &&
                  currentLesson.media.length > 0 && (
                    <div className="lesson-attachments">
                      <h4>Attachments</h4>
                      <div className="attachments-list">
                        {currentLesson.media.map((media, index) => (
                          <a
                            key={index}
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-item">
                            <FontAwesomeIcon
                              icon={getMediaIcon(media.type)}
                            />
                            <span>
                              {media.name ||
                                `Attachment ${index + 1}`}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="course-overview">
                <h2>Course Overview</h2>

                <div className="overview-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: course.description,
                    }}
                  />
                </div>

                {course.chapters && course.chapters.length > 0 && (
                  <div className="chapters-overview">
                    <h3>What You'll Learn</h3>
                    {course.chapters
                      .sort((a, b) => a.chapterOrder - b.chapterOrder)
                      .map((chapter) => (
                        <div
                          key={chapter.chapterId}
                          className="chapter-overview">
                          <h4>{chapter.title}</h4>
                          {chapter.description && (
                            <p>{chapter.description}</p>
                          )}
                          {chapter.lessons &&
                            chapter.lessons.length > 0 && (
                              <ul className="lessons-overview">
                                {chapter.lessons
                                  .sort(
                                    (a, b) =>
                                      a.lessonOrder - b.lessonOrder
                                  )
                                  .map((lesson) => (
                                    <li key={lesson.lessonId}>
                                      {lesson.title}
                                      {lesson.description && (
                                        <span className="lesson-description">
                                          - {lesson.description}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                              </ul>
                            )}
                        </div>
                      ))}
                  </div>
                )}

                {isEnrolled &&
                  course.chapters &&
                  course.chapters.length > 0 && (
                    <div className="start-learning-cta">
                      <h3>Ready to begin?</h3>
                      <p>
                        Start with the first lesson and work your way
                        through the course at your own pace.
                      </p>
                      <button
                        onClick={startLearning}
                        className="btn btn-primary btn-large">
                        <FontAwesomeIcon icon={faPlay} />
                        Start Learning
                      </button>
                    </div>
                  )}

                {!isEnrolled && (
                  <div className="enrollment-cta">
                    <h3>Ready to start learning?</h3>
                    <p>
                      Enroll now to access all course content and
                      track your progress.
                    </p>
                    <button
                      onClick={handleEnrollment}
                      disabled={enrollmentLoading}
                      className="btn btn-primary btn-large">
                      {enrollmentLoading ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        "Enroll Now"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal">
          <div className="share-modal-content">
            <FontAwesomeIcon icon={faCheckCircle} />
            <p>Link copied to clipboard!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
