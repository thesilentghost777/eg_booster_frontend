import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Star, CheckCircle, Eye, Sparkles, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  
  // Timer: 12h 25min 55s = 44755 seconds
  const [timeLeft, setTimeLeft] = useState(44755);
  
  useEffect(() => {
    // Check if user already claimed
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
    // Validate TikTok link format
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
          await refreshUser(); // Refresh user to update free_views_claimed status
          toast.success('🎉 1000 vues gratuites activées !');
        } else {
          // If API returns an unexpected shape or indicates failure, surface a generic error
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
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 gradient-success rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Félicitations ! 🎉
          </h1>
          <p className="text-muted-foreground mb-8">
            Vos 1000 vues gratuites sont en cours de livraison sur votre vidéo TikTok !
          </p>
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Référence</span>
              <span className="text-foreground font-mono font-medium">{orderReference}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Commande</span>
              <span className="text-foreground font-medium">1000 Vues TikTok</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Statut</span>
              <span className="text-success font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                En cours
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Livraison estimée</span>
              <span className="text-foreground font-medium">24-48h</span>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-14 gradient-primary text-white font-semibold rounded-xl mb-3"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Aller au Dashboard
          </Button>
          <Button
            onClick={() => navigate(`/orders/${orderReference}`)}
            variant="outline"
            className="w-full h-12 border-border text-foreground rounded-xl"
          >
            Voir ma commande
          </Button>
        </div>
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
            <h1 className="text-xl font-display font-bold text-foreground">Vues Gratuites</h1>
          </div>

          {/* Timer */}
          <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-4 border border-border/50 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning animate-pulse" />
              <span className="text-sm text-warning font-medium">Offre expire dans</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold text-foreground">
              <span>{formatTime(hours)}</span>
              <span className="text-primary">:</span>
              <span>{formatTime(minutes)}</span>
              <span className="text-primary">:</span>
              <span className="text-secondary">{formatTime(seconds)}</span>
            </div>
          </div>

          {/* Gift card */}
          <div className="gradient-accent rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-warning fill-warning" />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Cadeau de bienvenue</p>
                <p className="text-white text-3xl font-display font-bold">1000 VUES</p>
                <p className="text-white font-semibold">100% GRATUITES ! 🎁</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24 -mt-2">
        {/* Claim form */}
        <form onSubmit={handleClaim} className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Réclamez vos vues gratuites
          </h3>

          <div className="space-y-3">
            <Label htmlFor="videoLink" className="text-sm font-semibold text-foreground">
              Lien de votre vidéo TikTok <span className="text-primary">*</span>
            </Label>
            <Input
              id="videoLink"
              type="url"
              placeholder="https://tiktok.com/@username/video/..."
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground">
              Collez le lien complet de votre vidéo TikTok
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Comment ça marche ?</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full gradient-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <p>Copiez le lien de votre vidéo TikTok</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full gradient-secondary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <p>Collez-le dans le champ ci-dessus</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full gradient-success text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <p>Recevez 1000 vues en 24-48h !</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !videoLink.trim()}
            className="w-full h-14 gradient-primary text-white font-bold text-lg rounded-xl shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
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

          <p className="text-xs text-center text-muted-foreground">
            Offre limitée à 1 fois par utilisateur
          </p>
        </form>
      </div>
    </div>
  );
}