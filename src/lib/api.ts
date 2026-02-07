// API client pour EG Booster

const API_BASE_URL = 'http://192.168.1.166:8000/api/egbooster';

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

  // MODIFIÉ: Nouveau format pour Freemopay avec numéro de téléphone
  async deposit(amount_fcfa: number, payment_method: string, phone_number: string) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount_fcfa, payment_method, phone_number }),
    });
  }

  // NOUVEAU: Vérifier le statut d'un paiement
  async checkPaymentStatus(externalId: string) {
    return this.request(`/wallet/payment/${externalId}/status`);
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