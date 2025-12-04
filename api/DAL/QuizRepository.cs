using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.DAL;

public class QuizRepository : IQuizRepository
{
    private readonly QuizDbContext _context;

    public QuizRepository(QuizDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Quiz>> GetAllQuizzes()
    {
        // Include questions so we can show the question count on the dashboard
        return await _context.Quizzes.Include(q => q.Questions).ToListAsync();
    }

    public async Task<Quiz?> GetQuizById(int id)
    {
        return await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.QuizId == id);
    }

    public async Task<Quiz> CreateQuiz(Quiz quiz)
    {
        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();
        return quiz;
    }

    public async Task UpdateQuiz(Quiz quiz)
    {
        // Remove old questions and options from database
        var existingQuestions = _context.Questions.Where(q => q.QuizId == quiz.QuizId);
        foreach (var question in existingQuestions)
        {
            var existingOptions = _context.Options.Where(o => o.QuestionId == question.QuestionId);
            _context.Options.RemoveRange(existingOptions);
        }
        _context.Questions.RemoveRange(existingQuestions);
        
        // Save deletions first
        await _context.SaveChangesAsync();
        
        // Now update the quiz (EF will add new questions/options)
        _context.Entry(quiz).State = EntityState.Modified;
        foreach (var question in quiz.Questions)
        {
            if (question.QuestionId == 0)
            {
                _context.Questions.Add(question);
            }
        }
        
        await _context.SaveChangesAsync();
    }

    public async Task DeleteQuiz(int id)
    {
        var quiz = await _context.Quizzes.FindAsync(id);
        if (quiz != null)
        {
            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
        }
    }
}