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

export const analyzeFoodImage = async (imageUri) => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  const dish = filipinoDishes[Math.floor(Math.random() * filipinoDishes.length)];
  const confidence = Math.floor(78 + Math.random() * 17);
  return {
    ...dish,
    confidence,
    detectedLabels: ['food', 'filipino dish', 'meal'],
  };
};