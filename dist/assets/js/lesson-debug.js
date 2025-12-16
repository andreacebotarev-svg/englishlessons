/**
 * LessonDebugger - Система отладки для English Lessons
 * Активация: Ctrl+D или LessonDebugger.show()
 */

class LessonDebugger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.performanceMarks = {};
    this.isVisible = false;
    this.maxLogs = 500;
    
    this.init();
  }

  init() {
    this.injectStyles();
    this.createPanel();
    this.interceptConsole();
    this.interceptFetch();
    this.interceptErrors();
    this.setupKeyboardShortcut();
    
    this.log('🐛 Debug Mode Active', 'system');
  }

  // ============================================
  // UI - Визуальная панель
  // ============================================
  
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 600px;
        height: 400px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #00ff00;
        border-radius: 8px 0 0 0;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 999999;
        display: none;
        flex-direction: column;
        box-shadow: 0 -4px 20px rgba(0, 255, 0, 0.3);
      }
      
      .debug-panel.visible {
        display: flex;
      }
      
      .debug-header {
        background: #1a1a1a;
        padding: 10px;
        border-bottom: 1px solid #00ff00;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .debug-title {
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .debug-controls {
        display: flex;
        gap: 8px;
      }
      
      .debug-btn {
        background: #003300;
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 4px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 11px;
        transition: all 0.2s;
      }
      
      .debug-btn:hover {
        background: #00ff00;
        color: #000;
      }
      
      .debug-tabs {
        display: flex;
        background: #0a0a0a;
        border-bottom: 1px solid #00ff00;
      }
      
      .debug-tab {
        padding: 8px 16px;
        cursor: pointer;
        border-right: 1px solid #003300;
        transition: background 0.2s;
      }
      
      .debug-tab:hover {
        background: #1a1a1a;
      }
      
      .debug-tab.active {
        background: #003300;
        border-bottom: 2px solid #00ff00;
      }
      
      .debug-content {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }
      
      .debug-log {
        margin: 2px 0;
        padding: 4px 8px;
        border-left: 3px solid transparent;
        word-wrap: break-word;
      }
      
      .debug-log.info { border-left-color: #00aaff; color: #00aaff; }
      .debug-log.warn { border-left-color: #ffaa00; color: #ffaa00; }
      .debug-log.error { border-left-color: #ff0000; color: #ff0000; background: rgba(255,0,0,0.1); }
      .debug-log.success { border-left-color: #00ff00; color: #00ff00; }
      .debug-log.system { border-left-color: #ff00ff; color: #ff00ff; }
      
      .debug-timestamp {
        color: #666;
        font-size: 10px;
        margin-right: 8px;
      }
      
      .debug-state-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .debug-state-item {
        background: #1a1a1a;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #003300;
      }
      
      .debug-state-label {
        color: #888;
        font-size: 10px;
        margin-bottom: 4px;
      }
      
      .debug-state-value {
        color: #00ff00;
        font-weight: bold;
      }
      
      .debug-json {
        background: #0a0a0a;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #003300;
        overflow-x: auto;
        white-space: pre;
      }
      
      .debug-resize-handle {
        position: absolute;
        top: 0;
        left: 0;
        width: 10px;
        height: 100%;
        cursor: ew-resize;
      }
      
      @media (max-width: 768px) {
        .debug-panel {
          width: 100%;
          height: 50vh;
        }
      }
    `;
    document.head.appendChild(style);
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.className = 'debug-panel';
    
    panel.innerHTML = `
      <div class="debug-resize-handle"></div>
      <div class="debug-header">
        <div class="debug-title">
          <span>🐛</span>
          <span>Lesson Debugger</span>
          <span id="debug-status" style="font-size:10px;color:#888;"></span>
        </div>
        <div class="debug-controls">
          <button class="debug-btn" onclick="window.lessonDebugger.clear()">Clear</button>
          <button class="debug-btn" onclick="window.lessonDebugger.exportLogs()">Export</button>
          <button class="debug-btn" onclick="window.lessonDebugger.validateLesson()">Validate</button>
          <button class="debug-btn" onclick="window.lessonDebugger.hide()">✕</button>
        </div>
      </div>
      
      <div class="debug-tabs">
        <div class="debug-tab active" data-tab="console">Console</div>
        <div class="debug-tab" data-tab="state">State</div>
        <div class="debug-tab" data-tab="network">Network</div>
        <div class="debug-tab" data-tab="validation">Validation</div>
      </div>
      
      <div class="debug-content" id="debug-content"></div>
    `;
    
    document.body.appendChild(panel);
    this.panel = panel;
    this.contentArea = panel.querySelector('#debug-content');
    
    // Табы
    panel.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        panel.querySelectorAll('.debug-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderTab(tab.dataset.tab);
      });
    });
    
    // Resize
    this.setupResize();
  }

  setupResize() {
    const handle = this.panel.querySelector('.debug-resize-handle');
    let isResizing = false;
    let startX, startWidth;
    
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidth = this.panel.offsetWidth;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const width = startWidth + (startX - e.clientX);
      this.panel.style.width = Math.max(400, Math.min(1200, width)) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }

  // ============================================
  // Логирование
  // ============================================
  
  log(message, type = 'info', meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      type,
      meta,
      stack: type === 'error' ? new Error().stack : null
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
    
    if (type === 'error') this.errors.push(entry);
    if (type === 'warn') this.warnings.push(entry);
    
    this.updateStatus();
    
    if (this.isVisible && this.currentTab === 'console') {
      this.renderConsole();
    }
    
    // Оригинальный console
    const method = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
    console[method](`[Debugger] ${message}`, meta);
  }

  // ============================================
  // Перехватчики
  // ============================================
  
  interceptConsole() {
    const original = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    
    console.log = (...args) => {
      this.log(args.join(' '), 'info');
      original.log.apply(console, args);
    };
    
    console.warn = (...args) => {
      this.log(args.join(' '), 'warn');
      original.warn.apply(console, args);
    };
    
    console.error = (...args) => {
      this.log(args.join(' '), 'error');
      original.error.apply(console, args);
    };
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    const self = this;
    
    window.fetch = async function(...args) {
      const url = args[0];
      const startTime = performance.now();
      
      self.log(`📡 Fetching: ${url}`, 'info');
      
      try {
        const response = await originalFetch.apply(this, args);
        const duration = (performance.now() - startTime).toFixed(2);
        
        if (response.ok) {
          self.log(`✅ Fetch OK: ${url} (${duration}ms)`, 'success', {
            status: response.status,
            duration
          });
        } else {
          self.log(`❌ Fetch Failed: ${url} - ${response.status}`, 'error', {
            status: response.status,
            statusText: response.statusText,
            duration
          });
        }
        
        return response;
      } catch (error) {
        const duration = (performance.now() - startTime).toFixed(2);
        self.log(`💥 Fetch Error: ${url} - ${error.message}`, 'error', {
          error: error.message,
          duration
        });
        throw error;
      }
    };
  }

  interceptErrors() {
    window.addEventListener('error', (event) => {
      this.log(`💥 Global Error: ${event.message}`, 'error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.log(`💥 Unhandled Promise Rejection: ${event.reason}`, 'error', {
        reason: event.reason
      });
    });
  }

  // ============================================
  // Валидация
  // ============================================
  
  async validateLesson() {
    this.log('🔍 Starting lesson validation...', 'system');
    
    const engine = window.lessonEngine;
    if (!engine) {
      this.log('❌ LessonEngine not found', 'error');
      return;
    }
    
    const results = {
      lessonData: this.validateLessonData(engine.lessonData),
      dom: this.validateDOM(),
      storage: this.validateStorage(),
      tts: this.validateTTS()
    };
    
    const allPassed = Object.values(results).every(r => r.passed);
    
    this.log(
      allPassed ? '✅ All validations passed' : '⚠️ Some validations failed',
      allPassed ? 'success' : 'warn',
      results
    );
    
    this.validationResults = results;
    if (this.currentTab === 'validation') {
      this.renderValidation();
    }
    
    return results;
  }

  validateLessonData(data) {
    const checks = [];
    
    if (!data) {
      checks.push({ name: 'Data exists', passed: false, error: 'lessonData is null' });
      return { passed: false, checks };
    }
    
    checks.push({ name: 'Data exists', passed: true });
    checks.push({ name: 'Has title', passed: !!data.title });
    checks.push({ name: 'Has subtitle', passed: !!data.subtitle });
    checks.push({ name: 'Has meta', passed: !!data.meta });
    checks.push({ name: 'Has content', passed: !!data.content });
    checks.push({ name: 'Has reading', passed: !!data.content?.reading?.length });
    checks.push({ name: 'Has vocabulary', passed: !!data.vocabulary?.words?.length });
    checks.push({ name: 'Has grammar', passed: !!data.grammar });
    checks.push({ name: 'Has quiz', passed: !!data.quiz?.length });
    
    // Проверка структуры vocabulary
    if (data.vocabulary?.words) {
      const word = data.vocabulary.words[0];
      checks.push({
        name: 'Vocabulary structure',
        passed: !!(word?.en && word?.ru && word?.transcription),
        error: !word ? 'No words' : 'Missing required fields'
      });
    }
    
    const passed = checks.every(c => c.passed);
    return { passed, checks };
  }

  validateDOM() {
    const checks = [
      { name: 'App root exists', passed: !!document.getElementById('app-root') },
      { name: 'App container exists', passed: !!document.getElementById('app') },
      { name: 'Loader exists', passed: !!document.getElementById('loader') },
      { name: 'Notification exists', passed: !!document.getElementById('notification') }
    ];
    
    return { passed: checks.every(c => c.passed), checks };
  }

  validateStorage() {
    const checks = [];
    
    try {
      const engine = window.lessonEngine;
      const storage = engine?.storage;
      
      checks.push({ name: 'Storage exists', passed: !!storage });
      
      if (storage) {
        const count = storage.getCount();
        checks.push({ name: 'Can read count', passed: true, value: count });
        
        // Тест записи
        try {
          localStorage.setItem('__test__', 'test');
          localStorage.removeItem('__test__');
          checks.push({ name: 'Can write', passed: true });
        } catch (e) {
          checks.push({ name: 'Can write', passed: false, error: e.message });
        }
      }
    } catch (e) {
      checks.push({ name: 'Storage check', passed: false, error: e.message });
    }
    
    return { passed: checks.every(c => c.passed), checks };
  }

  validateTTS() {
    const checks = [];
    
    try {
      const engine = window.lessonEngine;
      const tts = engine?.tts;
      
      checks.push({ name: 'TTS exists', passed: !!tts });
      checks.push({ name: 'Audio supported', passed: !!window.Audio });
      
      // Проверка Google TTS URL
      if (tts) {
        const testUrl = tts.getAudioUrl?.('test', 'en');
        checks.push({
          name: 'TTS URL generation',
          passed: !!testUrl && testUrl.includes('translate.google.com'),
          value: testUrl
        });
      }
    } catch (e) {
      checks.push({ name: 'TTS check', passed: false, error: e.message });
    }
    
    return { passed: checks.every(c => c.passed), checks };
  }

  // ============================================
  // Рендеринг табов
  // ============================================
  
  renderTab(tabName) {
    this.currentTab = tabName;
    
    switch (tabName) {
      case 'console':
        this.renderConsole();
        break;
      case 'state':
        this.renderState();
        break;
      case 'network':
        this.renderNetwork();
        break;
      case 'validation':
        this.renderValidation();
        break;
    }
  }

  renderConsole() {
    const html = this.logs.slice(-100).reverse().map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const metaStr = Object.keys(log.meta).length > 0 
        ? `<div style="color:#666;font-size:10px;margin-left:20px;">${JSON.stringify(log.meta)}</div>`
        : '';
      
      return `
        <div class="debug-log ${log.type}">
          <span class="debug-timestamp">${time}</span>
          ${this.escapeHTML(log.message)}
          ${metaStr}
        </div>
      `;
    }).join('');
    
    this.contentArea.innerHTML = html || '<div style="color:#666;padding:20px;">No logs yet...</div>';
    this.contentArea.scrollTop = 0;
  }

  renderState() {
    const engine = window.lessonEngine;
    
    if (!engine) {
      this.contentArea.innerHTML = '<div style="color:#ff0000;padding:20px;">LessonEngine not initialized</div>';
      return;
    }
    
    const state = {
      'Lesson ID': engine.lessonId || 'N/A',
      'Current Tab': engine.currentTab || 'N/A',
      'Vocab Mode': engine.vocabMode || 'N/A',
      'Flashcard Index': engine.flashcardIndex ?? 'N/A',
      'My Words Count': engine.myWords?.size || 0,
      'Quiz Progress': engine.quizState ? `${engine.quizState.currentIndex + 1}/${engine.quizState.questions.length}` : 'N/A',
      'Quiz Score': engine.quizState ? `${engine.quizState.score}/${engine.quizState.questions.length}` : 'N/A',
      'Data Loaded': !!engine.lessonData
    };
    
    const html = `
      <div class="debug-state-grid">
        ${Object.entries(state).map(([key, value]) => `
          <div class="debug-state-item">
            <div class="debug-state-label">${key}</div>
            <div class="debug-state-value">${value}</div>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top:20px;">
        <div style="color:#888;margin-bottom:8px;">Lesson Data:</div>
        <div class="debug-json">${JSON.stringify(engine.lessonData, null, 2)}</div>
      </div>
    `;
    
    this.contentArea.innerHTML = html;
  }

  renderNetwork() {
    const networkLogs = this.logs.filter(log => 
      log.message.includes('Fetch') || log.message.includes('📡')
    );
    
    if (networkLogs.length === 0) {
      this.contentArea.innerHTML = '<div style="color:#666;padding:20px;">No network activity</div>';
      return;
    }
    
    const html = networkLogs.reverse().map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString();
      const duration = log.meta.duration ? `${log.meta.duration}ms` : '';
      const status = log.meta.status ? `[${log.meta.status}]` : '';
      
      return `
        <div class="debug-log ${log.type}">
          <span class="debug-timestamp">${time}</span>
          ${this.escapeHTML(log.message)}
          <span style="color:#666;margin-left:10px;">${status} ${duration}</span>
        </div>
      `;
    }).join('');
    
    this.contentArea.innerHTML = html;
  }

  renderValidation() {
    if (!this.validationResults) {
      this.contentArea.innerHTML = '<div style="color:#666;padding:20px;">Run validation first</div>';
      return;
    }
    
    const sections = Object.entries(this.validationResults).map(([name, result]) => {
      const icon = result.passed ? '✅' : '❌';
      const checksHtml = result.checks.map(check => {
        const checkIcon = check.passed ? '✅' : '❌';
        const error = check.error ? `<span style="color:#ff0000;"> - ${check.error}</span>` : '';
        const value = check.value ? `<span style="color:#666;"> (${check.value})</span>` : '';
        return `<div style="margin-left:20px;margin-top:4px;">${checkIcon} ${check.name}${error}${value}</div>`;
      }).join('');
      
      return `
        <div style="margin-bottom:20px;">
          <div style="font-weight:bold;margin-bottom:8px;">${icon} ${name.toUpperCase()}</div>
          ${checksHtml}
        </div>
      `;
    }).join('');
    
    this.contentArea.innerHTML = sections;
  }

  // ============================================
  // Утилиты
  // ============================================
  
  show() {
    this.isVisible = true;
    this.panel.classList.add('visible');
    this.renderTab(this.currentTab || 'console');
  }

  hide() {
    this.isVisible = false;
    this.panel.classList.remove('visible');
  }

  toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  clear() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.renderConsole();
    this.log('🧹 Logs cleared', 'system');
  }

  exportLogs() {
    const data = {
      exported: new Date().toISOString(),
      logs: this.logs,
      errors: this.errors,
      warnings: this.warnings,
      validation: this.validationResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lesson-debug-${Date.now()}.json`;
    a.click();
    
    this.log('📥 Logs exported', 'success');
  }

  updateStatus() {
    const status = document.getElementById('debug-status');
    if (status) {
      status.textContent = `Logs: ${this.logs.length} | Errors: ${this.errors.length} | Warnings: ${this.warnings.length}`;
    }
  }

  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Автоматическая инициализация
if (typeof window !== 'undefined') {
  window.lessonDebugger = new LessonDebugger();
  console.log('%c🐛 Lesson Debugger Active', 'color:#00ff00;font-size:16px;font-weight:bold;');
  console.log('%cPress Ctrl+D to toggle debug panel', 'color:#00aaff;');
}
