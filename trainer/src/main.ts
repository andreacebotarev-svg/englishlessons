/**
 * Entry point for English Phonics Trainer
 * Pure Vanilla TypeScript application
 */

import { App } from './core/App';
import './shared/styles/global.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

// Initialize and start the application
const app = new App(root);
app.start().catch(error => {
  console.error('Failed to start application:', error);
  root.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>😢 Ошибка загрузки</h1>
      <p>Приложение не смогло запуститься.</p>
      <p style="color: #ef4444;">${error.message}</p>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">
        🔄 Перезагрузить
      </button>
    </div>
  `;
});

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
  import.meta.hot.accept();
}
