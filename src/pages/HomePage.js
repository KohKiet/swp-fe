import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBook,
  faUsers,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Box } from "@mui/material";
import {
  SchoolOutlined,
  CalendarTodayOutlined,
  AssessmentOutlined,
  ExploreOutlined,
} from "@mui/icons-material";
import "./HomePage.css";

// Mock data for our application
const blogPosts = [
  {
    id: 1,
    title: "Hành Trình Hồi Phục Của Tôi: Một Câu Chuyện Cá Nhân",
    excerpt:
      "Làm thế nào mà sự hỗ trợ và giáo dục từ cộng đồng đã thay đổi cuộc sống của tôi và giúp tôi vượt qua nghiện ngập.",
    author: "Nguyễn Văn B",
    date: "15/05/2025",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Recovery+Story",
  },
  {
    id: 2,
    title:
      "Hiểu Về Các Yếu Tố Rủi Ro Trong Việc Sử Dụng Ma Túy Ở Thanh Thiếu Niên",
    excerpt:
      "Tìm hiểu về các yếu tố môi trường và cá nhân có thể dẫn đến lạm dụng chất gây nghiện ở thanh thiếu niên.",
    author: "TS. Trần Văn Nam",
    date: "02/06/2023",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Teen+Education",
  },
  {
    id: 3,
    title:
      "Làm Thế Nào Để Các Trường Học Triển Khai Chương Trình Phòng Ngừa Hiệu Quả",
    excerpt:
      "Hướng dẫn cho các nhà giáo dục về việc tạo ra môi trường hỗ trợ ngăn chặn lạm dụng chất gây nghiện.",
    author: "GS. Lê Thị Hương",
    date: "28/04/2023",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=School+Programs",
  },
];

const courseCategories = [
  {
    id: 1,
    title: "Cho Học Sinh",
    description:
      "Giáo dục phù hợp với lứa tuổi về nhận thức ma túy, chống lại áp lực đồng trang lứa và lựa chọn lành mạnh.",
    icon: faBook,
    link: "/education?group=students",
  },
  {
    id: 2,
    title: "Cho Phụ Huynh",
    description:
      "Học cách nói chuyện với con cái về ma túy và nhận biết các dấu hiệu cảnh báo của việc lạm dụng chất gây nghiện.",
    icon: faUsers,
    link: "/education?group=parents",
  },
  {
    id: 3,
    title: "Cho Giáo Viên",
    description:
      "Tài nguyên và chiến lược để giáo dục học sinh về phòng chống ma túy và thúc đẩy môi trường lành mạnh.",
    icon: faChalkboardTeacher,
    link: "/education?group=teachers",
  },
];

