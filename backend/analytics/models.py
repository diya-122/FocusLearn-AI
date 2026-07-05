from django.db import models
from django.conf import settings
from courses.models import Lesson


class Analytics(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='analytics',
    )
    date = models.DateField()
    study_minutes = models.IntegerField(default=0)
    focus_avg = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    quiz_score_avg = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    lessons_completed = models.IntegerField(default=0)
    distraction_count = models.IntegerField(default=0)
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = 'analytics'
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f'{self.user.username} — {self.date}'


class AttentionLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attention_logs',
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attention_logs',
    )
    focus_score = models.DecimalField(max_digits=5, decimal_places=2)
    is_distracted = models.BooleanField(default=False)
    head_pose_x = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    head_pose_y = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    eye_gaze_x = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    eye_gaze_y = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attention_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.user.username} focus={self.focus_score} @ {self.timestamp}'
