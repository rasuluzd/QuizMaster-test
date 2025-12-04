namespace api.Models;

public enum QuestionType
{
    SingleChoice,   // Radio buttons (One correct answer)
    MultipleChoice, // Checkboxes (Multiple correct answers)
    Text            // Text input (User types the answer)
}