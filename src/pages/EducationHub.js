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
    title: "Nhận Biết Ma Túy Cho Phụ Huynh",
    description:
      "Học cách nhận biết các loại ma túy phổ biến và tác động của chúng để giúp bảo vệ con cái bạn.",
    level: "Cơ bản",
    duration: "2 giờ",
    category: "parents",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Parent+Education",
  },
  {
    id: 2,
    title: "Giao Tiếp Hiệu Quả Với Thanh Thiếu Niên",
    description:
      "Phát triển kỹ năng thảo luận về lạm dụng chất gây nghiện với thanh thiếu niên theo cách không đối đầu.",
    level: "Trung cấp",
    duration: "3 giờ",
    category: "parents",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Teen+Communication",
  },
  {
    id: 3,
    title: "Hiểu Về Áp Lực Bạn Bè",
    description:
      "Dành cho học sinh: Học các chiến lược để nhận biết và chống lại áp lực tiêu cực từ bạn bè.",
    level: "Cơ bản",
    duration: "1.5 giờ",
    category: "students",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Peer+Pressure",
  },
  {
    id: 4,
    title: "Cơ Chế Đối Phó Lành Mạnh",
    description:
      "Khám phá những cách tích cực để đối phó với căng thẳng và lo âu mà không cần dùng đến chất gây nghiện.",
    level: "Cơ bản",
    duration: "2 giờ",
    category: "students",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Healthy+Coping",
  },
  {
    id: 5,
    title: "Chiến Lược Can Thiệp Trong Lớp Học",
    description:
      "Dành cho giáo viên: Học cách nhận biết học sinh có nguy cơ và cung cấp hỗ trợ phù hợp.",
    level: "Nâng cao",
    duration: "4 giờ",
    category: "teachers",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Classroom+Strategies",
  },
  {
    id: 6,
    title: "Tạo Môi Trường Học Đường Hỗ Trợ",
    description:
      "Phát triển chiến lược để nuôi dưỡng một văn hóa không ma túy trong môi trường giáo dục.",
    level: "Trung cấp",
    duration: "3 giờ",
    category: "teachers",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=School+Environment",
  },
];

// Surveys data
const surveysData = [
  {
    id: 1,
    title: "Khảo Sát ASSIST",
    description:
      "Bài kiểm tra sàng lọc về rượu, thuốc lá và chất gây nghiện - xác định mức độ rủi ro của bạn.",
    duration: "10 phút",
    questions: 8,
    link: "/education/surveys/assist",
  },
  {
    id: 2,
    title: "Khảo Sát CRAFFT",
    description:
      "Công cụ sàng lọc cho thanh thiếu niên để đánh giá hành vi sử dụng rượu và ma túy có nguy cơ.",
    duration: "5 phút",
    questions: 6,
    link: "/education/surveys/crafft",
  },
  {
    id: 3,
    title: "Đánh Giá Trước Chương Trình",
    description:
      "Đánh giá kiến thức của bạn trước khi tham gia chương trình phòng ngừa.",
    duration: "15 phút",
    questions: 15,
    link: "/education/surveys/pre-program",
  },
  {
    id: 4,
    title: "Đánh Giá Sau Chương Trình",
    description:
      "Đo lường tiến bộ của bạn sau khi hoàn thành chương trình phòng ngừa.",
    duration: "15 phút",
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
          <h1 className="animated-header">Trung Tâm Giáo Dục</h1>
          <p className="animated-subheader">
            Truy cập khóa học, tài nguyên và đánh giá để củng cố kiến
            thức phòng ngừa ma túy
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
            <FontAwesomeIcon icon={faBook} /> Khóa Học
          </button>
          <button
            className={`tab-btn ${
              activeTab === "surveys" ? "active" : ""
            }`}
            onClick={() => setActiveTab("surveys")}>
            <FontAwesomeIcon icon={faClipboardCheck} /> Khảo Sát &
            Đánh Giá
          </button>
        </div>

        {activeTab === "courses" && (
          <div className="courses-section">
            <div className="filters-bar">
              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
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
                  <FontAwesomeIcon icon={faFilter} /> Lọc theo:
                </span>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${
                      selectedCategory === "all" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("all")}>
                    Tất Cả
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "students" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("students")}>
                    Cho Học Sinh
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "parents" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("parents")}>
                    Cho Phụ Huynh
                  </button>
                  <button
                    className={`filter-btn ${
                      selectedCategory === "teachers" ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange("teachers")}>
                    Cho Giáo Viên
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
                        Bắt Đầu Khóa Học
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>Không tìm thấy khóa học</h3>
                <p>
                  Hãy điều chỉnh tìm kiếm hoặc bộ lọc để tìm thấy
                  những gì bạn đang tìm kiếm.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "surveys" && (
          <div className="surveys-section">
            <div className="intro-card card secondary-bg">
              <h2>Tại Sao Nên Làm Bài Tự Đánh Giá?</h2>
              <p>
                Các bài tự đánh giá giúp xác định các yếu tố rủi ro
                tiềm ẩn và cung cấp các khuyến nghị được cá nhân hóa
                cho việc giáo dục và hỗ trợ. Các câu trả lời của bạn
                được bảo mật và có thể hướng dẫn hành trình phòng ngừa
                của bạn.
              </p>
            </div>

            <h2 className="section-title">
              Các Bài Đánh Giá Hiện Có
            </h2>

            <div className="surveys-grid">
              {surveysData.map((survey) => (
                <div className="survey-card card" key={survey.id}>
                  <div className="survey-content">
                    <h3>{survey.title}</h3>
                    <p>{survey.description}</p>
                    <div className="survey-meta">
                      <span>{survey.duration}</span>
                      <span>{survey.questions} câu hỏi</span>
                    </div>
                    <Link to={survey.link} className="survey-link">
                      Làm Khảo Sát{" "}
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
