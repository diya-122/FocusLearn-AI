from django.urls import path
from . import views

urlpatterns = [
    path('', views.AnalyticsListView.as_view(), name='analytics-list'),
    path('dashboard/', views.DashboardView.as_view(), name='analytics-dashboard'),
    path('focus-trends/', views.FocusTrendView.as_view(), name='focus-trends'),
    path('attention/', views.AttentionLogCreateView.as_view(), name='attention-log'),
    path('attention/list/', views.AttentionLogListView.as_view(), name='attention-list'),
]
