import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { LocationSelectorModal } from './components/layout/LocationSelectorModal';
import { CuteCatRunner } from './components/CuteCatRunner';
import { FloatingHelpWidget } from './components/common/FloatingHelpWidget';
import { FeedProfileModal } from './components/feed/FeedProfileModal';
import { marketplaceStore } from './services/marketplaceStore';

// Primary Instant Landing View
import { HomeView } from './views/HomeView';

// Code-split dynamic views for superior initial page performance
const ServiceRequestFormView = lazy(() => import('./views/ServiceRequestFormView').then(m => ({ default: m.ServiceRequestFormView })));
const CustomerDashboardView = lazy(() => import('./views/CustomerDashboardView').then(m => ({ default: m.CustomerDashboardView })));
const ProviderDashboardView = lazy(() => import('./views/ProviderDashboardView').then(m => ({ default: m.ProviderDashboardView })));
const AdminPortalView = lazy(() => import('./views/AdminPortalView').then(m => ({ default: m.AdminPortalView })));
const DoctorsView = lazy(() => import('./views/DoctorsView').then(m => ({ default: m.DoctorsView })));
const NurseCaregiverView = lazy(() => import('./views/NurseCaregiverView').then(m => ({ default: m.NurseCaregiverView })));
const HotelsView = lazy(() => import('./views/HotelsView').then(m => ({ default: m.HotelsView })));
const ProductsView = lazy(() => import('./views/ProductsView').then(m => ({ default: m.ProductsView })));
const JobsView = lazy(() => import('./views/JobsView').then(m => ({ default: m.JobsView })));
const SellerDashboardView = lazy(() => import('./views/SellerDashboardView').then(m => ({ default: m.SellerDashboardView })));
const SellerStorefrontView = lazy(() => import('./views/SellerStorefrontView').then(m => ({ default: m.SellerStorefrontView })));
const RoleRegistrationView = lazy(() => import('./views/RoleRegistrationView').then(m => ({ default: m.RoleRegistrationView })));
const FeedView = lazy(() => import('./views/FeedView').then(m => ({ default: m.FeedView })));
const CartCheckoutView = lazy(() => import('./views/CartCheckoutView').then(m => ({ default: m.CartCheckoutView })));
const OrderTrackingView = lazy(() => import('./views/OrderTrackingView').then(m => ({ default: m.OrderTrackingView })));
const WishlistView = lazy(() => import('./views/WishlistView').then(m => ({ default: m.WishlistView })));

const ViewLoadingFallback = () => (
  <div className="w-full min-h-[50vh] flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500 font-hind">লোড হচ্ছে...</p>
    </div>
  </div>
);

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
    <div className={`min-h-screen flex flex-col ${currentView === 'home' ? 'bg-white' : 'bg-white md:bg-slate-50'} text-slate-900 selection:bg-[#FF5500] selection:text-white pb-20 sm:pb-24 md:pb-0 w-full max-w-full overflow-x-clip`}>
      
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLocation={() => setIsLocationOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <Suspense fallback={<ViewLoadingFallback />}>
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

          {(currentView === 'seller_store' || currentView === 'seller_storefront' || currentView === 'seller_profile') && (
            <SellerStorefrontView
              sellerId={viewParams?.sellerId}
              onNavigate={handleNavigate}
            />
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
        </Suspense>
      </main>

      {/* Global Footer (Non-Home Sub-Views only) */}
      {currentView !== 'home' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Floating Cat Assistant on Desktop Non-Home Views */}
      {currentView !== 'home' && (
        <div className="hidden md:block">
          <CuteCatRunner
            onNavigate={handleNavigate}
            renderStage={false}
            renderFloating={true}
          />
        </div>
      )}

      {/* Floating Help Widget on Non-Home Views */}
      {currentView !== 'home' && (
        <FloatingHelpWidget onNavigate={handleNavigate} />
      )}

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
