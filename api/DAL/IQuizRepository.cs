using api.Models;

namespace api.DAL;

public interface IQuizRepository
{
    Task<IEnumerable<Quiz>> GetAllQuizzes();
    Task<Quiz?> GetQuizById(int id);
    Task<Quiz> CreateQuiz(Quiz quiz);
    Task UpdateQuiz(Quiz quiz);
    Task DeleteQuiz(int id);
}