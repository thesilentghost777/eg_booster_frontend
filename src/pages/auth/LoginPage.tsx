import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PinInput } from '@/components/ui/PinInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Smartphone, Lock, ArrowRight, Sparkles, AlertCircle, Shield } from 'lucide-react';

export default function LoginPage() {
  const [telephone, setTelephone] = useState('');
  const [codePin, setCodePin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DÉBUT LOGIN ===');
    console.log('Téléphone:', telephone);
    
    // Validation des champs
    if (!telephone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }
    
    if (codePin.length !== 6) {
      toast.error('Le code PIN doit contenir 6 chiffres');
      return;
    }

    // Validation du format du téléphone
    const phoneRegex = /^[0-9]{9,}$/;
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      toast.error('Format de numéro de téléphone invalide');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Appel de la fonction login...');
      
      // La fonction login retourne maintenant l'utilisateur
      const loggedInUser = await login(telephone.trim(), codePin);
      
      console.log('=== RÉPONSE LOGIN ===');
      console.log('Utilisateur complet:', JSON.stringify(loggedInUser, null, 2));
      console.log('ID utilisateur:', loggedInUser?.id);
      console.log('Prénom:', loggedInUser?.prenom);
      console.log('is_admin:', loggedInUser?.is_admin);
      console.log('Type de is_admin:', typeof loggedInUser?.is_admin);
      console.log('is_admin === true:', loggedInUser?.is_admin === true);
      console.log('Boolean(is_admin):', Boolean(loggedInUser?.is_admin));
      
      // Redirection selon le rôle de l'utilisateur
      if (loggedInUser?.is_admin === true || loggedInUser?.is_admin === 1 as any) {
        console.log('✅ REDIRECTION ADMIN détectée');
        toast.success('Bienvenue Admin ! 🎯', {
          description: 'Redirection vers le panneau d\'administration...',
        });
        console.log('Navigation vers: /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 REDIRECTION UTILISATEUR détectée');
        toast.success('Bienvenue ! 🚀', {
          description: 'Accédez à tous vos services...',
        });
        console.log('Navigation vers: /dashboard');
        navigate('/dashboard', { replace: true });
      }
      
      console.log('=== FIN LOGIN (SUCCÈS) ===');
    } catch (error: any) {
      console.error('=== ERREUR LOGIN ===');
      console.error('Erreur complète:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Gestion des erreurs spécifiques
      if (error.message.includes('401') || error.message.includes('incorrect')) {
        toast.error('Identifiants incorrects', {
          description: 'Numéro de téléphone ou code PIN invalide',
        });
      } else if (error.message.includes('blocked') || error.message.includes('bloqué')) {
        toast.error('Compte bloqué', {
          description: 'Votre compte a été bloqué. Contactez le support.',
          icon: <Shield className="w-5 h-5" />,
        });
      } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        toast.error('Erreur de connexion', {
          description: 'Vérifiez votre connexion internet et réessayez.',
        });
      } else {
        toast.error('Erreur de connexion', {
          description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
      
      console.log('=== FIN LOGIN (ERREUR) ===');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-4 dark">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl shadow-glow animate-float mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">EG Booster</h1>
          <p className="text-muted-foreground mt-2">Boostez vos réseaux sociaux 🚀</p>
        </div>

        {/* Login form */}
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-8 shadow-elevated border border-border/50">
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="telephone" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Smartphone className="w-4 h-4 text-primary" />
                Numéro de téléphone
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

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Code PIN (6 chiffres)
              </Label>
              <PinInput 
                value={codePin} 
                onChange={setCodePin}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 gradient-primary text-white font-semibold text-lg rounded-xl shadow-glow hover:opacity-90 transition-opacity"
              disabled={isLoading || !telephone || codePin.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Info message */}
        <div className="mt-6 bg-muted/30 border border-border/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Besoin d'aide ?</p>
            <p>Si vous avez oublié votre code PIN, contactez le support via le bouton d'aide.</p>
          </div>
        </div>
      </div>
    </div>
  );
}