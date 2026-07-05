from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Quiz, QuizQuestion, QuizAttempt
from .serializers import (
    QuizSerializer, QuizStudentSerializer,
    QuizAttemptSerializer, QuizQuestionSerializer,
)
from ai.ollama_service import generate_quiz


class QuizListView(generics.ListAPIView):
    """GET /api/quiz/?course=<id> — list quizzes for a course."""
    permission_classes = [IsAuthenticated]
    serializer_class = QuizStudentSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Quiz.objects.prefetch_related('questions')
        
        if user.role == 'instructor':
            qs = qs.filter(course__instructor=user)
        else:
            qs = qs.filter(course__enrollments__student=user)

        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
            
        return qs.distinct()


class QuizDetailView(generics.RetrieveAPIView):
    """GET /api/quiz/<id>/ — retrieve a quiz (hides answers from students)."""
    queryset = Quiz.objects.prefetch_related('questions')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        user = self.request.user
        if user.role in ('instructor', 'admin'):
            return QuizSerializer
        return QuizStudentSerializer


class GenerateQuizView(APIView):
    """POST /api/quiz/generate/ — AI-generate quiz questions for a lesson."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        lesson_id = request.data.get('lesson_id')
        content = request.data.get('content', '')
        title = request.data.get('title', 'Auto-generated Quiz')

        percentage_watched = request.data.get('percentage_watched')

        from courses.models import Course, Lesson
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        course = lesson.course

        quiz = Quiz.objects.create(
            course=course,
            lesson=lesson,
            title=title or f"Quiz for {lesson.title}",
            model_used='llama3',
        )

        # Use real Ollama API (falls back to mock if Ollama is offline)
        quiz_content = content or lesson.transcript or lesson.title
        
        # Slice transcript if percentage_watched is provided
        if percentage_watched is not None and isinstance(quiz_content, str):
            try:
                pct = max(0, min(100, float(percentage_watched)))
                slice_idx = int(len(quiz_content) * (pct / 100))
                quiz_content = quiz_content[:slice_idx]
                if not quiz_content.strip():
                    quiz_content = lesson.title
            except (ValueError, TypeError):
                pass
                
        questions_data = generate_quiz(quiz_content)
        for i, q in enumerate(questions_data, start=1):
            QuizQuestion.objects.create(
                quiz=quiz,
                question_type=q['type'],
                question_text=q['question'],
                options_json=q.get('options'),
                correct_answer=q['correct'],
                explanation=q.get('explanation', ''),
                question_order=i,
            )

        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SubmitAttemptView(generics.CreateAPIView):
    """POST /api/quiz/<quiz_id>/submit/ — submit answers and auto-score."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(quiz_id=self.kwargs['quiz_id'])


class MyAttemptsView(generics.ListAPIView):
    """GET /api/quiz/my-attempts/ — all attempts by the current user."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related('quiz').order_by('-submitted_at')
