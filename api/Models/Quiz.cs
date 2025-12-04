using System.ComponentModel.DataAnnotations;

namespace api.Models;

public class Quiz
{
    public int QuizId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    // Navigation property
    public virtual List<Question> Questions { get; set; } = new List<Question>();
}