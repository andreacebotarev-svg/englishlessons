import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">English Phonics Trainer</h1>
      
      <div className="grid gap-4">
        {[1, 2, 3].map((num) => (
          <Link 
            key={num} 
            to={`/lesson/lesson_0${num}`}
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all hover:scale-[1.02]"
          >
            <h2 className="text-xl font-bold text-slate-800">Урок {num}</h2>
            <p className="text-slate-500">Нажмите, чтобы начать</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
