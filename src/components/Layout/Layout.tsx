
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { Home, CreditCard, TrendingUp, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const quickNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Transazioni', url: '/transactions', icon: CreditCard },
  { title: 'Investimenti', url: '/investments', icon: TrendingUp },
  { title: 'Impostazioni', url: '/settings', icon: Settings }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
          {/* Header fisso */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 min-w-0">
              <Header />
            </div>
          </header>
          
          {/* Contenuto principale scrollabile con padding responsive */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 md:p-6 pb-20 lg:pb-6">
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
      
      {/* Quick Navigation Tabs - fissi in basso solo su mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg lg:hidden">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {quickNavItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors text-xs ${
                location.pathname === item.url
                  ? 'text-finance-blue bg-finance-blue/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-finance-blue hover:bg-finance-blue/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </SidebarProvider>
  );
};

export default Layout;
