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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!wheelEvent) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
          <div className="px-4 pt-6 pb-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900" />
                </button>
                <h1 className="text-[22px] font-semibold text-gray-900">Grande Roue</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 max-w-2xl mx-auto text-center py-20">
          <Gift className="w-16 h-16 mx-auto text-gray-200 mb-4" />
          <p className="text-[15px] text-gray-400">Aucun événement actif</p>
        </div>
      </div>
    );
  }

  const hasParticipated = wheelEvent.user_has_participated || false;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="px-4 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h1 className="text-[22px] font-semibold text-gray-900">Grande Roue</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Wheel visual */}
        <div className="relative flex items-center justify-center py-8">
          <div className={cn(
            "w-56 h-56 rounded-full border-8 border-blue-100 relative",
            isSpinning && "animate-spin"
          )}>
            <div className="absolute inset-4 rounded-full bg-blue-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* Decorative dots */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-blue-600"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 30}deg) translateY(-108px)`,
                }}
              />
            ))}
          </div>
          {/* Arrow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-blue-600" />
          </div>
        </div>

        {/* Event info */}
        <div className="space-y-4">
          {/* Next draw */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-[15px] font-medium text-gray-900">Prochain tirage</span>
            </div>
            <span className="text-[13px] text-gray-500">
              {new Date(wheelEvent.scheduled_at).toLocaleDateString('fr-FR', { 
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Countdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: hours, label: 'Heures' },
              { value: minutes, label: 'Minutes' },
              { value: secs, label: 'Secondes' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <span className="text-[32px] font-semibold text-blue-600">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 mt-2">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-[24px] font-semibold text-gray-900">{wheelEvent.total_pot + 432}</span>
              </div>
              <p className="text-[13px] text-gray-500">Points à gagner</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-[24px] font-semibold text-gray-900">{wheelEvent.participants_count + 432}</span>
              </div>
              <p className="text-[13px] text-gray-500">Participants</p>
            </div>
          </div>

          {/* Winner announcement */}
          {wheelEvent.status === 'termine' && wheelEvent.winner && (
            <div className="bg-green-50 rounded-2xl p-5 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-[17px] text-gray-900">🎉 Gagnant: {wheelEvent.winner.prenom}!</p>
              <p className="text-[15px] text-green-600 mt-1">+{wheelEvent.total_pot} points</p>
            </div>
          )}

          {/* Participate button */}
          {wheelEvent.status === 'en_attente' && (
            hasParticipated ? (
              <div className="bg-green-50 rounded-2xl p-5 text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="font-semibold text-[15px] text-gray-900">Vous participez ! 🎉</p>
                <p className="text-[13px] text-gray-600 mt-1">
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
                className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[15px] font-medium active:scale-95 transition-transform"
                disabled={isParticipating}
              >
                {isParticipating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="font-medium text-[17px] text-gray-900">Historique</h2>
          </div>

          <div className="space-y-1">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-4 active:bg-gray-50 -mx-2 px-2 rounded-2xl transition-colors">
                <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] text-gray-900">{item.winner} a gagné</p>
                  <p className="text-[13px] text-gray-500">{item.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-[15px] text-green-600">+{item.total_pot} pts</p>
                  <p className="text-[13px] text-gray-500">{item.participants_count} participants</p>
                </div>
              </div>
            ))}
          </div>

          {history.length === 0 && (
            <div className="py-16 text-center">
              <History className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-[15px] text-gray-400">Aucun historique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}