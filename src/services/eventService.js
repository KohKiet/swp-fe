import axios from 'axios';
import { API_CONFIG } from './apiConfig';

// Lấy URL base từ biến môi trường hoặc mặc định
const API_URL = process.env.REACT_APP_API_URL || API_CONFIG.BASE_URL;

// Helper function để tạo headers với token
const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function để thực hiện API call
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: getHeaders(),
      timeout: 10000, // 10 second timeout
    };
    
    if (data) {
      config.data = data;
    }
    
    console.log(`🚀 API Call: ${method} ${config.url}`, {
      headers: config.headers,
      data: data
    });
    
    const response = await axios(config);
    
    console.log(`✅ API Response: ${method} ${config.url}`, {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ API Error: ${method} ${API_URL}${endpoint}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Xử lý lỗi 401 (token hết hạn)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullname');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userGender');
      localStorage.removeItem('userDateOfBirth');
      localStorage.removeItem('userAddress');
      window.location.href = '/login';
    }
    throw error;
  }
};

const eventService = {  // Lấy tất cả sự kiện
  getAllEvents: async () => {
    try {
      const response = await apiCall('GET', API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS);
      return response;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  // Lấy sự kiện sắp diễn ra
  getUpcomingEvents: async () => {
    try {      const response = await apiCall('GET', API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_UPCOMING);
      return response;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Lấy sự kiện đã kết thúc
  getPastEvents: async () => {
    try {      const response = await apiCall('GET', API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_PAST);
      return response;
    } catch (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }
  },
  // Lấy sự kiện theo ID
  getEventById: async (id) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_BY_ID.replace('{id}', id);      const response = await apiCall('GET', endpoint);
      return response;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  // Lấy sự kiện của người dùng hiện tại
  getMyEvents: async () => {
    try {
      const response = await apiCall('GET', API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_MY_EVENTS);
      return response;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },

  // Tạo sự kiện mới
  createEvent: async (eventData) => {
    try {
      const response = await apiCall('POST', API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS, eventData);
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Cập nhật sự kiện
  updateEvent: async (id, eventData) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_BY_ID.replace('{id}', id);
      const response = await apiCall('PUT', endpoint, eventData);
      return response;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },

  // Xóa sự kiện
  deleteEvent: async (id) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.COMMUNITY_EVENTS_BY_ID.replace('{id}', id);
      const response = await apiCall('DELETE', endpoint);
      return response;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },

  // Đăng ký tham gia sự kiện
  registerForEvent: async (eventId) => {
    try {
      const response = await apiCall('POST', API_CONFIG.ENDPOINTS.EVENT_PARTICIPANTS_REGISTER, {
        eventId: eventId
      });
      return response;
    } catch (error) {
      console.error(`Error registering for event ${eventId}:`, error);
      throw error;
    }
  },

  // Hủy đăng ký tham gia sự kiện
  unregisterFromEvent: async (eventId) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_PARTICIPANTS_UNREGISTER.replace('{eventId}', eventId);
      const response = await apiCall('DELETE', endpoint);
      return response;
    } catch (error) {
      console.error(`Error unregistering from event ${eventId}:`, error);
      throw error;
    }
  },  // Kiểm tra trạng thái đăng ký
  checkRegistrationStatus: async (eventId) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_PARTICIPANTS_CHECK_REGISTRATION.replace('{eventId}', eventId);
      console.log('🔍 Calling registration check API:', {
        endpoint: `${API_URL}${endpoint}`,
        eventId: eventId,
        headers: getHeaders()
      });
      
      const response = await apiCall('GET', endpoint);
      
      console.log('📡 Registration check API response:', {
        endpoint: endpoint,
        response: response,
        responseType: typeof response,
        responseKeys: Object.keys(response || {}),
        dataKeys: Object.keys(response?.data || {}),
        fullStructure: JSON.stringify(response, null, 2)
      });
      
      // Normalize response structure để đảm bảo consistent
      let normalizedResponse = {
        success: response?.success || (response?.data !== undefined),
        data: {
          isRegistered: false // default
        }
      };
      
      // Kiểm tra các pattern response khác nhau từ backend
      if (response?.data?.isRegistered !== undefined) {
        // Pattern 1: { success: true, data: { isRegistered: true/false } }
        normalizedResponse.data.isRegistered = Boolean(response.data.isRegistered);
      } else if (response?.isRegistered !== undefined) {
        // Pattern 2: { success: true, isRegistered: true/false }
        normalizedResponse.data.isRegistered = Boolean(response.isRegistered);
      } else if (response?.data === true || response?.data === false) {
        // Pattern 3: { success: true, data: true/false }
        normalizedResponse.data.isRegistered = Boolean(response.data);
      } else if (typeof response?.data === 'object' && response?.data !== null) {
        // Pattern 4: Check if object has registration info
        const hasRegistration = response.data.registered || response.data.isParticipant || response.data.joined;
        normalizedResponse.data.isRegistered = Boolean(hasRegistration);
      }
      
      console.log('📋 Normalized registration response:', {
        original: response,
        normalized: normalizedResponse,
        finalStatus: normalizedResponse.data.isRegistered
      });
      
      return normalizedResponse;
    } catch (error) {
      console.error(`❌ Error checking registration status for event ${eventId}:`, {
        error: error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // ========== EVENT FEEDBACK FUNCTIONS ==========

  // Lấy feedback theo event ID
  getFeedbackByEvent: async (eventId) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_FEEDBACK_BY_EVENT.replace('{eventId}', eventId);
      const response = await apiCall('GET', endpoint);
      return response;
    } catch (error) {
      console.error(`Error fetching feedback for event ${eventId}:`, error);
      throw error;
    }
  },

  // Lấy feedback của user hiện tại
  getMyFeedback: async () => {
    try {
      const response = await apiCall('GET', API_CONFIG.ENDPOINTS.EVENT_FEEDBACK_BY_USER);
      return response;
    } catch (error) {
      console.error('Error fetching my feedback:', error);
      throw error;
    }
  },

  // Kiểm tra user đã đánh giá event chưa
  checkUserFeedbackStatus: async (eventId) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_FEEDBACK_CHECK_USER.replace('{eventId}', eventId);
      const response = await apiCall('GET', endpoint);
      return response;
    } catch (error) {
      console.error(`Error checking feedback status for event ${eventId}:`, error);
      throw error;
    }
  },

  // Gửi feedback cho event
  submitFeedback: async (feedbackData) => {
    try {
      const response = await apiCall('POST', API_CONFIG.ENDPOINTS.EVENT_FEEDBACK_SUBMIT, feedbackData);
      return response;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Cập nhật feedback
  updateFeedback: async (id, feedbackData) => {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_FEEDBACK_BY_ID.replace('{id}', id);
      const response = await apiCall('PUT', endpoint, feedbackData);
      return response;
    } catch (error) {
      console.error(`Error updating feedback ${id}:`, error);
      throw error;
    }
  }
};

export default eventService;
