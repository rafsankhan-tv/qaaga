import React from 'react';
import {
  Globe,
  Video,
  Stethoscope,
  Building2,
  HeartPulse,
  Users,
  Wind,
  Tv,
  ThermometerSnowflake,
  Zap,
  Droplets,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Repeat,
  FileText,
  Briefcase,
  UserPlus,
  ShieldCheck,
  Grid,
  Wrench,
  Layers,
  Cpu,
  PhoneCall,
  Laptop,
  Truck,
  Car,
  Home,
  Package
} from 'lucide-react';

export const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Globe,
  Video,
  Stethoscope,
  Building2,
  HeartPulse,
  Users,
  Wind,
  Tv,
  ThermometerSnowflake,
  Zap,
  Droplets,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Repeat,
  FileText,
  Briefcase,
  UserPlus,
  ShieldCheck,
  Grid,
  Wrench,
  Layers,
  Cpu,
  PhoneCall,
  Laptop,
  Truck,
  Car,
  Home,
  Package
};

export const RenderCategoryIcon: React.FC<{
  iconName: string;
  size?: number;
  className?: string;
}> = ({ iconName, size = 18, className = '' }) => {
  const IconComponent = ICON_MAP[iconName] || Layers;
  return <IconComponent size={size} className={className} />;
};
