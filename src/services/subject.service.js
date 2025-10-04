// src/services/subject.service.js
import axios from 'axios';
import authHeader from './auth.header';

const API_URL = 'http://localhost:8080/api/subjects/';

const getAllSubjects = () => {
    return axios.get(API_URL, { headers: authHeader() });
};

const getSubjectById = (id) => {
    return axios.get(API_URL + id, { headers: authHeader() });
};

const createSubject = (subjectData) => {
    return axios.post(API_URL, subjectData, { headers: authHeader() });
};

const updateSubject = (id, subjectData) => {
    return axios.put(API_URL + id, subjectData, { headers: authHeader() });
};

const deleteSubject = (id) => {
    return axios.delete(API_URL + id, { headers: authHeader() });
};

const SubjectService = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
};

export default SubjectService;