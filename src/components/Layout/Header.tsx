
import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  icon?: ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ title, icon, className }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (!user) return 'Utente';
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'Utente';
  };

  return (
    <header className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 ${className || ''}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-finance-blue to-finance-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">MV</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title ? (
              <div className="flex items-center gap-2">
                {icon && <span className="text-finance-blue">{icon}</span>}
                {title}
              </div>
            ) : (
              "MoneyVision"
            )}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-finance-blue text-white">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="end">
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profilo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open('/settings', '_self')}
                className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Impostazioni
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={signOut}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
