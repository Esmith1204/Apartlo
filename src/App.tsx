import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SearchProvider } from './hooks/useSearch';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import FiltersPage from './pages/FiltersPage';
import ResultsPage from './pages/ResultsPage';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import BookmarksPage from './pages/BookmarksPage';
import { useAuth } from './hooks/useAuth';
import './index.css';

// Routes that get the dark-flow layout (no navbar/footer, full-bleed navy)
const FLOW_ROUTES = ['/', '/filters', '/results'];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isFlow = FLOW_ROUTES.includes(pathname);

  return (
    <div className={isFlow ? 'landing-flow-wrapper' : 'app-wrapper'}>
      {!isFlow && <Navbar />}
      <Routes>
        {/* ── Dark-flow pages (no navbar/footer) ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/filters" element={<FiltersPage />} />
        <Route path="/results" element={<ResultsPage />} />

        {/* ── Standard pages (with navbar/footer) ── */}
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isFlow && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
