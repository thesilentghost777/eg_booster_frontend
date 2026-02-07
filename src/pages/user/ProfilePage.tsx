import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, User, Phone, Mail, Lock, LogOut,
  ChevronRight, Copy, Users, Settings, HelpCircle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { PinInput } from '@/components/ui/PinInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const menuItems = [
  { icon: Users, label: 'Parrainage', to: '/referral', badge: '' },
  { icon: Settings, label: 'Paramètres', to: '/settings' },
  { icon: HelpCircle, label: 'Aide & Support', to: '/support' },
];

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filleulsCount, setFilleulsCount] = useState<number>(0);

  React.useEffect(() => {
    const loadFilleulsCount = async () => {
      try {
        const response = await api.getReferralStats();
        const data = (response as { data?: { total_filleuls?: number } }).data;
        setFilleulsCount(data?.total_filleuls || 0);
      } catch (error) { /* Silent */ }
    };
    loadFilleulsCount();
  }, []);

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success('Code copié !');
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await api.updateProfile({ prenom, email });
      await refreshUser();
      setEditDialogOpen(false);
      toast.success('Profil mis à jour !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (newPin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas');
      return;
    }
    if (newPin.length < 4) {
      toast.error('Le PIN doit contenir 4 chiffres');
      return;
    }
    setIsLoading(true);
    try {
      await api.updatePin(currentPin, newPin, confirmPin);
      setPinDialogOpen(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      toast.success('Code PIN mis à jour !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erreur de déconnexion');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="safe-area-top" />
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Mon Profil</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-safe space-y-6">
        {/* Avatar & Info */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3 shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">{user?.prenom?.[0]}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{user?.prenom}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {user?.telephone}
          </div>
          {user?.email && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          )}
        </div>

        {/* Referral Code */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
          <p className="text-xs text-muted-foreground mb-2">Mon code parrain</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted/80 rounded-xl px-4 py-3 font-mono font-bold text-foreground tracking-wider">
              {user?.referral_code}
            </div>
            <button onClick={copyReferralCode} className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center active:scale-90 transition-transform">
              <Copy className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Modifier le profil</p>
                <p className="text-xs text-muted-foreground">Prénom, email</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-sm mx-5 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">Modifier le profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-sm text-foreground">Prénom</Label>
                <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="mt-2 h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground" />
              </div>
              <div>
                <Label className="text-sm text-foreground">Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground" />
              </div>
              <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full h-12 gradient-primary text-white rounded-xl font-semibold active:scale-[0.97] transition-transform">
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change PIN Dialog */}
        <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Changer le code PIN</p>
                <p className="text-xs text-muted-foreground">Sécurité du compte</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-sm mx-5 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">Changer le code PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-sm text-foreground mb-2 block">Code PIN actuel</Label>
                <PinInput value={currentPin} onChange={setCurrentPin} />
              </div>
              <div>
                <Label className="text-sm text-foreground mb-2 block">Nouveau code PIN</Label>
                <PinInput value={newPin} onChange={setNewPin} />
              </div>
              <div>
                <Label className="text-sm text-foreground mb-2 block">Confirmer le nouveau PIN</Label>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
              <Button onClick={handleUpdatePin} disabled={isLoading} className="w-full h-12 gradient-primary text-white rounded-xl font-semibold active:scale-[0.97] transition-transform">
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Items */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-muted/50 active:bg-muted/70 transition-colors",
                index > 0 && "border-t border-border/50"
              )}
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{item.badge}</span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Admin Access */}
        {user?.is_admin && (
          <Button onClick={() => navigate('/admin')} variant="outline" className="w-full h-12 rounded-xl active:scale-[0.97] transition-transform">
            <Shield className="w-5 h-5 mr-2" />
            Accéder au panel admin
          </Button>
        )}

        {/* Logout */}
        <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl active:scale-[0.97] transition-transform">
          <LogOut className="w-5 h-5 mr-2" />
          Déconnexion
        </Button>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Membre depuis {new Date(user?.inscrit_le).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
