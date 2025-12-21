import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameBoard } from '@/widgets/GameBoard';
import { WordCard } from '@/widgets/WordDisplay';
import { ProgressBar } from '@/widgets/ProgressBar';
import { useLessonData } from '../model/useLessonData';
import { useSessionStore } from '@/entities/session';

/**
 * Main trainer page - where the game happens
 */
export function TrainerPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { lesson, isLoading, error } = useLessonData(lessonId!);
  
  const currentLesson = useSessionStore(state => state.currentLesson);
  const currentWordIndex = useSessionStore(state => state.currentWordIndex);
  const score = useSessionStore(state => state.score);
  const status = useSessionStore(state => state.status);
  const setLesson = useSessionStore(state => state.setLesson);
  
  useEffect(() => {
    if (lesson) {
      setLesson(lesson);
    }
  }, [lesson, setLesson]);
  
  useEffect(() => {
    if (status === 'completed') {
      // Navigate to result page
      navigate('/result');
    }
  }, [status, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading lesson...</div>
      </div>
    );
  }
  
  if (error || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl text-error mb-4">
            {error || 'Failed to load lesson'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  const currentWord = currentLesson.words[currentWordIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <ProgressBar 
        current={currentWordIndex}
        total={currentLesson.words.length}
        score={score}
      />
      
      <div className="flex flex-col items-center justify-center p-6 gap-8">
        <WordCard word={currentWord} />
        <GameBoard />
      </div>
    </div>
  );
}
