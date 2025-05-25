import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo secondary-bg">
            <h2>Cộng Đồng BrightChoice</h2>
            <p>
              Trao quyền cho cộng đồng thông qua giáo dục và hỗ trợ
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Tài Nguyên</h3>
              <ul>
                <li>
                  <Link to="/education">Trung Tâm Giáo Dục</Link>
                </li>
                <li>
                  <Link to="/education/surveys">Đánh Giá</Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Hỗ Trợ</h3>
              <ul>
                <li>
                  <Link to="/counseling">Tư Vấn</Link>
                </li>
                <li>
                  <Link to="/programs">Chương Trình</Link>
                </li>
                <li>
                  <Link to="/contact">Liên Hệ</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Pháp Lý</h3>
              <ul>
                <li>
                  <Link to="/privacy">Chính Sách Bảo Mật</Link>
                </li>
                <li>
                  <Link to="/terms">Điều Khoản Dịch Vụ</Link>
                </li>
                <li>
                  <Link to="/disclaimer">
                    Miễn Trừ Trách Nhiệm Sức Khỏe
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            &copy; {currentYear} Cộng Đồng BrightChoice. Đã đăng ký
            bản quyền.
          </div>
          <div className="social-links">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
