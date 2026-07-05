from rest_framework.permissions import BasePermission


class IsInstructor(BasePermission):
    """Allow access only to instructors and admins."""
    message = 'Only instructors can perform this action.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('instructor', 'admin')


class IsEnrolledOrInstructor(BasePermission):
    """Allow enrolled students or the course instructor."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ('instructor', 'admin'):
            return True
        # obj is a Course
        return obj.enrollments.filter(student=user).exists()


class IsCourseOwnerOrInstructor(BasePermission):
    """Allow instructors, or the specific user who owns/created the course."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in ('instructor', 'admin'):
            return True
        return obj.instructor == user
