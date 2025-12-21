import type { WordCard as WordCardType } from '@/entities/dictionary';
import { useAudio } from '@/features/audio-manager';

interface WordCardProps {
  word: WordCardType;
}

/**
 * Visual word card with image and audio
 */
export function WordCard({ word }: WordCardProps) {
  const { playWord } = useAudio();
  
  return (
    <div 
      className="flex flex-col items-center gap-4 cursor-pointer"
      onClick={() => playWord(word.text)}
    >
      <div className="text-8xl filter drop-shadow-lg">
        {word.image}
      </div>
      <div className="text-gray-600 text-sm">
        Click to hear the word
      </div>
    </div>
  );
}
