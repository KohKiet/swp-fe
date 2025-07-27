import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTrash,
  faUsers,
  faCheckCircle,
  faTimes,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services";

// Add styles for the dashboard
const additionalStyles = `
  .role-select {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 14px;
    min-width: 120px;
    cursor: pointer;
  }

  .role-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .role-select:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .users-table td {
    vertical-align: middle;
  }

  .dashboard-container {
    max-width: 1530.4px;
    margin: 0 auto;
    padding: 0;
    width: 100%;
  }

  .page-header {
    background-image: url('https://i.pinimg.com/736x/b5/31/76/b5317669cef30ef46f6239ddc61256a3.jpg');
    color: white;
    padding: 5rem 0;
    text-align: center;
    margin-bottom: 2rem;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    width: 100%;
  }

  .page-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .page-header .container {
    position: relative;
    z-index: 2;
  }

  .secondary-bg {
    background-color: #E8F5E9;
  }

  .page-header h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
    letter-spacing: 1px;
  }

  .page-header p {
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto;
    color: #ffffff;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
    font-weight: 400;
  }

  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInDashboard 0.8s ease-in-out forwards;
  }

  @keyframes fadeInDashboard {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .delay-100 {
    animation-delay: 0.1s;
  }

  .delay-200 {
    animation-delay: 0.2s;
  }

  .delay-300 {
    animation-delay: 0.3s;
  }

  .container {
    width: 100%;
    max-width: 1530.4px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .dashboard-tabs {
    display: flex;
    gap: 10px;
    margin: 0 1rem 30px 1rem;
    border-bottom: 2px solid #f1f3f4;
    padding-bottom: 0;
  }

  .tab-button {
    background: none;
    border: none;
    padding: 15px 25px;
    font-size: 16px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.3s ease;
    position: relative;
  }

  .tab-button:hover {
    background-color: #f8f9fa;
    color: #333;
  }

  .tab-button.active {
    background-color: #fff;
    color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: #007bff;
  }

  .tab-content {
    background: white;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-height: 400px;
    margin: 0 1rem;
  }

  .search-container {
    margin-bottom: 25px;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 12px 20px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    font-size: 16px;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  .users-table-container {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .users-table th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 20px 15px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
  }

  .users-table td {
    padding: 18px 15px;
    border-bottom: 1px solid #f1f3f4;
  }

  .users-table tr:hover {
    background-color: #f8f9fa;
  }

  .user-name {
    font-weight: 500;
    color: #333;
  }

  .user-email {
    color: #666;
    font-size: 13px;
  }

  .loading, .error, .no-data {
    text-align: center;
    padding: 60px 20px;
    color: #666;
    font-size: 16px;
  }

  .error {
    color: #dc3545;
  }

  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  }

  .notification.success {
    background-color: #28a745;
  }

  .notification.error {
    background-color: #dc3545;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    margin-left: 10px;
    font-size: 18px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .confirm-modal {
    background: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
  }

  .confirm-modal h3 {
    margin: 0 0 15px 0;
    color: #333;
  }

  .confirm-modal p {
    margin: 0 0 25px 0;
    color: #666;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #5a6268;
  }
`;

// Inject styles into the document
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
}

