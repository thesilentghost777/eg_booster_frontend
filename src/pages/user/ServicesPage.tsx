import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Zap } from 'lucide-react';
import { FaTiktok, FaFacebook, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Platform, Service, PlatformInfo } from '@/types/api';

const platforms: PlatformInfo[] = [
  { name: 'tiktok', icon: 'tiktok', label: 'TikTok' },
  { name: 'facebook', icon: 'facebook', label: 'Facebook' },
  { name: 'youtube', icon: 'youtube', label: 'YouTube' },
  { name: 'instagram', icon: 'instagram', label: 'Instagram' },
  { name: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp' },
];

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: FaTiktok,
  facebook: FaFacebook,
  youtube: FaYoutube,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
};

const platformColors: Record<Platform, string> = {
  tiktok: 'from-pink-500 to-red-500',
  facebook: 'from-blue-500 to-blue-600',
  youtube: 'from-red-500 to-red-600',
  instagram: 'from-purple-500 to-pink-500',
  whatsapp: 'from-green-500 to-green-600',
};

export default function ServicesPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('tiktok');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, [selectedPlatform]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await api.getServices(selectedPlatform);
      setServices((response as { data: Service[] }).data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des services');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header - Fixed avec safe area pour encoche */}
      <div className="gradient-dark sticky top-0 z-10 backdrop-blur-xl bg-background/80">
        <div className="safe-top" /> {/* Safe area pour encoche iOS */}
        <div className="px-4 pt-3 pb-4">
          <div className="max-w-lg mx-auto">
            {/* Navigation avec espacement Apple-like */}
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => navigate(-1)} 
                className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-all active:scale-95"
                aria-label="Retour"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.5} />
              </button>
              <h1 className="text-[28px] font-display font-bold text-foreground tracking-tight leading-tight">
                Nos Services
              </h1>
            </div>

            {/* Search - Style iOS */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground pointer-events-none" strokeWidth={2.5} />
              <Input
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 pr-4 bg-white/10 border-0 rounded-[10px] text-[17px] text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-white/15 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">
        {/* Platform filter - Horizontal scroll amélioré */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-4 min-w-max">
              {platforms.map((platform) => {
                const IconComponent = platformIcons[platform.icon];
                const isSelected = selectedPlatform === platform.name;
                return (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(platform.name)}
                    className={cn(
                      "px-4 h-9 rounded-full font-medium text-[15px] whitespace-nowrap transition-all flex items-center gap-2 active:scale-95",
                      isSelected
                        ? "gradient-primary text-white shadow-lg shadow-primary/25"
                        : "bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:border-border active:bg-card"
                    )}
                  >
                    <IconComponent className="w-[18px] h-[18px]" />
                    <span>{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Gradient fade aux extrémités pour indiquer le scroll */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* Services grid - Optimisé pour mobile */}
        <div className="px-4 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-[17px] text-muted-foreground font-medium">Aucun service trouvé</p>
              <p className="text-[15px] text-muted-foreground/60 mt-1">Essayez une autre recherche</p>
            </div>
          ) : (
            <div className="grid gap-3 mt-1">
              {filteredServices.map((service) => {
                const IconComponent = platformIcons[service.platform];
                return (
                  <Link 
                    key={service.id} 
                    to={`/order/${service.id}`}
                    className="bg-card/80 backdrop-blur-sm rounded-[20px] border border-border/50 p-4 hover:border-primary/50 active:scale-[0.98] transition-all group overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Icon avec shadow */}
                      <div className={cn(
                        "w-[52px] h-[52px] rounded-[14px] flex items-center justify-center bg-gradient-to-br shadow-lg flex-shrink-0",
                        platformColors[service.platform]
                      )}>
                        {IconComponent && <IconComponent className="w-[26px] h-[26px] text-white drop-shadow-sm" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-semibold text-[17px] group-hover:text-primary transition-colors text-foreground leading-tight mb-1.5">
                          {service.label}
                        </h3>
                        <p className="text-[15px] text-muted-foreground leading-snug line-clamp-2 mb-3">
                          {service.description}
                        </p>
                        
                        {/* Price et CTA */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[22px] font-bold text-primary leading-none">
                              {service.price_points}
                            </span>
                            <span className="text-[15px] text-muted-foreground font-medium">
                              points
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            className="gradient-primary text-white rounded-full h-8 px-4 text-[15px] font-semibold shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                          >
                            <Zap className="w-[15px] h-[15px] mr-1.5 fill-white" strokeWidth={0} />
                            Commander
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Safe area pour gestes iOS */}
        <div className="h-6 safe-bottom" />
      </div>
    </div>
  );
}