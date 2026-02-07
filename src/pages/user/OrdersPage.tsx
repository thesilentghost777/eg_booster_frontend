import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Eye, Clock, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types/api';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: FaTiktok,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
};

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  en_attente: { icon: Clock, label: 'En attente', color: 'bg-warning/20 text-warning border-warning/30' },
  en_cours: { icon: RefreshCw, label: 'En cours', color: 'bg-secondary/20 text-secondary border-secondary/30' },
  termine: { icon: CheckCircle, label: 'Terminé', color: 'bg-success/20 text-success border-success/30' },
  annule: { icon: XCircle, label: 'Annulé', color: 'bg-destructive/20 text-destructive border-destructive/30' },
};

const filters = [
  { key: 'all', label: 'Tout' },
  { key: 'en_attente', label: '⏳ Attente' },
  { key: 'en_cours', label: '🔄 En cours' },
  { key: 'termine', label: '✅ Terminé' },
  { key: 'annule', label: '❌ Annulé' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.getOrders();
      if ((response as any).success && (response as any).data) {
        setOrders((response as any).data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = !searchQuery || order.service.label.toLowerCase().includes(searchQuery.toLowerCase()) || order.link?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Mes Commandes</h1>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-card/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              variant="ghost"
              size="sm"
              className={cn(
                "px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all text-sm h-auto flex-shrink-0",
                activeFilter === filter.key
                  ? "gradient-primary text-white shadow-md"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 pb-safe space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const PlatformIcon = platformIcons[order.service.platform];
            const progress = order.status === 'en_cours' ? Math.floor(Math.random() * 100) : 0;

            return (
              <div key={order.id} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    {PlatformIcon && <PlatformIcon className="w-5 h-5 text-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{order.service.label}</h3>
                    <p className="text-xs text-muted-foreground truncate">{order.link}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 border", config.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>

                {order.status === 'en_cours' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {order.admin_notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">{order.admin_notes}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </span>
                  {order.is_free_gift && (
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">🎁 Cadeau</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-16">
            <Eye className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Aucune commande trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
