import React, { useEffect, useState } from "react";
import "./ConsultantList.css";

const ConsultantList = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConsultants = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "http://localhost:5150/api/User/consultants"
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setConsultants(data.data);
        } else {
          setError("Không thể tải danh sách chuyên gia");
        }
      } catch (err) {
        setError("Lỗi khi tải danh sách chuyên gia");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultants();
  }, []);

  // Hàm dịch giới tính sang tiếng Việt
  const getGenderText = (gender) => {
    if (!gender) return "Chưa cập nhật";
    const g = gender.toLowerCase();
    if (g === "male" || g === "nam") return "Nam";
    if (g === "female" || g === "nữ" || g === "nu") return "Nữ";
    if (g === "other" || g === "khác") return "Khác";
    return gender;
  };

  return (
    <>
      <div className="page-header secondary-bg fade-in">
        <div className="container">
          <h1>Danh sách Chuyên gia Tư vấn</h1>
          <p>
            Chọn chuyên gia phù hợp để nhận tư vấn chuyên nghiệp, bảo
            mật và tận tâm.
          </p>
        </div>
      </div>
      <div className="consultant-list-page">
        {loading ? (
          <div className="consultant-list-loading">Đang tải...</div>
        ) : error ? (
          <div className="consultant-list-error">{error}</div>
        ) : (
          <div className="consultant-list-grid">
            {consultants.map((c) => (
              <div className="consultant-card" key={c.userId}>
                <div className="consultant-avatar">
                  <img
                    src={c.profilePicture || "/default-avatar.png"}
                    alt={c.fullname}
                  />
                </div>
                <div className="consultant-info">
                  <div className="consultant-row">
                    <span className="consultant-label">
                      Họ & tên:
                    </span>{" "}
                    {c.fullname || "-"}
                  </div>
                  <div className="consultant-row">
                    <span className="consultant-label">
                      Giới tính:
                    </span>{" "}
                    {getGenderText(c.gender)}
                  </div>
                  <div className="consultant-row">
                    <span className="consultant-label">
                      Chuyên môn:
                    </span>{" "}
                    {c.specialization || "-"}
                  </div>
                  <div className="consultant-row">
                    <span className="consultant-label">
                      Bằng cấp:
                    </span>{" "}
                    {c.degree || "-"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ConsultantList;
