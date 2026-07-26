from django.db import models
from django.conf import settings
from courses.models import Course

class CalendarEvent(models.Model):
    EVENT_TYPES = (
        ('exam', 'Exam'),
        ('assignment', 'Assignment'),
        ('reminder', 'Reminder'),
        ('custom', 'Custom'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    time = models.TimeField(blank=True, null=True)
    color = models.CharField(max_length=20, default='#3B82F6')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='custom')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.title} - {self.date}"

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True, help_text="Comma separated tags")
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-updated_at']

    def __str__(self):
        return self.title
