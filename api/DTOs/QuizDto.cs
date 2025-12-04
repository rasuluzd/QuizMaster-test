using System.ComponentModel.DataAnnotations;

namespace api.DTOs;

public class QuizDto
{
    public int QuizId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
}