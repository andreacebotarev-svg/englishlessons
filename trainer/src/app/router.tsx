import { createBrowserRouter } from 'react-router-dom';
import { AboutPage } from '@/pages/About/ui/Page';
import { LessonTrainerPage } from '@/pages/LessonTrainer/ui/Page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AboutPage />,
  },
  {
    path: '/lesson/:lessonId',
    element: <LessonTrainerPage />,
  },
], {
  basename: '/trainer' 
});
