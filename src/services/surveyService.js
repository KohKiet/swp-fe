import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import { getAuthToken } from './authService';

const API_URL = `${API_CONFIG.BASE_URL}/api/Surveys`;

const getAuthHeader = async () => {
  const token = await getAuthToken();
  return { headers: { Authorization: `Bearer ${token}` } };
};

const surveyService = {
  async checkSurveyStatus() {
    const config = await getAuthHeader();
    const res = await axios.get(`${API_URL}/check-status`, config);
    return res.data;
  },
  async getSuitableSurvey() {
    const config = await getAuthHeader();
    const res = await axios.get(`${API_URL}/get-suitable`, config);
    return res.data;
  },
  async getSurveyById(surveyId) {
    const res = await axios.get(`${API_URL}/${surveyId}`);
    return res.data;
  },
  async submitSurvey(surveyId, answers) {
    const config = await getAuthHeader();
    const res = await axios.post(`${API_URL}/${surveyId}/submit`, { answers }, config);
    return res.data;
  },
  async getHistory() {
    const config = await getAuthHeader();
    const res = await axios.get(`${API_URL}/history`, config);
    return res.data;
  }
};

export default surveyService;
