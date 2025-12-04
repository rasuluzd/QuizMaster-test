using api.Controllers;
using api.DAL;
using api.DTOs;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace api.Tests;

public class QuizControllerTests
{
    private readonly Mock<IQuizRepository> _mockRepository;
    private readonly Mock<ILogger<QuizController>> _mockLogger; 
    private readonly QuizController _controller;

    public QuizControllerTests()
    {
        _mockRepository = new Mock<IQuizRepository>();
        _mockLogger = new Mock<ILogger<QuizController>>();
        
        _controller = new QuizController(_mockRepository.Object, _mockLogger.Object);
    }

    #region Test 1: GetAllQuizzes_ReturnsOk

    [Fact]
    public async Task GetAllQuizzes_ReturnsOk()
    {
        // Arrange
        var quizzes = new List<Quiz>
        {
            new Quiz { QuizId = 1, Title = "Quiz 1", Description = "Desc 1", Questions = new List<Question>() },
            new Quiz { QuizId = 2, Title = "Quiz 2", Description = "Desc 2", Questions = new List<Question>() }
        };
        _mockRepository.Setup(repo => repo.GetAllQuizzes()).ReturnsAsync(quizzes);

        // Act
        var result = await _controller.GetQuizzes();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedQuizzes = Assert.IsAssignableFrom<IEnumerable<QuizDto>>(okResult.Value);
        Assert.Equal(2, returnedQuizzes.Count());
    }

    #endregion

    #region Test 2: GetQuiz_ValidId_ReturnsQuiz

    [Fact]
    public async Task GetQuiz_ValidId_ReturnsQuiz()
    {
        // Arrange
        var quiz = new Quiz 
        { 
            QuizId = 1, 
            Title = "Math test", 
            Description = "Simple test",
            Questions = new List<Question>()
        };
        _mockRepository.Setup(repo => repo.GetQuizById(1)).ReturnsAsync(quiz);

        // Act
        var result = await _controller.GetQuiz(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedQuiz = Assert.IsType<QuizDto>(okResult.Value);
        Assert.Equal(1, returnedQuiz.QuizId);
        Assert.Equal("Math test", returnedQuiz.Title);
    }

    #endregion

    #region Test 3: GetQuiz_InvalidId_ReturnsNotFound

    [Fact]
    public async Task GetQuiz_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockRepository.Setup(repo => repo.GetQuizById(99)).ReturnsAsync((Quiz?)null);

        // Act
        var result = await _controller.GetQuiz(99);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    #endregion

    #region Test 4: CreateQuiz_ValidData_ReturnsCreated

    [Fact]
    public async Task CreateQuiz_ValidData_ReturnsCreated()
    {
        // Arrange
        var quizDto = new QuizDto
        {
            Title = "New Quiz",
            Description = "Description",
            Questions = new List<QuestionDto>()
        };

        // Mock the repository to simulate adding the ID 1 to the new quiz
        _mockRepository.Setup(repo => repo.CreateQuiz(It.IsAny<Quiz>()))
            .ReturnsAsync((Quiz q) => { q.QuizId = 1; return q; });

        // Act
        var result = await _controller.CreateQuiz(quizDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(201, createdResult.StatusCode);
        Assert.Equal("GetQuiz", createdResult.ActionName);
    }

    #endregion
#region Test 5: CreateQuiz_NullData_ReturnsBadRequest

    [Fact]
    public async Task CreateQuiz_NullData_ReturnsBadRequest()
    {
        // Arrange
        QuizDto? quizDto = null;

        // Act
        var result = await _controller.CreateQuiz(quizDto!);

        // Assert
        var actionResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("Failed to create quiz", actionResult.Value);
    }

    #endregion

    #region Test 6: DeleteQuiz_ValidId_ReturnsNoContent

    [Fact]
    public async Task DeleteQuiz_ValidId_ReturnsNoContent()
    {
        // Arrange
        var quiz = new Quiz { QuizId = 1 };
        _mockRepository.Setup(repo => repo.GetQuizById(1)).ReturnsAsync(quiz);
        _mockRepository.Setup(repo => repo.DeleteQuiz(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteQuiz(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion

    #region Test 7: DeleteQuiz_InvalidId_ReturnsNotFound

    [Fact]
    public async Task DeleteQuiz_InvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockRepository.Setup(repo => repo.GetQuizById(99)).ReturnsAsync((Quiz?)null);

        // Act
        var result = await _controller.DeleteQuiz(99);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    #endregion

    #region Test 8: UpdateQuiz_MismatchId_ReturnsBadRequest

    [Fact]
    public async Task UpdateQuiz_MismatchId_ReturnsBadRequest()
    {
        // Arrange
        var quizDto = new QuizDto { QuizId = 2, Title = "Update" }; // ID 2

        // Act
        var result = await _controller.UpdateQuiz(1, quizDto); // ID 1 in URL

        // Assert
        Assert.IsType<BadRequestResult>(result);
    }

    #endregion

    #region Test 9: UpdateQuiz_ValidData_ReturnsNoContent

    [Fact]
    public async Task UpdateQuiz_ValidData_ReturnsNoContent()
    {
        // Arrange
        int testId = 1;
        var quizDto = new QuizDto
        {
            QuizId = testId,
            Title = "Updated Title",
            Description = "Updated Desc",
            Questions = new List<QuestionDto>()
        };

        // We must ensure GetQuizById finds the quiz, otherwise it returns NotFound
        _mockRepository.Setup(repo => repo.GetQuizById(testId))
            .ReturnsAsync(new Quiz { QuizId = testId, Questions= new List<Question>() });

        _mockRepository.Setup(repo => repo.UpdateQuiz(It.IsAny<Quiz>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateQuiz(testId, quizDto);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    #endregion
}