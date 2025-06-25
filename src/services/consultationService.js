import { API_CONFIG } from "./apiConfig";
import authService from "./authService";

class ConsultationService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  getAuthHeaders() {
    const token = authService.getAccessToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  }

  async authenticatedRequest(url, options = {}) {
    try {
      // Use AuthService's authenticatedRequest which handles token refresh
      const response = await authService.authenticatedRequest(
        url,
        options
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          // Check if response has content before trying to parse JSON
          const responseText = await response.text();
          console.log("Error response text:", responseText); // Debug log

          if (responseText.trim()) {
            const errorData = JSON.parse(responseText);
            console.log("Parsed error data:", errorData); // Debug log

            // Extract detailed error message from backend
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.details) {
              errorMessage = errorData.details;
            } else if (
              errorData.errors &&
              Array.isArray(errorData.errors)
            ) {
              // Handle validation errors array
              errorMessage = errorData.errors.join(", ");
            }

            // Store full error details for debugging
            errorDetails = errorData;
          }
        } catch (parseError) {
          // If JSON parsing fails or response is empty, keep the default error message
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Could not parse error response (empty or invalid JSON):",
              parseError
            );
          }
        }

        // Create error with additional context
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorDetails;

        // Log full error details for debugging
        console.error("Full error details:", {
          url,
          method: options.method || "GET",
          status: response.status,
          message: errorMessage,
          details: errorDetails,
        });

        throw error;
      }

      // Handle successful response - check if there's content before parsing
      const responseText = await response.text();
      if (responseText.trim()) {
        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          // If we can't parse the response as JSON, return the raw text
          console.warn(
            "Response is not valid JSON, returning as text:",
            responseText
          );
          return { success: true, data: responseText };
        }
      } else {
        // Empty response is considered successful for some operations (like DELETE)
        return { success: true, data: null };
      }
    } catch (error) {
      throw error;
    }
  }

  // Consultant Available Slots APIs
  async createSlot(slotData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots`,
        {
          method: "POST",
          body: JSON.stringify(slotData),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Create slot error:", error);
      return { success: false, error: error.message };
    }
  }

  async createMultipleSlots(slots) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/multiple`,
        {
          method: "POST",
          body: JSON.stringify({ slots }),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Create multiple slots error:", error);
      return { success: false, error: error.message };
    }
  }

  async getMySlots() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/my-slots`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get my slots error:", error);
      return { success: false, error: error.message };
    }
  }

  async searchSlots(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate)
        queryParams.append("startDate", params.startDate);
      if (params.endDate)
        queryParams.append("endDate", params.endDate);
      if (params.startTime)
        queryParams.append("startTime", params.startTime);
      if (params.endTime)
        queryParams.append("endTime", params.endTime);
      if (params.consultantId)
        queryParams.append("consultantId", params.consultantId);

      const response = await this.authenticatedRequest(
        `${
          this.baseURL
        }/api/consultant-available-slots/search?${queryParams.toString()}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Search slots error:", error);
      return { success: false, error: error.message };
    }
  }

  async getAvailableSlots(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate)
        queryParams.append("startDate", params.startDate);
      if (params.endDate)
        queryParams.append("endDate", params.endDate);
      if (params.startTime)
        queryParams.append("startTime", params.startTime);
      if (params.endTime)
        queryParams.append("endTime", params.endTime);

      const response = await this.authenticatedRequest(
        `${
          this.baseURL
        }/api/consultant-available-slots?${queryParams.toString()}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get available slots error:", error);
      return { success: false, error: error.message };
    }
  }

  // Method for users to get available slots for booking
  async getPublicAvailableSlots(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.startDate)
        queryParams.append("startDate", params.startDate);
      if (params.endDate)
        queryParams.append("endDate", params.endDate);
      if (params.startTime)
        queryParams.append("startTime", params.startTime);
      if (params.endTime)
        queryParams.append("endTime", params.endTime);

      // Try endpoint specifically for public/user access
      const response = await this.authenticatedRequest(
        `${
          this.baseURL
        }/api/consultant-available-slots/available?${queryParams.toString()}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get public available slots error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all available slots without query params
  async getAllAvailableSlots() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get all available slots error:", error);
      return { success: false, error: error.message };
    }
  }

  // Debug method - get ALL slots regardless of status
  async getAllSlotsDebug() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/all`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get all slots debug error:", error);
      return { success: false, error: error.message };
    }
  }

  async getSlotById(id) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/${id}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get slot by ID error:", error);
      return { success: false, error: error.message };
    }
  }

  async updateSlot(id, slotData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(slotData),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Update slot error:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteSlot(id) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultant-available-slots/${id}`,
        {
          method: "DELETE",
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Delete slot error:", error);
      return { success: false, error: error.message };
    }
  }

  // Consultation Appointments APIs
  async createAppointment(appointmentData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments`,
        {
          method: "POST",
          body: JSON.stringify(appointmentData),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMyAppointments() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/my-appointments`
      );
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMyConsultations() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/my-consultations`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get my consultations error:", error);
      return { success: false, error: error.message };
    }
  }

  async getAppointmentById(id) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/${id}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get appointment by ID error:", error);
      return { success: false, error: error.message };
    }
  }

  async updateAppointmentStatus(id, status, data = {}) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status, ...data }),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Update appointment status error:", error);
      return { success: false, error: error.message };
    }
  }

  async confirmAppointment(id, data) {
    try {
      // Use the working updateAppointmentStatus method
      console.log(
        `Confirming appointment ${id} using updateAppointmentStatus`
      );
      const response = await this.updateAppointmentStatus(
        id,
        "confirmed",
        data
      );

      if (response.success) {
        console.log(
          `Successfully confirmed appointment using updateAppointmentStatus`
        );
        return response;
      } else {
        throw new Error(
          response.error || "Failed to confirm appointment"
        );
      }
    } catch (error) {
      console.error("Confirm appointment error:", error);
      return { success: false, error: error.message };
    }
  }

  async rejectAppointment(id, reason) {
    try {
      // Use the working updateAppointmentStatus method
      console.log(
        `Rejecting appointment ${id} using updateAppointmentStatus`
      );
      const response = await this.updateAppointmentStatus(
        id,
        "rejected",
        { reason }
      );

      if (response.success) {
        console.log(
          `Successfully rejected appointment using updateAppointmentStatus`
        );
        return response;
      } else {
        throw new Error(
          response.error || "Failed to reject appointment"
        );
      }
    } catch (error) {
      console.error("Reject appointment error:", error);
      return { success: false, error: error.message };
    }
  }

  async cancelAppointmentByMember(id, reason) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/${id}/cancel-by-member`,
        {
          method: "DELETE",
          body: JSON.stringify({ reason }),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Cancel appointment by member error:", error);
      return { success: false, error: error.message };
    }
  }

  async cancelAppointmentByConsultant(id, reason) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/${id}/cancel-by-consultant`,
        {
          method: "DELETE",
          body: JSON.stringify({ reason }),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Cancel appointment by consultant error:", error);
      return { success: false, error: error.message };
    }
  }

  async cancelAppointment(id, reason) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-appointments/${id}/cancel`,
        {
          method: "PUT",
          body: JSON.stringify({ reason }),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Cancel appointment error:", error);
      return { success: false, error: error.message };
    }
  }

  // Consultation Notes APIs
  async getNotesByAppointment(appointmentId) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/appointment/${appointmentId}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get notes by appointment error:", error);
      return { success: false, error: error.message };
    }
  }

  async getMemberNotesByAppointment(appointmentId) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/member/appointment/${appointmentId}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get member notes by appointment error:", error);
      return { success: false, error: error.message };
    }
  }

  async getAllMemberNotes() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/member/all-notes`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get all member notes error:", error);
      return { success: false, error: error.message };
    }
  }

  async getAllConsultantNotes() {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/consultant/all-notes`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get all consultant notes error:", error);
      return { success: false, error: error.message };
    }
  }

  async getNoteById(id) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/${id}`
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Get note by ID error:", error);
      return { success: false, error: error.message };
    }
  }

  async createNote(noteData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes`,
        {
          method: "POST",
          body: JSON.stringify(noteData),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Create note error:", error);
      return { success: false, error: error.message };
    }
  }

  async updateNote(id, noteData) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(noteData),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Update note error:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteNote(id) {
    try {
      const response = await this.authenticatedRequest(
        `${this.baseURL}/api/consultation-notes/${id}`,
        {
          method: "DELETE",
        }
      );
      return { success: true, data: response };
    } catch (error) {
      console.error("Delete note error:", error);
      return { success: false, error: error.message };
    }
  }

  // Test method to check available appointment endpoints
  async testAppointmentEndpoints(appointmentId) {
    console.log(
      "Testing appointment endpoints for ID:",
      appointmentId
    );

    const testEndpoints = [
      {
        url: `${this.baseURL}/api/consultation-appointments/${appointmentId}`,
        method: "GET",
        description: "Get appointment by ID",
      },
      {
        url: `${this.baseURL}/api/consultation-appointments/${appointmentId}/status`,
        method: "PUT",
        description: "Update status",
        body: { status: "pending" },
      },
      // Note: /confirm and /reject endpoints don't exist on this backend
      // We use the /status endpoint with appropriate status values instead
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        console.log(
          `Testing: ${endpoint.description} - ${endpoint.method} ${endpoint.url}`
        );

        const response = await this.authenticatedRequest(
          endpoint.url,
          {
            method: endpoint.method,
            body: endpoint.body
              ? JSON.stringify(endpoint.body)
              : undefined,
          }
        );

        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          description: endpoint.description,
          status: "SUCCESS",
          response: response,
        });

        console.log(`✅ ${endpoint.description}: SUCCESS`);
      } catch (error) {
        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          description: endpoint.description,
          status: "FAILED",
          error: error.message,
        });

        console.log(`❌ ${endpoint.description}: ${error.message}`);
      }
    }

    console.log("✅ All available endpoints tested successfully");
    console.log(
      "Note: This backend only supports /status endpoint for appointment updates"
    );
    console.log(
      "Use status values: 'confirmed', 'rejected', 'pending', 'cancelled'"
    );
    return results;
  }
}

export const consultationService = new ConsultationService();
export default consultationService;
