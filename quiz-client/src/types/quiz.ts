export interface Option {
    optionId: number;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    questionId: number;
    text: string;
    type: number;
    options: Option[];
}

export interface Quiz {
    quizId: number;
    title: string;
    description: string;
    questions: Question[];
}