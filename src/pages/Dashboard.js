// src/pages/Dashboard.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AuthService from '../services/auth.service';

function Dashboard() {
    const currentUser = AuthService.getCurrentUser();

    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header as="h5">Dashboard</Card.Header>
                        <Card.Body>
                            <Card.Title>Welcome, {currentUser?.username || 'Guest'}!</Card.Title>
                            <Card.Text>
                                This is your dashboard. Use the navigation bar to access different features.
                                {currentUser && (
                                    <>
                                     <br/> Your Role: {currentUser.roles.join(', ').replace(/ROLE_/g, '')}
                                    </>
                                )}
                            </Card.Text>
                            {/* Add links or widgets relevant to the user's role here */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;