import { useSessionStore } from '@/entities/session';

interface SlotsZoneProps {
  phonemes: string[];
}

/**
 * Slots where phonemes are placed
 */
export function SlotsZone({ phonemes }: SlotsZoneProps) {
  const selectedPhonemes = useSessionStore(state => state.selectedPhonemes);
  
  return (
    <div className="flex gap-3">
      {phonemes.map((_, index) => (
        <div
          key={index}
          className={`
            w-16 h-20 rounded-xl flex items-center justify-center
            text-3xl font-bold border-3 transition-all
            ${selectedPhonemes[index] 
              ? 'bg-white border-primary text-primary shadow-lg' 
              : 'bg-gray-200 border-dashed border-gray-400'
            }
          `}
        >
          {selectedPhonemes[index] || ''}
        </div>
      ))}
    </div>
  );
}
