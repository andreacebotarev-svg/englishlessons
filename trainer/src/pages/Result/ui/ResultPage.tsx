import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { Button, Card } from '@/shared/ui';

/**
 * Result page - shows completion stats
 */
export function ResultPage() {
  const navigate = useNavigate();
  const score = useSessionStore(state => state.score);
  const currentLesson = useSessionStore(state => state.currentLesson);
  const resetGame = useSessionStore(state => state.resetGame);
  
  const handlePlayAgain = () => {
    resetGame();
    if (currentLesson) {
      navigate(`/lesson/${currentLesson.id}`);
    }
  };
  
  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <div className="text-8xl mb-6">
          🎉
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Great Job!
        </h1>
        
        <div className="text-6xl font-bold text-primary mb-8">
          ⭐ {score}
        </div>
        
        {currentLesson && (
          <p className="text-xl text-gray-600 mb-8">
            You completed: {currentLesson.title}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button onClick={handlePlayAgain} variant="primary">
            Play Again
          </Button>
          <Button onClick={handleGoHome} variant="secondary">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
