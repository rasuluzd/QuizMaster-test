import type { Quiz } from "../types/quiz";

const API_URL = "http://localhost:5043/api/Quiz";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Failed to fetch quizzes");
    return response.json();
};

// NEW: Get Single Quiz
export const getQuizById = async (id: number): Promise<Quiz> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Failed to fetch quiz");
    return response.json();
};

// NEW: Create Quiz
export const createQuiz = async (quiz: Omit<Quiz, 'quizId'>): Promise<Quiz> => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(quiz)
    });
    if (!response.ok) throw new Error("Failed to create quiz");
    return response.json();
};

// NEW: Update Quiz
export const updateQuiz = async (id: number, quiz: Quiz): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(quiz)
    });
    if (!response.ok) throw new Error("Failed to update quiz");
};

export const deleteQuiz = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to delete quiz");
};