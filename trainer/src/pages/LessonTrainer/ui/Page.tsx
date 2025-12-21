import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchLesson } from '@/shared/api/lesson-loader';
import type { ILesson } from '@/entities/dictionary/model/schema';

export const LessonTrainerPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!lessonId) return;
    
    fetchLesson(lessonId)
      .then(data => setLesson(data))
      .catch(err => setError(err.message));
  }, [lessonId]);

  if (error) return <div className="p-10 text-red-500">Ошибка: {error}</div>;
  if (!lesson) return <div className="p-10">Загрузка урока...</div>;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Link to="/" className="absolute top-4 left-4 text-slate-500 hover:text-indigo-600">
        ← Назад в меню
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <p className="mb-8 text-slate-600">{lesson.description}</p>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="text-6xl mb-4">{lesson.words[0].image}</div>
        <div className="text-4xl font-bold text-indigo-600 mb-2">{lesson.words[0].text}</div>
        <div className="text-xl text-slate-400 font-mono">{lesson.words[0].transcription}</div>
      </div>
      
      <p className="mt-8 text-sm text-slate-400">
        (Движок игры будет подключен на Этапе 3)
      </p>
    </div>
  );
};
