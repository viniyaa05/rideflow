import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CompareAndBook from './components/CompareAndBook';
import RentalsView from './components/RentalsView';
import DriversView from './components/DriversView';
import CarpoolView from './components/CarpoolView';
import ReviewsView from './components/ReviewsView';
import PartnerHubView from './components/PartnerHubView';
import AdminView from './components/AdminView';
import FlowBotChatbot from './components/FlowBotChatbot';
import TokenInspectorModal from './components/TokenInspectorModal';
import ChatModal from './components/ChatModal';
import BookingModal from './components/BookingModal';

function MainApp() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentThemeMeta } = useTheme();
  const { t } = useLanguage();
  
  const isAdminUser = Boolean(user?.isAdmin || user?.role === 'SUPER_ADMIN' || user?.role === 'admin');
  
  // Login modal / Gateway toggle when unauthenticated
  const [showLoginModal, setShowLoginModal] = useState(() => {
    return window.location.hash === '#login';
  });

  // Navigation tab state: 'dashboard' | 'compare' | 'rentals' | 'drivers' | 'carpool' | 'reviews' | 'partner' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });
  const [isTokenInspectorOpen, setIsTokenInspectorOpen] = useState(false);
  
  // Active route prefill for Compare & Book
  const [routePreset, setRoutePreset] = useState({
    from: 'Chennai Central Railway Station (600003)',
    to: 'OMR IT Expressway - Sholinganallur (600119)'
  });

  // Auto-adapt sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Keep desktop preference or open
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modal states
  const [chatConfig, setChatConfig] = useState(null); // { recipient, type: 'driver' | 'host' }
  const [bookingItem, setBookingItem] = useState(null); // { mode, title, price, details }

  // Browser History & PopState Listener (Supports physical browser back button)
  useEffect(() => {
    const handlePopState = (e) => {
      if (window.location.hash === '#login') {
        setShowLoginModal(true);
      } else {
        setShowLoginModal(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenLogin = () => {
    window.location.hash = '#login';
    setShowLoginModal(true);
  };

  const handleBackToLanding = () => {
    window.location.hash = '#home';
    setShowLoginModal(false);
  };

  // Quick re-book from Dashboard
  const handleQuickBookRoute = (from, to) => {
    setRoutePreset({ from, to });
    setActiveTab('compare');
  };

  // Open in-app chat
  const handleOpenChat = (recipient, type) => {
    setChatConfig({ recipient, type });
  };

  // Direct checkout booking modal
  const handleDirectBook = (item) => {
    setBookingItem(item);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 font-sans tracking-wide">
            Loading RideFlow Mobility Network...
          </p>
        </div>
      </div>
    );
  }

  // If unauthenticated: show dynamic animated showcase Landing Page, or Login dialog if clicked
  if (!isAuthenticated) {
    if (showLoginModal) {
      return <Login onBackToLanding={handleBackToLanding} />;
    }
    return (
      <LandingPage
        onOpenLogin={handleOpenLogin}
        onSelectService={(mode) => {
          handleOpenLogin();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen text-asphalt dark:text-sand bg-sand dark:bg-[#14120E] flex flex-col selection:bg-rickshaw/20 selection:text-rickshaw transition-colors duration-200 relative overflow-x-hidden bg-kolam-pattern">
      
      {/* Sidebar Navigation Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenTokenInspector={() => setIsTokenInspectorOpen(true)}
      />

      {/* Main Content Area (dynamically offsets when sidebar is open on large screens) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenTokenInspector={() => setIsTokenInspectorOpen(true)}
        />

        {/* Main View Router */}
        <main className="flex-1 pb-20 md:pb-12 z-10">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onQuickBookRoute={handleQuickBookRoute} 
            />
          )}

          {activeTab === 'compare' && (
            <CompareAndBook
              initialFrom={routePreset.from}
              initialTo={routePreset.to}
              onSelectMode={(modeTab) => setActiveTab(modeTab)}
              onDirectBook={handleDirectBook}
            />
          )}

          {activeTab === 'rentals' && (
            <RentalsView 
              onBookRental={handleDirectBook}
              onOpenChat={(car) => handleOpenChat(car, 'host')}
            />
          )}

          {activeTab === 'drivers' && (
            <DriversView 
              onOpenChat={handleOpenChat} 
              onRequestDriver={handleDirectBook} 
            />
          )}

          {activeTab === 'carpool' && (
            <CarpoolView 
              onOpenChat={handleOpenChat} 
              onJoinCarpool={handleDirectBook} 
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsView />
          )}

          {activeTab === 'partner' && (
            <PartnerHubView />
          )}

          {activeTab === 'admin' && (
            isAdminUser ? <AdminView /> : <Dashboard setActiveTab={setActiveTab} onQuickBookRoute={handleQuickBookRoute} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-sand-border dark:border-asphalt-border bg-sand-card/90 dark:bg-asphalt-card/90 backdrop-blur-md py-6 text-center text-xs text-asphalt-muted dark:text-sand-dark z-10 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 RideFlow Mobility Network • Tamil Nadu Corridors (600003 - 641012)</p>
            <div className="flex items-center gap-3 text-asphalt-muted dark:text-sand-dark">
              <span className="text-[11px] font-bold flex items-center gap-1.5">
                <span 
                  style={{ backgroundColor: currentThemeMeta.accentHex }} 
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-xs" 
                />
                Active Theme: {currentThemeMeta.name}
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Floating Multilingual AI Mobility Chatbot */}
      <FlowBotChatbot onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* JWT Cryptographic Token Inspector Modal */}
      {isTokenInspectorOpen && (
        <TokenInspectorModal onClose={() => setIsTokenInspectorOpen(false)} />
      )}

      {/* In-App Chat Dialog Modal */}
      {chatConfig && (
        <ChatModal
          recipient={chatConfig.recipient}
          type={chatConfig.type}
          onClose={() => setChatConfig(null)}
        />
      )}

      {/* Booking Checkout Modal */}
      {bookingItem && (
        <BookingModal
          bookingItem={bookingItem}
          onClose={() => setBookingItem(null)}
          onBookingSuccess={(completedTrip) => {
            // Success
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
