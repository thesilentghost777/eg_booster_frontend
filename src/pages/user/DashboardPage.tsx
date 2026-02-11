import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  ShoppingBag, 
  Gift, 
  Users,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { 
  FaTiktok, 
  FaFacebook, 
  FaYoutube, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Order } from '@/types/api';
import { toast } from 'sonner';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';

const quickActions = [
  { to: '/services', icon: ShoppingBag, label: 'Services' },
  { to: '/wallet', icon: Wallet, label: 'Recharger' },
  { to: '/wheel', icon: Gift, label: 'Roue' },
  { to: '/referral', icon: Users, label: 'Parrainage' },
];

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: FaTiktok,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
};

const statusLabels: Record<string, string> = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
};

const onboardingSteps = [
  {
    target: '[data-tour="balance-card"]',
    title: 'Votre Solde',
    description: 'Utilisez vos points pour acheter des services.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="recharge-btn"]',
    title: 'Recharger',
    description: 'Achetez des points via Mobile Money ou carte bancaire.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="free-views"]',
    title: 'Cadeau de Bienvenue',
    description: 'Réclamez vos 1000 vues gratuites.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Actions Rapides',
    description: 'Accédez rapidement à toutes les fonctionnalités.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="recent-orders"]',
    title: 'Vos Commandes',
    description: 'Suivez vos commandes en temps réel.',
    position: 'top' as const,
  },
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnboardingComplete, isLoading: isOnboardingLoading, completeOnboarding } = useOnboarding();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!isLoading && !isOnboardingLoading && !isOnboardingComplete) {
      setTimeout(() => setShowTour(true), 500);
    }
  }, [isLoading, isOnboardingLoading, isOnboardingComplete]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await refreshUser();
      const response = await api.getOrders();
      if ((response as { success: boolean; data?: Order[] }).success && (response as { data?: Order[] }).data) {
        setRecentOrders((response as { data: Order[] }).data.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTourComplete = () => {
    completeOnboarding();
    setShowTour(false);
    toast.success('Bienvenue !');
  };

  const handleTourSkip = () => {
    completeOnboarding();
    setShowTour(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) return "Aujourd'hui";
    if (diffInHours < 48) return "Hier";
    const days = Math.floor(diffInHours / 24);
    return `Il y a ${days}j`;
  };

  const openWhatsApp = () => {
    const phoneNumber = '237680580837';
    const message = encodeURIComponent(`Bonjour, j'ai besoin d'aide concernant mon compte.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - ultra minimal */}
      <div className="px-4 pt-safe pt-8 pb-6 max-w-2xl mx-auto">
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight">
          {user?.prenom}
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Balance - épuré */}
        <div data-tour="balance-card" className="pt-4 pb-8">
          <div className="text-[15px] text-gray-500 mb-3">
            Solde
          </div>
          <div className="text-[56px] font-semibold text-gray-900 leading-none mb-8 tracking-tight">
            {user?.points_balance?.toLocaleString() || 0}
          </div>
          <Link to="/wallet">
            <Button 
              data-tour="recharge-btn"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-[52px] rounded-full text-[15px] font-medium"
            >
              Recharger
            </Button>
          </Link>
        </div>

        {/* Free views - minimal */}
        {!user?.free_views_claimed && (
          <Link to="/free-views">
            <div 
              data-tour="free-views"
              className="relative py-5 px-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl flex items-center justify-between active:scale-[0.98] transition-transform overflow-hidden"
            >
              {/* Animation pulse subtile */}
              <div className="absolute inset-0 bg-blue-200 rounded-3xl animate-ping opacity-20"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <Gift className="w-5 h-5 text-blue-600 animate-bounce" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[15px] font-medium text-gray-900">1000 vues gratuites</div>
                  <div className="text-[13px] text-gray-600 mt-0.5">Réclamez votre cadeau</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 relative z-10" />
            </div>
          </Link>
        )}

        {/* Quick actions - grid simple */}
        <div data-tour="quick-actions" className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <div className="flex flex-col items-center gap-3 py-4 active:scale-95 transition-transform">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-[13px] text-gray-600">
                  {action.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders - liste pure */}
        <div data-tour="recent-orders" className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-gray-900">Commandes</h2>
            <Link to="/orders" className="text-[15px] text-blue-600 font-medium">
              Tout
            </Link>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            <>
              {recentOrders.length > 0 ? (
                <div className="space-y-1">
                  {recentOrders.map((order) => {
                    const PlatformIcon = platformIcons[order.service.platform] || FaTiktok;
                    
                    return (
                      <div 
                        key={order.id} 
                        className="flex items-center gap-3 py-4 active:bg-gray-50 -mx-2 px-2 rounded-2xl transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <PlatformIcon className="w-[18px] h-[18px] text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-medium text-gray-900 truncate">
                            {order.service.label}
                          </div>
                          <div className="text-[13px] text-gray-500 mt-0.5">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div className="text-[13px] text-gray-500">
                          {statusLabels[order.status]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="text-[15px] text-gray-400 mb-4">
                    Aucune commande
                  </div>
                  <Link to="/services">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-[44px] px-6 rounded-full text-[15px] font-medium">
                      Voir les services
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* WhatsApp - minimal floating */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Support"
      >
        <FaWhatsapp className="w-6 h-6 text-white" />
      </button>

      {/* Onboarding */}
      {showTour && (
        <OnboardingTour
          steps={onboardingSteps}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </div>
  );
}