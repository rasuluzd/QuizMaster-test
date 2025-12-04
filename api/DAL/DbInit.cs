using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace api.DAL;

public static class DbInit
{
    public static void Seed(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AuthUser>>();

        // 1. Seed Quiz Data
        context.Database.EnsureCreated();

        if (!context.Quizzes.Any())
        {
            var quiz = new Quiz
            {
                Title = "General Knowledge",
                Description = "A sample quiz to test your smarts.",
                Questions = new List<Question>
                {
                    new Question
                    {
                        Text = "What is the capital of France?",
                        Type = QuestionType.SingleChoice,
                        Options = new List<Option>
                        {
                            new Option { Text = "Berlin", IsCorrect = false },
                            new Option { Text = "Madrid", IsCorrect = false },
                            new Option { Text = "Paris", IsCorrect = true },
                            new Option { Text = "Rome", IsCorrect = false }
                        }
                    },
                    new Question
                    {
                        Text = "Which of these are fruits?",
                        Type = QuestionType.MultipleChoice,
                        Options = new List<Option>
                        {
                            new Option { Text = "Apple", IsCorrect = true },
                            new Option { Text = "Carrot", IsCorrect = false },
                            new Option { Text = "Banana", IsCorrect = true },
                            new Option { Text = "Potato", IsCorrect = false }
                        }
                    },
                    new Question
                    {
                        Text = "What is 2 + 2?",
                        Type = QuestionType.Text,
                        Options = new List<Option>
                        {
                            new Option { Text = "4", IsCorrect = true } // The accepted text answer
                        }
                    }
                }
            };
            context.Quizzes.Add(quiz);
            context.SaveChanges();
        }

        // 2. Seed User Data
        var adminUser = new AuthUser
        {
            UserName = "admin@quiz.com",
            Email = "admin@quiz.com",
            FirstName = "Admin",
            LastName = "User"
        };

        if (userManager.Users.All(u => u.UserName != adminUser.UserName))
        {
            var result = userManager.CreateAsync(adminUser, "Admin123!").Result;
            if (!result.Succeeded)
            {
                Console.WriteLine("Failed to create admin user.");
            }
        }
    }
}