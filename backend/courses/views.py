from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Course, Lesson, Enrollment, LessonNote, ChatMessage
from .serializers import (
    CourseListSerializer, CourseDetailSerializer,
    CourseCreateSerializer, LessonSerializer, EnrollmentSerializer,
)
from .permissions import IsInstructor, IsEnrolledOrInstructor
import re
from youtube_transcript_api import YouTubeTranscriptApi
from ai.ollama_service import generate_summary, call_ollama


class CourseListView(generics.ListAPIView):
    """GET /api/courses/ — list all published courses."""
    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['rating', 'total_students', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Course.objects.filter(is_published=True).select_related('instructor')


class CourseCreateView(generics.CreateAPIView):
    """POST /api/courses/ — instructor creates a course."""
    serializer_class = CourseCreateSerializer
    permission_classes = [IsAuthenticated, IsInstructor]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/courses/<id>/"""
    queryset = Course.objects.select_related('instructor').prefetch_related('lessons')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CourseCreateSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            from .permissions import IsCourseOwnerOrInstructor
            return [IsAuthenticated(), IsCourseOwnerOrInstructor()]
        return [IsAuthenticated()]


class MyCoursesView(generics.ListAPIView):
    """GET /api/courses/my/ — enrolled courses for students, created for instructors."""
    serializer_class = CourseListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'instructor':
            return Course.objects.filter(instructor=user).select_related('instructor')
        return Course.objects.filter(
            enrollments__student=user
        ).select_related('instructor')


# ─── Lessons ─────────────────────────────────────────────────────────────────

class LessonListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/courses/<course_id>/lessons/"""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs['course_id'])

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs['course_id'])
        serializer.save(course=course)


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/courses/<course_id>/lessons/<id>/"""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        if course_id:
            return Lesson.objects.filter(course_id=course_id)
        return Lesson.objects.all()


# ─── Enrollments ─────────────────────────────────────────────────────────────

class EnrollView(APIView):
    """POST /api/courses/<course_id>/enroll/ — enroll the current user in a course."""
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        course = generics.get_object_or_404(Course, pk=course_id, is_published=True)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )
        if not created:
            return Response({'message': 'Already enrolled.'}, status=status.HTTP_200_OK)

        # Increment student counter
        course.total_students += 1
        course.save(update_fields=['total_students'])

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateProgressView(APIView):
    """PATCH /api/courses/<course_id>/progress/ — update lesson progress."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, course_id):
        enrollment = generics.get_object_or_404(
            Enrollment, student=request.user, course_id=course_id
        )
        progress = request.data.get('progress', enrollment.progress)
        enrollment.progress = min(100, max(0, float(progress)))
        enrollment.last_accessed = timezone.now()
        if enrollment.progress >= 100:
            enrollment.completed_at = timezone.now()
        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)


class ImportVideoView(APIView):
    """POST /api/courses/import-video/ — Upload a video or paste a URL into a personal workspace."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        video_url = request.data.get('video_url')
        video_file = request.FILES.get('video_file')
        # Handle title defaults
        original_title = request.data.get('title', '').strip()
        title = original_title
        thumbnail_url = ''

        if video_url:
            match = re.search(r'(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11})', video_url)
            if match:
                video_id = match.group(1)
                thumbnail_url = f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
                if not title or title == 'Imported Video':
                    try:
                        import requests
                        res = requests.get(f'https://noembed.com/embed?url={video_url}')
                        if res.status_code == 200:
                            title = res.json().get('title', f'YouTube Video {video_id}')
                    except Exception:
                        title = f'YouTube Video {video_id}'

        if not title or title == 'Imported Video':
            if video_file:
                title = video_file.name.rsplit('.', 1)[0]
            else:
                title = 'Imported Video'

        # Create a dedicated Course for this video
        course = Course.objects.create(
            title=title,
            instructor=request.user,
            description=f'Imported video: {title}',
            category='Personal',
            difficulty='Beginner',
            is_published=False
        )
        Enrollment.objects.get_or_create(student=request.user, course=course)

        # Extract transcript if it's a YouTube URL
        transcript_text = ""
        if video_url:
            try:
                match = re.search(r'(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11})', video_url)
                if match:
                    video_id = match.group(1)
                    fetched = YouTubeTranscriptApi().fetch(video_id)
                    transcript_text = " ".join([snippet.text for snippet in fetched])
            except Exception as e:
                print(f"Transcript extraction failed: {e}")
                
            if thumbnail_url:
                try:
                    import urllib.request
                    from django.core.files.base import ContentFile
                    response = urllib.request.urlopen(thumbnail_url)
                    if response.status == 200:
                        course.thumbnail.save(f'{video_id}.jpg', ContentFile(response.read()), save=True)
                except Exception as e:
                    print(f"Thumbnail download failed: {e}")

        # Create Lesson
        lesson_order = course.lessons.count() + 1
        lesson = Lesson.objects.create(
            course=course,
            title=title,
            video_url=video_url or '',
            video_file=video_file,
            lesson_order=lesson_order,
            transcript=transcript_text
        )

        return Response(LessonSerializer(lesson).data, status=status.HTTP_201_CREATED)

class GenerateSummaryView(APIView):
    """POST /api/courses/lessons/<id>/summarize/ — generate an AI summary for a lesson."""
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        # Use lesson transcript or title for summary generation
        content = lesson.transcript or lesson.title or "Unknown Lesson Content"
        
        # Call the local Ollama LLM wrapper
        summary_data = generate_summary(content)
        
        return Response(summary_data, status=status.HTTP_200_OK)


class LessonChatView(APIView):
    """POST /api/courses/lessons/<lesson_id>/chat/ — AI chatbot powered by Ollama."""
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Save user message
        ChatMessage.objects.create(user=request.user, lesson=lesson, role='user', text=user_message)

        # Build context from lesson transcript
        context = lesson.transcript or lesson.title or "General educational content"
        context_truncated = context[:3000]

        prompt = f"""You are a helpful AI teaching assistant for an online learning platform.
The student is currently studying a lesson titled "{lesson.title}".

Here is some context from the lesson:
{context_truncated}

The student asks: {user_message}

Provide a clear, concise, and helpful answer. If the question is related to the lesson content, use that context. If not, answer based on your general knowledge. Keep your response under 150 words."""

        result = call_ollama(prompt, model="gemma")
        reply = result.strip() if result else "I'm sorry, I couldn't process your question right now. Please make sure Ollama is running and try again."

        # Save bot reply
        ChatMessage.objects.create(user=request.user, lesson=lesson, role='bot', text=reply)

        return Response({'reply': reply}, status=status.HTTP_200_OK)


class LessonNoteView(APIView):
    """GET/PUT /api/courses/lessons/<lesson_id>/notes/ — Save/load notes."""
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        note, _ = LessonNote.objects.get_or_create(user=request.user, lesson=lesson)
        return Response({'content': note.content, 'updated_at': note.updated_at})

    def put(self, request, lesson_id):
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        content = request.data.get('content', '')
        note, _ = LessonNote.objects.get_or_create(user=request.user, lesson=lesson)
        note.content = content
        note.save()
        return Response({'content': note.content, 'updated_at': note.updated_at})


class LessonChatHistoryView(APIView):
    """GET /api/courses/lessons/<lesson_id>/chat-history/ — Load past chat messages."""
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = generics.get_object_or_404(Lesson, pk=lesson_id)
        messages = ChatMessage.objects.filter(user=request.user, lesson=lesson).order_by('created_at')
        data = [{'role': m.role, 'text': m.text, 'created_at': m.created_at} for m in messages]
        return Response(data)
