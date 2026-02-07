import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  Loader2,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_deposits_fcfa: number;
  points_in_circulation: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  open_tickets: number;
}

interface RecentOrder {
  id: number;
  reference: string;
  service: {
    platform: string;
    label: string;
    service_type: string;
  };
  link: string;
  quantity: number;
  points_spent: number;
  status: string;
  status_label: string;
  is_free_gift: boolean;
  created_at: string;
  user: {
    id: number;
    prenom: string;
    telephone: string;
  };
}

// Composants d'icônes SVG pour les réseaux sociaux
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
};

const statusColors: Record<string, string> = {
  en_attente: 'bg-warning/20 text-warning border-warning/30',
  en_cours: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  termine: 'bg-success/20 text-success border-success/30',
  annule: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING DASHBOARD ===');
      
      const data = await api.adminGetDashboard();
      
      console.log('Raw API response:', data);
      console.log('Response type:', typeof data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse invalide du serveur');
      }
      
      // La réponse devrait avoir cette structure: { success: true, data: { stats: {...}, recent_orders: [...] } }
      if ('data' in data && typeof data.data === 'object' && data.data !== null) {
        const innerData = data.data as any;
        
        if ('stats' in innerData && 'recent_orders' in innerData) {
          console.log('✅ Dashboard data found in data.stats and data.recent_orders');
          setStats(innerData.stats as DashboardStats);
          setRecentOrders(Array.isArray(innerData.recent_orders) ? innerData.recent_orders : []);
          return;
        }
      }
      
      // Fallback: si les données sont directement à la racine (ancien format)
      if ('stats' in data && 'recent_orders' in data) {
        console.log('✅ Dashboard data found at root level');
        setStats((data as any).stats as DashboardStats);
        setRecentOrders(Array.isArray((data as any).recent_orders) ? (data as any).recent_orders : []);
        return;
      }
      
      console.error('❌ Unexpected response structure:', data);
      throw new Error('Structure de réponse inattendue');
      
    } catch (error: any) {
      console.error('=== DASHBOARD ERROR ===');
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground">Erreur de chargement des données</p>
        <button 
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const mainStats = [
    { 
      label: 'Utilisateurs', 
      value: stats.total_users.toLocaleString(), 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Commandes', 
      value: stats.total_orders.toLocaleString(), 
      icon: ShoppingCart, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      label: 'Total Dépôts', 
      value: `${(stats.total_deposits_fcfa / 1000000).toFixed(1)}M FCFA`, 
      icon: Wallet, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Points en circ.', 
      value: (stats.points_in_circulation / 1000000).toFixed(1) + 'M', 
      icon: TrendingUp, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
  ];

  const orderStats = [
    { 
      label: 'En attente', 
      value: stats.pending_orders, 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300' 
    },
    { 
      label: 'En cours', 
      value: stats.in_progress_orders, 
      icon: TrendingUp, 
      color: 'bg-blue-100 text-blue-700 border-blue-300' 
    },
    { 
      label: 'Terminées', 
      value: stats.completed_orders, 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-700 border-green-300' 
    },
    { 
      label: 'Tickets ouverts', 
      value: stats.open_tickets, 
      icon: MessageSquare, 
      color: 'bg-red-100 text-red-700 border-red-300' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Order stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat) => (
          <div key={stat.label} className={cn("rounded-2xl border p-4", stat.color)}>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/50")}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm bg-muted/50">
                <th className="text-left p-4 font-semibold text-foreground">Référence</th>
                <th className="text-left p-4 font-semibold text-foreground">Client</th>
                <th className="text-left p-4 font-semibold text-foreground">Service</th>
                <th className="text-left p-4 font-semibold text-foreground">Points</th>
                <th className="text-left p-4 font-semibold text-foreground">Statut</th>
                <th className="text-left p-4 font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => {
                const PlatformIcon = platformIcons[order.service.platform] || TikTokIcon;
                
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">{order.reference}</span>
                        {order.is_free_gift && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium border border-purple-300 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Cadeau
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">{order.user.prenom}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <PlatformIcon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{order.service.label}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">{order.points_spent}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", statusColors[order.status])}>
                        {order.status_label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {order.created_at}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {recentOrders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucune commande récente
          </div>
        )}
      </div>
    </div>
  );
}