/**
 * THEME MANAGER
 * Handles theme switching and persistence
 */

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    console.log(`[ThemeManager] Initialized with theme: ${this.currentTheme}`);
  }

  /**
   * Load saved theme from localStorage
   * @returns {string} Theme ID ('default', 'kids', 'dark')
   */
  loadTheme() {
    const saved = localStorage.getItem('eng-tutor-theme');
    const theme = saved || 'default';
    console.log(`[ThemeManager] Loaded theme from storage: ${theme}`);
    return theme;
  }

  /**
   * Save theme to localStorage
   * @param {string} themeId - Theme ID to save
   */
  saveTheme(themeId) {
    localStorage.setItem('eng-tutor-theme', themeId);
    console.log(`[ThemeManager] Saved theme to storage: ${themeId}`);
  }

  /**
   * Get current theme
   * @returns {string} Current theme ID
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Set and apply new theme
   * @param {string} themeId - 'default', 'kids', or 'dark'
   */
  setTheme(themeId) {
    console.log(`[ThemeManager] Switching to theme: ${themeId}`);
    
    // Validate theme ID
    const validThemes = ['default', 'kids', 'dark'];
    if (!validThemes.includes(themeId)) {
      console.warn(`[ThemeManager] Invalid theme ID: ${themeId}. Falling back to 'default'.`);
      themeId = 'default';
    }
    
    // Remove old theme classes
    document.documentElement.classList.remove(
      'theme-default',
      'theme-kids',
      'theme-dark'
    );
    
    // Add new theme class
    document.documentElement.classList.add(`theme-${themeId}`);
    
    // Update state
    this.currentTheme = themeId;
    this.saveTheme(themeId);
    
    console.log(`[ThemeManager] Theme applied: ${themeId}`);
  }

  /**
   * Apply theme on initialization (no localStorage save)
   * @param {string} themeId - Theme ID to apply
   * @private
   */
  applyTheme(themeId) {
    document.documentElement.classList.add(`theme-${themeId}`);
    console.log(`[ThemeManager] Initial theme applied: ${themeId}`);
  }
}