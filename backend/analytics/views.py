from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Analytics, AttentionLog
from .serializers import AnalyticsSerializer, AttentionLogSerializer, DashboardSerializer

from quiz.models import QuizAttempt
from courses.models import Enrollment

class DashboardView(APIView):
    """GET /api/analytics/dashboard/ — aggregated stats for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        last_30 = timezone.now() - timedelta(days=30)
        
        focus_logs = AttentionLog.objects.filter(user=user, timestamp__gte=last_30)
        focus_avg = focus_logs.aggregate(Avg('focus_score'))['focus_score__avg'] or 0
        distractions = focus_logs.filter(is_distracted=True).count()
        
        # Each log is roughly 2 seconds of tracking
        study_minutes = int(focus_logs.count() * 2 / 60)
        
        quiz_attempts = QuizAttempt.objects.filter(student=user)
        quiz_avg = quiz_attempts.aggregate(Avg('score'))['score__avg'] or 0
        
        enrollments = Enrollment.objects.filter(student=user)
        total_progress = enrollments.aggregate(Avg('progress'))['progress__avg'] or 0

        trend = []
        if focus_logs.exists():
            for i in range(7, 0, -1):
                date_i = timezone.now().date() - timedelta(days=i-1)
                day_logs = focus_logs.filter(timestamp__date=date_i)
                d_avg = day_logs.aggregate(Avg('focus_score'))['focus_score__avg']
                trend.append({
                    'date': str(date_i),
                    'focus_avg': float(d_avg or focus_avg),
                    'study_minutes': int(day_logs.count() * 2 / 60),
                    'distraction_count': day_logs.filter(is_distracted=True).count()
                })

        return Response({
            'focus_score_avg': round(float(focus_avg), 1),
            'study_minutes_total': study_minutes,
            'quiz_score_avg': round(float(quiz_avg * 10), 1), # convert raw score (out of 10) to percentage
            'lessons_completed_total': int(total_progress / 10), # frontend multiplies by 10
            'distraction_count_total': distractions,
            'streak': user.learning_streak or 1,
            'focus_trend': trend,
        })


class FocusTrendView(generics.ListAPIView):
    """GET /api/analytics/focus-trends/?days=7 — focus trend data."""
    permission_classes = [IsAuthenticated]
    serializer_class = AnalyticsSerializer

    def get_queryset(self):
        days = int(self.request.query_params.get('days', 7))
        since = timezone.now().date() - timedelta(days=days)
        return Analytics.objects.filter(
            user=self.request.user, date__gte=since
        ).order_by('date')


class AnalyticsListView(generics.ListAPIView):
    """GET /api/analytics/ — all analytics records for the current user."""
    serializer_class = AnalyticsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Analytics.objects.filter(user=self.request.user)


class AttentionLogCreateView(generics.CreateAPIView):
    """POST /api/analytics/attention/ — log a focus event from the frontend."""
    serializer_class = AttentionLogSerializer
    permission_classes = [IsAuthenticated]


class AttentionLogListView(generics.ListAPIView):
    """GET /api/analytics/attention/?lesson=<id> — attention logs."""
    serializer_class = AttentionLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = AttentionLog.objects.filter(user=self.request.user)
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        return qs.order_by('-timestamp')[:200]
