import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ current, total, className = '' }: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>Прогресс</span>
        <span className="font-bold">{current} / {total}</span>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
        />
      </div>
    </div>
  );
};
