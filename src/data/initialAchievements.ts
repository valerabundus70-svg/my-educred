import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    "id": "ach-khnuia-cyber-diploma",
    "title": "Диплом бакалавра з кібербезпеки та захисту інформації",
    "type": "diploma",
    "issuer": "Харківський національний університет внутрішніх справ · Факультет №4 (Кіберполіція)",
    "issueDate": "2024-06-25",
    "credentialId": "ХН-КБ-2024-0492",
    "learningHours": 720,
    "score": "Відмінно (95/100)",
    "skills": [
      "Аналіз вразливостей",
      "Мережева криміналістика",
      "Реагування на інциденти",
      "OSINT",
      "Linux Security"
    ],
    "description": "Комплексна підготовка фахівця з протидії кіберзлочинності, розслідування кіберінцидентів та захисту критичної інфраструктури.",
    "imageUrl": "/assets/images/cert_hero_learning_1794149557969.jpg",
    "fileUrl": "/assets/images/cert_hero_learning_1794149557969.jpg",
    "fileFormat": "image",
    "isVerified": true,
    "featured": true
  },
  {
    "id": "ach-cisco-cyberops-cert",
    "title": "Cisco Certified CyberOps Associate",
    "type": "certificate",
    "issuer": "Cisco Networking Academy",
    "issueDate": "2024-03-14",
    "credentialId": "CSCO-2024-771892",
    "credentialUrl": "https://www.credly.com",
    "learningHours": 120,
    "score": "96%",
    "skills": [
      "SOC Operations",
      "Wireshark",
      "SIEM / Splunk",
      "Packet Analysis",
      "Threat Hunting"
    ],
    "description": "Міжнародна сертифікація оператора центру моніторингу безпеки (Security Operations Center).",
    "imageUrl": "/assets/images/cert_sample_preview_1794149560004.jpg",
    "fileUrl": "/assets/images/cert_sample_preview_1794149560004.jpg",
    "fileFormat": "image",
    "isVerified": true,
    "featured": true
  },
  {
    "id": "ach-badge-gold-investigator",
    "title": "Cyber Investigator Mastery Badge",
    "type": "badge",
    "badgeTier": "gold",
    "issuer": "Департамент кіберполіції НПУ",
    "issueDate": "2024-05-18",
    "credentialId": "CP-BADGE-GOLD-088",
    "learningHours": 60,
    "skills": [
      "Цифрова криміналістика",
      "Reverse Engineering",
      "OSINT-розслідування",
      "Chain of Custody"
    ],
    "description": "Золота відзнака за результативність у практичних навчаннях із розкриття мережевих фішингових схем.",
    "imageUrl": "/assets/images/badge_mastery_gold_1794149557866.jpg",
    "fileUrl": "/assets/images/badge_mastery_gold_1794149557866.jpg",
    "fileFormat": "image",
    "isVerified": true,
    "featured": false
  },
  {
    "id": "ach-badge-architect",
    "title": "Security Architecture Specialist",
    "type": "badge",
    "badgeTier": "silver",
    "issuer": "ХНУВС Кіберцентр",
    "issueDate": "2024-01-20",
    "learningHours": 45,
    "skills": [
      "Firewall Configuration",
      "IDS/IPS",
      "Cryptography",
      "Secure Architecture"
    ],
    "description": "Срібний бейдж за побудову захищеного сегмента корпоративної мережі під час воркшопу.",
    "imageUrl": "/assets/images/badge_code_architect_1794149558466.jpg",
    "fileUrl": "/assets/images/badge_code_architect_1794149558466.jpg",
    "fileFormat": "image",
    "isVerified": true,
    "featured": false
  }
];

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
