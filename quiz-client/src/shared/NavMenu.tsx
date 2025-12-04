import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const NavMenu: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="white" expand="lg" className="shadow-sm mb-4" sticky="top">
            <Container>
                {/* LOGO SECTION */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    {/* Ensure you have logo.png in the public folder */}
                    <img
                        src="/logo.svg" // Using vite.svg as placeholder, change to your logo
                        alt="Logo"
                        height="30"
                        className="d-inline-block align-top me-2"
                    />
                    <span className="fw-bold text-primary">QuizMaster</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="light" id="dropdown-user">
                                    <span className="fw-bold text-dark">{user?.sub}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-primary">Login</Link>
                                <Link to="/register" className="btn btn-primary">Sign Up</Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavMenu;