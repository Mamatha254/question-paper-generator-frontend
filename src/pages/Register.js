// src/pages/Register.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap'; // Import Form components
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { toast } from 'react-toastify';

// Define available roles (match backend expectations)
const AVAILABLE_ROLES = [
    { value: 'ROLE_FACULTY', label: 'Faculty' },
    { value: 'ROLE_ADMIN', label: 'Admin' }, // Caution: Allowing self-admin registration is risky
];

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // --- ADDED role state ---
  const [role, setRole] = useState(AVAILABLE_ROLES[0].value); // Default to the first role (Faculty)
  // --- END ADDED state ---
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // --- UPDATED call to pass role ---
    AuthService.register(username, password, role).then(
      (response) => {
        const successMsg = response.data?.message || 'Registration successful!';
        toast.success(successMsg);
        navigate('/login');
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        toast.error('Registration failed: ' + resMessage);
        setLoading(false); // Keep loading false on error
      }
    );
     // Removed finally block as setLoading is handled in success/error explicitly
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Register</Card.Title>
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formRegisterUsername">
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

                <Form.Group className="mb-3" controlId="formRegisterPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    // Add pattern or minLength validation if desired
                  />
                </Form.Group>

                {/* --- ADDED Role Selection Dropdown --- */}
                <Form.Group className="mb-3" controlId="formRegisterRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={loading}
                        required // Make role selection mandatory
                    >
                        {AVAILABLE_ROLES.map(r => (
                           <option key={r.value} value={r.value}>
                               {r.label}
                           </option>
                        ))}
                    </Form.Select>
                    {role === 'ROLE_ADMIN' && (
                        <Alert variant="warning" className="mt-2">
                            Warning: Registering as Admin grants full system access.
                        </Alert>
                    )}
                </Form.Group>
                {/* --- END ADDED Dropdown --- */}


                {message && (
                    <Alert variant="danger" className="mt-3">{message}</Alert>
                )}

                <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Registering...
                        </>
                    ) : (
                        'Register'
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

export default Register;