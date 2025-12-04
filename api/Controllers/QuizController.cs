using api.DAL;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class QuizController : ControllerBase
{
    private readonly IQuizRepository _repository;
    private readonly ILogger<QuizController> _logger;

    public QuizController(IQuizRepository repository, ILogger<QuizController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    // GET: api/Quiz
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzes()
    {
        _logger.LogInformation("Fetching all quizzes");
        
        try 
        {
            var quizzes = await _repository.GetAllQuizzes();
            
            // Map Entity -> DTO
            var quizDtos = quizzes.Select(q => new QuizDto
            {
                QuizId = q.QuizId,
                Title = q.Title,
                Description = q.Description,
                Questions = q.Questions.Select(qn => new QuestionDto
                {
                    QuestionId = qn.QuestionId,
                    Text = qn.Text,
                    Type = qn.Type,
                    Points = qn.Points,
                }).ToList()
            });

            return Ok(quizDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[QuizController] Quiz list not found while executing _repository.GetAllQuizzes()");
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/Quiz/5
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDto>> GetQuiz(int id)
    {
        var quiz = await _repository.GetQuizById(id);

        if (quiz == null)
        {
            _logger.LogError("[QuizController] Quiz not found for the QuizId {QuizId:0000}", id);
            return NotFound();
        }

        // Map Entity -> DTO (Deep mapping)
        var quizDto = new QuizDto
        {
            QuizId = quiz.QuizId,
            Title = quiz.Title,
            Description = quiz.Description,
            Questions = quiz.Questions.Select(q => new QuestionDto
            {
                QuestionId = q.QuestionId,
                Text = q.Text,
                Type = q.Type,
                Points = q.Points,
                Options = q.Options.Select(o => new OptionDto
                {
                    OptionId = o.OptionId,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect
                }).ToList()
            }).ToList()
        };

        return Ok(quizDto);
    }

    // POST: api/Quiz
    // [Authorize] means you must be logged in to create a quiz
    [HttpPost]
    public async Task<ActionResult<QuizDto>> CreateQuiz(QuizDto quizDto)
    {
        try
        {
            // Map DTO -> Entity
            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                Questions = quizDto.Questions.Select(q => new Question
                {
                    Text = q.Text,
                    Type = q.Type,
                    Points = q.Points,
                    Options = q.Options.Select(o => new Option
                    {
                        Text = o.Text,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            };

            await _repository.CreateQuiz(quiz);

            // Map Entity -> DTO for response
            var createdQuizDto = new QuizDto
            {
                QuizId = quiz.QuizId,
                Title = quiz.Title,
                Description = quiz.Description,
                Questions = quiz.Questions.Select(q => new QuestionDto
                {
                    QuestionId = q.QuestionId,
                    Text = q.Text,
                    Type = q.Type,
                    Points = q.Points,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        OptionId = o.OptionId,
                        Text = o.Text,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            };

            return CreatedAtAction(nameof(GetQuiz), new { id = quiz.QuizId }, createdQuizDto);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[QuizController] Quiz creation failed {@quizDto}", quizDto);
            return BadRequest("Failed to create quiz");
        }
    }

    // PUT: api/Quiz/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateQuiz(int id, QuizDto quizDto)
    {
        if (id != quizDto.QuizId)
        {
            return BadRequest();
        }

        var quiz = await _repository.GetQuizById(id);
        if (quiz == null)
        {
            _logger.LogError("[QuizController] Quiz not found when updating the QuizId {QuizId:0000}", id);
            return NotFound();
        }

        try
        {
            // Update basic properties
            quiz.Title = quizDto.Title;
            quiz.Description = quizDto.Description;

            // Clear existing questions and options, then add updated ones
            quiz.Questions.Clear();
            
            foreach (var questionDto in quizDto.Questions)
            {
                var question = new Question
                {
                    Text = questionDto.Text,
                    Type = questionDto.Type,
                    Points = questionDto.Points,
                    Options = questionDto.Options.Select(o => new Option
                    {
                        Text = o.Text,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                };
                quiz.Questions.Add(question);
            }

            await _repository.UpdateQuiz(quiz);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[QuizController] Quiz update failed {@quiz}", quiz);
            return BadRequest("Update failed");
        }
    }

    // DELETE: api/Quiz/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var quiz = await _repository.GetQuizById(id);
        if (quiz == null)
        {
            _logger.LogError("[QuizController] Quiz not found for the QuizId {QuizId:0000}", id);
            return NotFound();
        }

        try
        {
            await _repository.DeleteQuiz(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[QuizController] Quiz deletion failed for the QuizId {QuizId:0000}", id);
            return BadRequest("Deletion failed");
        }
    }
}