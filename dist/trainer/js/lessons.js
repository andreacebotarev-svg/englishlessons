export class LessonLoader {
  constructor() {
    this.cache = new Map();
    this.baseUrl = window.location.origin.includes('localhost') 
      ? '/data/trainer/'
      : 'https://raw.githubusercontent.com/andreacebotarev-svg/englishlessons/main/data/trainer/';
  }

  async loadLesson(lessonId) {
    // Check cache
    if (this.cache.has(lessonId)) {
      return this.cache.get(lessonId);
    }

    try {
      // Try relative path first (for local and GitHub Pages)
      let url = `../../data/trainer/lesson_${String(lessonId).padStart(2, '0')}.json`;
      let response = await fetch(url);
      
      // If failed, try absolute GitHub raw URL
      if (!response.ok) {
        url = `${this.baseUrl}lesson_${String(lessonId).padStart(2, '0')}.json`;
        response = await fetch(url);
      }

      if (!response.ok) {
        throw new Error(`Lesson ${lessonId} not found`);
      }

      const data = await response.json();
      this.cache.set(lessonId, data);
      return data;
    } catch (error) {
      console.error('Failed to load lesson:', error);
      throw error;
    }
  }

  async loadAllLessons() {
    const lessons = [];
    let lessonId = 1;
    let consecutiveFailures = 0;

    while (consecutiveFailures < 3) {
      try {
        const lesson = await this.loadLesson(lessonId);
        lessons.push(lesson);
        consecutiveFailures = 0;
        lessonId++;
      } catch (error) {
        consecutiveFailures++;
        lessonId++;
      }
    }

    return lessons;
  }

  clearCache() {
    this.cache.clear();
  }
}