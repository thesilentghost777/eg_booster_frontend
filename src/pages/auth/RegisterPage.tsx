import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PinInput } from '@/components/ui/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Smartphone, Lock, User, Mail, Users, ArrowRight, Sparkles, Gift, AlertCircle, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [codePin, setCodePin] = useState('');
  const [codePinConfirm, setCodePinConfirm] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDefaultReferral, setLoadingDefaultReferral] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Charger le code de parrainage depuis l'URL ou le code par défaut
  useEffect(() => {
    const urlReferralCode = searchParams.get('ref');
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
    } else {
      loadDefaultReferral();
    }
  }, [searchParams]);

  const loadDefaultReferral = async () => {
    setLoadingDefaultReferral(true);
    try {
      const response: any = await api.getDefaultReferral();
      if (response.data?.code) {
        setReferralCode(response.data.code);
      }
    } catch (error) {
      console.error('Error loading default referral:', error);
    } finally {
      setLoadingDefaultReferral(false);
    }
  };

  const validateForm = () => {
    // Validation du prénom
    if (!prenom.trim()) {
      toast.error('Veuillez entrer votre prénom');
      return false;
    }
    if (prenom.trim().length < 2) {
      toast.error('Le prénom doit contenir au moins 2 caractères');
      return false;
    }
    // Validation du téléphone
    if (!telephone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return false;
    }
    const phoneRegex = /^[0-9]{9,}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      toast.error('Format de numéro de téléphone invalide (9 chiffres minimum)');
      return false;
    }
    // Validation de l'email (si fourni)
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error('Format d\'email invalide');
        return false;
      }
    }
    // Validation du code PIN
    if (codePin.length !== 6) {
      toast.error('Le code PIN doit contenir 6 chiffres');
      return false;
    }
    if (!/^\d{6}$/.test(codePin)) {
      toast.error('Le code PIN doit contenir uniquement des chiffres');
      return false;
    }
    // Vérification de la confirmation du PIN
    if (codePin !== codePinConfirm) {
      toast.error('Les codes PIN ne correspondent pas');
      return false;
    }
    // Validation du code de parrainage (si fourni)
    if (referralCode && referralCode.trim()) {
      if (!/^EGB-[A-Z0-9]{6}$/i.test(referralCode.trim())) {
        toast.error('Format de code de parrainage invalide (EGB-XXXXXX)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await register({
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        code_pin: codePin,
        code_pin_confirmation: codePinConfirm,
        email: email.trim() || undefined,
        referral_code: referralCode.trim() || undefined,
      });
     
      toast.success('1000 vues TikTok gratuites disponibles !', {
        icon: '🎁',
      });
     
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
     
      // Gestion des erreurs spécifiques
      if (error.message.includes('telephone') && error.message.includes('deja')) {
        toast.error('Ce numéro de téléphone est déjà utilisé');
      } else if (error.message.includes('email') && error.message.includes('deja')) {
        toast.error('Cet email est déjà utilisé');
      } else if (error.message.includes('referral') || error.message.includes('parrainage')) {
        toast.error('Code de parrainage invalide');
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        toast.error(error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-4 dark">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl shadow-glow mb-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Rejoignez EG Booster</h1>
        </div>
        {/* Free views banner */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">🎁 1000 vues TikTok GRATUITES</p>
            <p className="text-sm text-muted-foreground">Offertes à l'inscription !</p>
          </div>
        </div>
        {/* Register form */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-6 shadow-elevated border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prenom" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" />
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prenom"
                type="text"
                placeholder="Votre prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Smartphone className="w-4 h-4 text-primary" />
                Numéro de téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="699000001"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-secondary" />
                Email <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Code PIN (6 chiffres) <span className="text-destructive">*</span>
              </Label>
              <PinInput
                value={codePin}
                onChange={setCodePin}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Ce code sera utilisé pour vous connecter
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Confirmer le PIN <span className="text-destructive">*</span>
              </Label>
              <PinInput
                value={codePinConfirm}
                onChange={setCodePinConfirm}
                disabled={isLoading}
              />
              {codePinConfirm.length === 6 && codePin === codePinConfirm && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Les codes PIN correspondent</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-accent" />
                Code de parrainage <span className="text-muted-foreground text-xs">(optionnel)</span>
              </Label>
              <Input
                id="referral"
                type="text"
                placeholder="EGB-XXXXXX"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="h-12 bg-muted/80 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/60"
                disabled={isLoading || loadingDefaultReferral}
              />
              {loadingDefaultReferral && (
                <p className="text-xs text-muted-foreground">Chargement du code par défaut...</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-14 gradient-primary text-white font-semibold text-lg rounded-xl shadow-glow hover:opacity-90 transition-opacity mt-6"
              disabled={isLoading || !prenom || !telephone || codePin.length !== 6 || codePinConfirm.length !== 6}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
        {/* Security info */}
        <div className="mt-6 bg-muted/30 border border-border/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Sécurité de vos données</p>
            <p>Vos informations sont sécurisées et ne seront jamais partagées avec des tiers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}