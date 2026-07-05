from rest_framework import serializers
from .models import Quiz, QuizQuestion, QuizAttempt


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = (
            'id', 'question_type', 'question_text', 'options_json',
            'correct_answer', 'explanation', 'question_order',
        )


class QuizQuestionStudentSerializer(serializers.ModelSerializer):
    """Hides correct_answer when serving to students."""
    class Meta:
        model = QuizQuestion
        fields = ('id', 'question_type', 'question_text', 'options_json', 'question_order')


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = (
            'id', 'course', 'lesson', 'title', 'duration_minutes',
            'total_marks', 'model_used', 'questions', 'question_count', 'created_at',
        )
        read_only_fields = ('id', 'created_at', 'model_used')

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizStudentSerializer(QuizSerializer):
    """Quiz serializer that hides answers from students."""
    questions = QuizQuestionStudentSerializer(many=True, read_only=True)


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.ReadOnlyField(source='quiz.title')
    student_name = serializers.ReadOnlyField(source='student.full_name')

    class Meta:
        model = QuizAttempt
        fields = (
            'id', 'quiz', 'quiz_title', 'student', 'student_name',
            'score', 'answers_json', 'time_taken', 'submitted_at',
        )
        read_only_fields = ('id', 'student', 'score', 'submitted_at')

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        attempt = super().create(validated_data)
        attempt.score = self._calculate_score(attempt)
        attempt.save(update_fields=['score'])
        return attempt

    def _calculate_score(self, attempt):
        questions = attempt.quiz.questions.all()
        answers = attempt.answers_json  # {str(question_id): chosen_index}
        if not questions:
            return 0
        correct = sum(
            1 for q in questions
            if str(q.id) in answers and answers[str(q.id)] == q.correct_answer
        )
        return round((correct / len(questions)) * attempt.quiz.total_marks, 2)
