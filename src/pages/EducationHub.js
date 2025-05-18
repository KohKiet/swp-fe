import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faChevronRight,
  faBook,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./EducationHub.css";

// Mock data for courses
const coursesData = [
  {
    id: 1,
    title: "Drug Recognition for Parents",
    description:
      "Learn to identify common drugs and their effects to help protect your children.",
    level: "Beginner",
    duration: "2 hours",
    category: "parents",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Parent+Education",
  },
  {
    id: 2,
    title: "Effective Communication with Teens",
    description:
      "Develop skills to discuss substance abuse with teenagers in a non-confrontational way.",
    level: "Intermediate",
    duration: "3 hours",
    category: "parents",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Teen+Communication",
  },
  {
    id: 3,
    title: "Understanding Peer Pressure",
    description:
      "For students: Learn strategies to recognize and resist negative peer pressure.",
    level: "Beginner",
    duration: "1.5 hours",
    category: "students",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Peer+Pressure",
  },
  {
    id: 4,
    title: "Healthy Coping Mechanisms",
    description:
      "Discover positive ways to deal with stress and anxiety without turning to substances.",
    level: "Beginner",
    duration: "2 hours",
    category: "students",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Healthy+Coping",
  },
  {
    id: 5,
    title: "Classroom Intervention Strategies",
    description:
      "For teachers: Learn how to identify at-risk students and provide appropriate support.",
    level: "Advanced",
    duration: "4 hours",
    category: "teachers",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Classroom+Strategies",
  },
  {
    id: 6,
    title: "Creating a Supportive School Environment",
    description:
      "Develop strategies to foster a drug-free culture in educational settings.",
    level: "Intermediate",
    duration: "3 hours",
    category: "teachers",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=School+Environment",
  },
];

// Surveys data
const surveysData = [
  {
    id: 1,
    title: "ASSIST Survey",
    description:
      "The Alcohol, Smoking and Substance Involvement Screening Test - identify your risk level.",
    duration: "10 minutes",
    questions: 8,
    link: "/education/surveys/assist",
  },
  {
    id: 2,
    title: "CRAFFT Survey",
    description:
      "A screening tool for adolescents to assess risky alcohol and drug use behaviors.",
    duration: "5 minutes",
    questions: 6,
    link: "/education/surveys/crafft",
  },
  {
    id: 3,
    title: "Pre-Program Assessment",
    description:
      "Evaluate your knowledge before taking a prevention program.",
    duration: "15 minutes",
    questions: 15,
    link: "/education/surveys/pre-program",
  },
  {
    id: 4,
    title: "Post-Program Evaluation",
    description:
      "Measure your progress after completing a prevention program.",
    duration: "15 minutes",
    questions: 15,
    link: "/education/surveys/post-program",
  },
];

const EducationHub = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupParam = queryParams.get("group");

  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    groupParam || "all"
  );
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory]);

  const filterCourses = () => {
    let filtered = coursesData;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterCourses();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="education-hub">
      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Education Hub</h1>
          <p>
            Access courses, resources, and assessments to strengthen
            drug prevention knowledge
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${
              activeTab === "courses" ? "active" : ""
            }`}
            onClick={() => setActiveTab("courses")}>
            <FontAwesomeIcon icon={faBook} /> Courses
          </button>
          <button
            className={`tab-btn ${
              activeTab === "surveys" ? "active" : ""
            }`}
            onClick={() => setActiveTab("surveys")}>
            <FontAwesomeIcon icon={faClipboardCheck} /> Surveys &
            Assessments
          </button>
        </div>

        {activeTab === "courses" && (
          <div className="courses-section">
            <div className="filters-bar">
              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>

              <div className="category-filters">
                <span className="filter-label">
                  <FontAwesomeIcon icon={faFilter} /> Filter by:
                </span>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${
                      selectedCategory === "all" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("all")}>
                    All
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "students" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("students")}>
                    For Students
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "parents" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("parents")}>
                    For Parents
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "teachers" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("teachers")}>
                    For Teachers
                  </button>
                </div>
              </div>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid">
                {filteredCourses.map((course) => (
                  <div className="course-card card" key={course.id}>
                    <div className="course-image">
                      <img src={course.image} alt={course.title} />
                      <div className="course-level">
                        {course.level}
                      </div>
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p className="course-description">
                        {course.description}
                      </p>
                      <div className="course-meta">
                        <span className="course-duration">
                          {course.duration}
                        </span>
                      </div>
                      <Link
                        to={`/education/courses/${course.id}`}
                        className="btn btn-primary">
                        Start Course
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>No courses found</h3>
                <p>
                  Try adjusting your search or filters to find what
                  you're looking for.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "surveys" && (
          <div className="surveys-section">
            <div className="intro-card card secondary-bg">
              <h2>Why Take a Self-Assessment?</h2>
              <p>
                Self-assessments help identify potential risk factors
                and provide personalized recommendations for education
                and support. Your responses are confidential and can
                guide your prevention journey.
              </p>
            </div>

            <h2 className="section-title">Available Assessments</h2>

            <div className="surveys-grid">
              {surveysData.map((survey) => (
                <div className="survey-card card" key={survey.id}>
                  <div className="survey-content">
                    <h3>{survey.title}</h3>
                    <p>{survey.description}</p>
                    <div className="survey-meta">
                      <span>{survey.duration}</span>
                      <span>{survey.questions} questions</span>
                    </div>
                    <Link to={survey.link} className="survey-link">
                      Take Survey{" "}
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationHub;
