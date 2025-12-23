# Роль и задача
Ты - эксперт по извлечению структурированных данных из изображений учебных материалов. Твоя задача - проанализировать фотографию учебной страницы и преобразовать её содержимое в строго определённый JSON формат.

# Входные данные
Ты получишь фотографию страницы учебного пособия, которая может содержать:
- Текст для чтения (reading passages)
- Словарь (vocabulary) с английскими словами, транскрипцией, переводом на русский и примерами
- Фразы (phrases)
- Грамматические правила (grammar rules)
- Упражнения и вопросы (quiz questions)

# Структура выходного JSON

Создай JSON файл со следующей ТОЧНОЙ структурой:

{
  "title": "string",           // Главный заголовок урока
  "subtitle": "string",         // Подзаголовок (если есть)
  "meta": {
    "level": "string",          // Уровень: A1, A2, B1, B2, C1, C2
    "duration": number,         // Длительность в минутах
    "topic": "string"           // Тема урока
  },
  
  "content": {
    "reading": [                // Массив параграфов для чтения
      {
        "type": "paragraph",
        "text": "string"        // Полный текст параграфа
      }
    ]
  },
  
  "vocabulary": {
    "words": [                  // Массив словарных слов
      {
        "en": "string",         // Английское слово
        "transcription": "string", // Транскрипция в [квадратных скобках]
        "ru": "string",         // Русский перевод
        "example": "string",    // Пример использования на английском
        "part_of_speech": "string" // noun, verb, adjective, adverb, etc.
      }
    ],
    
    "phrases": [                // Массив фраз и выражений
      {
        "en": "string",         // Английская фраза
        "ru": "string"          // Русский перевод
      }
    ]
  },
  
  "grammar": {
    "title": "string",          // Название грамматической темы
    "explanation": "string",    // Общее объяснение
    "rules": [                  // Массив правил
      {
        "rule": "string",       // Описание правила
        "examples": ["string"]  // Примеры использования
      }
    ],
    "examples": {               // Примеры предложений
      "affirmative": ["string"],
      "negative": ["string"],
      "questions": ["string"]
    }
  },
  
  "quiz": [                     // Массив вопросов
    {
      "question": "string",     // Текст вопроса
      "options": ["string"],    // Варианты ответов (массив)
      "correct": number,        // Индекс правильного ответа (0-based)
      "correct_alt": number,    // Альтернативный правильный ответ (если есть)
      "explanation": "string"   // Объяснение правильного ответа
    }
  ]
}

# Критически важные инструкции

## 1. OCR и распознавание текста
- Извлеки ВСЕ видимые тексты с изображения
- Сохраняй орфографию и пунктуацию точно как в оригинале
- Если текст нечитаем или размыт, используй "null" вместо догадок
- Распознавай специальные символы: фонетические символы, математические знаки
- Обрабатывай многострочные элементы (таблицы, списки)

## 2. Структурирование контента
- **Reading**: Каждый абзац - отдельный объект с type: "paragraph"
- **Vocabulary words**: Обязательно включай все поля: en, transcription, ru, example, part_of_speech
- **Phrases**: Только пары en-ru без дополнительных полей
- **Grammar**: Разделяй на title, explanation, rules с примерами
- **Quiz**: Нумерация правильных ответов начинается с 0 (первый вариант = 0)

## 3. Транскрипция
- Сохраняй транскрипцию в ТОЧНОСТИ как в оригинале
- Всегда используй квадратные скобки: [ˈdaɪət]
- Не изменяй фонетические символы

## 4. Метаданные (meta)
- **level**: Определи по сложности текста (A1-C2)
- **duration**: Оцени предполагаемое время урока в минутах
- **topic**: Определи основную тему (например: "Education & Health", "Travel", "Technology")

## 5. Вопросы и тесты (quiz)
- Сохраняй формулировку вопросов без изменений
- options - массив всех вариантов ответа
- correct - индекс правильного ответа (0 = первый вариант)
- correct_alt - используй ТОЛЬКО если есть два правильных ответа
- explanation - краткое объяснение почему ответ правильный

## 6. Части речи (part_of_speech)
Используй только эти значения:
- noun (существительное)
- verb (глагол)
- adjective (прилагательное)
- adverb (наречие)
- preposition (предлог)
- conjunction (союз)
- pronoun (местоимение)

