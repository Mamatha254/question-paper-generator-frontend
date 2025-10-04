// src/services/question.service.js
import axios from 'axios';
import authHeader from './auth.header';

const API_URL = 'http://localhost:8080/api/questions/';

const getAllQuestions = () => {
    return axios.get(API_URL ,{ headers: authHeader() });
};

const getQuestionById = (id) => {
    return axios.get(API_URL + id, { headers: authHeader() });
};

const createQuestion = (questionData) => {
    // Ensure questionData matches your backend QuestionRequest DTO
    return axios.post(API_URL, questionData, { headers: authHeader() });
};

const updateQuestion = (id, questionData) => {
    // Ensure questionData matches your backend QuestionRequest DTO
    return axios.put(API_URL + id, questionData, { headers: authHeader() });
};

const deleteQuestion = (id) => {
    return axios.delete(API_URL + id, { headers: authHeader() });
};

const getQuestionsBySubject = (subjectId) => {
    return axios.get(API_URL + 'subject/' + subjectId , { headers: authHeader() });
};


const QuestionService = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsBySubject,
};

export default QuestionService;