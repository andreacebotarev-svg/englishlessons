import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchLesson } from '@/shared/api/lesson-loader';
import { useSessionStore } from '@/entities/session/model/store';
import { PhonemeBuilder } from '@/widgets/PhonemeBuilder/ui/PhonemeBuilder';
import type { ILesson } from '@/entities/dictionary/model/schema';

export const LessonTrainerPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [error, setError] = useState<string>('');
  
  const { 
    wordIndex, 
    score, 
    setCurrentWord, 
    reset 
  } = useSessionStore();

  // Загрузка урока
  useEffect(() => {
    if (!lessonId) return;
    
    reset(); // Сбрасываем состояние при смене урока
    
    fetchLesson(lessonId)
      .then(data => setLesson(data))
      .catch(err => setError(err.message));
  }, [lessonId, reset]);

  // Устанавливаем текущее слово
  useEffect(() => {
    if (!lesson || !lesson.words[wordIndex]) return;
    setCurrentWord(lesson.words[wordIndex]);
  }, [lesson, wordIndex, setCurrentWord]);

  if (error) return <div className="p-10 text-red-500">Ошибка: {error}</div>;
  if (!lesson) return <div className="p-10">Загрузка урока...</div>;

  // Завершение урока
  if (wordIndex >= lesson.words.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Урок завершён!</h1>
          <p className="text-2xl text-slate-700 mb-2">Ваш результат: <span className="font-bold text-indigo-600">{score} очков</span></p>
          <p className="text-lg text-slate-500 mb-8">Слов изучено: {lesson.words.length}</p>
          
          <Link 
            to="/" 
            className="inline-block px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            ← Вернуться к урокам
          </Link>
        </div>
      </div>
    );
  }

  // Подготавливаем фонемы для игры (перемешиваем)
  const currentWord = lesson.words[wordIndex];
  const shuffledPhonemes = [...currentWord.phonemes]
    .sort(() => Math.random() - 0.5)
    .concat([...currentWord.phonemes]) // Дублируем для усложнения
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8">
      {/* Шапка */}
      <div className="max-w-4xl mx-auto px-4 mb-6 flex justify-between items-center">
        <Link to="/" className="text-slate-600 hover:text-indigo-600 font-semibold">
          ← Меню
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">{lesson.title}</h1>
          <p className="text-sm text-slate-500">Слово {wordIndex + 1} из {lesson.words.length}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">🎯 {score}</div>
          <div className="text-xs text-slate-500">очков</div>
        </div>
      </div>

      {/* Игровая зона */}
      <PhonemeBuilder availablePhonemes={shuffledPhonemes} />
    </div>
  );
};
