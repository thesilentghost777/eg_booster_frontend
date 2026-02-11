import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
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
      toast.error('Erreur de chargement');
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="px-4 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h1 className="text-[22px] font-semibold text-gray-900">
                Services
              </h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <Input
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[44px] pl-10 bg-gray-50 border-0 rounded-full text-gray-900 placeholder:text-gray-400 text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* Platform filter */}
        <div className="overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
          <div className="flex gap-2 px-4 py-3">
            {platforms.map((platform) => {
              const IconComponent = platformIcons[platform.icon];
              const isSelected = selectedPlatform === platform.name;
              return (
                <button
                  key={platform.name}
                  onClick={() => setSelectedPlatform(platform.name)}
                  className={cn(
                    "px-4 h-9 rounded-full font-medium text-[14px] whitespace-nowrap transition-all flex items-center gap-2",
                    isSelected
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-600 active:bg-gray-100"
                  )}
                >
                  <IconComponent className="w-[15px] h-[15px]" />
                  {platform.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services list */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-[15px] text-gray-400 mb-2">Aucun service trouvé</div>
              <div className="text-[13px] text-gray-400">Essayez une autre recherche</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredServices.map((service) => {
                const IconComponent = platformIcons[service.platform];
                return (
                  <Link 
                    key={service.id} 
                    to={`/order/${service.id}`}
                    className="bg-white border border-gray-100 rounded-2xl p-4 active:bg-gray-50 transition-colors block"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {IconComponent && <IconComponent className="w-5 h-5 text-gray-700" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[15px] text-gray-900 mb-1">
                          {service.label}
                        </h3>
                        <p className="text-[13px] text-gray-500 line-clamp-2 mb-3">
                          {service.description}
                        </p>
                        
                        {/* Price and button */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[17px] font-semibold text-gray-900">
                            {service.price_points}
                            <span className="text-[13px] text-gray-500 font-normal ml-1">
                              pts
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8 px-5 text-[14px] font-medium"
                          >
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
      </div>
    </div>
  );
}