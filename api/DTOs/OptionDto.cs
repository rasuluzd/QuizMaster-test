using System.ComponentModel.DataAnnotations;

namespace api.DTOs;

public class OptionDto
{
    public int OptionId { get; set; }

    [Required]
    public string Text { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }
}