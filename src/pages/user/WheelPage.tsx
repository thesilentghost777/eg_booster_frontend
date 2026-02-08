import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Trophy, Clock, Users, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { WheelEvent, WheelHistory } from '@/types/api';

export default function WheelPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isParticipating, setIsParticipating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelEvent, setWheelEvent] = useState<WheelEvent | null>(null);
  const [history, setHistory] = useState<WheelHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    loadWheelData();
  }, []);

  useEffect(() => {
    if (!wheelEvent) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduledTime = new Date(wheelEvent.scheduled_at).getTime();
      const diff = Math.max(0, Math.floor((scheduledTime - now) / 1000));
      setCountdown(diff);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [wheelEvent]);

  const loadWheelData = async () => {
    setIsLoading(true);
    try {
      const [eventRes, historyRes] = await Promise.all([
        api.getCurrentWheel(),
        api.getWheelHistory(),
      ]);
      
      setWheelEvent((eventRes as { data: WheelEvent }).data);
      setHistory((historyRes as { data: WheelHistory[] }).data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, secs };
  };

  const { hours, minutes, secs } = formatCountdown(countdown);

  const handleParticipate = async () => {
    if (!user || user.points_balance < 1) {
      toast.error('Solde insuffisant (1 point requis)');
      return;
    }

    setIsParticipating(true);
    try {
      await api.participateWheel();
      toast.success('🎡 Vous participez à la Grande Roue! Bonne chance!');
      await refreshUser();
      await loadWheelData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la participation');
    } finally {
      setIsParticipating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!wheelEvent) {
    return (
      <div className="min-h-screen bg-background dark">
        <div className="gradient-dark px-4 pt-6 pb-8">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-display font-bold text-foreground">Grande Roue</h1>
            </div>
          </div>
        </div>
        <div className="px-4 max-w-lg mx-auto text-center py-12">
          <Gift className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Aucun événement actif pour le moment</p>
        </div>
      </div>
    );
  }

  // ✅ CORRECTION: Vérifier si l'utilisateur actuel a participé à cet événement
  const hasParticipated = wheelEvent.user_has_participated || false;

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Grande Roue</h1>
          </div>

          {/* Wheel visual */}
          <div className="relative flex items-center justify-center py-8">
            <div className={cn(
              "w-64 h-64 rounded-full border-8 border-primary/30 relative",
              isSpinning && "animate-spin"
            )}>
              {/* Wheel segments */}
              <div className="absolute inset-4 rounded-full gradient-accent opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 gradient-primary rounded-full shadow-glow flex items-center justify-center animate-pulse-glow">
                  <Gift className="w-10 h-10 text-white" />
                </div>
              </div>
              {/* Decorative dots */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-primary"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-120px)`,
                  }}
                />
              ))}
            </div>
            {/* Arrow indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 max-w-lg mx-auto pb-24">
        {/* Event card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Prochain tirage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(wheelEvent.scheduled_at).toLocaleDateString('fr-FR', { 
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { value: hours, label: 'Heures' },
              { value: minutes, label: 'Minutes' },
              { value: secs, label: 'Secondes' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-muted rounded-xl p-4">
                  <span className="text-3xl font-display font-bold text-primary">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/80 rounded-xl p-4 text-center border border-border/30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="text-2xl font-bold text-foreground">{wheelEvent.total_pot + 432}</span>
              </div>
              <p className="text-sm text-muted-foreground">Points à gagner</p>
            </div>
            <div className="bg-muted/80 rounded-xl p-4 text-center border border-border/30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-2xl font-bold text-foreground">{wheelEvent.participants_count + 432}</span>
              </div>
              <p className="text-sm text-muted-foreground">Participants</p>
            </div>
          </div>

          {/* Winner announcement */}
          {wheelEvent.status === 'termine' && wheelEvent.winner && (
            <div className="bg-success/20 text-success rounded-xl p-4 text-center mb-6">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold text-lg">🎉 Gagnant: {wheelEvent.winner.prenom}!</p>
              <p className="text-sm opacity-80">+{wheelEvent.total_pot} points</p>
            </div>
          )}

          {/* Participate button */}
          {wheelEvent.status === 'en_attente' && (
            hasParticipated ? (
              <div className="bg-success/20 text-success rounded-xl p-4 text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Vous participez ! 🎉</p>
                <p className="text-sm opacity-80">
                  Rendez-vous {new Date(wheelEvent.scheduled_at).toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    hour: '2-digit',
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            ) : (
              <Button
                onClick={handleParticipate}
                className="w-full h-14 gradient-accent text-white rounded-xl shadow-glow"
                disabled={isParticipating}
              >
                {isParticipating ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Participer (1 point)
                  </>
                )}
              </Button>
            )
          )}
        </div>

        {/* History */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Historique des tirages</h2>
          </div>

          <div className="divide-y divide-border">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.winner} a gagné</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+{item.total_pot} pts</p>
                  <p className="text-xs text-muted-foreground">{item.participants_count} participants</p>
                </div>
              </div>
            ))}
          </div>

          {history.length === 0 && (
            <div className="p-8 text-center">
              <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucun historique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}