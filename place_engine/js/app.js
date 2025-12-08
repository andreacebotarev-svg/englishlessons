const App = {
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // 1. Читаем ID урока из URL (?lesson=263)
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson');

            if (!lessonId) throw new Error("No lesson ID provided");

            // 2. Загружаем JSON (выходим на уровень выше в папку data)
            const response = await fetch(`../../data/${lessonId}.json`);
            if (!response.ok) throw new Error("Lesson not found");
            
            const data = await response.json();

            // 3. Достаем слова (из vocabulary или phrases)
            let words = [];
            if (data.content.vocabulary && data.content.vocabulary.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) throw new Error("No words in this lesson");

            // 4. Запускаем строителя
            Builder.build(words);
            
            // 5. Запускаем камеру
            Camera.init();

            // Скрываем лоадер
            loader.style.display = 'none';

        } catch (error) {
            loader.style.display = 'none';
            const errDiv = document.getElementById('error-msg');
            errDiv.textContent = `Ошибка: ${error.message}`;
            errDiv.style.display = 'block';
            console.error(error);
        }
    }
};

// Старт при загрузке страницы
document.addEventListener('DOMContentLoaded', () => App.init());
