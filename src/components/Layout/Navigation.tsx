
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transazioni', icon: '💳' },
  { to: '/goals', label: 'Obiettivi', icon: '🎯' },
  { to: '/categories', label: 'Categorie', icon: '🏷️' },
  { to: '/analytics', label: 'Analisi', icon: '📈' },
];

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  return (
    <nav className={cn('space-y-2', className)}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300',
              isActive && 'bg-finance-blue/10 text-finance-blue dark:bg-finance-blue/20 border-l-4 border-finance-blue'
            )
          }
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
