/**
 * Lesson Loader Utility
 * Loads and validates lesson JSON files
 */

export async function loadLesson(lessonId) {
    try {
        const response = await fetch(`public/data/${lessonId}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load lesson: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Basic validation
        if (!data.id || !data.words || !Array.isArray(data.words)) {
            throw new Error('Invalid lesson format');
        }
        
        console.log(`✅ Loaded lesson: ${data.title}`);
        return data;
        
    } catch (error) {
        console.error('❌ Lesson loading error:', error);
        throw error;
    }
}
