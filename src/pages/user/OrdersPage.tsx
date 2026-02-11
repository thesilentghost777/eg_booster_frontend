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

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }> = {
  en_attente: { icon: Clock, label: 'En attente', color: 'text-orange-600', bg: 'bg-orange-50' },
  en_cours: { icon: RefreshCw, label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-50' },
  termine: { icon: CheckCircle, label: 'Terminé', color: 'text-green-600', bg: 'bg-green-50' },
  annule: { icon: XCircle, label: 'Annulé', color: 'text-red-600', bg: 'bg-red-50' },
};

const filters = [
  { key: 'all', label: 'Tout' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'termine', label: 'Terminé' },
  { key: 'annule', label: 'Annulé' },
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Mes commandes</h1>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              variant="ghost"
              size="sm"
              className={cn(
                "px-4 h-9 rounded-full font-medium whitespace-nowrap transition-colors text-sm flex-shrink-0",
                activeFilter === filter.key
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const PlatformIcon = platformIcons[order.service.platform];
            const progress = order.status === 'en_cours' ? Math.floor(Math.random() * 100) : 0;

            return (
              <div key={order.id} className="bg-gray-50 rounded-2xl p-4 space-y-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    {PlatformIcon && <PlatformIcon className="w-5 h-5 text-gray-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{order.service.label}</h3>
                    <p className="text-xs text-gray-500 truncate">{order.link}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5", config.bg, config.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                </div>

                {order.status === 'en_cours' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {order.admin_notes && (
                  <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">{order.admin_notes}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </span>
                  {order.is_free_gift && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">🎁 Cadeau</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-16">
            <Eye className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Aucune commande trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}