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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!service) return null;

  const totalPrice = service.price_points * quantity;
  const totalQuantity = service.quantity * quantity;
  const hasEnoughPoints = (user?.points_balance || 0) >= totalPrice;
  const PlatformIcon = platformIcons[service.platform];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Commander</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Service Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            {PlatformIcon ? <PlatformIcon className="w-7 h-7 text-gray-900" /> : <FaWhatsapp className="w-7 h-7 text-gray-900" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">{service.label}</h2>
            <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
          </div>
        </div>

        {/* Price & Balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gray-50 rounded-2xl text-center">
            <p className="text-xs text-gray-500 mb-1">Prix unitaire</p>
            <p className="text-lg font-semibold text-gray-900">{service.price_points} <span className="text-sm font-normal text-gray-500">points</span></p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl text-center">
            <p className="text-xs text-gray-500 mb-1">Votre solde</p>
            <p className="text-lg font-semibold text-gray-900">{user?.points_balance?.toLocaleString() || 0} <span className="text-sm font-normal text-gray-500">pts</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Lien de votre publication <span className="text-red-600">*</span></span>
            </div>
            <Input
              type="url"
              placeholder={`https://www.${service.platform}.com/...`}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isLoading}
              className="h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1.5">Collez le lien complet de votre publication {service.platform}</p>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Nombre de packs <span className="text-red-600">*</span></span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900 disabled:opacity-50"
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
                className="h-12 text-center bg-gray-50 border-gray-200 rounded-xl text-gray-900 font-semibold text-lg flex-1 focus:bg-white focus:border-blue-500"
              />
              <Button
                type="button"
                onClick={incrementQuantity}
                disabled={quantity >= 100 || isLoading}
                variant="outline"
                className="h-12 w-12 rounded-xl bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Entre 1 et 100 packs</p>
          </div>

          {/* Insufficient balance */}
          {!hasEnoughPoints && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Solde insuffisant</p>
                <p className="text-xs text-red-700">Il vous manque {(totalPrice - (user?.points_balance || 0)).toLocaleString()} points.</p>
              </div>
              <Button 
                onClick={() => navigate('/wallet')} 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Recharger
              </Button>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            {[
              ['Service', service.label],
              ['Quantité par pack', service.quantity.toLocaleString()],
              ['Nombre de packs', `× ${quantity}`],
              ['Prix unitaire', `${service.price_points} points`],
              ['Total à recevoir', totalQuantity.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total à payer</span>
              <span className="text-lg font-semibold text-blue-600">{totalPrice.toLocaleString()} points</span>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || !hasEnoughPoints || !link.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Confirmer {quantity > 1 ? `${quantity} packs` : 'la commande'}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" /> Paiement sécurisé</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-600" /> Livraison rapide</span>
          </div>
        </form>
      </div>
    </div>
  );
}