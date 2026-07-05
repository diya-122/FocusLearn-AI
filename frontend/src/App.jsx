import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CourseProvider } from './context/CourseContext';
import router from './routes';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <RouterProvider router={router} />
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
