import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Ticket {
  reference: string;
  subject: string;
  status: 'ouvert' | 'en_cours' | 'ferme';
  last_message: string;
  last_message_from: 'user' | 'admin';
  updated_at: string;
  user: {
    prenom: string;
    telephone: string;
  };
}

interface TicketMessage {
  id: number;
  sender_type: 'user' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  ouvert: 'bg-red-100 text-red-700 border-red-300',
  en_cours: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  ferme: 'bg-gray-200 text-gray-600 border-gray-300',
};

const statusLabels: Record<string, string> = {
  ouvert: '🔴 Ouvert',
  en_cours: '🟡 En cours',
  ferme: '✅ Fermé',
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetTickets() as { data: Ticket[] };
      setTickets(data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setLoadingMessages(true);
    try {
      const data = await api.adminGetTicket(ticket.reference) as { messages: TicketMessage[] };
      setMessages(data.messages || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setIsSending(true);
    try {
      await api.adminReplyTicket(selectedTicket.reference, replyText);
      
      const newMessage: TicketMessage = {
        id: Date.now(),
        sender_type: 'admin',
        message: replyText,
        is_read: false,
        created_at: 'À l\'instant',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setReplyText('');
      
      // Reload tickets to update status
      await loadTickets();
      
      toast.success('Message envoyé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      await api.adminCloseTicket(selectedTicket.reference);
      await loadTickets();
      setSelectedTicket(null);
      toast.success('Ticket fermé');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { 
      label: 'Ouverts', 
      value: tickets.filter(t => t.status === 'ouvert').length, 
      color: 'text-red-600' 
    },
    { 
      label: 'En cours', 
      value: tickets.filter(t => t.status === 'en_cours').length, 
      color: 'text-yellow-600' 
    },
    { 
      label: 'Fermés', 
      value: tickets.filter(t => t.status === 'ferme').length, 
      color: 'text-gray-600' 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Support</h1>
        <p className="text-muted-foreground">Gérez les tickets de support</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center shadow-sm">
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {tickets.map((ticket) => (
            <button
              key={ticket.reference}
              onClick={() => handleOpenTicket(ticket)}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                ticket.status === 'ouvert' ? "bg-red-100" : "bg-muted"
              )}>
                <MessageSquare className={cn(
                  "w-5 h-5",
                  ticket.status === 'ouvert' ? "text-red-600" : "text-muted-foreground"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{ticket.reference}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", statusColors[ticket.status])}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>
                <p className="font-medium mt-1 text-foreground">{ticket.subject}</p>
                <p className="text-sm text-muted-foreground truncate">{ticket.last_message}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">{ticket.user.prenom}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ticket.updated_at}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {tickets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucun ticket
          </div>
        )}
      </div>

      {/* Ticket detail dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-foreground">
              <span>Ticket {selectedTicket?.reference}</span>
              {selectedTicket?.status !== 'ferme' && (
                <Button variant="ghost" size="sm" onClick={handleCloseTicket} className="text-foreground hover:bg-muted">
                  <X className="w-4 h-4 mr-1" />
                  Fermer
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex flex-col flex-1 min-h-0 mt-4">
              <div className="bg-muted/50 rounded-xl p-3 mb-4 border border-border">
                <p className="font-medium text-foreground">{selectedTicket.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.user.prenom} • {selectedTicket.user.telephone}
                </p>
              </div>

              {/* Messages */}
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] p-3 rounded-xl",
                        msg.sender_type === 'admin' 
                          ? "ml-auto bg-purple-600 text-white" 
                          : "bg-muted/70 border border-border"
                      )}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender_type === 'admin' ? "text-purple-200" : "text-muted-foreground"
                      )}>
                        {msg.created_at}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {selectedTicket.status !== 'ferme' && (
                <div className="flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Votre réponse..."
                    className="resize-none bg-background text-foreground border-border"
                    rows={2}
                  />
                  <Button 
                    className="gradient-primary text-white"
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}