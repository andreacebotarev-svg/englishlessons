/**
 * APPLE-STYLE THEME MANAGER v3.3.0 CRITICAL FIX
 * iOS Segmented Control with Spring Physics + Micro-interactions
 * Fixed: Double render issue + position:fixed stability
 */

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.createThemeSwitcherUI();
    this.attachKeyboardNav();
    console.log(`[ThemeManager v3.3.0] Initialized with theme: ${this.currentTheme}`);
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
   * @param {HTMLElement} button - Button that triggered the change (for ripple)
   */
  setTheme(themeId, button = null) {
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
    
    // Update UI
    this.updateThemeSwitcherUI(themeId);
    
    // Trigger ripple effect if button provided
    if (button) {
      this.createRipple(button);
    }
    
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

  /**
   * Create Apple-style theme switcher UI
   * iOS Segmented Control with sliding indicator
   * CRITICAL FIX: Remove duplicates before creating new one
   */
  createThemeSwitcherUI() {
    // CRITICAL FIX: Remove ALL existing switchers first
    const existingSwitchers = document.querySelectorAll('.theme-switcher');
    if (existingSwitchers.length > 0) {
      console.warn(`[ThemeManager] Found ${existingSwitchers.length} existing switcher(s), removing...`);
      existingSwitchers.forEach(s => s.remove());
    }

    const themes = [
      { id: 'default', icon: '☀️', label: 'Light' },
      { id: 'kids', icon: '🎨', label: 'Kids' },
      { id: 'dark', icon: '🌙', label: 'Dark' }
    ];

    // Create container with data attribute for CSS
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Theme selector');
    switcher.setAttribute('data-active-theme', this.currentTheme);

    // CRITICAL FIX: Force position:fixed with inline styles (!important equivalent)
    switcher.style.cssText = `
      position: fixed !important;
      top: max(0.5rem, env(safe-area-inset-top, 0.5rem)) !important;
      right: max(0.5rem, env(safe-area-inset-right, 0.5rem)) !important;
      z-index: 9999 !important;
    `;

    // Create sliding indicator (background)
    const indicator = document.createElement('div');
    indicator.className = 'theme-indicator';
    switcher.appendChild(indicator);

    // Create glow effect
    const glow = document.createElement('div');
    glow.className = 'theme-indicator-glow';
    switcher.appendChild(glow);

    // Create buttons
    themes.forEach((theme, index) => {
      const btn = document.createElement('button');
      btn.className = `theme-btn-apple${theme.id === this.currentTheme ? ' active' : ''}`;
      btn.setAttribute('data-theme', theme.id);
      btn.setAttribute('aria-label', `Switch to ${theme.label} theme`);
      btn.setAttribute('aria-pressed', theme.id === this.currentTheme);
      
      btn.innerHTML = `
        <span class="theme-icon">${theme.icon}</span>
        <span class="theme-label">${theme.label}</span>
      `;
      
      btn.addEventListener('click', (e) => {
        this.setTheme(theme.id, e.currentTarget);
      });
      
      switcher.appendChild(btn);
    });

    // CRITICAL FIX: Inject directly into <body> (root level, bypasses transform parents)
    document.body.appendChild(switcher);

    // Position indicator after DOM render
    requestAnimationFrame(() => {
      this.updateIndicatorPosition(this.currentTheme, false);
    });

    console.log('[ThemeManager] Apple-style switcher created at body root with fixed position');
  }

  /**
   * Update theme switcher UI (button states + indicator position)
   * @param {string} themeId - Active theme ID
   */
  updateThemeSwitcherUI(themeId) {
    const switcher = document.querySelector('.theme-switcher');
    if (!switcher) return;

    // Update data attribute for CSS
    switcher.setAttribute('data-active-theme', themeId);

    // Update button states
    switcher.querySelectorAll('.theme-btn-apple, .theme-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-theme') === themeId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
      
      // Trigger icon bounce animation for active button
      if (isActive) {
        const icon = btn.querySelector('.theme-icon');
        if (icon) {
          icon.style.animation = 'none';
          requestAnimationFrame(() => {
            icon.style.animation = '';
          });
        }
      }
    });

    // Animate indicator to new position
    this.updateIndicatorPosition(themeId, true);
  }

  /**
   * Update sliding indicator position with spring physics
   * @param {string} themeId - Target theme ID
   * @param {boolean} animated - Whether to animate the transition
   */
  updateIndicatorPosition(themeId, animated = true) {
    const switcher = document.querySelector('.theme-switcher');
    if (!switcher) return;

    const indicator = switcher.querySelector('.theme-indicator');
    const glow = switcher.querySelector('.theme-indicator-glow');
    if (!indicator || !glow) return;

    // Find active button
    const activeBtn = switcher.querySelector(`[data-theme="${themeId}"]`);
    if (!activeBtn) return;

    // Calculate position
    const switcherRect = switcher.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const offsetX = btnRect.left - switcherRect.left - 5; // -5px for padding

    // Apply transform
    const transform = `translateX(${offsetX}px)`;
    indicator.style.transform = transform;
    glow.style.transform = transform;

    // Disable transition if not animated (initial load)
    if (!animated) {
      indicator.style.transition = 'none';
      glow.style.transition = 'none';
      requestAnimationFrame(() => {
        indicator.style.transition = '';
        glow.style.transition = '';
      });
    }

    console.log(`[ThemeManager] Indicator moved to ${themeId} (offset: ${offsetX}px)`);
  }

  /**
   * Create ripple effect on button click
   * @param {HTMLElement} button - Button element that was clicked
   */
  createRipple(button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    // Position ripple at click point
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.height / 2 - size / 2}px`;
    
    button.appendChild(ripple);
    ripple.classList.add('animate');
    
    // Remove after animation
    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Attach keyboard navigation (1/2/3 or Arrow keys)
   */
  attachKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      const themes = ['default', 'kids', 'dark'];
      const currentIndex = themes.indexOf(this.currentTheme);
      let newIndex = currentIndex;

      // Number keys: 1 = Light, 2 = Kids, 3 = Dark
      if (e.key >= '1' && e.key <= '3') {
        newIndex = parseInt(e.key) - 1;
      }
      // Arrow keys: cycle through themes
      else if (e.key === 'ArrowLeft') {
        newIndex = (currentIndex - 1 + themes.length) % themes.length;
      }
      else if (e.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % themes.length;
      }
      else {
        return; // Not a theme shortcut
      }

      if (newIndex !== currentIndex) {
        e.preventDefault();
        const newTheme = themes[newIndex];
        const button = document.querySelector(`[data-theme="${newTheme}"]`);
        this.setTheme(newTheme, button);
        console.log(`[ThemeManager] Keyboard navigation: ${this.currentTheme}`);
      }
    });

    console.log('[ThemeManager] Keyboard navigation enabled (1/2/3, Arrow keys)');
  }
}