/**
 * Проверяет, правильно ли собрано слово
 * @param userAnswer - массив фонем, введенных пользователем
 * @param correctPhonemes - правильные фонемы из данных
 * @returns true, если ответ верен
 */
export const checkWord = (userAnswer: string[], correctPhonemes: string[]): boolean => {
  if (userAnswer.length !== correctPhonemes.length) return false;
  
  return userAnswer.every((phoneme, index) => {
    return phoneme.toLowerCase() === correctPhonemes[index].toLowerCase();
  });
};
