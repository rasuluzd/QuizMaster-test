import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import * as AuthService from './AuthService';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await AuthService.register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName
            });
            
            setSuccess("Registration successful! Redirecting to login...");
            // Wait 2 seconds so user sees success message, then redirect
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.message || "Registration failed.");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Card style={{ width: '500px' }} className="p-4 shadow-sm">
                <h2 className="text-center mb-4">Create Account</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control 
                                    type="text" name="firstName" placeholder="First Name"
                                    value={formData.firstName} onChange={handleChange} required 
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control 
                                    type="text" name="lastName" placeholder="Last Name"
                                    value={formData.lastName} onChange={handleChange} required 
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control 
                            type="email" name="email" placeholder="Enter email"
                            value={formData.email} onChange={handleChange} required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control 
                            type="password" name="password" placeholder="Password"
                            value={formData.password} onChange={handleChange} required 
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control 
                            type="password" name="confirmPassword" placeholder="Confirm Password"
                            value={formData.confirmPassword} onChange={handleChange} required 
                        />
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100">
                        Sign Up
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <small>Already have an account? <Link to="/login">Login</Link></small>
                </div>
            </Card>
        </Container>
    );
};

export default RegisterPage;