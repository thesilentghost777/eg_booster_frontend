import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { ReferralStats, Filleul } from '@/types/api';

const rewards = [
  { filleuls: 5, reward: '1000 points bonus' },
  { filleuls: 10, reward: '2500 points bonus' },
  { filleuls: 25, reward: 'Statut VIP' },
  { filleuls: 50, reward: 'Commission 10%' },
];

export default function ReferralPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [filleuls, setFilleuls] = useState<Filleul[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const referralCode = user?.referral_code || '';
  const shareLink = `https://egbooster.com/register?ref=${referralCode}`;

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, filleulsRes] = await Promise.all([
        api.getReferralStats(),
        api.getFilleuls(),
      ]);
      setStats((statsRes as any).data || null);
      setFilleuls((filleulsRes as any).data || []);
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = filleuls.reduce((sum, f) => sum + (f.points_gagnes || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Programme Parrainage</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-safe space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl gradient-primary text-center shadow-md">
            <Users className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{stats?.total_filleuls || 0}</p>
            <p className="text-xs text-white/70">Filleuls actifs</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-center shadow-md">
            <Gift className="w-5 h-5 text-white mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{totalEarned.toLocaleString()}</p>
            <p className="text-xs text-white/70">Points gagnés</p>
          </div>
        </div>

        {/* Share Code */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Partagez votre code</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Votre code de parrainage</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/80 rounded-xl px-4 py-3 font-mono font-bold text-foreground tracking-wider text-center">
                {referralCode}
              </div>
              <button onClick={() => handleCopy(referralCode)} className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Lien de parrainage</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/80 rounded-xl px-4 py-3 text-xs text-muted-foreground truncate">
                {shareLink}
              </div>
              <button onClick={() => handleCopy(shareLink)} className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0">
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Comment ça marche ?</p>
          {[
            'Partagez votre code avec vos amis',
            "Ils s'inscrivent avec votre code et rechargent leur compte",
            'Vous gagnez 1000 points pour 5 filleuls !',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{i + 1}</span>
              </div>
              <span className="text-sm text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-warning" />
            <span className="font-semibold text-foreground">Récompenses</span>
          </div>
          <div className="space-y-3">
            {rewards.map((reward, index) => {
              const achieved = (stats?.total_filleuls || 0) >= reward.filleuls;
              return (
                <div key={index} className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-colors",
                  achieved ? "bg-success/10 border-success/30" : "bg-muted/50 border-border/50"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{reward.filleuls} filleuls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{reward.reward}</span>
                    {achieved && <CheckCircle className="w-4 h-4 text-success" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Filleuls */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Filleuls récents</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filleuls.length > 0 ? (
            <div className="space-y-2">
              {filleuls.map((filleul, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{filleul.prenom}</p>
                    <p className="text-xs text-muted-foreground">{new Date(filleul.inscrit_le).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">+{filleul.points_gagnes} pts</p>
                    {filleul.a_depose && <p className="text-xs text-success">✓ A déposé</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 rounded-2xl bg-card border border-border/50">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Aucun filleul pour le moment</p>
              <p className="text-xs text-primary mt-1">Partagez votre code !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
