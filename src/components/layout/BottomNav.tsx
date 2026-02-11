import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Wallet, Gift, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/services', icon: ShoppingBag, label: 'Services' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/wheel', icon: Gift, label: 'Roue' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around py-1 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors min-w-0"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive 
                  ? "bg-blue-600" 
                  : "bg-transparent"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive 
                    ? "text-white" 
                    : "text-gray-400"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-gray-900" 
                  : "text-gray-500"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}