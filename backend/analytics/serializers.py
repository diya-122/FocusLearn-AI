from rest_framework import serializers
from .models import Analytics, AttentionLog


class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = '__all__'
        read_only_fields = ('id', 'user')


class AttentionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttentionLog
        fields = '__all__'
        read_only_fields = ('id', 'user', 'timestamp')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DashboardSerializer(serializers.Serializer):
    """Aggregated dashboard stats for the current user."""
    focus_score_avg = serializers.FloatField()
    study_minutes_total = serializers.IntegerField()
    quiz_score_avg = serializers.FloatField()
    lessons_completed_total = serializers.IntegerField()
    distraction_count_total = serializers.IntegerField()
    streak = serializers.IntegerField()
    focus_trend = serializers.ListField(child=serializers.DictField())


class FocusTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    focus_avg = serializers.FloatField()
    study_minutes = serializers.IntegerField()
    distraction_count = serializers.IntegerField()
