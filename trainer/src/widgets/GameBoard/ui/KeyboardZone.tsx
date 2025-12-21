import { useState, useEffect } from 'react';
import { shuffleArray } from '@/shared/lib';

interface KeyboardZoneProps {
  phonemes: string[];
  onPhonemeClick: (phoneme: string) => void;
}

/**
 * Interactive keyboard with phoneme buttons
 */
export function KeyboardZone({ phonemes, onPhonemeClick }: KeyboardZoneProps) {
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [used, setUsed] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    setShuffled(shuffleArray([...phonemes]));
    setUsed(new Set());
  }, [phonemes]);
  
  const handleClick = (phoneme: string, index: number) => {
    if (used.has(index)) return;
    
    onPhonemeClick(phoneme);
    setUsed(prev => new Set(prev).add(index));
  };
  
  return (
    <div className="flex gap-3 flex-wrap justify-center min-h-20">
      {shuffled.map((phoneme, index) => (
        <button
          key={index}
          onClick={() => handleClick(phoneme, index)}
          disabled={used.has(index)}
          className={`
            w-14 h-16 rounded-lg font-semibold text-2xl
            border-2 border-b-4 transition-all
            ${used.has(index)
              ? 'opacity-0 scale-75'
              : 'bg-white border-gray-300 hover:border-primary active:translate-y-1'
            }
          `}
        >
          {phoneme}
        </button>
      ))}
    </div>
  );
}
