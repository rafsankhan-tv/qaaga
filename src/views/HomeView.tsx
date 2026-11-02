import React from 'react';
import { DesktopQaagaDashboard } from '../components/desktop/DesktopQaagaDashboard';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch?: () => void;
  onOpenLocation?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return <DesktopQaagaDashboard onNavigate={onNavigate} />;
};
