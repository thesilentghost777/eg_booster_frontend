import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PinInput } from '@/components/ui/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const [telephone, setTelephone] = useState('');
  const [codePin, setCodePin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!telephone.trim()) {
      toast.error('Entrez votre numéro de téléphone');
      return;
    }
    
    if (codePin.length !== 6) {
      toast.error('Le code PIN doit contenir 6 chiffres');
      return;
    }

    const phoneRegex = /^[0-9]{9,}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(telephone.trim(), codePin);
      
      if (loggedInUser?.is_admin === true || loggedInUser?.is_admin === 1 as any) {
        toast.success('Bienvenue');
        navigate('/admin', { replace: true });
      } else {
        toast.success('Bienvenue');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('incorrect')) {
        toast.error('Identifiants incorrects');
      } else if (error.message.includes('blocked') || error.message.includes('bloqué')) {
        toast.error('Compte bloqué');
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        toast.error('Erreur de connexion');
      } else {
        toast.error('Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            EG Booster
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Connexion à votre compte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Code PIN
            </label>
            <PinInput 
              value={codePin} 
              onChange={setCodePin}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={isLoading || !telephone || codePin.length !== 6}
          >
            {isLoading ? 'Connexion...' : 'Continuer'}
          </Button>
        </form>

        {/* Register link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas de compte ?{' '}
            <Link 
              to="/register" 
              className="text-black dark:text-white font-medium hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}