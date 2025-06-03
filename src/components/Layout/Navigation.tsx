
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transazioni', icon: '💳' },
  { to: '/goals', label: 'Obiettivi', icon: '🎯' },
  { to: '/categories', label: 'Categorie', icon: '🏷️' },
  { to: '/analytics', label: 'Analisi', icon: '📈' },
  { to: '/settings', label: 'Impostazioni', icon: '⚙️' },
];

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav className={cn('w-full overflow-x-auto hide-scrollbar', className)}>
        <div className="flex space-x-1 px-2 min-w-max">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[70px] flex-shrink-0',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  isActive && 'bg-finance-blue/10 text-finance-blue dark:bg-finance-blue/20'
                )
              }
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    );
  }

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
