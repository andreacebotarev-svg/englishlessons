#!/usr/bin/env node

/**
 * LESSON IMAGE GENERATOR
 * 
 * Автоматически загружает изображения для всех слов урока из Pexels API
 * и обновляет JSON с путями к картинкам.
 * 
 * Использование:
 *   node scripts/generate-lesson-images.js 263
 * 
 * Требования:
 *   - Node.js 14+
 *   - Pexels API key в переменной PEXELS_API_KEY
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'gYenClsQ9b655KaiMxlhjgR9yx8ZOqU5BsCzyWe0eTSFWCWlFt3XFqgF';
const DELAY_MS = 2000; // 2 секунды между запросами (лимит: 200/час)

/**
 * Ищет изображение в Pexels по ключевому слову
 */
async function fetchImage(keyword) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
      headers: { 'Authorization': PEXELS_API_KEY }
    };

    console.log(`   🔍 Searching: "${keyword}"...`);

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos[0]) {
            resolve(json.photos[0].src.medium); // 350x350px
          } else {
            console.log(`   ⚠️  No results for "${keyword}"`);
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Скачивает изображение по URL
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // удаляем битый файл
      reject(err);
    });
  });
}

/**
 * Генерирует изображения для всех слов урока
 */
async function generateLessonImages(lessonNumber) {
  console.log(`\n🎨 GENERATING IMAGES FOR LESSON ${lessonNumber}\n`);

  // 1. Читаем JSON урока
  const jsonPath = path.join(__dirname, `../data/${lessonNumber}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: Lesson ${lessonNumber}.json not found!`);
    process.exit(1);
  }

  const lesson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // 2. Создаем папку для картинок
  const imagesDir = path.join(__dirname, `../images/${lessonNumber}`);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`📁 Created directory: images/${lessonNumber}/\n`);
  }

  // 3. Проверяем наличие слов в JSON
  const words = lesson.content?.vocabulary?.words;
  if (!words || words.length === 0) {
    console.error(`❌ Error: No words found in lesson ${lessonNumber}!`);
    process.exit(1);
  }

  console.log(`📚 Found ${words.length} words\n`);

  // 4. Обрабатываем каждое слово
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const keyword = word.en;
    const filename = `${keyword.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    const filepath = path.join(imagesDir, filename);

    console.log(`[${i + 1}/${words.length}] ${keyword}`);

    // Пропускаем, если файл уже существует
    if (fs.existsSync(filepath)) {
      console.log(`   ✅ Already exists\n`);
      word.image = `${lessonNumber}/${filename}`;
      skipped++;
      continue;
    }

    try {
      const imageUrl = await fetchImage(keyword);
      
      if (imageUrl) {
        await downloadImage(imageUrl, filepath);
        console.log(`   ✅ Downloaded: ${filename}\n`);
        
        // Обновляем JSON с путем к картинке
        word.image = `${lessonNumber}/${filename}`;
        downloaded++;
      } else {
        console.log(`   ❌ Failed: no image found\n`);
        failed++;
      }

      // Задержка, чтобы не превысить rate limit (200/час ≈ 18 сек/запрос)
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
      
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}\n`);
      failed++;
    }
  }

  // 5. Сохраняем обновленный JSON
  fs.writeFileSync(jsonPath, JSON.stringify(lesson, null, 2), 'utf8');

  // 6. Итоговая статистика
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ LESSON ${lessonNumber} COMPLETE!`);
  console.log(`${'='.repeat(50)}`);
  console.log(`📥 Downloaded: ${downloaded}`);
  console.log(`⏭️  Skipped:    ${skipped}`);
  console.log(`❌ Failed:     ${failed}`);
  console.log(`📊 Total:      ${words.length}`);
  console.log(`\n💾 JSON updated: data/${lessonNumber}.json`);
  console.log(`📁 Images dir:   images/${lessonNumber}/\n`);
}

// === CLI ENTRY POINT ===
const lessonNumber = process.argv[2];

if (!lessonNumber) {
  console.error('\n❌ Usage: node generate-lesson-images.js <lesson_number>');
  console.error('   Example: node generate-lesson-images.js 263\n');
  process.exit(1);
}

generateLessonImages(lessonNumber).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
