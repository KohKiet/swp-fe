import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBook,
  faUsers,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";

// Mock data for our application
const blogPosts = [
  {
    id: 1,
    title: "Hành Trình Hồi Phục Của Tôi: Một Câu Chuyện Cá Nhân",
    excerpt:
      "Làm thế nào mà sự hỗ trợ và giáo dục từ cộng đồng đã thay đổi cuộc sống của tôi và giúp tôi vượt qua nghiện ngập.",
    author: "Nguyễn Thị Hoa",
    date: "15/05/2023",
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
            <div className="hero-buttons">
              <Link to="/education" className="btn btn-primary">
                Khám Phá Khóa Học
              </Link>
              <Link to="/counseling" className="btn">
                Đặt Lịch Tư Vấn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="course-categories">
        <div className="container">
          <h2 className="section-title">Giáo Dục Cho Mọi Người</h2>
          <p className="section-subtitle">
            Tài nguyên được điều chỉnh cho các nhóm tuổi và vai trò
            khác nhau
          </p>

          <div className="grid">
            {courseCategories.map((category) => (
              <div className="category-card card" key={category.id}>
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
      <section className="blog-section secondary-bg">
        <div className="container">
          <h2 className="section-title">
            Câu Chuyện & Tin Tức Cộng Đồng
          </h2>
          <p className="section-subtitle">
            Trải nghiệm thực tế và cập nhật mới nhất từ cộng đồng của
            chúng tôi
          </p>

          <div className="grid">
            {blogPosts.map((post) => (
              <div className="blog-card card" key={post.id}>
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-content">
                  <h3>{post.title}</h3>
                  <p className="blog-meta">
                    Bởi {post.author} | {post.date}
                  </p>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.id}`} className="blog-link">
                    Đọc Thêm <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-container">
            <Link to="/blog" className="btn">
              Xem Tất Cả Bài Viết
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="impact-section">
        <div className="container">
          <h2 className="section-title">Tác Động Của Chúng Tôi</h2>
          <p className="section-subtitle">
            Tạo nên sự khác biệt trong cộng đồng thông qua giáo dục và
            hỗ trợ
          </p>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Học Sinh Được Giáo Dục</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Buổi Tư Vấn</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Chương Trình Cộng Đồng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Phản Hồi Tích Cực</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card card">
            <h2>Sẵn sàng để bước đi bước đầu tiên?</h2>
            <p>
              Bắt đầu hành trình hướng tới một cộng đồng khỏe mạnh hơn
              bằng cách thực hiện đánh giá rủi ro hoặc đăng ký một
              trong các khóa học giáo dục của chúng tôi.
            </p>
            <div className="cta-buttons">
              <Link
                to="/education/surveys/assist"
                className="btn btn-primary">
                Làm Bài Đánh Giá Rủi Ro
              </Link>
              <Link to="/education" className="btn">
                Duyệt Khóa Học
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
