import type {
  MemoryImageItem,
  Stage2Option,
  Stage3Card,
  Stage4Question,
  Stage4StoryImage,
  Stage5Question,
} from './types';

export const STAGE1_DISPLAY_SECONDS = 6;

export const STAGE1_IMAGES: MemoryImageItem[] = [
  { id: 'apple', emoji: '🍎', label: 'سیب' },
  { id: 'house', emoji: '🏠', label: 'خانه' },
  { id: 'tulip', emoji: '🌷', label: 'گل' },
  { id: 'tea', emoji: '☕', label: 'فنجان چای' },
  { id: 'cat', emoji: '🐱', label: 'گربه' },
];

const DISTRACTOR_IMAGES: MemoryImageItem[] = [
  { id: 'bird', emoji: '🐦', label: 'پرنده' },
  { id: 'book', emoji: '📖', label: 'کتاب' },
  { id: 'clock', emoji: '⏰', label: 'ساعت' },
  { id: 'lamp', emoji: '💡', label: 'چراغ' },
  { id: 'plant', emoji: '🪴', label: 'گلدان' },
  { id: 'chair', emoji: '🪑', label: 'میز و صندلی' },
];

export const STAGE2_OPTIONS: Stage2Option[] = [
  ...STAGE1_IMAGES.map(i => ({ ...i, seenInStage1: true as const })),
  ...DISTRACTOR_IMAGES.slice(0, 3).map(i => ({ ...i, seenInStage1: false as const })),
];

export const STAGE2_CORRECT_IDS = STAGE1_IMAGES.map(i => i.id);

export const STAGE3_CARDS: Stage3Card[] = [
  { id: 'c1', beforeEmoji: '🍎', afterEmoji: '🍎', label: 'سیب', isChanged: false },
  { id: 'c2', beforeEmoji: '🏠', afterEmoji: '🏠', label: 'خانه', isChanged: false },
  { id: 'c3', beforeEmoji: '🌷', afterEmoji: '🌹', label: 'گل', isChanged: true },
  { id: 'c4', beforeEmoji: '☕', afterEmoji: '☕', label: 'چای', isChanged: false },
  { id: 'c5', beforeEmoji: '🐱', afterEmoji: '🐱', label: 'گربه', isChanged: false },
  { id: 'c6', beforeEmoji: '📖', afterEmoji: '📖', label: 'کتاب', isChanged: false },
];

export const STAGE3_CORRECT_CARD_ID = STAGE3_CARDS.find(c => c.isChanged)!.id;

export const STAGE4_STORY: { paragraphs: string[]; images: Stage4StoryImage[] } = {
  paragraphs: [
    'صبح زود، خانم فاطمه از خواب بیدار شد.',
    'ابتدا گلدان‌های اتاق را آب داد و بعد برای خودش یک فنجان چای درست کرد.',
    'بعد با گربه کوچک‌شان بازی کرد و به کتاب تازه‌اش نگاهی انداخت.',
  ],
  images: [
    { id: 'si1', emoji: '🌅', caption: 'صبح روشن' },
    { id: 'si2', emoji: '🪴', caption: 'آب دادن به گل‌ها' },
    { id: 'si3', emoji: '☕', caption: 'فنجان چای گرم' },
    { id: 'si4', emoji: '🐱', caption: 'بازی با گربه' },
  ],
};

export const STAGE4_QUESTIONS: Stage4Question[] = [
  {
    id: 'q4-1',
    question: 'خانم فاطمه اول کار چه کاری انجام داد؟',
    options: [
      { id: 'o1', text: 'گل‌ها را آب داد', correct: true },
      { id: 'o2', text: 'چای نوشید', correct: false },
      { id: 'o3', text: 'با گربه بازی کرد', correct: false },
    ],
  },
  {
    id: 'q4-2',
    question: 'خانم فاطمه چه نوشیدنی‌ای درست کرد؟',
    options: [
      { id: 'o1', text: 'آب میوه', correct: false },
      { id: 'o2', text: 'چای', correct: true },
      { id: 'o3', text: 'شیر', correct: false },
    ],
  },
  {
    id: 'q4-3',
    question: 'با چه حیوانی بازی کرد؟',
    options: [
      { id: 'o1', text: 'پرنده', correct: false },
      { id: 'o2', text: 'سگ', correct: false },
      { id: 'o3', text: 'گربه', correct: true },
    ],
  },
];

export const STAGE5_QUESTIONS: Stage5Question[] = [
  {
    id: 'q5-1',
    kind: 'recognize',
    prompt: 'کدام یکی از این‌ها را در مرحله اول دیده بودیم؟',
    options: [
      { id: 'a', label: 'گل 🌷', correct: true, emoji: '🌷' },
      { id: 'b', label: 'ماهی 🐟', correct: false, emoji: '🐟' },
      { id: 'c', label: 'پیتزا 🍕', correct: false, emoji: '🍕' },
    ],
  },
  {
    id: 'q5-2',
    kind: 'spot',
    prompt: 'در مرحله تشخیص تغییر، کدام تصویر عوض شده بود؟',
    options: [
      { id: 'a', label: 'سیب 🍎', correct: false, emoji: '🍎' },
      { id: 'b', label: 'گل 🌹', correct: true, emoji: '🌹' },
      { id: 'c', label: 'کتاب 📖', correct: false, emoji: '📖' },
    ],
  },
  {
    id: 'q5-3',
    kind: 'recall',
    prompt: 'در داستان، خانم فاطمه بعد از چای، با چه کسی بازی کرد؟',
    options: [
      { id: 'a', label: 'با پرنده', correct: false },
      { id: 'b', label: 'با گربه', correct: true },
      { id: 'c', label: 'با کودک همسایه', correct: false },
    ],
  },
];

export const TOTAL_STAGES = 5;
