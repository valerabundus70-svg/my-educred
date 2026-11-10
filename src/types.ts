export type AchievementType = 'certificate' | 'badge' | 'diploma' | 'course' | 'award';

export type BadgeTier = 'gold' | 'silver' | 'bronze' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  type: AchievementType;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  score?: string; // e.g. "98%", "З відзнакою", "C1"
  description: string;
  imageUrl?: string; // Image or preview URL
  fileUrl?: string; // Any uploaded file (PDF, DOCX, ZIP, etc.)
  fileName?: string; // Original uploaded file name
  fileSize?: string; // e.g. "2.4 MB"
  fileFormat?: string; // 'pdf' | 'image' | 'doc' | 'other'
  badgeTier?: BadgeTier;
  learningHours?: number;
  isVerified?: boolean;
  featured?: boolean;
}

export type SortOption = 'date-desc' | 'date-asc' | 'title' | 'hours';
export type ViewMode = 'grid' | 'badges' | 'timeline';

export interface AdminConfig {
  isAdmin: boolean;
  passcode: string;
  ownerEmail: string;
}
