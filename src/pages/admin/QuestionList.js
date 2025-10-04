// src/pages/admin/QuestionList.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Modal, Form, Spinner, Row, Col } from 'react-bootstrap'; // Added Modal, Form, Spinner
import QuestionService from '../../services/question.service';
import SubjectService from '../../services/subject.service';
import { toast } from 'react-toastify';

const DEFAULT_QUESTION = {
    id: null,
    questionText: '',
    subjectId: '', // Will hold the ID of the selected subject
    topic: '',
    difficultyLevel: 'MEDIUM', // Default difficulty
    marks: 0
};

const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD']; // Define available levels

function QuestionList() {
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [listLoading, setListLoading] = useState(false); // Loading for the list
    const [listError, setListError] = useState(''); // Error for the list

    // --- Modal State ---
    const [showModal, setShowModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(DEFAULT_QUESTION);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false); // Loading for modal operations
    const [modalError, setModalError] = useState(''); // Error inside the modal
    // --- End Modal State ---


    useEffect(() => {
        fetchSubjectsAndQuestions();
    }, []);

    const fetchSubjectsAndQuestions = async () => {
        setListLoading(true);
        setListError('');
        try {
            // Fetch subjects first for the dropdown
            const subjectsResponse = await SubjectService.getAllSubjects();
            setSubjects(subjectsResponse.data || []); // Ensure subjects is always an array

             // Set default subject ID for 'Add New' form if subjects exist
             if (subjectsResponse.data && subjectsResponse.data.length > 0 && !currentQuestion.subjectId) {
                setCurrentQuestion(prev => ({ ...prev, subjectId: subjectsResponse.data[0].id }));
             }

            // Then fetch questions
            const questionsResponse = await QuestionService.getAllQuestions();
            setQuestions(questionsResponse.data || []); // Ensure questions is always an array

        } catch (err) {
            const errorMsg = 'Failed to fetch data.';
            setListError(errorMsg);
            console.error(err);
            toast.error(errorMsg);
        } finally {
            setListLoading(false);
        }
    };

    const getSubjectName = (subjectId) => {
        // Ensure subjectId is treated as a number for comparison if needed, or handle string IDs
        const subject = subjects.find(s => s.id == subjectId); // Use == for potential type flexibility or ensure types match
        return subject ? subject.name : 'Unknown Subject';
    };

    // --- Modal Handlers ---
    const handleShowModal = (question = null) => {
        setModalError(''); // Clear previous errors
        if (question) {
            // Edit Mode: Populate form with existing question data
            setCurrentQuestion({
                id: question.id,
                questionText: question.questionText || '',
                // Handle both direct subjectId or nested subject object
                subjectId: question.subjectId || question.subject?.id || (subjects.length > 0 ? subjects[0].id : ''),
                topic: question.topic || '',
                difficultyLevel: question.difficultyLevel || 'MEDIUM',
                marks: question.marks || 0
            });
            setIsEditMode(true);
        } else {
            // Add Mode: Reset form to defaults, ensuring a default subject is selected if available
             const defaultSubjId = subjects.length > 0 ? subjects[0].id : '';
             setCurrentQuestion({...DEFAULT_QUESTION, subjectId: defaultSubjId});
            setIsEditMode(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // Optional: Reset form state on close if desired, though handleShowModal resets it on open
        // setCurrentQuestion(DEFAULT_QUESTION);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingModal(true);
        setModalError('');

        // Ensure data types are correct, especially for numbers
        const questionData = {
            ...currentQuestion,
            subjectId: parseInt(currentQuestion.subjectId, 10),
            marks: parseInt(currentQuestion.marks, 10)
        };
         // Remove id from data if it's not needed for create (depends on backend)
        if (!isEditMode) {
            delete questionData.id;
        }


        // Validate required fields (basic example)
        if (!questionData.questionText || !questionData.subjectId || !questionData.topic || questionData.marks <= 0) {
             setModalError('Please fill in all required fields and ensure marks are positive.');
             setLoadingModal(false);
             toast.error('Validation failed.');
             return;
        }


        const action = isEditMode ? QuestionService.updateQuestion : QuestionService.createQuestion;
        const args = isEditMode ? [currentQuestion.id, questionData] : [questionData];

        action(...args)
            .then(() => {
                toast.success(`Question ${isEditMode ? 'updated' : 'created'} successfully!`);
                handleCloseModal();
                fetchSubjectsAndQuestions(); // Refresh the list
            })
            .catch(err => {
                const msg = `Failed to ${isEditMode ? 'update' : 'create'} question.`;
                const backendError = err.response?.data?.message || err.message || 'Unknown error';
                setModalError(`${msg} ${backendError}`);
                console.error(err);
                toast.error(msg);
            })
            .finally(() => setLoadingModal(false));
    };
    // --- End Modal Handlers ---

     const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            // Consider setting a specific loading state for delete if needed
            setListLoading(true); // Reuse list loading state for simplicity
            setListError('');
            QuestionService.deleteQuestion(id)
                .then(() => {
                    toast.success('Question deleted successfully!');
                    fetchSubjectsAndQuestions(); // Refresh list
                })
                .catch(err => {
                    const msg = 'Failed to delete question.';
                    const backendError = err.response?.data?.message || err.message || 'Unknown error';
                    setListError(`${msg} ${backendError}`);
                    console.error(err);
                    toast.error(msg);
                })
                .finally(() => setListLoading(false));
        }
    };


    return (
        <Container>
            <h2 className="my-3">Manage Questions</h2>
            {listError && <Alert variant="danger">{listError}</Alert>}
            {/* Attach handler to Add button */}
            <Button variant="primary" className="mb-3" onClick={() => handleShowModal()}>
                Add New Question
            </Button>

            {listLoading && <p>Loading questions...</p>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Question Text</th>
                        <th>Subject</th>
                        <th>Topic</th>
                        <th>Difficulty</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map(q => (
                        <tr key={q.id}>
                            <td>{q.id}</td>
                            <td>{q.questionText}</td>
                            <td>{getSubjectName(q.subjectId || q.subject?.id)}</td>
                            <td>{q.topic}</td>
                            <td>{q.difficultyLevel}</td>
                            <td>{q.marks}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleShowModal(q)} className="me-2">
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                     {(!listLoading && questions.length === 0) && (
                        <tr>
                            <td colSpan="7" className="text-center">No questions found.</td>
                        </tr>
                     )}
                </tbody>
            </Table>

            {/* Add/Edit Question Modal */}
            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Question' : 'Add New Question'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {modalError && <Alert variant="danger">{modalError}</Alert>}

                        <Form.Group className="mb-3" controlId="questionText">
                            <Form.Label>Question Text *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="questionText"
                                value={currentQuestion.questionText}
                                onChange={handleChange}
                                required
                                disabled={loadingModal}
                            />
                        </Form.Group>

                         <Form.Group className="mb-3" controlId="subjectId">
                            <Form.Label>Subject *</Form.Label>
                            <Form.Select
                                name="subjectId"
                                value={currentQuestion.subjectId}
                                onChange={handleChange}
                                required
                                disabled={loadingModal || subjects.length === 0}
                            >
                                {subjects.length === 0 && <option value="">Loading subjects...</option>}
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </Form.Select>
                         </Form.Group>

                         <Form.Group className="mb-3" controlId="topic">
                            <Form.Label>Topic *</Form.Label>
                            <Form.Control
                                type="text"
                                name="topic"
                                value={currentQuestion.topic}
                                onChange={handleChange}
                                required
                                disabled={loadingModal}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="difficultyLevel">
                                    <Form.Label>Difficulty Level *</Form.Label>
                                    <Form.Select
                                        name="difficultyLevel"
                                        value={currentQuestion.difficultyLevel}
                                        onChange={handleChange}
                                        required
                                        disabled={loadingModal}
                                    >
                                        {DIFFICULTY_LEVELS.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                             </Col>
                             <Col md={6}>
                                <Form.Group className="mb-3" controlId="marks">
                                    <Form.Label>Marks *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="marks"
                                        value={currentQuestion.marks}
                                        onChange={handleChange}
                                        min="1" // Ensure positive marks
                                        required
                                        disabled={loadingModal}
                                    />
                                </Form.Group>
                             </Col>
                        </Row>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loadingModal}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit" disabled={loadingModal}>
                            {loadingModal ? (
                                <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Saving...
                                </>
                            ) : (isEditMode ? 'Save Changes' : 'Create Question')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
}

export default QuestionList;