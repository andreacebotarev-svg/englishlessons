import { create } from 'zustand';
import type { IWordCard } from '@/entities/dictionary/model/schema';

interface SessionState {
  // Текущее слово
  currentWord: IWordCard | null;
  
  // Ответ пользователя (массив фонем в слотах)
  userAnswer: string[];
  
  // Очки и прогресс
  score: number;
  wordIndex: number; // Индекс текущего слова в уроке
  
  // Флаги состояния
  isChecking: boolean;
  isCorrect: boolean | null; // null = не проверялось, true/false = результат
  
  // Actions
  setCurrentWord: (word: IWordCard) => void;
  setPhonemeInSlot: (index: number, phoneme: string) => void;
  clearSlot: (index: number) => void;
  checkAnswer: () => void;
  nextWord: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentWord: null,
  userAnswer: [],
  score: 0,
  wordIndex: 0,
  isChecking: false,
  isCorrect: null,

  setCurrentWord: (word) => {
    set({ 
      currentWord: word, 
      userAnswer: new Array(word.phonemes.length).fill(''),
      isCorrect: null,
    });
  },

  setPhonemeInSlot: (index, phoneme) => {
    const { userAnswer } = get();
    const newAnswer = [...userAnswer];
    newAnswer[index] = phoneme;
    set({ userAnswer: newAnswer });
  },

  clearSlot: (index) => {
    const { userAnswer } = get();
    const newAnswer = [...userAnswer];
    newAnswer[index] = '';
    set({ userAnswer: newAnswer });
  },

  checkAnswer: () => {
    const { currentWord, userAnswer } = get();
    if (!currentWord) return;

    set({ isChecking: true });

    // Проверка: сравниваем массивы
    const correct = userAnswer.every(
      (phoneme, idx) => phoneme === currentWord.phonemes[idx]
    );

    setTimeout(() => {
      set({ 
        isCorrect: correct, 
        isChecking: false,
        score: correct ? get().score + 10 : get().score,
      });
    }, 500); // Анимация проверки
  },

  nextWord: () => {
    set((state) => ({ 
      wordIndex: state.wordIndex + 1,
      isCorrect: null,
    }));
  },

  reset: () => {
    set({ 
      currentWord: null,
      userAnswer: [],
      score: 0,
      wordIndex: 0,
      isChecking: false,
      isCorrect: null,
    });
  },
}));
