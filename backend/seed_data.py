import os
import sys
import django
from django.utils import timezone

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Lesson

User = get_user_model()

def seed_db():
    print("Seeding database...")
    
    # 1. Create Superuser
    if not User.objects.filter(username="admin@focuslearn.ai").exists():
        User.objects.create_superuser(
            username="admin@focuslearn.ai",
            email="admin@focuslearn.ai",
            password="password123",
            first_name="Admin",
            last_name="User",
            role="admin"
        )
        print("Superuser created: admin@focuslearn.ai / password123")
    else:
        print("Superuser already exists.")

    # 2. Create sample course
    course, created = Course.objects.get_or_create(
        title="Introduction to Machine Learning",
        defaults={
            "description": "Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.",
            "instructor_id": User.objects.first().id,
            "category": "AI & ML",
            "difficulty": "Beginner",
        }
    )
    if created:
        print(f"Course created: {course.title}")

    # 3. Create sample lesson
    lesson, created = Lesson.objects.get_or_create(
        course=course,
        title="Supervised Learning Basics",
        defaults={
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "lesson_order": 1,
            "duration_seconds": 596
        }
    )
    if created:
        print(f"Lesson created: {lesson.title}")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_db()
