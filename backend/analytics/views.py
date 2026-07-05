from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta

from .models import Analytics, AttentionLog
from .serializers import AnalyticsSerializer, AttentionLogSerializer, DashboardSerializer


class DashboardView(APIView):
    """GET /api/analytics/dashboard/ — aggregated stats for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        last_30 = timezone.now().date() - timedelta(days=30)
        records = Analytics.objects.filter(user=user, date__gte=last_30)

        agg = records.aggregate(
            focus_avg=Avg('focus_avg'),
            study_total=Sum('study_minutes'),
            quiz_avg=Avg('quiz_score_avg'),
            lessons_total=Sum('lessons_completed'),
            distraction_total=Sum('distraction_count'),
        )

        trend = list(
            records.order_by('date').values(
                'date', 'focus_avg', 'study_minutes', 'distraction_count'
            )
        )

        return Response({
            'focus_score_avg': round(float(agg['focus_avg'] or 0), 1),
            'study_minutes_total': int(agg['study_total'] or 0),
            'quiz_score_avg': round(float(agg['quiz_avg'] or 0), 1),
            'lessons_completed_total': int(agg['lessons_total'] or 0),
            'distraction_count_total': int(agg['distraction_total'] or 0),
            'streak': user.learning_streak,
            'focus_trend': [
                {
                    'date': str(r['date']),
                    'focus_avg': float(r['focus_avg'] or 0),
                    'study_minutes': r['study_minutes'],
                    'distraction_count': r['distraction_count'],
                }
                for r in trend
            ],
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
