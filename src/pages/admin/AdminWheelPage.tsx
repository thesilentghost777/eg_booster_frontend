import React, { useState, useEffect } from 'react';
import { Plus, Gift, Trophy, Users, Play, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface WheelEvent {
  id: number;
  scheduled_at: string;
  total_pot: number;
  participants_count: number;
  status: 'en_attente' | 'en_cours' | 'termine';
  winner?: {
    id: number;
    prenom: string;
  };
  participations?: {
    user_id: number;
    prenom: string;
  }[];
}

const statusColors: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  en_cours: 'bg-blue-100 text-blue-700 border-blue-300',
  termine: 'bg-green-100 text-green-700 border-green-300',
};

const statusLabels: Record<string, string> = {
  en_attente: '⏳ En attente',
  en_cours: '🎡 En cours',
  termine: '✅ Terminé',
};

export default function AdminWheelPage() {
  const [events, setEvents] = useState<WheelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WheelEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.adminGetWheelEvents() as { data: WheelEvent[] };
      setEvents(data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    setIsProcessing(true);
    try {
      await api.adminCreateWheelEvent(newEventDate);
      await loadEvents();
      toast.success('Événement créé');
      setCreateDialogOpen(false);
      setNewEventDate('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDraw = async (manual: boolean = false) => {
    if (!selectedEvent) return;
    if (manual && !selectedWinnerId) {
      toast.error('Veuillez sélectionner un gagnant');
      return;
    }

    setIsProcessing(true);
    try {
      const winner_id = manual ? parseInt(selectedWinnerId) : undefined;
      await api.adminDrawWheel(selectedEvent.id, winner_id);
      
      await loadEvents();
      
      const winner = manual 
        ? selectedEvent.participations?.find(p => p.user_id.toString() === selectedWinnerId)
        : null;

      toast.success(`🎉 ${winner?.prenom || 'Le gagnant'} a remporté ${selectedEvent.total_pot} points!`);
      setDrawDialogOpen(false);
      setSelectedEvent(null);
      setSelectedWinnerId('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Grande Roue</h1>
          <p className="text-muted-foreground">Gérez les tirages au sort</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau tirage
        </Button>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                  event.status === 'termine' ? "bg-green-100" : "bg-purple-100"
                )}>
                  {event.status === 'termine' ? (
                    <Trophy className="w-7 h-7 text-green-600" />
                  ) : (
                    <Gift className="w-7 h-7 text-purple-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{formatDate(event.scheduled_at)}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.participants_count} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {event.total_pot} pts
                    </span>
                  </div>
                  {event.winner && (
                    <p className="text-green-600 font-medium mt-1">
                      🏆 Gagnant: {event.winner.prenom}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  statusColors[event.status]
                )}>
                  {statusLabels[event.status]}
                </span>

                {event.status === 'en_attente' && event.participants_count > 0 && (
                  <Button 
                    size="sm"
                    className="gradient-primary text-white"
                    onClick={() => {
                      setSelectedEvent(event);
                      setDrawDialogOpen(true);
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Tirer
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Aucun tirage programmé</p>
          </div>
        )}
      </div>

      {/* Create event dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Créer un nouveau tirage</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-foreground font-medium">Date et heure du tirage</Label>
              <Input
                type="datetime-local"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="mt-2 h-11 bg-background text-foreground border-border"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-border text-foreground" 
                onClick={() => setCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={handleCreateEvent} 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Créer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw dialog */}
      <Dialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Effectuer le tirage</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center border border-border">
                <p className="text-4xl font-display font-bold text-purple-600">{selectedEvent.total_pot}</p>
                <p className="text-muted-foreground font-medium">points à distribuer</p>
                <p className="text-sm mt-2 text-foreground">{selectedEvent.participants_count} participants</p>
              </div>

              <div>
                <Label className="text-foreground font-medium">Choisir manuellement (optionnel)</Label>
                <Select value={selectedWinnerId} onValueChange={setSelectedWinnerId}>
                  <SelectTrigger className="mt-2 h-11 bg-background text-foreground border-border">
                    <SelectValue placeholder="Tirage aléatoire" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground">
                    <SelectItem value="">Tirage aléatoire</SelectItem>
                    {selectedEvent.participations?.map(p => (
                      <SelectItem key={p.user_id} value={p.user_id.toString()}>
                        {p.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border text-foreground" 
                  onClick={() => setDrawDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" 
                  onClick={() => handleDraw(!!selectedWinnerId)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      {selectedWinnerId ? 'Attribuer' : 'Tirer au sort'}
                    </>
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