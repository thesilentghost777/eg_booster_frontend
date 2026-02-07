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
      <div className="min-h-screen bg-background flex flex-col">
        <div className="safe-area-top" />
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Vues Gratuites</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-safe">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Félicitations ! 🎉</h2>
          <p className="text-muted-foreground text-center text-sm mb-8 max-w-xs">
            Vos 1000 vues gratuites sont en cours de livraison sur votre vidéo TikTok !
          </p>

          <div className="w-full max-w-sm space-y-3 mb-8">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-card border border-border/50">
              <span className="text-sm text-muted-foreground">Référence</span>
              <span className="font-mono text-sm font-semibold text-foreground">{orderReference}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-card border border-border/50">
              <span className="text-sm text-muted-foreground">Commande</span>
              <span className="text-sm font-semibold text-foreground">1000 Vues TikTok</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-card border border-border/50">
              <span className="text-sm text-muted-foreground">Statut</span>
              <span className="text-sm font-medium text-warning">⏳ En cours</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-card border border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4 text-warning animate-pulse" /> Livraison estimée</span>
              <span className="text-sm font-semibold text-foreground">24-48h</span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full h-14 gradient-primary text-white font-semibold rounded-2xl active:scale-[0.97] transition-transform">
              <Sparkles className="w-5 h-5 mr-2" />
              Aller au Dashboard
            </Button>
            <Button onClick={() => navigate(`/orders/${orderReference}`)} variant="outline" className="w-full h-12 border-border text-foreground rounded-2xl active:scale-[0.97] transition-transform">
              Voir ma commande
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Vues Gratuites</h1>
      </div>

      {/* Timer */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-warning animate-pulse" />
          <span className="text-sm text-muted-foreground">Offre expire dans</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          {[formatTime(hours), formatTime(minutes), formatTime(seconds)].map((val, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-2xl font-bold text-foreground">:</span>}
              <div className="bg-card border border-border/50 rounded-xl px-4 py-3 min-w-[60px] text-center shadow-sm">
                <span className="text-2xl font-bold text-foreground font-mono">{val}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-5 pb-safe">
        {/* Gift Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-center mb-6 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/80 text-sm">Cadeau de bienvenue</p>
          <p className="text-4xl font-black text-white mt-1">1000 VUES</p>
          <p className="text-white font-semibold mt-1">100% GRATUITES ! 🎁</p>
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
        </div>

        <form onSubmit={handleClaim} className="space-y-5">
          {/* Link Input */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Réclamez vos vues gratuites</span>
            </div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Lien de votre vidéo TikTok <span className="text-destructive">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://www.tiktok.com/@..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Collez le lien complet de votre vidéo TikTok</p>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Comment ça marche ?</p>
            {[
              'Copiez le lien de votre vidéo TikTok',
              'Collez-le dans le champ ci-dessus',
              'Recevez 1000 vues en 24-48h !',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !videoLink.trim()}
            className="w-full h-14 gradient-primary text-white font-semibold rounded-2xl active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Obtenir mes 1000 vues gratuites
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Offre limitée à 1 fois par utilisateur
          </p>
        </form>
      </div>
    </div>
  );
}
