export interface FoodUnitOption {
  key: string;
  label: string;
  metricAmount: number;
}

export interface FoodCatalogItem {
  id: string;
  name: string;
  category: string;
  measureBase: "g" | "ml";
  nutritionPer100: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  micronutrients: Record<string, number>;
  unitOptions: FoodUnitOption[];
  defaultUnit: string;
}

export const FOOD_CATALOG: FoodCatalogItem[] = [
  {
    id: "oats",
    name: "燕麦片",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6 },
    micronutrients: { calcium: 54, iron: 4.7, magnesium: 177, potassium: 429 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "cup", label: "杯", metricAmount: 80 },
    ],
    defaultUnit: "g",
  },
  {
    id: "egg",
    name: "鸡蛋",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 144, protein: 12.6, fat: 9.9, carbs: 1.1, fiber: 0 },
    micronutrients: { calcium: 56, iron: 1.8, potassium: 138, sodium: 140 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个", metricAmount: 50 },
    ],
    defaultUnit: "piece",
  },
  {
    id: "milk",
    name: "低脂牛奶",
    category: "乳制品",
    measureBase: "ml",
    nutritionPer100: { calories: 46, protein: 3.4, fat: 1.5, carbs: 4.8, fiber: 0 },
    micronutrients: { calcium: 120, potassium: 150, sodium: 50 },
    unitOptions: [
      { key: "ml", label: "毫升", metricAmount: 1 },
      { key: "cup", label: "杯", metricAmount: 250 },
      { key: "l", label: "升", metricAmount: 1000 },
    ],
    defaultUnit: "ml",
  },
  {
    id: "chicken-breast",
    name: "鸡胸肉",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 118, protein: 24.6, fat: 1.9, carbs: 0, fiber: 0 },
    micronutrients: { iron: 0.7, potassium: 256, sodium: 70 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份", metricAmount: 120 },
    ],
    defaultUnit: "g",
  },
  {
    id: "rice",
    name: "熟米饭",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3 },
    micronutrients: { potassium: 29, sodium: 1 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "broccoli",
    name: "西兰花",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6 },
    micronutrients: { calcium: 47, iron: 0.7, magnesium: 21, potassium: 316, vitaminC: 89 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗", metricAmount: 120 },
    ],
    defaultUnit: "g",
  },
];

export function getFoodById(foodId: string): FoodCatalogItem | undefined {
  return FOOD_CATALOG.find((item) => item.id === foodId);
}

export function getFoodUnit(food: FoodCatalogItem, unitKey: string): FoodUnitOption | undefined {
  return food.unitOptions.find((item) => item.key === unitKey);
}
