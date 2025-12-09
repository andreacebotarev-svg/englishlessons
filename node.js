js
// scripts/generate-lesson-images.js

const fs = require('fs');
const https = require('https');
const path = require('path');

const PEXELS_API_KEY = 'gYenClsQ9b655KaiMxlhjgR9yx8ZOqU5BsCzyWe0eTSFWCWlFt3XFqgF';

async function fetchImage(keyword) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(keyword)}&per_page=1`,
      headers: { 'Authorization': PEXELS_API_KEY }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.photos && json.photos[0]) {
          resolve(json.photos[0].src.medium); // URL картинки
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function generateLessonImages(lessonNumber) {
  // 1. Читаем JSON урока
  const jsonPath = path.join(__dirname, `../data/${lessonNumber}.json`);
  const lesson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // 2. Создаем папку для картинок
  const imagesDir = path.join(__dirname, `../images/${lessonNumber}`);
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 3. Обрабатываем каждое слово
  const words = lesson.content.vocabulary.words;
  
  for (const word of words) {
    const keyword = word.en;
    const filename = `${keyword.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    const filepath = path.join(imagesDir, filename);

    // Пропускаем, если файл уже существует
    if (fs.existsSync(filepath)) {
      console.log(`✓ Exists: ${filename}`);
      continue;
    }

    try {
      console.log(`Fetching: ${keyword}...`);
      const imageUrl = await fetchImage(keyword);
      
      if (imageUrl) {
        await downloadImage(imageUrl, filepath);
        console.log(`✓ Downloaded: ${filename}`);
        
        // Обновляем JSON с путем к картинке
        word.image = `${lessonNumber}/${filename}`;
      } else {
        console.log(`✗ Not found: ${keyword}`);
      }

      // Задержка, чтобы не превысить rate limit (200/час = ~2 сек)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.error(`Error for ${keyword}:`, err.message);
    }
  }

  // 4. Сохраняем обновленный JSON
  fs.writeFileSync(jsonPath, JSON.stringify(lesson, null, 2));
  console.log(`\n✅ Lesson ${lessonNumber} images generated!`);
}

// Использование: node scripts/generate-lesson-images.js 263
const lessonNumber = process.argv[2];
if (!lessonNumber) {
  console.error('Usage: node generate-lesson-images.js <lesson_number>');
  process.exit(1);
}

generateLessonImages(lessonNumber);
