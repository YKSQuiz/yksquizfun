import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, EditProfile } from './components/features/auth';
import { Home } from './components/features/home';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TestSelection } from './components/features/quiz';
import { SubjectSelector, AltKonuSelector } from './components/common/subjects';
import { Market } from './components/features/market';
import { initializeABTests } from './utils/abTesting';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy load heavy components
const Quiz = lazy(() => import('./components/features/quiz/Quiz'));
const Istatistiklerim = lazy(() => import('./components/features/stats/Istatistiklerim'));
const PerformanceDashboard = lazy(() => import('./components/features/admin/PerformanceDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#667eea'
  }}>
    <div>Yükleniyor...</div>
  </div>
);

const APP_ACTIVE_KEY = 'totalAppActiveSeconds';

function addActiveSeconds(seconds: number) {
  const prev = parseInt(localStorage.getItem(APP_ACTIVE_KEY) || '0', 10);
  localStorage.setItem(APP_ACTIVE_KEY, String(prev + seconds));
}

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  // Scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    let start = Date.now();
    function saveSession() {
      const end = Date.now();
      const diffSeconds = Math.floor((end - start) / 1000);
      if (diffSeconds > 0) addActiveSeconds(diffSeconds);
      start = Date.now();
    }
    window.addEventListener('blur', saveSession);
    window.addEventListener('beforeunload', saveSession);
    window.addEventListener('focus', () => { start = Date.now(); });
    return () => {
      saveSession();
      window.removeEventListener('blur', saveSession);
      window.removeEventListener('beforeunload', saveSession);
      window.removeEventListener('focus', () => { start = Date.now(); });
    };
  }, []);

  // Initialize AB Tests
  useEffect(() => {
    initializeABTests();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              
              {/* TYT Ana Konular */}
              <Route path="/tyt-subjects" element={<PrivateRoute><SubjectSelector category="tyt" /></PrivateRoute>} />
              
              {/* TYT Alt Konular */}
              <Route path="/tyt-turkce-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-turkce" subjectName="TYT Türkçe" /></PrivateRoute>} />
              <Route path="/tyt-tarih-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-tarih" subjectName="TYT Tarih" /></PrivateRoute>} />
              <Route path="/tyt-cografya-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-cografya" subjectName="TYT Coğrafya" /></PrivateRoute>} />
              <Route path="/tyt-felsefe-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-felsefe" subjectName="TYT Felsefe" /></PrivateRoute>} />
              <Route path="/tyt-din-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-din" subjectName="TYT Din" /></PrivateRoute>} />
              <Route path="/tyt-matematik-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-matematik" subjectName="TYT Matematik" /></PrivateRoute>} />
              <Route path="/tyt-fizik-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-fizik" subjectName="TYT Fizik" /></PrivateRoute>} />
              <Route path="/tyt-kimya-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-kimya" subjectName="TYT Kimya" /></PrivateRoute>} />
              <Route path="/tyt-biyoloji-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="tyt-biyoloji" subjectName="TYT Biyoloji" /></PrivateRoute>} />
              
              {/* TYT Test Seçimi */}
              <Route path="/turkce/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/tarih/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/cografya/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/felsefe/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/din/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/matematik/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/fizik/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/kimya/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/biyoloji/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              
              {/* AYT Ana Konular */}
              <Route path="/ayt-say-subjects" element={<PrivateRoute><SubjectSelector category="ayt-sayisal" /></PrivateRoute>} />
              <Route path="/ayt-ea-subjects" element={<PrivateRoute><SubjectSelector category="ayt-ea" /></PrivateRoute>} />
              <Route path="/ayt-soz-subjects" element={<PrivateRoute><SubjectSelector category="ayt-sozel" /></PrivateRoute>} />
              
              {/* AYT Alt Konular */}
              <Route path="/ayt-matematik-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-matematik" subjectName="AYT Matematik" /></PrivateRoute>} />
              <Route path="/ayt-fizik-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-fizik" subjectName="AYT Fizik" /></PrivateRoute>} />
              <Route path="/ayt-kimya-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-kimya" subjectName="AYT Kimya" /></PrivateRoute>} />
              <Route path="/ayt-biyoloji-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-biyoloji" subjectName="AYT Biyoloji" /></PrivateRoute>} />
              <Route path="/ayt-edebiyat-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-edebiyat" subjectName="AYT Edebiyat" /></PrivateRoute>} />
              <Route path="/ayt-tarih-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-tarih" subjectName="AYT Tarih" /></PrivateRoute>} />
              <Route path="/ayt-cografya-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-cografya" subjectName="AYT Coğrafya" /></PrivateRoute>} />
              <Route path="/ayt-felsefe-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-felsefe" subjectName="AYT Felsefe" /></PrivateRoute>} />
              <Route path="/ayt-din-altkonular" element={<PrivateRoute><AltKonuSelector subjectId="ayt-din" subjectName="AYT Din Kültürü" /></PrivateRoute>} />
              
              {/* AYT Test Seçimi */}
              <Route path="/ayt-matematik/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-fizik/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-kimya/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-biyoloji/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-edebiyat/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-tarih/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-cografya/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-felsefe/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              <Route path="/ayt-din/:subTopic" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
              
              {/* Quiz (TYT ve AYT ortak) */}
              <Route path="/quiz/:mainTopic/:subTopic/:testNumber" element={<PrivateRoute><Quiz /></PrivateRoute>} />
              
              {/* Diğer Sayfalar */}
              <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
              <Route path="/istatistikler" element={<PrivateRoute><Istatistiklerim /></PrivateRoute>} />
              <Route path="/performance" element={<PrivateRoute><PerformanceDashboard /></PrivateRoute>} />
              <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />

              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 