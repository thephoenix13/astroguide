import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { AuthPage, OnboardingPage } from './pages/AuthPages';
import { HomePage } from './pages/HomePage';
import { ChartPage } from './pages/ChartPage';
import { ChatPage } from './pages/ChatPage';
import { TimelinePage } from './pages/TimelinePage';
import { FaceReadingPage } from './pages/FaceReadingPage';
import { PalmReadingPage } from './pages/PalmReadingPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ComparisonPage } from './pages/ComparisonPage';

function AppRoutes() {
  const { user } = useApp();

  // Not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // Logged in but not onboarded
  if (!user.onboardingComplete) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // Fully authenticated
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/face" element={<FaceReadingPage />} />
        <Route path="/palm" element={<PalmReadingPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
