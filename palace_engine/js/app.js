/* ============================================
   MEMORY PALACE - MAIN APPLICATION - SIMPLIFIED
   Описание: Нициализация и загружа данных
   ============================================ */

const App = {
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // 1. Читаем ID урока из URL (?lesson=263)
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson');
            
            if (!lessonId) {
                throw new Error('No lesson ID provided');
            }
            
            // 2. Загружаем JSON
            // Путь: файл palace_engine/index.html -> где данные?
            // Найдите свое расположение data файлов
            const response = await fetch(`../../data/${lessonId}.json`);
            
            if (!response.ok) {
                throw new Error('Lesson not found');
            }
            
            const data = await response.json();
            
            // 3. Достаем слова
            let words = [];
            
            if (data.content && data.content.vocabulary && data.content.vocabulary.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) {
                throw new Error('No words in this lesson');
            }
            
            // 4. Постраиваем мир с карточками
            Builder.build(words);
            
            // 5. Обновляем счётчик
            document.getElementById('word-counter').textContent = `0 / ${words.length}`;
            
            // 6. Запускаем камеру
            Camera.init();
            
            // Скрываем лоадер
            loader.style.display = 'none';
            
            console.log(`✅ App initialized with ${words.length} words`);
            
        } catch (error) {
            loader.style.display = 'none';
            
            const errDiv = document.getElementById('error-msg');
            errDiv.textContent = `Ошибка: ${error.message}`;
            errDiv.style.display = 'block';
            
            console.error('❌ Initialization failed:', error);
        }
    }
};

// Старт при загрузке страницы
document.addEventListener('DOMContentLoaded', () => App.init());

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}