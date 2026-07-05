from django.db import models
from django.conf import settings
from courses.models import Course, Lesson


class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='quizzes')
    title = models.CharField(max_length=255)
    duration_minutes = models.IntegerField(default=15)
    total_marks = models.IntegerField(default=10)
    model_used = models.CharField(max_length=50, default='llama3')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    TYPE_CHOICES = [
        ('mcq', 'Multiple Choice'),
        ('true_false', 'True/False'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='mcq')
    question_text = models.TextField()
    options_json = models.JSONField(null=True, blank=True)   # list of strings for MCQ
    correct_answer = models.IntegerField()                    # index into options_json
    explanation = models.TextField(blank=True)
    question_order = models.IntegerField(default=1)

    class Meta:
        db_table = 'quiz_questions'
        ordering = ['question_order']

    def __str__(self):
        return f'Q{self.question_order}: {self.question_text[:60]}'


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    answers_json = models.JSONField()   # {question_id: chosen_index}
    time_taken = models.IntegerField(null=True, blank=True)  # seconds
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quiz_attempts'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.student.username} → {self.quiz.title} ({self.score})'
