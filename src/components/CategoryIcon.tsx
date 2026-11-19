import React from 'react';
import {
  Briefcase,
  Bus,
  Carrot,
  Film,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  Milk,
  Percent,
  Plane,
  Receipt,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Zap,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Utensils,
  ShoppingBag,
  Carrot,
  Milk,
  Tag,
  Fuel,
  Bus,
  Zap,
  Smartphone,
  Wifi,
  Home,
  HeartPulse,
  GraduationCap,
  Film,
  Plane,
  Receipt,
  Briefcase,
  Store,
  Laptop,
  Percent,
  TrendingUp,
  Gift,
  Wallet,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', style }) => {
  const IconComp = ICON_MAP[name] || Tag;
  return <IconComp className={className} style={style} />;
};
