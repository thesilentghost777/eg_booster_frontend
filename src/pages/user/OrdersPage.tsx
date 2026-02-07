import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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

const statusConfig = {
  en_attente: { icon: Clock, label: 'En attente', color: 'bg-warning/20 text-warning border-warning/30' },
  en_cours: { icon: RefreshCw, label: 'En cours', color: 'bg-secondary/20 text-secondary border-secondary/30' },
  termine: { icon: CheckCircle, label: 'Terminé', color: 'bg-success/20 text-success border-success/30' },
  annule: { icon: XCircle, label: 'Annulé', color: 'bg-destructive/20 text-destructive border-destructive/30' },
};

const filters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'termine', label: 'Terminées' },
  { key: 'annule', label: 'Annulées' },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [activeFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.getOrders(activeFilter === 'all' ? undefined : activeFilter);
      setOrders((response as { data: Order[] }).data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.service.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.link.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Mes Commandes</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-card/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all text-sm",
                activeFilter === filter.key
                  ? "gradient-primary text-white shadow-glow"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const PlatformIcon = platformIcons[order.service.platform];
              
              // Calculate progress for in-progress orders
              const progress = order.status === 'en_cours' ? Math.floor(Math.random() * 100) : 0;

              return (
                <div 
                  key={order.id}
                  className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {PlatformIcon && <PlatformIcon className="w-7 h-7 text-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">{order.service.label}</h3>
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 flex-shrink-0",
                          statusConfig[order.status].color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{order.link}</p>
                      
                      {/* Progress bar for active orders */}
                      {order.status === 'en_cours' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="text-foreground font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-secondary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Admin notes if any */}
                      {order.admin_notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">{order.admin_notes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('fr-FR')}</p>
                        {order.is_free_gift && (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full font-medium">
                            🎁 Cadeau
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}