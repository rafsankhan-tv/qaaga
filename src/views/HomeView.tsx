import React from 'react';
import { MobileQaagaHome } from '../components/mobile/MobileQaagaHome';
import { DesktopQaagaDashboard } from '../components/desktop/DesktopQaagaDashboard';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch?: () => void;
  onOpenLocation?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <>
      {/* Mobile-First Qaaga Room Rental UI (<768px) */}
      <div className="md:hidden">
        <MobileQaagaHome onNavigate={onNavigate} />
      </div>

      {/* Desktop & Tablet Qaaga Accommodation Dashboard (>=768px) */}
      <div className="hidden md:block">
        <DesktopQaagaDashboard onNavigate={onNavigate} />
      </div>
    </>
  );
};
