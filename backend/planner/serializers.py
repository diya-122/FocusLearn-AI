from rest_framework import serializers
from .models import CalendarEvent, Note

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class NoteSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
