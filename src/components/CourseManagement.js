import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faUsers,
  faClock,
  faBookOpen,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import adminService from "../services/adminService";
import {
  CourseTypeEnum,
  AgeGroupEnum,
  getCourseTypeLabel,
  getAgeGroupLabel,
  formatDuration,
  createCourseFormData,
} from "../models/courseModels";
import "./CourseManagement.css";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseType: CourseTypeEnum.BASIC_AWARENESS,
    ageGroup: AgeGroupEnum.ALL_AGES,
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getCourses();

      if (response.success && response.data) {
        const coursesData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
        setCourses(coursesData);
      } else {
        setError(response.message || "Failed to load courses");
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreate = () => {
    setFormData({
      title: "",
      description: "",
      courseType: CourseTypeEnum.BASIC_AWARENESS,
      ageGroup: AgeGroupEnum.ALL_AGES,
      image: null,
    });
    setSelectedCourse(null);
    setShowCreateModal(true);
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title || "",
      description: course.description || "",
      courseType: course.courseType || CourseTypeEnum.BASIC_AWARENESS,
      ageGroup: course.ageGroup || AgeGroupEnum.ALL_AGES,
      image: null,
    });
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showNotification("Title is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const courseFormData = createCourseFormData({
        Title: formData.title,
        Description: formData.description,
        CourseType:
          Object.keys(CourseTypeEnum)[formData.courseType - 1] ||
          "BasicAwareness",
        AgeGroup: formData.ageGroup,
        Image: formData.image,
      });

      let response;
      if (selectedCourse) {
        response = await adminService.updateCourse(
          selectedCourse.courseId,
          courseFormData
        );
      } else {
        response = await adminService.createCourse(courseFormData);
      }

      if (response.success) {
        showNotification(
          selectedCourse
            ? "Course updated successfully"
            : "Course created successfully",
          "success"
        );
        setShowCreateModal(false);
        setShowEditModal(false);
        loadCourses();
      } else {
        showNotification(
          response.message || "Operation failed",
          "error"
        );
      }
    } catch (err) {
      console.error("Error saving course:", err);
      showNotification(
        "Failed to save course. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteCourse(
        course.courseId
      );

      if (response.success) {
        showNotification("Course deleted successfully", "success");
        loadCourses();
      } else {
        showNotification(
          response.message || "Failed to delete course",
          "error"
        );
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      showNotification(
        "Failed to delete course. Please try again.",
        "error"
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="course-management-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="course-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <FontAwesomeIcon
            icon={
              notification.type === "success"
                ? faCheckCircle
                : faExclamationTriangle
            }
          />
          <span>{notification.message}</span>
          <button
            onClick={() =>
              setNotification({ show: false, message: "", type: "" })
            }>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      <div className="course-management-header">
        <h2>Course Management</h2>
        <button onClick={handleCreate} className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} />
          Create Course
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button onClick={loadCourses} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.courseId}
              className="course-management-card">
              <div className="course-image">
                <img
                  src={
                    course.imageUrl ||
                    `https://placehold.co/300x200/e8f5e9/2D7DD2?text=${encodeURIComponent(
                      course.title
                    )}`
                  }
                  alt={course.title}
                />
                <div className="course-status">
                  {course.isPublished ? (
                    <span className="status-published">
                      Published
                    </span>
                  ) : (
                    <span className="status-draft">Draft</span>
                  )}
                </div>
              </div>

              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">
                  {course.description}
                </p>

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
                  <span className="course-chapters">
                    <FontAwesomeIcon icon={faBookOpen} />
                    {course.chapters?.length || 0} chapters
                  </span>
                </div>

                <div className="course-stats">
                  <span>
                    <FontAwesomeIcon icon={faEye} />
                    {course.viewCount || 0} views
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faUsers} />
                    {course.courseEnrollments?.length || 0} enrolled
                  </span>
                </div>

                <div className="course-actions">
                  <button
                    onClick={() => handleEdit(course)}
                    className="btn btn-secondary btn-small">
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="btn btn-danger btn-small">
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <FontAwesomeIcon icon={faBookOpen} size="3x" />
            <h3>No courses found</h3>
            <p>Create your first course to get started.</p>
            <button
              onClick={handleCreate}
              className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              Create Course
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {selectedCourse ? "Edit Course" : "Create New Course"}
              </h3>
              <button onClick={closeModal} className="modal-close">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={2000}
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="courseType">Course Type *</label>
                  <select
                    id="courseType"
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}>
                    {Object.entries(CourseTypeEnum).map(
                      ([key, value]) => (
                        <option key={key} value={value}>
                          {getCourseTypeLabel(value)}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ageGroup">Age Group *</label>
                  <select
                    id="ageGroup"
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}>
                    {Object.entries(AgeGroupEnum).map(
                      ([key, value]) => (
                        <option key={key} value={value}>
                          {getAgeGroupLabel(value)}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Course Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                  disabled={submitting}
                />
                <small>
                  Recommended size: 600x400px. Max size: 5MB
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                  disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}>
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      {selectedCourse ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {selectedCourse
                        ? "Update Course"
                        : "Create Course"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
