import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/Home';
import { TrainerPage } from '@/pages/LessonTrainer';
import { ResultPage } from '@/pages/Result';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/lesson/:lessonId',
      element: <TrainerPage />,
    },
    {
      path: '/result',
      element: <ResultPage />,
    },
  ],
  {
    basename: '/englishlessons/trainer',
  }
);
