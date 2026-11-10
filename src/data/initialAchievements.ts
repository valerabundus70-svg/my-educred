import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [];

export const PRESET_BADGES = [
  {
    name: 'Золотий кібердетектив',
    tier: 'gold' as const,
    url: '/assets/images/badge_mastery_gold_1794149557866.jpg',
  },
  {
    name: 'Архітектор систем безпеки',
    tier: 'silver' as const,
    url: '/assets/images/badge_code_architect_1794149558466.jpg',
  },
  {
    name: 'Зразок сертифіката',
    tier: 'gold' as const,
    url: '/assets/images/cert_sample_preview_1794149560004.jpg',
  },
  {
    name: 'Навчальний диплом ХНУВС',
    tier: 'gold' as const,
    url: '/assets/images/cert_hero_learning_1794149557969.jpg',
  },
];

export const DEMO_ACHIEVEMENTS = INITIAL_ACHIEVEMENTS;
