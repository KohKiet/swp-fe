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
    title: "My Journey to Recovery: A Personal Story",
    excerpt:
      "How community support and education changed my life and helped me overcome addiction.",
    author: "Jane Doe",
    date: "May 15, 2023",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Recovery+Story",
  },
  {
    id: 2,
    title: "Understanding Risk Factors for Teen Drug Use",
    excerpt:
      "Learn about the environmental and personal factors that can lead to substance abuse in adolescents.",
    author: "Dr. John Smith",
    date: "June 2, 2023",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=Teen+Education",
  },
  {
    id: 3,
    title: "How Schools Can Implement Effective Prevention Programs",
    excerpt:
      "A guide for educators on creating supportive environments that discourage substance abuse.",
    author: "Prof. Mary Johnson",
    date: "April 28, 2023",
    image:
      "https://placehold.co/300x200/e8f5e9/2D7DD2?text=School+Programs",
  },
];

const courseCategories = [
  {
    id: 1,
    title: "For Students",
    description:
      "Age-appropriate education on drug awareness, peer pressure resistance, and healthy choices.",
    icon: faBook,
    link: "/education?group=students",
  },
  {
    id: 2,
    title: "For Parents",
    description:
      "Learn how to talk to your children about drugs and identify warning signs of substance abuse.",
    icon: faUsers,
    link: "/education?group=parents",
  },
  {
    id: 3,
    title: "For Teachers",
    description:
      "Resources and strategies to educate students about drug prevention and promote healthy environments.",
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
            <h1>Empowering Communities for a Drug-Free Future</h1>
            <p>
              We provide education, resources, and support to help
              individuals and communities prevent substance abuse and
              promote healthier lives.
            </p>
            <div className="hero-buttons">
              <Link to="/education" className="btn btn-primary">
                Explore Courses
              </Link>
              <Link to="/counseling" className="btn">
                Book Counseling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="course-categories">
        <div className="container">
          <h2 className="section-title">Education for Everyone</h2>
          <p className="section-subtitle">
            Tailored resources for different age groups and roles
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
                  View Courses <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/News Section */}
      <section className="blog-section secondary-bg">
        <div className="container">
          <h2 className="section-title">Community Stories & News</h2>
          <p className="section-subtitle">
            Real experiences and the latest updates from our community
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
                    By {post.author} | {post.date}
                  </p>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.id}`} className="blog-link">
                    Read More <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-container">
            <Link to="/blog" className="btn">
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="impact-section">
        <div className="container">
          <h2 className="section-title">Our Impact</h2>
          <p className="section-subtitle">
            Making a difference in our community through education and
            support
          </p>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Students Educated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Counseling Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Community Programs</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Positive Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card card">
            <h2>Ready to take the first step?</h2>
            <p>
              Begin your journey toward a healthier community by
              taking a risk assessment or enrolling in one of our
              educational courses.
            </p>
            <div className="cta-buttons">
              <Link
                to="/education/surveys/assist"
                className="btn btn-primary">
                Take Risk Assessment
              </Link>
              <Link to="/education" className="btn">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
