using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.DTOs;

public class QuestionDto
{
    public int QuestionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    // Points awarded for correct answer (default 1)
    public int Points { get; set; } = 1;

    public List<OptionDto> Options { get; set; } = new List<OptionDto>();
}