import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCalendarCheck,
  faClipboardList,
  faUser,
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";

// Mock data for the dashboard
const userData = {
  name: "Koh Vy Kiet",
  email: "KietKVSE160864@fpt.edu.vn",
  joinDate: "18/04/2025",
  role: "Nhân viên",
  lastLogin: "Hôm nay lúc 9:30 Sáng",
};

const courseProgress = [
  {
    id: 1,
    title: "Hiểu Về Áp Lực Bạn Bè",
    progress: 75,
    lastAccessed: "Hôm qua",
    nextLesson: "Kỹ Thuật Từ Chối",
    completed: false,
  },
  {
    id: 2,
    title: "Nhận Biết Ma Túy Cho Phụ Huynh",
    progress: 100,
    lastAccessed: "15/04/2023",
    completed: true,
    certificate: true,
  },
  {
    id: 3,
    title: "Cơ Chế Đối Phó Lành Mạnh",
    progress: 30,
    lastAccessed: "Hôm nay",
    nextLesson: "Quản Lý Căng Thẳng",
    completed: false,
  },
];

const upcomingAppointments = [
  {
    id: 1,
    counselor: "TS. Nguyễn Thị Hương",
    date: "10/05/2023",
    time: "2:00 Chiều",
    type: "Tư Vấn Ban Đầu",
  },
  {
    id: 2,
    counselor: "Trần Văn Minh, LCSW",
    date: "24/05/2023",
    time: "10:00 Sáng",
    type: "Buổi Theo Dõi",
  },
];

const surveyResults = [
  {
    id: 1,
    name: "Khảo Sát ASSIST",
    date: "02/04/2023",
    riskLevel: "Thấp",
    recommendations: [
      "Tiếp tục với giáo dục phòng ngừa",
      "Tham gia khóa học 'Cơ Chế Đối Phó Lành Mạnh'",
    ],
  },
  {
    id: 2,
    name: "Khảo Sát CRAFFT",
    date: "15/04/2023",
    riskLevel: "Trung bình",
    recommendations: [
      "Lên lịch buổi tư vấn",
      "Tham gia nhóm hỗ trợ đồng đẳng",
    ],
  },
];

