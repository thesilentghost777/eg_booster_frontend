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
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Nos Services</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-card/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-24">
        {/* Platform filter */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide">
          {platforms.map((platform) => {
            const IconComponent = platformIcons[platform.icon];
            return (
              <button
                key={platform.name}
                onClick={() => setSelectedPlatform(platform.name)}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2",
                  selectedPlatform === platform.name
                    ? "gradient-primary text-white shadow-glow"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {platform.label}
              </button>
            );
          })}
        </div>

        {/* Services grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 mt-2">
            {filteredServices.map((service) => {
              const IconComponent = platformIcons[service.platform];
              return (
                <Link 
                  key={service.id} 
                  to={`/order/${service.id}`}
                  className="bg-card rounded-2xl border border-border p-4 hover:border-primary/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      platformColors[service.platform]
                    )}>
                      {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors text-foreground">{service.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary">{service.price_points}</span>
                          <span className="text-sm text-muted-foreground">points</span>
                        </div>
                        <Button size="sm" className="gradient-primary text-white rounded-lg">
                          <Zap className="w-4 h-4 mr-1" />
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

        {!isLoading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun service trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}