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
  name: "John Davis",
  email: "john.davis@example.com",
  joinDate: "March 12, 2023",
  role: "Volunteer",
  lastLogin: "Today at 9:30 AM",
};

const courseProgress = [
  {
    id: 1,
    title: "Understanding Peer Pressure",
    progress: 75,
    lastAccessed: "Yesterday",
    nextLesson: "Refusal Techniques",
    completed: false,
  },
  {
    id: 2,
    title: "Drug Recognition for Parents",
    progress: 100,
    lastAccessed: "April 15, 2023",
    completed: true,
    certificate: true,
  },
  {
    id: 3,
    title: "Healthy Coping Mechanisms",
    progress: 30,
    lastAccessed: "Today",
    nextLesson: "Stress Management",
    completed: false,
  },
];

const upcomingAppointments = [
  {
    id: 1,
    counselor: "Dr. Sarah Johnson",
    date: "May 10, 2023",
    time: "2:00 PM",
    type: "Initial Consultation",
  },
  {
    id: 2,
    counselor: "Mark Robinson, LCSW",
    date: "May 24, 2023",
    time: "10:00 AM",
    type: "Follow-up Session",
  },
];

const surveyResults = [
  {
    id: 1,
    name: "ASSIST Survey",
    date: "April 2, 2023",
    riskLevel: "Low",
    recommendations: [
      "Continue with preventive education",
      "Take 'Healthy Coping Mechanisms' course",
    ],
  },
  {
    id: 2,
    name: "CRAFFT Survey",
    date: "April 15, 2023",
    riskLevel: "Medium",
    recommendations: [
      "Schedule a counseling session",
      "Join a peer support group",
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
          <h1>My Dashboard</h1>
          <p>
            Track your progress and manage your drug prevention
            journey
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
                  <strong>Member since:</strong> {userData.joinDate}
                </p>
                <p>
                  <strong>Last login:</strong> {userData.lastLogin}
                </p>
              </div>
              <Link to="/profile/edit" className="btn">
                Edit Profile
              </Link>
            </div>

            <div className="dashboard-nav">
              <button
                className={`nav-item ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}>
                <FontAwesomeIcon icon={faChartLine} /> Overview
              </button>
              <button
                className={`nav-item ${
                  activeTab === "courses" ? "active" : ""
                }`}
                onClick={() => setActiveTab("courses")}>
                <FontAwesomeIcon icon={faBook} /> My Courses
              </button>
              <button
                className={`nav-item ${
                  activeTab === "appointments" ? "active" : ""
                }`}
                onClick={() => setActiveTab("appointments")}>
                <FontAwesomeIcon icon={faCalendarCheck} />{" "}
                Appointments
              </button>
              <button
                className={`nav-item ${
                  activeTab === "surveys" ? "active" : ""
                }`}
                onClick={() => setActiveTab("surveys")}>
                <FontAwesomeIcon icon={faClipboardList} /> Survey
                Results
              </button>
            </div>
          </div>

          <div className="dashboard-main">
            {activeTab === "overview" && (
              <div className="dashboard-overview">
                <div className="stats-row">
                  <div className="stat-card card">
                    <h3>Program Impact</h3>
                    <div className="stat-highlight">
                      <div className="stat-number">
                        {programStatistics.participantsHelped}
                      </div>
                      <div className="stat-label">
                        Participants Helped
                      </div>
                    </div>
                    <div className="stat-details">
                      <div className="stat-detail">
                        <span>Active Courses</span>
                        <span>{programStatistics.activeCourses}</span>
                      </div>
                      <div className="stat-detail">
                        <span>Counseling Sessions</span>
                        <span>
                          {programStatistics.counselingSessions}
                        </span>
                      </div>
                      <div className="stat-detail">
                        <span>Surveys Completed</span>
                        <span>
                          {programStatistics.surveysCompleted}
                        </span>
                      </div>
                      <div className="stat-detail">
                        <span>Success Rate</span>
                        <span>{programStatistics.successRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="quick-actions card">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                      <Link to="/education" className="action-btn">
                        <FontAwesomeIcon icon={faBook} />
                        <span>Browse Courses</span>
                      </Link>
                      <Link to="/counseling" className="action-btn">
                        <FontAwesomeIcon icon={faCalendarCheck} />
                        <span>Book Counseling</span>
                      </Link>
                      <Link
                        to="/education/surveys/assist"
                        className="action-btn">
                        <FontAwesomeIcon icon={faClipboardList} />
                        <span>Take Assessment</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="overview-card card">
                  <h3>Course Progress</h3>
                  <div className="course-progress-list">
                    {courseProgress.map((course) => (
                      <div className="progress-item" key={course.id}>
                        <div className="progress-info">
                          <h4>{course.title}</h4>
                          <div className="progress-meta">
                            <span>
                              Last accessed: {course.lastAccessed}
                            </span>
                            {!course.completed && (
                              <span>Next: {course.nextLesson}</span>
                            )}
                          </div>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${course.progress}%`,
                            }}></div>
                          <span className="progress-percentage">
                            {course.progress}%
                          </span>
                        </div>
                        {course.completed ? (
                          <div className="course-completed">
                            <FontAwesomeIcon icon={faCheckCircle} />{" "}
                            Completed
                          </div>
                        ) : (
                          <Link
                            to={`/education/courses/${course.id}`}
                            className="btn btn-primary">
                            Continue
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overview-row">
                  <div className="overview-card card">
                    <h3>Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="appointment-list">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            className="appointment-item"
                            key={appointment.id}>
                            <div className="appointment-icon">
                              <FontAwesomeIcon
                                icon={faCalendarCheck}
                              />
                            </div>
                            <div className="appointment-details">
                              <h4>{appointment.counselor}</h4>
                              <p className="appointment-type">
                                {appointment.type}
                              </p>
                              <p className="appointment-datetime">
                                {appointment.date} at{" "}
                                {appointment.time}
                              </p>
                            </div>
                            <div className="appointment-actions">
                              <button className="btn">
                                Reschedule
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No upcoming appointments</p>
                        <Link to="/counseling" className="btn">
                          Book Now
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="overview-card card">
                    <h3>Recent Survey Results</h3>
                    {surveyResults.length > 0 ? (
                      <div className="survey-results-list">
                        {surveyResults.map((survey) => (
                          <div
                            className="survey-result-item"
                            key={survey.id}>
                            <div className="survey-result-header">
                              <h4>{survey.name}</h4>
                              <span className="survey-date">
                                {survey.date}
                              </span>
                            </div>
                            <div
                              className={`risk-level risk-${survey.riskLevel.toLowerCase()}`}>
                              <FontAwesomeIcon
                                icon={
                                  survey.riskLevel === "Low"
                                    ? faCheckCircle
                                    : faExclamationTriangle
                                }
                              />
                              {survey.riskLevel} Risk
                            </div>
                            <div className="recommendations">
                              <h5>Recommendations:</h5>
                              <ul>
                                {survey.recommendations.map(
                                  (rec, index) => (
                                    <li key={index}>{rec}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No survey results yet</p>
                        <Link to="/education/surveys" className="btn">
                          Take Survey
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="courses-tab">
                <div className="tab-header">
                  <h2>My Courses</h2>
                  <Link to="/education" className="btn">
                    Browse More Courses
                  </Link>
                </div>

                <div className="courses-list">
                  {courseProgress.map((course) => (
                    <div className="course-item card" key={course.id}>
                      <div className="course-status">
                        {course.completed ? (
                          <span className="status-completed">
                            <FontAwesomeIcon icon={faCheckCircle} />{" "}
                            Completed
                          </span>
                        ) : (
                          <span className="status-in-progress">
                            In Progress
                          </span>
                        )}
                      </div>

                      <h3>{course.title}</h3>
                      <div className="course-progress-details">
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${course.progress}%`,
                            }}></div>
                        </div>
                        <span className="progress-text">
                          {course.progress}% Complete
                        </span>
                      </div>

                      <div className="course-meta-info">
                        <div className="meta-item">
                          <strong>Last Accessed:</strong>{" "}
                          {course.lastAccessed}
                        </div>
                        {!course.completed && (
                          <div className="meta-item">
                            <strong>Next Lesson:</strong>{" "}
                            {course.nextLesson}
                          </div>
                        )}
                      </div>

                      <div className="course-actions">
                        {course.completed ? (
                          <>
                            <button className="btn">
                              View Certificate
                            </button>
                            <button className="btn">
                              Review Course
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/education/courses/${course.id}`}
                              className="btn btn-primary">
                              Continue Course
                            </Link>
                            <button className="btn">
                              View Materials
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="recommended-courses card">
                  <h3>Recommended For You</h3>
                  <p>
                    Based on your assessments and previous courses, we
                    recommend:
                  </p>
                  <div className="recommendations-list">
                    <div className="recommendation-item">
                      <h4>
                        Creating a Supportive School Environment
                      </h4>
                      <p>
                        Develop strategies to foster a drug-free
                        culture in educational settings.
                      </p>
                      <Link to="/education/courses/6" className="btn">
                        View Course
                      </Link>
                    </div>
                    <div className="recommendation-item">
                      <h4>Effective Communication with Teens</h4>
                      <p>
                        Develop skills to discuss substance abuse with
                        teenagers in a non-confrontational way.
                      </p>
                      <Link to="/education/courses/2" className="btn">
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="appointments-tab">
                <div className="tab-header">
                  <h2>My Appointments</h2>
                  <Link to="/counseling" className="btn">
                    Book New Appointment
                  </Link>
                </div>

                <div className="appointments-container">
                  <div className="upcoming-appointments card">
                    <h3>Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="appointments-list">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            className="appointment-item"
                            key={appointment.id}>
                            <div className="appointment-date">
                              <div className="date-circle">
                                <span className="month">
                                  {new Date(
                                    appointment.date
                                  ).toLocaleString("en-US", {
                                    month: "short",
                                  })}
                                </span>
                                <span className="day">
                                  {new Date(
                                    appointment.date
                                  ).getDate()}
                                </span>
                              </div>
                              <span className="time">
                                {appointment.time}
                              </span>
                            </div>

                            <div className="appointment-details">
                              <h4>{appointment.counselor}</h4>
                              <p className="appointment-type">
                                {appointment.type}
                              </p>
                            </div>

                            <div className="appointment-actions">
                              <button className="btn">
                                Reschedule
                              </button>
                              <button className="btn">Cancel</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No upcoming appointments</p>
                      </div>
                    )}
                  </div>

                  <div className="past-appointments card">
                    <h3>Past Appointments</h3>
                    <div className="appointments-list">
                      <div className="appointment-item past">
                        <div className="appointment-date">
                          <div className="date-circle">
                            <span className="month">Apr</span>
                            <span className="day">12</span>
                          </div>
                          <span className="time">11:00 AM</span>
                        </div>

                        <div className="appointment-details">
                          <h4>Dr. Sarah Johnson</h4>
                          <p className="appointment-type">
                            Initial Consultation
                          </p>
                          <span className="appointment-status completed">
                            Completed
                          </span>
                        </div>

                        <div className="appointment-actions">
                          <button className="btn">View Notes</button>
                        </div>
                      </div>

                      <div className="appointment-item past">
                        <div className="appointment-date">
                          <div className="date-circle">
                            <span className="month">Mar</span>
                            <span className="day">28</span>
                          </div>
                          <span className="time">2:30 PM</span>
                        </div>

                        <div className="appointment-details">
                          <h4>Mark Robinson, LCSW</h4>
                          <p className="appointment-type">
                            Group Session
                          </p>
                          <span className="appointment-status completed">
                            Completed
                          </span>
                        </div>

                        <div className="appointment-actions">
                          <button className="btn">View Notes</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "surveys" && (
              <div className="surveys-tab">
                <div className="tab-header">
                  <h2>My Survey Results</h2>
                  <Link to="/education/surveys" className="btn">
                    Take New Survey
                  </Link>
                </div>

                <div className="survey-results-container">
                  {surveyResults.map((survey) => (
                    <div
                      className="survey-result-card card"
                      key={survey.id}>
                      <div className="survey-header">
                        <h3>{survey.name}</h3>
                        <span className="survey-date">
                          {survey.date}
                        </span>
                      </div>

                      <div
                        className={`risk-assessment risk-${survey.riskLevel.toLowerCase()}`}>
                        <div className="risk-icon">
                          <FontAwesomeIcon
                            icon={
                              survey.riskLevel === "Low"
                                ? faCheckCircle
                                : faExclamationTriangle
                            }
                          />
                        </div>
                        <div className="risk-details">
                          <h4>Risk Level: {survey.riskLevel}</h4>
                          <p className="risk-description">
                            {survey.riskLevel === "Low"
                              ? "You have a low risk of developing substance use issues. Continue with preventive education."
                              : "You have some risk factors that may benefit from additional support and education."}
                          </p>
                        </div>
                      </div>

                      <div className="recommendations-section">
                        <h4>Recommendations:</h4>
                        <ul className="recommendations-list">
                          {survey.recommendations.map(
                            (rec, index) => (
                              <li key={index}>{rec}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div className="survey-actions">
                        <button className="btn">
                          View Full Results
                        </button>
                        <button className="btn">Download PDF</button>
                      </div>
                    </div>
                  ))}

                  <div className="available-surveys card">
                    <h3>Available Surveys</h3>
                    <p>
                      Take these assessments to receive personalized
                      recommendations:
                    </p>
                    <div className="survey-list">
                      <Link
                        to="/education/surveys/assist"
                        className="survey-item">
                        <h4>ASSIST Survey</h4>
                        <p>
                          The Alcohol, Smoking and Substance
                          Involvement Screening Test
                        </p>
                        <span className="survey-link">
                          Take Survey →
                        </span>
                      </Link>

                      <Link
                        to="/education/surveys/crafft"
                        className="survey-item">
                        <h4>CRAFFT Survey</h4>
                        <p>
                          A screening tool for adolescents to assess
                          risky alcohol and drug use behaviors
                        </p>
                        <span className="survey-link">
                          Take Survey →
                        </span>
                      </Link>

                      <Link
                        to="/education/surveys/post-program"
                        className="survey-item">
                        <h4>Post-Program Evaluation</h4>
                        <p>
                          Measure your progress after completing a
                          prevention program
                        </p>
                        <span className="survey-link">
                          Take Survey →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
