// Admin Survey Service
import axios from 'axios';
import { API_CONFIG } from './apiConfig';

const BASE_URL = API_CONFIG.BASE_URL;
const ENDPOINTS = API_CONFIG.ENDPOINTS;

const adminSurveyService = {
  // Survey CRUD
  getAllSurveys: (config = {}) => axios.get(BASE_URL + ENDPOINTS.ADMIN_SURVEY_LIST, config || {}),
  createSurvey: (data, config = {}) => axios.post(BASE_URL + ENDPOINTS.ADMIN_SURVEY_CREATE, data, config || {}),
  updateSurvey: (id, data, config = {}) => axios.put(BASE_URL + ENDPOINTS.ADMIN_SURVEY_UPDATE.replace('{id}', id), data, config || {}),
  deleteSurvey: (id, config = {}) => axios.delete(BASE_URL + ENDPOINTS.ADMIN_SURVEY_DELETE.replace('{id}', id), config || {}),

  // Survey Question CRUD
  getSurveyQuestions: (surveyId, config = {}) => axios.get(BASE_URL + ENDPOINTS.ADMIN_SURVEY_QUESTIONS.replace('{surveyId}', surveyId), config || {}),
  createQuestion: (data, config = {}) => axios.post(BASE_URL + ENDPOINTS.ADMIN_SURVEY_QUESTION_CREATE, data, config || {}),
  updateQuestion: (id, data, config = {}) => axios.put(BASE_URL + ENDPOINTS.ADMIN_SURVEY_QUESTION_UPDATE.replace('{id}', id), data, config || {}),
  deleteQuestion: (id, config = {}) => axios.delete(BASE_URL + ENDPOINTS.ADMIN_SURVEY_QUESTION_DELETE.replace('{id}', id), config || {}),

  // Survey Answer CRUD
  getQuestionAnswers: (questionId, config = {}) => axios.get(BASE_URL + ENDPOINTS.ADMIN_QUESTION_ANSWERS.replace('{questionId}', questionId), config || {}),
  createAnswer: (data, config = {}) => axios.post(BASE_URL + ENDPOINTS.ADMIN_SURVEY_ANSWER_CREATE, data, config || {}),
  updateAnswer: (id, data, config = {}) => axios.put(BASE_URL + ENDPOINTS.ADMIN_SURVEY_ANSWER_UPDATE.replace('{id}', id), data, config || {}),
  deleteAnswer: (id, config = {}) => axios.delete(BASE_URL + ENDPOINTS.ADMIN_SURVEY_ANSWER_DELETE.replace('{id}', id), config || {}),
};

export default adminSurveyService;
