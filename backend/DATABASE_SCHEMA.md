# FocusLearn AI — PostgreSQL Database Schema

## Entity Relationship Diagram

```
┌──────────┐    ┌──────────┐    ┌──────────────┐
│  Users   │───<│Enrollments│>───│   Courses    │
└──────────┘    └──────────┘    └──────────────┘
     │                                │
     │                          ┌─────┴──────┐
     │                          │   Lessons   │
     │                          └─────┬──────┘
     │                                │
     ├────<┌──────────────┐           │
     │     │AttentionLogs │           │
     │     └──────────────┘           │
     │                          ┌─────┴──────┐
     │                          │  Summaries  │
     │                          └────────────┘
     │
     ├────<┌──────────────┐    ┌──────────────┐
     │     │ QuizAttempts │>───│   Quizzes    │
     │     └──────────────┘    └──────┬───────┘
     │                                │
     │                          ┌─────┴──────────┐
     │                          │ QuizQuestions   │
     │                          └────────────────┘
     │
     ├────<┌──────────────┐
     │     │  Analytics   │
     │     └──────────────┘
     │
     └────<┌──────────────┐
           │Notifications │
           └──────────────┘
```

---

## SQL DDL

### Users
```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(150) UNIQUE NOT NULL,
    email           VARCHAR(254) UNIQUE NOT NULL,
    password_hash   VARCHAR(128) NOT NULL,
    first_name      VARCHAR(150),
    last_name       VARCHAR(150),
    role            VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    avatar_url      TEXT,
    bio             TEXT,
    phone           VARCHAR(20),
    focus_score     DECIMAL(5,2) DEFAULT 0,
    learning_streak INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Courses
```sql
CREATE TABLE courses (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    instructor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail_url   TEXT,
    category        VARCHAR(100) NOT NULL,
    difficulty      VARCHAR(20) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    duration        VARCHAR(50),
    rating          DECIMAL(3,2) DEFAULT 0,
    total_students  INTEGER DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
```

### Lessons
```sql
CREATE TABLE lessons (
    id              SERIAL PRIMARY KEY,
    course_id       INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    video_url       TEXT NOT NULL,
    transcript      TEXT,
    duration_seconds INTEGER NOT NULL,
    lesson_order    INTEGER NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_course ON lessons(course_id);
```

### Enrollments
```sql
CREATE TABLE enrollments (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress        DECIMAL(5,2) DEFAULT 0,
    last_accessed   TIMESTAMP WITH TIME ZONE,
    enrolled_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
```

### AttentionLogs
```sql
CREATE TABLE attention_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    focus_score     DECIMAL(5,2) NOT NULL,
    is_distracted   BOOLEAN DEFAULT FALSE,
    head_pose_x     DECIMAL(8,4),
    head_pose_y     DECIMAL(8,4),
    eye_gaze_x      DECIMAL(8,4),
    eye_gaze_y      DECIMAL(8,4),
    timestamp       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attention_user ON attention_logs(user_id);
CREATE INDEX idx_attention_timestamp ON attention_logs(timestamp);
```

### Summaries
```sql
CREATE TABLE summaries (
    id              SERIAL PRIMARY KEY,
    lesson_id       INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    content_json    JSONB NOT NULL,
    model_used      VARCHAR(50) DEFAULT 'llama3',
    generated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_summaries_lesson ON summaries(lesson_id);
```

### Quizzes
```sql
CREATE TABLE quizzes (
    id              SERIAL PRIMARY KEY,
    course_id       INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id       INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    total_marks     INTEGER DEFAULT 10,
    model_used      VARCHAR(50) DEFAULT 'llama3',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### QuizQuestions
```sql
CREATE TABLE quiz_questions (
    id              SERIAL PRIMARY KEY,
    quiz_id         INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type   VARCHAR(20) CHECK (question_type IN ('mcq', 'true_false')),
    question_text   TEXT NOT NULL,
    options_json    JSONB,
    correct_answer  INTEGER NOT NULL,
    explanation     TEXT,
    question_order  INTEGER NOT NULL
);

CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);
```

### QuizAttempts
```sql
CREATE TABLE quiz_attempts (
    id              SERIAL PRIMARY KEY,
    quiz_id         INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score           DECIMAL(5,2),
    answers_json    JSONB NOT NULL,
    time_taken      INTEGER,
    submitted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
```

### Analytics
```sql
CREATE TABLE analytics (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    study_minutes   INTEGER DEFAULT 0,
    focus_avg       DECIMAL(5,2) DEFAULT 0,
    quiz_score_avg  DECIMAL(5,2) DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    distraction_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_analytics_user_date ON analytics(user_id, date);
```

### Notifications
```sql
CREATE TABLE notifications (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    data_json       JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
```

---

## Relationships Summary

| Parent | Child | Relationship | FK |
|--------|-------|--------------|-----|
| Users | Courses | One-to-Many | courses.instructor_id |
| Users | Enrollments | One-to-Many | enrollments.student_id |
| Courses | Enrollments | One-to-Many | enrollments.course_id |
| Courses | Lessons | One-to-Many | lessons.course_id |
| Courses | Quizzes | One-to-Many | quizzes.course_id |
| Lessons | Summaries | One-to-Many | summaries.lesson_id |
| Lessons | AttentionLogs | One-to-Many | attention_logs.lesson_id |
| Users | AttentionLogs | One-to-Many | attention_logs.user_id |
| Quizzes | QuizQuestions | One-to-Many | quiz_questions.quiz_id |
| Quizzes | QuizAttempts | One-to-Many | quiz_attempts.quiz_id |
| Users | QuizAttempts | One-to-Many | quiz_attempts.student_id |
| Users | Analytics | One-to-Many | analytics.user_id |
| Users | Notifications | One-to-Many | notifications.user_id |
