// src/pages/GeneratePaper.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import PaperService from '../services/paper.service';
import SubjectService from '../services/subject.service';
import { toast } from 'react-toastify';

function GeneratePaper() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [numQuestions, setNumQuestions] = useState(10); // Default value
    const [totalMarks, setTotalMarks] = useState(50); // Default value
    // Add state for other criteria like difficulty, topic if you implement them
    // const [difficulty, setDifficulty] = useState('');
    // const [topicFilter, setTopicFilter] = useState('');
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generationSuccess, setGenerationSuccess] = useState(false); // State to show success message

    useEffect(() => {
        setLoadingSubjects(true);
        SubjectService.getAllSubjects()
            .then(response => {
                setSubjects(response.data || []); // Ensure it's an array
                if (response.data && response.data.length > 0) {
                    setSelectedSubject(response.data[0].id); // Default to first subject ID
                }
            })
            .catch(err => {
                setError('Failed to load subjects.');
                toast.error('Failed to load subjects.');
                console.error("Subject Load Error:", err);
            })
            .finally(() => setLoadingSubjects(false));
    }, []);

    const handleGenerate = (e) => {
        e.preventDefault();
        setGenerating(true);
        setError('');
        setGenerationSuccess(false);

        // Find the name of the selected subject - needed for the request if backend requires it
        const selectedSubjectObject = subjects.find(sub => sub.id == selectedSubject); // Use == for possible type difference
        const subjectName = selectedSubjectObject ? selectedSubjectObject.name : '';

        const requestData = {
            subjectId: parseInt(selectedSubject, 10),
            // numberOfQuestions is often derived on backend based on marks/selection,
            // but pass if your backend Request DTO requires it.
            // numberOfQuestions: parseInt(numQuestions, 10),
            totalMarks: parseInt(totalMarks, 10),
            subjectName: subjectName, // Pass name if backend validation requires it
            // Add other optional criteria if implemented:
            // difficultyLevel: difficulty || null,
            // topic: topicFilter || null,
        };

        // Basic validation before sending
        if (!requestData.subjectId) {
            setError("Please select a subject.");
            setGenerating(false);
            return;
        }
        if (!requestData.subjectName) {
            setError("Could not find name for selected subject ID."); // Should not happen if subjects loaded
            setGenerating(false);
            return;
        }
        if (requestData.totalMarks <= 0) {
            setError("Total marks must be greater than 0.");
            setGenerating(false);
            return;
        }

        console.log("Sending generation request:", requestData); // Log request data

        PaperService.generatePaper(requestData)
            .then(response => {
                // --- START PDF DOWNLOAD LOGIC ---
                try {
                    // 1. Extract filename from header
                    const disposition = response.headers['content-disposition'];
                    let filename = 'question_paper.pdf'; // Default
                    if (disposition && disposition.includes('attachment')) {
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(disposition);
                        if (matches?.[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }
                    console.log("Download filename:", filename);

                    // 2. Create Blob from response data
                    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

                    // 3. Create Object URL
                    const url = window.URL.createObjectURL(pdfBlob);

                    // 4. Create temporary link and click it
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();

                    // 5. Clean up
                    link.parentNode.removeChild(link);
                    window.URL.revokeObjectURL(url); // Free up memory

                    toast.success('Question paper download started!');
                    setGenerationSuccess(true);

                } catch (downloadError) {
                     console.error("Error processing download:", downloadError);
                     setError("Paper generated, but failed to initiate download.");
                     toast.error("Download failed.");
                }
                // --- END PDF DOWNLOAD LOGIC ---
            })
            .catch(async err => { // Make catch async to await blob text reading
                let errorMsg = 'Failed to generate paper.';
                 console.error("Generation API Error Response:", err.response);

                // Try to read error message if backend sent JSON error even with blob request
                if (err.response && err.response.data && err.response.data instanceof Blob && err.response.data.type?.includes('json')) {
                    try {
                        const errorText = await err.response.data.text(); // Read blob as text
                        const jsonError = JSON.parse(errorText); // Parse JSON
                        errorMsg += ` ${jsonError.message || ''}`;
                         console.error("Parsed Backend Error:", jsonError);
                    } catch (parseError) {
                         console.error("Failed to parse error blob:", parseError);
                         // Fallback if parsing fails
                         errorMsg += ` ${err.response.statusText || 'Backend error'}`;
                    }
                } else if (err.response?.data?.message) { // Standard JSON error response
                    errorMsg += ` ${err.response.data.message}`;
                } else if (err.message) { // Network or other generic error
                     errorMsg += ` ${err.message}`;
                } else {
                    errorMsg += " Unknown error."
                }

                 setError(errorMsg);
                 toast.error(errorMsg);
            })
            .finally(() => {
                setGenerating(false);
            });
    };


    return (
        <Container className="mt-4">
            <Row>
                <Col md={7}> {/* Adjusted column size */}
                    <Card>
                        <Card.Header as="h5">Generate Question Paper</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                            <Form onSubmit={handleGenerate}>
                                <Form.Group className="mb-3" controlId="subjectSelect">
                                    <Form.Label>Subject *</Form.Label>
                                    <Form.Select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        required
                                        disabled={loadingSubjects || generating || subjects.length === 0}
                                    >
                                        {loadingSubjects && <option>Loading subjects...</option>}
                                        {!loadingSubjects && subjects.length === 0 && <option>No subjects available</option>}
                                        {subjects.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="totalMarks">
                                    <Form.Label>Total Marks *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(e.target.value)}
                                        min="1"
                                        required
                                        disabled={generating}
                                    />
                                </Form.Group>

                                {/* Remove Number of Questions unless backend REQUIRES it */}
                                {/* <Form.Group className="mb-3" controlId="numQuestions">
                                    <Form.Label>Number of Questions (Optional/Informational)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(e.target.value)}
                                        min="1"
                                        // required // Likely not required
                                        disabled={generating}
                                    />
                                </Form.Group> */}

                                {/* Add more optional fields for difficulty, topics etc. here if needed */}
                                {/* Example:
                                <Form.Group className="mb-3" controlId="difficultyLevel">
                                    <Form.Label>Difficulty Level (Optional)</Form.Label>
                                    <Form.Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={generating}>
                                        <option value="">Any</option>
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </Form.Select>
                                </Form.Group>
                                */}


                                <Button variant="primary" type="submit" disabled={generating || loadingSubjects || !selectedSubject}>
                                    {generating ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate & Download PDF' // Updated button text
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5}> {/* Adjusted column size */}
                    {/* --- Result Section (shows status) --- */}
                    <Card>
                        <Card.Header as="h5">Generation Status</Card.Header>
                        <Card.Body style={{ minHeight: '200px'}}>
                            {generating && <div className="text-center"><Spinner animation="border" /> <p>Generating PDF, please wait...</p></div>}
                            {!generating && !generationSuccess && !error && <p>Enter criteria and click "Generate & Download PDF" to start.</p>}
                            {generationSuccess && <Alert variant="success">Paper generated! Download started.</Alert>}
                            {/* Error is now displayed above the form */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default GeneratePaper;