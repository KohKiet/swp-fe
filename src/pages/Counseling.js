import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faFilter,
  faSearch,
  faStar,
  faPhone,
  faEnvelope,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./Counseling.css";

// Mock counselor data
const counselorsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Clinical Psychologist",
    specialties: [
      "Adolescent Counseling",
      "Substance Abuse",
      "Family Therapy",
    ],
    experience: "12 years",
    bio: "Dr. Johnson specializes in working with adolescents and families affected by substance abuse. Her approach combines cognitive-behavioral therapy with family systems work.",
    rating: 4.8,
    reviews: 56,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=SJ",
    availableDays: ["Monday", "Tuesday", "Thursday"],
  },
  {
    id: 2,
    name: "Mark Robinson, LCSW",
    title: "Licensed Clinical Social Worker",
    specialties: [
      "Group Therapy",
      "Recovery Support",
      "Crisis Intervention",
    ],
    experience: "8 years",
    bio: "Mark facilitates recovery support groups and provides individual counseling with a focus on building coping skills and preventing relapse.",
    rating: 4.6,
    reviews: 42,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=MR",
    availableDays: ["Wednesday", "Friday", "Saturday"],
  },
  {
    id: 3,
    name: "Dr. Michelle Lee",
    title: "Psychiatrist",
    specialties: [
      "Dual Diagnosis",
      "Medication Management",
      "Mental Health",
    ],
    experience: "15 years",
    bio: "Dr. Lee specializes in treating patients with co-occurring disorders, providing both medication management and therapeutic support.",
    rating: 4.9,
    reviews: 78,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=ML",
    availableDays: ["Monday", "Wednesday", "Friday"],
  },
  {
    id: 4,
    name: "James Wilson, LPC",
    title: "Licensed Professional Counselor",
    specialties: [
      "Young Adult Counseling",
      "Addiction Recovery",
      "Trauma",
    ],
    experience: "6 years",
    bio: "James works primarily with young adults navigating substance use issues, focusing on building resilience and healthy coping mechanisms.",
    rating: 4.7,
    reviews: 35,
    image: "https://placehold.co/300x300/e8f5e9/2D7DD2?text=JW",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
  },
];

