import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Zap, AlertCircle, CheckCircle, Loader2, Package } from 'lucide-react';
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Service } from '@/types/api';

const platformIcons: Record<string, React.ReactNode> = {
  tiktok: <FaTiktok className="w-8 h-8" />,
  facebook: <FaFacebook className="w-8 h-8" />,
  youtube: <FaYoutube className="w-8 h-8" />,
  instagram: <FaInstagram className="w-8 h-8" />,
  whatsapp: <FaWhatsapp className="w-8 h-8" />,
};

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(true);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    if (!id) {
      navigate('/services');
      return;
    }

    try {
      setIsLoadingService(true);
      const response = await api.getService(Number(id)) as { success: boolean; data?: Service };

      if (response.success && response.data) {
        setService(response.data);
      } else {
        toast.error('Service introuvable');
        navigate('/services');
      }
    } catch (error: any) {
      console.error('Erreur chargement service:', error);
      toast.error(error.message || 'Erreur de chargement du service');
      navigate('/services');
    } finally {
      setIsLoadingService(false);
    }
  };

  const validateLink = (link: string, platform: string): boolean => {
    const patterns: Record<string, RegExp[]> = {
      tiktok: [
        /tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /vm\.tiktok\.com\/[\w-]+/,
        /vt\.tiktok\.com\/[\w-]+/,
      ],
      facebook: [
        /facebook\.com\/[\w.-]+\/posts\/\d+/,
        /fb\.watch\/[\w-]+/,
        /facebook\.com\/photo/,
        /facebook\.com\/[\w.-]+\/videos\/\d+/,
      ],
      instagram: [
        /instagram\.com\/p\/[\w-]+/,
        /instagram\.com\/reel\/[\w-]+/,
        /instagram\.com\/tv\/[\w-]+/,
      ],
      youtube: [
        /youtube\.com\/watch\?v=[\w-]+/,
        /youtu\.be\/[\w-]+/,
        /youtube\.com\/shorts\/[\w-]+/,
      ],
      whatsapp: [
        /wa\.me\/\d+/,
        /chat\.whatsapp\.com\/[\w-]+/,
      ],
    };

    const platformPatterns = patterns[platform.toLowerCase()] || [];
    return platformPatterns.some(pattern => pattern.test(link));
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= 100) {
      setQuantity(numValue);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 100) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;

    if (!link.trim()) {
      toast.error('Veuillez entrer le lien de votre publication');
      return;
    }

    if (!validateLink(link, service.platform)) {
      toast.error(`Veuillez entrer un lien ${service.platform} valide`);
      return;
    }

    const totalPrice = service.price_points * quantity;
    const hasEnoughPoints = (user?.points_balance || 0) >= totalPrice;
    
    if (!hasEnoughPoints) {
      toast.error('Solde insuffisant. Rechargez votre compte.');
      return;
    }

    setIsLoading(true);
    
    try {
      let successCount = 0;
      let failedCount = 0;

      // Créer n commandes en parallèle
      const orderPromises = Array.from({ length: quantity }, () => 
        api.createOrder(service.id, link, 1)
          .then((response: any) => {
            if (response && response.success) {
              successCount++;
              return { success: true };
            }
            throw new Error('Commande échouée');
          })
          .catch((error) => {
            failedCount++;
            console.error('Erreur sur une commande:', error);
            return { success: false, error };
          })
      );

      await Promise.all(orderPromises);

      // Rafraîchir le solde de l'utilisateur
      await refreshUser();
      
      // Afficher le message de succès/erreur
      if (successCount === quantity) {
        toast.success(`${quantity} commande${quantity > 1 ? 's' : ''} passée${quantity > 1 ? 's' : ''} avec succès !`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} commande${successCount > 1 ? 's' : ''} réussie${successCount > 1 ? 's' : ''}, ${failedCount} échouée${failedCount > 1 ? 's' : ''}`);
      } else {
        toast.error('Toutes les commandes ont échoué');
      }

      // Redirection vers le dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Erreur création commandes:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la création des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingService) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const totalPrice = service.price_points * quantity;
  const totalQuantity = service.quantity * quantity;
  const hasEnoughPoints = (user?.points_balance || 0) >= totalPrice;

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Commander</h1>
          </div>

          {/* Service preview */}
          <div className="bg-card/90 backdrop-blur-xl rounded-2xl p-5 border border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center text-white">
                {platformIcons[service.platform] || <FaWhatsapp className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-foreground">{service.label}</h2>
                <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Prix unitaire</p>
                <p className="text-2xl font-bold text-primary">{service.price_points} <span className="text-sm text-muted-foreground">points</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Votre solde</p>
                <p className={cn("text-lg font-bold", hasEnoughPoints ? "text-success" : "text-destructive")}>
                  {user?.points_balance?.toLocaleString() || 0} pts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24 -mt-2">
        {/* Order form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h3 className="font-semibold text-lg text-foreground">Informations de commande</h3>
          
          <div className="space-y-3">
            <Label htmlFor="link" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <LinkIcon className="w-4 h-4 text-primary" />
              Lien de votre publication <span className="text-primary">*</span>
            </Label>
            <Input
              id="link"
              type="url"
              placeholder={`https://${service.platform}.com/...`}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground">
              Collez le lien complet de votre publication {service.platform}
            </p>
          </div>

          {/* Quantity selector */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Package className="w-4 h-4 text-primary" />
              Nombre de packs <span className="text-primary">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isLoading}
                className="h-12 text-center bg-muted/80 border border-border/50 rounded-xl text-foreground font-bold text-lg"
              />
              <Button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= 100 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Vous pouvez commander entre 1 et 100 packs
            </p>
          </div>

          

          {/* Balance warning */}
          {!hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Solde insuffisant</p>
                <p className="text-xs text-destructive/80">
                  Il vous manque {(totalPrice - (user?.points_balance || 0)).toLocaleString()} points.
                </p>
              </div>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => navigate('/wallet')}
                className="ml-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Recharger
              </Button>
            </div>
          )}

          {/* Summary */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="text-foreground">{service.label}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quantité par pack</span>
              <span className="text-foreground">{service.quantity.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nombre de packs</span>
              <span className="text-foreground font-semibold">× {quantity}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prix unitaire</span>
              <span className="text-foreground">{service.price_points} points</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-foreground">Total à recevoir</span>
              <span className="text-success">{totalQuantity.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span className="text-foreground">Total à payer</span>
              <span className="text-primary text-lg">{totalPrice.toLocaleString()} points</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !hasEnoughPoints || !link.trim()}
            className="w-full h-14 gradient-primary text-white font-bold text-lg rounded-xl shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement de {quantity} commande{quantity > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Confirmer {quantity} pack{quantity > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </form>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Paiement sécurisé</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Livraison rapide</span>
          </div>
        </div>
      </div>
    </div>
  );
}