
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Home,
  CreditCard,
  TrendingUp,
  Settings,
  Target,
  Filter as Tag,
  BarChart,
  Archive,
  LogOut,
  User,
  Wallet
} from 'lucide-react';

// Definizione delle voci del menu
const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Panoramica generale'
  },
  {
    title: 'Transazioni',
    url: '/transactions',
    icon: CreditCard,
    description: 'Gestisci entrate e uscite'
  },
  {
    title: 'Investimenti',
    url: '/investments',
    icon: TrendingUp,
    description: 'Portfolio investimenti'
  },
  {
    title: 'Analisi',
    url: '/analytics',
    icon: BarChart,
    description: 'Grafici e insights'
  }
];

const secondaryNavItems = [
  {
    title: 'Obiettivi',
    url: '/goals',
    icon: Target,
    description: 'Obiettivi di risparmio'
  },
  {
    title: 'Categorie',
    url: '/categories',
    icon: Tag,
    description: 'Gestisci categorie'
  },
  {
    title: 'Dati Storici',
    url: '/historical',
    icon: Archive,
    description: 'Archivi e cronologia'
  }
];

const AppSidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    
    const displayName = getUserDisplayName();
    if (!displayName) return 'U';
    
    return displayName
      .split(' ')
      .map(n => n?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utente';
    
    // Controlla prima user_metadata per il nome
    if (user.user_metadata?.name) return user.user_metadata.name;
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    
    // Fallback all'email
    if (user.email) return user.email.split('@')[0];
    
    return 'Utente';
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 dark:border-gray-700">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-finance-blue rounded-lg flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              MoneyVision
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              La tua finanza personale
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {/* Menu Principale */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2">Menu Principale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.description}
                    className="w-full"
                  >
                    <NavLink to={item.url} className="flex items-center space-x-3 w-full min-w-0">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <span className="font-medium truncate">{item.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Strumenti */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2">Strumenti</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.description}
                    className="w-full"
                  >
                    <NavLink to={item.url} className="flex items-center space-x-3 w-full min-w-0">
                      <item.icon className="w-5 h-5 shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <span className="font-medium truncate">{item.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Impostazioni */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2">Configurazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/profile'}
                  tooltip="Gestisci il tuo profilo"
                  className="w-full"
                >
                  <NavLink to="/profile" className="flex items-center space-x-3 w-full min-w-0">
                    <User className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <span className="font-medium truncate">Profilo</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Gestisci il tuo profilo
                      </span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/settings'}
                  tooltip="Impostazioni dell'app"
                  className="w-full"
                >
                  <NavLink to="/settings" className="flex items-center space-x-3 w-full min-w-0">
                    <Settings className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <span className="font-medium truncate">Impostazioni</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Impostazioni dell'app
                      </span>
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 p-3">
        {user && (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center min-w-0">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-finance-blue text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
            >
              <LogOut className="w-4 h-4 group-data-[collapsible=icon]:mr-0 mr-2 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Esci</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
