import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, User, Phone, Mail, Lock, LogOut,
  ChevronRight, Copy, Users, HelpCircle, Shield
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="px-4 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
              <h1 className="text-[22px] font-semibold text-gray-900">Profil</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        
        {/* Avatar & Info */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-3">
            <span className="text-[32px] font-semibold text-white">{user?.prenom?.[0]}</span>
          </div>
          <h2 className="text-[22px] font-semibold text-gray-900">{user?.prenom}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-[15px] text-gray-500">
            <Phone className="w-4 h-4" />
            {user?.telephone}
          </div>
          {user?.email && (
            <div className="flex items-center gap-1.5 mt-1 text-[15px] text-gray-500">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          )}
        </div>

        {/* Referral Code */}
        <div className="p-4 rounded-2xl bg-gray-50">
          <p className="text-[13px] text-gray-500 mb-2">Mon code parrain</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-xl px-4 py-3 font-mono font-bold text-gray-900 tracking-wider text-[17px] border border-gray-100">
              {user?.referral_code}
            </div>
            <button 
              onClick={copyReferralCode} 
              className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Copy className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-100 active:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-medium text-gray-900">Modifier le profil</p>
                <p className="text-[13px] text-gray-500">Prénom, email</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-100 w-[calc(100%-2rem)] sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-semibold text-gray-900">Modifier le profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-[14px] font-medium text-gray-900">Prénom</Label>
                <Input 
                  value={prenom} 
                  onChange={(e) => setPrenom(e.target.value)} 
                  className="mt-2 h-12 bg-gray-50 border-0 rounded-2xl text-gray-900 text-[15px]" 
                />
              </div>
              <div>
                <Label className="text-[14px] font-medium text-gray-900">Email</Label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="mt-2 h-12 bg-gray-50 border-0 rounded-2xl text-gray-900 text-[15px]" 
                />
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isLoading} 
                className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-[15px] active:scale-95 transition-transform"
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change PIN Dialog */}
        <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-100 active:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-medium text-gray-900">Changer le code PIN</p>
                <p className="text-[13px] text-gray-500">Sécurité du compte</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-100 w-[calc(100%-2rem)] sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-semibold text-gray-900">Changer le code PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-[14px] font-medium text-gray-900 mb-2 block">Code PIN actuel</Label>
                <PinInput value={currentPin} onChange={setCurrentPin} />
              </div>
              <div>
                <Label className="text-[14px] font-medium text-gray-900 mb-2 block">Nouveau code PIN</Label>
                <PinInput value={newPin} onChange={setNewPin} />
              </div>
              <div>
                <Label className="text-[14px] font-medium text-gray-900 mb-2 block">Confirmer le nouveau PIN</Label>
                <PinInput value={confirmPin} onChange={setConfirmPin} />
              </div>
              <Button 
                onClick={handleUpdatePin} 
                disabled={isLoading} 
                className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium text-[15px] active:scale-95 transition-transform"
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-100 active:bg-gray-50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-gray-500" />
              <span className="flex-1 text-left text-[15px] font-medium text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {/* Admin Access */}
        {user?.is_admin && (
          <Button 
            onClick={() => navigate('/admin')} 
            className="w-full h-[52px] bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-full active:scale-95 transition-transform text-[15px] font-medium"
          >
            <Shield className="w-5 h-5 mr-2" />
            Panel admin
          </Button>
        )}

        {/* Logout */}
        <Button 
          onClick={handleLogout} 
          className="w-full h-[52px] bg-red-50 hover:bg-red-100 text-red-600 rounded-full active:scale-95 transition-transform text-[15px] font-medium"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Déconnexion
        </Button>

        <p className="text-[13px] text-gray-400 text-center pb-4">
          Membre depuis {new Date(user?.inscrit_le).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
}