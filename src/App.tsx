import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import AnalyzerPage from './pages/AnalyzerPage';
import TournamentPage from './pages/TournamentPage';
import SettingsPage from './pages/SettingsPage';
import WelcomePage from './pages/WelcomePage';
import HardwareInventoryPage from './pages/HardwareInventoryPage';
import ReleaseAnalysisPage from './pages/ReleaseAnalysisPage';
import HomePage from './pages/HomePage';
import { ThemeProvider } from './contexts/ThemeContext';
import OfflineAlert from './components/OfflineAlert';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  useEffect(() => {
    // Load Google font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Check if user has visited before
    const visited = localStorage.getItem('hasVisitedBefore');
    setHasVisitedBefore(visited === 'true');

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-950 font-['Poppins'] text-gray-900 dark:text-gray-100">
        <Router>
          <Header />
          <OfflineAlert />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={!hasVisitedBefore ? <WelcomePage onComplete={() => {
              localStorage.setItem('hasVisitedBefore', 'true');
              setHasVisitedBefore(true);
            }} /> : <Navigate to="/analyzer" />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/tournament" element={<TournamentPage />} />
            <Route path="/hardware" element={<HardwareInventoryPage />} />
            <Route path="/release" element={<ReleaseAnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </main>
      </Router>
      </div>
    </ThemeProvider>
  );
}

function LoadingScreen() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    'Upload images of your bowling approach for detailed analysis.',
    'Our AI analyzes your stance, arm position, and follow-through.',
    'Track your scores and get insights to improve your game.',
    'Save your analyses to track improvements over time.',
    'Set up your Groq API key in settings to enable image analysis.',
    'Share your analysis results with coaches for additional feedback.',
    'Compare different approaches to find your optimal style.',
    'Use the tournament tracker to monitor performance under pressure.',
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => {
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 font-poppins">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex w-full h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="relative flex items-center justify-center w-16 h-16 bg-white border rounded-full shadow-lg">
            <div className="absolute h-16 w-16 rounded-full animate-spin bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="absolute flex items-center justify-center bg-white rounded-full h-15 w-15">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="#4F46E5" strokeWidth="2" />
                <path d="M12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5Z" fill="#4F46E5" />
              </svg>
            </div>
          </div>

          <div className="text-indigo-800 font-bold text-2xl mt-2">BowlBetter!</div>
          <div className="text-indigo-900 font-medium">Loading your bowling coach...</div>

          <div className="relative h-28 pt-4 pb-8 -mt-4 w-80 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-4 z-10 bg-gradient-to-t from-transparent to-indigo-50" />
            <div className="tip-container tip-slide">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className={`h-8 mb-4 flex items-center justify-center text-indigo-700 text-sm leading-[1.2] transition-opacity duration-500 ${index === currentTipIndex ? 'opacity-100' : 'opacity-50'}`}
                >
                  {tip}
                </div>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-16 z-10 bg-gradient-to-b from-transparent to-indigo-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
