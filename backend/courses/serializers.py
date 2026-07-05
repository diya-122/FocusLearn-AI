from rest_framework import serializers
from .models import Course, Lesson, Enrollment
from accounts.serializers import UserProfileSerializer


class LessonSerializer(serializers.ModelSerializer):
    duration_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = (
            'id', 'title', 'video_url', 'video_file', 'transcript',
            'duration_seconds', 'duration_formatted', 'lesson_order', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def get_duration_formatted(self, obj):
        minutes, seconds = divmod(obj.duration_seconds, 60)
        hours, minutes = divmod(minutes, 60)
        if hours:
            return f'{hours}h {minutes}m'
        return f'{minutes}m {seconds}s'


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing courses."""
    instructor_name = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'instructor_name',
            'thumbnail', 'thumbnail_url', 'category', 'difficulty',
            'duration', 'rating', 'total_students', 'lesson_count',
            'is_published', 'is_enrolled', 'created_at', 'first_lesson_id'
        )

    def get_first_lesson_id(self, obj):
        first_lesson = obj.lessons.first()
        return first_lesson.id if first_lesson else None

    def get_instructor_name(self, obj):
        return obj.instructor.full_name

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False


class CourseDetailSerializer(CourseListSerializer):
    """Full course detail with nested lessons."""
    lessons = LessonSerializer(many=True, read_only=True)
    instructor = UserProfileSerializer(read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ('lessons', 'instructor', 'updated_at')


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            'id', 'title', 'description', 'thumbnail',
            'category', 'difficulty', 'duration', 'is_published',
        )

    def create(self, validated_data):
        request = self.context['request']
        validated_data['instructor'] = request.user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    student_name = serializers.ReadOnlyField(source='student.full_name')

    class Meta:
        model = Enrollment
        fields = (
            'id', 'student', 'student_name', 'course', 'course_title',
            'progress', 'last_accessed', 'enrolled_at', 'completed_at',
        )
        read_only_fields = ('id', 'student', 'enrolled_at')

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)
