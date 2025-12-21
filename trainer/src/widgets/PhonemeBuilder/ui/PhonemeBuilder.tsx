import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '@/entities/session/model/store';
import { SoundButton } from '@/shared/ui/SoundButton';
import { speak } from '@/features/audio-manager/lib/speak';

interface PhonemeBuilderProps {
  availablePhonemes: string[];
}

export const PhonemeBuilder = ({ availablePhonemes }: PhonemeBuilderProps) => {
  const { 
    currentWord, 
    userAnswer, 
    isCorrect, 
    isChecking,
    setPhonemeInSlot, 
    clearSlot, 
    checkAnswer, 
    nextWord 
  } = useSessionStore();

  // Автопроигрывание слова при загрузке
  useEffect(() => {
    if (currentWord) {
      setTimeout(() => speak(currentWord.text, 0.7), 500);
    }
  }, [currentWord]);

  // Озвучивание результата
  useEffect(() => {
    if (isCorrect === true) {
      setTimeout(() => speak('Correct!', 1.0), 300);
    } else if (isCorrect === false) {
      setTimeout(() => speak('Try again', 1.0), 300);
    }
  }, [isCorrect]);

  if (!currentWord) return <div>Загрузка...</div>;

  const nextEmptySlotIndex = userAnswer.findIndex(slot => slot === '');

  const handlePhonemeClick = (phoneme: string) => {
    if (isCorrect !== null) return;
    if (nextEmptySlotIndex === -1) return;

    speak(phoneme, 0.9);
    setPhonemeInSlot(nextEmptySlotIndex, phoneme);
  };

  const handleSlotClick = (index: number) => {
    if (isCorrect !== null) return;
    clearSlot(index);
  };

  const handleCheck = () => {
    if (userAnswer.some(slot => slot === '')) {
      speak('Fill all slots', 1.0);
      return;
    }
    checkAnswer();
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Карточка слова */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-lg text-center relative"
      >
        <div className="absolute top-4 right-4">
          <SoundButton text={currentWord.text} rate={0.7} />
        </div>
        
        <motion.div 
          className="text-7xl mb-4"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {currentWord.image}
        </motion.div>
        
        <div className="text-2xl text-slate-600 mb-2">{currentWord.translation}</div>
        <div className="text-lg text-slate-400 font-mono">{currentWord.transcription}</div>
      </motion.div>

      {/* Слоты */}
      <div className="flex gap-3">
        {userAnswer.map((phoneme, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSlotClick(index)}
            className={`
              w-16 h-16 rounded-xl border-4 font-bold text-2xl transition-all
              ${phoneme ? 'bg-indigo-100 border-indigo-400' : 'bg-slate-100 border-slate-300 border-dashed'}
              ${isCorrect === true ? 'border-green-500 bg-green-100' : ''}
              ${isCorrect === false ? 'border-red-500 bg-red-100 animate-shake' : ''}
            `}
          >
            {phoneme || '?'}
          </motion.button>
        ))}
      </div>

      {/* Подсказка */}
      {nextEmptySlotIndex !== -1 && isCorrect === null && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-500"
        >
          👆 Нажми на букву для звука #{nextEmptySlotIndex + 1}
        </motion.p>
      )}

      {/* Фонемы */}
      <div className="flex flex-wrap gap-3 max-w-md justify-center">
        {availablePhonemes.map((phoneme, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePhonemeClick(phoneme)}
            disabled={isCorrect !== null}
            className="
              px-5 py-3 bg-slate-700 text-white font-bold text-xl rounded-lg
              hover:bg-indigo-600 transition-colors shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {phoneme}
          </motion.button>
        ))}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4">
        <AnimatePresence mode="wait">
          {isCorrect === null ? (
            <motion.button
              key="check"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={handleCheck}
              disabled={isChecking}
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 shadow-lg"
            >
              {isChecking ? '🔍 Проверяем...' : '✅ Проверить'}
            </motion.button>
          ) : (
            <motion.button
              key="next"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={nextWord}
              className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 shadow-lg"
            >
              Следующее слово →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Результат */}
      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="text-3xl font-bold text-green-600"
          >
            ✅ Правильно!
          </motion.div>
        )}
        {isCorrect === false && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: [0, -10, 10, -10, 0], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-red-600"
          >
            ❌ Попробуй ещё раз
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
