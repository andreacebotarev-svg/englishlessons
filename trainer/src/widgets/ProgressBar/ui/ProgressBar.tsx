interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
}

/**
 * Progress indicator for lesson
 */
export function ProgressBar({ current, total, score }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-white shadow-md p-4 flex items-center justify-between">
      <div className="text-sm font-medium text-gray-700">
        Word {current + 1} / {total}
      </div>
      
      <div className="flex-grow mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-lg font-bold text-primary">
        ⭐ {score}
      </div>
    </div>
  );
}
