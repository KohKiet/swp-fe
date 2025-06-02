import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faTrash,
  faEdit,
  faUsers,
  faCheckCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Mock data for users
const initialUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "Member",
    joinDate: "15/03/2023",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    role: "Staff",
    joinDate: "20/04/2023",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    role: "Consultant",
    joinDate: "10/01/2023",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    role: "Manager",
    joinDate: "05/02/2023",
  },
  {
    id: 5,
    name: "Admin",
    email: "admin@gmail.com",
    role: "Admin",
    joinDate: "01/01/2023",
  },
];

const roleOptions = [
  "Member",
  "Staff",
  "Consultant",
  "Manager",
  "Admin",
];

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin()) {
      navigate("/login");
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

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleSaveEdit = () => {
    setUsers(
      users.map((user) =>
        user.id === editingUser.id ? editingUser : user
      )
    );
    setEditingUser(null);
    showNotification(
      `Đã cập nhật thông tin người dùng "${editingUser.name}" thành công!`,
      "success"
    );
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    setConfirmDelete(userId);
  };

  const confirmDeleteUser = () => {
    const userToDelete = users.find(
      (user) => user.id === confirmDelete
    );
    setUsers(users.filter((user) => user.id !== confirmDelete));
    setConfirmDelete(null);
    showNotification(
      `Đã xóa người dùng "${userToDelete.name}" thành công!`,
      "success"
    );
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Quản lý người dùng và phân quyền trong hệ thống</p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="dashboard-nav">
              <button className="nav-item active">
                <FontAwesomeIcon icon={faUsers} /> Quản Lý Người Dùng
              </button>
            </div>
          </div>

          <div className="dashboard-main">
            <div className="manage-users-tab">
              <div className="tab-header">
                <h2>Quản Lý Người Dùng</h2>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="users-table-container card">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai Trò</th>
                      <th>Ngày Tham Gia</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          {editingUser &&
                          editingUser.id === user.id ? (
                            <input
                              type="text"
                              name="name"
                              value={editingUser.name}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td>
                          {editingUser &&
                          editingUser.id === user.id ? (
                            <input
                              type="email"
                              name="email"
                              value={editingUser.email}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          ) : (
                            user.email
                          )}
                        </td>
                        <td>
                          {editingUser &&
                          editingUser.id === user.id ? (
                            <select
                              name="role"
                              value={editingUser.role}
                              onChange={handleInputChange}
                              className="role-select">
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`role-badge ${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td>{user.joinDate}</td>
                        <td>
                          {editingUser &&
                          editingUser.id === user.id ? (
                            <div className="action-buttons">
                              <button
                                className="btn btn-small btn-success"
                                onClick={handleSaveEdit}>
                                Lưu
                              </button>
                              <button
                                className="btn btn-small btn-secondary"
                                onClick={handleCancelEdit}>
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button
                                className="btn btn-small btn-primary"
                                onClick={() => handleEditUser(user)}>
                                <FontAwesomeIcon icon={faEdit} /> Sửa
                              </button>
                              {user.email !== "admin@gmail.com" && (
                                <button
                                  className="btn btn-small btn-danger"
                                  onClick={() =>
                                    handleDeleteUser(user.id)
                                  }>
                                  <FontAwesomeIcon icon={faTrash} />{" "}
                                  Xóa
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="empty-state">
                    <p>Không tìm thấy người dùng nào phù hợp.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa người dùng này? Hành động
                này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}>
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteUser}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
