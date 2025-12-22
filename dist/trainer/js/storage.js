export class Storage {
  constructor() {
    this.storageKey = 'englishTrainer';
    this.data = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (error) {
      console.error('Failed to load storage:', error);
      return this.getDefaultData();
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save storage:', error);
    }
  }

  getDefaultData() {
    return {
      totalScore: 0,
      totalWords: 0,
      totalLessons: 0,
      totalPlaytime: 0,
      lessons: {}
    };
  }

  // Get stats
  getStats() {
    return {
      totalScore: this.data.totalScore,
      totalWords: this.data.totalWords,
      totalLessons: this.data.totalLessons,
      totalPlaytime: this.data.totalPlaytime
    };
  }

  // Get lesson progress
  getLessonProgress(lessonId) {
    return this.data.lessons[lessonId] || {
      score: 0,
      stars: 0,
      completedWords: 0,
      totalWords: 0,
      lastPlayed: 0,
      attempts: 0
    };
  }

  // Save lesson result
  saveLessonResult(lessonId, result) {
    const lessonData = this.data.lessons[lessonId] || {
      score: 0,
      stars: 0,
      completedWords: 0,
      totalWords: result.totalWords,
      attempts: 0
    };

    // Update lesson data
    const isFirstCompletion = lessonData.completedWords !== result.totalWords;
    lessonData.score = Math.max(lessonData.score, result.score);
    lessonData.stars = Math.max(lessonData.stars, result.stars);
    lessonData.completedWords = result.completedWords;
    lessonData.totalWords = result.totalWords;
    lessonData.lastPlayed = Date.now();
    lessonData.attempts++;

    this.data.lessons[lessonId] = lessonData;

    // Update global stats
    this.data.totalScore += result.score;
    
    if (isFirstCompletion && result.completedWords === result.totalWords) {
      this.data.totalWords += result.totalWords;
      this.data.totalLessons++;
    }

    this.save();
  }

  // Reset all progress
  reset() {
    this.data = this.getDefaultData();
    this.save();
  }

  // Get all completed lessons
  getCompletedLessons() {
    return Object.entries(this.data.lessons)
      .filter(([_, data]) => data.completedWords === data.totalWords)
      .map(([id]) => parseInt(id));
  }
}