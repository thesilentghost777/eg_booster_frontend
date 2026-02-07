import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MoreVertical, Power, PowerOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface Service {
  id: number;
  platform: Platform;
  service_type: string;
  label: string;
  quantity: number;
  price_points: number;
  price_fcfa: number;
  description: string;
  is_active: boolean;
  sort_order?: number;
}
const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];
const serviceTypes = ['vues', 'likes', 'abonnes', 'subscribers', 'partages', 'commentaires', 'spectateurs', 'reactions', 'membres'];
export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'tiktok' as Platform,
    service_type: 'vues',
    label: '',
    quantity: '',
    price_points: '',
    description: '',
  });
  useEffect(() => {
    loadServices();
  }, []);
  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.adminGetServices();
      setServices(response.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      platform: 'tiktok',
      service_type: 'vues',
      label: '',
      quantity: '',
      price_points: '',
      description: '',
    });
    setEditingService(null);
  };
  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        platform: service.platform,
        service_type: service.service_type,
        label: service.label,
        quantity: service.quantity?.toString() || '',
        price_points: service.price_points?.toString() || '',
        description: service.description || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };
  const handleSave = async () => {
    if (!formData.label || !formData.quantity || !formData.price_points) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsProcessing(true);
    try {
      if (editingService) {
        await api.adminUpdateService(editingService.id, {
          ...formData,
          quantity: parseInt(formData.quantity),
          price_points: parseInt(formData.price_points),
        });
        toast.success('Service mis à jour');
      } else {
        await api.adminCreateService({
          ...formData,
          quantity: parseInt(formData.quantity),
          price_points: parseInt(formData.price_points),
        });
        toast.success('Service créé');
      }
     
      await loadServices();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleToggleActive = async (service: Service) => {
    try {
      await api.adminUpdateService(service.id, { is_active: !service.is_active });
      await loadServices();
      toast.success(service.is_active ? 'Service désactivé' : 'Service activé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };
  const handleDelete = async (service: Service) => {
    if (!confirm('Supprimer ce service ?')) return;
   
    try {
      await api.adminDeleteService(service.id);
      await loadServices();
      toast.success('Service supprimé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.platform]) acc[service.platform] = [];
    acc[service.platform].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground">Gérez le catalogue de services</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>
      {/* Services by platform */}
      {platforms.map(platform => {
        const platformServices = groupedServices[platform.value];
        if (!platformServices?.length) return null;
        return (
          <div key={platform.value} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/50">
              <span className="text-2xl">{platform.icon}</span>
              <h2 className="font-semibold text-foreground">{platform.label}</h2>
              <span className="text-sm text-muted-foreground">({platformServices.length})</span>
            </div>
            <div className="divide-y divide-border">
              {platformServices.map(service => (
                <div
                  key={service.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                    !service.is_active && "opacity-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{service.label || 'Sans nom'}</p>
                      {!service.is_active && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium border border-gray-300">
                          Désactivé
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{service.description || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-purple-600">{service.price_points || 0} pts</p>
                    <p className="text-sm text-muted-foreground">
                      {service.quantity?.toLocaleString() || 0} {service.service_type || ''}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover text-foreground border-border">
                      <DropdownMenuItem onClick={() => handleOpenDialog(service)} className="cursor-pointer">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(service)} className="cursor-pointer">
                        {service.is_active ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-2" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(service)} className="text-red-600 cursor-pointer">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingService ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
          </DialogHeader>
         
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground font-medium">Plateforme</Label>
                <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}>
                  <SelectTrigger className="mt-2 bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground">
                    {platforms.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="mr-2">{p.icon}</span>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground font-medium">Type de service</Label>
                <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                  <SelectTrigger className="mt-2 bg-background text-foreground border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground">
                    {serviceTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-foreground font-medium">Nom du service *</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: 5000 Vues TikTok"
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground font-medium">Quantité *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="5000"
                  className="mt-2 bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label className="text-foreground font-medium">Prix (points) *</Label>
                <Input
                  type="number"
                  value={formData.price_points}
                  onChange={(e) => setFormData({ ...formData, price_points: e.target.value })}
                  placeholder="500"
                  className="mt-2 bg-background text-foreground border-border"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground font-medium">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du service..."
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 border-border text-foreground" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="flex-1 gradient-primary text-white" onClick={handleSave} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  editingService ? 'Enregistrer' : 'Créer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// API client pour EG Booster
const API_BASE_URL = 'http://127.0.0.1:8000/api/egbooster';
class ApiClient {
  private token: string | null = null;
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('eg_token', token);
    } else {
      localStorage.removeItem('eg_token');
    }
  }
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('eg_token');
    }
    return this.token;
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };
    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }
    return data;
  }
  // Auth
  async register(data: {
    prenom: string;
    telephone: string;
    code_pin: string;
    code_pin_confirmation: string;
    email?: string;
    referral_code?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async login(telephone: string, code_pin: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ telephone, code_pin }),
    });
  }
  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }
  async getProfile() {
    return this.request('/auth/profile');
  }
  async updateProfile(data: { prenom?: string; email?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async updatePin(current_pin: string, new_pin: string, new_pin_confirmation: string) {
    return this.request('/auth/pin', {
      method: 'PUT',
      body: JSON.stringify({ current_pin, new_pin, new_pin_confirmation }),
    });
  }
  async getDefaultReferral() {
    return this.request('/auth/default-referral');
  }
  // Services
  async getServices(platform?: string) {
    const query = platform ? `?platform=${platform}` : '';
    return this.request(`/services${query}`);
  }
  async adminGetServices() {
    return this.request('/admin/services');
  }
  async getPlatforms() {
    return this.request('/services/platforms');
  }
  async getService(id: number) {
    return this.request(`/services/${id}`);
  }
  // Orders
  async createOrder(service_id: number, link: string, quantity: number = 1) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({ service_id, link, quantity }),
    });
  }
  async claimFreeViews(link: string) {
    return this.request('/orders/free-views', {
      method: 'POST',
      body: JSON.stringify({ link }),
    });
  }
  async getOrders(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/orders${query}`);
  }
  async getOrder(reference: string) {
    return this.request(`/orders/${reference}`);
  }
  // Wallet
  async getBalance() {
    return this.request('/wallet/balance');
  }
  async deposit(amount_fcfa: number, payment_method: string, payment_reference: string) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount_fcfa, payment_method, payment_reference }),
    });
  }
  async getTransactions(type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/wallet/transactions${query}`);
  }
  // Transfer
  async findRecipient(telephone: string) {
    return this.request('/transfer/find-recipient', {
      method: 'POST',
      body: JSON.stringify({ telephone }),
    });
  }
  async sendTransfer(recipient_telephone: string, points: number) {
    return this.request('/transfer/send', {
      method: 'POST',
      body: JSON.stringify({ recipient_telephone, points }),
    });
  }
  async getTransferHistory() {
    return this.request('/transfer/history');
  }
  // Referral
  async getReferralStats() {
    return this.request('/referral/stats');
  }
  async getFilleuls() {
    return this.request('/referral/filleuls');
  }
  async getShareLink() {
    return this.request('/referral/share-link');
  }
  // Wheel
  async getCurrentWheel() {
    return this.request('/wheel/current');
  }
  async participateWheel() {
    return this.request('/wheel/participate', { method: 'POST' });
  }
  async getWheelHistory() {
    return this.request('/wheel/history');
  }
  // Support
  async getWhatsappNumber() {
    return this.request('/support/whatsapp');
  }
  async createTicket(subject: string, message: string) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  }
  async getTickets() {
    return this.request('/support/tickets');
  }
  async getTicketMessages(reference: string) {
    return this.request(`/support/tickets/${reference}/messages`);
  }
  async replyTicket(reference: string, message: string) {
    return this.request(`/support/tickets/${reference}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
  // Admin endpoints
  async adminGetDashboard() {
    return this.request('/admin/dashboard');
  }
  async adminGetOrders(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/orders${query}`);
  }
  async adminGetOrder(id: number) {
    return this.request(`/admin/orders/${id}`);
  }
  async adminUpdateOrderStatus(id: number, status: string, admin_notes?: string) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  }
  async adminGetUsers(blocked?: boolean) {
    const query = blocked !== undefined ? `?blocked=${blocked ? 1 : 0}` : '';
    return this.request(`/admin/users${query}`);
  }
  async adminGetUser(id: number) {
    return this.request(`/admin/users/${id}`);
  }
  async adminToggleBlockUser(id: number) {
    return this.request(`/admin/users/${id}/toggle-block`, { method: 'POST' });
  }
  async adminCreditUser(id: number, points: number, description: string) {
    return this.request(`/admin/users/${id}/credit`, {
      method: 'POST',
      body: JSON.stringify({ points, description }),
    });
  }
  async adminCreateService(data: {
    platform: string;
    service_type: string;
    label: string;
    quantity: number;
    price_points: number;
    description: string;
    sort_order?: number;
  }) {
    return this.request('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async adminUpdateService(id: number, data: Partial<{
    platform: string;
    service_type: string;
    label: string;
    quantity: number;
    price_points: number;
    description: string;
    is_active: boolean;
    sort_order: number;
  }>) {
    return this.request(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async adminDeleteService(id: number) {
    return this.request(`/admin/services/${id}`, { method: 'DELETE' });
  }
  async adminGetWheelEvents() {
    return this.request('/admin/wheel/events');
  }
  async adminCreateWheelEvent(scheduled_at: string) {
    return this.request('/admin/wheel/events', {
      method: 'POST',
      body: JSON.stringify({ scheduled_at }),
    });
  }
  async adminDrawWheel(eventId: number, winner_id?: number) {
    return this.request(`/admin/wheel/events/${eventId}/draw`, {
      method: 'POST',
      body: winner_id ? JSON.stringify({ winner_id }) : undefined,
    });
  }
  async adminGetSettings() {
    return this.request('/admin/settings');
  }
  async adminUpdateSettings(settings: { key: string; value: string }[]) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }
  async adminGetTickets(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/support/tickets${query}`);
  }
  async adminGetTicket(reference: string) {
    return this.request(`/admin/support/tickets/${reference}`);
  }
  async adminReplyTicket(reference: string, message: string) {
    return this.request(`/admin/support/tickets/${reference}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
  async adminCloseTicket(reference: string) {
    return this.request(`/admin/support/tickets/${reference}/close`, { method: 'POST' });
  }
}
export const api = new ApiClient();
// Types pour l'API EG Booster
export interface User {
  id: number;
  prenom: string;
  telephone: string;
  email?: string;
  points_balance: number;
  referral_code: string;
  free_views_claimed: boolean;
  inscrit_le: string;
  is_admin?: boolean;
  is_blocked?: boolean;
}
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    free_views_available: boolean;
  };
}
export interface Service {
  id: number;
  platform: Platform;
  service_type: string;
  label: string;
  quantity: number;
  price_points: number;
  price_fcfa?: number;
  description: string;
  is_active?: boolean;
  sort_order?: number;
}
export interface ServiceGroup {
  platform: Platform;
  icon: string;
  services: Service[];
}
export type Platform = 'tiktok' | 'facebook' | 'youtube' | 'instagram' | 'whatsapp';
export interface PlatformInfo {
  name: Platform;
  icon: string;
  label: string;
}
export interface Order {
  id: number;
  reference: string;
  service: {
    platform: Platform;
    label: string;
    service_type: string;
  };
  link: string;
  quantity: number;
  points_spent: number;
  status: OrderStatus;
  status_label: string;
  is_free_gift: boolean;
  admin_notes?: string;
  created_at: string;
  user?: {
    id: number;
    prenom: string;
    telephone: string;
  };
}
export type OrderStatus = 'en_attente' | 'en_cours' | 'termine' | 'annule';
export interface Transaction {
  id: number;
  type: 'depot' | 'achat' | 'transfert_entrant' | 'transfert_sortant' | 'bonus' | 'gain_roue';
  type_label: string;
  amount_fcfa?: number;
  points: number;
  balance_before: number;
  balance_after: number;
  reference: string;
  description: string;
  created_at: string;
}
export interface Transfer {
  reference: string;
  direction: 'envoyé' | 'reçu';
  contact: string;
  points: number;
  fees: number;
  date: string;
}
export interface ReferralStats {
  code: string;
  total_filleuls: number;
  filleuls_avec_depot: number;
  filleuls_sans_depot: number;
  total_points_gagnes: number;
}
export interface Filleul {
  id: number;
  prenom: string;
  telephone: string;
  inscrit_le: string;
  a_depose: boolean;
  points_gagnes: number;
}
export interface WheelEvent {
  id: number;
  scheduled_at: string;
  total_pot: number;
  participants_count: number;
  status: 'en_attente' | 'en_cours' | 'termine';
  countdown_seconds?: number;
  winner?: { id: number; prenom: string };
  is_manual?: boolean;
}
export interface WheelHistory {
  id: number;
  date: string;
  total_pot: number;
  participants_count: number;
  winner: string;
}
export interface Ticket {
  reference: string;
  subject: string;
  status: 'ouvert' | 'en_cours' | 'ferme';
  last_message?: string;
  last_message_from?: 'user' | 'admin';
  updated_at: string;
}
export interface TicketMessage {
  id: number;
  sender_type: 'user' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
}
export interface AdminDashboard {
  total_users: number;
  active_users: number;
  blocked_users: number;
  total_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  total_deposits_fcfa: number;
  total_points_in_circulation: number;
  open_tickets: number;
  recent_orders: Order[];
}
export interface AdminUser extends User {
  device_fingerprint?: string;
  ip_address?: string;
  orders_count: number;
  referrals_count: number;
  orders?: Order[];
}
export interface Setting {
  key: string;
  value: string;
  label: string;
}
export interface SettingsGroup {
  referral: Setting[];
  wallet: Setting[];
  gift: Setting[];
  wheel: Setting[];
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
}