const programStatistics = {
  participantsHelped: 528,
  activeCourses: 8,
  counselingSessions: 125,
  surveysCompleted: 721,
  successRate: 93,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-page">
      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Bảng Điều Khiển Của Tôi</h1>
          <p>
            Theo dõi tiến trình và quản lý hành trình phòng ngừa ma
            túy của bạn
          </p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="user-profile card">
              <div className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <h3>{userData.name}</h3>
              <p className="user-role">{userData.role}</p>
              <div className="user-details">
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Thành viên từ:</strong> {userData.joinDate}
                </p>
                <p>
                  <strong>Đăng nhập lần cuối:</strong>{" "}
                  {userData.lastLogin}
                </p>
              </div>
              <Link to="/profile/edit" className="btn">
                Chỉnh Sửa Hồ Sơ
              </Link>
            </div>

            <div className="dashboard-nav">
              <button
                className={`nav-item ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}>
                <FontAwesomeIcon icon={faChartLine} /> Tổng Quan
              </button>
              <button
                className={`nav-item ${
                  activeTab === "courses" ? "active" : ""
                }`}
                onClick={() => setActiveTab("courses")}>
                <FontAwesomeIcon icon={faBook} /> Khóa Học Của Tôi
              </button>
              <button
                className={`nav-item ${
                  activeTab === "appointments" ? "active" : ""
                }`}
                onClick={() => setActiveTab("appointments")}>
                <FontAwesomeIcon icon={faCalendarCheck} /> Lịch Hẹn
              </button>
              <button
                className={`nav-item ${
                  activeTab === "surveys" ? "active" : ""
                }`}
                onClick={() => setActiveTab("surveys")}>
                <FontAwesomeIcon icon={faClipboardList} /> Kết Quả
                Khảo Sát
              </button>
            </div>
          </div>

          <div className="dashboard-main">
            {activeTab === "overview" && (
              <div className="dashboard-overview">
                <div className="stats-row">
                  <div className="stat-card card">
                    <h3>Tác Động Chương Trình</h3>
                    <div className="stat-highlight">
                      <div className="stat-number">
                        {programStatistics.participantsHelped}
                      </div>
                      <div className="stat-label">
                        Người Tham Gia Được Hỗ Trợ
                      </div>
                    </div>
                    <div className="stat-details">
                      <div className="stat-detail">
                        <span>Khóa Học Đang Hoạt Động</span>
                        <span>{programStatistics.activeCourses}</span>
                      </div>
                      <div className="stat-detail">
                        <span>Buổi Tư Vấn</span>
                        <span>
                          {programStatistics.counselingSessions}
                        </span>
                      </div>
                      <div className="stat-detail">
                        <span>Khảo Sát Đã Hoàn Thành</span>
                        <span>
                          {programStatistics.surveysCompleted}
                        </span>
                      </div>
                      <div className="stat-detail">
                        <span>Tỷ Lệ Thành Công</span>
                        <span>{programStatistics.successRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="section-title">Hoạt Động Gần Đây</h2>

                <div className="recent-activities">
                  <div className="recent-courses card">
                    <h3>Khóa Học Của Tôi</h3>
                    {courseProgress.length > 0 ? (
                      <div className="course-list">
                        {courseProgress.slice(0, 2).map((course) => (
                          <div
                            className="course-item"
                            key={course.id}>
                            <div className="course-info">
                              <h4>{course.title}</h4>
                              <div className="progress-container">
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${course.progress}%`,
                                  }}></div>
                              </div>
                              <div className="progress-details">
                                <span>
                                  {course.progress}% hoàn thành
                                </span>
                                <span>
                                  Truy cập lần cuối:{" "}
                                  {course.lastAccessed}
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/education/courses/${course.id}`}
                              className="btn btn-small">
                              {course.completed
                                ? "Xem Lại"
                                : "Tiếp Tục"}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">
                        Bạn chưa đăng ký khóa học nào.
                      </p>
                    )}
                    <Link to="/education" className="view-all-link">
                      Xem Tất Cả Khóa Học
                    </Link>
                  </div>

                  <div className="recent-appointments card">
                    <h3>Lịch Hẹn Sắp Tới</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="appointment-list">
                        {upcomingAppointments
                          .slice(0, 1)
                          .map((appointment) => (
                            <div
                              className="appointment-item"
                              key={appointment.id}>
                              <div className="appointment-info">
                                <h4>{appointment.counselor}</h4>
                                <p className="appointment-type">
                                  {appointment.type}
                                </p>
                                <p className="appointment-datetime">
                                  <strong>Ngày:</strong>{" "}
                                  {appointment.date}
                                </p>
                                <p className="appointment-datetime">
                                  <strong>Giờ:</strong>{" "}
                                  {appointment.time}
                                </p>
                              </div>
                              <div className="appointment-actions">
                                <Link
                                  to={`/appointments/${appointment.id}`}
                                  className="btn btn-small">
                                  Chi Tiết
                                </Link>
                                <button className="btn btn-small btn-outline">
                                  Đổi Lịch
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="empty-state">
                        Bạn không có lịch hẹn sắp tới nào.
                      </p>
                    )}
                    <Link
                      to="/counseling/booking"
                      className="view-all-link">
                      Quản Lý Lịch Hẹn
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="courses-tab">
                <div className="tab-header">
                  <h2>Khóa Học Của Tôi</h2>
                  <Link to="/education" className="btn">
                    Khám Phá Khóa Học Mới
                  </Link>
                </div>

                {courseProgress.length > 0 ? (
                  <div className="courses-list">
                    {courseProgress.map((course) => (
                      <div
                        className="course-card card"
                        key={course.id}>
                        <div className="course-header">
                          <h3>{course.title}</h3>
                          {course.completed ? (
                            <span className="status-badge completed">
                              <FontAwesomeIcon icon={faCheckCircle} />{" "}
                              Hoàn Thành
                            </span>
                          ) : (
                            <span className="status-badge in-progress">
                              Đang Tiến Hành
                            </span>
                          )}
                        </div>

                        <div className="progress-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${course.progress}%`,
                            }}></div>
                        </div>
                        <div className="progress-details">
                          <span>{course.progress}% hoàn thành</span>
                        </div>

                        <div className="course-details">
                          <div className="detail-item">
                            <strong>Truy cập lần cuối:</strong>{" "}
                            {course.lastAccessed}
                          </div>
                          {!course.completed && (
                            <div className="detail-item">
                              <strong>Bài học tiếp theo:</strong>{" "}
                              {course.nextLesson}
                            </div>
                          )}
                          {course.certificate && (
                            <div className="detail-item certificate">
                              <strong>Chứng Chỉ:</strong>{" "}
                              <Link to={`/certificates/${course.id}`}>
                                Xem Chứng Chỉ
                              </Link>
                            </div>
                          )}
                        </div>

                        <div className="course-actions">
                          <Link
                            to={`/education/courses/${course.id}`}
                            className="btn">
                            {course.completed
                              ? "Xem Lại Khóa Học"
                              : "Tiếp Tục Học"}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-container card">
                    <p>Bạn chưa đăng ký khóa học nào.</p>
                    <Link to="/education" className="btn">
                      Khám Phá Khóa Học
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="appointments-tab">
                <div className="tab-header">
                  <h2>Lịch Hẹn Của Tôi</h2>
                  <Link to="/counseling" className="btn">
                    Đặt Lịch Hẹn Mới
                  </Link>
                </div>

                {upcomingAppointments.length > 0 ? (
                  <div className="appointments-list">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        className="appointment-card card"
                        key={appointment.id}>
                        <div className="appointment-header">
                          <h3>{appointment.counselor}</h3>
                          <span className="appointment-type">
                            {appointment.type}
                          </span>
                        </div>

                        <div className="appointment-details">
                          <div className="detail-item">
                            <strong>Ngày:</strong> {appointment.date}
                          </div>
                          <div className="detail-item">
                            <strong>Giờ:</strong> {appointment.time}
                          </div>
                        </div>

                        <div className="appointment-actions">
                          <Link
                            to={`/appointments/${appointment.id}`}
                            className="btn">
                            Xem Chi Tiết
                          </Link>
                          <button className="btn btn-outline">
                            Đổi Lịch
                          </button>
                          <button className="btn btn-outline btn-danger">
                            Hủy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-container card">
                    <p>Bạn không có lịch hẹn nào.</p>
                    <Link to="/counseling" className="btn">
                      Đặt Lịch Tư Vấn
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "surveys" && (
              <div className="surveys-tab">
                <div className="tab-header">
                  <h2>Kết Quả Khảo Sát Của Tôi</h2>
                  <Link to="/education/surveys" className="btn">
                    Làm Khảo Sát Mới
                  </Link>
                </div>

                {surveyResults.length > 0 ? (
                  <div className="surveys-list">
                    {surveyResults.map((survey) => (
                      <div
                        className="survey-card card"
                        key={survey.id}>
                        <div className="survey-header">
                          <h3>{survey.name}</h3>
                          <span
                            className={`risk-level ${survey.riskLevel.toLowerCase()}`}>
                            {survey.riskLevel === "Low" && (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            )}
                            {survey.riskLevel === "Medium" && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                              />
                            )}
                            {survey.riskLevel === "High" && (
                              <FontAwesomeIcon
                                icon={faExclamationTriangle}
                              />
                            )}
                            Mức Độ Rủi Ro: {survey.riskLevel}
                          </span>
                        </div>

                        <div className="survey-details">
                          <div className="detail-item">
                            <strong>Ngày Hoàn Thành:</strong>{" "}
                            {survey.date}
                          </div>
                        </div>

                        <div className="recommendations">
                          <h4>Khuyến Nghị:</h4>
                          <ul>
                            {survey.recommendations.map(
                              (recommendation, index) => (
                                <li key={index}>{recommendation}</li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="survey-actions">
                          <Link
                            to={`/education/surveys/results/${survey.id}`}
                            className="btn">
                            Xem Kết Quả Chi Tiết
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-container card">
                    <p>Bạn chưa hoàn thành khảo sát nào.</p>
                    <Link to="/education/surveys" className="btn">
                      Làm Khảo Sát
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
