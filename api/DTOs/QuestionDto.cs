using System.ComponentModel.DataAnnotations;
using api.Models;

namespace api.DTOs;

public class QuestionDto
{
    public int QuestionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    public List<OptionDto> Options { get; set; } = new List<OptionDto>();
}