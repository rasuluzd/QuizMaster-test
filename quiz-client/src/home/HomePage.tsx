import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as QuizService from '../services/QuizService';
import type { Quiz } from '../types/quiz';

const HomePage: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Load quizzes on startup
    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await QuizService.getAllQuizzes();
            setQuizzes(data);
        } catch (err) {
            setError("Failed to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking the card itself
        if (window.confirm("Delete this quiz?")) {
            await QuizService.deleteQuiz(id);
            loadQuizzes(); // Refresh the list
        }
    };

    return (
        <Container>
            <h4 className="mb-4 text-muted">My Quizzes</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Row xs={1} md={3} lg={4} className="g-4">
                    {/* 1. CREATE NEW CARD (The Plus Button) */}
                    <Col>
                        <Card 
                            className="h-100 d-flex justify-content-center align-items-center"
                            style={{ minHeight: '200px', cursor: 'pointer', border: '2px dashed #ccc' }}
                            onClick={() => navigate('/create-quiz')}
                        >
                            <div className="text-center text-primary">
                                <div style={{ fontSize: '3rem' }}>+</div>
                                <div>Create New</div>
                            </div>
                        </Card>
                    </Col>

                    {/* 2. EXISTING QUIZZES */}
                    {quizzes.map((quiz) => (
                        <Col key={quiz.quizId}>
                            <Card 
                                className="h-100 shadow-sm" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/take-quiz/${quiz.quizId}`)}
                            >
                                <div style={{ height: '8px', background: '#673ab7' }}></div>
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <Card.Title className="text-truncate">{quiz.title}</Card.Title>
                                        
                                        {/* Three Dots Menu */}
                                        <Dropdown onClick={(e) => e.stopPropagation()}>
                                            <Dropdown.Toggle variant="link" className="text-dark p-0 text-decoration-none" id={`dropdown-${quiz.quizId}`}>
                                                &#8942;
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => navigate(`/edit-quiz/${quiz.quizId}`)}>Edit</Dropdown.Item>
                                                <Dropdown.Item onClick={(e) => handleDelete(quiz.quizId, e)} className="text-danger">Delete</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <Card.Text className="small text-muted">{quiz.questions.length} Questions</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default HomePage;