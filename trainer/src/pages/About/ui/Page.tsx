import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const lessons = [
  {
    id: 'lesson_01',
    number: 1,
    title: 'Уровень 1: Простые гласные',
    subtitle: 'E, U, A',
    description: 'Изучаем закрытые слоги с буквами E, U, A. Базовые слова типа ten, cup, cat.',
    words: 12,
    emoji: '🌟',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'lesson_02',
    number: 2,
    title: 'Уровень 2: Гласные O, I',
    subtitle: 'Буквы R, F, L',
    description: 'Закрытые слоги с O и I. Слова с буквами R, F, L типа dog, big, red.',
    words: 15,
    emoji: '🌈',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'lesson_03',
    number: 3,
    title: 'Уровень 3: Сложные звуки',
    subtitle: 'SH, CH, CK',
    description: 'Диграфы sh, ch, ck и буквы J, W. Слова типа ship, fish, duck.',
    words: 12,
    emoji: '🎉',
    color: 'from-orange-400 to-red-400',
  },
];

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📚 English Phonics Trainer
          </motion.h1>
          <p className="text-xl text-slate-600">Интерактивное обучение чтению на английском для детей 5-10 лет</p>
        </motion.div>

        {/* О методике */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            🎯 О методике
          </h2>
          <div className="space-y-4 text-slate-600">
            <p className="text-lg">
              Приложение основано на <strong>фонетическом подходе Л.Н. Русиновой</strong>. 
              Ребёнок учится <strong>разбивать слова на звуки</strong> (фонемы) и собирать их обратно.
            </p>
            <div className="bg-indigo-50 rounded-xl p-6">
              <h3 className="font-bold text-indigo-900 mb-3">💡 Почему это работает?</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span><strong>CVC-слова</strong> (согласная-гласная-согласная) — самые простые для чтения</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span><strong>Последовательное введение</strong> звуков от простых к сложным</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span><strong>Аудиосопровождение</strong> помогает запомнить правильное произношение</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span><strong>Игровая форма</strong> делает обучение увлекательным</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Правила игры */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            🎮 Как играть?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-4xl mb-3">👂</div>
              <h3 className="font-bold text-blue-900 mb-2">1. Слушай</h3>
              <p className="text-slate-600">Каждое слово озвучивается автоматически. Нажми 🔊 чтобы повторить.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-4xl mb-3">🔤</div>
              <h3 className="font-bold text-purple-900 mb-2">2. Собирай</h3>
              <p className="text-slate-600">Кликай по буквам, чтобы заполнить слоты. Каждая буква озвучивается.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-green-900 mb-2">3. Проверяй</h3>
              <p className="text-slate-600">Нажми "Проверить" когда все слоты заполнены. Получи очки!</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="text-4xl mb-3">🎆</div>
              <h3 className="font-bold text-orange-900 mb-2">4. Продолжай</h3>
              <p className="text-slate-600">Пройди все слова в уроке и получи звёзды!</p>
            </div>
          </div>
        </motion.section>

        {/* Уроки */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
            📚 Выбери урок
          </h2>
          <div className="grid gap-6">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Левая часть - инфо */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`text-5xl bg-gradient-to-br ${lesson.color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                        {lesson.emoji}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{lesson.title}</h3>
                        <p className="text-indigo-600 font-semibold">{lesson.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4">{lesson.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        📝 {lesson.words} слов
                      </span>
                      <span className="flex items-center gap-1">
                        ⏱️ ~10 мин
                      </span>
                    </div>
                  </div>
                  
                  {/* Правая часть - кнопка */}
                  <div className="flex items-center justify-center p-6 bg-slate-50">
                    <Link to={`/lesson/${lesson.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-4 bg-gradient-to-r ${lesson.color} text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all`}
                      >
                        Начать урок →
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Футер */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-12 text-slate-500 text-sm space-y-2"
        >
          <p>🎵 <strong>Совет:</strong> Используй наушники для лучшего обучения</p>
          <p>👨‍👩‍👧 <strong>Родителям:</strong> Занимайтесь вместе с ребёнком для лучших результатов</p>
        </motion.div>
      </div>
    </div>
  );
};
