import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, LifeEvent, Prediction, ChatMessage, DailyReading, FaceReading, PalmReading, BirthChart } from '../types';
import { storage } from '../lib/storage';
import { computeBirthChart } from '../lib/astrology';

interface AppContextType {
  user: UserProfile | null;
  events: LifeEvent[];
  predictions: Prediction[];
  chatHistory: ChatMessage[];
  readings: DailyReading[];
  faceReadings: FaceReading[];
  palmReadings: PalmReading[];
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, fullName: string) => boolean;
  logout: () => void;
  completeOnboarding: (birthDate: string, birthTime: string, birthPlace: string) => void;
  addEvent: (event: Omit<LifeEvent, 'id' | 'userId' | 'createdAt'>) => void;
  deleteEvent: (id: string) => void;
  addPrediction: (prediction: Omit<Prediction, 'id' | 'userId' | 'outcomeUpdatedAt'>) => void;
  updatePredictionStatus: (id: string, status: Prediction['status']) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  addReading: (reading: Omit<DailyReading, 'id' | 'userId'>) => void;
  addFaceReading: (reading: Omit<FaceReading, 'id' | 'userId' | 'createdAt'>) => void;
  addPalmReading: (reading: Omit<PalmReading, 'id' | 'userId' | 'createdAt'>) => void;
  getAccuracyScore: () => { accurate: number; total: number; percentage: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(storage.getUser());
  const [events, setEvents] = useState<LifeEvent[]>(storage.getEvents());
  const [predictions, setPredictions] = useState<Prediction[]>(storage.getPredictions());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(storage.getChatHistory());
  const [readings, setReadings] = useState<DailyReading[]>(storage.getReadings());
  const [faceReadings, setFaceReadings] = useState<FaceReading[]>(storage.getFaceReadings());
  const [palmReadings, setPalmReadings] = useState<PalmReading[]>(storage.getPalmReadings());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('astro-guide-theme');
    return (saved === 'light' ? 'light' : 'dark');
  });

  useEffect(() => { storage.setEvents(events); }, [events]);
  useEffect(() => { storage.setPredictions(predictions); }, [predictions]);
  useEffect(() => { storage.setChatHistory(chatHistory); }, [chatHistory]);
  useEffect(() => { storage.setReadings(readings); }, [readings]);
  useEffect(() => { storage.setFaceReadings(faceReadings); }, [faceReadings]);
  useEffect(() => { storage.setPalmReadings(palmReadings); }, [palmReadings]);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('astro-guide-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const login = useCallback((email: string, _password: string): boolean => {
    const existingUser = storage.getUser();
    if (existingUser && existingUser.email === email) {
      setUser(existingUser);
      return true;
    }
    // For demo, create a new user
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email,
      fullName: email.split('@')[0],
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      chartData: null,
      plan: 'free',
      onboardingComplete: false,
      createdAt: new Date().toISOString()
    };
    storage.setUser(newUser);
    setUser(newUser);
    return true;
  }, []);

  const signup = useCallback((email: string, _password: string, fullName: string): boolean => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email,
      fullName,
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      chartData: null,
      plan: 'free',
      onboardingComplete: false,
      createdAt: new Date().toISOString()
    };
    storage.setUser(newUser);
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
    setEvents([]);
    setPredictions([]);
    setChatHistory([]);
    setReadings([]);
    setFaceReadings([]);
    setPalmReadings([]);
  }, []);

  const completeOnboarding = useCallback((birthDate: string, birthTime: string, birthPlace: string) => {
    if (!user) return;
    const chart = computeBirthChart(birthDate, birthTime, birthPlace);
    const updatedUser = { ...user, birthDate, birthTime, birthPlace, chartData: chart, onboardingComplete: true };
    storage.setUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const addEvent = useCallback((event: Omit<LifeEvent, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newEvent: LifeEvent = { ...event, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    setEvents(prev => [...prev, newEvent]);
  }, [user]);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const addPrediction = useCallback((prediction: Omit<Prediction, 'id' | 'userId' | 'outcomeUpdatedAt'>) => {
    if (!user) return;
    const newPrediction: Prediction = { ...prediction, id: crypto.randomUUID(), userId: user.id, outcomeUpdatedAt: null };
    setPredictions(prev => [...prev, newPrediction]);
  }, [user]);

  const updatePredictionStatus = useCallback((id: string, status: Prediction['status']) => {
    setPredictions(prev => prev.map(p => p.id === id ? { ...p, status, outcomeUpdatedAt: new Date().toISOString() } : p));
  }, []);

  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = { ...message, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, newMsg]);
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  const addReading = useCallback((reading: Omit<DailyReading, 'id' | 'userId'>) => {
    if (!user) return;
    const newReading: DailyReading = { ...reading, id: crypto.randomUUID(), userId: user.id };
    setReadings(prev => [...prev, newReading]);
  }, [user]);

  const addFaceReading = useCallback((reading: Omit<FaceReading, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newReading: FaceReading = { ...reading, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    setFaceReadings(prev => [...prev, newReading]);
  }, [user]);

  const addPalmReading = useCallback((reading: Omit<PalmReading, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newReading: PalmReading = { ...reading, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    setPalmReadings(prev => [...prev, newReading]);
  }, [user]);

  const getAccuracyScore = useCallback(() => {
    const total = predictions.filter(p => p.status !== 'pending').length;
    const accurate = predictions.filter(p => p.status === 'accurate').length;
    return { accurate, total, percentage: total > 0 ? Math.round((accurate / total) * 100) : 0 };
  }, [predictions]);

  return (
    <AppContext.Provider value={{
      user, events, predictions, chatHistory, readings, faceReadings, palmReadings,
      isAuthenticated: !!user?.onboardingComplete,
      theme, toggleTheme,
      login, signup, logout, completeOnboarding,
      addEvent, deleteEvent, addPrediction, updatePredictionStatus,
      addChatMessage, clearChat, addReading, addFaceReading, addPalmReading, getAccuracyScore
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
