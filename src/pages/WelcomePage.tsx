import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Gift, 
  Star, 
  Eye, 
  Clock, 
  ChevronRight,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  
  // Timer starting at 12h 25min 55s = 44755 seconds
  const [timeLeft, setTimeLeft] = useState(44755);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const features = [
    { icon: Eye, text: 'Vues TikTok, YouTube, Instagram' },
    { icon: Users, text: 'Followers & Abonnés' },
    { icon: TrendingUp, text: 'Likes & Commentaires' },
  ];

  return (
    <div className="min-h-screen bg-background dark overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-3xl shadow-glow animate-float mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            EG <span className="text-primary">Booster</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Boostez vos réseaux sociaux 🚀
          </p>
        </div>

        {/* Timer Card */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-elevated">
            {/* Urgency header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-warning animate-pulse" />
              <p className="text-warning font-semibold">Offre limitée !</p>
            </div>

            {/* Timer display */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-muted/80 rounded-2xl px-4 py-3 text-center min-w-[70px]">
                <p className="text-3xl font-display font-bold text-foreground">{formatTime(hours)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Heures</p>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="bg-muted/80 rounded-2xl px-4 py-3 text-center min-w-[70px]">
                <p className="text-3xl font-display font-bold text-foreground">{formatTime(minutes)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Min</p>
              </div>
              <span className="text-2xl font-bold text-primary">:</span>
              <div className="bg-muted/80 rounded-2xl px-4 py-3 text-center min-w-[70px]">
                <p className="text-3xl font-display font-bold text-secondary">{formatTime(seconds)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sec</p>
              </div>
            </div>

            {/* Free views offer */}
            <div className="gradient-accent rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Gift className="w-9 h-9 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Inscrivez-vous maintenant</p>
                  <p className="text-white text-2xl font-display font-bold">1000 VUES</p>
                  <p className="text-white font-semibold">100% GRATUITES ! 🎁</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => navigate('/register')}
              className="w-full h-16 gradient-primary text-white font-bold text-lg rounded-2xl shadow-glow hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Gift className="w-6 h-6 mr-3" />
              Obtenir mes 1000 vues
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-md space-y-3 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/30"
            >
              <div className="w-10 h-10 gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-foreground font-medium">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Already have account */}
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Déjà inscrit ?</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="text-primary font-semibold hover:text-primary/80"
          >
            <Zap className="w-4 h-4 mr-2" />
            Se connecter
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center gap-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>+10K utilisateurs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>Livraison rapide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
