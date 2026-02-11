import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, CheckCircle, Eye, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function FreeViewsPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [videoLink, setVideoLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [timeLeft, setTimeLeft] = useState(44755);

  useEffect(() => {
    if (user?.free_views_claimed) {
      navigate('/dashboard');
      toast.info('Vous avez déjà réclamé vos vues gratuites');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const validateTikTokLink = (link: string): boolean => {
    const tiktokPatterns = [
      /tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /vm\.tiktok\.com\/[\w-]+/,
      /vt\.tiktok\.com\/[\w-]+/,
    ];
    return tiktokPatterns.some(pattern => pattern.test(link));
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoLink.trim()) {
      toast.error('Veuillez entrer le lien de votre vidéo TikTok');
      return;
    }
    if (!validateTikTokLink(videoLink)) {
      toast.error('Veuillez entrer un lien TikTok valide');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.claimFreeViews(videoLink) as {
        success?: boolean;
        data?: { order?: { reference?: string } };
      } | null;
      if (response?.success) {
        const reference = response.data?.order?.reference ?? '';
        setOrderReference(reference);
        setClaimed(true);
        await refreshUser();
        toast.success('🎉 1000 vues gratuites activées !');
      } else {
        toast.error('Une erreur est survenue lors de la réclamation');
      }
    } catch (error: any) {
      console.error('Erreur réclamation:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (claimed) {
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
                <h1 className="text-[22px] font-semibold text-gray-900">Vues Gratuites</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-16 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-[28px] font-semibold text-gray-900 mb-2">Félicitations ! 🎉</h2>
          <p className="text-gray-600 text-center text-[15px] mb-8 max-w-xs">
            Vos 1000 vues gratuites sont en cours de livraison !
          </p>

          <div className="w-full max-w-sm space-y-2 mb-8">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50">
              <span className="text-[14px] text-gray-600">Référence</span>
              <span className="font-mono text-[14px] font-semibold text-gray-900">{orderReference}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50">
              <span className="text-[14px] text-gray-600">Commande</span>
              <span className="text-[14px] font-medium text-gray-900">1000 Vues TikTok</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50">
              <span className="text-[14px] text-gray-600">Statut</span>
              <span className="text-[14px] font-medium text-yellow-600">⏳ En cours</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-gray-50">
              <span className="text-[14px] text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-600 animate-pulse" /> Livraison
              </span>
              <span className="text-[14px] font-medium text-gray-900">24-48h</span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-[15px] active:scale-95 transition-transform"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Aller au Dashboard
            </Button>
            <Button 
              onClick={() => navigate(`/orders/${orderReference}`)} 
              className="w-full h-[48px] bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-full text-[15px] active:scale-95 transition-transform"
            >
              Voir ma commande
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-[22px] font-semibold text-gray-900">Vues Gratuites</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Timer */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
            <span className="text-[14px] text-gray-600">Offre expire dans</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            {[formatTime(hours), formatTime(minutes), formatTime(seconds)].map((val, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[24px] font-semibold text-gray-900">:</span>}
                <div className="bg-gray-50 rounded-2xl px-4 py-3 min-w-[60px] text-center">
                  <span className="text-[24px] font-semibold text-gray-900 font-mono">{val}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Gift Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/90 text-[14px]">Cadeau de bienvenue</p>
          <p className="text-[40px] font-bold text-white mt-1">1000 VUES</p>
          <p className="text-white font-semibold mt-1 text-[15px]">100% GRATUITES ! 🎁</p>
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
        </div>

        <form onSubmit={handleClaim} className="space-y-6">
          {/* Link Input */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-gray-500" />
              <span className="text-[15px] font-medium text-gray-900">Réclamez vos vues</span>
            </div>
            <label className="text-[14px] font-medium text-gray-900 mb-2 block">
              Lien de votre vidéo TikTok <span className="text-red-600">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://www.tiktok.com/@..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 text-[15px]"
            />
            <p className="text-[13px] text-gray-500 mt-2">Collez le lien complet de votre vidéo</p>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <p className="text-[15px] font-medium text-gray-900">Comment ça marche ?</p>
            {[
              'Copiez le lien de votre vidéo TikTok',
              'Collez-le dans le champ ci-dessus',
              'Recevez 1000 vues en 24-48h !',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-semibold text-blue-600">{i + 1}</span>
                </div>
                <span className="text-[15px] text-gray-600">{step}</span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !videoLink.trim()}
            className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-[15px] active:scale-95 transition-transform disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Obtenir mes 1000 vues gratuites
              </>
            )}
          </Button>

          <p className="text-[13px] text-gray-400 text-center">
            Offre limitée à 1 fois par utilisateur
          </p>
        </form>
      </div>
    </div>
  );
}