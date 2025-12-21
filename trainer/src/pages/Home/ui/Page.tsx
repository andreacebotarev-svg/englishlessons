import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const lessons = [
  { id: 1, title: 'Уровень 1: Простые гласные', subtitle: 'E, U, A', emoji: '🌟', color: 'from-blue-400 to-cyan-400' },
  { id: 2, title: 'Уровень 2: Гласные O, I', subtitle: 'Буква R', emoji: '🌈', color: 'from-purple-400 to-pink-400' },
  { id: 3, title: 'Уровень 3: Сложные звуки', subtitle: 'SH, CH, CK', emoji: '🎉', color: 'from-orange-400 to-red-400' },
];

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
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
          <p className="text-xl text-slate-600">Выбери урок и начни изучение</p>
        </motion.div>

        {/* Карточки уроков */}
        <div className="grid gap-6">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <Link 
                to={`/lesson/lesson_0${lesson.id}`}
                className="block group"
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative overflow-hidden
                    bg-gradient-to-r ${lesson.color}
                    rounded-2xl shadow-lg hover:shadow-2xl
                    transition-shadow duration-300
                    p-8
                  `}
                >
                  {/* Фоновый паттерн */}
                  <div className="absolute top-0 right-0 opacity-10">
                    <div className="text-9xl">{lesson.emoji}</div>
                  </div>

                  {/* Контент */}
                  <div className="relative flex items-center gap-6">
                    <motion.div 
                      className="text-6xl"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {lesson.emoji}
                    </motion.div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {lesson.title}
                      </h2>
                      <p className="text-white/90 text-lg">{lesson.subtitle}</p>
                    </div>

                    <motion.div
                      className="text-white text-3xl"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </div>

                  {/* Блик */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Футер */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-slate-500 text-sm"
        >
          <p>🎵 Используй наушники для лучшего обучения</p>
        </motion.div>
      </div>
    </div>
  );
};
