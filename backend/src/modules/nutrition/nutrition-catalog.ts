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

// Data sourced from 中国食物成分表标准版第六版(2018) and USDA FoodData Central
export const FOOD_CATALOG: FoodCatalogItem[] = [
  // ── 主食 ──────────────────────────────────────────────────────────────────
  {
    id: "oats",
    name: "燕麦片",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6 },
    micronutrients: { calcium: 54, iron: 4.7, magnesium: 177, potassium: 429, zinc: 4.0 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "cup", label: "杯(80g)", metricAmount: 80 },
      { key: "tbsp", label: "汤匙", metricAmount: 12 },
    ],
    defaultUnit: "g",
  },
  {
    id: "rice",
    name: "熟米饭",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3 },
    micronutrients: { potassium: 29, sodium: 1, magnesium: 10 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(200g)", metricAmount: 200 },
      { key: "small-bowl", label: "小碗(150g)", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "brown-rice",
    name: "糙米饭",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 123, protein: 2.7, fat: 1.0, carbs: 25.6, fiber: 1.8 },
    micronutrients: { potassium: 79, magnesium: 44, phosphorus: 83, zinc: 0.6 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(200g)", metricAmount: 200 },
    ],
    defaultUnit: "g",
  },
  {
    id: "whole-wheat-bread",
    name: "全麦面包",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 247, protein: 13.0, fat: 3.4, carbs: 41.3, fiber: 7.4 },
    micronutrients: { calcium: 30, iron: 3.6, potassium: 230, magnesium: 76 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "slice", label: "片(35g)", metricAmount: 35 },
    ],
    defaultUnit: "slice",
  },
  {
    id: "noodles",
    name: "煮面条",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 138, protein: 5.0, fat: 0.6, carbs: 28.0, fiber: 1.0 },
    micronutrients: { sodium: 94, potassium: 44, iron: 1.0 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(250g)", metricAmount: 250 },
    ],
    defaultUnit: "g",
  },
  {
    id: "sweet-potato",
    name: "蒸红薯",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 90, protein: 1.6, fat: 0.1, carbs: 21.3, fiber: 1.6 },
    micronutrients: { potassium: 337, vitaminC: 19, calcium: 30, magnesium: 23 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "medium", label: "个(130g)", metricAmount: 130 },
    ],
    defaultUnit: "g",
  },
  {
    id: "potato",
    name: "蒸土豆",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 87, protein: 2.0, fat: 0.1, carbs: 20.1, fiber: 1.8 },
    micronutrients: { potassium: 421, vitaminC: 11, magnesium: 23, iron: 0.6 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "medium", label: "个(150g)", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "corn",
    name: "甜玉米",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 108, protein: 3.4, fat: 1.3, carbs: 23.5, fiber: 2.3 },
    micronutrients: { potassium: 270, magnesium: 37, vitaminC: 7, iron: 0.5 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "ear", label: "根(200g)", metricAmount: 200 },
    ],
    defaultUnit: "g",
  },
  {
    id: "steamed-bun",
    name: "馒头",
    category: "主食",
    measureBase: "g",
    nutritionPer100: { calories: 221, protein: 7.8, fat: 0.9, carbs: 45.6, fiber: 1.3 },
    micronutrients: { iron: 1.8, potassium: 115, sodium: 165 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(80g)", metricAmount: 80 },
    ],
    defaultUnit: "piece",
  },

  // ── 蛋白质 ────────────────────────────────────────────────────────────────
  {
    id: "egg",
    name: "鸡蛋",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 144, protein: 12.6, fat: 9.9, carbs: 1.1, fiber: 0 },
    micronutrients: { calcium: 56, iron: 1.8, potassium: 138, sodium: 140, zinc: 1.1 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(50g)", metricAmount: 50 },
      { key: "large", label: "大个(60g)", metricAmount: 60 },
    ],
    defaultUnit: "piece",
  },
  {
    id: "chicken-breast",
    name: "鸡胸肉",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 118, protein: 24.6, fat: 1.9, carbs: 0, fiber: 0 },
    micronutrients: { iron: 0.7, potassium: 256, sodium: 70, zinc: 0.9, phosphorus: 200 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(120g)", metricAmount: 120 },
      { key: "small", label: "小份(80g)", metricAmount: 80 },
    ],
    defaultUnit: "g",
  },
  {
    id: "chicken-thigh",
    name: "鸡腿肉（去皮）",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 181, protein: 18.9, fat: 11.1, carbs: 0, fiber: 0 },
    micronutrients: { iron: 1.0, potassium: 220, sodium: 85, zinc: 2.0 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "beef-shank",
    name: "牛腱子（熟）",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 165, protein: 30.7, fat: 4.2, carbs: 0, fiber: 0 },
    micronutrients: { iron: 2.4, zinc: 4.5, potassium: 317, sodium: 52 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "pork-tenderloin",
    name: "猪里脊",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 143, protein: 20.7, fat: 6.2, carbs: 0, fiber: 0 },
    micronutrients: { iron: 1.5, zinc: 2.4, potassium: 310, sodium: 57 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "salmon",
    name: "三文鱼",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 208, protein: 20.4, fat: 13.4, carbs: 0, fiber: 0 },
    micronutrients: { potassium: 384, sodium: 59, calcium: 9, iron: 0.3 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(130g)", metricAmount: 130 },
    ],
    defaultUnit: "g",
  },
  {
    id: "shrimp",
    name: "白虾（鲜）",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 93, protein: 17.7, fat: 1.4, carbs: 0.9, fiber: 0 },
    micronutrients: { calcium: 62, potassium: 215, sodium: 119, zinc: 1.1 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "canned-tuna",
    name: "金枪鱼罐头（水浸）",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 116, protein: 25.5, fat: 0.9, carbs: 0, fiber: 0 },
    micronutrients: { potassium: 282, sodium: 320, iron: 1.0 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "can", label: "罐(185g)", metricAmount: 185 },
    ],
    defaultUnit: "g",
  },
  {
    id: "basa",
    name: "巴沙鱼",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 97, protein: 18.9, fat: 2.7, carbs: 0, fiber: 0 },
    micronutrients: { potassium: 310, sodium: 73, calcium: 14 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "portion", label: "份(120g)", metricAmount: 120 },
    ],
    defaultUnit: "g",
  },
  {
    id: "egg-white",
    name: "蛋清",
    category: "蛋白质",
    measureBase: "g",
    nutritionPer100: { calories: 52, protein: 10.9, fat: 0.2, carbs: 0.7, fiber: 0 },
    micronutrients: { potassium: 163, sodium: 170, calcium: 6 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(30g)", metricAmount: 30 },
    ],
    defaultUnit: "piece",
  },

  // ── 蔬菜 ──────────────────────────────────────────────────────────────────
  {
    id: "broccoli",
    name: "西兰花",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6 },
    micronutrients: { calcium: 47, iron: 0.7, magnesium: 21, potassium: 316, vitaminC: 89 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(150g)", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "spinach",
    name: "菠菜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 1.7 },
    micronutrients: { calcium: 99, iron: 2.7, magnesium: 79, potassium: 558, vitaminC: 28 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "cucumber",
    name: "黄瓜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 16, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.6 },
    micronutrients: { potassium: 147, vitaminC: 2.8, calcium: 16, magnesium: 13 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "根(200g)", metricAmount: 200 },
    ],
    defaultUnit: "g",
  },
  {
    id: "tomato",
    name: "番茄",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
    micronutrients: { potassium: 237, vitaminC: 14, calcium: 10, magnesium: 11 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(150g)", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "carrot",
    name: "胡萝卜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, fiber: 2.8 },
    micronutrients: { potassium: 320, vitaminC: 6, calcium: 33, magnesium: 12 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "根(120g)", metricAmount: 120 },
    ],
    defaultUnit: "g",
  },
  {
    id: "cabbage",
    name: "白菜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 17, protein: 1.5, fat: 0.2, carbs: 3.2, fiber: 0.8 },
    micronutrients: { potassium: 130, vitaminC: 31, calcium: 50, magnesium: 11 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(150g)", metricAmount: 150 },
    ],
    defaultUnit: "g",
  },
  {
    id: "lettuce",
    name: "生菜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.1, fiber: 1.3 },
    micronutrients: { potassium: 247, vitaminC: 9, calcium: 33, iron: 0.7 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(120g)", metricAmount: 120 },
    ],
    defaultUnit: "g",
  },
  {
    id: "celery",
    name: "芹菜",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 16, protein: 0.7, fat: 0.1, carbs: 3.5, fiber: 1.4 },
    micronutrients: { potassium: 260, calcium: 40, vitaminC: 8, magnesium: 11 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "stalk", label: "棵(80g)", metricAmount: 80 },
    ],
    defaultUnit: "g",
  },
  {
    id: "green-pepper",
    name: "青椒",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 27, protein: 1.0, fat: 0.2, carbs: 6.1, fiber: 2.1 },
    micronutrients: { potassium: 175, vitaminC: 62, calcium: 11, iron: 0.5 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "onion",
    name: "洋葱",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7 },
    micronutrients: { potassium: 146, vitaminC: 7, calcium: 23, magnesium: 10 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "half", label: "半个(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "mushroom",
    name: "香菇（鲜）",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 34, protein: 2.2, fat: 0.5, carbs: 6.8, fiber: 3.0 },
    micronutrients: { potassium: 304, iron: 0.4, calcium: 2, zinc: 0.7 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "朵(20g)", metricAmount: 20 },
      { key: "bowl", label: "碗(80g)", metricAmount: 80 },
    ],
    defaultUnit: "g",
  },
  {
    id: "eggplant",
    name: "茄子",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 25, protein: 1.1, fat: 0.2, carbs: 5.9, fiber: 1.3 },
    micronutrients: { potassium: 229, vitaminC: 5, calcium: 22, magnesium: 13 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(250g)", metricAmount: 250 },
    ],
    defaultUnit: "g",
  },
  {
    id: "bean-sprouts",
    name: "黄豆芽",
    category: "蔬菜",
    measureBase: "g",
    nutritionPer100: { calories: 44, protein: 4.5, fat: 1.6, carbs: 4.5, fiber: 1.5 },
    micronutrients: { potassium: 160, calcium: 21, iron: 0.9, vitaminC: 8 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },

  // ── 水果 ──────────────────────────────────────────────────────────────────
  {
    id: "apple",
    name: "苹果",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, fiber: 2.4 },
    micronutrients: { potassium: 107, vitaminC: 5, calcium: 6, magnesium: 5 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "medium", label: "中个(180g)", metricAmount: 180 },
      { key: "small", label: "小个(120g)", metricAmount: 120 },
    ],
    defaultUnit: "medium",
  },
  {
    id: "banana",
    name: "香蕉",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, fiber: 2.6 },
    micronutrients: { potassium: 358, vitaminC: 9, magnesium: 27, calcium: 5 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "根(120g)", metricAmount: 120 },
    ],
    defaultUnit: "piece",
  },
  {
    id: "orange",
    name: "橙子",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, fiber: 2.4 },
    micronutrients: { potassium: 181, vitaminC: 53, calcium: 40, magnesium: 10 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(200g)", metricAmount: 200 },
    ],
    defaultUnit: "piece",
  },
  {
    id: "strawberry",
    name: "草莓",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, fiber: 2.0 },
    micronutrients: { potassium: 153, vitaminC: 59, calcium: 16, magnesium: 13 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(150g)", metricAmount: 150 },
      { key: "piece", label: "个(15g)", metricAmount: 15 },
    ],
    defaultUnit: "g",
  },
  {
    id: "blueberry",
    name: "蓝莓",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, fiber: 2.4 },
    micronutrients: { potassium: 77, vitaminC: 10, calcium: 6, magnesium: 6 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "cup", label: "杯(148g)", metricAmount: 148 },
    ],
    defaultUnit: "g",
  },
  {
    id: "watermelon",
    name: "西瓜",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 30, protein: 0.6, fat: 0.2, carbs: 7.6, fiber: 0.4 },
    micronutrients: { potassium: 112, vitaminC: 8, magnesium: 10, calcium: 7 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "slice", label: "片(300g)", metricAmount: 300 },
      { key: "bowl", label: "碗(200g)", metricAmount: 200 },
    ],
    defaultUnit: "g",
  },
  {
    id: "kiwi",
    name: "猕猴桃",
    category: "水果",
    measureBase: "g",
    nutritionPer100: { calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7, fiber: 3.0 },
    micronutrients: { potassium: 312, vitaminC: 93, calcium: 34, magnesium: 17 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(100g)", metricAmount: 100 },
    ],
    defaultUnit: "piece",
  },

  // ── 乳制品 ────────────────────────────────────────────────────────────────
  {
    id: "milk",
    name: "低脂牛奶",
    category: "乳制品",
    measureBase: "ml",
    nutritionPer100: { calories: 46, protein: 3.4, fat: 1.5, carbs: 4.8, fiber: 0 },
    micronutrients: { calcium: 120, potassium: 150, sodium: 50 },
    unitOptions: [
      { key: "ml", label: "毫升", metricAmount: 1 },
      { key: "cup", label: "杯(250ml)", metricAmount: 250 },
      { key: "box", label: "盒(250ml)", metricAmount: 250 },
    ],
    defaultUnit: "ml",
  },
  {
    id: "greek-yogurt",
    name: "希腊酸奶（0%脂肪）",
    category: "乳制品",
    measureBase: "g",
    nutritionPer100: { calories: 59, protein: 10.2, fat: 0.4, carbs: 3.6, fiber: 0 },
    micronutrients: { calcium: 110, potassium: 141, sodium: 36 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "cup", label: "杯(170g)", metricAmount: 170 },
    ],
    defaultUnit: "g",
  },
  {
    id: "yogurt",
    name: "原味酸奶",
    category: "乳制品",
    measureBase: "g",
    nutritionPer100: { calories: 61, protein: 3.5, fat: 3.3, carbs: 4.7, fiber: 0 },
    micronutrients: { calcium: 121, potassium: 141, sodium: 46 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "cup", label: "杯(200g)", metricAmount: 200 },
      { key: "box", label: "盒(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },

  // ── 豆制品 ────────────────────────────────────────────────────────────────
  {
    id: "tofu-soft",
    name: "嫩豆腐",
    category: "豆制品",
    measureBase: "g",
    nutritionPer100: { calories: 73, protein: 8.1, fat: 3.7, carbs: 1.9, fiber: 0.4 },
    micronutrients: { calcium: 163, iron: 1.4, magnesium: 27, potassium: 121 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "block", label: "盒(350g)", metricAmount: 350 },
      { key: "half", label: "半盒(175g)", metricAmount: 175 },
    ],
    defaultUnit: "g",
  },
  {
    id: "tofu-firm",
    name: "北豆腐",
    category: "豆制品",
    measureBase: "g",
    nutritionPer100: { calories: 116, protein: 12.2, fat: 6.7, carbs: 2.8, fiber: 0.4 },
    micronutrients: { calcium: 138, iron: 2.5, magnesium: 63, potassium: 106 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "block", label: "块(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },
  {
    id: "soy-milk",
    name: "豆浆（无糖）",
    category: "豆制品",
    measureBase: "ml",
    nutritionPer100: { calories: 31, protein: 3.0, fat: 1.8, carbs: 1.8, fiber: 0 },
    micronutrients: { calcium: 25, potassium: 120, iron: 0.6 },
    unitOptions: [
      { key: "ml", label: "毫升", metricAmount: 1 },
      { key: "cup", label: "杯(250ml)", metricAmount: 250 },
    ],
    defaultUnit: "ml",
  },
  {
    id: "edamame",
    name: "毛豆",
    category: "豆制品",
    measureBase: "g",
    nutritionPer100: { calories: 122, protein: 11.0, fat: 5.2, carbs: 8.9, fiber: 5.2 },
    micronutrients: { potassium: 436, calcium: 63, iron: 2.3, magnesium: 64, vitaminC: 9 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "bowl", label: "碗(100g)", metricAmount: 100 },
    ],
    defaultUnit: "g",
  },

  // ── 坚果 ──────────────────────────────────────────────────────────────────
  {
    id: "walnut",
    name: "核桃",
    category: "坚果",
    measureBase: "g",
    nutritionPer100: { calories: 654, protein: 15.2, fat: 65.2, carbs: 13.7, fiber: 6.7 },
    micronutrients: { magnesium: 158, potassium: 441, calcium: 98, iron: 2.9, zinc: 3.1 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "piece", label: "个(10g)", metricAmount: 10 },
    ],
    defaultUnit: "g",
  },
  {
    id: "almond",
    name: "杏仁",
    category: "坚果",
    measureBase: "g",
    nutritionPer100: { calories: 579, protein: 21.2, fat: 49.9, carbs: 21.6, fiber: 12.5 },
    micronutrients: { magnesium: 270, calcium: 264, iron: 3.7, potassium: 733, zinc: 3.1 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "handful", label: "小把(25g)", metricAmount: 25 },
      { key: "piece", label: "粒(1.2g)", metricAmount: 1.2 },
    ],
    defaultUnit: "g",
  },
  {
    id: "peanut",
    name: "花生（生）",
    category: "坚果",
    measureBase: "g",
    nutritionPer100: { calories: 567, protein: 25.8, fat: 49.2, carbs: 16.1, fiber: 8.5 },
    micronutrients: { magnesium: 168, potassium: 705, calcium: 92, iron: 4.6, zinc: 3.3 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "handful", label: "小把(25g)", metricAmount: 25 },
    ],
    defaultUnit: "g",
  },

  // ── 功能性 ────────────────────────────────────────────────────────────────
  {
    id: "whey-protein",
    name: "乳清蛋白粉",
    category: "功能性",
    measureBase: "g",
    nutritionPer100: { calories: 359, protein: 74.2, fat: 4.0, carbs: 11.4, fiber: 0 },
    micronutrients: { calcium: 600, potassium: 450, sodium: 250 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "scoop", label: "勺(30g)", metricAmount: 30 },
    ],
    defaultUnit: "scoop",
  },
  {
    id: "peanut-butter",
    name: "花生酱（天然）",
    category: "功能性",
    measureBase: "g",
    nutritionPer100: { calories: 596, protein: 25.1, fat: 51.1, carbs: 21.6, fiber: 6.0 },
    micronutrients: { magnesium: 154, potassium: 558, iron: 1.9, calcium: 43 },
    unitOptions: [
      { key: "g", label: "克", metricAmount: 1 },
      { key: "tbsp", label: "汤匙(16g)", metricAmount: 16 },
    ],
    defaultUnit: "tbsp",
  },
  {
    id: "olive-oil",
    name: "橄榄油",
    category: "功能性",
    measureBase: "ml",
    nutritionPer100: { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
    micronutrients: { vitaminE: 14 },
    unitOptions: [
      { key: "ml", label: "毫升", metricAmount: 1 },
      { key: "tbsp", label: "汤匙(14ml)", metricAmount: 14 },
    ],
    defaultUnit: "tbsp",
  },
];

export function getFoodById(foodId: string): FoodCatalogItem | undefined {
  return FOOD_CATALOG.find((item) => item.id === foodId);
}

export function getFoodUnit(food: FoodCatalogItem, unitKey: string): FoodUnitOption | undefined {
  return food.unitOptions.find((item) => item.key === unitKey);
}
