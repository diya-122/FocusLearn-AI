from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — list all notifications for the current user."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        unread_only = self.request.query_params.get('unread')
        qs = Notification.objects.filter(user=self.request.user)
        if unread_only == 'true':
            qs = qs.filter(is_read=False)
        return qs


class MarkReadView(APIView):
    """POST /api/notifications/<id>/read/ — mark a notification as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = generics.get_object_or_404(
            Notification, pk=pk, user=request.user
        )
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'message': 'Marked as read.'})


class MarkAllReadView(APIView):
    """POST /api/notifications/read-all/ — mark all as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': f'{count} notifications marked as read.'})


class UnreadCountView(APIView):
    """GET /api/notifications/unread-count/ — number of unread notifications."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})
