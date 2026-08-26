import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { LocationSelectorModal } from './components/layout/LocationSelectorModal';

// Views
import { HomeView } from './views/HomeView';
import { ServiceRequestFormView } from './views/ServiceRequestFormView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { ProviderDashboardView } from './views/ProviderDashboardView';
import { AdminPortalView } from './views/AdminPortalView';
import { DoctorsView } from './views/DoctorsView';
import { NurseCaregiverView } from './views/NurseCaregiverView';
import { HotelsView } from './views/HotelsView';
import { ProductsView } from './views/ProductsView';
import { EbooksView } from './views/EbooksView';
import { UsedProductsView } from './views/UsedProductsView';
import { JobsView } from './views/JobsView';
import { SellerDashboardView } from './views/SellerDashboardView';
import { RoleRegistrationView } from './views/RoleRegistrationView';
import { FeedView } from './views/FeedView';
import { CartCheckoutView } from './views/CartCheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { WishlistView } from './views/WishlistView';
import { CuteCatRunner } from './components/CuteCatRunner';
import { FloatingHelpWidget } from './components/common/FloatingHelpWidget';
import { FeedProfileModal } from './components/feed/FeedProfileModal';
import { marketplaceStore } from './services/marketplaceStore';

const MainApp: React.FC = () => {
  const { activeRole } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [deepLinkProfileId, setDeepLinkProfileId] = useState<string | null>(null);

  // Deep Link Query Parameter Listener (?profile=..., ?post=..., ?service=...)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const profileParam = params.get('profile');
        const postParam = params.get('post');
        const serviceParam = params.get('service');
        const viewParam = params.get('view');

        if (profileParam) {
          setDeepLinkProfileId(profileParam);
        } else if (postParam) {
          setCurrentView('feed');
          setViewParams({ postId: postParam, tab: 'foryou' });
        } else if (serviceParam) {
          setCurrentView('service_request');
          setViewParams({ serviceId: serviceParam });
        } else if (viewParam) {
          setCurrentView(viewParam);
        }
      }
    } catch (err) {
      console.error('Error reading URL params:', err);
    }
  }, []);

  useEffect(() => {
    // Initial sync of settings & metadata
    marketplaceStore.getSettings();
    const unsubscribe = marketplaceStore.subscribe(() => {
      // triggers updates if any global state changes
    });
    return () => unsubscribe();
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white pb-20 sm:pb-24 md:pb-0 w-full max-w-full overflow-x-clip">
      
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenLocation={() => setIsLocationOpen(true)}
          />
        )}

        {currentView === 'service_request' && (
          <ServiceRequestFormView
            initialCategoryId={viewParams.categoryId}
            initialProviderId={viewParams.providerId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'customer_dashboard' && (
          <CustomerDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'provider_dashboard' && (
          <ProviderDashboardView onNavigate={handleNavigate} />
        )}

        {(currentView === 'admin_portal' || currentView === 'admin') && (
          <AdminPortalView
            initialTab={viewParams.tab}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorsView
            initialDoctorId={viewParams.doctorId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'nurses' && (
          <NurseCaregiverView onNavigate={handleNavigate} />
        )}

        {currentView === 'hotels' && (
          <HotelsView onNavigate={handleNavigate} />
        )}

        {currentView === 'products' && (
          <ProductsView
            onNavigate={handleNavigate}
            initialTab={viewParams.tab || 'all'}
          />
        )}

        {currentView === 'ebooks' && (
          <ProductsView
            onNavigate={handleNavigate}
            initialTab="ebooks"
          />
        )}

        {currentView === 'used_products' && (
          <ProductsView
            onNavigate={handleNavigate}
            initialTab="used"
          />
        )}

        {currentView === 'blogs' && (
          <ProductsView
            onNavigate={handleNavigate}
            initialTab="blogs"
          />
        )}

        {currentView === 'jobs' && (
          <JobsView onNavigate={handleNavigate} />
        )}

        {currentView === 'feed' && (
          <FeedView
            onNavigate={handleNavigate}
            initialTab={viewParams.tab || 'following'}
          />
        )}

        {currentView === 'seller_dashboard' && (
          <SellerDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'partner_register' && (
          <RoleRegistrationView onNavigate={handleNavigate} />
        )}

        {(currentView === 'checkout' || currentView === 'cart_checkout' || currentView === 'cart') && (
          <CartCheckoutView
            onNavigate={handleNavigate}
            instantProduct={viewParams?.instantProduct}
            instantQuantity={viewParams?.instantQuantity || 1}
          />
        )}

        {(currentView === 'track_order' || currentView === 'order_tracking' || currentView === 'track') && (
          <OrderTrackingView
            initialOrderId={viewParams?.orderId || viewParams?.orderNumber}
            onNavigate={handleNavigate}
          />
        )}

        {(currentView === 'wishlist' || currentView === 'whitelist') && (
          <WishlistView
            onNavigate={handleNavigate}
            onBuyNow={(prod) => handleNavigate('checkout', { instantProduct: prod, instantQuantity: 1 })}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating Cat Assistant on All Non-Home Views */}
      {currentView !== 'home' && (
        <CuteCatRunner
          onNavigate={handleNavigate}
          renderStage={false}
          renderFloating={true}
        />
      )}

      {/* Floating 24/7 Multimodal Suchi Assistant & Direct Help Widget */}
      <FloatingHelpWidget onNavigate={handleNavigate} />

      {/* Mobile Sticky Bottom Navigation with Complete Profile Hub & Quick Action */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Global Shared Deep Link Profile Modal */}
      {deepLinkProfileId && (
        <FeedProfileModal
          isOpen={!!deepLinkProfileId}
          onClose={() => {
            setDeepLinkProfileId(null);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              const url = new URL(window.location.href);
              url.searchParams.delete('profile');
              window.history.replaceState({}, '', url.toString());
            }
          }}
          targetId={deepLinkProfileId}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <MainApp />
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
