import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Eye, 
  ShoppingBag, 
  Gift, 
  Users, 
  ChevronRight,
  TrendingUp,
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  FaTiktok, 
  FaFacebook, 
  FaYoutube, 
  FaInstagram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Order } from '@/types/api';
import { toast } from 'sonner';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';

const quickActions = [
  { to: '/services', icon: ShoppingBag, label: 'Acheter', color: 'gradient-primary' },
  { to: '/wallet', icon: Wallet, label: 'Recharger', color: 'gradient-secondary' },
  { to: '/wheel', icon: Gift, label: 'Roue', color: 'gradient-accent' },
  { to: '/referral', icon: Users, label: 'Parrainage', color: 'gradient-success' },
];

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: FaTiktok,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
};

const statusColors: Record<string, string> = {
  en_attente: 'bg-warning/20 text-warning',
  en_cours: 'bg-secondary/20 text-secondary',
  termine: 'bg-success/20 text-success',
  annule: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  en_attente: '⏳ En attente',
  en_cours: '🔄 En cours',
  termine: '✅ Terminé',
  annule: '❌ Annulé',
};

// Étapes du tutoriel
const onboardingSteps = [
  {
    target: '[data-tour="balance-card"]',
    title: '💰 Votre Solde',
    description: 'Ici vous pouvez voir votre solde de points. Utilisez ces points pour acheter des services comme des vues, likes, et abonnés.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="recharge-btn"]',
    title: '⚡ Recharger votre Compte',
    description: 'Cliquez ici pour recharger votre compte et acheter des points via Mobile Money, Orange Money ou carte bancaire.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="free-views"]',
    title: '🎁 Cadeau de Bienvenue',
    description: 'Réclamez vos 1000 vues GRATUITES ! Un cadeau exclusif pour tous les nouveaux utilisateurs.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="quick-actions"]',
    title: '🚀 Actions Rapides',
    description: 'Accédez rapidement à toutes les fonctionnalités : acheter des services, recharger, jouer à la roue de la fortune, et parrainer vos amis.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="recent-orders"]',
    title: '📦 Vos Commandes',
    description: 'Suivez l\'état de vos commandes en temps réel. Vous verrez ici toutes vos commandes récentes et leur progression.',
    position: 'top' as const,
  },
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceChange, setBalanceChange] = useState<number | null>(null);
  
  // Gestion du tutoriel
  const { isOnboardingComplete, isLoading: isOnboardingLoading, completeOnboarding } = useOnboarding();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Afficher le tutoriel après le chargement des données
  useEffect(() => {
    if (!isLoading && !isOnboardingLoading && !isOnboardingComplete) {
      // Petit délai pour que l'interface soit bien rendue
      setTimeout(() => {
        setShowTour(true);
      }, 500);
    }
  }, [isLoading, isOnboardingLoading, isOnboardingComplete]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Refresh user data to get latest balance
      await refreshUser();
      
      // Load recent orders
      const response = await api.getOrders();
      // Assert the type of response to expected structure
      if ((response as { success: boolean; data?: Order[] }).success && (response as { data?: Order[] }).data) {
        // Get only the 3 most recent orders
        setRecentOrders((response as { data: Order[] }).data.slice(0, 3));
      }

      // Calculate balance change (mock for demo - you could track this via transactions)
      const transactionsResponse = await api.getTransactions();
      if (
        (transactionsResponse as { success: boolean; data?: any[] }).success &&
        (transactionsResponse as { data?: any[] }).data
      ) {
        const transactions = (transactionsResponse as { data: any[] }).data;
        if (transactions.length >= 2) {
          const latestBalance = transactions[0].balance_after;
          const previousBalance = transactions[1].balance_after;
          const change = ((latestBalance - previousBalance) / previousBalance) * 100;
          setBalanceChange(change);
        }
      }
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      toast.error(error.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTourComplete = () => {
    completeOnboarding();
    setShowTour(false);
    toast.success('🎉 Bienvenue ! Vous êtes prêt à commencer.');
  };

  const handleTourSkip = () => {
    completeOnboarding();
    setShowTour(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return "Aujourd'hui";
    } else if (diffInHours < 48) {
      return "Hier";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header with gradient */}
      <div className="gradient-dark px-4 pt-6 pb-20">
        <div className="max-w-lg mx-auto">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground">Bienvenue,</p>
              <h1 className="text-2xl font-display font-bold text-foreground">{user?.prenom} 👋</h1>
            </div>
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Balance card */}
          <div 
            data-tour="balance-card"
            className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-elevated"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Votre solde</p>
                  <p className="text-3xl font-display font-bold text-foreground">
                    {user?.points_balance?.toLocaleString() || 0}
                    <span className="text-lg text-muted-foreground ml-2">pts</span>
                  </p>
                </div>
              </div>
              {balanceChange !== null && balanceChange !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  balanceChange > 0 ? "text-success" : "text-destructive"
                )}>
                  <TrendingUp className={cn("w-4 h-4", balanceChange < 0 && "rotate-180")} />
                  {balanceChange > 0 ? '+' : ''}{balanceChange.toFixed(1)}%
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link to="/wallet" className="flex-1">
                <Button 
                  data-tour="recharge-btn"
                  className="w-full gradient-primary text-white rounded-xl h-12"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Recharger
                </Button>
              </Link>
             
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 max-w-lg mx-auto pb-4">
        {/* Free views banner */}
        {!user?.free_views_claimed && (
          <Link to="/free-views" className="block mb-6">
            <div 
              data-tour="free-views"
              className="gradient-accent rounded-2xl p-4 flex items-center gap-4 shadow-glow animate-pulse-glow"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">🎁 1000 Vues GRATUITES !</p>
                <p className="text-sm text-white/80">Réclamez votre cadeau de bienvenue</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </div>
          </Link>
        )}

        {/* Quick actions */}
        <div 
          data-tour="quick-actions"
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="text-center">
              <div className={cn("w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2 shadow-card", action.color)}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div 
          data-tour="recent-orders"
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Dernières commandes</h2>
            <Link to="/orders" className="text-sm text-primary font-medium flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-3" />
              <p className="text-muted-foreground text-sm">Chargement...</p>
            </div>
          ) : (
            <>
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentOrders.map((order) => {
                    const PlatformIcon = platformIcons[order.service.platform] || FaTiktok;
                    
                    return (
                      <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                          <PlatformIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-foreground">{order.service.label}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusColors[order.status])}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-2">Aucune commande récente</p>
                  <Link to="/services" className="text-primary font-medium text-sm">
                    Découvrir nos services →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tutoriel d'onboarding */}
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