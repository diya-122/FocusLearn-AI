# FocusLearn AI — Backend Architecture

## Django Project Structure

```
backend/
├── backend/                    # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── accounts/                   # User authentication & profiles
│   ├── models.py              # CustomUser, UserProfile
│   ├── serializers.py         # UserSerializer, ProfileSerializer
│   ├── views.py               # RegisterView, LoginView, ProfileView
│   ├── urls.py                # /api/auth/*
│   ├── permissions.py         # IsStudent, IsInstructor
│   └── admin.py
│
├── courses/                    # Course management
│   ├── models.py              # Course, Lesson, Enrollment
│   ├── serializers.py         # CourseSerializer, LessonSerializer
│   ├── views.py               # CourseViewSet, EnrollmentView
│   ├── urls.py                # /api/courses/*
│   └── admin.py
│
├── attention_monitor/          # Focus tracking
│   ├── models.py              # AttentionLog, FocusSession
│   ├── serializers.py         # AttentionSerializer
│   ├── views.py               # FocusScoreView, SessionLogView
│   ├── urls.py                # /api/attention/*
│   └── consumers.py           # WebSocket for real-time focus
│
├── ai_engine/                  # Ollama/Llama3 integration
│   ├── services.py            # OllamaClient, generate_summary, generate_quiz
│   ├── prompts.py             # Prompt templates
│   ├── views.py               # GenerateSummaryView, GenerateQuizView
│   └── urls.py                # /api/ai/*
│
├── analytics/                  # Learning analytics
│   ├── models.py              # AnalyticsSnapshot
│   ├── serializers.py         # AnalyticsSerializer
│   ├── views.py               # DashboardStatsView, ChartsDataView
│   ├── urls.py                # /api/analytics/*
│   └── tasks.py               # Celery tasks for periodic aggregation
│
├── quizzes/                    # Quiz management
│   ├── models.py              # Quiz, QuizQuestion, QuizAttempt
│   ├── serializers.py         # QuizSerializer, AttemptSerializer
│   ├── views.py               # QuizViewSet, SubmitQuizView
│   └── urls.py                # /api/quizzes/*
│
├── summaries/                  # AI summaries
│   ├── models.py              # Summary, SummarySection
│   ├── serializers.py         # SummarySerializer
│   ├── views.py               # SummaryViewSet, GenerateView
│   └── urls.py                # /api/summaries/*
│
├── media/                      # User uploads
├── static/                     # Static files
├── manage.py
└── requirements.txt
```

---

## REST API Endpoints

### Authentication (`/api/auth/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET | `/api/auth/profile/` | Get current user profile |
| PUT | `/api/auth/profile/` | Update profile |
| POST | `/api/auth/refresh/` | Refresh JWT token |

### Courses (`/api/courses/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/` | List all courses (filterable) |
| POST | `/api/courses/` | Create course (instructor) |
| GET | `/api/courses/{id}/` | Course detail |
| PUT | `/api/courses/{id}/` | Update course |
| DELETE | `/api/courses/{id}/` | Delete course |
| POST | `/api/courses/{id}/enroll/` | Enroll student |
| GET | `/api/courses/enrolled/` | Get enrolled courses |
| GET | `/api/courses/{id}/lessons/` | Get course lessons |

### Attention (`/api/attention/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attention/log/` | Log focus data point |
| GET | `/api/attention/session/{id}/` | Get session log |
| GET | `/api/attention/current/` | Get current focus score |
| WS | `/ws/attention/{user_id}/` | Real-time focus WebSocket |

### AI Engine (`/api/ai/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/summary/generate/` | Generate summary from transcript |
| POST | `/api/ai/quiz/generate/` | Generate quiz from transcript |
| POST | `/api/ai/feedback/generate/` | Generate personalized feedback |

### Quizzes (`/api/quizzes/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/` | List quizzes |
| GET | `/api/quizzes/{id}/` | Quiz detail with questions |
| POST | `/api/quizzes/{id}/submit/` | Submit quiz answers |
| GET | `/api/quizzes/{id}/results/` | Get quiz results |

### Summaries (`/api/summaries/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summaries/` | List summaries |
| GET | `/api/summaries/{id}/` | Summary detail |
| GET | `/api/summaries/course/{id}/` | Summaries by course |
| GET | `/api/summaries/{id}/pdf/` | Download as PDF |

### Analytics (`/api/analytics/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard/` | Dashboard stats |
| GET | `/api/analytics/focus-trends/` | Focus trend data |
| GET | `/api/analytics/study-time/` | Weekly study time |
| GET | `/api/analytics/quiz-performance/` | Quiz performance data |
| GET | `/api/analytics/export/` | Export report (PDF/CSV) |

---

## Authentication Flow

```
1. User registers → POST /api/auth/register/
2. Backend creates user, returns JWT access + refresh tokens
3. Frontend stores tokens in localStorage
4. Every request includes: Authorization: Bearer <access_token>
5. When access token expires → POST /api/auth/refresh/
6. Logout → POST /api/auth/logout/ (blacklists refresh token)
```

---

## requirements.txt

```
Django==5.1
djangorestframework==3.15
djangorestframework-simplejwt==5.3
django-cors-headers==4.4
django-filter==24.3
psycopg2-binary==2.9
celery==5.4
redis==5.1
channels==4.1
channels-redis==4.2
Pillow==10.4
gunicorn==23.0
python-dotenv==1.0
requests==2.32
reportlab==4.2
```

---

## Model Definitions

### accounts/models.py
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [('student', 'Student'), ('instructor', 'Instructor'), ('admin', 'Admin')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    focus_score = models.FloatField(default=0)
    learning_streak = models.IntegerField(default=0)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### courses/models.py
```python
class Course(models.Model):
    DIFFICULTY_CHOICES = [('Beginner','Beginner'),('Intermediate','Intermediate'),('Advanced','Advanced')]
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='courses')
    thumbnail = models.ImageField(upload_to='courses/')
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    duration = models.CharField(max_length=50)
    rating = models.FloatField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    video_url = models.URLField()
    transcript = models.TextField(blank=True)
    duration = models.IntegerField(help_text='Duration in seconds')
    order = models.IntegerField()

class Enrollment(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.FloatField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('student', 'course')
```
