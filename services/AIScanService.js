import * as FileSystem from 'expo-file-system';

const filipinoDishes = [
  { name: 'Sinigang na Baboy', icon: '🍲', calories: 320, protein: 22, carbs: 18, fat: 14, iron: 3.2, vitA: 120, zinc: 2.1 },
  { name: 'Adobong Manok', icon: '🍗', calories: 510, protein: 35, carbs: 12, fat: 28, iron: 2.8, vitA: 80, zinc: 3.4 },
  { name: 'Tinolang Manok', icon: '🍜', calories: 280, protein: 28, carbs: 10, fat: 9, iron: 2.1, vitA: 310, zinc: 2.8 },
  { name: 'Kare-Kare', icon: '🥜', calories: 480, protein: 30, carbs: 22, fat: 26, iron: 3.8, vitA: 95, zinc: 4.1 },
  { name: 'Lechon Kawali', icon: '🥩', calories: 620, protein: 38, carbs: 8, fat: 48, iron: 2.4, vitA: 40, zinc: 5.2 },
  { name: 'Pinakbet', icon: '🥦', calories: 180, protein: 8, carbs: 20, fat: 8, iron: 2.9, vitA: 420, zinc: 1.8 },
  { name: 'Bistek Tagalog', icon: '🥩', calories: 390, protein: 32, carbs: 14, fat: 22, iron: 4.1, vitA: 60, zinc: 4.8 },
  { name: 'Nilaga', icon: '🍖', calories: 310, protein: 26, carbs: 16, fat: 15, iron: 3.0, vitA: 180, zinc: 3.2 },
  { name: 'Pork Sisig', icon: '🍳', calories: 520, protein: 34, carbs: 6, fat: 38, iron: 2.6, vitA: 35, zinc: 4.5 },
  { name: 'Bangus Sardines', icon: '🐟', calories: 240, protein: 24, carbs: 4, fat: 14, iron: 1.8, vitA: 95, zinc: 1.9 },
  { name: 'Caldereta', icon: '🍲', calories: 450, protein: 32, carbs: 18, fat: 28, iron: 3.5, vitA: 150, zinc: 3.8 },
  { name: 'Pancit Canton', icon: '🍜', calories: 350, protein: 12, carbs: 45, fat: 12, iron: 2.1, vitA: 60, zinc: 1.8 },
  { name: 'Afritada', icon: '🍲', calories: 380, protein: 28, carbs: 20, fat: 18, iron: 2.9, vitA: 180, zinc: 3.1 },
  { name: 'Lumpia', icon: '🥢', calories: 180, protein: 8, carbs: 20, fat: 8, iron: 1.5, vitA: 80, zinc: 1.2 },
  { name: 'Mechado', icon: '🥘', calories: 420, protein: 30, carbs: 16, fat: 24, iron: 3.2, vitA: 110, zinc: 3.6 },
];

const getIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('sinigang') || lower.includes('nilaga') || lower.includes('kare')) return '🍲';
  if (lower.includes('manok') || lower.includes('chicken')) return '🍗';
  if (lower.includes('baboy') || lower.includes('lechon') || lower.includes('sisig')) return '🥩';
  if (lower.includes('bangus') || lower.includes('fish') || lower.includes('isda')) return '🐟';
  if (lower.includes('pancit') || lower.includes('noodle')) return '🍜';
  if (lower.includes('rice') || lower.includes('kanin')) return '🍚';
  if (lower.includes('pinakbet') || lower.includes('vegetable')) return '🥦';
  if (lower.includes('lumpia')) return '🥢';
  return '🍽️';
};

const getFallback = () => {
  const dish = filipinoDishes[Math.floor(Math.random() * filipinoDishes.length)];
  return { ...dish, confidence: 72, detectedLabels: ['food', 'filipino dish', 'meal'] };
};

const analyzeFoodWithOpenAI = async (imageUri) => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: 'Analyze this food image. Identify the dish (preferably Filipino dishes) and provide nutritional estimates per single serving. Respond ONLY with a valid JSON object, no markdown, no extra text:\n{"name":"dish name","confidence":85,"calories":350,"protein":25,"carbs":30,"fat":15,"iron":2.5,"vitA":120,"zinc":2.1}',
            },
          ],
        },
      ],
    }),
  });

  if (!apiResponse.ok) {
    throw new Error(`API ${apiResponse.status}`);
  }

  const data = await apiResponse.json();
  const text = data.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(text);

  return {
    name: parsed.name || 'Unknown Dish',
    icon: getIcon(parsed.name),
    calories: Math.round(Number(parsed.calories) || 300),
    protein: Math.round(Number(parsed.protein) || 20),
    carbs: Math.round(Number(parsed.carbs) || 30),
    fat: Math.round(Number(parsed.fat) || 12),
    iron: Math.round(Number(parsed.iron) * 10) / 10 || 2.0,
    vitA: Math.round(Number(parsed.vitA)) || 100,
    zinc: Math.round(Number(parsed.zinc) * 10) / 10 || 2.0,
    confidence: Math.min(Math.max(Number(parsed.confidence) || 80, 60), 98),
    detectedLabels: ['food', 'meal'],
  };
};

const analyzeFoodWithGoogleVision = async (imageUri) => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
  if (!apiKey || apiKey === 'your_google_vision_api_key_here') {
    throw new Error('Google Vision API key not configured');
  }

  const apiResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64,
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          ],
        },
      ],
    }),
  });

  if (!apiResponse.ok) {
    throw new Error(`Google Vision API ${apiResponse.status}`);
  }

  const data = await apiResponse.json();
  const labels = data.responses[0].labelAnnotations.map(label => label.description).join(', ');
  
  const dish = filipinoDishes.find(d => 
    labels.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
  ) || filipinoDishes[Math.floor(Math.random() * filipinoDishes.length)];

  return {
    ...dish,
    confidence: 75,
    detectedLabels: labels.split(', '),
  };
};

export const analyzeFoodImage = async (imageUri) => {
  if (!imageUri) return getFallback();
  try {
    const result = await analyzeFoodWithOpenAI(imageUri);
    if (result.confidence < 80) {
      return await analyzeFoodWithGoogleVision(imageUri);
    }
    return result;
  } catch (error) {
    console.warn('AI scan fallback:', error.message);
    return getFallback();
  }
};