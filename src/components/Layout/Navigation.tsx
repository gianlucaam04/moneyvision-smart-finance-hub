
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, Home, CreditCard, Settings, Target, Tag, BarChart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavigationProps {
  className?: string;
}

// Definizione dei tipi per gli item di navigazione
interface NavItem {
  to: string;
  label: string;
  iconComponent: React.ComponentType<{className?: string}>;
}

// Voci da mostrare sempre nella barra di navigazione
const mainNavigationItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', iconComponent: Home },
  { to: '/transactions', label: 'Transazioni', iconComponent: CreditCard },
  { to: '/investments', label: 'Investimenti', iconComponent: TrendingUp },
  { to: '/settings', label: 'Impostazioni', iconComponent: Settings },
];

// Voci da mostrare nel menu hamburger
const extraNavigationItems: NavItem[] = [
  { to: '/goals', label: 'Obiettivi', iconComponent: Target },
  { to: '/categories', label: 'Categorie', iconComponent: Tag },
  { to: '/analytics', label: 'Analisi', iconComponent: BarChart },
];

// Tutti gli item di navigazione per il layout desktop
const allNavigationItems: NavItem[] = [...mainNavigationItems, ...extraNavigationItems];

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  // Barra di navigazione mobile con elementi principali + hamburger menu
  if (isMobile) {
    return (
      <nav className={cn('w-full max-w-full bg-white/90 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-700', className)}>
        <div className="flex justify-around items-center py-3 w-full">
          {/* Voci principali sempre visibili */}
          {mainNavigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center transition-all duration-200 relative w-16',
                  isActive ? 'text-brand-primary dark:text-brand-secondary' : 'text-gray-400 dark:text-gray-500'
                )
              }
            >
              <div className="relative">
                <item.iconComponent className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1">
                {item.label}
              </span>
            </NavLink>
          ))}

          {/* Menu hamburger per le voci aggiuntive */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center justify-center transition-all duration-200 w-16 text-gray-400 dark:text-gray-500 hover:text-brand-primary dark:hover:text-brand-secondary relative">
                <div className="relative">
                  <Menu className="h-6 w-6" />
                </div>
                <span className="text-xs mt-1 font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-60 bg-white dark:bg-gray-800 pt-8">
              <nav className="space-y-2 mt-4">
                {extraNavigationItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'text-gray-700 dark:text-gray-300',
                        isActive && 'bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 border-l-4 border-brand-primary'
                      )
                    }
                  >
                    <item.iconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn('space-y-2', className)}>
      {/* Voci principali sempre visibili */}
      {mainNavigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300',
              isActive && 'bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 border-l-4 border-brand-primary'
            )
          }
        >
          <item.iconComponent className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
      
      {/* Menu hamburger per le voci aggiuntive */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left"
          >
            <Menu className="h-5 w-5" />
            <span className="font-medium">Altro</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 bg-white dark:bg-gray-800 pt-8">
          <nav className="space-y-2 mt-4">
            {extraNavigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'text-gray-700 dark:text-gray-300',
                    isActive && 'bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 border-l-4 border-brand-primary'
                  )
                }
              >
                <item.iconComponent className="h-5 w-5 text-brand-primary" />
                <span className="font-medium text-brand-primary">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navigation;
