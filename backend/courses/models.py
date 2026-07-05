from django.db import models
from django.conf import settings


class Course(models.Model):
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught',
    )
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    duration = models.CharField(max_length=50, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_students = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.TextField()
    video_file = models.FileField(upload_to='videos/', null=True, blank=True)
    transcript = models.TextField(blank=True)
    duration_seconds = models.IntegerField(default=0)
    lesson_order = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lessons'
        ordering = ['lesson_order']

    def __str__(self):
        return f'{self.course.title} — {self.title}'


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ('student', 'course')

    def __str__(self):
        return f'{self.student.username} → {self.course.title}'


class LessonNote(models.Model):
    """Stores student notes per lesson."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_notes')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lesson_notes'
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f'Note by {self.user.username} on {self.lesson.title}'


class ChatMessage(models.Model):
    """Stores AI chat messages per lesson per user."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10)  # 'user' or 'bot'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.text[:50]}'
