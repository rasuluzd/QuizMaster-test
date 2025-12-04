import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import * as QuizService from '../services/QuizService';
import type { Quiz } from '../types/quiz';

const QuizTakerPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<number, any>>({}); // Store user answers
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        QuizService.getQuizById(Number(id))
            .then((data) => {
                setQuiz(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load quiz.");
                setLoading(false);
            });
    }, [id]);

    // --- HANDLE INPUT CHANGES ---

    // Handle Radio (Single Choice)
    const handleSingleChange = (questionId: number, optionId: number) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    // Handle Checkbox (Multiple Choice)
    const handleMultipleChange = (questionId: number, optionId: number, checked: boolean) => {
        const currentSelected = (answers[questionId] as number[]) || [];
        if (checked) {
            setAnswers({ ...answers, [questionId]: [...currentSelected, optionId] });
        } else {
            setAnswers({ ...answers, [questionId]: currentSelected.filter(id => id !== optionId) });
        }
    };

    // Handle Text Input
    const handleTextChange = (questionId: number, text: string) => {
        setAnswers({ ...answers, [questionId]: text });
    };

    // --- SCORING SYSTEM ---

    // Calculate total possible points
    const getTotalPoints = () => {
        if (!quiz) return 0;
        return quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    };

    const handleSubmit = () => {
        if (!quiz) return;
        let calculatedScore = 0;

        quiz.questions.forEach((q) => {
            const userAnswer = answers[q.questionId];
            const questionPoints = q.points || 1;

            if (q.type === 0) { 
                // Single Choice: User ID matches Correct ID
                const correctOption = q.options.find(o => o.isCorrect);
                if (correctOption && userAnswer === correctOption.optionId) {
                    calculatedScore += questionPoints;
                }
            } else if (q.type === 1) {
                // Multiple Choice: Arrays must match exactly (contain all correct, no incorrect)
                const correctIds = q.options.filter(o => o.isCorrect).map(o => o.optionId);
                const userIds = (userAnswer as number[]) || [];
                
                const isCorrect = 
                    correctIds.length === userIds.length && 
                    correctIds.every(id => userIds.includes(id));
                
                if (isCorrect) calculatedScore += questionPoints;
            } else if (q.type === 2) {
                // Text: Case-insensitive string match
                const correctText = q.options[0]?.text || "";
                if (String(userAnswer || "").trim().toLowerCase() === correctText.trim().toLowerCase()) {
                    calculatedScore += questionPoints;
                }
            }
        });

        setScore(calculatedScore);
        setSubmitted(true);
        window.scrollTo(0, 0); // Scroll to top to see score
    };

    if (loading) return <div className="text-center mt-5">Loading Quiz...</div>;
    if (error || !quiz) return <Alert variant="danger">{error || "Quiz not found"}</Alert>;

    // --- RESULT VIEW ---
    if (submitted) {
        const totalPoints = getTotalPoints();
        const percentage = Math.round((score / totalPoints) * 100);
        let variant = "danger";
        if (percentage >= 50) variant = "warning";
        if (percentage >= 80) variant = "success";

        // Helper to check if user got a question correct
        const isQuestionCorrect = (q: typeof quiz.questions[0]) => {
            const userAnswer = answers[q.questionId];
            if (q.type === 0) {
                const correctOption = q.options.find(o => o.isCorrect);
                return correctOption && userAnswer === correctOption.optionId;
            } else if (q.type === 1) {
                const correctIds = q.options.filter(o => o.isCorrect).map(o => o.optionId);
                const userIds = (userAnswer as number[]) || [];
                return correctIds.length === userIds.length && correctIds.every(id => userIds.includes(id));
            } else if (q.type === 2) {
                const correctText = q.options[0]?.text || "";
                return String(userAnswer || "").trim().toLowerCase() === correctText.trim().toLowerCase();
            }
            return false;
        };

        return (
            <Container className="mt-5">
                <Card className="p-5 shadow text-center mb-4">
                    <h2 className="mb-4">Quiz Completed!</h2>
                    <h1 className={`display-1 text-${variant}`}>{score} / {totalPoints} pts</h1>
                    <p className="lead">You scored {percentage}%</p>
                    <ProgressBar now={percentage} variant={variant} className="mb-4" style={{ height: '20px' }} />
                    <div className="d-flex justify-content-center gap-3">
                        <Button variant="outline-secondary" onClick={() => navigate('/')}>Back to Dashboard</Button>
                        <Button variant="primary" onClick={() => window.location.reload()}>Retake Quiz</Button>
                    </div>
                </Card>

                {/* ANSWER SHEET */}
                <h3 className="mb-3">Answer Sheet</h3>
                {quiz.questions.map((q, index) => {
                    const correct = isQuestionCorrect(q);
                    const userAnswer = answers[q.questionId];

                    return (
                        <Card key={q.questionId} className={`mb-3 border-${correct ? 'success' : 'danger'}`}>
                            <Card.Body>
                                <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <span className={`badge bg-${correct ? 'success' : 'danger'} me-2`}>
                                            {correct ? '✓' : '✗'}
                                        </span>
                                        <span className="badge bg-secondary me-2">{index + 1}</span>
                                        {q.text}
                                    </div>
                                    <span className={`badge bg-${correct ? 'success' : 'danger'}`}>
                                        {correct ? (q.points || 1) : 0} / {q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}
                                    </span>
                                </Card.Title>

                                {/* Show options with correct/wrong indicators */}
                                {(q.type === 0 || q.type === 1) && q.options.map(opt => {
                                    const isCorrectOption = opt.isCorrect;
                                    const isUserSelected = q.type === 0 
                                        ? userAnswer === opt.optionId 
                                        : ((userAnswer as number[]) || []).includes(opt.optionId);

                                    let optionStyle = {};
                                    let icon = '';
                                    if (isCorrectOption) {
                                        optionStyle = { color: 'green', fontWeight: 'bold' };
                                        icon = '✓ ';
                                    }
                                    if (isUserSelected && !isCorrectOption) {
                                        optionStyle = { color: 'red', textDecoration: 'line-through' };
                                        icon = '✗ ';
                                    }

                                    return (
                                        <div key={opt.optionId} style={optionStyle} className="mb-1">
                                            {icon}{opt.text}
                                            {isUserSelected && <span className="text-muted ms-2">(your answer)</span>}
                                        </div>
                                    );
                                })}

                                {/* Text answer display */}
                                {q.type === 2 && (
                                    <div>
                                        <div><strong>Your answer:</strong> {userAnswer || <em>(no answer)</em>}</div>
                                        <div style={{ color: 'green' }}><strong>Correct answer:</strong> {q.options[0]?.text}</div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    );
                })}
            </Container>
        );
    }

    // --- QUIZ FORM VIEW ---
    return (
        <Container className="mb-5">
            <div className="border-bottom mb-4 pb-3">
                <h1>{quiz.title}</h1>
                <p className="text-muted lead">{quiz.description}</p>
            </div>

            {quiz.questions.map((q, index) => (
                <Card key={q.questionId} className="mb-4 shadow-sm">
                    <Card.Body>
                        <Card.Title className="mb-3 d-flex justify-content-between align-items-center">
                            <div>
                                <span className="badge bg-secondary me-2">{index + 1}</span>
                                {q.text}
                            </div>
                            <span className="badge bg-primary">{q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}</span>
                        </Card.Title>

                        {/* RENDER OPTIONS BASED ON TYPE */}
                        
                        {/* Type 0: Single Choice (Radio) */}
                        {q.type === 0 && q.options.map(opt => (
                            <Form.Check
                                key={opt.optionId}
                                type="radio"
                                label={opt.text}
                                name={`question-${q.questionId}`}
                                id={`opt-${opt.optionId}`}
                                className="mb-2"
                                onChange={() => handleSingleChange(q.questionId, opt.optionId)}
                            />
                        ))}

                        {/* Type 1: Multiple Choice (Checkbox) */}
                        {q.type === 1 && q.options.map(opt => (
                            <Form.Check
                                key={opt.optionId}
                                type="checkbox"
                                label={opt.text}
                                id={`opt-${opt.optionId}`}
                                className="mb-2"
                                onChange={(e) => handleMultipleChange(q.questionId, opt.optionId, e.target.checked)}
                            />
                        ))}

                        {/* Type 2: Text Input */}
                        {q.type === 2 && (
                            <Form.Control
                                type="text"
                                placeholder="Type your answer..."
                                onChange={(e) => handleTextChange(q.questionId, e.target.value)}
                            />
                        )}
                    </Card.Body>
                </Card>
            ))}

            <div className="d-grid gap-2">
                <Button variant="primary" size="lg" onClick={handleSubmit}>
                    Submit Quiz
                </Button>
            </div>
        </Container>
    );
};

export default QuizTakerPage;