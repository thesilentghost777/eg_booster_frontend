import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PinInput } from '@/components/ui/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
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
    if (!prenom.trim()) {
      toast.error('Entrez votre prénom');
      return false;
    }
    if (prenom.trim().length < 2) {
      toast.error('Prénom trop court');
      return false;
    }
    if (!telephone.trim()) {
      toast.error('Entrez votre numéro');
      return false;
    }
    const phoneRegex = /^[0-9]{9,}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      toast.error('Numéro invalide');
      return false;
    }
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error('Email invalide');
        return false;
      }
    }
    if (codePin.length !== 6) {
      toast.error('Code PIN incomplet');
      return false;
    }
    if (!/^\d{6}$/.test(codePin)) {
      toast.error('PIN doit être numérique');
      return false;
    }
    if (codePin !== codePinConfirm) {
      toast.error('Les codes ne correspondent pas');
      return false;
    }
    if (referralCode && referralCode.trim()) {
      if (!/^EGB-[A-Z0-9]{6}$/i.test(referralCode.trim())) {
        toast.error('Code de parrainage invalide');
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
     
      toast.success('Compte créé');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message.includes('telephone') && error.message.includes('deja')) {
        toast.error('Numéro déjà utilisé');
      } else if (error.message.includes('email') && error.message.includes('deja')) {
        toast.error('Email déjà utilisé');
      } else if (error.message.includes('referral') || error.message.includes('parrainage')) {
        toast.error('Code de parrainage invalide');
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        toast.error('Erreur de connexion');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPinMatch = codePinConfirm.length === 6 && codePin === codePinConfirm;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            EG Booster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Créer un compte
          </p>
        </div>

        {/* Bonus banner */}
        <div className="bg-black dark:bg-white text-white dark:text-black rounded-lg p-4 mb-8 text-center">
          <p className="font-semibold">1000 vues TikTok offertes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              htmlFor="prenom" 
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Prénom
            </label>
            <Input
              id="prenom"
              type="text"
              placeholder="Votre prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full h-12 px-4 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
              disabled={isLoading}
              autoComplete="given-name"
            />
          </div>

          <div>
            <label 
              htmlFor="telephone" 
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Téléphone
            </label>
            <Input
              id="telephone"
              type="tel"
              placeholder="699000001"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full h-12 px-4 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Email <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Code PIN
            </label>
            <PinInput
              value={codePin}
              onChange={setCodePin}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Confirmer le PIN
            </label>
            <PinInput
              value={codePinConfirm}
              onChange={setCodePinConfirm}
              disabled={isLoading}
            />
            {isPinMatch && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm mt-2">
                <Check className="w-4 h-4" />
                <span>Codes identiques</span>
              </div>
            )}
          </div>

          <div>
            <label 
              htmlFor="referral" 
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Code parrainage <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <Input
              id="referral"
              type="text"
              placeholder="EGB-XXXXXX"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="w-full h-12 px-4 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
              disabled={isLoading || loadingDefaultReferral}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            disabled={isLoading || !prenom || !telephone || codePin.length !== 6 || codePinConfirm.length !== 6}
          >
            {isLoading ? 'Création...' : 'Créer mon compte'}
          </Button>
        </form>

        {/* Login link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="text-black dark:text-white font-medium hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}