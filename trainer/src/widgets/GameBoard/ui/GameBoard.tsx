import { SlotsZone } from './SlotsZone';
import { KeyboardZone } from './KeyboardZone';
import { usePhonicsGame } from '@/features/phonics-engine';

/**
 * Main game board widget
 * Combines slots and keyboard zones
 */
export function GameBoard() {
  const { currentWord, handlePhonemeClick } = usePhonicsGame();
  
  if (!currentWord) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="flex flex-col items-center gap-10 p-6">
      <SlotsZone phonemes={currentWord.phonemes} />
      <KeyboardZone 
        phonemes={currentWord.phonemes} 
        onPhonemeClick={handlePhonemeClick}
      />
    </div>
  );
}
