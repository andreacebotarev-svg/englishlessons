import { motion } from 'framer-motion';
import { SoundButton } from '@/shared/ui/SoundButton';

interface PhonemeHintProps {
  phonemes: string[];
}

// Примеры звучания букв
const phonemeExamples: Record<string, { sound: string; example: string; transcription: string }> = {
  'a': { sound: '[æ]', example: 'cat', transcription: 'как в cat' },
  'e': { sound: '[e]', example: 'pen', transcription: 'как в pen' },
  'i': { sound: '[ɪ]', example: 'big', transcription: 'как в big' },
  'o': { sound: '[ɔ]', example: 'dog', transcription: 'как в dog' },
  'u': { sound: '[ʌ]', example: 'cup', transcription: 'как в cup' },
  'c': { sound: '[k]', example: 'cat', transcription: 'к' },
  't': { sound: '[t]', example: 'ten', transcription: 'т' },
  'n': { sound: '[n]', example: 'net', transcription: 'н' },
  'p': { sound: '[p]', example: 'pen', transcription: 'п' },
  'h': { sound: '[h]', example: 'hat', transcription: 'х' },
  'm': { sound: '[m]', example: 'map', transcription: 'м' },
  's': { sound: '[s]', example: 'sun', transcription: 'с' },
  'd': { sound: '[d]', example: 'dog', transcription: 'д' },
  'g': { sound: '[g]', example: 'big', transcription: 'г' },
  'b': { sound: '[b]', example: 'big', transcription: 'б' },
  'k': { sound: '[k]', example: 'kid', transcription: 'к' },
  'r': { sound: '[r]', example: 'red', transcription: 'р' },
  'f': { sound: '[f]', example: 'fox', transcription: 'ф' },
  'l': { sound: '[l]', example: 'lamp', transcription: 'л' },
  'w': { sound: '[w]', example: 'wind', transcription: 'у' },
  'j': { sound: '[dʒ]', example: 'jam', transcription: 'дж' },
  'x': { sound: '[ks]', example: 'six', transcription: 'кс' },
  'sh': { sound: '[ʃ]', example: 'ship', transcription: 'ш' },
  'ch': { sound: '[tʃ]', example: 'chin', transcription: 'ч' },
  'ck': { sound: '[k]', example: 'duck', transcription: 'к' },
  'ss': { sound: '[s]', example: 'kiss', transcription: 'с' },
};

export const PhonemeHint = ({ phonemes }: PhonemeHintProps) => {
  // Убираем дубликаты
  const uniquePhonemes = Array.from(new Set(phonemes));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-md"
    >
      <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
        📖 Как читаются буквы:
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {uniquePhonemes.map((phoneme) => {
          const hint = phonemeExamples[phoneme.toLowerCase()];
          if (!hint) return null;

          return (
            <motion.div
              key={phoneme}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all min-w-[140px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-indigo-600">{phoneme}</span>
                <SoundButton 
                  text={phoneme} 
                  rate={0.7} 
                  className="!p-2 !text-xl" 
                  icon="🔊" 
                />
              </div>
              <div className="text-sm text-slate-600">
                <div className="font-mono text-purple-600 font-bold">{hint.sound}</div>
                <div className="text-xs text-slate-500 mt-1">{hint.transcription}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-amber-700 mt-4">
        💡 <strong>Совет:</strong> Нажми 🔊 чтобы услышать звук
      </p>
    </motion.div>
  );
};
