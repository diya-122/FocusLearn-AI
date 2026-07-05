from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course-list'),
    path('create/', views.CourseCreateView.as_view(), name='course-create'),
    path('import-video/', views.ImportVideoView.as_view(), name='course-import-video'),
    path('my/', views.MyCoursesView.as_view(), name='my-courses'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<int:course_id>/lessons/', views.LessonListCreateView.as_view(), name='lesson-list'),
    path('lessons/<int:lesson_id>/summarize/', views.GenerateSummaryView.as_view(), name='lesson-summarize'),
    path('lessons/<int:lesson_id>/chat/', views.LessonChatView.as_view(), name='lesson-chat'),
    path('lessons/<int:lesson_id>/notes/', views.LessonNoteView.as_view(), name='lesson-notes'),
    path('lessons/<int:lesson_id>/chat-history/', views.LessonChatHistoryView.as_view(), name='lesson-chat-history'),
    path('<int:course_id>/lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail-global'),
    path('<int:course_id>/enroll/', views.EnrollView.as_view(), name='course-enroll'),
    path('<int:course_id>/progress/', views.UpdateProgressView.as_view(), name='course-progress'),
]
