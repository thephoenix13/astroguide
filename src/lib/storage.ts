import { UserProfile, LifeEvent, Prediction, ChatMessage, DailyReading, FaceReading, BirthChart } from '../types';

const KEYS = {
  USER: 'astro_guide_user',
  EVENTS: 'astro_guide_events',
  PREDICTIONS: 'astro_guide_predictions',
  CHAT: 'astro_guide_chat',
  READINGS: 'astro_guide_readings',
  FACE_READINGS: 'astro_guide_face_readings',
};

export const storage = {
  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: UserProfile) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  getEvents: (): LifeEvent[] => {
    const data = localStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },
  setEvents: (events: LifeEvent[]) => {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },
  getPredictions: (): Prediction[] => {
    const data = localStorage.getItem(KEYS.PREDICTIONS);
    return data ? JSON.parse(data) : [];
  },
  setPredictions: (predictions: Prediction[]) => {
    localStorage.setItem(KEYS.PREDICTIONS, JSON.stringify(predictions));
  },
  getChatHistory: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHAT);
    return data ? JSON.parse(data) : [];
  },
  setChatHistory: (messages: ChatMessage[]) => {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
  },
  getReadings: (): DailyReading[] => {
    const data = localStorage.getItem(KEYS.READINGS);
    return data ? JSON.parse(data) : [];
  },
  setReadings: (readings: DailyReading[]) => {
    localStorage.setItem(KEYS.READINGS, JSON.stringify(readings));
  },
  getFaceReadings: (): FaceReading[] => {
    const data = localStorage.getItem(KEYS.FACE_READINGS);
    return data ? JSON.parse(data) : [];
  },
  setFaceReadings: (readings: FaceReading[]) => {
    localStorage.setItem(KEYS.FACE_READINGS, JSON.stringify(readings));
  },
  clear: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
};