// Available time slots
const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const Counseling = () => {
  const [activeTab, setActiveTab] = useState("profiles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [filteredCounselors, setFilteredCounselors] =
    useState(counselorsData);

  // Booking state
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Get all unique specialties from counselors
  const allSpecialties = [
    ...new Set(counselorsData.flatMap((c) => c.specialties)),
  ];

  // Handle search and filter
  const handleSearch = () => {
    let filtered = counselorsData;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.bio.toLowerCase().includes(query) ||
          c.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((c) =>
        c.specialties.includes(selectedSpecialty)
      );
    }

    setFilteredCounselors(filtered);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value,
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate booking form
  const validateForm = () => {
    const errors = {};

    if (!bookingForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!bookingForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      errors.email = "Email is invalid";
    }

    if (!bookingForm.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!bookingForm.reason.trim()) {
      errors.reason = "Reason for visit is required";
    }

    if (!selectedDate) {
      errors.date = "Please select a date";
    }

    if (!selectedTime) {
      errors.time = "Please select a time";
    }

    return errors;
  };

  // Handle booking submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Here you would typically send this to your backend
    console.log("Booking submitted:", {
      counselor: selectedCounselor.name,
      date: selectedDate,
      time: selectedTime,
      ...bookingForm,
    });

    // Show confirmation
    setBookingConfirmed(true);
  };

  // Initiate booking for a specific counselor
  const initiateBooking = (counselor) => {
    setSelectedCounselor(counselor);
    setActiveTab("booking");
    setBookingConfirmed(false);
    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      reason: "",
    });
    setFormErrors({});
  };

  // Generate available dates (next 14 days)
  const getAvailableDates = () => {
    if (!selectedCounselor) return [];

    const dates = [];
    const today = new Date();
    const availableDaysOfWeek = selectedCounselor.availableDays.map(
      (day) => {
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return days.indexOf(day);
      }
    );

    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      if (availableDaysOfWeek.includes(date.getDay())) {
        dates.push({
          date: date,
          formatted: date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        });
      }
    }

    return dates;
  };

  return (
    <div className="counseling-page">
      <div className="page-header secondary-bg">
        <div className="container">
          <h1>Counseling Services</h1>
          <p>
            Connect with professional counselors specializing in
            substance abuse prevention and treatment
          </p>
        </div>
      </div>

      <div className="container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${
              activeTab === "profiles" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profiles")}>
            Counselor Profiles
          </button>
          {selectedCounselor && (
            <button
              className={`tab-btn ${
                activeTab === "booking" ? "active" : ""
              }`}
              onClick={() => setActiveTab("booking")}>
              Book Appointment
            </button>
          )}
        </div>

        {activeTab === "profiles" && (
          <div className="profiles-section">
            <div className="search-filters">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch}>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>

              <div className="specialty-filter">
                <span className="filter-label">
                  <FontAwesomeIcon icon={faFilter} /> Filter by
                  specialty:
                </span>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setTimeout(handleSearch, 0);
                  }}>
                  <option value="all">All Specialties</option>
                  {allSpecialties.map((specialty, index) => (
                    <option key={index} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="counselors-grid">
              {filteredCounselors.length > 0 ? (
                filteredCounselors.map((counselor) => (
                  <div
                    className="counselor-card card"
                    key={counselor.id}>
                    <div className="counselor-header">
                      <div className="counselor-image">
                        <img
                          src={counselor.image}
                          alt={counselor.name}
                        />
                      </div>
                      <div className="counselor-info">
                        <h3>{counselor.name}</h3>
                        <p className="counselor-title">
                          {counselor.title}
                        </p>
                        <div className="counselor-rating">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="star-icon"
                          />
                          <span>{counselor.rating}</span>
                          <span className="review-count">
                            ({counselor.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="counselor-specialties">
                      {counselor.specialties.map(
                        (specialty, index) => (
                          <span className="specialty-tag" key={index}>
                            {specialty}
                          </span>
                        )
                      )}
                    </div>

                    <p className="counselor-bio">{counselor.bio}</p>

                    <div className="counselor-experience">
                      <strong>Experience:</strong>{" "}
                      {counselor.experience}
                    </div>

                    <div className="counselor-availability">
                      <strong>Available:</strong>{" "}
                      {counselor.availableDays.join(", ")}
                    </div>

                    <button
                      className="btn btn-primary book-btn"
                      onClick={() => initiateBooking(counselor)}>
                      <FontAwesomeIcon icon={faCalendarAlt} /> Book
                      Appointment
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <h3>No counselors found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "booking" && selectedCounselor && (
          <div className="booking-section">
            {!bookingConfirmed ? (
              <>
                <div className="selected-counselor card">
                  <div className="counselor-quick-info">
                    <img
                      src={selectedCounselor.image}
                      alt={selectedCounselor.name}
                    />
                    <div>
                      <h3>Booking with {selectedCounselor.name}</h3>
                      <p>{selectedCounselor.title}</p>
                    </div>
                  </div>
                </div>

                <div className="booking-form-container">
                  <div className="date-time-selection card">
                    <h3>Select Date & Time</h3>

                    <div className="date-selector">
                      <h4>Available Dates</h4>
                      <div className="dates-grid">
                        {getAvailableDates().map((dateObj, index) => (
                          <button
                            key={index}
                            className={`date-btn ${
                              selectedDate === dateObj.formatted
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedDate(dateObj.formatted)
                            }>
                            {dateObj.formatted}
                          </button>
                        ))}
                      </div>
                      {formErrors.date && (
                        <div className="error-text">
                          {formErrors.date}
                        </div>
                      )}
                    </div>

                    {selectedDate && (
                      <div className="time-selector">
                        <h4>Available Times for {selectedDate}</h4>
                        <div className="times-grid">
                          {timeSlots.map((time, index) => (
                            <button
                              key={index}
                              className={`time-btn ${
                                selectedTime === time
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => setSelectedTime(time)}>
                              {time}
                            </button>
                          ))}
                        </div>
                        {formErrors.time && (
                          <div className="error-text">
                            {formErrors.time}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <form
                    className="booking-form card"
                    onSubmit={handleBookingSubmit}>
                    <h3>Your Information</h3>

                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        className={formErrors.name ? "error" : ""}
                      />
                      {formErrors.name && (
                        <div className="error-text">
                          {formErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? "error" : ""}
                      />
                      {formErrors.email && (
                        <div className="error-text">
                          {formErrors.email}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        className={formErrors.phone ? "error" : ""}
                      />
                      {formErrors.phone && (
                        <div className="error-text">
                          {formErrors.phone}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="reason">Reason for Visit</label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows="3"
                        value={bookingForm.reason}
                        onChange={handleInputChange}
                        className={
                          formErrors.reason ? "error" : ""
                        }></textarea>
                      {formErrors.reason && (
                        <div className="error-text">
                          {formErrors.reason}
                        </div>
                      )}
                    </div>

                    <div className="booking-summary">
                      <h4>Appointment Summary</h4>
                      <div className="summary-details">
                        <div className="summary-item">
                          <strong>Counselor:</strong>{" "}
                          {selectedCounselor.name}
                        </div>
                        <div className="summary-item">
                          <strong>Date:</strong>{" "}
                          {selectedDate || "Not selected"}
                        </div>
                        <div className="summary-item">
                          <strong>Time:</strong>{" "}
                          {selectedTime || "Not selected"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary submit-btn">
                      Confirm Booking
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="booking-confirmation card">
                <div className="confirmation-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h2>Booking Confirmed!</h2>
                <p>
                  Your appointment with {selectedCounselor.name} has
                  been scheduled for:
                </p>
                <div className="confirmation-details">
                  <p className="detail-item">
                    <strong>Date:</strong> {selectedDate}
                  </p>
                  <p className="detail-item">
                    <strong>Time:</strong> {selectedTime}
                  </p>
                </div>
                <p className="confirmation-message">
                  A confirmation email has been sent to{" "}
                  {bookingForm.email}. Please check your inbox for
                  details.
                </p>
                <div className="contact-info">
                  <p>
                    If you need to reschedule or cancel, please
                    contact us:
                  </p>
                  <div className="contact-methods">
                    <a
                      href="tel:+1234567890"
                      className="contact-method">
                      <FontAwesomeIcon icon={faPhone} /> (123)
                      456-7890
                    </a>
                    <a
                      href="mailto:contact@drugfreecommunity.org"
                      className="contact-method">
                      <FontAwesomeIcon icon={faEnvelope} />{" "}
                      contact@drugfreecommunity.org
                    </a>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("profiles")}>
                  Return to Counselor Profiles
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Counseling;
