import { useSessionStore } from '@/entities/session/model/store';

interface PhonemeBuilderProps {
  availablePhonemes: string[]; // Все фонемы для выбора (перемешаны)
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

  if (!currentWord) return <div>Загрузка...</div>;

  // Находим первый пустой слот (автозаполнение)
  const nextEmptySlotIndex = userAnswer.findIndex(slot => slot === '');

  const handlePhonemeClick = (phoneme: string) => {
    if (isCorrect !== null) return; // Блокируем после проверки
    if (nextEmptySlotIndex === -1) return; // Все слоты заполнены

    setPhonemeInSlot(nextEmptySlotIndex, phoneme);
  };

  const handleSlotClick = (index: number) => {
    if (isCorrect !== null) return;
    clearSlot(index);
  };

  const handleCheck = () => {
    if (userAnswer.some(slot => slot === '')) {
      alert('Заполните все слоты!');
      return;
    }
    checkAnswer();
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Карточка слова */}
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className="text-7xl mb-4">{currentWord.image}</div>
        <div className="text-2xl text-slate-600 mb-2">{currentWord.translation}</div>
        <div className="text-lg text-slate-400 font-mono">{currentWord.transcription}</div>
      </div>

      {/* Слоты для фонем */}
      <div className="flex gap-3">
        {userAnswer.map((phoneme, index) => (
          <button
            key={index}
            onClick={() => handleSlotClick(index)}
            className={`
              w-16 h-16 rounded-xl border-4 font-bold text-2xl transition-all
              ${phoneme ? 'bg-indigo-100 border-indigo-400' : 'bg-slate-100 border-slate-300'}
              ${isCorrect === true ? 'border-green-500 bg-green-100' : ''}
              ${isCorrect === false ? 'border-red-500 bg-red-100' : ''}
              hover:scale-110
            `}
          >
            {phoneme || '?'}
          </button>
        ))}
      </div>

      {/* Доступные фонемы */}
      <div className="flex flex-wrap gap-3 max-w-md justify-center">
        {availablePhonemes.map((phoneme, index) => (
          <button
            key={index}
            onClick={() => handlePhonemeClick(phoneme)}
            disabled={isCorrect !== null}
            className="
              px-5 py-3 bg-slate-700 text-white font-bold text-xl rounded-lg
              hover:bg-indigo-600 hover:scale-105 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {phoneme}
          </button>
        ))}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4">
        {isCorrect === null ? (
          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isChecking ? 'Проверяем...' : 'Проверить'}
          </button>
        ) : (
          <button
            onClick={nextWord}
            className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
          >
            Следующее слово →
          </button>
        )}
      </div>

      {/* Результат */}
      {isCorrect === true && (
        <div className="text-3xl font-bold text-green-600 animate-bounce">
          ✅ Правильно!
        </div>
      )}
      {isCorrect === false && (
        <div className="text-3xl font-bold text-red-600">
          ❌ Попробуй ещё раз
        </div>
      )}
    </div>
  );
};