## 7. Обработка отсутствующих секций
- Если на фото НЕТ какой-то секции (например, grammar или quiz), НЕ ВКЛЮЧАЙ её в JSON
- Включай только те секции, которые фактически присутствуют на изображении
- Пустые массивы [] лучше, чем null для обязательных полей

# Валидация и проверка качества

Перед выводом результата:
1. ✅ Проверь, что JSON валидный (корректные кавычки, запятые, скобки)
2. ✅ Убедись, что все тексты извлечены полностью
3. ✅ Проверь соответствие индексов correct реальным вариантам ответов
4. ✅ Убедись, что транскрипция в квадратных скобках
5. ✅ Проверь, что part_of_speech используют только разрешённые значения

# Формат вывода

Выведи ТОЛЬКО валидный JSON без дополнительных комментариев, объяснений или markdown форматирования.
Не добавляй ```

# Пример секции (для справки)

{
  "title": "Cooking at School",
  "vocabulary": {
    "words": [
      {
        "en": "diet",
        "transcription": "[ˈdaɪət]",
        "ru": "диета, рацион питания",
        "example": "A healthy diet is important for children.",
        "part_of_speech": "noun"
      }
    ]
  }
}

Теперь проанализируй загруженное изображение и создай JSON файл.
{
  "title": "Cooking at School",
  "subtitle": "Reading about school cooking programs",
  "meta": {
    "level": "B1",
    "duration": 45,
    "topic": "Education & Health"
  },
  
  "content": {
    "reading": [
      {
        "type": "paragraph",
        "text": "According to experts, nearly 25% of Britons, including children, are overweight. The government is worried and it is looking for ways to solve the problem."
      },
      {
        "type": "paragraph",
        "text": "In the UK, 1 in 4 year olds already co cookery at school but from 2011, the government is making this compulsory. They hope that this will encourage people to cook instead of eating ready meals, fast food and snacks."
      },
      {
        "type": "paragraph",
        "text": "At secondary school students will have cooking lessons for one hour a week. Eventually they will learn to use simple, fresh ingredients and simple recipes to prepare healthy, tasty meals, for example a good tomato and pasta dish."
      },
      {
        "type": "paragraph",
        "text": "And schools are setting up cookery clubs called 'Let's Get Cooking' throughout the country. The clubs give children and parents the chance to learn to cook after school."
      },
      {
        "type": "paragraph",
        "text": "Head Teachers worry about the equipment they will need for the lessons. About 10% of schools do not have kitchens and there are not enough cookery facilities."
      },
      {
        "type": "paragraph",
        "text": "The government is promising to train 800 cookery teachers and to give schools £2.5 million a year to help children from poorer families to pay for ingredients."
      }
    ]
  },
  
  "vocabulary": {
    "words": [
      {
        "en": "diet",
        "transcription": "[ˈdaɪət]",
        "ru": "диета, рацион питания",
        "example": "A healthy diet is important for children.",
        "part_of_speech": "noun"
      },
      {
        "en": "energy",
        "transcription": "[ˈenədʒi]",
        "ru": "энергия",
        "example": "You need energy to study well.",
        "part_of_speech": "noun"
      },
      {
        "en": "lifestyle",
        "transcription": "[ˈlaɪfstaɪl]",
        "ru": "образ жизни",
        "example": "A healthy lifestyle includes exercise.",
        "part_of_speech": "noun"
      },
      {
        "en": "weight",
        "transcription": "[weɪt]",
        "ru": "вес",
        "example": "To lose weight, eat less and exercise more.",
        "part_of_speech": "noun"
      },
      {
        "en": "cheese",
        "transcription": "[tʃiːz]",
        "ru": "сыр",
        "example": "A bowl of cheese and crackers.",
        "part_of_speech": "noun"
      },
      {
        "en": "cereal",
        "transcription": "[ˈsɪəriəl]",
        "ru": "хлопья, крупа",
        "example": "I eat cereal for breakfast.",
        "part_of_speech": "noun"
      },
      {
        "en": "soup",
        "transcription": "[suːp]",
        "ru": "суп",
        "example": "Hot soup is perfect for winter.",
        "part_of_speech": "noun"
      },
      {
        "en": "lunch",
        "transcription": "[lʌntʃ]",
        "ru": "обед",
        "example": "A school lunch should be healthy.",
        "part_of_speech": "noun"
      },
      {
        "en": "ready",
        "transcription": "[ˈredi]",
        "ru": "готовый",
        "example": "Ready meals are not very healthy.",
        "part_of_speech": "adjective"
      },
      {
        "en": "packed",
        "transcription": "[pækt]",
        "ru": "упакованный",
        "example": "A packed lunch from home.",
        "part_of_speech": "adjective"
      },
      {
        "en": "lemonade",
        "transcription": "[ˌleməˈneɪd]",
        "ru": "лимонад",
        "example": "A can of lemonade is full of sugar.",
        "part_of_speech": "noun"
      },
      {
        "en": "bread",
        "transcription": "[bred]",
        "ru": "хлеб",
        "example": "Fresh bread smells delicious.",
        "part_of_speech": "noun"
      },
      {
        "en": "cola",
        "transcription": "[ˈkəʊlə]",
        "ru": "кола",
        "example": "Cola contains a lot of sugar.",
        "part_of_speech": "noun"
      },
      {
        "en": "murder",
        "transcription": "[ˈmɜːdə(r)]",
        "ru": "убийство",
        "example": "To commit a murder is a serious crime.",
        "part_of_speech": "noun"
      },
      {
        "en": "crime",
        "transcription": "[kraɪm]",
        "ru": "преступление",
        "example": "To commit a crime means breaking the law.",
        "part_of_speech": "noun"
      },
      {
        "en": "law",
        "transcription": "[lɔː]",
        "ru": "закон",
        "example": "Everyone must follow the law.",
        "part_of_speech": "noun"
      },
      {
        "en": "overweight",
        "transcription": "[ˌəʊvəˈweɪt]",
        "ru": "имеющий избыточный вес",
        "example": "25% of British children are overweight.",
        "part_of_speech": "adjective"
      },
      {
        "en": "ingredient",
        "transcription": "[ɪnˈɡriːdiənt]",
        "ru": "ингредиент",
        "example": "Use fresh ingredients for cooking.",
        "part_of_speech": "noun"
      },
      {
        "en": "recipe",
        "transcription": "[ˈresəpi]",
        "ru": "рецепт",
        "example": "Simple recipes are easy to follow.",
        "part_of_speech": "noun"
      },
      {
        "en": "equipment",
        "transcription": "[ɪˈkwɪpmənt]",
        "ru": "оборудование",
        "example": "Schools need cooking equipment.",
        "part_of_speech": "noun"
      }
    ],
    
    "phrases": [
      {
        "en": "strict parents",
        "ru": "строгие родители"
      },
      {
        "en": "easy-going parents",
        "ru": "спокойные, либеральные родители"
      },
      {
        "en": "fair parents",
        "ru": "справедливые родители"
      },
      {
        "en": "to bring up children",
        "ru": "воспитывать детей"
      },
      {
        "en": "to guide in difficult situations",
        "ru": "направлять в сложных ситуациях"
      },
      {
        "en": "to punish children",
        "ru": "наказывать детей"
      },
      {
        "en": "to control children",
        "ru": "контролировать детей"
      },
      {
        "en": "to treat all children the same way",
        "ru": "относиться ко всем детям одинаково"
      },
      {
        "en": "to make arrangements",
        "ru": "договариваться, делать договоренности"
      },
      {
        "en": "to make a mess",
        "ru": "устроить беспорядок"
      },
      {
        "en": "to make homework",
        "ru": "делать домашнюю работу"
      },
      {
        "en": "ready meals",
        "ru": "готовая еда"
      },
      {
        "en": "fast food",
        "ru": "фастфуд"
      },
      {
        "en": "cookery lessons",
        "ru": "уроки кулинарии"
      }
    ]
  },
  
  "grammar": {
    "title": "do, have or make - Verb Collocations",
    "explanation": "Some verbs are commonly used with specific nouns. These combinations are called collocations. In English, we use 'do', 'have', and 'make' in different situations.",
    "rules": [
      {
        "rule": "Use DO for:",
        "examples": [
          "homework",
          "housework",
          "the shopping",
          "exercise",
          "business"
        ]
      },
      {
        "rule": "Use HAVE for:",
        "examples": [
          "breakfast/lunch/dinner",
          "a party",
          "a good time",
          "a problem",
          "a conversation"
        ]
      },
      {
        "rule": "Use MAKE for:",
        "examples": [
          "arrangements",
          "a mess",
          "mistakes",
          "progress",
          "a decision"
        ]
      }
    ],
    "examples": {
      "affirmative": [
        "My sister and I never do/have/make any arguments.",
        "My father always does/has/makes our holiday arrangements.",
        "My brother is so lazy! He never does/has/makes any homework at all.",
        "I'm worried about Lukas – he is doing/having/making badly at school right now."
      ],
      "negative": [
        "You can use the kitchen – but please don't do/have/make a mess!",
        "I don't have to can should mustn't speak English perfectly but they must can usually be able to explain things clearly."
      ],
      "questions": [
        "You have to do/have/make your homework before you go out.",
        "My mum says I should do/have/make my bed before going to school.",
        "In Spain, people often do/have/make dinner at 9 p.m."
      ]
    }
  },
  
  "quiz": [
    {
      "question": "Choose the words a–c that can complete the phrase: 1. a healthy ___",
      "options": ["diet", "energy", "lifestyle"],
      "correct": 0,
      "correct_alt": 2,
      "explanation": "Both 'a healthy diet' and 'a healthy lifestyle' are correct collocations."
    },
    {
      "question": "2. to ___ weight",
      "options": ["put on", "lose", "get"],
      "correct": 0,
      "correct_alt": 1,
      "explanation": "Both 'put on weight' and 'lose weight' are correct."
    },
    {
      "question": "3. a bowl of ___",
      "options": ["cheese", "cereal", "soup"],
      "correct": 1,
      "correct_alt": 2,
      "explanation": "'A bowl of cereal' and 'a bowl of soup' are both correct."
    },
    {
      "question": "4. a ___ lunch",
      "options": ["school", "ready", "packed"],
      "correct": 0,
      "correct_alt": 2,
      "explanation": "'A school lunch' and 'a packed lunch' are both correct."
    },
    {
      "question": "5. a can of ___",
      "options": ["lemonade", "bread", "cola"],
      "correct": 0,
      "correct_alt": 2,
      "explanation": "'A can of lemonade' and 'a can of cola' are both correct."
    },
    {
      "question": "6. to commit ___",
      "options": ["a murder", "a crime", "a law"],
      "correct": 0,
      "correct_alt": 1,
      "explanation": "'Commit a murder' and 'commit a crime' are correct collocations."
    },
    {
      "question": "What problem is the British government trying to solve?",
      "options": [
        "The number of people in Britain is growing",
        "Many people in Britain are overweight",
        "25% of British children are overweight",
        "It does not know how to solve the problem"
      ],
      "correct": 1,
      "explanation": "The text states that nearly 25% of Britons, including children, are overweight."
    },
    {
      "question": "All pupils are going to learn to cook:",
      "options": [
        "in primary school",
        "for one hour a week for a year",
        "for two hours a week for one term",
        "using simple ingredients and recipes"
      ],
      "correct": 3,
      "explanation": "Students will learn to use simple, fresh ingredients and simple recipes."
    },
    {
      "question": "Schools are setting up clubs to:",
      "options": [
        "train cookery teachers",
        "teach children cooking skills",
        "help poorer children",
        "give practical cooking lessons"
      ],
      "correct": 3,
      "explanation": "Cookery clubs give children and parents the chance to learn to cook."
    },
    {
      "question": "One problem mentioned in the article is that:",
      "options": [
        "some schools do not know how to cook",
        "some schools do not have enough equipment",
        "students prefer fast food and snacks",
        "students forget to buy ingredients"
      ],
      "correct": 1,
      "explanation": "About 10% of schools do not have kitchens and there are not enough cookery facilities."
    },
    {
      "question": "The government is promising to:",
      "options": [
        "buy food for students",
        "build new school kitchens",
        "pay for ingredients for poorer students",
        "pay for school lunches for poorer children"
      ],
      "correct": 2,
      "explanation": "The government will give £2.5 million a year to help children from poorer families pay for ingredients."
    }
  ]
}
