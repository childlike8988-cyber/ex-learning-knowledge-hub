export type ExerciseLevel = { id: "level-1" | "level-2" | "level-3"; name: string; positioning: string; items: readonly string[] };
export type ExerciseMovement = { title: string; cue: string; mistake: string };
export type WeeklyExercise = { title: string; description: string };
export type EmotionalPractice = { title: string; description: string };
export type BreakfastSection = { title: string; items: readonly string[] };

export const lifeAssetPaths = {
  homeExercise: "/assets/life-management/yuni-home-exercise-breakdown.png",
  weeklyExercise: "/assets/life-management/yuni-weekly-exercise-options.png",
  breakfast: "/images/health-breakfast-management.png",
} as const;

export const exerciseLevels: readonly ExerciseLevel[] = [
  { id: "level-1", name: "Level 1｜基礎維持", positioning: "維持體態・輕量", items: ["四項居家動作各 50 下", "每天或每兩天一次", "每次約 8～15 分鐘", "可追加快走或伸展"] },
  { id: "level-2", name: "Level 2｜穩定進階", positioning: "適度減重・中量", items: ["四項居家動作各 100 下", "每週累積 150 分鐘中等強度有氧", "每週至少 2 天肌力訓練", "推薦游泳、快走、慢跑或單車"] },
  { id: "level-3", name: "Level 3｜強化塑形", positioning: "進階體態・高量", items: ["每週 150～300 分鐘有氧", "每週 2～4 天重量或阻力訓練", "居家循環每週 3～5 次", "每週增加一次爬山、游泳、長距離慢跑或單車"] },
];

export const homeMovements: readonly ExerciseMovement[] = [
  { title: "跨下提膝", cue: "抬膝時讓對側手肘朝膝蓋靠近，核心收緊，避免只甩動手腳。", mistake: "只用甩手甩腳，沒有穩定核心。" },
  { title: "側向提膝", cue: "膝蓋向身體側面抬起，同側手肘朝膝蓋靠近，使用側腹發力。", mistake: "身體過度側倒或聳肩。" },
  { title: "慢速深蹲", cue: "臀部向後坐，膝蓋朝腳尖方向，下蹲速度保持穩定。", mistake: "膝蓋內夾或急速下蹲。" },
  { title: "墊腳回春術", cue: "踮腳抬起腳跟，同時雙手由下向外畫圓打開，再緩慢回到起始位置。", mistake: "動作過快、腳踝失去穩定。" },
];

export const weeklyExercises: readonly WeeklyExercise[] = [
  { title: "游泳", description: "低衝擊、全身性，適合增加心肺與活動量。" },
  { title: "爬山", description: "訓練耐力與臀腿，也能轉換情緒與環境。" },
  { title: "慢跑", description: "容易累積有氧時間，依體能調整速度與距離。" },
  { title: "單車", description: "關節衝擊較低，適合戶外或室內持續訓練。" },
  { title: "重量訓練", description: "幫助維持肌肉量、力量與身體線條。" },
];

export const emotionalPractices: readonly EmotionalPractice[] = [
  { title: "睡足睡飽", description: "記錄睡眠時間與起床後精神狀態。" },
  { title: "閱讀", description: "每天閱讀 10～20 分鐘，讓注意力回到自己。" },
  { title: "聽音樂", description: "建立放鬆歌單與運動歌單，協助切換情緒。" },
  { title: "鏡子強心", description: "面對鏡子，對自己說一句支持與肯定的話。" },
];

export const breakfastSections: readonly BreakfastSection[] = [
  { title: "早餐知識", items: ["全脂與低脂牛奶", "蛋白質", "鈣", "熱量與飽足感"] },
  { title: "早餐自評", items: ["作息", "飲食偏好", "過敏與不耐", "活動量與體態目標"] },
  { title: "早餐計畫", items: ["牛奶＋營養代餐只作為其中一種選擇", "不宣稱適合所有人", "不保證減重成果"] },
];
