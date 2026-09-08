export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  chartData: BirthChart | null;
  plan: 'free' | 'pro';
  onboardingComplete: boolean;
  createdAt: string;
}

export interface BirthChart {
  lagna: { sign: string; degree: number; lord: string };
  planets: PlanetPosition[];
  moonNakshatra: string;
  mahadasha: { planet: string; start: string; end: string };
  antardasha: { planet: string; start: string; end: string };
  sadeSati: { active: boolean; phase: string };
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  nakshatra: string;
  retrograde: boolean;
}

export interface LifeEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  eventDate: string;
  category: 'career' | 'love' | 'health' | 'spiritual' | 'family' | 'finance' | 'other';
  createdAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  text: string;
  category: string;
  dateMade: string;
  status: 'pending' | 'accurate' | 'partial' | 'missed';
  outcomeUpdatedAt: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DailyReading {
  id: string;
  userId: string;
  date: string;
  content: string;
  summary: string;
}

export interface FaceReading {
  id: string;
  userId: string;
  measurements: FaceMeasurements;
  interpretation: string;
  createdAt: string;
}

export interface FaceMeasurements {
  foreheadWidth: number;
  eyeDistance: number;
  noseLength: number;
  chinWidth: number;
  faceLength: number;
  jawAngle: number;
  classifications: Record<string, string>;
}