// Simplified tabs for the dashboard
const DASHBOARD_TABS = {
  USERS: "users",
  COURSES: "courses",
};

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin()) {
      navigate("/login");
    } else {
      // Load initial data
      loadDashboardData();
      fetchRoles();
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
      default:
        await fetchUsers();
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminService.getRoles();
      if (response.success) {
        let rolesData = response.data || [];
        setRoles(rolesData);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getUsers();
      if (response.success) {
        let usersData = response.data || [];

        if (usersData && !Array.isArray(usersData)) {
          if (usersData.users && Array.isArray(usersData.users)) {
            usersData = usersData.users;
          } else if (
            usersData.data &&
            Array.isArray(usersData.data)
          ) {
            usersData = usersData.data;
          } else {
            usersData =
              Object.values(usersData).filter(
                (item) =>
                  typeof item === "object" &&
                  item !== null &&
                  item.email
              ) || [];
          }
        }

        setUsers(usersData);
      } else {
        setError(
          response.error || "Không thể tải danh sách người dùng"
        );
        showNotification(
          "Không thể tải danh sách người dùng",
          "error"
        );
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi không mong muốn");
      showNotification("Đã xảy ra lỗi không mong muốn", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole || newRole.trim() === "") {
      showNotification("Vui lòng chọn vai trò hợp lệ", "error");
      return;
    }

    const roleObj = roles.find((r) => r.roleName === newRole);

    setLoading(true);
    try {
      const response = await adminService.updateUserRole(
        userId,
        newRole,
        roleObj?.roleId
      );
      if (response.success || response.isSuccess) {
        setUsers(
          users.map((user) =>
            user.userId === userId
              ? { ...user, roleName: newRole }
              : user
          )
        );

        const successMessage =
          response.message ||
          `Đã thay đổi vai trò thành ${newRole} thành công!`;

        showNotification(successMessage, "success");
      } else {
        let errorMessage = "Không thể cập nhật vai trò người dùng";

        if (response.errors && response.errors.length > 0) {
          errorMessage = response.errors.join(", ");
        } else if (response.message) {
          errorMessage = response.message;
        } else if (response.error) {
          errorMessage = response.error;
        }

        showNotification(errorMessage, "error");
      }
    } catch (err) {
      showNotification(
        err.message || "Đã xảy ra lỗi không mong muốn",
        "error"
      );
    } finally {
      setLoading(false);
    }
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
          `Người dùng "${userToDelete.fullname}" đã được xóa thành công!`,
          "success"
        );
      } else {
        showNotification(
          response.error || "Không thể xóa người dùng",
          "error"
        );
      }
    } catch (err) {
      showNotification(
        err.message || "Đã xảy ra lỗi không mong muốn",
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Handle special navigation cases
    switch (tab) {
      case DASHBOARD_TABS.COURSES:
        navigate("/admin/courses");
        break;
      default:
        loadDashboardData();
        break;
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
      return <div className="loading">Đang tải người dùng...</div>;
    }

    if (error) {
      return <div className="error">Lỗi: {error}</div>;
    }

    if (!users || users.length === 0) {
      return (
        <div className="no-data">Không tìm thấy người dùng nào</div>
      );
    }

    return (
      <>
        <div className="search-container fade-in delay-300">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên, email hoặc vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-table-container fade-in delay-300">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="user-name">{user.fullname}</div>
                  </td>
                  <td>
                    <div className="user-email">{user.email}</div>
                  </td>
                  <td>
                    <select
                      value={user.roleName || ""}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        if (newRole && newRole !== user.roleName) {
                          handleRoleChange(user.userId, newRole);
                        }
                      }}
                      className="role-select"
                      disabled={loading}>
                      {user.roleName &&
                        !roles.some(
                          (r) => r.roleName === user.roleName
                        ) && (
                          <option value={user.roleName}>
                            {user.roleName} (hiện tại)
                          </option>
                        )}

                      {roles.map((role) => (
                        <option
                          key={role.roleId}
                          value={role.roleName}>
                          {role.roleName}
                        </option>
                      ))}

                      {roles.length === 0 && (
                        <>
                          <option value="">-- Chọn vai trò --</option>
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="consultant">
                            Consultant
                          </option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user.userId)}
                      disabled={loading}
                      style={{
                        padding: "5px 10px",
                        fontSize: "12px",
                      }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case DASHBOARD_TABS.USERS:
        return renderUsers();
      default:
        return <div>Chọn một tab để xem nội dung</div>;
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

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này
              không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={confirmDeleteUser}
                disabled={loading}>
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                disabled={loading}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header fade-in">
        <div className="container">
          <h1>Bảng điều khiển Admin</h1>
          <p>Quản lý người dùng và khóa học</p>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-tabs fade-in delay-100">
          <button
            className={`tab-button ${
              activeTab === DASHBOARD_TABS.USERS ? "active" : ""
            }`}
            onClick={() => handleTabChange(DASHBOARD_TABS.USERS)}>
            <FontAwesomeIcon icon={faUsers} /> Quản lý người dùng
          </button>
          <button
            className={`tab-button ${
              activeTab === DASHBOARD_TABS.COURSES ? "active" : ""
            }`}
            onClick={() => handleTabChange(DASHBOARD_TABS.COURSES)}>
            <FontAwesomeIcon icon={faBook} /> Quản lý khóa học
          </button>
        </div>

        <div className="tab-content fade-in delay-200">
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
