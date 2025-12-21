import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/Home/ui/Page';
import { LessonTrainerPage } from '@/pages/LessonTrainer/ui/Page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/lesson/:lessonId', // Динамический параметр
    element: <LessonTrainerPage />,
  },
], {
  // Для вашего домена eng-tutor.ru/trainer/
  basename: '/trainer' 
});
