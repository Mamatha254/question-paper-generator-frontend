// src/components/CustomNavbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AuthService from '../services/auth.service'; // Corrected import name

function CustomNavbar() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser(); // Use service method

  const logOut = () => {
    AuthService.logout(); // Use service method
    toast.success('Logged out successfully');
    navigate('/login');
    // Optionally force a re-render if state isn't updating navbar correctly
    window.location.reload(); // Simple way, but not ideal React practice
  };

  const isAdmin = user && user.roles.includes('ROLE_ADMIN');
  const isFaculty = user && user.roles.includes('ROLE_FACULTY');

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Question Paper Generator</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
             {/* Link to Home/Dashboard */}
            {user && <Nav.Link as={Link} to="/">Dashboard</Nav.Link>}

            {/* Admin Links */}
            {isAdmin && (
              <NavDropdown title="Admin" id="admin-nav-dropdown">
                <NavDropdown.Item as={Link} to="/admin/subjects">Manage Subjects</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/questions">Manage Questions</NavDropdown.Item>
                 {/* Add other admin links here if needed */}
              </NavDropdown>
            )}

            {/* Faculty/Admin Links */}
            {(isFaculty || isAdmin) && (
              <Nav.Link as={Link} to="/generate-paper">Generate Paper</Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, {user.username} ({user.roles[0]?.replace('ROLE_', '')})
                </Navbar.Text>
                <Button variant="outline-light" onClick={logOut}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                {/* Optionally add register link if desired */}
                { <Nav.Link as={Link} to="/register">Register</Nav.Link> }
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;