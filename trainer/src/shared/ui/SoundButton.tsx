import { speak } from '@/features/audio-manager/lib/speak';

interface SoundButtonProps {
  text: string;
  rate?: number;
  className?: string;
  icon?: string;
}

export const SoundButton = ({ 
  text, 
  rate = 0.8, 
  className = '', 
  icon = '🔊' 
}: SoundButtonProps) => {
  const handleClick = () => {
    speak(text, rate);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        px-4 py-2 bg-blue-500 text-white rounded-full 
        hover:bg-blue-600 active:scale-95 transition-all
        shadow-md hover:shadow-lg
        ${className}
      `}
      title={`Прослушать: "${text}"`}
    >
      <span className="text-2xl">{icon}</span>
    </button>
  );
};
