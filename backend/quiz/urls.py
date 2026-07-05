from django.urls import path
from . import views

urlpatterns = [
    path('', views.QuizListView.as_view(), name='quiz-list'),
    path('generate/', views.GenerateQuizView.as_view(), name='quiz-generate'),
    path('my-attempts/', views.MyAttemptsView.as_view(), name='my-attempts'),
    path('<int:pk>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/submit/', views.SubmitAttemptView.as_view(), name='quiz-submit'),
]
