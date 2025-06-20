import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTrash,
  faEdit,
  faUsers,
  faCheckCircle,
  faTimes,
  faChartBar,
  faFileAlt,
  faCog,
  faBook,
  faLayerGroup,
  faFlask,
  faPoll,
  faChartLine,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services";
import {
  USE_MOCK_SERVICES,
  USE_MOCK_ADMIN,
} from "../services/serviceConfig";

// Initial tabs for the dashboard
const DASHBOARD_TABS = {
  USERS: "users",
  POSTS: "posts",
  STATS: "stats",
  COURSES: "courses",
  CATEGORIES: "categories",
  SUBSTANCES: "substances",
  SURVEYS: "surveys",
  ANALYTICS: "analytics",
  BADGES: "badges",
  HEALTH: "health",
};

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS.USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin()) {
      navigate("/login");
    } else {
      // Load initial data
      loadDashboardData();
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Auto-hide notification after 3 seconds
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadDashboardData = async () => {
    // Load data based on active tab
    switch (activeTab) {
      case DASHBOARD_TABS.USERS:
        await fetchUsers();
        break;
      case DASHBOARD_TABS.STATS:
        await fetchStats();
        break;
      // Additional cases for other tabs
      default:
        await fetchUsers();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getUsers();
      if (response.success) {
        // Ensure users is always an array
        let usersData = response.data || [];

        // Handle different data structures that might come from the backend
        if (usersData && !Array.isArray(usersData)) {
          console.log("Converting users data to array format");
          // If data is not an array, check if it's an object with a users property
          if (usersData.users && Array.isArray(usersData.users)) {
            usersData = usersData.users;
          } else if (
            usersData.data &&
            Array.isArray(usersData.data)
          ) {
            usersData = usersData.data;
          } else {
            // If we can't find an array, convert object to array or use empty array
            usersData =
              Object.values(usersData).filter(
                (item) =>
                  typeof item === "object" &&
                  item !== null &&
                  item.email
              ) || [];
          }
        }

        console.log("Final users data:", usersData);
        setUsers(usersData);
      } else {
        setError(response.error || "Failed to fetch users");
        showNotification("Failed to fetch users", "error");
      }
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      setError(err.message || "An unexpected error occurred");
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getStats();
      if (response.success) {
        setStats(response.data || null);
      } else {
        setError(response.error || "Failed to fetch statistics");
        showNotification("Failed to fetch statistics", "error");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    try {
      const response = await adminService.updateUser(userId, {
        role: newRole,
      });
      if (response.success) {
        setUsers(
          users.map((user) =>
            user.userId === userId
              ? { ...user, roleName: newRole }
              : user
          )
        );
        showNotification(
          `User role updated to ${newRole} successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.error || "Failed to update user role",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        err.message || "An unexpected error occurred",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const response = await adminService.updateUser(
        editingUser.userId,
        editingUser
      );
      if (response.success) {
        setUsers(
          users.map((user) =>
            user.userId === editingUser.userId ? editingUser : user
          )
        );
        setEditingUser(null);
        showNotification(
          `User "${editingUser.fullname}" updated successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.error || "Failed to update user",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        err.message || "An unexpected error occurred",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    setConfirmDelete(userId);
  };

  const confirmDeleteUser = async () => {
    setLoading(true);
    try {
      const userToDelete = users.find(
        (user) => user.userId === confirmDelete
      );

      const response = await adminService.deleteUser(confirmDelete);
      if (response.success) {
        setUsers(
          users.filter((user) => user.userId !== confirmDelete)
        );
        showNotification(
          `User "${userToDelete.fullname}" deleted successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.error || "Failed to delete user",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        err.message || "An unexpected error occurred",
        "error"
      );
    } finally {
      setConfirmDelete(null);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({
      ...editingUser,
      [name]: value,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Load data for the selected tab
    switch (tab) {
      case DASHBOARD_TABS.USERS:
        fetchUsers();
        break;
      case DASHBOARD_TABS.STATS:
        fetchStats();
        break;
      // Add cases for other tabs as needed
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          (user.fullname || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.roleName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  const renderUsers = () => {
    if (loading) {
      return <div className="loading">Loading users...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (!users || users.length === 0) {
      return <div className="no-data">No users found</div>;
    }

    return (
      <div className="users-table-container card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userId}>
                <td>
                  {editingUser &&
                  editingUser.userId === user.userId ? (
                    <input
                      type="text"
                      name="fullname"
                      value={editingUser.fullname}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    <div className="user-name">{user.fullname}</div>
                  )}
                </td>
                <td>
                  {editingUser &&
                  editingUser.userId === user.userId ? (
                    <input
                      type="text"
                      name="email"
                      value={editingUser.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  ) : (
                    <div className="user-email">{user.email}</div>
                  )}
                </td>
                <td>
                  {editingUser &&
                  editingUser.userId === user.userId ? (
                    <select
                      name="roleName"
                      value={editingUser.roleName}
                      onChange={handleInputChange}
                      className="edit-input">
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      <option value="consultant">Consultant</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`role-badge role-${user.roleName?.toLowerCase()}`}>
                      {user.roleName}
                    </span>
                  )}
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="actions-cell">
                  {editingUser &&
                  editingUser.userId === user.userId ? (
                    <div className="actions-cell-edit">
                      <button
                        className="action-btn save"
                        onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button
                        className="action-btn cancel"
                        onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="actions-cell-view">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditUser(user)}
                        title="Edit user">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user.userId)}
                        title="Delete user">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStats = () => {
    if (loading) {
      return <div className="loading">Loading statistics...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (!stats) {
      return <div className="no-data">No statistics available</div>;
    }

    return (
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <div className="stat-value">
              {stats.totalCourses || 0}
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Posts</h3>
            <div className="stat-value">{stats.totalPosts || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <div className="stat-value">{stats.activeUsers || 0}</div>
          </div>
        </div>
        <div className="last-updated">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case DASHBOARD_TABS.USERS:
        return renderUsers();
      case DASHBOARD_TABS.STATS:
        return renderStats();
      // Add cases for other tabs
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="dashboard-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <FontAwesomeIcon
              icon={
                notification.type === "success"
                  ? faCheckCircle
                  : faTimes
              }
              className="notification-icon"
            />
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() =>
              setNotification({ show: false, message: "", type: "" })
            }>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* {(USE_MOCK_SERVICES || USE_MOCK_ADMIN) && (
        <div className="mock-data-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>
            Hybrid Mode: Using real admin authentication with backend
            data when available
          </span>
        </div>
      )} */}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this user? This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={confirmDeleteUser}
                disabled={loading}>
                {loading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage users, content, and system settings</p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="dashboard-nav">
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.USERS ? "active" : ""
                }`}
                onClick={() => handleTabChange(DASHBOARD_TABS.USERS)}>
                <FontAwesomeIcon icon={faUsers} /> User Management
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.POSTS ? "active" : ""
                }`}
                onClick={() => handleTabChange(DASHBOARD_TABS.POSTS)}>
                <FontAwesomeIcon icon={faFileAlt} /> Post Management
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.STATS ? "active" : ""
                }`}
                onClick={() => handleTabChange(DASHBOARD_TABS.STATS)}>
                <FontAwesomeIcon icon={faChartBar} /> Statistics
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.COURSES ? "active" : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.COURSES)
                }>
                <FontAwesomeIcon icon={faBook} /> Courses
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.CATEGORIES
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.CATEGORIES)
                }>
                <FontAwesomeIcon icon={faLayerGroup} /> Categories
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.SUBSTANCES
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.SUBSTANCES)
                }>
                <FontAwesomeIcon icon={faFlask} /> Substances
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.SURVEYS ? "active" : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.SURVEYS)
                }>
                <FontAwesomeIcon icon={faPoll} /> Surveys
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.ANALYTICS
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.ANALYTICS)
                }>
                <FontAwesomeIcon icon={faChartLine} /> Analytics
              </button>
              <button
                className={`nav-item ${
                  activeTab === DASHBOARD_TABS.HEALTH ? "active" : ""
                }`}
                onClick={() =>
                  handleTabChange(DASHBOARD_TABS.HEALTH)
                }>
                <FontAwesomeIcon icon={faCog} /> System Health
              </button>
            </div>
          </div>

          <div className="dashboard-main">
            <div className="tab-content">
              <div className="tab-header">
                <h2>
                  {activeTab === DASHBOARD_TABS.USERS &&
                    "User Management"}
                  {activeTab === DASHBOARD_TABS.POSTS &&
                    "Post Management"}
                  {activeTab === DASHBOARD_TABS.STATS && "Statistics"}
                  {activeTab === DASHBOARD_TABS.COURSES &&
                    "Course Management"}
                  {activeTab === DASHBOARD_TABS.CATEGORIES &&
                    "Category Management"}
                  {activeTab === DASHBOARD_TABS.SUBSTANCES &&
                    "Substance Management"}
                  {activeTab === DASHBOARD_TABS.SURVEYS &&
                    "Survey Management"}
                  {activeTab === DASHBOARD_TABS.ANALYTICS &&
                    "Analytics"}
                  {activeTab === DASHBOARD_TABS.HEALTH &&
                    "System Health"}
                </h2>
                {activeTab === DASHBOARD_TABS.USERS && (
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                )}
              </div>

              {renderActiveTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
