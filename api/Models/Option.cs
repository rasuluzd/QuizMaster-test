using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Option
{
    public int OptionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    // If true, this option is a correct answer (or THE correct text for text questions)
    public bool IsCorrect { get; set; } = false;

    // Foreign Key
    public int QuestionId { get; set; }
    public virtual Question Question { get; set; } = null!;
}