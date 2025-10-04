// src/pages/admin/SubjectList.js
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import SubjectService from '../../services/subject.service';
import { toast } from 'react-toastify';

function SubjectList() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentSubject, setCurrentSubject] = useState({ id: null, name: '', description: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = () => {
        setLoading(true);
        setError('');
        SubjectService.getAllSubjects()
            .then(response => {
                setSubjects(response.data);
            })
            .catch(err => {
                setError('Failed to fetch subjects.');
                console.error(err);
                toast.error('Failed to fetch subjects.');
            })
            .finally(() => setLoading(false));
    };

    const handleShowModal = (subject = null) => {
        if (subject) {
            setCurrentSubject({ id: subject.id, name: subject.name, description: subject.description || '' });
            setIsEditMode(true);
        } else {
            setCurrentSubject({ id: null, name: '', description: '' });
            setIsEditMode(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentSubject({ id: null, name: '', description: '' }); // Reset form
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentSubject(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const action = isEditMode ? SubjectService.updateSubject : SubjectService.createSubject;
        const subjectData = { name: currentSubject.name, description: currentSubject.description };
        const subjectId = isEditMode ? currentSubject.id : undefined;

        action(subjectId ?? subjectData, isEditMode ? subjectData : undefined)
            .then(() => {
                toast.success(`Subject ${isEditMode ? 'updated' : 'created'} successfully!`);
                handleCloseModal();
                fetchSubjects(); // Refresh list
            })
            .catch(err => {
                const msg = `Failed to ${isEditMode ? 'update' : 'create'} subject.`;
                setError(msg + (err.response?.data?.message || ''));
                console.error(err);
                toast.error(msg);
            })
            .finally(() => setLoading(false));
    };

     const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this subject? This might affect existing questions.')) {
            setLoading(true);
            setError('');
            SubjectService.deleteSubject(id)
                .then(() => {
                    toast.success('Subject deleted successfully!');
                    fetchSubjects(); // Refresh list
                })
                .catch(err => {
                    const msg = 'Failed to delete subject.';
                    setError(msg + (err.response?.data?.message || ''));
                    console.error(err);
                    toast.error(msg);
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <Container>
            <h2 className="my-3">Manage Subjects</h2>
             {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Add New Subject
            </Button>

            {loading && !showModal && <p>Loading subjects...</p>} {/* Show loading text only for list */}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map(subject => (
                        <tr key={subject.id}>
                            <td>{subject.id}</td>
                            <td>{subject.name}</td>
                            <td>{subject.description}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleShowModal(subject)} className="me-2">
                                    Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(subject.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

             {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Edit Subject' : 'Add New Subject'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                         {error && <Alert variant="danger">{error}</Alert>} {/* Error inside modal */}
                        <Form.Group className="mb-3" controlId="subjectName">
                            <Form.Label>Subject Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentSubject.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="subjectDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={currentSubject.description}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Subject')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default SubjectList;