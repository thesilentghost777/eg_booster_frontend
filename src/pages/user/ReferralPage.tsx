import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Users, Gift, TrendingUp, CheckCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      
      const statsData = (statsRes as { data: ReferralStats }).data;
      setStats(statsData);
      setFilleuls((filleulsRes as { data: Filleul[] }).data || []);
      
      const referralCode = statsData.code || user?.referral_code || '';
      setShareLink(`https://egbooster.techforgesolution237.site/register?ref=${referralCode}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const referralCode = stats?.code || user?.referral_code || '';
  const totalEarned = stats?.total_points_gagnes || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `Inscris-toi et obtiens tes 1000 vues gratuites ! Utilise mon code ${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins EG Booster !',
          text: shareText,
          url: shareLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy(shareLink);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Programme Parrainage</h1>
          </div>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border/50">
              <div className="w-10 h-10 gradient-secondary rounded-xl flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats?.total_filleuls || 0}</p>
              <p className="text-sm text-muted-foreground">Filleuls actifs</p>
            </div>
            <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border/50">
              <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center mb-3">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{totalEarned.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Points gagnés</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 max-w-lg mx-auto pb-24 -mt-2">
        {/* Share section */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Partagez votre code
          </h3>
         {/* Referral code */}
<div className="mb-4">
  <p className="text-sm text-muted-foreground mb-2">Votre code de parrainage</p>
  <div className="flex gap-2">
    <div className="flex-1 bg-muted rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="font-mono font-bold text-lg text-foreground">{referralCode}</span>
    </div>
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-12 border-border"
      onClick={() => handleCopy(referralCode)}
    >
      {copied ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5 text-foreground" />
      )}
    </Button>
  </div>
</div>

{/* Referral link */}
<div className="mb-4">
  <p className="text-sm text-muted-foreground mb-2">Lien de parrainage</p>
  <div className="flex gap-2">
    <Input
      value={shareLink}
      readOnly
      className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground text-sm"
    />
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-12 border-border flex-shrink-0"
      onClick={() => handleCopy(shareLink)}
    >
      {copied ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <Copy className="w-5 h-5 text-foreground" />
      )}
    </Button>
  </div>
</div>
          
          {/* How it works */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3">Comment ça marche ?</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary text-white text-xs flex items-center justify-center flex-shrink-0">1</div>
                <p>Partagez votre code avec vos amis</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full gradient-secondary text-white text-xs flex items-center justify-center flex-shrink-0">2</div>
                <p>Ils s'inscrivent avec votre code et rechargent leur compte</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full gradient-success text-white text-xs flex items-center justify-center flex-shrink-0">3</div>
                <p>Vous gagnez 1000 points pour 5 filleul !</p>
              </div>
            </div>
          </div>
        </div>
        {/* Rewards progress */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-warning" />
            Récompenses
          </h3>
          <div className="space-y-4">
            {rewards.map((reward, index) => {
              const achieved = (stats?.total_filleuls || 0) >= reward.filleuls;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border",
                    achieved
                      ? "bg-success/10 border-success/30"
                      : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {achieved ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <div>
                      <p className={cn("font-medium text-sm", achieved ? "text-success" : "text-foreground")}>
                        {reward.filleuls} filleuls
                      </p>
                      <p className="text-xs text-muted-foreground">{reward.reward}</p>
                    </div>
                  </div>
                  {achieved && (
                    <span className="text-xs font-medium text-success bg-success/20 px-2 py-1 rounded-lg">
                      Obtenu
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Recent referrals */}
        <div className="bg-card rounded-2xl border border-border overflow-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Filleuls récents</h3>
            <span className="text-sm text-muted-foreground">{filleuls.length} total</span>
          </div>
          <div className="divide-y divide-border">
            {filleuls.slice(0, 10).map((filleul) => (
              <div key={filleul.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{filleul.prenom}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(filleul.inscrit_le).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-success font-semibold">+{filleul.points_gagnes} pts</span>
                  {filleul.a_depose && (
                    <p className="text-xs text-muted-foreground">✓ A déposé</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filleuls.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucun filleul pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Partagez votre code !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}