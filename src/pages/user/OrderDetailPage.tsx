import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Zap, LinkIcon, Package, AlertCircle, CheckCircle, Loader2, Minus, Plus } from 'lucide-react';
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Service } from '@/types/api';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: FaTiktok,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
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
    if (!id) { navigate('/services'); return; }
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
      tiktok: [/tiktok\.com\/@[\w.-]+\/video\/\d+/, /vm\.tiktok\.com\/[\w-]+/, /vt\.tiktok\.com\/[\w-]+/],
      facebook: [/facebook\.com\/[\w.-]+\/posts\/\d+/, /fb\.watch\/[\w-]+/, /facebook\.com\/photo/, /facebook\.com\/[\w.-]+\/videos\/\d+/],
      instagram: [/instagram\.com\/p\/[\w-]+/, /instagram\.com\/reel\/[\w-]+/, /instagram\.com\/tv\/[\w-]+/],
      youtube: [/youtube\.com\/watch\?v=[\w-]+/, /youtu\.be\/[\w-]+/, /youtube\.com\/shorts\/[\w-]+/],
      whatsapp: [/wa\.me\/\d+/, /chat\.whatsapp\.com\/[\w-]+/],
    };
    const platformPatterns = patterns[platform.toLowerCase()] || [];
    return platformPatterns.some(pattern => pattern.test(link));
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= 100) setQuantity(numValue);
  };

  const incrementQuantity = () => { if (quantity < 100) setQuantity(quantity + 1); };
  const decrementQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    if (!link.trim()) { toast.error('Veuillez entrer le lien de votre publication'); return; }
    if (!validateLink(link, service.platform)) { toast.error(`Veuillez entrer un lien ${service.platform} valide`); return; }
    const totalPrice = service.price_points * quantity;
    if ((user?.points_balance || 0) < totalPrice) { toast.error('Solde insuffisant. Rechargez votre compte.'); return; }

    setIsLoading(true);
    try {
      let successCount = 0;
      let failedCount = 0;
      const orderPromises = Array.from({ length: quantity }, () =>
        api.createOrder(service.id, link, 1)
          .then((response: any) => {
            if (response?.success) { successCount++; return { success: true }; }
            throw new Error('Commande échouée');
          })
          .catch((error: any) => { failedCount++; console.error('Erreur sur une commande:', error); return { success: false, error }; })
      );
      await Promise.all(orderPromises);
      await refreshUser();
      if (successCount === quantity) {
        toast.success(`${quantity} commande${quantity > 1 ? 's' : ''} passée${quantity > 1 ? 's' : ''} avec succès !`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} commande${successCount > 1 ? 's' : ''} réussie${successCount > 1 ? 's' : ''}, ${failedCount} échouée${failedCount > 1 ? 's' : ''}`);
      } else {
        toast.error('Toutes les commandes ont échoué');
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur création commandes:', error);
      toast.error(error.message + ' Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingService) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!service) return null;

  const totalPrice = service.price_points * quantity;
  const totalQuantity = service.quantity * quantity;
  const hasEnoughPoints = (user?.points_balance || 0) >= totalPrice;
  const PlatformIcon = platformIcons[service.platform];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Commander</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-safe space-y-5">
        {/* Service Info */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
            {PlatformIcon ? <PlatformIcon className="w-8 h-8 text-foreground" /> : <FaWhatsapp className="w-8 h-8 text-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground">{service.label}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
          </div>
        </div>

        {/* Price & Balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Prix unitaire</p>
            <p className="text-lg font-bold text-foreground">{service.price_points} <span className="text-xs font-normal text-muted-foreground">points</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Votre solde</p>
            <p className="text-lg font-bold text-foreground">{user?.points_balance?.toLocaleString() || 0} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Link */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Informations de commande</h3>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Lien de votre publication <span className="text-destructive">*</span></span>
            </div>
            <Input
              type="url"
              placeholder={`https://www.${service.platform}.com/...`}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Collez le lien complet de votre publication {service.platform}</p>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Nombre de packs <span className="text-destructive">*</span></span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground font-bold text-xl disabled:opacity-50"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isLoading}
                className="h-12 text-center bg-muted/80 border border-border/50 rounded-xl text-foreground font-bold text-lg flex-1"
              />
              <Button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= 100 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground font-bold text-xl disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Vous pouvez commander entre 1 et 100 packs</p>
          </div>

          {/* Insufficient balance */}
          {!hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Solde insuffisant</p>
                <p className="text-xs text-destructive/80">Il vous manque {(totalPrice - (user?.points_balance || 0)).toLocaleString()} points.</p>
              </div>
              <Button onClick={() => navigate('/wallet')} size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Recharger
              </Button>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2 p-4 rounded-2xl bg-card border border-border/50">
            {[
              ['Service', service.label],
              ['Quantité par pack', service.quantity.toLocaleString()],
              ['Nombre de packs', `× ${quantity}`],
              ['Prix unitaire', `${service.price_points} points`],
              ['Total à recevoir', totalQuantity.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-1.5">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-2 mt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Total à payer</span>
              <span className="text-lg font-bold text-primary">{totalPrice.toLocaleString()} points</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !hasEnoughPoints || !link.trim()}
            className="w-full h-14 gradient-primary text-white font-semibold rounded-2xl active:scale-[0.97] transition-transform disabled:opacity-50"
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

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-success" /> Paiement sécurisé</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-success" /> Livraison rapide</span>
          </div>
        </form>
      </div>
    </div>
  );
}
