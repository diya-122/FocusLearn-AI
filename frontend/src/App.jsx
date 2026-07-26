import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CourseProvider } from './context/CourseContext';
import { LanguageProvider } from './context/LanguageContext';
import router from './routes';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CourseProvider>
            <RouterProvider router={router} />
          </CourseProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
