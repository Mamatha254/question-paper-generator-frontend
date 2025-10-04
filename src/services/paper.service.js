// src/services/paper.service.js
import axios from 'axios';
import authHeader from './auth.header';

const API_URL = 'http://localhost:8080/api/papers/';

const generatePaper = (generationRequest) => {
    // Ensure generationRequest includes subjectId, totalMarks, numberOfQuestions
    // and subjectName if you didn't remove it from backend request DTO
    return axios.post(API_URL + 'generate', generationRequest, {
        headers: authHeader(),
        responseType: 'blob' // <-- IMPORTANT: Expect binary data (blob)
    });
};

const PaperService = {
    generatePaper,
};

export default PaperService;