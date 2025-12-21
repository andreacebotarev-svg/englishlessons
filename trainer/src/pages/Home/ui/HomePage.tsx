import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';

/**
 * Home page - Lesson selection menu
 */
export function HomePage() {
  const navigate = useNavigate();
  
  // TODO: Load lessons from data/curriculum.json or similar
  const lessons = [
    { id: 'lesson_01', title: 'Lesson 1: Short E', order: 1 },
    { id: 'lesson_02', title: 'Lesson 2: Short A', order: 2 },
    { id: 'lesson_03', title: 'Lesson 3: Short I', order: 3 },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎯 English Phonics Trainer
          </h1>
          <p className="text-xl text-gray-600">
            Learn to read with fun!
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map(lesson => (
            <Card key={lesson.id} className="hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">
                  📖
                </div>
                <h2 className="text-xl font-semibold text-center">
                  {lesson.title}
                </h2>
                <Button 
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  variant="primary"
                >
                  Start Lesson
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
