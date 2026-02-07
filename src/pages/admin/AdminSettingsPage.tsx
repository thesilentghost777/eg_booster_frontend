import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface CategorySettings {
  [category: string]: Setting[];
}

const categoryLabels: Record<string, { title: string; description: string }> = {
  referral: { title: '🤝 Parrainage', description: 'Configuration des bonus de parrainage' },
  wallet: { title: '💰 Portefeuille', description: 'Frais et limites de transactions' },
  gift: { title: '🎁 Cadeaux', description: 'Vues gratuites à l\'inscription' },
  wheel: { title: '🎡 Grande Roue', description: 'Configuration de la loterie' },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CategorySettings>({});
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data: { data?: any[] } = await api.adminGetSettings();
      
      // Organiser les paramètres par catégorie
      const organized: CategorySettings = {
        referral: [],
        wallet: [],
        gift: [],
        wheel: [],
      };

      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((setting: any) => {
          const category = setting.key.split('_')[0]; // Extraire la catégorie du key
          if (organized[category]) {
            organized[category].push({
              key: setting.key,
              value: setting.value,
              label: setting.label || setting.key,
            });
          }
        });
      }

      setSettings(organized);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category: string, key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category].map(s => 
        s.key === key ? { ...s, value } : s
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Flatten all settings into a single array
      const allSettings: { key: string; value: string }[] = [];
      Object.values(settings).forEach(categorySettings => {
        categorySettings.forEach(setting => {
          allSettings.push({ key: setting.key, value: setting.value });
        });
      });

      await api.adminUpdateSettings(allSettings);
      toast.success('Paramètres enregistrés');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de la plateforme</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="gradient-primary text-white" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        )}
      </div>

      {Object.entries(settings).map(([category, categorySettings]) => {
        if (!categorySettings.length) return null;
        
        return (
          <div key={category} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/50">
              <h2 className="font-semibold text-foreground">{categoryLabels[category]?.title || category}</h2>
              <p className="text-sm text-muted-foreground">{categoryLabels[category]?.description}</p>
            </div>

            <div className="p-4 space-y-4">
              {categorySettings.map((setting) => (
                <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <Label className="sm:w-1/2 text-foreground font-medium">{setting.label}</Label>
                  <Input
                    value={setting.value}
                    onChange={(e) => handleChange(category, setting.key, e.target.value)}
                    className="sm:w-1/2 h-10 bg-background text-foreground border-border"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {Object.values(settings).every(cat => cat.length === 0) && (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Aucun paramètre configuré</p>
        </div>
      )}
    </div>
  );
}