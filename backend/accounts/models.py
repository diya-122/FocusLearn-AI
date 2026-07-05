from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    focus_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    learning_streak = models.IntegerField(default=0)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username
