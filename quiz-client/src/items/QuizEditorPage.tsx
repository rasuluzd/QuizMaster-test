import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import * as QuizService from '../services/QuizService';
import type { Quiz, Question, Option } from '../types/quiz';

const QuizEditorPage: React.FC = () => {
    const { id } = useParams(); // If ID exists, we are editing. If not, creating.
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [error, setError] = useState<string | null>(null);
    
    // Initial State
    const [quiz, setQuiz] = useState<Quiz>({
        quizId: 0,
        title: '',
        description: '',
        questions: [{
            questionId: 0,
            text: '',
            type: 0, // Default to Single Choice
            options: [{ optionId: 0, text: '', isCorrect: false }]
        }]
    });

    // Load Data if Editing
    useEffect(() => {
        if (isEditMode) {
            QuizService.getQuizById(Number(id))
                .then(setQuiz)
                .catch(() => setError("Failed to load quiz data."));
        }
    }, [id, isEditMode]);

    // --- FORM HANDLERS ---

    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuiz({ ...quiz, [e.target.name]: e.target.value });
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            questionId: 0,
            text: '',
            type: 0, // Default to Single Choice
            options: [{ optionId: 0, text: '', isCorrect: false }]
        };
        setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    };

    const removeQuestion = (index: number) => {
        if (quiz.questions.length <= 1) return; // Prevent deleting the last question
        const updated = [...quiz.questions];
        updated.splice(index, 1);
        setQuiz({ ...quiz, questions: updated });
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = [...quiz.questions];
        updated[index] = { ...updated[index], [field]: value };
        
        // If switching to Text type (2), allow only 1 "option" (the correct answer text)
        if (field === 'type' && value === 2) {
             updated[index].options = [{ optionId: 0, text: '', isCorrect: true }];
        }

        setQuiz({ ...quiz, questions: updated });
    };

    // --- OPTION HANDLERS ---

    const addOption = (qIndex: number) => {
        const updated = [...quiz.questions];
        updated[qIndex].options.push({ optionId: 0, text: '', isCorrect: false });
        setQuiz({ ...quiz, questions: updated });
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...quiz.questions];
        updated[qIndex].options.splice(oIndex, 1);
        setQuiz({ ...quiz, questions: updated });
    };

    const updateOption = (qIndex: number, oIndex: number, field: keyof Option, value: any) => {
        const updated = [...quiz.questions];
        const options = updated[qIndex].options;

        // Handle Radio Button Logic (Only 1 correct for Type 0)
        if (field === 'isCorrect' && value === true && updated[qIndex].type === 0) {
            options.forEach(o => o.isCorrect = false); // Reset others
        }

        options[oIndex] = { ...options[oIndex], [field]: value };
        setQuiz({ ...quiz, questions: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate that each question has at least one correct answer
        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
            if (!hasCorrectAnswer) {
                setError(`Question ${i + 1} must have at least one correct answer selected.`);
                return;
            }
        }
        
        try {
            if (isEditMode) {
                await QuizService.updateQuiz(quiz.quizId, quiz);
            } else {
                await QuizService.createQuiz(quiz);
            }
            navigate('/');
        } catch (err) {
            setError("Failed to save quiz. Ensure all fields are filled.");
        }
    };

    return (
        <Container className="mb-5">
            <h2 className="mb-4">{isEditMode ? 'Edit Quiz' : 'Create Quiz'}</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                {/* QUIZ INFO CARD */}
                <Card className="mb-4 shadow-sm border-top-primary">
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Quiz Title</Form.Label>
                            <Form.Control 
                                type="text" name="title" placeholder="Enter Quiz Title" 
                                value={quiz.title} onChange={handleQuizChange} required 
                                style={{ fontSize: '1.5rem' }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control 
                                as="textarea" name="description" placeholder="Quiz Description" 
                                value={quiz.description} onChange={handleQuizChange} 
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>

                {/* QUESTIONS LIST */}
                {quiz.questions.map((q, qIndex) => (
                    <Card key={qIndex} className="mb-4 shadow-sm">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col md={8}>
                                    <Form.Control 
                                        type="text" placeholder="Question Text" 
                                        value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} required 
                                        className="bg-light"
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Select 
                                        value={q.type} 
                                        onChange={(e) => updateQuestion(qIndex, 'type', Number(e.target.value))}
                                    >
                                        <option value={0}>Single Choice</option>
                                        <option value={1}>Multiple Choice</option>
                                        <option value={2}>Text Answer</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            {/* OPTIONS LIST */}
                            {q.type === 2 ? (
                                // TEXT ANSWER MODE
                                <Form.Group>
                                    <Form.Label className="text-muted small">Accepted Correct Answer</Form.Label>
                                    <Form.Control 
                                        type="text" placeholder="Type the correct answer here"
                                        value={q.options[0]?.text || ''}
                                        onChange={(e) => updateOption(qIndex, 0, 'text', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            ) : (
                                // CHOICE MODE
                                <>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="d-flex align-items-center mb-2">
                                            <Form.Check 
                                                type={q.type === 0 ? 'radio' : 'checkbox'}
                                                name={`q-${qIndex}-correct`}
                                                checked={opt.isCorrect}
                                                onChange={(e) => updateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                                                className="me-2"
                                            />
                                            <Form.Control 
                                                type="text" value={opt.text} 
                                                onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`} required
                                                size="sm"
                                            />
                                            <Button variant="link" className="text-muted text-decoration-none" onClick={() => removeOption(qIndex, oIndex)}>
                                                &times;
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="link" size="sm" onClick={() => addOption(qIndex)}>+ Add Option</Button>
                                </>
                            )}
                        </Card.Body>
                        <Card.Footer className="text-end bg-white border-0">
                            <Button variant="outline-danger" size="sm" onClick={() => removeQuestion(qIndex)} disabled={quiz.questions.length <= 1}>Delete Question</Button>
                        </Card.Footer>
                    </Card>
                ))}

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="outline-primary" onClick={addQuestion}>+ Add Question</Button>
                    <Button variant="success" type="submit" size="lg">Save Quiz</Button>
                </div>
            </Form>
        </Container>
    );
};

export default QuizEditorPage;