const HomePage = () => {
  // Refs for sections that will animate on scroll
  const categorySectionRef = useRef(null);
  const blogSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);

  useEffect(() => {
    // Initialize intersection observer for fade-in animations
    const observerOptions = {
      root: null, // Use viewport as root
      rootMargin: "0px",
      threshold: 0.1, // Trigger when at least 10% of the element is visible
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add the 'visible' class to all fade-in elements in this section
          const fadeElements =
            entry.target.querySelectorAll(".fade-in");
          fadeElements.forEach((el) => {
            el.classList.add("visible");
          });
          // Once animation is triggered, we don't need to observe this section anymore
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersect,
      observerOptions
    );

    // Observe each section
    if (categorySectionRef.current)
      observer.observe(categorySectionRef.current);
    if (blogSectionRef.current)
      observer.observe(blogSectionRef.current);
    if (statsSectionRef.current)
      observer.observe(statsSectionRef.current);
    if (ctaSectionRef.current)
      observer.observe(ctaSectionRef.current);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              Trao Quyền Cho Cộng Đồng Vì Tương Lai Không Ma Túy
            </h1>
            <p>
              Chúng tôi cung cấp giáo dục, tài nguyên và hỗ trợ để
              giúp cá nhân và cộng đồng phòng ngừa lạm dụng chất gây
              nghiện và thúc đẩy cuộc sống khỏe mạnh hơn.
            </p>
            <Box
              className="hero-buttons"
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}>
              <Button
                component={Link}
                to="/education"
                variant="contained"
                size="medium"
                startIcon={<SchoolOutlined />}
                sx={{
                  background:
                    "linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)",
                  color: "white",
                  borderRadius: "25px",
                  padding: "8px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(63, 81, 181, 0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #303f9f 30%, #3f51b5 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(63, 81, 181, 0.4)",
                  },
                }}>
                Khám Phá Khóa Học
              </Button>
              <Button
                component={Link}
                to="/counseling"
                variant="outlined"
                size="medium"
                startIcon={<CalendarTodayOutlined />}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "25px",
                  padding: "8px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "none",
                  backdropFilter: "blur(10px)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderColor: "white",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(255, 255, 255, 0.2)",
                  },
                }}>
                Đặt Lịch Tư Vấn
              </Button>
            </Box>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="course-categories" ref={categorySectionRef}>
        <div className="container">
          <h2 className="section-title fade-in">
            Chương Trình Giáo Dục
          </h2>
          <p className="section-subtitle fade-in">
            Chúng tôi cung cấp các chương trình phòng chống ma túy
            dành cho mọi đối tượng
          </p>

          <div className="grid">
            {courseCategories.map((category) => (
              <div
                className="category-card card fade-in"
                key={category.id}>
                <div className="category-icon">
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <Link to={category.link} className="category-link">
                  Xem Khóa Học <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/News Section */}
      <section className="blog-section" ref={blogSectionRef}>
        <div className="container">
          <h2 className="section-title fade-in">
            Câu Chuyện & Tin Tức Cộng Đồng
          </h2>
          <p className="section-subtitle fade-in">
            Trải nghiệm thực tế và cập nhật mới nhất từ cộng đồng của
            chúng tôi
          </p>

          <div className="blog-layout">
            {/* Featured post (larger, on the left) */}
            <div className="featured-post fade-in">
              <div className="blog-card">
                <div className="blog-image">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                  />
                </div>
                <div className="blog-content">
                  <div>
                    <h3>{blogPosts[0].title}</h3>
                    <p className="blog-excerpt">
                      {blogPosts[0].excerpt}
                    </p>
                  </div>
                  <div className="blog-footer">
                    <div className="blog-meta">
                      <span>{blogPosts[0].author}</span>
                      <span>{blogPosts[0].date}</span>
                    </div>
                    <Link
                      to={`/blog/${blogPosts[0].id}`}
                      className="blog-link">
                      Đọc Thêm <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary posts (stacked on the right) */}
            <div className="secondary-posts">
              {blogPosts.slice(1, 3).map((post, index) => (
                <div
                  className={`blog-card secondary-card fade-in`}
                  key={post.id}>
                  <div className="blog-content">
                    <div>
                      <h3>{post.title}</h3>
                    </div>
                    <div className="blog-footer">
                      <div className="blog-meta">
                        <span>{post.author}</span>
                        <span>{post.date}</span>
                      </div>
                      <Link
                        to={`/blog/${post.id}`}
                        className="blog-link">
                        Đọc Thêm{" "}
                        <FontAwesomeIcon icon={faArrowRight} />
                      </Link>
                    </div>
                  </div>
                  <div className="blog-image">
                    <img src={post.image} alt={post.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Box
            className="view-all-container fade-in"
            sx={{ textAlign: "center", mt: 3 }}>
            <Button
              component={Link}
              to="/blog"
              variant="outlined"
              size="medium"
              sx={{
                color: "#3f51b5",
                borderColor: "#3f51b5",
                borderRadius: "20px",
                padding: "8px 24px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(63, 81, 181, 0.08)",
                  borderColor: "#303f9f",
                  color: "#303f9f",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)",
                },
              }}>
              Xem Tất Cả Bài Viết
            </Button>
          </Box>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="impact-section" ref={statsSectionRef}>
        <div className="container">
          <h2 className="section-title fade-in">
            Tác Động Của Chúng Tôi
          </h2>
          <p className="section-subtitle fade-in">
            Tạo nên sự khác biệt trong cộng đồng thông qua giáo dục và
            hỗ trợ
          </p>

          <div className="stats-container">
            <div className="stat-item fade-in">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Học Sinh Được Giáo Dục</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number">500+</div>
              <div className="stat-label">Buổi Tư Vấn</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number">25+</div>
              <div className="stat-label">Chương Trình Cộng Đồng</div>
            </div>
            <div className="stat-item fade-in">
              <div className="stat-number">95%</div>
              <div className="stat-label">Phản Hồi Tích Cực</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section" ref={ctaSectionRef}>
        <div className="container">
          <div className="cta-card card fade-in">
            <h2>Sẵn sàng để bước đi bước đầu tiên?</h2>
            <p>
              Bắt đầu hành trình hướng tới một cộng đồng khỏe mạnh hơn
              bằng cách thực hiện đánh giá rủi ro hoặc đăng ký một
              trong các khóa học giáo dục của chúng tôi.
            </p>
            <Box
              className="cta-buttons"
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}>
              <Button
                component={Link}
                to="/education/surveys/assist"
                variant="contained"
                size="medium"
                startIcon={<AssessmentOutlined />}
                sx={{
                  background:
                    "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                  color: "white",
                  borderRadius: "25px",
                  padding: "10px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #388e3c 30%, #4caf50 90%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                  },
                }}>
                Làm Bài Đánh Giá Rủi Ro
              </Button>
              <Button
                component={Link}
                to="/education"
                variant="outlined"
                size="medium"
                startIcon={<ExploreOutlined />}
                sx={{
                  color: "#3f51b5",
                  borderColor: "#3f51b5",
                  borderRadius: "25px",
                  padding: "10px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textTransform: "none",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(63, 81, 181, 0.08)",
                    borderColor: "#303f9f",
                    color: "#303f9f",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(63, 81, 181, 0.2)",
                  },
                }}>
                Duyệt Khóa Học
              </Button>
            </Box>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
