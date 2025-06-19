import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import { getAuthToken } from './authService';

const surveyService = {
  async getAppropriateAssessment() {
    const token = await getAuthToken();
    return axios.get(`${API_CONFIG.BASE_URL}/api/Surveys/appropriate`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
  },
  async getSurveyById(surveyId) {
    const token = await getAuthToken();
    return axios.get(`${API_CONFIG.BASE_URL}/api/Surveys/${surveyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
  },
  async getSurveyQuestions(surveyId) {
    const token = await getAuthToken();
    return axios.get(`${API_CONFIG.BASE_URL}/api/Surveys/${surveyId}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);
  },
  async submitSurveyAnswers(surveyId, answers) {
    const token = await getAuthToken();
    return axios.post(`${API_CONFIG.BASE_URL}/api/SurveyAnswer`, {
      surveyId,
      answers
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.data);
  }
};

export default surveyService;
