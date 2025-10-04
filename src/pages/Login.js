// src/pages/Login.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service'; // Corrected import name
import { toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // For login errors
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    AuthService.login(username, password).then(
      () => {
        // ... inside authService.login().then(() => { ... })
toast.success('Login successful');
const userAfterLogin = AuthService.getCurrentUser(); // Read immediately after setting
console.log("Login.js: User data in localStorage right after set:", userAfterLogin);
console.log("Login.js: Attempting to navigate to /");
navigate('/'); // Navigate to dashboard/home
// window.location.reload(); // <-- Keep this commented out for now
// ... rest of the block

       // window.location.reload(); // Force reload to ensure navbar updates correctly
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        setMessage(resMessage); // Show error message from backend or generic error
        toast.error('Login failed: ' + resMessage);
      }
    ); // Removed finally block as setLoading is handled in success/error
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Login</Card.Title>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {message && (
                    <Alert variant="danger" className="mt-3">{message}</Alert>
                )}

                <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                    </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;