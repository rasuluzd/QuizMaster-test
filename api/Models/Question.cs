using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Question
{
    public int QuestionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    // Enum to store the type (Single, Multiple, Text)
    public QuestionType Type { get; set; } = QuestionType.SingleChoice;

    // Foreign Key
    public int QuizId { get; set; }
    public virtual Quiz Quiz { get; set; } = null!;

    // Navigation property
    public virtual List<Option> Options { get; set; } = new List<Option>();
}