import React, { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, RefreshCw, Loader2, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { OrderStatus } from '@/types/api';

interface Order {
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
  status: OrderStatus;
  status_label: string;
  is_free_gift: boolean;
  created_at: string;
  admin_notes?: string;
  user: {
    id: number;
    prenom: string;
    telephone: string;
  };
}

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  facebook: '📘',
  youtube: '▶️',
  instagram: '📸',
  whatsapp: '💬',
};

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  en_cours: 'bg-blue-100 text-blue-700 border-blue-300',
  termine: 'bg-green-100 text-green-700 border-green-300',
  annule: 'bg-red-100 text-red-700 border-red-300',
};

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'en_attente', label: '⏳ En attente' },
  { value: 'en_cours', label: '🔄 En cours' },
  { value: 'termine', label: '✅ Terminé' },
  { value: 'annule', label: '❌ Annulé' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.adminGetOrders();
      
      console.log('Raw API response:', response);
      
      // 🔧 FIX: Extraction robuste des données
      let ordersArray: Order[] = [];
      
      if (!response) {
        console.error('Response is null or undefined');
        ordersArray = [];
      } else if (Array.isArray(response)) {
        // Si la réponse est directement un tableau
        ordersArray = response;
      } else if (response && typeof response === 'object') {
        // Si c'est un objet, chercher le tableau de commandes
        const data = (response as { [key: string]: any }).data;
        if (Array.isArray(data)) {
          ordersArray = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          // Cas de pagination Laravel
          ordersArray = data.data;
        } else if (data && typeof data === 'object') {
          // Cas où data est un objet avec une propriété contenant les commandes
          const possibleKeys = ['orders', 'items', 'results'];
          for (const key of possibleKeys) {
            if (Array.isArray(data[key])) {
              ordersArray = data[key];
              break;
            }
          }
        }
      }
      
      console.log('Extracted orders:', ordersArray);
      console.log('Orders count:', ordersArray.length);
      
      // Valider que chaque élément a les propriétés requises
      const validOrders = ordersArray.filter(order => {
        const isValid = order && 
          typeof order.id === 'number' && 
          typeof order.reference === 'string' &&
          order.service &&
          order.user;
        
        if (!isValid) {
          console.warn('Invalid order found:', order);
        }
        
        return isValid;
      });
      
      console.log('Valid orders count:', validOrders.length);
      
      setOrders(validOrders);
      
      if (validOrders.length === 0) {
        toast.info('Aucune commande trouvée dans la base de données');
      }
      
    } catch (error: any) {
      console.error('Error loading orders:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      toast.error(error.message || 'Erreur lors du chargement des commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchQuery || 
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.prenom.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      await api.adminUpdateOrderStatus(selectedOrder.id, newStatus, adminNotes);
      
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              status: newStatus, 
              status_label: statusOptions.find(s => s.value === newStatus)?.label || '', 
              admin_notes: adminNotes 
            }
          : o
      ));
      
      toast.success('Statut mis à jour');
      setSelectedOrder(null);
      setNewStatus('');
      setAdminNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez toutes les commandes ({orders.length} total{orders.length > 1 ? 's' : ''})
          </p>
        </div>
        <Button 
          onClick={loadOrders}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-background text-foreground border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48 h-11 bg-background text-foreground border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent className="bg-popover text-foreground">
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statusOptions.map(status => (
              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
<div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-sm bg-muted/50">
          <th className="text-left p-4 font-semibold text-foreground">Référence</th>
          <th className="text-left p-4 font-semibold text-foreground">Client</th>
          <th className="text-left p-4 font-semibold text-foreground">Service</th>
          <th className="text-left p-4 font-semibold text-foreground">Lien</th>
          <th className="text-left p-4 font-semibold text-foreground">Points</th>
          <th className="text-left p-4 font-semibold text-foreground">Statut</th>
          <th className="text-left p-4 font-semibold text-foreground">Date</th>
          <th className="text-left p-4 font-semibold text-foreground">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {filteredOrders.map((order) => (
          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
            <td className="p-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground">{order.reference}</span>
                {order.is_free_gift && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium border border-purple-300">🎁</span>
                )}
              </div>
            </td>
            <td className="p-4">
              <div>
                <p className="font-medium text-foreground">{order.user.prenom}</p>
                <p className="text-sm text-muted-foreground">{order.user.telephone}</p>
              </div>
            </td>
            <td className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{platformIcons[order.service.platform] || '📱'}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{order.service.label}</p>
                  <p className="text-xs text-muted-foreground">{order.quantity.toLocaleString()} {order.service.service_type}</p>
                </div>
              </div>
            </td>
            <td className="p-4">
              <div className="flex items-center gap-2">
                <a 
                  href={order.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span className="max-w-[150px] truncate">{order.link}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(order.link);
                    // Optionnel: ajouter un toast de confirmation
                  }}
                  className="p-1 h-auto hover:bg-muted"
                  title="Copier le lien"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            </td>
            <td className="p-4">
              <span className="font-medium text-foreground">{order.points_spent}</span>
            </td>
            <td className="p-4">
              <span className={cn("px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border", statusColors[order.status])}>
                {order.status_label}
              </span>
            </td>
            <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
              {order.created_at}
            </td>
            <td className="p-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedOrder(order);
                  setNewStatus(order.status);
                  setAdminNotes(order.admin_notes || '');
                }}
                className="text-foreground hover:bg-muted"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {filteredOrders.length === 0 && (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">
        {orders.length === 0 
          ? 'Aucune commande dans la base de données' 
          : 'Aucune commande ne correspond aux filtres'}
      </p>
    </div>
  )}
</div>

      {/* Update status dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mettre à jour la commande</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="font-mono text-sm mb-2 text-foreground">{selectedOrder.reference}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.service.label} pour {selectedOrder.user.prenom}</p>
              </div>

              <div>
                <Label className="text-foreground font-medium">Nouveau statut</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger className="mt-2 h-11 bg-background text-foreground border-border">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground">
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground font-medium">Notes admin (optionnel)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes internes..."
                  className="mt-2 bg-background text-foreground border-border"
                />
              </div>

              {newStatus === 'annule' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
                  <p className="text-red-700 font-semibold">⚠️ Attention</p>
                  <p className="text-red-600 mt-1">Les points seront automatiquement remboursés au client.</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground"
                  onClick={() => setSelectedOrder(null)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 gradient-primary text-white"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || !newStatus}
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Mettre à jour'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}