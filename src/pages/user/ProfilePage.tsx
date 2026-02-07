import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  LogOut, 
  ChevronRight,
  Copy,
  Users,
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PinInput } from '@/components/ui/PinInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
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

  // Load filleuls count
  React.useEffect(() => {
    const loadFilleulsCount = async () => {
      try {
        const response = await api.getReferralStats();
        const data = (response as { data?: { total_filleuls?: number } }).data;
        setFilleulsCount(data?.total_filleuls || 0);
      } catch (error) {
        // Silent fail
      }
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
      toast.success('Profil mis à jour');
      setEditDialogOpen(false);
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (newPin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas');
      return;
    }
    if (newPin.length !== 6) {
      toast.error('Le code PIN doit contenir 6 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      await api.updatePin(currentPin, newPin, confirmPin);
      toast.success('Code PIN mis à jour');
      setPinDialogOpen(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Continue anyway
    }
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Users, label: 'Mes filleuls', to: '/referral', badge: filleulsCount > 0 ? filleulsCount.toString() : undefined },
    { icon: HelpCircle, label: 'Support', to: '/support' },
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <div className="gradient-dark px-4 pt-6 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground">Mon Profil</h1>
          </div>

          {/* Profile card */}
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-3xl font-bold text-white">{user?.prenom?.[0]}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{user?.prenom}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{user?.telephone}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Referral code */}
            <div className="bg-muted/80 rounded-xl p-4 flex items-center justify-between border border-border/30">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Mon code parrain</p>
                <p className="font-mono font-bold text-lg text-foreground">{user?.referral_code}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyReferralCode}>
                <Copy className="w-5 h-5 text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 max-w-lg mx-auto pb-24">
        {/* Edit actions */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">Modifier le profil</p>
                  <p className="text-sm text-muted-foreground">Prénom, email</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">Modifier le profil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Prénom</Label>
                  <Input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="mt-2 h-12 bg-muted/80 border border-border/50 text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-foreground">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 h-12 bg-muted/80 border border-border/50 text-foreground"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  className="w-full h-12 gradient-primary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="border-t border-border">
            <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Changer le code PIN</p>
                    <p className="text-sm text-muted-foreground">Sécurité du compte</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Changer le code PIN</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <Label className="text-center block mb-3 text-sm font-semibold text-foreground">Code PIN actuel</Label>
                    <PinInput value={currentPin} onChange={setCurrentPin} />
                  </div>
                  <div>
                    <Label className="text-center block mb-3 text-sm font-semibold text-foreground">Nouveau code PIN</Label>
                    <PinInput value={newPin} onChange={setNewPin} />
                  </div>
                  <div>
                    <Label className="text-center block mb-3 text-sm font-semibold text-foreground">Confirmer le nouveau PIN</Label>
                    <PinInput value={confirmPin} onChange={setConfirmPin} />
                  </div>
                  <Button
                    onClick={handleUpdatePin}
                    className="w-full h-12 gradient-primary text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                index > 0 && "border-t border-border"
              )}
            >
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Admin access */}
        {user?.is_admin && (
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="w-full h-12 mb-6 border-secondary text-secondary hover:bg-secondary/10"
          >
            <Shield className="w-5 h-5 mr-2" />
            Accéder au panel admin
          </Button>
        )}

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full h-12 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Déconnexion
        </Button>

        {/* Member since */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Membre depuis {new Date(user?.inscrit_le || '').toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}