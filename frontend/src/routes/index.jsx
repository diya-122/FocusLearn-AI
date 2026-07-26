import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import Landing from '../pages/Landing/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import MyCourses from '../pages/MyCourses/MyCourses';
import CourseLearning from '../pages/CourseLearning/CourseLearning';
import Summaries from '../pages/Summaries/Summaries';
import QuizList from '../pages/QuizList/QuizList';
import Quiz from '../pages/Quiz/Quiz';
import Analytics from '../pages/Analytics/Analytics';
import Profile from '../pages/Profile/Profile';
import Calendar from '../pages/Calendar/Calendar';
import Notes from '../pages/Notes/Notes';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Landing /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/courses', element: <MyCourses /> },
      { path: '/course/:id', element: <CourseLearning /> },
      { path: '/summaries', element: <Summaries /> },
      { path: '/quizzes', element: <QuizList /> },
      { path: '/quizzes/:id', element: <Quiz /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/profile', element: <Profile /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/notes', element: <Notes /> },
    ],
  },
]);

export default router;
