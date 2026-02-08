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
  price_fcfa: number;
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
  type: 'depot' | 'achat' | 'transfert_recu' | 'transfert_envoye' | 'bonus_parrainage' | 'gain_roue' | 'frais_transfert' | 'cadeau_bienvenue' | 'participation_roue';
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
  user_has_participated: boolean; // ✅ AJOUTÉ
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