import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Users, Gift, Crown, CheckCircle, Loader2 } from 'lucide-react';
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
  const shareLink = `https://egbooster.techforgesolution237.site/register?ref=${referralCode}`;

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
              <h1 className="text-[22px] font-semibold text-gray-900">Parrainage</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-5 rounded-2xl bg-blue-600 text-center">
            <Users className="w-5 h-5 text-white mx-auto mb-2" />
            <p className="text-[28px] font-semibold text-white">{stats?.total_filleuls || 0}</p>
            <p className="text-[13px] text-white/80">Filleuls actifs</p>
          </div>
          <div className="p-5 rounded-2xl bg-yellow-500 text-center">
            <Gift className="w-5 h-5 text-white mx-auto mb-2" />
            <p className="text-[28px] font-semibold text-white">{totalEarned.toLocaleString()}</p>
            <p className="text-[13px] text-white/80">Points gagnés</p>
          </div>
        </div>

        {/* Share Code */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-[17px] text-gray-900">Partagez votre code</span>
          </div>

          <div>
            <p className="text-[13px] text-gray-500 mb-2">Code de parrainage</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 font-mono font-bold text-gray-900 tracking-wider text-center text-[17px]">
                {referralCode}
              </div>
              <button 
                onClick={() => handleCopy(referralCode)} 
                className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[13px] text-gray-500 mb-2">Lien de parrainage</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-[13px] text-gray-500 truncate">
                {shareLink}
              </div>
              <button 
                onClick={() => handleCopy(shareLink)} 
                className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <p className="font-medium text-[17px] text-gray-900">Comment ça marche ?</p>
          {[
            'Partagez votre code avec vos amis',
            "Ils s'inscrivent avec votre code et rechargent",
            'Vous gagnez 1000 points pour 5 filleuls !',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-semibold text-blue-600">{i + 1}</span>
              </div>
              <span className="text-[15px] text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-[17px] text-gray-900">Récompenses</span>
          </div>
          <div className="space-y-2">
            {rewards.map((reward, index) => {
              const achieved = (stats?.total_filleuls || 0) >= reward.filleuls;
              return (
                <div key={index} className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-colors",
                  achieved ? "bg-green-50 border border-green-200" : "bg-gray-50"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-semibold text-gray-900">{reward.filleuls} filleuls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-600">{reward.reward}</span>
                    {achieved && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Filleuls */}
        <div className="pt-2">
          <h3 className="font-medium text-[17px] text-gray-900 mb-4">Filleuls récents</h3>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : filleuls.length > 0 ? (
            <div className="space-y-2">
              {filleuls.map((filleul, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[18px]">👤</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900">{filleul.prenom}</p>
                    <p className="text-[13px] text-gray-500">{new Date(filleul.inscrit_le).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold text-green-600">+{filleul.points_gagnes} pts</p>
                    {filleul.a_depose && <p className="text-[13px] text-green-600">✓ A déposé</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 rounded-2xl bg-gray-50">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-[15px] text-gray-400">Aucun filleul</p>
              <p className="text-[13px] text-blue-600 mt-1">Partagez votre code !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}