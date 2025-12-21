import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchLesson } from '@/shared/api/lesson-loader';
import { useSessionStore } from '@/entities/session/model/store';
import { PhonemeBuilder } from '@/widgets/PhonemeBuilder/ui/PhonemeBuilder';
import { PhonemeHint } from '@/widgets/PhonemeHint/ui/PhonemeHint';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { speak } from '@/features/audio-manager/lib/speak';
import type { ILesson } from '@/entities/dictionary/model/schema';

export const LessonTrainerPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<ILesson | null>(null);
  const [error, setError] = useState<string>('');
  const [showHints, setShowHints] = useState(true);
  
  const { 
    wordIndex, 
    score, 
    setCurrentWord, 
    reset 
  } = useSessionStore();

  useEffect(() => {
    if (!lessonId) return;
    
    reset();
    
    fetchLesson(lessonId)
      .then(data => setLesson(data))
      .catch(err => setError(err.message));
  }, [lessonId, reset]);

  useEffect(() => {
    if (!lesson || !lesson.words[wordIndex]) return;
    setCurrentWord(lesson.words[wordIndex]);
  }, [lesson, wordIndex, setCurrentWord]);

  useEffect(() => {
    if (lesson && wordIndex >= lesson.words.length) {
      setTimeout(() => speak('Great job! Lesson complete!', 1.0), 500);
    }
  }, [wordIndex, lesson]);

  if (error) return <div className="p-10 text-red-500">Ошибка: {error}</div>;
  if (!lesson) return <div className="p-10">Загрузка урока...</div>;

  if (wordIndex >= lesson.words.length) {
    const stars = score >= lesson.words.length * 8 ? 3 : score >= lesson.words.length * 5 ? 2 : 1;
    const starEmojis = '⭐'.repeat(stars);

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth, opacity: 1 }}
            animate={{ y: window.innerHeight + 100, rotate: 360 }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              delay: Math.random() * 2,
              repeat: Infinity
            }}
            className="absolute text-4xl"
            style={{ left: `${Math.random() * 100}%` }}
          >
            {['🎉', '⭐', '🎆', '🎈', '🎁'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center z-10 bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            className="text-9xl mb-6"
          >
            🎉
          </motion.div>
          
          <h1 className="text-5xl font-bold text-green-600 mb-4">Урок завершён!</h1>
          
          <div className="text-6xl mb-6">{starEmojis}</div>
          
          <p className="text-3xl text-slate-700 mb-2">
            Результат: <span className="font-bold text-indigo-600">{score} очков</span>
          </p>
          <p className="text-xl text-slate-500 mb-8">Слов изучено: {lesson.words.length}</p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/" 
              className="inline-block px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              ← Вернуться к урокам
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentWord = lesson.words[wordIndex];
  const shuffledPhonemes = [...currentWord.phonemes]
    .sort(() => Math.random() - 0.5)
    .concat([...currentWord.phonemes])
    .sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="text-slate-600 hover:text-indigo-600 font-semibold transition">
            ← Меню
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">{lesson.title}</h1>
            <p className="text-sm text-slate-500">Слово {wordIndex + 1} из {lesson.words.length}</p>
          </div>
          <div className="text-right">
            <motion.div 
              key={score}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-indigo-600"
            >
              🎯 {score}
            </motion.div>
            <div className="text-xs text-slate-500">очков</div>
          </div>
        </div>
        
        <ProgressBar current={wordIndex} total={lesson.words.length} />

        {/* Кнопка переключения подсказок */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-semibold transition-colors text-sm"
          >
            {showHints ? '👁️ Скрыть подсказки' : '📖 Показать подсказки'}
          </button>
        </div>
      </div>

      {/* Подсказки */}
      {showHints && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <PhonemeHint phonemes={currentWord.phonemes} />
        </div>
      )}

      {/* Игровая зона */}
      <PhonemeBuilder availablePhonemes={shuffledPhonemes} />
    </div>
  );
};
